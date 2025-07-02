-- Update existing profile with default department
UPDATE profiles 
SET 
  department = 'Engineering',
  name = 'Test User'
WHERE department IS NULL OR name IS NULL;