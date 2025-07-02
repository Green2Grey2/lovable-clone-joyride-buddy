-- Create social activities table
CREATE TABLE IF NOT EXISTS social_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('achievement', 'milestone', 'activity', 'challenge')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  data JSONB,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create activity likes table
CREATE TABLE IF NOT EXISTS activity_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  activity_id UUID NOT NULL REFERENCES social_activities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(activity_id, user_id)
);

-- Create activity comments table
CREATE TABLE IF NOT EXISTS activity_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  activity_id UUID NOT NULL REFERENCES social_activities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE social_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_comments ENABLE ROW LEVEL SECURITY;

-- Social activities policies
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

CREATE POLICY "Users can delete their own social activities"
  ON social_activities
  FOR DELETE
  USING (auth.uid() = user_id);

-- Activity likes policies
CREATE POLICY "Users can view all likes"
  ON activity_likes
  FOR SELECT
  USING (true);

CREATE POLICY "Users can like activities"
  ON activity_likes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own likes"
  ON activity_likes
  FOR DELETE
  USING (auth.uid() = user_id);

-- Activity comments policies
CREATE POLICY "Users can view all comments"
  ON activity_comments
  FOR SELECT
  USING (true);

CREATE POLICY "Users can create comments"
  ON activity_comments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON activity_comments
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON activity_comments
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to update like count
CREATE OR REPLACE FUNCTION update_activity_likes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE social_activities 
    SET likes = likes + 1 
    WHERE id = NEW.activity_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE social_activities 
    SET likes = likes - 1 
    WHERE id = OLD.activity_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for like count
CREATE TRIGGER activity_likes_count
AFTER INSERT OR DELETE ON activity_likes
FOR EACH ROW
EXECUTE FUNCTION update_activity_likes();

-- Create function to update comment count
CREATE OR REPLACE FUNCTION update_activity_comments()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE social_activities 
    SET comments = comments + 1 
    WHERE id = NEW.activity_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE social_activities 
    SET comments = comments - 1 
    WHERE id = OLD.activity_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for comment count
CREATE TRIGGER activity_comments_count
AFTER INSERT OR DELETE ON activity_comments
FOR EACH ROW
EXECUTE FUNCTION update_activity_comments();

-- Create function to log activities automatically
CREATE OR REPLACE FUNCTION log_social_activity()
RETURNS TRIGGER AS $$
BEGIN
  -- Log achievements
  IF TG_TABLE_NAME = 'user_achievements' AND TG_OP = 'INSERT' THEN
    INSERT INTO social_activities (user_id, type, title, description, data)
    VALUES (
      NEW.user_id,
      'achievement',
      'New Achievement Unlocked!',
      'Earned the ' || NEW.achievement_id || ' badge',
      jsonb_build_object('badge', NEW.achievement_id, 'earned_at', NEW.earned_at)
    );
  END IF;

  -- Log milestones (e.g., streak milestones)
  IF TG_TABLE_NAME = 'user_stats' AND TG_OP = 'UPDATE' THEN
    -- Check for streak milestones
    IF NEW.current_streak > OLD.current_streak AND NEW.current_streak IN (7, 14, 30, 60, 100) THEN
      INSERT INTO social_activities (user_id, type, title, description, data)
      VALUES (
        NEW.user_id,
        'milestone',
        'Streak Milestone!',
        'Reached a ' || NEW.current_streak || '-day streak!',
        jsonb_build_object('value', NEW.current_streak, 'unit', 'days')
      );
    END IF;

    -- Check for step milestones
    IF NEW.today_steps > 10000 AND OLD.today_steps <= 10000 THEN
      INSERT INTO social_activities (user_id, type, title, description, data)
      VALUES (
        NEW.user_id,
        'milestone',
        'Daily Goal Achieved!',
        'Walked over 10,000 steps today!',
        jsonb_build_object('value', NEW.today_steps, 'unit', 'steps')
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create indexes
CREATE INDEX idx_social_activities_user_id ON social_activities(user_id);
CREATE INDEX idx_social_activities_created_at ON social_activities(created_at DESC);
CREATE INDEX idx_social_activities_type ON social_activities(type);
CREATE INDEX idx_activity_likes_activity_id ON activity_likes(activity_id);
CREATE INDEX idx_activity_likes_user_id ON activity_likes(user_id);
CREATE INDEX idx_activity_comments_activity_id ON activity_comments(activity_id);