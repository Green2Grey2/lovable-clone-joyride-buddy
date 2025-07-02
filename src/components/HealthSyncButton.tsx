
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Smartphone, RefreshCw, CheckCircle, AlertCircle, Activity, Clock } from 'lucide-react';
import { useHealthSync } from '@/hooks/useHealthSync';
import { toast } from 'sonner';
import { useSoundEffects } from '@/hooks/useSoundEffects';

export const HealthSyncButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { playConfirm, playError } = useSoundEffects();
  
  const {
    canSync,
    permissions,
    hasHealthData,
    healthStats,
    platform,
    requestPermissions,
    syncHealthData,
    canRequestPermissions,
    showHealthStats
  } = useHealthSync();

  const getPlatformName = () => {
    switch (platform) {
      case 'ios': return 'Apple Health';
      case 'android': return 'Google Fit';
      default: return 'Health App';
    }
  };

  const handleRequestPermissions = async () => {
    setIsLoading(true);
    try {
      const granted = await requestPermissions();
      
      if (granted) {
        toast.success(`${getPlatformName()} access granted!`);
        playConfirm();
      } else {
        toast.error('Permission denied');
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
      const success = await syncHealthData();
      
      if (success) {
        toast.success(`Health data synced from ${getPlatformName()}`);
        playConfirm();
      } else {
        toast.error('No new data to sync');
        playError();
      }
    } catch (error) {
      toast.error('Failed to sync health data');
      playError();
    } finally {
      setIsLoading(false);
    }
  };

  // Show health stats if user has previously synced data (even on web)
  if (showHealthStats && healthStats) {
    const lastSyncDate = healthStats.lastSync ? new Date(healthStats.lastSync) : null;
    
    return (
      <div className="space-y-3">
        {/* Health Stats Display */}
        <div className="grid grid-cols-2 gap-3 p-4 bg-muted/50 rounded-xl">
          <div className="text-center">
            <div className="text-lg font-semibold text-foreground">{healthStats.steps.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Steps</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-foreground">{healthStats.calories}</div>
            <div className="text-xs text-muted-foreground">Calories</div>
          </div>
        </div>

        {/* Sync Button (only show on mobile) */}
        {canSync && permissions.granted && (
          <Button 
            onClick={handleSync}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl"
            soundEnabled={false}
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4 mr-2" />
            )}
            {isLoading ? 'Syncing...' : `Sync ${getPlatformName()}`}
          </Button>
        )}

        {/* Web users see read-only message */}
        {!canSync && (
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {lastSyncDate 
              ? `Last synced: ${lastSyncDate.toLocaleDateString()}`
              : 'Synced from mobile app'
            }
          </div>
        )}

        {/* Permission request for mobile users */}
        {canSync && canRequestPermissions && (
          <Button 
            onClick={handleRequestPermissions}
            disabled={isLoading}
            variant="outline"
            className="w-full rounded-xl"
            soundEnabled={false}
          >
            <Activity className="h-4 w-4 mr-2" />
            {isLoading ? 'Requesting...' : `Update ${getPlatformName()} Access`}
          </Button>
        )}
      </div>
    );
  }

  // No health data - show appropriate message/button
  if (!canSync) {
    return (
      <div className="space-y-2 p-4 bg-muted/30 rounded-xl border border-dashed border-muted-foreground/30">
        <div className="text-center">
          <Smartphone className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <h3 className="font-medium text-foreground">Health Tracking</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Install the mobile app to sync health data from {getPlatformName()}
          </p>
        </div>
      </div>
    );
  }

  // Mobile users without permissions
  if (canRequestPermissions) {
    return (
      <Button 
        onClick={handleRequestPermissions}
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl"
        soundEnabled={false}
      >
        <Activity className="h-4 w-4 mr-2" />
        {isLoading ? 'Requesting...' : `Connect ${getPlatformName()}`}
      </Button>
    );
  }

  // Mobile users with permissions but no data yet
  return (
    <Button 
      onClick={handleSync}
      disabled={isLoading}
      className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl"
      soundEnabled={false}
    >
      {isLoading ? (
        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <CheckCircle className="h-4 w-4 mr-2" />
      )}
      {isLoading ? 'Syncing...' : `Sync ${getPlatformName()}`}
    </Button>
  );
};
