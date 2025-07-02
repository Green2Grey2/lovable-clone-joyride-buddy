-- Migration: Add Achievements System
-- This creates the user_achievements table referenced by the social activity trigger

-- Create achievements reference table
CREATE TABLE IF NOT EXISTS achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon TEXT NOT NULL, -- Lucide icon name
  category TEXT NOT NULL CHECK (category IN ('streak', 'milestone', 'challenge', 'special')),
  criteria JSONB NOT NULL, -- e.g., {"type": "steps", "value": 10000}
  points INTEGER NOT NULL DEFAULT 10,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id),
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  progress INTEGER DEFAULT 100, -- Percentage for partial achievements
  data JSONB, -- Additional achievement data
  UNIQUE(user_id, achievement_id)
);

-- Enable RLS
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for achievements
CREATE POLICY "Achievements visible to all"
  ON achievements
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage achievements"
  ON achievements
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for user_achievements
CREATE POLICY "Users can view their own achievements"
  ON user_achievements
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can view others achievements for leaderboard"
  ON user_achievements
  FOR SELECT
  USING (true); -- Allow viewing for social features

CREATE POLICY "System can insert achievements"
  ON user_achievements
  FOR INSERT
  WITH CHECK (true); -- Will be triggered by functions

-- Indexes
CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_earned ON user_achievements(earned_at DESC);
CREATE INDEX idx_achievements_category ON achievements(category, is_active);

-- Insert default achievements
INSERT INTO achievements (name, description, icon, category, criteria, points, sort_order) VALUES
  ('First Steps', 'Log your first activity', 'footprints', 'milestone', '{"type": "first_activity"}', 10, 1),
  ('Early Bird', 'Complete a morning workout before 7 AM', 'sunrise', 'special', '{"type": "morning_workout", "before_hour": 7}', 15, 2),
  ('Week Warrior', 'Maintain a 7-day streak', 'calendar-check', 'streak', '{"type": "streak", "days": 7}', 25, 3),
  ('Fortnight Fighter', 'Maintain a 14-day streak', 'flame', 'streak', '{"type": "streak", "days": 14}', 50, 4),
  ('Monthly Master', 'Maintain a 30-day streak', 'award', 'streak', '{"type": "streak", "days": 30}', 100, 5),
  ('Consistency King', 'Maintain a 60-day streak', 'crown', 'streak', '{"type": "streak", "days": 60}', 200, 6),
  ('Century Club', 'Maintain a 100-day streak', 'star', 'streak', '{"type": "streak", "days": 100}', 500, 7),
  ('Step Champion', 'Walk 10,000 steps in a day', 'trophy', 'milestone', '{"type": "steps", "value": 10000}', 20, 8),
  ('Marathon Walker', 'Walk 20,000 steps in a day', 'medal', 'milestone', '{"type": "steps", "value": 20000}', 40, 9),
  ('Distance Runner', 'Walk 5 miles in a day', 'map-pin', 'milestone', '{"type": "distance", "value": 5, "unit": "miles"}', 30, 10),
  ('Explorer', 'Walk 10 miles in a day', 'compass', 'milestone', '{"type": "distance", "value": 10, "unit": "miles"}', 60, 11),
  ('Calorie Crusher', 'Burn 500 calories in a day', 'flame', 'milestone', '{"type": "calories", "value": 500}', 25, 12),
  ('Inferno', 'Burn 1000 calories in a day', 'fire', 'milestone', '{"type": "calories", "value": 1000}', 50, 13),
  ('Team Player', 'Join a collaborative goal', 'users', 'special', '{"type": "collaboration"}', 15, 14),
  ('Goal Crusher', 'Complete a collaborative goal', 'target', 'special', '{"type": "goal_complete"}', 50, 15),
  ('Social Butterfly', 'Get 10 likes on your activities', 'heart', 'special', '{"type": "social_likes", "count": 10}', 20, 16),
  ('Influencer', 'Get 50 likes on your activities', 'trending-up', 'special', '{"type": "social_likes", "count": 50}', 100, 17);

