-- First, drop the existing check constraint to allow more categories
ALTER TABLE public.achievements DROP CONSTRAINT IF EXISTS achievements_category_check;

-- Add a new constraint that includes our new categories
ALTER TABLE public.achievements ADD CONSTRAINT achievements_category_check 
CHECK (category = ANY (ARRAY['streak', 'milestone', 'challenge', 'special', 'daily', 'weekly', 'monthly', 'yearly', 'lifetime']));

-- Add user goal preferences to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS daily_step_goal INTEGER DEFAULT 5000,
ADD COLUMN IF NOT EXISTS weekly_step_goal INTEGER DEFAULT 35000,
ADD COLUMN IF NOT EXISTS monthly_step_goal INTEGER DEFAULT 150000;

-- Add streak tracking to user_stats
ALTER TABLE public.user_stats
ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS average_streak_length INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS streak_resets INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS monthly_steps INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS yearly_steps INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS lifetime_steps INTEGER DEFAULT 0;

-- Insert new achievements that don't already exist
INSERT INTO public.achievements (name, description, category, icon, points, criteria, is_active) VALUES
-- Daily Progressive Achievements
('Getting Started', 'Walk 2,500 steps in a day', 'daily', '🚶', 15, '{"type": "daily_steps", "target": 2500}', true),
('Daily Walker', 'Reach 5,000 steps in a day', 'daily', '🚶‍♂️', 25, '{"type": "daily_steps", "target": 5000}', true),
('Daily Hiker', 'Complete 7,500 steps in a day', 'daily', '🥾', 35, '{"type": "daily_steps", "target": 7500}', true),
('Super Walker', 'Complete 12,500 steps in a day', 'daily', '💪', 75, '{"type": "daily_steps", "target": 12500}', true),

-- Weekly Progressive Achievements  
('Week Starter', 'Complete 7 days of activity', 'weekly', '📅', 50, '{"type": "weekly_steps", "target": 35000}', true),
('Weekly Champion', 'Complete 50,000 steps in a week', 'weekly', '👑', 100, '{"type": "weekly_steps", "target": 50000}', true),
('Week Dominator', 'Achieve 70,000+ steps in a week', 'weekly', '💎', 150, '{"type": "weekly_steps", "target": 70000}', true),

-- Monthly Progressive Achievements
('Monthly Milestone', 'Complete 150,000 steps in a month', 'monthly', '🗓️', 200, '{"type": "monthly_steps", "target": 150000}', true),
('Monthly Legend', 'Achieve 300,000+ steps in a month', 'monthly', '🌟', 400, '{"type": "monthly_steps", "target": 300000}', true),

-- Yearly Achievements
('Annual Achiever', 'Complete 1,000,000 steps in a year', 'yearly', '🎯', 500, '{"type": "yearly_steps", "target": 1000000}', true),
('Yearly Champion', 'Maintain 100-day streak', 'yearly', '🏆', 750, '{"type": "streak", "target": 100}', true),
('Annual Legend', 'Complete 2,000,000+ steps in a year', 'yearly', '👑', 1000, '{"type": "yearly_steps", "target": 2000000}', true),

-- Lifetime Progressive Achievements
('Fitness Journey Begins', 'Complete first 10,000 lifetime steps', 'lifetime', '🌱', 25, '{"type": "lifetime_steps", "target": 10000}', true),
('Walking Enthusiast', 'Reach 100,000 lifetime steps', 'lifetime', '🚶‍♀️', 100, '{"type": "lifetime_steps", "target": 100000}', true),
('Fitness Devotee', 'Achieve 500,000 lifetime steps', 'lifetime', '🏃', 250, '{"type": "lifetime_steps", "target": 500000}', true),
('Million Step Club', 'Complete 1,000,000 lifetime steps', 'lifetime', '💎', 500, '{"type": "lifetime_steps", "target": 1000000}', true),
('Fitness Legend', 'Reach 5,000,000 lifetime steps', 'lifetime', '🌟', 1000, '{"type": "lifetime_steps", "target": 5000000}', true),
('Walking Immortal', 'Achieve 10,000,000+ lifetime steps', 'lifetime', '👑', 2000, '{"type": "lifetime_steps", "target": 10000000}', true),

-- Additional Streak-based Progressive Achievements
('Streak Starter', 'Maintain 3-day activity streak', 'streak', '🔥', 30, '{"type": "streak", "target": 3}', true),
('Consistency Builder', 'Maintain 14-day activity streak', 'streak', '📈', 100, '{"type": "streak", "target": 14}', true);