-- Fix the EXTRACT function calls in generate_workout_insights
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
      a.date,
      AVG(a.heart_rate_avg) as daily_avg_hr
    FROM public.activities a
    WHERE a.user_id = p_user_id 
      AND a.heart_rate_avg IS NOT NULL
      AND a.date >= CURRENT_DATE - INTERVAL '14 days'
    GROUP BY a.date
    ORDER BY a.date
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

  -- Determine performance trend - simplified to avoid EXTRACT issues
  WITH weekly_performance AS (
    SELECT 
      DATE_TRUNC('week', a.date) as week_start,
      AVG(a.calories_burned) as avg_calories
    FROM public.activities a
    WHERE a.user_id = p_user_id AND a.date >= CURRENT_DATE - INTERVAL '21 days'
    GROUP BY DATE_TRUNC('week', a.date)
    HAVING COUNT(*) >= 1
    ORDER BY week_start DESC
    LIMIT 3
  ),
  trend_calc AS (
    SELECT 
      CASE 
        WHEN COUNT(*) >= 2 THEN
          CASE 
            WHEN LAG(avg_calories) OVER (ORDER BY week_start DESC) IS NOT NULL 
                 AND avg_calories > LAG(avg_calories) OVER (ORDER BY week_start DESC) THEN 'improving'
            WHEN LAG(avg_calories) OVER (ORDER BY week_start DESC) IS NOT NULL 
                 AND avg_calories < LAG(avg_calories) OVER (ORDER BY week_start DESC) THEN 'declining'
            ELSE 'stable'
          END
        ELSE 'insufficient_data'
      END as trend
    FROM weekly_performance
    LIMIT 1
  )
  SELECT COALESCE(trend, 'stable') INTO performance_trend FROM trend_calc;

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