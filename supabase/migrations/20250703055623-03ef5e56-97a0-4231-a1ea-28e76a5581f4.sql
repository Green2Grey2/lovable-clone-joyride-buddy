-- Update social_activities type constraint to include activity_completion
ALTER TABLE public.social_activities 
DROP CONSTRAINT social_activities_type_check;

ALTER TABLE public.social_activities 
ADD CONSTRAINT social_activities_type_check 
CHECK (type = ANY (ARRAY[
  'step_milestone'::text, 
  'streak_achievement'::text, 
  'goal_completion'::text, 
  'challenge_join'::text, 
  'achievement'::text, 
  'activity_log'::text,
  'activity_completion'::text
]));