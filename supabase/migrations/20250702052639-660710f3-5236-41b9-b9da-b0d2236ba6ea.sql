-- Add missing user_sessions table for active users tracking
CREATE TABLE public.user_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  last_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  page_path TEXT,
  user_agent TEXT,
  ip_address TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add missing columns to user_stats
ALTER TABLE public.user_stats 
ADD COLUMN calories_burned INTEGER DEFAULT 0,
ADD COLUMN heart_rate INTEGER DEFAULT 0,
ADD COLUMN last_updated TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Add missing user_preferences table
CREATE TABLE public.user_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'system',
  language TEXT DEFAULT 'en',
  notifications_enabled BOOLEAN DEFAULT true,
  sound_enabled BOOLEAN DEFAULT true,
  haptic_enabled BOOLEAN DEFAULT true,
  privacy_mode BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_sessions
CREATE POLICY "Users can view their own sessions" ON public.user_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions" ON public.user_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions" ON public.user_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for user_preferences
CREATE POLICY "Users can view their own preferences" ON public.user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON public.user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" ON public.user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Add triggers for timestamp updates
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function for updating user sessions
CREATE OR REPLACE FUNCTION public.update_user_session(_user_id UUID, _session_id TEXT, _page_path TEXT, _user_agent TEXT)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.user_sessions (user_id, session_id, page_path, user_agent, last_seen)
  VALUES (_user_id, _session_id, _page_path, _user_agent, now())
  ON CONFLICT (user_id, session_id) 
  DO UPDATE SET
    last_seen = now(),
    page_path = _page_path,
    user_agent = _user_agent,
    is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the new user trigger to also create preferences
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name'),
    NEW.email
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  INSERT INTO public.user_stats (user_id)
  VALUES (NEW.id);
  
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;