-- Fitness App Database Enhancements Migration
-- Date: July 2, 2025

-- 1. Create heart_rate_data table
CREATE TABLE IF NOT EXISTS heart_rate_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  heart_rate INTEGER NOT NULL CHECK (heart_rate > 0 AND heart_rate < 300),
  zone VARCHAR(20) CHECK (zone IN ('recovery', 'fat_burn', 'cardio', 'peak', 'maximum')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create workout_insights table
CREATE TABLE IF NOT EXISTS workout_insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  insight_type VARCHAR(50) NOT NULL CHECK (insight_type IN ('improvement', 'warning', 'suggestion', 'achievement')),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  metrics JSONB DEFAULT '{}',
  priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
  actionable BOOLEAN DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create activity_patterns table
CREATE TABLE IF NOT EXISTS activity_patterns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  pattern_type VARCHAR(50) NOT NULL CHECK (pattern_type IN ('consistency', 'intensity', 'volume', 'recovery')),
  score INTEGER CHECK (score >= 0 AND score <= 100),
  trend VARCHAR(10) CHECK (trend IN ('up', 'down', 'stable')),
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL
);

-- 4. Modify activities table to add new columns
ALTER TABLE activities 
ADD COLUMN IF NOT EXISTS heart_rate_avg INTEGER CHECK (heart_rate_avg > 0 AND heart_rate_avg < 300),
ADD COLUMN IF NOT EXISTS heart_rate_max INTEGER CHECK (heart_rate_max > 0 AND heart_rate_max < 300),
ADD COLUMN IF NOT EXISTS elevation_gain NUMERIC CHECK (elevation_gain >= 0),
ADD COLUMN IF NOT EXISTS weather_conditions JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS is_manual_entry BOOLEAN DEFAULT false;

-- 5. Modify user_stats table to add new columns
ALTER TABLE user_stats
ADD COLUMN IF NOT EXISTS weekly_goal_steps INTEGER DEFAULT 70000 CHECK (weekly_goal_steps > 0),
ADD COLUMN IF NOT EXISTS weekly_goal_calories INTEGER DEFAULT 3500 CHECK (weekly_goal_calories > 0),
ADD COLUMN IF NOT EXISTS weekly_goal_duration INTEGER DEFAULT 300 CHECK (weekly_goal_duration > 0),
ADD COLUMN IF NOT EXISTS preferred_workout_time VARCHAR(20) CHECK (preferred_workout_time IN ('morning', 'afternoon', 'evening', 'flexible')),
ADD COLUMN IF NOT EXISTS fitness_level VARCHAR(20) DEFAULT 'intermediate' CHECK (fitness_level IN ('beginner', 'intermediate', 'advanced', 'expert'));

-- 6. Modify profiles table to add new columns
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS height_cm INTEGER CHECK (height_cm > 0 AND height_cm < 300),
ADD COLUMN IF NOT EXISTS weight_kg NUMERIC CHECK (weight_kg > 0 AND weight_kg < 1000),
ADD COLUMN IF NOT EXISTS max_heart_rate INTEGER CHECK (max_heart_rate > 0 AND max_heart_rate < 300),
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"achievements": true, "challenges": true, "social": true, "reminders": true}',
ADD COLUMN IF NOT EXISTS privacy_settings JSONB DEFAULT '{"profile_visible": true, "activities_visible": true, "stats_visible": true}';

