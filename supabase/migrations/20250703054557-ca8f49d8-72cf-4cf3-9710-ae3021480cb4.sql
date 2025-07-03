-- Add unique constraint to activity_patterns table to support ON CONFLICT
ALTER TABLE public.activity_patterns 
ADD CONSTRAINT activity_patterns_user_pattern_period_unique 
UNIQUE (user_id, pattern_type, period_start);