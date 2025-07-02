-- Create push_tokens table
CREATE TABLE IF NOT EXISTS push_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, platform)
);

-- Add notification preferences to user_preferences
ALTER TABLE user_preferences
ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS daily_reminders BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS achievement_alerts BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS challenge_updates BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS social_activity BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS reminder_time TEXT DEFAULT '09:00';

-- Create notifications log table
CREATE TABLE IF NOT EXISTS notification_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ
);

-- Add RLS policies
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

-- Push tokens policies
CREATE POLICY "Users can manage their own push tokens"
  ON push_tokens
  FOR ALL
  USING (auth.uid() = user_id);

-- Notification logs policies
CREATE POLICY "Users can view their own notification logs"
  ON notification_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create function to send push notification
CREATE OR REPLACE FUNCTION send_push_notification(
  p_user_id UUID,
  p_title TEXT,
  p_body TEXT,
  p_type TEXT,
  p_data JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  -- Log the notification
  INSERT INTO notification_logs (user_id, type, title, body, data)
  VALUES (p_user_id, p_type, p_title, p_body, p_data)
  RETURNING id INTO v_notification_id;

  -- In a real implementation, this would trigger an edge function
  -- to send the actual push notification via FCM/APNs
  
  RETURN v_notification_id;
END;
$$;

-- Create indexes
CREATE INDEX idx_push_tokens_user_id ON push_tokens(user_id);
CREATE INDEX idx_notification_logs_user_id ON notification_logs(user_id);
CREATE INDEX idx_notification_logs_sent_at ON notification_logs(sent_at);

-- Add health platform columns to user_preferences
ALTER TABLE user_preferences
ADD COLUMN IF NOT EXISTS health_platform TEXT,
ADD COLUMN IF NOT EXISTS health_permissions_granted BOOLEAN DEFAULT false;

-- Add health sync tracking to user_stats
ALTER TABLE user_stats
ADD COLUMN IF NOT EXISTS last_sync TIMESTAMPTZ;