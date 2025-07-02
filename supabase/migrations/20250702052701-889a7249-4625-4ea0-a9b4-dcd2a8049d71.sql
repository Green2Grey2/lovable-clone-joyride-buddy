-- Add unique constraint for user sessions
ALTER TABLE public.user_sessions 
ADD CONSTRAINT unique_user_session UNIQUE (user_id, session_id);