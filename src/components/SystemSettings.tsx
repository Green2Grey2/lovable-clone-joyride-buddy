
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Settings, Shield, Users, Database, Bell, Globe } from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';
import { toast } from 'sonner';

interface SystemConfig {
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  challengeAutoStart: boolean;
  notificationsEnabled: boolean;
  maxUsersPerDepartment: number;
  systemName: string;
  welcomeMessage: string;
}

export const SystemSettings = () => {
  const { isAdmin } = useUserRole();
  const [config, setConfig] = useState<SystemConfig>({
    maintenanceMode: false,
    registrationEnabled: true,
    challengeAutoStart: true,
    notificationsEnabled: true,
    maxUsersPerDepartment: 100,
    systemName: 'Stride: Score, Sprint, Win',
    welcomeMessage: 'Welcome to your fitness journey!'
  });
  const [hasChanges, setHasChanges] = useState(false);

  const handleConfigChange = (key: keyof SystemConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    // In a real app, this would save to the database
    console.log('Saving system configuration:', config);
    toast.success('System settings updated successfully');
    setHasChanges(false);
  };

  const handleReset = () => {
    setConfig({
      maintenanceMode: false,
      registrationEnabled: true,
      challengeAutoStart: true,
      notificationsEnabled: true,
      maxUsersPerDepartment: 100,
      systemName: 'Stride: Score, Sprint, Win',
      welcomeMessage: 'Welcome to your fitness journey!'
    });
    setHasChanges(false);
    toast.info('Settings reset to defaults');
  };

  if (!isAdmin()) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Admin access required for system settings</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            System Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Application Settings */}
          <div>
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Application Settings
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="systemName">System Name</Label>
                  <Input
                    id="systemName"
                    value={config.systemName}
                    onChange={(e) => handleConfigChange('systemName', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="maxUsers">Max Users per Department</Label>
                  <Input
                    id="maxUsers"
                    type="number"
                    value={config.maxUsersPerDepartment}
                    onChange={(e) => handleConfigChange('maxUsersPerDepartment', parseInt(e.target.value))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="welcomeMessage">Welcome Message</Label>
                <Input
                  id="welcomeMessage"
                  value={config.welcomeMessage}
                  onChange={(e) => handleConfigChange('welcomeMessage', e.target.value)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* System Controls */}
          <div>
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              System Controls
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="maintenance">Maintenance Mode</Label>
                  <p className="text-sm text-gray-500">Temporarily disable user access</p>
                </div>
                <Switch
                  id="maintenance"
                  checked={config.maintenanceMode}
                  onCheckedChange={(checked) => handleConfigChange('maintenanceMode', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="registration">User Registration</Label>
                  <p className="text-sm text-gray-500">Allow new users to register</p>
                </div>
                <Switch
                  id="registration"
                  checked={config.registrationEnabled}
                  onCheckedChange={(checked) => handleConfigChange('registrationEnabled', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="autostart">Auto-start Challenges</Label>
                  <p className="text-sm text-gray-500">Automatically start new challenges</p>
                </div>
                <Switch
                  id="autostart"
                  checked={config.challengeAutoStart}
                  onCheckedChange={(checked) => handleConfigChange('challengeAutoStart', checked)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Notification Settings */}
          <div>
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notification Settings
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notifications">System Notifications</Label>
                <p className="text-sm text-gray-500">Enable push notifications for all users</p>
              </div>
              <Switch
                id="notifications"
                checked={config.notificationsEnabled}
                onCheckedChange={(checked) => handleConfigChange('notificationsEnabled', checked)}
              />
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={handleReset}>
              Reset to Defaults
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={!hasChanges}
              className={hasChanges ? 'bg-blue-600 hover:bg-blue-700' : ''}
            >
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-700">Online</div>
              <div className="text-sm text-green-600">System Status</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-700">99.9%</div>
              <div className="text-sm text-blue-600">Uptime</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-700">1.2s</div>
              <div className="text-sm text-purple-600">Response Time</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-700">v2.1.0</div>
              <div className="text-sm text-orange-600">Version</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
