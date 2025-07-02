-- Migration: Add Social Activities System
-- This creates the social_activities table and related functions

-- Create social_activities table
CREATE TABLE IF NOT EXISTS social_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('step_milestone', 'streak_achievement', 'goal_completion', 'challenge_join', 'achievement', 'activity_log')),
  title TEXT NOT NULL,
  description TEXT,
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create activity_likes table for social interactions
CREATE TABLE IF NOT EXISTS activity_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_id UUID NOT NULL REFERENCES social_activities(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, activity_id)
);

-- Enable RLS
ALTER TABLE social_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for social_activities
CREATE POLICY "Users can view all social activities"
  ON social_activities
  FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own social activities"
  ON social_activities
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own social activities"
  ON social_activities
  FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for activity_likes
CREATE POLICY "Users can view all activity likes"
  ON activity_likes
  FOR SELECT
  USING (true);

CREATE POLICY "Users can like activities"
  ON activity_likes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike activities"
  ON activity_likes
  FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for better performance
CREATE INDEX idx_social_activities_user_id ON social_activities(user_id);
CREATE INDEX idx_social_activities_created_at ON social_activities(created_at DESC);
CREATE INDEX idx_social_activities_type ON social_activities(type);
CREATE INDEX idx_activity_likes_activity_id ON activity_likes(activity_id);
CREATE INDEX idx_activity_likes_user_id ON activity_likes(user_id);

-- Function to log social activities
CREATE OR REPLACE FUNCTION log_social_activity()
RETURNS TRIGGER AS $$
BEGIN
  -- Log new user achievements
  IF TG_TABLE_NAME = 'user_achievements' AND TG_OP = 'INSERT' THEN
    INSERT INTO social_activities (user_id, type, title, description, data)
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
    FROM achievements a
    WHERE a.id = NEW.achievement_id;
    
    RETURN NEW;
  END IF;

  -- Log streak milestones
  IF TG_TABLE_NAME = 'user_stats' AND TG_OP = 'UPDATE' THEN
    -- Check for streak milestones
    IF NEW.current_streak IN (7, 14, 30, 60, 100) AND (OLD.current_streak IS NULL OR NEW.current_streak > OLD.current_streak) THEN
      INSERT INTO social_activities (user_id, type, title, description, data)
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
      INSERT INTO social_activities (user_id, type, title, description, data)
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
    INSERT INTO social_activities (user_id, type, title, description, data)
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for automatic social activity logging
DROP TRIGGER IF EXISTS log_achievement_social_activity ON user_achievements;
CREATE TRIGGER log_achievement_social_activity
  AFTER INSERT ON user_achievements
  FOR EACH ROW
  EXECUTE FUNCTION log_social_activity();

DROP TRIGGER IF EXISTS log_stats_social_activity ON user_stats;
CREATE TRIGGER log_stats_social_activity
  AFTER UPDATE ON user_stats
  FOR EACH ROW
  EXECUTE FUNCTION log_social_activity();

-- Function to get social feed with user info and likes
CREATE OR REPLACE FUNCTION get_social_feed(
  p_user_id UUID DEFAULT NULL,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  type TEXT,
  title TEXT,
  description TEXT,
  data JSONB,
  created_at TIMESTAMPTZ,
  user_name TEXT,
  user_department TEXT,
  like_count BIGINT,
  liked_by_me BOOLEAN
) AS $$
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
  FROM social_activities sa
  LEFT JOIN profiles p ON sa.user_id = p.user_id
  LEFT JOIN (
    SELECT activity_id, COUNT(*) as like_count
    FROM activity_likes
    GROUP BY activity_id
  ) like_counts ON sa.id = like_counts.activity_id
  LEFT JOIN activity_likes user_likes ON sa.id = user_likes.activity_id AND user_likes.user_id = p_user_id
  ORDER BY sa.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_social_feed TO authenticated;

-- Insert some sample activities for demo
INSERT INTO social_activities (user_id, type, title, description, data) 
SELECT 
  (SELECT id FROM auth.users LIMIT 1),
  'step_milestone',
  'First 10K Steps! 👟',
  'Reached the daily 10,000 step milestone',
  '{"steps": 10500, "milestone": 10000}'
WHERE EXISTS (SELECT 1 FROM auth.users LIMIT 1);

INSERT INTO social_activities (user_id, type, title, description, data) 
SELECT 
  (SELECT id FROM auth.users LIMIT 1),
  'streak_achievement',
  '7-Day Streak! 🔥',
  'Maintained consistency for 7 days straight',
  '{"streak_days": 7, "milestone_reached": 7}'
WHERE EXISTS (SELECT 1 FROM auth.users LIMIT 1);