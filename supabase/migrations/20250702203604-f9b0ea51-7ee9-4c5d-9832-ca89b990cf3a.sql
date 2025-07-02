-- Enhanced calculate_user_percentile function with support for more metrics
CREATE OR REPLACE FUNCTION public.calculate_user_percentile(p_user_id uuid, p_metric character varying, p_timeframe character varying DEFAULT 'week'::character varying)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
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

  -- Get user's metric value based on metric type
  CASE p_metric
    WHEN 'steps', 'calories', 'duration' THEN
      -- Original metrics from activities table
      SELECT 
        CASE p_metric
          WHEN 'steps' THEN COALESCE(SUM(steps), 0)
          WHEN 'calories' THEN COALESCE(SUM(calories_burned), 0)
          WHEN 'duration' THEN COALESCE(SUM(duration), 0)
        END INTO user_value
      FROM public.activities
      WHERE user_id = p_user_id AND date >= start_date;
      
    WHEN 'consistency' THEN
      -- Consistency based on activity frequency
      SELECT (COUNT(DISTINCT date) * 100.0 / EXTRACT(days FROM (CURRENT_DATE - start_date + 1)))::NUMERIC
      INTO user_value
      FROM public.activities
      WHERE user_id = p_user_id AND date >= start_date;
      
    WHEN 'intensity' THEN
      -- Intensity based on average heart rate
      SELECT COALESCE(AVG(heart_rate_avg), 0)::NUMERIC
      INTO user_value
      FROM public.activities
      WHERE user_id = p_user_id AND date >= start_date AND heart_rate_avg IS NOT NULL;
      
    WHEN 'volume' THEN
      -- Volume based on total workout time
      SELECT COALESCE(SUM(duration), 0)::NUMERIC
      INTO user_value
      FROM public.activities
      WHERE user_id = p_user_id AND date >= start_date;
      
    WHEN 'recovery' THEN
      -- Recovery based on rest day patterns
      WITH daily_activities AS (
        SELECT date, COUNT(*) as activity_count
        FROM public.activities
        WHERE user_id = p_user_id AND date >= start_date
        GROUP BY date
      ),
      rest_days AS (
        SELECT COUNT(*) as rest_day_count
        FROM generate_series(start_date, CURRENT_DATE, '1 day'::interval) AS day_series(date)
        LEFT JOIN daily_activities ON day_series.date = daily_activities.date
        WHERE daily_activities.date IS NULL
      )
      SELECT (rest_day_count * 100.0 / EXTRACT(days FROM (CURRENT_DATE - start_date + 1)))::NUMERIC
      INTO user_value
      FROM rest_days;
      
    ELSE
      user_value := 0;
  END CASE;

  -- Count total active users for this metric
  CASE p_metric
    WHEN 'steps', 'calories', 'duration', 'volume' THEN
      SELECT COUNT(DISTINCT user_id) INTO total_users
      FROM public.activities
      WHERE date >= start_date;
      
    WHEN 'consistency', 'intensity', 'recovery' THEN
      SELECT COUNT(DISTINCT user_id) INTO total_users
      FROM public.activities
      WHERE date >= start_date;
      
    ELSE
      total_users := 1;
  END CASE;

  -- Avoid division by zero
  IF total_users = 0 THEN
    RETURN 50;
  END IF;

  -- Count users below this user's value
  CASE p_metric
    WHEN 'steps', 'calories', 'duration' THEN
      WITH user_totals AS (
        SELECT 
          user_id,
          CASE p_metric
            WHEN 'steps' THEN COALESCE(SUM(steps), 0)
            WHEN 'calories' THEN COALESCE(SUM(calories_burned), 0)
            WHEN 'duration' THEN COALESCE(SUM(duration), 0)
          END as total_value
        FROM public.activities
        WHERE date >= start_date
        GROUP BY user_id
      )
      SELECT COUNT(*) INTO users_below
      FROM user_totals
      WHERE total_value < user_value;
      
    WHEN 'consistency' THEN
      WITH user_consistency AS (
        SELECT 
          user_id,
          (COUNT(DISTINCT date) * 100.0 / EXTRACT(days FROM (CURRENT_DATE - start_date + 1)))::NUMERIC as consistency_score
        FROM public.activities
        WHERE date >= start_date
        GROUP BY user_id
      )
      SELECT COUNT(*) INTO users_below
      FROM user_consistency
      WHERE consistency_score < user_value;
      
    WHEN 'intensity' THEN
      WITH user_intensity AS (
        SELECT 
          user_id,
          COALESCE(AVG(heart_rate_avg), 0)::NUMERIC as avg_intensity
        FROM public.activities
        WHERE date >= start_date AND heart_rate_avg IS NOT NULL
        GROUP BY user_id
      )
      SELECT COUNT(*) INTO users_below
      FROM user_intensity
      WHERE avg_intensity < user_value;
      
    WHEN 'volume' THEN
      WITH user_volumes AS (
        SELECT 
          user_id,
          COALESCE(SUM(duration), 0)::NUMERIC as total_volume
        FROM public.activities
        WHERE date >= start_date
        GROUP BY user_id
      )
      SELECT COUNT(*) INTO users_below
      FROM user_volumes
      WHERE total_volume < user_value;
      
    WHEN 'recovery' THEN
      WITH user_recovery AS (
        SELECT 
          acts.user_id,
          (rest_days.rest_count * 100.0 / EXTRACT(days FROM (CURRENT_DATE - start_date + 1)))::NUMERIC as recovery_score
        FROM (SELECT DISTINCT user_id FROM public.activities WHERE date >= start_date) acts
        CROSS JOIN LATERAL (
          SELECT COUNT(*) as rest_count
          FROM generate_series(start_date, CURRENT_DATE, '1 day'::interval) AS day_series(date)
          LEFT JOIN public.activities a ON day_series.date = a.date AND a.user_id = acts.user_id
          WHERE a.date IS NULL
        ) rest_days
      )
      SELECT COUNT(*) INTO users_below
      FROM user_recovery
      WHERE recovery_score < user_value;
      
    ELSE
      users_below := 0;
  END CASE;

  RETURN ROUND((users_below::NUMERIC / total_users) * 100)::INTEGER;
