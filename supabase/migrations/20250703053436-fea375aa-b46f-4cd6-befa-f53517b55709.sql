-- Remove the trigger function that's causing issues
DROP FUNCTION IF EXISTS public.update_trust_score_trigger() CASCADE;

-- Also clean up the calculate_user_trust_score function since we don't need the trust system for manual step tracking
DROP FUNCTION IF EXISTS public.calculate_user_trust_score(uuid) CASCADE;