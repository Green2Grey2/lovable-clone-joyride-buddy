
-- Create a table to track user activity/sessions
CREATE TABLE public.user_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_agent TEXT,
  ip_address INET,
  page_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Add index for faster queries on user_id and last_seen
CREATE INDEX idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX idx_user_sessions_last_seen ON public.user_sessions(last_seen);

-- Enable RLS
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Only admins can view session data
CREATE POLICY "Admins can view all sessions" 
  ON public.user_sessions 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  ));

-- Users can insert/update their own session data
CREATE POLICY "Users can manage their own sessions" 
  ON public.user_sessions 
  FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function to upsert user session (insert or update)
CREATE OR REPLACE FUNCTION public.update_user_session(
  p_user_id UUID,
  p_user_agent TEXT DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_page_path TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_sessions (user_id, user_agent, ip_address, page_path, last_seen)
  VALUES (p_user_id, p_user_agent, p_ip_address, p_page_path, now())
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    last_seen = now(),
    user_agent = COALESCE(EXCLUDED.user_agent, user_sessions.user_agent),
    ip_address = COALESCE(EXCLUDED.ip_address, user_sessions.ip_address),
    page_path = COALESCE(EXCLUDED.page_path, user_sessions.page_path);
END;
$$;
