-- Fix the EXTRACT function calls in calculate_user_percentile
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
      SELECT (COUNT(DISTINCT date) * 100.0 / (CURRENT_DATE - start_date + 1))::NUMERIC
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
      SELECT (rest_day_count * 100.0 / (CURRENT_DATE - start_date + 1))::NUMERIC
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
          (COUNT(DISTINCT date) * 100.0 / (CURRENT_DATE - start_date + 1))::NUMERIC as consistency_score
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
          (rest_days.rest_count * 100.0 / (CURRENT_DATE - start_date + 1))::NUMERIC as recovery_score
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