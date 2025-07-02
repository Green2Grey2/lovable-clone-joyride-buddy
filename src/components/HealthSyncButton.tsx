
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Smartphone, RefreshCw, CheckCircle, AlertCircle, Activity } from 'lucide-react';
import { healthDataService } from '@/utils/healthDataService';
import { useApp } from '@/contexts/AppContext';
import { toast } from 'sonner';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { Capacitor } from '@capacitor/core';

export const HealthSyncButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [permissions, setPermissions] = useState<any>(null);
  const { updateUserStats } = useApp();
  const { playConfirm, playError } = useSoundEffects();

  const platform = healthDataService.getPlatform();

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    const perms = await healthDataService.checkPermissions();
    setPermissions(perms);
  };

  const getPlatformName = () => {
    switch (platform) {
      case 'healthkit': return 'Apple Health';
      case 'samsung': return 'Samsung Health';
      case 'googlefit': return 'Google Fit';
      default: return 'Health App';
    }
  };

  const handleRequestPermissions = async () => {
    setIsLoading(true);
    try {
      const result = await healthDataService.requestPermissions();
      setPermissions(result);
      
      if (result.granted) {
        toast.success(`${getPlatformName()} access granted!`);
        playConfirm();
      } else {
        toast.error(result.error || 'Permission denied');
        playError();
      }
    } catch (error) {
      toast.error('Failed to request permissions');
      playError();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async () => {
    setIsLoading(true);
    try {
      const data = await healthDataService.syncHealthData();
      
      if (data && data.length > 0) {
        // Calculate totals from all data points
        const totalSteps = data.reduce((sum, dp) => sum + dp.steps, 0);
        const avgHeartRate = data
          .filter(dp => dp.heartRate)
          .reduce((sum, dp, _, arr) => sum + (dp.heartRate || 0) / arr.length, 0);
        const totalCalories = data.reduce((sum, dp) => sum + (dp.calories || 0), 0);
        
        // Update user stats with synced data
        await updateUserStats({
          todaySteps: totalSteps,
          heartRate: Math.round(avgHeartRate) || 75,
          calories: Math.round(totalCalories) || 0
        });
        
        setLastSync(new Date());
        toast.success(`Synced ${totalSteps} steps from ${getPlatformName()}`);
        playConfirm();
      } else {
        toast.error('No data available to sync from your device');
        playError();
      }
    } catch (error) {
      toast.error('Failed to sync health data');
      playError();
    } finally {
      setIsLoading(false);
    }
  };

  if (!Capacitor.isNativePlatform()) {
    return (
      <div className="space-y-2">
        <Button variant="outline" disabled className="w-full rounded-2xl">
          <AlertCircle className="h-4 w-4 mr-2" />
          Health Sync (Mobile Only)
        </Button>
        <p className="text-xs text-gray-500 text-center">
          Install the mobile app to sync health data
        </p>
      </div>
    );
  }

  if (platform === 'none') {
    return (
      <Button variant="outline" disabled className="w-full rounded-2xl">
        <AlertCircle className="h-4 w-4 mr-2" />
        No Health App Detected
      </Button>
    );
  }

  if (!permissions || !permissions.granted) {
    return (
      <Button 
        onClick={handleRequestPermissions}
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-[#735CF7] to-[#00A3FF] text-white rounded-2xl"
        soundEnabled={false}
      >
        <Activity className="h-4 w-4 mr-2" />
        {isLoading ? 'Requesting...' : `Connect ${getPlatformName()}`}
      </Button>
    );
  }

  return (
    <div className="space-y-2">
      <Button 
        onClick={handleSync}
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-2xl"
        soundEnabled={false}
      >
        {isLoading ? (
          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <CheckCircle className="h-4 w-4 mr-2" />
        )}
        {isLoading ? 'Syncing...' : `Sync ${getPlatformName()}`}
      </Button>
      
      {lastSync && (
        <p className="text-xs text-gray-500 text-center">
          Last synced: {lastSync.toLocaleTimeString()}
        </p>
      )}
    </div>
  );
};
