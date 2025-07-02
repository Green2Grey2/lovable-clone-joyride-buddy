-- Insert test users into profiles table
INSERT INTO profiles (user_id, name, email, department, height_cm, weight_kg, fitness_level, avatar_url) VALUES
('ec41840f-0f99-4238-a728-3ba777b2d105', 'Alex Johnson', 'test@test.com', 'Engineering', 175, 70, 'intermediate', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400'),
('550e8400-e29b-41d4-a716-446655440001', 'Sarah Chen', 'sarah@example.com', 'Marketing', 165, 60, 'advanced', 'https://images.unsplash.com/photo-1494790108755-2616b612b47b?w=400'),
('550e8400-e29b-41d4-a716-446655440002', 'Mike Rodriguez', 'mike@example.com', 'Sales', 180, 85, 'beginner', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'),
('550e8400-e29b-41d4-a716-446655440003', 'Lisa Park', 'lisa@example.com', 'Design', 170, 65, 'intermediate', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400'),
('550e8400-e29b-41d4-a716-446655440004', 'David Kim', 'david@example.com', 'Engineering', 178, 75, 'advanced', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400');

-- Insert user stats
INSERT INTO user_stats (user_id, today_steps, weekly_steps, calories_burned, current_streak, weekly_goal_steps, weekly_goal_calories, last_activity_date) VALUES
('ec41840f-0f99-4238-a728-3ba777b2d105', 12500, 65000, 2800, 7, 70000, 3500, CURRENT_DATE),
('550e8400-e29b-41d4-a716-446655440001', 15200, 78000, 3200, 12, 70000, 3500, CURRENT_DATE),
('550e8400-e29b-41d4-a716-446655440002', 8500, 45000, 1800, 3, 70000, 3500, CURRENT_DATE - 1),
('550e8400-e29b-41d4-a716-446655440003', 11800, 72000, 2500, 9, 70000, 3500, CURRENT_DATE),
('550e8400-e29b-41d4-a716-446655440004', 18500, 89000, 4100, 15, 70000, 3500, CURRENT_DATE);

-- Insert activities for the past 2 weeks with varied data
INSERT INTO activities (user_id, type, steps, duration, calories_burned, distance, date, heart_rate_avg, heart_rate_max) VALUES
-- Alex Johnson activities (past 14 days)
('ec41840f-0f99-4238-a728-3ba777b2d105', 'walking', 12000, 45, 400, 8.5, CURRENT_DATE, 120, 140),
('ec41840f-0f99-4238-a728-3ba777b2d105', 'running', 8500, 30, 350, 5.2, CURRENT_DATE - 1, 155, 175),
('ec41840f-0f99-4238-a728-3ba777b2d105', 'cycling', 15000, 60, 500, 18.0, CURRENT_DATE - 2, 140, 160),
('ec41840f-0f99-4238-a728-3ba777b2d105', 'walking', 10500, 40, 320, 7.2, CURRENT_DATE - 3, 110, 130),
('ec41840f-0f99-4238-a728-3ba777b2d105', 'running', 9200, 35, 380, 6.1, CURRENT_DATE - 4, 150, 170),
('ec41840f-0f99-4238-a728-3ba777b2d105', 'walking', 11800, 42, 360, 8.0, CURRENT_DATE - 5, 115, 135),
('ec41840f-0f99-4238-a728-3ba777b2d105', 'strength', 3500, 45, 280, 0, CURRENT_DATE - 6, 130, 150),

-- Sarah Chen activities (high performer)
('550e8400-e29b-41d4-a716-446655440001', 'running', 18500, 55, 650, 12.0, CURRENT_DATE, 165, 185),
('550e8400-e29b-41d4-a716-446655440001', 'cycling', 22000, 75, 720, 25.0, CURRENT_DATE - 1, 145, 165),
('550e8400-e29b-41d4-a716-446655440001', 'running', 16800, 50, 580, 10.5, CURRENT_DATE - 2, 160, 180),
('550e8400-e29b-41d4-a716-446655440001', 'swimming', 8000, 40, 450, 2.0, CURRENT_DATE - 3, 140, 155),
('550e8400-e29b-41d4-a716-446655440001', 'running', 19200, 58, 680, 12.8, CURRENT_DATE - 4, 170, 190),
('550e8400-e29b-41d4-a716-446655440001', 'yoga', 2500, 60, 200, 0, CURRENT_DATE - 5, 100, 120),
('550e8400-e29b-41d4-a716-446655440001', 'cycling', 20500, 70, 650, 22.0, CURRENT_DATE - 6, 150, 170),

-- Mike Rodriguez activities (beginner, inconsistent)
('550e8400-e29b-41d4-a716-446655440002', 'walking', 6500, 25, 200, 4.5, CURRENT_DATE - 1, 105, 125),
('550e8400-e29b-41d4-a716-446655440002', 'walking', 7200, 30, 240, 5.0, CURRENT_DATE - 2, 110, 130),
('550e8400-e29b-41d4-a716-446655440002', 'walking', 5800, 22, 180, 4.0, CURRENT_DATE - 4, 100, 120),
('550e8400-e29b-41d4-a716-446655440002', 'cycling', 8500, 35, 280, 8.0, CURRENT_DATE - 7, 120, 140),

-- Lisa Park activities (consistent intermediate)
('550e8400-e29b-41d4-a716-446655440003', 'walking', 11200, 40, 350, 7.8, CURRENT_DATE, 118, 138),
('550e8400-e29b-41d4-a716-446655440003', 'yoga', 3000, 50, 180, 0, CURRENT_DATE - 1, 95, 110),
('550e8400-e29b-41d4-a716-446655440003', 'running', 12500, 40, 420, 7.5, CURRENT_DATE - 2, 145, 165),
('550e8400-e29b-41d4-a716-446655440003', 'walking', 10800, 38, 320, 7.2, CURRENT_DATE - 3, 115, 135),
('550e8400-e29b-41d4-a716-446655440003', 'strength', 4200, 45, 250, 0, CURRENT_DATE - 4, 125, 145),
('550e8400-e29b-41d4-a716-446655440003', 'walking', 11500, 42, 360, 8.0, CURRENT_DATE - 5, 120, 140),
('550e8400-e29b-41d4-a716-446655440003', 'cycling', 14000, 55, 480, 15.0, CURRENT_DATE - 6, 135, 155),

-- David Kim activities (advanced, very active)
('550e8400-e29b-41d4-a716-446655440004', 'running', 21000, 65, 750, 15.0, CURRENT_DATE, 160, 180),
('550e8400-e29b-41d4-a716-446655440004', 'strength', 5500, 60, 380, 0, CURRENT_DATE - 1, 140, 160),
('550e8400-e29b-41d4-a716-446655440004', 'cycling', 25000, 80, 820, 28.0, CURRENT_DATE - 2, 155, 175),
('550e8400-e29b-41d4-a716-446655440004', 'running', 19500, 60, 690, 13.5, CURRENT_DATE - 3, 165, 185),
('550e8400-e29b-41d4-a716-446655440004', 'swimming', 12000, 50, 550, 2.5, CURRENT_DATE - 4, 145, 165),
('550e8400-e29b-41d4-a716-446655440004', 'running', 22500, 68, 800, 16.0, CURRENT_DATE - 5, 170, 190),
('550e8400-e29b-41d4-a716-446655440004', 'strength', 6000, 65, 420, 0, CURRENT_DATE - 6, 135, 155);

-- Insert some heart rate data for detailed tracking
INSERT INTO heart_rate_data (user_id, heart_rate, timestamp, zone) VALUES
('ec41840f-0f99-4238-a728-3ba777b2d105', 120, NOW() - INTERVAL '1 hour', 'cardio'),
('ec41840f-0f99-4238-a728-3ba777b2d105', 140, NOW() - INTERVAL '30 minutes', 'cardio'),
('550e8400-e29b-41d4-a716-446655440001', 165, NOW() - INTERVAL '2 hours', 'peak'),
('550e8400-e29b-41d4-a716-446655440001', 180, NOW() - INTERVAL '90 minutes', 'peak'),
('550e8400-e29b-41d4-a716-446655440004', 160, NOW() - INTERVAL '3 hours', 'cardio'),
('550e8400-e29b-41d4-a716-446655440004', 175, NOW() - INTERVAL '2.5 hours', 'peak');

-- Insert some social activities for the feed
INSERT INTO social_activities (user_id, type, title, description, data) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'achievement', 'New Personal Record! 🏆', 'Just ran 12.8km - my longest distance yet!', '{"distance": 12.8, "activity_type": "running"}'),
('ec41840f-0f99-4238-a728-3ba777b2d105', 'streak_achievement', '7-Day Streak! 🔥', 'Maintained consistency for 7 days straight', '{"streak_days": 7, "milestone_reached": 7}'),
('550e8400-e29b-41d4-a716-446655440004', 'step_milestone', 'Crushed 20K Steps! 👟', 'Hit an amazing 21,000 steps today', '{"steps": 21000, "milestone": 20000}'),
('550e8400-e29b-41d4-a716-446655440003', 'achievement', 'Consistency Champion! 💪', 'Completed 9 days of activities this week', '{"days_active": 9, "achievement_type": "consistency"}'),
('550e8400-e29b-41d4-a716-446655440001', 'step_milestone', 'Amazing Cycling Session! 🚴‍♀️', 'Covered 25km on the bike today', '{"distance": 25, "activity_type": "cycling"}');

-- Insert some workout insights
INSERT INTO workout_insights (user_id, insight_type, title, description, priority, actionable) VALUES
('ec41840f-0f99-4238-a728-3ba777b2d105', 'achievement', '7-Day Streak! 🔥', 'Amazing consistency! You''re building a strong habit. Keep it up!', 2, false),
('550e8400-e29b-41d4-a716-446655440002', 'suggestion', 'Step Count Opportunity', 'Adding a 15-minute walk after lunch could boost your daily steps by 2,000.', 3, true),
('550e8400-e29b-41d4-a716-446655440001', 'achievement', 'Performance Beast! 💪', 'Your running pace has improved by 15% this month. Outstanding progress!', 1, false),
('550e8400-e29b-41d4-a716-446655440003', 'suggestion', 'Heart Rate Zone Training', 'Try spending more time in your cardio zone (140-160 bpm) for better endurance.', 3, true),
('550e8400-e29b-41d4-a716-446655440004', 'achievement', '15-Day Streak! 🔥', 'Incredible dedication! You''re in the top 5% of users. Amazing work!', 1, false);