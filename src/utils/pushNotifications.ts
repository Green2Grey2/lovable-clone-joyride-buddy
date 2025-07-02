import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface NotificationPreferences {
  enabled: boolean;
  dailyReminders: boolean;
  achievementAlerts: boolean;
  challengeUpdates: boolean;
  socialActivity: boolean;
  reminderTime: string; // "09:00" format
}

class PushNotificationService {
  private isInitialized = false;
  private token: string | null = null;

  async initialize() {
    if (!Capacitor.isNativePlatform()) {
      console.log('Push notifications not available on web');
      return;
    }

    if (this.isInitialized) return;

    try {
      // Temporarily disabled - Capacitor push notifications not installed
      console.log('Push notifications temporarily disabled - missing Capacitor modules');
      this.isInitialized = true;
      return false;
    } catch (error) {
      console.error('Push notification initialization error:', error);
      toast.error('Failed to initialize push notifications');
    }
  }

  private async saveTokenToDatabase(token: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Temporarily disabled - push_tokens table doesn't exist yet
      console.log('Saving push token temporarily disabled:', token);
    } catch (error) {
      console.error('Error saving push token:', error);
    }
  }

  private handleNotificationAction(data: any) {
    if (!data) return;

    switch (data.type) {
      case 'achievement':
        window.location.href = '/awards';
        break;
      case 'challenge':
        window.location.href = '/activity';
        break;
      case 'social':
        window.location.href = '/dashboard';
        break;
      case 'reminder':
        window.location.href = '/active-activity';
        break;
      default:
        window.location.href = '/dashboard';
    }
  }

  async scheduleLocalNotification(title: string, body: string, scheduleAt: Date, data?: any) {
    if (!Capacitor.isNativePlatform()) return;

    try {
      // Temporarily disabled - LocalNotifications not installed
      console.log('Local notification temporarily disabled:', { title, body, scheduleAt, data });
    } catch (error) {
      console.error('Error scheduling local notification:', error);
    }
  }

  async cancelAllNotifications() {
    if (!Capacitor.isNativePlatform()) return;

    try {
      // Temporarily disabled - LocalNotifications not installed
      console.log('Cancel notifications temporarily disabled');
    } catch (error) {
      console.error('Error canceling notifications:', error);
    }
  }

  async updateNotificationPreferences(preferences: NotificationPreferences) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('user_preferences')
        .update({
          notifications_enabled: preferences.enabled,
          daily_reminders: preferences.dailyReminders,
          achievement_alerts: preferences.achievementAlerts,
          challenge_updates: preferences.challengeUpdates,
          social_activity: preferences.socialActivity,
          reminder_time: preferences.reminderTime
        })
        .eq('user_id', user.id);

      if (error) throw error;

      // Schedule or cancel daily reminders based on preferences
      if (preferences.enabled && preferences.dailyReminders) {
        await this.scheduleDailyReminder(preferences.reminderTime);
      } else {
        await this.cancelAllNotifications();
      }

    } catch (error) {
      console.error('Error updating notification preferences:', error);
      throw error;
    }
  }

  private async scheduleDailyReminder(time: string) {
    const [hours, minutes] = time.split(':').map(Number);
    const scheduleDate = new Date();
    scheduleDate.setHours(hours, minutes, 0, 0);

    // If time has passed today, schedule for tomorrow
    if (scheduleDate < new Date()) {
      scheduleDate.setDate(scheduleDate.getDate() + 1);
    }

    await this.scheduleLocalNotification(
      '🏃 Time to Move!',
      'Take a break and log some activity. Your health matters!',
      scheduleDate,
      { type: 'reminder' }
    );
  }

  getToken(): string | null {
    return this.token;
  }
}

export const pushNotifications = new PushNotificationService();
