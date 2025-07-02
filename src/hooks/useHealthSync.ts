import { useState, useEffect } from 'react';
import { healthDataService, HealthPermissions } from '@/utils/healthDataService';
import { usePlatformHealth } from './usePlatformHealth';

interface HealthSyncState {
  hasHealthData: boolean;
  healthStats: {
    steps: number;
    calories: number;
    heartRate: number;
    water: number;
    lastSync: string | null;
  } | null;
  permissions: HealthPermissions;
  isLoading: boolean;
  canSync: boolean; // True if on native platform
}

export const useHealthSync = () => {
  const { supportsHealthSync, platform, isLoading: platformLoading } = usePlatformHealth();
  const [healthState, setHealthState] = useState<HealthSyncState>({
    hasHealthData: false,
    healthStats: null,
    permissions: { granted: false, platform: 'none' },
    isLoading: true,
    canSync: false
  });

  useEffect(() => {
    const loadHealthData = async () => {
      if (platformLoading) return;

      try {
        // Check if user has synced health data before
        const hasData = await healthDataService.hasHealthDataSynced();
        
        // Get current health stats (from Supabase, works on web)
        const stats = await healthDataService.getLatestHealthStats();
        
        // Check current permissions (only relevant for native)
        const permissions = await healthDataService.checkPermissions();

        setHealthState({
          hasHealthData: hasData,
          healthStats: stats,
          permissions,
          isLoading: false,
          canSync: supportsHealthSync
        });
      } catch (error) {
        console.error('Failed to load health data:', error);
        setHealthState(prev => ({ ...prev, isLoading: false }));
      }
    };

    loadHealthData();
  }, [supportsHealthSync, platformLoading]);

  const requestPermissions = async () => {
    if (!supportsHealthSync) return false;
    
    try {
      const permissions = await healthDataService.requestPermissions();
      setHealthState(prev => ({ ...prev, permissions }));
      return permissions.granted;
    } catch (error) {
      console.error('Failed to request permissions:', error);
      return false;
    }
  };

  const syncHealthData = async () => {
    if (!supportsHealthSync || !healthState.permissions.granted) return false;

    try {
      const dataPoints = await healthDataService.syncHealthData();
      if (dataPoints.length > 0) {
        await healthDataService.saveHealthDataToDatabase(dataPoints);
        
        // Refresh health stats
        const stats = await healthDataService.getLatestHealthStats();
        setHealthState(prev => ({ 
          ...prev, 
          healthStats: stats,
          hasHealthData: true 
        }));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Health sync failed:', error);
      return false;
    }
  };

  return {
    ...healthState,
    platform,
    requestPermissions,
    syncHealthData,
    canRequestPermissions: supportsHealthSync && !healthState.permissions.granted,
    showHealthStats: healthState.hasHealthData || healthState.healthStats !== null
  };
};