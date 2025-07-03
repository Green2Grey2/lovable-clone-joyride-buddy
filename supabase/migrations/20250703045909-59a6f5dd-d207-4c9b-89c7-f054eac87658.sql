-- Create the missing calculate_user_trust_score function
CREATE OR REPLACE FUNCTION public.calculate_user_trust_score(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  verified_count INTEGER;
  rejected_count INTEGER;
  calculated_trust_score INTEGER;
BEGIN
  -- Count verifications
  SELECT COUNT(*) INTO verified_count
  FROM public.activities
  WHERE user_id = p_user_id 
    AND verification_status = 'verified'
    AND verified_at IS NOT NULL;
    
  SELECT COUNT(*) INTO rejected_count
  FROM public.activities
  WHERE user_id = p_user_id 
    AND verification_status = 'rejected';
    
  -- Calculate score (verified - (rejected * 2))
  calculated_trust_score := GREATEST(0, verified_count - (rejected_count * 2));
  
  -- Update profile
  UPDATE public.profiles
  SET trust_score = calculated_trust_score,
      verifications_completed = verified_count,
      auto_verify_enabled = (calculated_trust_score >= 5)
  WHERE user_id = p_user_id;
  
  RETURN calculated_trust_score;
END;
$$;