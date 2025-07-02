-- Create department_settings table
CREATE TABLE public.department_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  department_name TEXT NOT NULL UNIQUE,
  max_size INTEGER NOT NULL DEFAULT 100,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.department_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage department settings"
ON public.department_settings
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  )
);

CREATE POLICY "Users can view department settings"
ON public.department_settings
FOR SELECT
USING (is_active = true);

-- Add trigger for updated_at
CREATE TRIGGER update_department_settings_updated_at
  BEFORE UPDATE ON public.department_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default departments with size limits
INSERT INTO public.department_settings (department_name, max_size) VALUES
('Engineering', 100),
('Marketing', 100),
('Sales', 100),
('Design', 100),
('Operations', 100),
('Human Resources', 100),
('Finance', 100);