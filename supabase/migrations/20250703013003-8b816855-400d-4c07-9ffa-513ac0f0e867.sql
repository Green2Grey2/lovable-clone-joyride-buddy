-- Phase 3: Add verification fields to activities table
ALTER TABLE activities 
ADD COLUMN verification_image_url TEXT,
ADD COLUMN verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN verified_by UUID;

-- Create verification history table
CREATE TABLE verification_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID REFERENCES activities(id),
  user_id UUID NOT NULL,
  action VARCHAR(20), -- 'uploaded', 'verified', 'rejected'
  image_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on verification_history
ALTER TABLE verification_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for verification_history
CREATE POLICY "Users can view their own verification history"
ON verification_history FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own verification history"
ON verification_history FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create storage bucket for verification images
INSERT INTO storage.buckets (id, name, public)
VALUES ('verification-images', 'verification-images', false);

-- Add storage policies
CREATE POLICY "Users can upload own verification images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'verification-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own verification images"
ON storage.objects FOR SELECT
USING (bucket_id = 'verification-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own verification images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'verification-images' AND auth.uid()::text = (storage.foldername(name))[1]);