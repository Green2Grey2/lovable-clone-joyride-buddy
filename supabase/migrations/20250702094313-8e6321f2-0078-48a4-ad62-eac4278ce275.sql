-- Insert test users into profiles table (avoid duplicates)
INSERT INTO profiles (user_id, name, email, department, height_cm, weight_kg, fitness_level, avatar_url) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Sarah Chen', 'sarah@example.com', 'Marketing', 165, 60, 'advanced', 'https://images.unsplash.com/photo-1494790108755-2616b612b47b?w=400'),
('550e8400-e29b-41d4-a716-446655440002', 'Mike Rodriguez', 'mike@example.com', 'Sales', 180, 85, 'beginner', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'),
('550e8400-e29b-41d4-a716-446655440003', 'Lisa Park', 'lisa@example.com', 'Design', 170, 65, 'intermediate', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400'),
('550e8400-e29b-41d4-a716-446655440004', 'David Kim', 'david@example.com', 'Engineering', 178, 75, 'advanced', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400')
ON CONFLICT (user_id) DO NOTHING;

-- Update existing user profile with more data
UPDATE profiles SET 
  department = 'Engineering',
  height_cm = 175,
  weight_kg = 70,
  fitness_level = 'intermediate',
  avatar_url = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400'
WHERE user_id = 'ec41840f-0f99-4238-a728-3ba777b2d105';

-- Insert user stats (avoid duplicates)
INSERT INTO user_stats (user_id, today_steps, weekly_steps, calories_burned, current_streak, weekly_goal_steps, weekly_goal_calories, last_activity_date) VALUES
('ec41840f-0f99-4238-a728-3ba777b2d105', 12500, 65000, 2800, 7, 70000, 3500, CURRENT_DATE),
('550e8400-e29b-41d4-a716-446655440001', 15200, 78000, 3200, 12, 70000, 3500, CURRENT_DATE),
('550e8400-e29b-41d4-a716-446655440002', 8500, 45000, 1800, 3, 70000, 3500, CURRENT_DATE - 1),
('550e8400-e29b-41d4-a716-446655440003', 11800, 72000, 2500, 9, 70000, 3500, CURRENT_DATE),
('550e8400-e29b-41d4-a716-446655440004', 18500, 89000, 4100, 15, 70000, 3500, CURRENT_DATE)
ON CONFLICT (user_id) DO UPDATE SET
  today_steps = EXCLUDED.today_steps,
  weekly_steps = EXCLUDED.weekly_steps,
  calories_burned = EXCLUDED.calories_burned,
  current_streak = EXCLUDED.current_streak,
  last_activity_date = EXCLUDED.last_activity_date;