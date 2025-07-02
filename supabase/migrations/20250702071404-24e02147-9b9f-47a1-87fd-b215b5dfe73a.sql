-- Migration: Add Collaborative Goals System
-- This creates the collaborative_goals and related tables referenced by CollaborativeGoals component

-- Create collaborative goals table
CREATE TABLE IF NOT EXISTS collaborative_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  target_value INTEGER NOT NULL,
  unit TEXT NOT NULL,
  department TEXT NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create goal participants table
CREATE TABLE IF NOT EXISTS goal_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID NOT NULL REFERENCES collaborative_goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(goal_id, user_id)
);

-- Create goal progress table
CREATE TABLE IF NOT EXISTS goal_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID NOT NULL REFERENCES collaborative_goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  progress_value INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  department TEXT NOT NULL
);

-- Enable RLS
ALTER TABLE collaborative_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_progress ENABLE ROW LEVEL SECURITY;

-- Collaborative goals policies
CREATE POLICY "Users can view department goals"
  ON collaborative_goals
  FOR SELECT
  USING (
    department IN (
      SELECT department FROM profiles WHERE user_id = auth.uid()
    )
    OR has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Users can create department goals"
  ON collaborative_goals
  FOR INSERT
  WITH CHECK (
    auth.uid() = created_by 
    AND department IN (
      SELECT department FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Goal creators can update their goals"
  ON collaborative_goals
  FOR UPDATE
  USING (auth.uid() = created_by OR has_role(auth.uid(), 'admin'));

-- Goal participants policies
CREATE POLICY "Users can view goal participants"
  ON goal_participants
  FOR SELECT
  USING (true);

CREATE POLICY "Users can join goals"
  ON goal_participants
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave goals"
  ON goal_participants
  FOR DELETE
  USING (auth.uid() = user_id);

-- Goal progress policies
CREATE POLICY "Users can view goal progress"
  ON goal_progress
  FOR SELECT
  USING (
    department IN (
      SELECT department FROM profiles WHERE user_id = auth.uid()
    )
    OR has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Users can log their own progress"
  ON goal_progress
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND department IN (
      SELECT department FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_collaborative_goals_department ON collaborative_goals(department);
CREATE INDEX IF NOT EXISTS idx_collaborative_goals_active ON collaborative_goals(is_active);
CREATE INDEX IF NOT EXISTS idx_collaborative_goals_dates ON collaborative_goals(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_goal_participants_goal_id ON goal_participants(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_participants_user_id ON goal_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_goal_progress_goal_id ON goal_progress(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_progress_user_id ON goal_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_goal_progress_department ON goal_progress(department);