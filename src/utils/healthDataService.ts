import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface HealthDataPoint {
  steps: number;
  heartRate?: number;
  calories?: number;
  activeMinutes?: number;
  distance?: number;
  sleepHours?: number;
  waterIntake?: number;
  timestamp: Date;
}

export interface HealthPermissions {
  granted: boolean;
  platform: 'healthkit' | 'googlefit' | 'samsung' | 'none';
  permissions?: string[];
  error?: string;
}

class HealthDataService {
  private platform: 'healthkit' | 'googlefit' | 'samsung' | 'none' = 'none';
  private permissions: HealthPermissions = { granted: false, platform: 'none' };

  constructor() {
    this.detectPlatform();
  }

  private detectPlatform() {
    if (!Capacitor.isNativePlatform()) {
      this.platform = 'none';
      return;
    }

    const platform = Capacitor.getPlatform();
    const userAgent = navigator.userAgent;

    if (platform === 'ios') {
      this.platform = 'healthkit';
    } else if (platform === 'android') {
      if (userAgent.includes('Samsung') || userAgent.includes('SM-')) {
        this.platform = 'samsung';
      } else {
        this.platform = 'googlefit';
      }
    }
  }

  async requestPermissions(): Promise<HealthPermissions> {
    try {
      switch (this.platform) {
        case 'healthkit':
          return await this.requestHealthKitPermissions();
        case 'googlefit':
          return await this.requestGoogleFitPermissions();
        case 'samsung':
          return await this.requestSamsungHealthPermissions();
        default:
          return { 
            granted: false, 
            platform: 'none', 
            error: 'Health data integration is only available on mobile devices' 
          };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to request permissions: ${errorMessage}`);
      return { granted: false, platform: this.platform, error: errorMessage };
    }
  }

  private async requestHealthKitPermissions(): Promise<HealthPermissions> {
    try {
      // For now, return a placeholder since HealthKit plugin isn't installed
      return {
        granted: false,
        platform: 'healthkit',
        error: 'HealthKit integration pending plugin installation'
      };
    } catch (error) {
      throw new Error('HealthKit permissions request failed');
    }
  }

  private async requestGoogleFitPermissions(): Promise<HealthPermissions> {
    try {
      // For now, return a placeholder since Google Fit plugin isn't installed
      return {
        granted: false,
        platform: 'googlefit',
        error: 'Google Fit integration pending plugin installation'
      };
    } catch (error) {
      throw new Error('Google Fit permissions request failed');
    }
  }

  private async requestSamsungHealthPermissions(): Promise<HealthPermissions> {
    // Samsung Health would require specific SDK integration
    // For now, return a placeholder
    return {
      granted: false,
      platform: 'samsung',
      error: 'Samsung Health integration not yet implemented'
    };
  }

  async syncHealthData(startDate?: Date, endDate?: Date): Promise<HealthDataPoint[]> {
    if (!this.permissions.granted) {
      throw new Error('Health permissions not granted');
    }

    const start = startDate || new Date(Date.now() - 24 * 60 * 60 * 1000); // Last 24 hours
    const end = endDate || new Date();

    try {
      switch (this.platform) {
        case 'healthkit':
          return await this.syncHealthKitData(start, end);
        case 'googlefit':
          return await this.syncGoogleFitData(start, end);
        case 'samsung':
          return await this.syncSamsungHealthData(start, end);
        default:
          return [];
      }
    } catch (error) {
      console.error('Health data sync error:', error);
      toast.error('Failed to sync health data');
      return [];
    }
  }

  private async syncHealthKitData(startDate: Date, endDate: Date): Promise<HealthDataPoint[]> {
    try {
      // Placeholder until HealthKit plugin is installed
      return [];
    } catch (error) {
      console.error('HealthKit sync error:', error);
      throw error;
    }
  }

  private async syncGoogleFitData(startDate: Date, endDate: Date): Promise<HealthDataPoint[]> {
    try {
      // Placeholder until Google Fit plugin is installed
      return [];
    } catch (error) {
      console.error('Google Fit sync error:', error);
      throw error;
    }
  }

  private async syncSamsungHealthData(startDate: Date, endDate: Date): Promise<HealthDataPoint[]> {
    // Placeholder for Samsung Health implementation
    return [];
  }

  async saveHealthDataToDatabase(dataPoints: HealthDataPoint[]) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Save individual activity records for history
      for (const dp of dataPoints) {
        await supabase
          .from('activities')
          .insert({
            user_id: user.id,
            type: 'health_sync',
            date: dp.timestamp.toISOString().split('T')[0],
            steps: dp.steps,
            calories_burned: dp.calories || 0,
            heart_rate_avg: dp.heartRate || null,
            distance: dp.distance || null,
            duration: dp.activeMinutes || null,
            is_manual_entry: false
          });
      }

      // Calculate aggregated stats from ALL activities for comprehensive tracking
      await this.updateUserStatsFromActivities();

      toast.success('Health data synced successfully');
    } catch (error) {
      console.error('Error saving health data:', error);
      throw error;
    }
  }

  /**
   * Updates user stats by aggregating data from all activities
   */
  async updateUserStatsFromActivities() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const monthStart = new Date();
      monthStart.setDate(1);

      // Calculate today's totals
      const { data: todayActivities } = await supabase
        .from('activities')
        .select('steps, calories_burned, heart_rate_avg, distance')
        .eq('user_id', user.id)
        .eq('date', today);

      // Calculate weekly totals
      const { data: weeklyActivities } = await supabase
        .from('activities')
        .select('steps, calories_burned')
        .eq('user_id', user.id)
        .gte('date', weekStart.toISOString().split('T')[0]);

      // Calculate monthly totals
      const { data: monthlyActivities } = await supabase
        .from('activities')
        .select('steps, calories_burned')
        .eq('user_id', user.id)
        .gte('date', monthStart.toISOString().split('T')[0]);

      // Calculate lifetime totals
      const { data: lifetimeActivities } = await supabase
        .from('activities')
        .select('steps, calories_burned')
        .eq('user_id', user.id);

      // Calculate streak
      const streak = await this.calculateCurrentStreak(user.id);

      // Aggregate totals
      const todayStats = {
        steps: todayActivities?.reduce((sum, a) => sum + (a.steps || 0), 0) || 0,
        calories: todayActivities?.reduce((sum, a) => sum + (a.calories_burned || 0), 0) || 0,
        heartRate: todayActivities?.filter(a => a.heart_rate_avg)
          .reduce((sum, a, _, arr) => sum + (a.heart_rate_avg || 0) / arr.length, 0) || 0
      };

      const weeklySteps = weeklyActivities?.reduce((sum, a) => sum + (a.steps || 0), 0) || 0;
      const monthlySteps = monthlyActivities?.reduce((sum, a) => sum + (a.steps || 0), 0) || 0;
      const lifetimeSteps = lifetimeActivities?.reduce((sum, a) => sum + (a.steps || 0), 0) || 0;

      // Update user stats
      const { error } = await supabase
        .from('user_stats')
        .update({
          today_steps: todayStats.steps,
          weekly_steps: weeklySteps,
          monthly_steps: monthlySteps,
          lifetime_steps: lifetimeSteps,
          heart_rate: Math.round(todayStats.heartRate),
          calories_burned: Math.round(todayStats.calories),
          current_streak: streak,
          last_updated: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating user stats from activities:', error);
      throw error;
    }
  }

  /**
   * Calculates current activity streak
   */
  async calculateCurrentStreak(userId: string): Promise<number> {
    try {
      const { data: activities } = await supabase
        .from('activities')
        .select('date')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (!activities || activities.length === 0) return 0;

      let streak = 0;
      const today = new Date();
      let checkDate = new Date(today);
      
      // Check if today has activity
      const todayString = today.toISOString().split('T')[0];
      const hasToday = activities.some(a => a.date === todayString);
      
      if (!hasToday) {
        // If no activity today, start from yesterday
        checkDate.setDate(checkDate.getDate() - 1);
      }

      // Count consecutive days with activities
      for (let i = 0; i < activities.length; i++) {
        const activityDate = checkDate.toISOString().split('T')[0];
        if (activities.some(a => a.date === activityDate)) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }

      return streak;
    } catch (error) {
      console.error('Error calculating streak:', error);
      return 0;
    }
  }

  /**
   * Checks if user has any health data synced (for web users)
   */
  async hasHealthDataSynced(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from('activities')
        .select('id')
        .eq('user_id', user.id)
        .eq('type', 'health_sync')
        .limit(1);

      return !error && data && data.length > 0;
    } catch (error) {
      console.error('Failed to check health data:', error);
      return false;
    }
  }

  /**
   * Gets latest health stats for display (works on web)
   */
  async getLatestHealthStats() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: stats, error } = await supabase
        .from('user_stats')
        .select('today_steps, calories_burned, heart_rate, water_intake, last_updated')
        .eq('user_id', user.id)
        .single();

      if (error || !stats) return null;

      return {
        steps: stats.today_steps || 0,
        calories: stats.calories_burned || 0,
        heartRate: stats.heart_rate || 0,
        water: stats.water_intake || 0,
        lastSync: stats.last_updated
      };
    } catch (error) {
      console.error('Failed to get health stats:', error);
      return null;
    }
  }

  private async savePermissions() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('user_preferences')
        .update({
          // health_platform: this.platform, // Disabled - column doesn't exist yet
          // health_permissions_granted: this.permissions.granted // Disabled - column doesn't exist yet
        })
        .eq('user_id', user.id);
    } catch (error) {
      console.error('Error saving permissions:', error);
    }
  }

  async checkPermissions(): Promise<HealthPermissions> {
    return this.permissions;
  }

  getPlatform(): string {
    return this.platform;
  }
}

export const healthDataService = new HealthDataService();