END;
$function$;

-- Enhanced generate_workout_insights function with advanced AI-like logic
CREATE OR REPLACE FUNCTION public.generate_workout_insights(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  avg_steps INTEGER;
  recent_streak INTEGER;
  last_week_activities INTEGER;
  consistency_score INTEGER;
  intensity_percentile INTEGER;
  recovery_score INTEGER;
  weekly_duration INTEGER;
  heart_rate_trend NUMERIC;
  performance_trend VARCHAR;
  overtraining_risk BOOLEAN := false;
BEGIN
  -- Clear expired insights
  DELETE FROM public.workout_insights 
  WHERE user_id = p_user_id 
    AND expires_at IS NOT NULL 
    AND expires_at < NOW();

  -- Calculate comprehensive metrics
  SELECT COALESCE(AVG(steps), 0)::INTEGER INTO avg_steps
  FROM public.activities
  WHERE user_id = p_user_id AND date >= CURRENT_DATE - INTERVAL '7 days';

  SELECT COALESCE(current_streak, 0) INTO recent_streak
  FROM public.user_stats
  WHERE user_id = p_user_id;

  SELECT COUNT(*) INTO last_week_activities
  FROM public.activities
  WHERE user_id = p_user_id AND date >= CURRENT_DATE - INTERVAL '7 days';

  -- Get consistency score from activity patterns
  SELECT COALESCE(score, 0) INTO consistency_score
  FROM public.activity_patterns
  WHERE user_id = p_user_id 
    AND pattern_type = 'consistency'
    AND period_start >= CURRENT_DATE - INTERVAL '7 days'
  ORDER BY calculated_at DESC
  LIMIT 1;

  -- Calculate intensity percentile
  SELECT public.calculate_user_percentile(p_user_id, 'intensity', 'week') INTO intensity_percentile;

  -- Calculate recovery score
  SELECT public.calculate_user_percentile(p_user_id, 'recovery', 'week') INTO recovery_score;

  -- Get weekly duration
  SELECT COALESCE(SUM(duration), 0) INTO weekly_duration
  FROM public.activities
  WHERE user_id = p_user_id AND date >= CURRENT_DATE - INTERVAL '7 days';

  -- Calculate heart rate trend
  WITH hr_trends AS (
    SELECT 
      date,
      AVG(heart_rate_avg) as daily_avg_hr
    FROM public.activities
    WHERE user_id = p_user_id 
      AND heart_rate_avg IS NOT NULL
      AND date >= CURRENT_DATE - INTERVAL '14 days'
    GROUP BY date
    ORDER BY date
  ),
  trend_calc AS (
    SELECT 
      CASE 
        WHEN COUNT(*) >= 2 THEN
          (SELECT regr_slope(daily_avg_hr, EXTRACT(epoch FROM date)) FROM hr_trends)
        ELSE 0
      END as slope
    FROM hr_trends
  )
  SELECT COALESCE(slope, 0) INTO heart_rate_trend FROM trend_calc;

  -- Determine performance trend
  WITH recent_performance AS (
    SELECT 
      CASE 
        WHEN COUNT(*) >= 3 THEN
          CASE 
            WHEN AVG(calories_burned) > LAG(AVG(calories_burned)) OVER (ORDER BY EXTRACT(week FROM date)) THEN 'improving'
            WHEN AVG(calories_burned) < LAG(AVG(calories_burned)) OVER (ORDER BY EXTRACT(week FROM date)) THEN 'declining'
            ELSE 'stable'
          END
        ELSE 'insufficient_data'
      END as trend
    FROM public.activities
    WHERE user_id = p_user_id AND date >= CURRENT_DATE - INTERVAL '21 days'
    GROUP BY EXTRACT(week FROM date)
  )
  SELECT COALESCE(trend, 'stable') INTO performance_trend FROM recent_performance LIMIT 1;

  -- Check for overtraining risk
  IF consistency_score > 85 AND intensity_percentile > 80 AND recovery_score < 30 THEN
    overtraining_risk := true;
  END IF;

  -- Generate advanced insights based on comprehensive analysis

  -- Performance and trend insights
  IF performance_trend = 'improving' AND intensity_percentile > 70 THEN
    INSERT INTO public.workout_insights (user_id, insight_type, title, description, priority, actionable, expires_at, metrics)
    VALUES (
      p_user_id,
      'achievement',
      'Performance on the Rise! 📈',
      'Your workout intensity is in the top ' || (100 - intensity_percentile) || '% and trending upward. Great momentum!',
      2,
      false,
      NOW() + INTERVAL '5 days',
      jsonb_build_object('intensity_percentile', intensity_percentile, 'trend', performance_trend)
    )
    ON CONFLICT DO NOTHING;
  END IF;

  -- Overtraining warning
  IF overtraining_risk THEN
    INSERT INTO public.workout_insights (user_id, insight_type, title, description, priority, actionable, expires_at, metrics)
    VALUES (
      p_user_id,
      'warning',
      'Recovery Check Needed ⚠️',
      'High consistency (' || consistency_score || '%) with intense workouts but low recovery. Consider a rest day.',
      1,
      true,
      NOW() + INTERVAL '2 days',
      jsonb_build_object('consistency', consistency_score, 'recovery', recovery_score, 'intensity_percentile', intensity_percentile)
    )
    ON CONFLICT DO NOTHING;
  END IF;

  -- Heart rate optimization
  IF heart_rate_trend > 0 AND intensity_percentile < 50 THEN
    INSERT INTO public.workout_insights (user_id, insight_type, title, description, priority, actionable, expires_at, metrics)
    VALUES (
      p_user_id,
      'suggestion',
      'Heart Rate Sweet Spot 💓',
      'Your resting HR is improving! Try zone 3-4 training to maximize cardiovascular gains.',
      3,
      true,
      NOW() + INTERVAL '7 days',
      jsonb_build_object('hr_trend', heart_rate_trend, 'intensity_percentile', intensity_percentile)
    )
    ON CONFLICT DO NOTHING;
  END IF;

  -- Consistency rewards
  IF recent_streak >= 14 AND consistency_score > 80 THEN
    INSERT INTO public.workout_insights (user_id, insight_type, title, description, priority, actionable, expires_at, metrics)
    VALUES (
      p_user_id,
      'achievement',
      'Consistency Champion! 🏆',
      recent_streak || '-day streak with ' || consistency_score || '% consistency. You''re building unstoppable habits!',
      2,
      false,
      NOW() + INTERVAL '3 days',
      jsonb_build_object('streak', recent_streak, 'consistency', consistency_score)
    )
    ON CONFLICT DO NOTHING;
  END IF;

  -- Volume optimization
  IF weekly_duration > 0 AND weekly_duration < 150 THEN
    INSERT INTO public.workout_insights (user_id, insight_type, title, description, priority, actionable, expires_at, metrics)
    VALUES (
      p_user_id,
      'suggestion',
      'Volume Opportunity 📊',
      'You''re ' || (150 - weekly_duration) || ' minutes away from the WHO recommended 150min/week. Add short walks!',
      3,
      true,
      NOW() + INTERVAL '7 days',
      jsonb_build_object('current_duration', weekly_duration, 'target', 150)
    )
    ON CONFLICT DO NOTHING;
  END IF;

  -- Recovery insights
  IF recovery_score > 70 AND last_week_activities < 3 THEN
    INSERT INTO public.workout_insights (user_id, insight_type, title, description, priority, actionable, expires_at, metrics)
    VALUES (
      p_user_id,
      'suggestion',
      'Well-Rested and Ready! 💪',
      'Great recovery balance! Your body is primed for a challenging workout. Time to push harder.',
      4,
      true,
      NOW() + INTERVAL '3 days',
      jsonb_build_object('recovery_score', recovery_score, 'weekly_activities', last_week_activities)
    )
    ON CONFLICT DO NOTHING;
  END IF;

  -- Inactivity alerts
  IF last_week_activities = 0 THEN
    INSERT INTO public.workout_insights (user_id, insight_type, title, description, priority, actionable, expires_at, metrics)
    VALUES (
      p_user_id,
      'warning',
      'Time to Get Moving! 🚀',
      'No activities logged this week. Start with a 10-minute walk to rebuild momentum.',
      1,
      true,
      NOW() + INTERVAL '3 days',
      jsonb_build_object('days_inactive', 7, 'suggested_start', '10min walk')
    )
    ON CONFLICT DO NOTHING;
  END IF;
END;
$function$;

-- Enhanced update_activity_patterns function with recovery and advanced patterns
CREATE OR REPLACE FUNCTION public.update_activity_patterns(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  consistency_score INTEGER;
  intensity_score INTEGER;
  volume_score INTEGER;
  recovery_score INTEGER;
  week_start DATE;
  week_end DATE;
  trend_direction VARCHAR;
  overtraining_risk BOOLEAN := false;
BEGIN
  week_start := DATE_TRUNC('week', CURRENT_DATE)::DATE;
  week_end := week_start + INTERVAL '6 days';

  -- Calculate consistency score (0-100 based on days active)
  SELECT (COUNT(DISTINCT date) * 100 / 7)::INTEGER INTO consistency_score
  FROM public.activities
  WHERE user_id = p_user_id 
    AND date >= week_start 
    AND date <= week_end;

  -- Calculate intensity score (based on heart rate and perceived effort)
  WITH intensity_data AS (
    SELECT 
      COALESCE(AVG(heart_rate_avg), 0) as avg_hr,
      COALESCE(AVG(heart_rate_max), 0) as max_hr,
      COUNT(*) as activity_count
    FROM public.activities
    WHERE user_id = p_user_id 
      AND date >= week_start 
      AND date <= week_end
      AND heart_rate_avg IS NOT NULL
  )
  SELECT 
    CASE 
      WHEN activity_count = 0 THEN 30
      WHEN avg_hr = 0 THEN 40
      ELSE LEAST(100, GREATEST(20, (avg_hr * 100 / GREATEST(180, max_hr))))
    END::INTEGER 
  INTO intensity_score
  FROM intensity_data;

  -- Calculate volume score (based on duration compared to goals)
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
  SELECT LEAST(100, GREATEST(0, (weekly_total.total * 100 / user_goal.goal)))::INTEGER 
  INTO volume_score
  FROM user_goal, weekly_total;

  -- Calculate recovery score (based on rest days and intensity patterns)
  WITH daily_intensity AS (
    SELECT 
      date,
      COALESCE(AVG(heart_rate_avg), 0) as daily_intensity,
      COALESCE(SUM(duration), 0) as daily_duration
    FROM public.activities
    WHERE user_id = p_user_id 
      AND date >= week_start - INTERVAL '7 days'
      AND date <= week_end
    GROUP BY date
  ),
  recovery_calc AS (
    SELECT 
      COUNT(CASE WHEN daily_intensity = 0 THEN 1 END) as rest_days,
      AVG(CASE WHEN daily_intensity > 140 THEN 1 ELSE 0 END) as high_intensity_ratio,
      COUNT(*) as total_days
    FROM daily_intensity
  )
  SELECT 
    CASE 
      WHEN total_days = 0 THEN 50
      ELSE LEAST(100, GREATEST(0, 
        (rest_days * 100 / total_days) - (high_intensity_ratio * 30)
      ))
    END::INTEGER
  INTO recovery_score
  FROM recovery_calc;

  -- Determine trend direction by comparing to previous week
  WITH prev_week_patterns AS (
    SELECT score
    FROM public.activity_patterns
    WHERE user_id = p_user_id
      AND pattern_type = 'consistency'
      AND period_start = week_start - INTERVAL '7 days'
  )
  SELECT 
    CASE 
      WHEN prev_week_patterns.score IS NULL THEN 'stable'
      WHEN consistency_score > prev_week_patterns.score + 10 THEN 'improving'
      WHEN consistency_score < prev_week_patterns.score - 10 THEN 'declining'
      ELSE 'stable'
    END
  INTO trend_direction
  FROM prev_week_patterns;

  -- Check for overtraining risk
  IF consistency_score > 85 AND intensity_score > 80 AND recovery_score < 30 THEN
    overtraining_risk := true;
    trend_direction := 'overtraining_risk';
  END IF;

  -- Insert or update all patterns
  INSERT INTO public.activity_patterns (user_id, pattern_type, score, trend, period_start, period_end)
  VALUES 
    (p_user_id, 'consistency', consistency_score, trend_direction, week_start, week_end),
    (p_user_id, 'intensity', intensity_score, trend_direction, week_start, week_end),
    (p_user_id, 'volume', volume_score, trend_direction, week_start, week_end),
    (p_user_id, 'recovery', recovery_score, 
     CASE WHEN overtraining_risk THEN 'needs_attention' ELSE trend_direction END, 
     week_start, week_end)
  ON CONFLICT (user_id, pattern_type, period_start) 
  DO UPDATE SET 
    score = EXCLUDED.score,
    trend = EXCLUDED.trend,
    calculated_at = NOW();
END;
$function$;

-- Create automatic triggers for real-time updates
CREATE OR REPLACE FUNCTION public.trigger_update_patterns_on_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  -- Update activity patterns when new activity is inserted
  PERFORM public.update_activity_patterns(NEW.user_id);
  
  -- Generate new insights based on updated patterns
  PERFORM public.generate_workout_insights(NEW.user_id);
  
  RETURN NEW;
END;
$function$;

-- Create trigger for activity insertions
DROP TRIGGER IF EXISTS trigger_update_patterns_on_activity ON public.activities;
CREATE TRIGGER trigger_update_patterns_on_activity
  AFTER INSERT ON public.activities
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_update_patterns_on_activity();

-- Create trigger for user stats updates
CREATE OR REPLACE FUNCTION public.trigger_generate_insights_on_stats_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  -- Generate insights when user stats are significantly updated
  IF (NEW.current_streak != OLD.current_streak) OR 
     (NEW.today_steps != OLD.today_steps) OR
     (ABS(COALESCE(NEW.water_intake, 0) - COALESCE(OLD.water_intake, 0)) > 2) THEN
    PERFORM public.generate_workout_insights(NEW.user_id);
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger for stats updates
DROP TRIGGER IF EXISTS trigger_generate_insights_on_stats_update ON public.user_stats;
CREATE TRIGGER trigger_generate_insights_on_stats_update
  AFTER UPDATE ON public.user_stats
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_generate_insights_on_stats_update();