-- Function to check and award achievements
CREATE OR REPLACE FUNCTION check_and_award_achievement(
  p_user_id UUID,
  p_achievement_name TEXT,
  p_data JSONB DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_achievement_id UUID;
  v_already_earned BOOLEAN;
BEGIN
  -- Get achievement ID
  SELECT id INTO v_achievement_id
  FROM achievements
  WHERE name = p_achievement_name
  AND is_active = true;
  
  IF v_achievement_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check if already earned
  SELECT EXISTS(
    SELECT 1 FROM user_achievements
    WHERE user_id = p_user_id
    AND achievement_id = v_achievement_id
  ) INTO v_already_earned;
  
  IF v_already_earned THEN
    RETURN false;
  END IF;
  
  -- Award achievement
  INSERT INTO user_achievements (user_id, achievement_id, data)
  VALUES (p_user_id, v_achievement_id, p_data);
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check streak achievements
CREATE OR REPLACE FUNCTION check_streak_achievements()
RETURNS TRIGGER AS $$
BEGIN
  -- Check various streak milestones
  IF NEW.current_streak >= 7 AND OLD.current_streak < 7 THEN
    PERFORM check_and_award_achievement(NEW.user_id, 'Week Warrior');
  END IF;
  
  IF NEW.current_streak >= 14 AND OLD.current_streak < 14 THEN
    PERFORM check_and_award_achievement(NEW.user_id, 'Fortnight Fighter');
  END IF;
  
  IF NEW.current_streak >= 30 AND OLD.current_streak < 30 THEN
    PERFORM check_and_award_achievement(NEW.user_id, 'Monthly Master');
  END IF;
  
  IF NEW.current_streak >= 60 AND OLD.current_streak < 60 THEN
    PERFORM check_and_award_achievement(NEW.user_id, 'Consistency King');
  END IF;
  
  IF NEW.current_streak >= 100 AND OLD.current_streak < 100 THEN
    PERFORM check_and_award_achievement(NEW.user_id, 'Century Club');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to check step achievements
CREATE OR REPLACE FUNCTION check_step_achievements()
RETURNS TRIGGER AS $$
BEGIN
  -- Check step milestones
  IF NEW.today_steps >= 10000 AND OLD.today_steps < 10000 THEN
    PERFORM check_and_award_achievement(NEW.user_id, 'Step Champion');
  END IF;
  
  IF NEW.today_steps >= 20000 AND OLD.today_steps < 20000 THEN
    PERFORM check_and_award_achievement(NEW.user_id, 'Marathon Walker');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic achievement checking
CREATE TRIGGER check_streak_achievements_trigger
  AFTER UPDATE OF current_streak ON user_stats
  FOR EACH ROW
  WHEN (NEW.current_streak > OLD.current_streak)
  EXECUTE FUNCTION check_streak_achievements();

CREATE TRIGGER check_step_achievements_trigger
  AFTER UPDATE OF today_steps ON user_stats
  FOR EACH ROW
  WHEN (NEW.today_steps > OLD.today_steps)
  EXECUTE FUNCTION check_step_achievements();

-- Function to get user achievement summary
CREATE OR REPLACE FUNCTION get_user_achievement_summary(p_user_id UUID)
RETURNS TABLE (
  total_achievements INTEGER,
  total_points INTEGER,
  latest_achievement_name TEXT,
  latest_achievement_date TIMESTAMPTZ,
  achievements_by_category JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(ua.id)::INTEGER as total_achievements,
    COALESCE(SUM(a.points), 0)::INTEGER as total_points,
    (SELECT a2.name FROM user_achievements ua2 
     JOIN achievements a2 ON ua2.achievement_id = a2.id 
     WHERE ua2.user_id = p_user_id 
     ORDER BY ua2.earned_at DESC LIMIT 1) as latest_achievement_name,
    (SELECT ua2.earned_at FROM user_achievements ua2 
     WHERE ua2.user_id = p_user_id 
     ORDER BY ua2.earned_at DESC LIMIT 1) as latest_achievement_date,
    jsonb_object_agg(
      a.category, 
      COUNT(ua.id)
    ) FILTER (WHERE a.category IS NOT NULL) as achievements_by_category
  FROM user_achievements ua
  LEFT JOIN achievements a ON ua.achievement_id = a.id
  WHERE ua.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION check_and_award_achievement TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_achievement_summary TO authenticated;