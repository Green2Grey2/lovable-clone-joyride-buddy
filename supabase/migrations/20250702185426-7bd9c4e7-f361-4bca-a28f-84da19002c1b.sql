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

-- Insert default achievements for daily, weekly, monthly, yearly, and lifetime categories
INSERT INTO public.achievements (name, description, category, icon, points, criteria, is_active) VALUES
-- Daily Progressive Achievements
('First Steps', 'Complete your first 1,000 steps in a day', 'daily', '👶', 10, '{"type": "daily_steps", "target": 1000}', true),
('Getting Started', 'Walk 2,500 steps in a day', 'daily', '🚶', 15, '{"type": "daily_steps", "target": 2500}', true),
('Daily Walker', 'Reach 5,000 steps in a day', 'daily', '🚶‍♂️', 25, '{"type": "daily_steps", "target": 5000}', true),
('Daily Hiker', 'Complete 7,500 steps in a day', 'daily', '🥾', 35, '{"type": "daily_steps", "target": 7500}', true),
('Step Champion', 'Achieve 10,000 steps in a day', 'daily', '🏆', 50, '{"type": "daily_steps", "target": 10000}', true),
('Super Walker', 'Complete 12,500 steps in a day', 'daily', '💪', 75, '{"type": "daily_steps", "target": 12500}', true),
('Marathon Walker', 'Walk 15,000+ steps in a day', 'daily', '🌟', 100, '{"type": "daily_steps", "target": 15000}', true),

-- Weekly Progressive Achievements  
('Week Starter', 'Complete 7 days of activity', 'weekly', '📅', 50, '{"type": "weekly_steps", "target": 35000}', true),
('Week Warrior', 'Maintain 7-day activity streak', 'weekly', '🔥', 75, '{"type": "streak", "target": 7}', true),
('Weekly Champion', 'Complete 50,000 steps in a week', 'weekly', '👑', 100, '{"type": "weekly_steps", "target": 50000}', true),
('Week Dominator', 'Achieve 70,000+ steps in a week', 'weekly', '💎', 150, '{"type": "weekly_steps", "target": 70000}', true),

-- Monthly Progressive Achievements
('Monthly Milestone', 'Complete 150,000 steps in a month', 'monthly', '🗓️', 200, '{"type": "monthly_steps", "target": 150000}', true),
('Monthly Master', 'Maintain 30-day activity streak', 'monthly', '🏅', 250, '{"type": "streak", "target": 30}', true),
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

-- Streak-based Progressive Achievements
('Streak Starter', 'Maintain 3-day activity streak', 'streak', '🔥', 30, '{"type": "streak", "target": 3}', true),
('Consistency Builder', 'Maintain 14-day activity streak', 'streak', '📈', 100, '{"type": "streak", "target": 14}', true),
('Fortnight Fighter', 'Complete 14-day streak', 'streak', '⚔️', 150, '{"type": "streak", "target": 14}', true),
('Consistency King', 'Maintain 60-day activity streak', 'streak', '👑', 500, '{"type": "streak", "target": 60}', true),
('Century Club', 'Achieve 100-day activity streak', 'streak', '💯', 1000, '{"type": "streak", "target": 100}', true);

-- Insert some default challenges
INSERT INTO public.challenges (title, description, type, start_date, end_date, target_value, created_by, is_active) VALUES
('Weekly Step Challenge', 'Complete 50,000 steps this week', 'steps', CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days', 50000, (SELECT user_id FROM profiles LIMIT 1), true),
('Monthly Distance Challenge', 'Walk 100 miles this month', 'distance', DATE_TRUNC('month', CURRENT_DATE), DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day', 100, (SELECT user_id FROM profiles LIMIT 1), true);

-- Create function to update user streak intelligently
CREATE OR REPLACE FUNCTION public.update_intelligent_streak(p_user_id uuid, p_current_date date)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  last_activity_date DATE;
  current_streak INTEGER;
  avg_streak INTEGER;
  reset_count INTEGER;
BEGIN
  -- Get current user stats
  SELECT 
    last_activity_date, 
    current_streak, 
    average_streak_length,
    streak_resets
  INTO 
    last_activity_date, 
    current_streak, 
    avg_streak,
    reset_count
  FROM public.user_stats 
  WHERE user_id = p_user_id;

  -- If user hasn't been active for more than 1 day
  IF last_activity_date IS NULL OR last_activity_date < p_current_date - INTERVAL '1 day' THEN
    -- Calculate new average streak length before resetting
    IF current_streak > 0 THEN
      -- Update average streak calculation
      UPDATE public.user_stats 
      SET 
        average_streak_length = CASE 
          WHEN average_streak_length = 0 THEN current_streak
          ELSE (average_streak_length + current_streak) / 2
        END,
        streak_resets = streak_resets + 1,
        current_streak = 0,
        longest_streak = GREATEST(longest_streak, current_streak)
      WHERE user_id = p_user_id;
    END IF;
  ELSE
    -- Continue or start streak
    UPDATE public.user_stats 
    SET 
      current_streak = current_streak + 1,
      longest_streak = GREATEST(longest_streak, current_streak + 1),
      last_activity_date = p_current_date
    WHERE user_id = p_user_id;
  END IF;
END;
$function$;

-- Create function to update monthly and yearly step totals
CREATE OR REPLACE FUNCTION public.update_step_totals()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $function$
BEGIN
  -- Update monthly and yearly totals when daily steps change
  UPDATE public.user_stats
  SET 
    monthly_steps = (
      SELECT COALESCE(SUM(steps), 0)
      FROM public.activities
      WHERE user_id = NEW.user_id 
        AND date >= DATE_TRUNC('month', CURRENT_DATE)
        AND date < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
    ),
    yearly_steps = (
      SELECT COALESCE(SUM(steps), 0)
      FROM public.activities
      WHERE user_id = NEW.user_id 
        AND date >= DATE_TRUNC('year', CURRENT_DATE)
        AND date < DATE_TRUNC('year', CURRENT_DATE) + INTERVAL '1 year'
    ),
    lifetime_steps = (
      SELECT COALESCE(SUM(steps), 0)
      FROM public.activities
      WHERE user_id = NEW.user_id
    )
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$function$;

-- Create trigger to update step totals when activities are updated
DROP TRIGGER IF EXISTS update_step_totals_trigger ON public.activities;
CREATE TRIGGER update_step_totals_trigger
  AFTER INSERT OR UPDATE OF steps ON public.activities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_step_totals();