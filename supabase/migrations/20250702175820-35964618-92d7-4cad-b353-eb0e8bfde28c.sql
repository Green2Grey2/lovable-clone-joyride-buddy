-- Fix search_path security warnings for all functions
-- Update functions to use immutable search_path for security

CREATE OR REPLACE FUNCTION public.publish_media(media_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  UPDATE public.editorial_media 
  SET 
    is_published = true,
    published_at = NOW()
  WHERE id = media_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name'),
    NEW.email
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  INSERT INTO public.user_stats (user_id)
  VALUES (NEW.id);
  
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_user_session(_user_id uuid, _session_id text, _page_path text, _user_agent text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.user_sessions (user_id, session_id, page_path, user_agent, last_seen)
  VALUES (_user_id, _session_id, _page_path, _user_agent, now())
  ON CONFLICT (user_id, session_id) 
  DO UPDATE SET
    last_seen = now(),
    page_path = _page_path,
    user_agent = _user_agent,
    is_active = true;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_media_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_streak_achievements()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  -- Check various streak milestones
  IF NEW.current_streak >= 7 AND OLD.current_streak < 7 THEN
    PERFORM public.check_and_award_achievement(NEW.user_id, 'Week Warrior');
  END IF;
  
  IF NEW.current_streak >= 14 AND OLD.current_streak < 14 THEN
    PERFORM public.check_and_award_achievement(NEW.user_id, 'Fortnight Fighter');
  END IF;
  
  IF NEW.current_streak >= 30 AND OLD.current_streak < 30 THEN
    PERFORM public.check_and_award_achievement(NEW.user_id, 'Monthly Master');
  END IF;
  
  IF NEW.current_streak >= 60 AND OLD.current_streak < 60 THEN
    PERFORM public.check_and_award_achievement(NEW.user_id, 'Consistency King');
  END IF;
  
  IF NEW.current_streak >= 100 AND OLD.current_streak < 100 THEN
    PERFORM public.check_and_award_achievement(NEW.user_id, 'Century Club');
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_step_achievements()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  -- Check step milestones
  IF NEW.today_steps >= 10000 AND OLD.today_steps < 10000 THEN
    PERFORM public.check_and_award_achievement(NEW.user_id, 'Step Champion');
  END IF;
  
  IF NEW.today_steps >= 20000 AND OLD.today_steps < 20000 THEN
    PERFORM public.check_and_award_achievement(NEW.user_id, 'Marathon Walker');
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_and_award_achievement(p_user_id uuid, p_achievement_name text, p_data jsonb DEFAULT NULL::jsonb)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  v_achievement_id UUID;
  v_already_earned BOOLEAN;
BEGIN
  -- Get achievement ID
  SELECT id INTO v_achievement_id
  FROM public.achievements
  WHERE name = p_achievement_name
  AND is_active = true;
  
  IF v_achievement_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check if already earned
  SELECT EXISTS(
    SELECT 1 FROM public.user_achievements
    WHERE user_id = p_user_id
    AND achievement_id = v_achievement_id
  ) INTO v_already_earned;
  
  IF v_already_earned THEN
    RETURN false;
  END IF;
  
  -- Award achievement
  INSERT INTO public.user_achievements (user_id, achievement_id, data)
  VALUES (p_user_id, v_achievement_id, p_data);
  
  RETURN true;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_achievement_summary(p_user_id uuid)
 RETURNS TABLE(total_achievements integer, total_points integer, latest_achievement_name text, latest_achievement_date timestamp with time zone, achievements_by_category jsonb)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(ua.id)::INTEGER as total_achievements,
    COALESCE(SUM(a.points), 0)::INTEGER as total_points,
    (SELECT a2.name FROM public.user_achievements ua2 
     JOIN public.achievements a2 ON ua2.achievement_id = a2.id 
     WHERE ua2.user_id = p_user_id 
     ORDER BY ua2.earned_at DESC LIMIT 1) as latest_achievement_name,
    (SELECT ua2.earned_at FROM public.user_achievements ua2 
     WHERE ua2.user_id = p_user_id 
     ORDER BY ua2.earned_at DESC LIMIT 1) as latest_achievement_date,
    jsonb_object_agg(
      a.category, 
      COUNT(ua.id)
    ) FILTER (WHERE a.category IS NOT NULL) as achievements_by_category
  FROM public.user_achievements ua
  LEFT JOIN public.achievements a ON ua.achievement_id = a.id
  WHERE ua.user_id = p_user_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.log_social_activity()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  -- Log new user achievements
  IF TG_TABLE_NAME = 'user_achievements' AND TG_OP = 'INSERT' THEN
    INSERT INTO public.social_activities (user_id, type, title, description, data)
    SELECT 
      NEW.user_id,
      'achievement',
      'New Achievement Unlocked! 🏆',
      'Earned the "' || a.name || '" achievement',
      jsonb_build_object(
        'achievement_id', NEW.achievement_id,
        'achievement_name', a.name,
        'points', a.points,
        'earned_at', NEW.earned_at
      )
    FROM public.achievements a
    WHERE a.id = NEW.achievement_id;
    
    RETURN NEW;
  END IF;

  -- Log streak milestones
  IF TG_TABLE_NAME = 'user_stats' AND TG_OP = 'UPDATE' THEN
    -- Check for streak milestones
    IF NEW.current_streak IN (7, 14, 30, 60, 100) AND (OLD.current_streak IS NULL OR NEW.current_streak > OLD.current_streak) THEN
      INSERT INTO public.social_activities (user_id, type, title, description, data)
      VALUES (
        NEW.user_id,
        'streak_achievement',
        NEW.current_streak || '-Day Streak! 🔥',
        'Maintained consistency for ' || NEW.current_streak || ' days straight',
        jsonb_build_object('streak_days', NEW.current_streak, 'milestone_reached', NEW.current_streak)
      );
    END IF;

    -- Check for step milestones
    IF NEW.today_steps > 10000 AND (OLD.today_steps IS NULL OR OLD.today_steps <= 10000) THEN
      INSERT INTO public.social_activities (user_id, type, title, description, data)
      VALUES (
        NEW.user_id,
        'step_milestone',
        'Crushed 10K Steps! 👟',
        'Hit the daily 10,000 step goal',
        jsonb_build_object('steps', NEW.today_steps, 'milestone', 10000)
      );
    END IF;

    RETURN NEW;
  END IF;

  -- Log collaborative goal completions
  IF TG_TABLE_NAME = 'goal_progress' AND TG_OP = 'INSERT' THEN
    INSERT INTO public.social_activities (user_id, type, title, description, data)
    VALUES (
      NEW.user_id,
      'goal_completion',
      'Goal Progress Updated! 📈',
      'Made progress on a collaborative goal',
      jsonb_build_object('goal_id', NEW.goal_id, 'progress', NEW.progress_value, 'updated_at', NEW.created_at)
    );
    
    RETURN NEW;
  END IF;

  RETURN NULL;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_activity_patterns(p_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  consistency_score INTEGER;
  intensity_score INTEGER;
  volume_score INTEGER;
  week_start DATE;
  week_end DATE;
BEGIN
  week_start := DATE_TRUNC('week', CURRENT_DATE)::DATE;
  week_end := week_start + INTERVAL '6 days';

  -- Calculate consistency score (0-100 based on days active)
  SELECT (COUNT(DISTINCT date) * 100 / 7)::INTEGER INTO consistency_score
  FROM public.activities
  WHERE user_id = p_user_id 
    AND date >= week_start 
    AND date <= week_end;

  -- Calculate intensity score (based on average heart rate if available)
  SELECT COALESCE(AVG(heart_rate_avg) * 100 / 180, 50)::INTEGER INTO intensity_score
  FROM public.activities
  WHERE user_id = p_user_id 
    AND date >= week_start 
    AND date <= week_end
    AND heart_rate_avg IS NOT NULL;

  -- Calculate volume score (based on total duration compared to goal)
  WITH user_goal AS (
    SELECT COALESCE(weekly_goal_duration, 300) as goal
    FROM public.user_stats
    WHERE user_id = p_user_id
  ),
  weekly_total AS (
    SELECT COALESCE(SUM(duration), 0) as total
    FROM public.activities
    WHERE user_id = p_user_id 
      AND date >= week_start 
      AND date <= week_end
  )
  SELECT LEAST(100, (weekly_total.total * 100 / user_goal.goal))::INTEGER INTO volume_score
  FROM user_goal, weekly_total;

  -- Insert or update patterns
  INSERT INTO public.activity_patterns (user_id, pattern_type, score, trend, period_start, period_end)
  VALUES 
    (p_user_id, 'consistency', consistency_score, 'stable', week_start, week_end),
    (p_user_id, 'intensity', intensity_score, 'stable', week_start, week_end),
    (p_user_id, 'volume', volume_score, 'stable', week_start, week_end)
  ON CONFLICT (user_id, pattern_type, period_start) 
  DO UPDATE SET 
    score = EXCLUDED.score,
    calculated_at = NOW();
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_social_feed(p_user_id uuid DEFAULT NULL::uuid, p_limit integer DEFAULT 20, p_offset integer DEFAULT 0)
 RETURNS TABLE(id uuid, user_id uuid, type text, title text, description text, data jsonb, created_at timestamp with time zone, user_name text, user_department text, like_count bigint, liked_by_me boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    sa.id,
    sa.user_id,
    sa.type,
    sa.title,
    sa.description,
    sa.data,
    sa.created_at,
    COALESCE(p.name, 'Unknown User') as user_name,
    COALESCE(p.department, 'Unknown') as user_department,
    COALESCE(like_counts.like_count, 0) as like_count,
    CASE 
      WHEN p_user_id IS NOT NULL AND user_likes.user_id IS NOT NULL THEN true 
      ELSE false 
    END as liked_by_me
  FROM public.social_activities sa
  LEFT JOIN public.profiles p ON sa.user_id = p.user_id
  LEFT JOIN (
    SELECT activity_id, COUNT(*) as like_count
    FROM public.activity_likes
    GROUP BY activity_id
  ) like_counts ON sa.id = like_counts.activity_id
  LEFT JOIN public.activity_likes user_likes ON sa.id = user_likes.activity_id AND user_likes.user_id = p_user_id
  ORDER BY sa.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$function$;

CREATE OR REPLACE FUNCTION public.calculate_user_percentile(p_user_id uuid, p_metric character varying, p_timeframe character varying DEFAULT 'week'::character varying)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  user_value NUMERIC;
  total_users INTEGER;
  users_below INTEGER;
  start_date DATE;
BEGIN
  -- Calculate start date based on timeframe
  start_date := CASE p_timeframe
    WHEN 'day' THEN CURRENT_DATE
    WHEN 'week' THEN CURRENT_DATE - INTERVAL '7 days'
    WHEN 'month' THEN CURRENT_DATE - INTERVAL '30 days'
    ELSE CURRENT_DATE - INTERVAL '7 days'
  END;

  -- Get user's metric value
  SELECT 
    CASE p_metric
      WHEN 'steps' THEN COALESCE(SUM(steps), 0)
      WHEN 'calories' THEN COALESCE(SUM(calories_burned), 0)
      WHEN 'duration' THEN COALESCE(SUM(duration), 0)
      ELSE 0
    END INTO user_value
  FROM public.activities
  WHERE user_id = p_user_id
    AND date >= start_date;

  -- Count total active users
  SELECT COUNT(DISTINCT user_id) INTO total_users
  FROM public.activities
  WHERE date >= start_date;

  -- Avoid division by zero
  IF total_users = 0 THEN
    RETURN 50;
  END IF;

  -- Count users below this user's value
  WITH user_totals AS (
    SELECT 
      user_id,
      CASE p_metric
        WHEN 'steps' THEN COALESCE(SUM(steps), 0)
        WHEN 'calories' THEN COALESCE(SUM(calories_burned), 0)
        WHEN 'duration' THEN COALESCE(SUM(duration), 0)
        ELSE 0
      END as total_value
    FROM public.activities
    WHERE date >= start_date
    GROUP BY user_id
  )
  SELECT COUNT(*) INTO users_below
  FROM user_totals
  WHERE total_value < user_value;

  RETURN ROUND((users_below::NUMERIC / total_users) * 100)::INTEGER;
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_workout_insights(p_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  avg_steps INTEGER;
  recent_streak INTEGER;
  last_week_activities INTEGER;
BEGIN
  -- Clear expired insights
  DELETE FROM public.workout_insights 
  WHERE user_id = p_user_id 
    AND expires_at IS NOT NULL 
    AND expires_at < NOW();

  -- Calculate recent metrics
  SELECT COALESCE(AVG(steps), 0)::INTEGER INTO avg_steps
  FROM public.activities
  WHERE user_id = p_user_id AND date >= CURRENT_DATE - INTERVAL '7 days';

  SELECT COALESCE(current_streak, 0) INTO recent_streak
  FROM public.user_stats
  WHERE user_id = p_user_id;

  SELECT COUNT(*) INTO last_week_activities
  FROM public.activities
  WHERE user_id = p_user_id AND date >= CURRENT_DATE - INTERVAL '7 days';

  -- Generate step-based insights
  IF avg_steps > 0 AND avg_steps < 8000 THEN
    INSERT INTO public.workout_insights (user_id, insight_type, title, description, priority, actionable, expires_at)
    VALUES (
      p_user_id,
      'suggestion',
      'Step Count Opportunity',
      'Adding a 15-minute walk after lunch could boost your daily steps by 2,000.',
      3,
      true,
      NOW() + INTERVAL '7 days'
    )
    ON CONFLICT DO NOTHING;
  END IF;

  -- Generate streak-based insights
  IF recent_streak >= 7 THEN
    INSERT INTO public.workout_insights (user_id, insight_type, title, description, priority, expires_at)
    VALUES (
      p_user_id,
      'achievement',
      recent_streak || '-Day Streak! 🔥',
      'Amazing consistency! You''re building a strong habit. Keep it up!',
      2,
      NOW() + INTERVAL '3 days'
    )
    ON CONFLICT DO NOTHING;
  END IF;

  -- Generate activity frequency insights
  IF last_week_activities = 0 THEN
    INSERT INTO public.workout_insights (user_id, insight_type, title, description, priority, actionable, expires_at)
    VALUES (
      p_user_id,
      'warning',
      'Time to Get Moving!',
      'You haven''t logged any activities this week. Start with a 10-minute walk today.',
      1,
      true,
      NOW() + INTERVAL '3 days'
    )
    ON CONFLICT DO NOTHING;
  END IF;
END;
$function$;