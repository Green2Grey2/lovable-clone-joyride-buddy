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
  value INTEGER NOT NULL,
  logged_at TIMESTAMPTZ DEFAULT NOW(),
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

-- Create function to automatically log progress from activities
CREATE OR REPLACE FUNCTION log_goal_progress()
RETURNS TRIGGER AS $$
DECLARE
  v_department TEXT;
  v_goal RECORD;
BEGIN
  -- Get user's department
  SELECT department INTO v_department
  FROM profiles
  WHERE user_id = NEW.user_id;

  -- Find active goals for the department
  FOR v_goal IN
    SELECT * FROM collaborative_goals
    WHERE department = v_department
    AND is_active = true
    AND start_date <= NOW()
    AND end_date >= NOW()
  LOOP
    -- Check if user is a participant
    IF EXISTS (
      SELECT 1 FROM goal_participants
      WHERE goal_id = v_goal.id AND user_id = NEW.user_id
    ) THEN
      -- Log progress based on goal unit
      IF v_goal.unit = 'steps' AND NEW.steps > 0 THEN
        INSERT INTO goal_progress (goal_id, user_id, value, department)
        VALUES (v_goal.id, NEW.user_id, NEW.steps, v_department);
      ELSIF v_goal.unit = 'minutes' AND NEW.duration > 0 THEN
        INSERT INTO goal_progress (goal_id, user_id, value, department)
        VALUES (v_goal.id, NEW.user_id, NEW.duration, v_department);
      ELSIF v_goal.unit = 'activities' THEN
        INSERT INTO goal_progress (goal_id, user_id, value, department)
        VALUES (v_goal.id, NEW.user_id, 1, v_department);
      ELSIF v_goal.unit = 'miles' AND NEW.distance > 0 THEN
        INSERT INTO goal_progress (goal_id, user_id, value, department)
        VALUES (v_goal.id, NEW.user_id, ROUND(NEW.distance), v_department);
      END IF;
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to log progress from activities
CREATE TRIGGER log_goal_progress_trigger
AFTER INSERT ON activities
FOR EACH ROW
EXECUTE FUNCTION log_goal_progress();

-- Create function to check and deactivate expired goals
CREATE OR REPLACE FUNCTION deactivate_expired_goals()
RETURNS void AS $$
BEGIN
  UPDATE collaborative_goals
  SET is_active = false
  WHERE is_active = true
  AND end_date < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create indexes
CREATE INDEX idx_collaborative_goals_department ON collaborative_goals(department);
CREATE INDEX idx_collaborative_goals_active ON collaborative_goals(is_active);
CREATE INDEX idx_collaborative_goals_dates ON collaborative_goals(start_date, end_date);
CREATE INDEX idx_goal_participants_goal_id ON goal_participants(goal_id);
CREATE INDEX idx_goal_participants_user_id ON goal_participants(user_id);
CREATE INDEX idx_goal_progress_goal_id ON goal_progress(goal_id);
CREATE INDEX idx_goal_progress_user_id ON goal_progress(user_id);
CREATE INDEX idx_goal_progress_department ON goal_progress(department);