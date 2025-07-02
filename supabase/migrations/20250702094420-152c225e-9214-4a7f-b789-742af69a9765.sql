-- Update existing user profile with more data
UPDATE profiles SET 
  department = 'Engineering',
  height_cm = 175,
  weight_kg = 70,
  fitness_level = 'intermediate',
  avatar_url = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400'
WHERE user_id = 'ec41840f-0f99-4238-a728-3ba777b2d105';

-- Update user stats for existing user
INSERT INTO user_stats (user_id, today_steps, weekly_steps, calories_burned, current_streak, weekly_goal_steps, weekly_goal_calories, last_activity_date) VALUES
('ec41840f-0f99-4238-a728-3ba777b2d105', 12500, 65000, 2800, 7, 70000, 3500, CURRENT_DATE)
ON CONFLICT (user_id) DO UPDATE SET
  today_steps = EXCLUDED.today_steps,
  weekly_steps = EXCLUDED.weekly_steps,
  calories_burned = EXCLUDED.calories_burned,
  current_streak = EXCLUDED.current_streak,
  last_activity_date = EXCLUDED.last_activity_date;

-- Insert varied activities for the past 30 days to test heat map and analytics
INSERT INTO activities (user_id, type, steps, duration, calories_burned, distance, date, heart_rate_avg, heart_rate_max) VALUES
-- Recent activities (past week)
('ec41840f-0f99-4238-a728-3ba777b2d105', 'walking', 12000, 45, 400, 8.5, CURRENT_DATE, 120, 140),
('ec41840f-0f99-4238-a728-3ba777b2d105', 'running', 8500, 30, 350, 5.2, CURRENT_DATE - 1, 155, 175),
('ec41840f-0f99-4238-a728-3ba777b2d105', 'cycling', 15000, 60, 500, 18.0, CURRENT_DATE - 2, 140, 160),
('ec41840f-0f99-4238-a728-3ba777b2d105', 'walking', 10500, 40, 320, 7.2, CURRENT_DATE - 3, 110, 130),
('ec41840f-0f99-4238-a728-3ba777b2d105', 'running', 9200, 35, 380, 6.1, CURRENT_DATE - 4, 150, 170),
('ec41840f-0f99-4238-a728-3ba777b2d105', 'walking', 11800, 42, 360, 8.0, CURRENT_DATE - 5, 115, 135),
('ec41840f-0f99-4238-a728-3ba777b2d105', 'strength', 3500, 45, 280, 0, CURRENT_DATE - 6, 130, 150),

-- Previous week
('ec41840f-0f99-4238-a728-3ba777b2d105', 'running', 14200, 50, 520, 9.8, CURRENT_DATE - 7, 165, 185),
('ec41840f-0f99-4238-a728-3ba777b2d105', 'cycling', 18500, 75, 620, 22.0, CURRENT_DATE - 8, 145, 165),
('ec41840f-0f99-4238-a728-3ba777b2d105', 'walking', 9800, 35, 290, 6.5, CURRENT_DATE - 9, 108, 125),
('ec41840f-0f99-4238-a728-3ba777b2d105', 'yoga', 2200, 60, 180, 0, CURRENT_DATE - 10, 95, 110),
('ec41840f-0f99-4238-a728-3ba777b2d105', 'running', 11500, 40, 410, 7.8, CURRENT_DATE - 11, 158, 178),
('ec41840f-0f99-4238-a728-3ba777b2d105', 'swimming', 6500, 35, 320, 1.5, CURRENT_DATE - 12, 135, 155),
('ec41840f-0f99-4238-a728-3ba777b2d105', 'strength', 4200, 50, 310, 0, CURRENT_DATE - 13, 125, 145),

-- Third week back
('ec41840f-0f99-4238-a728-3ba777b2d105', 'walking', 13500, 48, 450, 9.2, CURRENT_DATE - 14, 118, 138),
('ec41840f-0f99-4238-a728-3ba777b2d105', 'cycling', 20000, 80, 680, 24.5, CURRENT_DATE - 15, 148, 168),
('ec41840f-0f99-4238-a728-3ba777b2d105', 'running', 7800, 28, 280, 4.9, CURRENT_DATE - 16, 152, 172),
('ec41840f-0f99-4238-a728-3ba777b2d105', 'walking', 8900, 32, 260, 6.0, CURRENT_DATE - 17, 112, 132),
('ec41840f-0f99-4238-a728-3ba777b2d105', 'strength', 3800, 42, 270, 0, CURRENT_DATE - 18, 128, 148),
('ec41840f-0f99-4238-a728-3ba777b2d105', 'running', 16500, 58, 590, 11.2, CURRENT_DATE - 19, 162, 182),
('ec41840f-0f99-4238-a728-3ba777b2d105', 'yoga', 1800, 45, 140, 0, CURRENT_DATE - 20, 88, 105),

