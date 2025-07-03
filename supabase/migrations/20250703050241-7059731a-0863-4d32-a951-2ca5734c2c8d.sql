-- Create a simple daily_steps table to track steps without conflicts
CREATE TABLE IF NOT EXISTS public.daily_steps (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  steps integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Enable RLS
ALTER TABLE public.daily_steps ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own daily steps"
  ON public.daily_steps FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily steps"
  ON public.daily_steps FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily steps"
  ON public.daily_steps FOR UPDATE
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_daily_steps_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_daily_steps_updated_at
  BEFORE UPDATE ON public.daily_steps
  FOR EACH ROW
  EXECUTE FUNCTION public.update_daily_steps_updated_at();