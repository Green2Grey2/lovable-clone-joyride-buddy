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
   * Records a new activity and updates all user stats
   */
  async recordActivity(activityData: ActivityData): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

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
}

export const activityTrackingService = new ActivityTrackingService();