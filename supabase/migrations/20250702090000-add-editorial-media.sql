-- Migration: Add Editorial Media System
-- This creates the editorial_media table referenced by GlobalSearch and Editorial pages

-- Create editorial_media table
CREATE TABLE IF NOT EXISTS editorial_media (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('workout', 'nutrition', 'wellness', 'mindfulness', 'recovery', 'news')),
  content_type TEXT NOT NULL CHECK (content_type IN ('article', 'video', 'podcast')),
  featured_image TEXT,
  video_url TEXT,
  content TEXT, -- For articles
  duration INTEGER, -- For videos/podcasts in seconds
  author TEXT NOT NULL,
  tags TEXT[],
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE editorial_media ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Published media visible to all"
  ON editorial_media
  FOR SELECT
  USING (is_published = true);

CREATE POLICY "Editors can manage all media"
  ON editorial_media
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role IN ('admin', 'manager')
    )
  );

-- Indexes for search performance
CREATE INDEX idx_editorial_media_search ON editorial_media 
  USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '') || ' ' || COALESCE(category, '')));

CREATE INDEX idx_editorial_media_published ON editorial_media(is_published, published_at DESC);
CREATE INDEX idx_editorial_media_category ON editorial_media(category, is_published);

-- Create a view for the Apple News-style media feed
CREATE VIEW media_feed AS
SELECT 
  id,
  title,
  description,
  category,
  content_type,
  featured_image,
  video_url,
  author,
  tags,
  published_at,
  view_count,
  CASE 
    WHEN published_at > NOW() - INTERVAL '24 hours' THEN 'featured'
    WHEN view_count > 1000 THEN 'hero'
    WHEN published_at > NOW() - INTERVAL '7 days' THEN 'recent'
    ELSE 'standard'
  END as display_type,
  EXTRACT(EPOCH FROM (NOW() - published_at))/3600 as hours_ago
FROM editorial_media
WHERE is_published = true
ORDER BY published_at DESC;

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_media_view(media_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE editorial_media 
  SET view_count = view_count + 1 
  WHERE id = media_id AND is_published = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to publish media
CREATE OR REPLACE FUNCTION publish_media(media_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE editorial_media 
  SET 
    is_published = true,
    published_at = NOW()
  WHERE id = media_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_media_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_editorial_media_timestamp
  BEFORE UPDATE ON editorial_media
  FOR EACH ROW
  EXECUTE FUNCTION update_media_timestamp();

-- Insert sample content (optional - remove in production)
INSERT INTO editorial_media (
  created_by, 
  title, 
  description, 
  category, 
  content_type, 
  featured_image,
  content,
  author,
  tags,
  is_published,
  published_at
) VALUES 
(
  (SELECT id FROM auth.users LIMIT 1),
  'Getting Started with Your Fitness Journey',
  'A comprehensive guide to beginning your wellness transformation',
  'wellness',
  'article',
  '/placeholder.svg',
  'Start your fitness journey with these essential tips...',
  'Wellness Team',
  ARRAY['beginner', 'motivation', 'tips'],
  true,
  NOW()
),
(
  (SELECT id FROM auth.users LIMIT 1),
  '10-Minute Morning Workout',
  'Quick and effective exercises to start your day',
  'workout',
  'video',
  '/placeholder.svg',
  '',
  'Fitness Coach',
  ARRAY['morning', 'quick', 'workout'],
  true,
  NOW() - INTERVAL '1 day'
);

-- Grant permissions for RPC functions
GRANT EXECUTE ON FUNCTION increment_media_view TO authenticated;
GRANT EXECUTE ON FUNCTION publish_media TO authenticated;