-- Fourth week back
('ec41840f-0f99-4238-a728-3ba777b2d105', 'walking', 10200, 38, 320, 7.1, CURRENT_DATE - 21, 115, 135),
('ec41840f-0f99-4238-a728-3ba777b2d105', 'cycling', 17800, 70, 580, 20.5, CURRENT_DATE - 22, 142, 162),
('ec41840f-0f99-4238-a728-3ba777b2d105', 'running', 12800, 45, 460, 8.5, CURRENT_DATE - 23, 160, 180),
('ec41840f-0f99-4238-a728-3ba777b2d105', 'swimming', 7200, 40, 380, 1.8, CURRENT_DATE - 24, 138, 158),
('ec41840f-0f99-4238-a728-3ba777b2d105', 'walking', 9500, 36, 300, 6.8, CURRENT_DATE - 25, 110, 130),
('ec41840f-0f99-4238-a728-3ba777b2d105', 'strength', 4500, 55, 350, 0, CURRENT_DATE - 26, 132, 152),
('ec41840f-0f99-4238-a728-3ba777b2d105', 'running', 13200, 48, 480, 8.9, CURRENT_DATE - 27, 158, 178),

-- More historical data for patterns
('ec41840f-0f99-4238-a728-3ba777b2d105', 'walking', 11000, 42, 370, 7.8, CURRENT_DATE - 28, 117, 137),
('ec41840f-0f99-4238-a728-3ba777b2d105', 'cycling', 19500, 78, 650, 23.0, CURRENT_DATE - 29, 146, 166),
('ec41840f-0f99-4238-a728-3ba777b2d105', 'running', 8200, 32, 310, 5.5, CURRENT_DATE - 30, 154, 174);

-- Insert some heart rate data for detailed tracking
INSERT INTO heart_rate_data (user_id, heart_rate, timestamp, zone) VALUES
('ec41840f-0f99-4238-a728-3ba777b2d105', 120, NOW() - INTERVAL '1 hour', 'cardio'),
('ec41840f-0f99-4238-a728-3ba777b2d105', 140, NOW() - INTERVAL '30 minutes', 'cardio'),
('ec41840f-0f99-4238-a728-3ba777b2d105', 165, NOW() - INTERVAL '2 hours', 'peak'),
('ec41840f-0f99-4238-a728-3ba777b2d105', 180, NOW() - INTERVAL '90 minutes', 'peak'),
('ec41840f-0f99-4238-a728-3ba777b2d105', 160, NOW() - INTERVAL '3 hours', 'cardio'),
('ec41840f-0f99-4238-a728-3ba777b2d105', 175, NOW() - INTERVAL '2.5 hours', 'peak'),
('ec41840f-0f99-4238-a728-3ba777b2d105', 110, NOW() - INTERVAL '4 hours', 'fat_burn'),
('ec41840f-0f99-4238-a728-3ba777b2d105', 95, NOW() - INTERVAL '5 hours', 'recovery');

-- Insert some social activities for the feed
INSERT INTO social_activities (user_id, type, title, description, data) VALUES
('ec41840f-0f99-4238-a728-3ba777b2d105', 'achievement', 'New Personal Record! 🏆', 'Just ran 11.2km - my longest distance this month!', '{"distance": 11.2, "activity_type": "running"}'),
('ec41840f-0f99-4238-a728-3ba777b2d105', 'streak_achievement', '7-Day Streak! 🔥', 'Maintained consistency for 7 days straight', '{"streak_days": 7, "milestone_reached": 7}'),
('ec41840f-0f99-4238-a728-3ba777b2d105', 'step_milestone', 'Crushed 20K Steps! 👟', 'Hit an amazing 20,000 steps on my cycling day', '{"steps": 20000, "milestone": 20000}'),
('ec41840f-0f99-4238-a728-3ba777b2d105', 'achievement', 'Consistency Champion! 💪', 'Completed 30 days of varied activities', '{"days_active": 30, "achievement_type": "consistency"}'),
('ec41840f-0f99-4238-a728-3ba777b2d105', 'step_milestone', 'Amazing Cycling Session! 🚴‍♀️', 'Covered 24.5km on the bike today', '{"distance": 24.5, "activity_type": "cycling"}');

-- Insert some workout insights
INSERT INTO workout_insights (user_id, insight_type, title, description, priority, actionable) VALUES
('ec41840f-0f99-4238-a728-3ba777b2d105', 'achievement', '7-Day Streak! 🔥', 'Amazing consistency! You''re building a strong habit. Keep it up!', 2, false),
('ec41840f-0f99-4238-a728-3ba777b2d105', 'suggestion', 'Heart Rate Zone Training', 'Try spending more time in your cardio zone (140-160 bpm) for better endurance.', 3, true),
('ec41840f-0f99-4238-a728-3ba777b2d105', 'achievement', 'Distance Champion! 💪', 'Your running distance has improved significantly this month. Great progress!', 1, false),
('ec41840f-0f99-4238-a728-3ba777b2d105', 'suggestion', 'Recovery Day Opportunity', 'Consider adding a yoga or light stretching day between intense workouts.', 3, true),
('ec41840f-0f99-4238-a728-3ba777b2d105', 'achievement', 'Variety Master! 🌟', 'You''ve tried 6 different activity types this month. Excellent diversity!', 2, false);