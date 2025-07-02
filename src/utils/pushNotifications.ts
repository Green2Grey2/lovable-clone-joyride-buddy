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
      // Dynamic import for Capacitor plugins
      const { PushNotifications } = await import('@capacitor/push-notifications');
      
      // Request permission
      let permStatus = await PushNotifications.checkPermissions();
      
      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }

      if (permStatus.receive !== 'granted') {
        throw new Error('User denied permissions!');
      }

      // Register with the push notification service
      await PushNotifications.register();

      // Listen for registration token
      await PushNotifications.addListener('registration', async (token: any) => {
        console.log('Push registration success, token: ' + token.value);
        this.token = token.value;
        await this.saveTokenToDatabase(token.value);
      });

      // Listen for registration errors
      await PushNotifications.addListener('registrationError', (error: any) => {
        console.error('Error on registration: ' + JSON.stringify(error));
      });

      // Handle notification received while app is in foreground
      await PushNotifications.addListener('pushNotificationReceived', (notification: any) => {
        console.log('Push notification received: ' + JSON.stringify(notification));
        
        // Show in-app notification
        toast(notification.title || 'New notification', {
          description: notification.body,
          action: notification.data?.action ? {
            label: 'View',
            onClick: () => this.handleNotificationAction(notification.data)
          } : undefined
        });
      });

      // Handle notification tap
      await PushNotifications.addListener('pushNotificationActionPerformed', (notification: any) => {
        console.log('Push notification action performed', notification);
        this.handleNotificationAction(notification.notification.data);
      });

      this.isInitialized = true;
      
    } catch (error) {
      console.error('Push notification initialization error:', error);
      toast.error('Failed to initialize push notifications');
    }
  }

  private async saveTokenToDatabase(token: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('push_tokens')
        .upsert({
          user_id: user.id,
          token: token,
          platform: Capacitor.getPlatform(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,platform'
        });

      if (error) throw error;
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
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      
      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id: Math.floor(Math.random() * 1000000),
            schedule: { at: scheduleAt },
            extra: data
          }
        ]
      });
    } catch (error) {
      console.error('Error scheduling local notification:', error);
    }
  }

  async cancelAllNotifications() {
    if (!Capacitor.isNativePlatform()) return;

    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      await LocalNotifications.cancel({ notifications: [] });
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