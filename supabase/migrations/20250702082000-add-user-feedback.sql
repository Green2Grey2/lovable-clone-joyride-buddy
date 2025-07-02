-- Create user feedback table
CREATE TABLE IF NOT EXISTS user_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('bug', 'feature', 'general')),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  message TEXT NOT NULL,
  page_url TEXT,
  user_agent TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'closed')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;

-- User feedback policies
CREATE POLICY "Users can create their own feedback"
  ON user_feedback
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can view their own feedback"
  ON user_feedback
  FOR SELECT
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

CREATE POLICY "Admins can view all feedback"
  ON user_feedback
  FOR ALL
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Managers can view and update feedback"
  ON user_feedback
  FOR SELECT
  USING (has_role(auth.uid(), 'manager'));

CREATE POLICY "Managers can update feedback status"
  ON user_feedback
  FOR UPDATE
  USING (has_role(auth.uid(), 'manager'))
  WITH CHECK (has_role(auth.uid(), 'manager'));

-- Create feedback analytics view
CREATE VIEW feedback_analytics AS
SELECT 
  type,
  COUNT(*) as count,
  AVG(rating) as avg_rating,
  COUNT(CASE WHEN status = 'new' THEN 1 END) as new_count,
  COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_count,
  COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_count,
  COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed_count
FROM user_feedback
GROUP BY type;

-- Grant access to the view
GRANT SELECT ON feedback_analytics TO authenticated;

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION update_feedback_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for timestamp update
CREATE TRIGGER update_feedback_timestamp
BEFORE UPDATE ON user_feedback
FOR EACH ROW
EXECUTE FUNCTION update_feedback_timestamp();

-- Create indexes
CREATE INDEX idx_user_feedback_user_id ON user_feedback(user_id);
CREATE INDEX idx_user_feedback_type ON user_feedback(type);
CREATE INDEX idx_user_feedback_status ON user_feedback(status);
CREATE INDEX idx_user_feedback_created_at ON user_feedback(created_at DESC);