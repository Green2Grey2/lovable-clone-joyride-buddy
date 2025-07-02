import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface NotificationPreferences {
  enabled: boolean;
  dailyReminders: boolean;
  achievementAlerts: boolean;
  challengeUpdates: boolean;
  socialActivity: boolean;
  reminderTime: string;
}

class WebPushNotificationService {
  async initialize() {
    console.log('Push notifications require native app installation');
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
      
      toast.info('Notification preferences saved. Install the mobile app to receive push notifications.');
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      throw error;
    }
  }

  getToken(): string | null {
    return null;
  }
}

export const pushNotifications = new WebPushNotificationService();