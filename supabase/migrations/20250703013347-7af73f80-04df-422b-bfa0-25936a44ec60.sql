-- Phase 4: Add trust score system to profiles
ALTER TABLE profiles
ADD COLUMN trust_score INTEGER DEFAULT 0,
ADD COLUMN verifications_completed INTEGER DEFAULT 0,
ADD COLUMN auto_verify_enabled BOOLEAN DEFAULT false;

-- Create trust score calculation function
CREATE OR REPLACE FUNCTION calculate_user_trust_score(p_user_id UUID)
RETURNS INTEGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
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

-- Create trigger to update trust score when activities are updated
CREATE OR REPLACE FUNCTION update_trust_score_trigger()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Update trust score when verification status changes
  IF (TG_OP = 'UPDATE' AND OLD.verification_status != NEW.verification_status) OR
     (TG_OP = 'INSERT' AND NEW.verification_status IN ('verified', 'rejected')) THEN
    PERFORM calculate_user_trust_score(NEW.user_id);
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create the trigger
CREATE TRIGGER activities_trust_score_update
  AFTER INSERT OR UPDATE ON public.activities
  FOR EACH ROW
  EXECUTE FUNCTION update_trust_score_trigger();