-- 7. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_heart_rate_user_timestamp ON heart_rate_data(user_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_heart_rate_activity ON heart_rate_data(activity_id);
CREATE INDEX IF NOT EXISTS idx_insights_user ON workout_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_insights_active ON workout_insights(user_id, expires_at);
CREATE INDEX IF NOT EXISTS idx_patterns_user_date ON activity_patterns(user_id, calculated_at);
CREATE INDEX IF NOT EXISTS idx_activities_user_date ON activities(user_id, date);
CREATE INDEX IF NOT EXISTS idx_activities_date_desc ON activities(date DESC);
CREATE INDEX IF NOT EXISTS idx_user_stats_streak ON user_stats(current_streak DESC);
CREATE INDEX IF NOT EXISTS idx_activities_user_type_date ON activities(user_id, type, date);

-- 8. Enable RLS on new tables
ALTER TABLE heart_rate_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_patterns ENABLE ROW LEVEL SECURITY;

-- 9. Create RLS policies for heart_rate_data
CREATE POLICY "Users can view own heart rate data"
  ON heart_rate_data FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own heart rate data"
  ON heart_rate_data FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 10. Create RLS policies for workout_insights
CREATE POLICY "Users can view own insights"
  ON workout_insights FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert insights"
  ON workout_insights FOR INSERT
  WITH CHECK (true);

-- 11. Create RLS policies for activity_patterns
CREATE POLICY "Users can view own patterns"
  ON activity_patterns FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage patterns"
  ON activity_patterns FOR ALL
  USING (true);

-- 12. Create function to calculate user percentile ranking
CREATE OR REPLACE FUNCTION calculate_user_percentile(
  p_user_id UUID,
  p_metric VARCHAR,
  p_timeframe VARCHAR DEFAULT 'week'
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
  FROM activities
  WHERE user_id = p_user_id
    AND date >= start_date;

  -- Count total active users
  SELECT COUNT(DISTINCT user_id) INTO total_users
  FROM activities
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
    FROM activities
    WHERE date >= start_date
    GROUP BY user_id
  )
  SELECT COUNT(*) INTO users_below
  FROM user_totals
  WHERE total_value < user_value;

  RETURN ROUND((users_below::NUMERIC / total_users) * 100)::INTEGER;
END;
$$;

-- 13. Create function to generate workout insights
CREATE OR REPLACE FUNCTION generate_workout_insights(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  avg_steps INTEGER;
  recent_streak INTEGER;
  last_week_activities INTEGER;
BEGIN
  -- Clear expired insights
  DELETE FROM workout_insights 
  WHERE user_id = p_user_id 
    AND expires_at IS NOT NULL 
    AND expires_at < NOW();

  -- Calculate recent metrics
  SELECT COALESCE(AVG(steps), 0)::INTEGER INTO avg_steps
  FROM activities
  WHERE user_id = p_user_id AND date >= CURRENT_DATE - INTERVAL '7 days';

  SELECT COALESCE(current_streak, 0) INTO recent_streak
  FROM user_stats
  WHERE user_id = p_user_id;

  SELECT COUNT(*) INTO last_week_activities
  FROM activities
  WHERE user_id = p_user_id AND date >= CURRENT_DATE - INTERVAL '7 days';

  -- Generate step-based insights
  IF avg_steps > 0 AND avg_steps < 8000 THEN
    INSERT INTO workout_insights (user_id, insight_type, title, description, priority, actionable, expires_at)
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
    INSERT INTO workout_insights (user_id, insight_type, title, description, priority, expires_at)
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
    INSERT INTO workout_insights (user_id, insight_type, title, description, priority, actionable, expires_at)
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
$$;

-- 14. Create function to update activity patterns
CREATE OR REPLACE FUNCTION update_activity_patterns(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
  FROM activities
  WHERE user_id = p_user_id 
    AND date >= week_start 
    AND date <= week_end;

  -- Calculate intensity score (based on average heart rate if available)
  SELECT COALESCE(AVG(heart_rate_avg) * 100 / 180, 50)::INTEGER INTO intensity_score
  FROM activities
  WHERE user_id = p_user_id 
    AND date >= week_start 
    AND date <= week_end
    AND heart_rate_avg IS NOT NULL;

  -- Calculate volume score (based on total duration compared to goal)
  WITH user_goal AS (
    SELECT COALESCE(weekly_goal_duration, 300) as goal
    FROM user_stats
    WHERE user_id = p_user_id
  ),
  weekly_total AS (
    SELECT COALESCE(SUM(duration), 0) as total
    FROM activities
    WHERE user_id = p_user_id 
      AND date >= week_start 
      AND date <= week_end
  )
  SELECT LEAST(100, (weekly_total.total * 100 / user_goal.goal))::INTEGER INTO volume_score
  FROM user_goal, weekly_total;

  -- Insert or update patterns
  INSERT INTO activity_patterns (user_id, pattern_type, score, trend, period_start, period_end)
  VALUES 
    (p_user_id, 'consistency', consistency_score, 'stable', week_start, week_end),
    (p_user_id, 'intensity', intensity_score, 'stable', week_start, week_end),
    (p_user_id, 'volume', volume_score, 'stable', week_start, week_end)
  ON CONFLICT (user_id, pattern_type, period_start) 
  DO UPDATE SET 
    score = EXCLUDED.score,
    calculated_at = NOW();
END;
$$;