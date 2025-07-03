import { supabase } from '@/integrations/supabase/client';
import { healthDataService } from './healthDataService';
import { toast } from 'sonner';

export interface ActivityData {
  type: string;
  steps?: number;
  duration?: number;
  calories?: number;
  distance?: number;
  heartRate?: number;
  notes?: string;
}

/**
 * Comprehensive activity tracking service that integrates with health sync
 */
export class ActivityTrackingService {
  
  /**
   * Records quick step entry without validation (for healthcare workers)
   */
  async recordQuickSteps(steps: number): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Skip validation for quick entries - healthcare workers can have 20k-30k steps
      const { error } = await supabase
        .from('activities')
        .insert({
          user_id: user.id,
          type: 'walking',
          steps: steps,
          entry_method: 'quick_entry',
          verification_status: 'pending',
          verification_required: true,
          date: new Date().toISOString().split('T')[0],
          duration: Math.round(steps / 100), // Rough estimate: 100 steps per minute
          calories_burned: Math.round(steps * 0.04), // Rough estimate: 0.04 calories per step
          is_manual_entry: true
        });

      if (error) {
        console.error('Failed to record quick steps:', error);
        return false;
      }

      // Update pending steps tracking
      await this.updatePendingSteps(user.id);
      
      toast.info('Steps logged! Upload a screenshot to verify.');
      return true;
    } catch (error) {
      console.error('Error recording quick steps:', error);
      toast.error('Failed to log steps');
      return false;
    }
  }

  /**
   * Updates pending and verified steps for today
   */
  async updatePendingSteps(userId: string) {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data: activities } = await supabase
        .from('activities')
        .select('steps, verification_status')
        .eq('user_id', userId)
        .eq('date', today);

      const pending = activities
        ?.filter(a => a.verification_status === 'pending')
        .reduce((sum, a) => sum + (a.steps || 0), 0) || 0;
        
      const verified = activities
        ?.filter(a => a.verification_status === 'verified')
        .reduce((sum, a) => sum + (a.steps || 0), 0) || 0;

      await supabase
        .from('user_stats')
        .update({
          pending_steps: pending,
          verified_steps: verified,
          today_steps: pending + verified // Total for display
        })
        .eq('user_id', userId);
        
    } catch (error) {
      console.error('Error updating pending steps:', error);
    }
  }

  /**
   * Records a new activity and updates all user stats
   */
  async recordActivity(activityData: ActivityData): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Healthcare-appropriate validation limits
      const validationResult = this.validateActivityLimits(activityData);
      if (!validationResult.isValid) {
        console.warn('Activity failed validation:', validationResult.reason);
        toast.error(`Activity validation failed: ${validationResult.reason}`);
        
        // Flag suspicious activity for admin review
        await this.flagSuspiciousActivity(user.id, activityData, validationResult.reason);
        return false;
      }

      // Insert activity record
      const { error: activityError } = await supabase
        .from('activities')
        .insert({
          user_id: user.id,
          type: activityData.type,
          date: new Date().toISOString().split('T')[0],
          steps: activityData.steps || 0,
          duration: activityData.duration || 0,
          calories_burned: activityData.calories || 0,
          distance: activityData.distance || null,
          heart_rate_avg: activityData.heartRate || null,
          notes: activityData.notes || null,
          is_manual_entry: true
        });

      if (activityError) {
        console.error('Failed to record activity:', activityError);
        return false;
      }

      // Update all user stats from activities
      await healthDataService.updateUserStatsFromActivities();

      // Check for new achievements
      await this.checkAchievements(user.id, activityData);

      // Create social activity
      await this.createSocialActivity(user.id, activityData);

      toast.success('Activity recorded successfully!');
      return true;
    } catch (error) {
      console.error('Error recording activity:', error);
      toast.error('Failed to record activity');
      return false;
    }
  }

  /**
   * Updates water intake
   */
  async updateWaterIntake(glasses: number): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('user_stats')
        .update({ 
          water_intake: glasses,
          last_updated: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Water intake updated!');
      return true;
    } catch (error) {
      console.error('Error updating water intake:', error);
      return false;
    }
  }

  /**
   * Gets comprehensive user statistics
   */
  async getUserStats(userId: string) {
    try {
      const { data: stats, error: statsError } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (statsError) throw statsError;

      // Get personal records
      const personalRecords = await this.getPersonalRecords(userId);
      
      // Get recent achievements
      const recentAchievements = await this.getRecentAchievements(userId);

      return {
        ...stats,
        personalRecords,
        recentAchievements
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return null;
    }
  }

  /**
   * Gets personal records for the user
   */
  async getPersonalRecords(userId: string) {
    try {
      const { data: activities } = await supabase
        .from('activities')
        .select('steps, calories_burned, distance, duration, date')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (!activities || activities.length === 0) return {};

      const records = {
        maxDailySteps: Math.max(...activities.map(a => a.steps || 0)),
        maxCalories: Math.max(...activities.map(a => a.calories_burned || 0)),
        maxDistance: Math.max(...activities.map(a => a.distance || 0)),
        maxDuration: Math.max(...activities.map(a => a.duration || 0)),
        totalActivities: activities.length,
        averageDailySteps: activities.reduce((sum, a) => sum + (a.steps || 0), 0) / activities.length
      };

      return records;
    } catch (error) {
      console.error('Error getting personal records:', error);
      return {};
    }
  }

  /**
   * Gets recent achievements for the user
   */
  async getRecentAchievements(userId: string, days: number = 7) {
    try {
      const since = new Date();
      since.setDate(since.getDate() - days);

      const { data: achievements } = await supabase
        .from('user_achievements')
        .select(`
          id,
          earned_at,
          achievements!inner(name, icon, description, points)
        `)
        .eq('user_id', userId)
        .gte('earned_at', since.toISOString())
        .order('earned_at', { ascending: false });

      return achievements?.map(item => ({
        id: item.id,
        name: item.achievements.name,
        icon: item.achievements.icon,
        description: item.achievements.description,
        points: item.achievements.points,
        earned_at: item.earned_at
      })) || [];
    } catch (error) {
      console.error('Error getting recent achievements:', error);
      return [];
    }
  }

  /**
   * Checks and awards achievements based on activity
   */
  private async checkAchievements(userId: string, activityData: ActivityData) {
    try {
      // Check step-based achievements
      if (activityData.steps) {
        if (activityData.steps >= 10000) {
          await supabase.rpc('check_and_award_achievement', {
            p_user_id: userId,
            p_achievement_name: 'Step Champion',
            p_data: { steps: activityData.steps }
          });
        }
        if (activityData.steps >= 20000) {
          await supabase.rpc('check_and_award_achievement', {
            p_user_id: userId,
            p_achievement_name: 'Marathon Walker',
            p_data: { steps: activityData.steps }
          });
        }
      }

      // Check duration-based achievements
      if (activityData.duration && activityData.duration >= 60) {
        await supabase.rpc('check_and_award_achievement', {
          p_user_id: userId,
          p_achievement_name: 'Endurance Hero',
          p_data: { duration: activityData.duration }
        });
      }

      // Check calorie-based achievements
      if (activityData.calories && activityData.calories >= 500) {
        await supabase.rpc('check_and_award_achievement', {
          p_user_id: userId,
          p_achievement_name: 'Calorie Crusher',
          p_data: { calories: activityData.calories }
        });
      }
    } catch (error) {
      console.error('Error checking achievements:', error);
    }
  }

  /**
   * Creates a social activity post
   */
  private async createSocialActivity(userId: string, activityData: ActivityData) {
    try {
      let title = '';
      let description = '';

      switch (activityData.type) {
        case 'walking':
          title = '🚶‍♀️ Walking Session';
          description = `Completed a ${activityData.duration || 'great'} minute walk`;
          break;
        case 'running':
          title = '🏃‍♀️ Running Session';
          description = `Crushed a ${activityData.duration || 'amazing'} minute run`;
          break;
        case 'cycling':
          title = '🚴‍♀️ Cycling Adventure';
          description = `Enjoyed a ${activityData.duration || 'fantastic'} minute bike ride`;
          break;
        case 'workout':
          title = '💪 Workout Complete';
          description = `Finished a ${activityData.duration || 'challenging'} minute workout`;
          break;
        default:
          title = '🎯 Activity Complete';
          description = `Completed a ${activityData.type} session`;
      }

      if (activityData.steps && activityData.steps > 0) {
        description += ` with ${activityData.steps.toLocaleString()} steps`;
      }

      await supabase
        .from('social_activities')
        .insert({
          user_id: userId,
          type: 'activity_completion',
          title,
          description,
          data: activityData as any
        });
    } catch (error) {
      console.error('Error creating social activity:', error);
    }
  }

  /**
   * Gets activity history for charts and analytics
   */
  async getActivityHistory(userId: string, days: number = 30) {
    try {
      const since = new Date();
      since.setDate(since.getDate() - days);

      const { data: activities } = await supabase
        .from('activities')
        .select('date, steps, calories_burned, duration, type')
        .eq('user_id', userId)
        .gte('date', since.toISOString().split('T')[0])
        .order('date', { ascending: true });

      return activities || [];
    } catch (error) {
      console.error('Error getting activity history:', error);
      return [];
    }
  }

  /**
   * Gets weekly summary for the user
   */
  async getWeeklySummary(userId: string) {
    try {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());

      const { data: weekActivities } = await supabase
        .from('activities')
        .select('steps, calories_burned, duration')
        .eq('user_id', userId)
        .gte('date', weekStart.toISOString().split('T')[0]);

      if (!weekActivities || weekActivities.length === 0) {
        return {
          totalSteps: 0,
          totalCalories: 0,
          totalDuration: 0,
          activeDays: 0,
          averageSteps: 0
        };
      }

      const summary = {
        totalSteps: weekActivities.reduce((sum, a) => sum + (a.steps || 0), 0),
        totalCalories: weekActivities.reduce((sum, a) => sum + (a.calories_burned || 0), 0),
        totalDuration: weekActivities.reduce((sum, a) => sum + (a.duration || 0), 0),
        activeDays: weekActivities.length,
        averageSteps: 0
      };

      summary.averageSteps = Math.round(summary.totalSteps / Math.max(summary.activeDays, 1));

      return summary;
    } catch (error) {
      console.error('Error getting weekly summary:', error);
      return null;
    }
  }

  /**
   * Gets real user percentiles from database function
   */
  async getUserPercentiles(userId: string, timeframe: string = 'week') {
    try {
      const metrics = ['steps', 'calories', 'duration', 'consistency', 'intensity', 'recovery'];
      const percentiles: { [key: string]: number } = {};

      for (const metric of metrics) {
        const { data, error } = await supabase.rpc('calculate_user_percentile', {
          p_user_id: userId,
          p_metric: metric,
          p_timeframe: timeframe
        });

        if (error) {
          console.error(`Error getting ${metric} percentile:`, error);
          percentiles[metric] = 50; // Default fallback
        } else {
          percentiles[metric] = data || 50;
        }
      }

      return percentiles;
    } catch (error) {
      console.error('Error getting user percentiles:', error);
      return {
        steps: 50,
        calories: 50,
        duration: 50,
        consistency: 50,
        intensity: 50,
        recovery: 50
      };
    }
  }

  /**
   * Gets workout insights from database
   */
  async getWorkoutInsights(userId: string) {
    try {
      const { data: insights, error } = await supabase
        .from('workout_insights')
        .select('*')
        .eq('user_id', userId)
        .or('expires_at.is.null,expires_at.gt.now()')
        .order('priority', { ascending: true });

      if (error) {
        console.error('Error getting workout insights:', error);
        return [];
      }

      return insights || [];
    } catch (error) {
      console.error('Error getting workout insights:', error);
      return [];
    }
  }

  /**
   * Gets activity patterns from database
   */
  async getActivityPatterns(userId: string, timeframe: string = 'week') {
    try {
      let dateFilter;
      if (timeframe === 'week') {
        dateFilter = new Date();
        dateFilter.setDate(dateFilter.getDate() - 7);
      } else if (timeframe === 'month') {
        dateFilter = new Date();
        dateFilter.setDate(dateFilter.getDate() - 30);
      } else {
        dateFilter = new Date();
        dateFilter.setDate(dateFilter.getDate() - 7);
      }

      const { data: patterns, error } = await supabase
        .from('activity_patterns')
        .select('*')
        .eq('user_id', userId)
        .gte('period_start', dateFilter.toISOString().split('T')[0])
        .order('calculated_at', { ascending: false });

      if (error) {
        console.error('Error getting activity patterns:', error);
        return [];
      }

      return patterns || [];
    } catch (error) {
      console.error('Error getting activity patterns:', error);
      return [];
    }
  }

  /**
   * Manually triggers insight generation for user
   */
  async generateInsights(userId: string) {
    try {
      const { error } = await supabase.rpc('generate_workout_insights', {
        p_user_id: userId
      });

      if (error) {
        console.error('Error generating insights:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error generating insights:', error);
      return false;
    }
  }

  /**
   * Manually triggers pattern update for user
   */
  async updateActivityPatterns(userId: string) {
    try {
      const { error } = await supabase.rpc('update_activity_patterns', {
        p_user_id: userId
      });

      if (error) {
        console.error('Error updating activity patterns:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating activity patterns:', error);
      return false;
    }
  }

  /**
   * Validates activity limits for healthcare environment
   */
  private validateActivityLimits(activityData: ActivityData): { isValid: boolean; reason?: string } {
    const { type, steps = 0, duration = 0, calories = 0 } = activityData;

    // Healthcare-appropriate daily limits
    const dailyLimits = {
      walking: { steps: 40000, duration: 480, calories: 1200 }, // 8 hours
      running: { steps: 25000, duration: 180, calories: 2500 }, // 3 hours
      cycling: { steps: 0, duration: 150, calories: 1500 }, // 2.5 hours
      yoga: { steps: 0, duration: 180, calories: 400 }, // 3 hours
      'structured-workout': { steps: 0, duration: 120, calories: 800 } // 2 hours
    };

    const limits = dailyLimits[type as keyof typeof dailyLimits];
    if (!limits) {
      return { isValid: false, reason: 'Unknown activity type' };
    }

    // Check individual limits
    if (steps > limits.steps && limits.steps > 0) {
      return { isValid: false, reason: `Steps exceed daily limit (${limits.steps})` };
    }
    if (duration > limits.duration) {
      return { isValid: false, reason: `Duration exceeds daily limit (${limits.duration} minutes)` };
    }
    if (calories > limits.calories) {
      return { isValid: false, reason: `Calories exceed daily limit (${limits.calories})` };
    }

    // Pattern-based validation
    if (this.detectSuspiciousPatterns(activityData)) {
      return { isValid: false, reason: 'Suspicious activity pattern detected' };
    }

    return { isValid: true };
  }

  /**
   * Detects suspicious patterns in activity data
   */
  private detectSuspiciousPatterns(activityData: ActivityData): boolean {
    const { steps = 0, duration = 0, calories = 0 } = activityData;

    // Check for perfect round numbers (potential manual manipulation)
    if (steps > 0 && steps % 1000 === 0 && steps > 5000) return true;
    if (duration > 0 && duration % 30 === 0 && duration > 60) return true;
    if (calories > 0 && calories % 100 === 0 && calories > 200) return true;

    // Check for unrealistic ratios
    if (duration > 0 && calories / duration > 20) return true; // >20 cal/min is extreme
    if (steps > 0 && duration > 0 && steps / duration > 200) return true; // >200 steps/min

    return false;
  }

  /**
   * Flags suspicious activity for admin review
   */
  private async flagSuspiciousActivity(userId: string, activityData: ActivityData, reason: string) {
    try {
      // Get admin users
      const { data: adminUsers } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');

      if (!adminUsers || adminUsers.length === 0) return;

      // Create notifications for all admins
      const notifications = adminUsers.map(admin => ({
        user_id: admin.user_id,
        type: 'activity_flag',
        title: 'Suspicious Activity Detected',
        message: `User activity flagged: ${reason}. Activity: ${activityData.type}, ${activityData.duration}min, ${activityData.calories}cal`,
        event_id: null
      }));

      await supabase
        .from('notifications')
        .insert(notifications);

      console.log('Suspicious activity flagged for admin review');
    } catch (error) {
      console.error('Error flagging suspicious activity:', error);
    }
  }
}

export const activityTrackingService = new ActivityTrackingService();