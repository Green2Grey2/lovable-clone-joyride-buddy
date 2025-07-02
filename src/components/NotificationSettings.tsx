import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, BellOff, Clock } from "lucide-react";
import { pushNotifications, NotificationPreferences } from "@/utils/webPushNotifications";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Capacitor } from "@capacitor/core";

export const NotificationSettings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    enabled: false,
    dailyReminders: true,
    achievementAlerts: true,
    challengeUpdates: true,
    socialActivity: true,
    reminderTime: "09:00"
  });

  useEffect(() => {
    loadPreferences();
    if (Capacitor.isNativePlatform()) {
      pushNotifications.initialize();
    }
  }, [user]);

  const loadPreferences = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data && !error) {
        setPreferences({
          enabled: data.notifications_enabled ?? false,
          dailyReminders: data.notifications_enabled ?? true, // Use fallback
          achievementAlerts: data.notifications_enabled ?? true, // Use fallback
          challengeUpdates: data.notifications_enabled ?? true, // Use fallback
          socialActivity: data.notifications_enabled ?? true, // Use fallback
          reminderTime: "09:00" // Default time
        });
      }
    } catch (error) {
      console.error('Error loading notification preferences:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await pushNotifications.updateNotificationPreferences(preferences);
      toast.success("Notification preferences saved");
    } catch (error) {
      toast.error("Failed to save preferences");
    } finally {
      setLoading(false);
    }
  };

  const toggleEnabled = (enabled: boolean) => {
    setPreferences(prev => ({ ...prev, enabled }));
  };

  if (!Capacitor.isNativePlatform()) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            Push Notifications
          </CardTitle>
          <CardDescription>
            Push notifications are only available on mobile devices
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Push Notifications
        </CardTitle>
        <CardDescription>
          Manage when and how you receive notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="notifications-enabled">Enable Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive push notifications on your device
            </p>
          </div>
          <Switch
            id="notifications-enabled"
            checked={preferences.enabled}
            onCheckedChange={toggleEnabled}
          />
        </div>

        {preferences.enabled && (
          <>
            <div className="space-y-4 border-t pt-4">
              <h4 className="text-sm font-medium">Notification Types</h4>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="daily-reminders">Daily Activity Reminders</Label>
                <Switch
                  id="daily-reminders"
                  checked={preferences.dailyReminders}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({ ...prev, dailyReminders: checked }))
                  }
                />
              </div>

              {preferences.dailyReminders && (
                <div className="flex items-center gap-2 ml-6">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="reminder-time" className="text-sm">Reminder Time</Label>
                  <Input
                    id="reminder-time"
                    type="time"
                    value={preferences.reminderTime}
                    onChange={(e) => 
                      setPreferences(prev => ({ ...prev, reminderTime: e.target.value }))
                    }
                    className="w-32"
                  />
                </div>
              )}

              <div className="flex items-center justify-between">
                <Label htmlFor="achievement-alerts">Achievement Alerts</Label>
                <Switch
                  id="achievement-alerts"
                  checked={preferences.achievementAlerts}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({ ...prev, achievementAlerts: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="challenge-updates">Challenge Updates</Label>
                <Switch
                  id="challenge-updates"
                  checked={preferences.challengeUpdates}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({ ...prev, challengeUpdates: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="social-activity">Social Activity</Label>
                <Switch
                  id="social-activity"
                  checked={preferences.socialActivity}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({ ...prev, socialActivity: checked }))
                  }
                />
              </div>
            </div>

            <Button 
              onClick={handleSave} 
              disabled={loading}
              className="w-full"
            >
              Save Preferences
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};