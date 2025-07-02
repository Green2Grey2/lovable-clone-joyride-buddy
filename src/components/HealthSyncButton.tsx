
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Smartphone, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { syncHealthData, requestHealthPermissions, detectHealthPlatform, saveHealthPermissions, checkHealthPermissions } from '@/utils/healthIntegration';
import { useApp } from '@/contexts/AppContext';
import { toast } from 'sonner';
import { useSoundEffects } from '@/hooks/useSoundEffects';

export const HealthSyncButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const { updateUserStats } = useApp();
  const { playConfirm, playError } = useSoundEffects();

  const platform = detectHealthPlatform();
  const permissions = checkHealthPermissions();

  const getPlatformName = () => {
    switch (platform) {
      case 'apple': return 'Apple Health';
      case 'samsung': return 'Samsung Health';
      case 'google': return 'Google Fit';
      default: return 'Health App';
    }
  };

  const handleRequestPermissions = async () => {
    setIsLoading(true);
    try {
      const result = await requestHealthPermissions();
      saveHealthPermissions(result);
      
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
      const result = await syncHealthData();
      
      if (result.success && result.data && result.data.length > 0) {
        const latestData = result.data[result.data.length - 1];
        
        // Update user stats with synced data
        await updateUserStats({
          todaySteps: latestData.steps,
          heartRate: latestData.heartRate || 75,
          calories: latestData.calories || 0
        });
        
        setLastSync(new Date());
        toast.success(`Synced ${latestData.steps} steps from ${getPlatformName()}`);
        playConfirm();
      } else {
        toast.error(result.error || 'No data available to sync from your device');
        playError();
      }
    } catch (error) {
      toast.error('Failed to sync health data');
      playError();
    } finally {
      setIsLoading(false);
    }
  };

  if (platform === 'none') {
    return (
      <Button variant="outline" disabled className="w-full rounded-2xl">
        <AlertCircle className="h-4 w-4 mr-2" />
        No Health App Detected
      </Button>
    );
  }

  if (!permissions.granted || permissions.platform !== platform) {
    return (
      <Button 
        onClick={handleRequestPermissions}
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-[#735CF7] to-[#00A3FF] text-white rounded-2xl"
        soundEnabled={false}
      >
        <Smartphone className="h-4 w-4 mr-2" />
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
