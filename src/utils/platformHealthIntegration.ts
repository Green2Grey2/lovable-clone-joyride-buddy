import { Device } from '@capacitor/device';

export interface HealthData {
  steps: number;
  heartRate?: number;
  calories?: number;
  distance?: number;
  date: string;
}

export interface PlatformInfo {
  isNative: boolean;
  platform: 'web' | 'ios' | 'android';
  supportsHealthSync: boolean;
}

/**
 * Detects the current platform and health sync capabilities
 */
export const getPlatformInfo = async (): Promise<PlatformInfo> => {
  try {
    const deviceInfo = await Device.getInfo();
    const isNative = deviceInfo.platform !== 'web';
    
    return {
      isNative,
      platform: deviceInfo.platform as 'web' | 'ios' | 'android',
      supportsHealthSync: isNative && (deviceInfo.platform === 'ios' || deviceInfo.platform === 'android')
    };
  } catch (error) {
    // Fallback for web or when Capacitor is not available
    return {
      isNative: false,
      platform: 'web',
      supportsHealthSync: false
    };
  }
};

/**
 * Checks if health permissions are granted for the current platform
 */
export const checkHealthPermissions = async (platform: string): Promise<boolean> => {
  // This would be implemented with actual health plugins
  // For now, return false to indicate permissions not implemented
  return false;
};

/**
 * Requests health permissions for the current platform
 */
export const requestHealthPermissions = async (platform: string): Promise<boolean> => {
  // This would be implemented with actual health plugins
  console.log(`Health permissions not yet implemented for ${platform}`);
  return false;
};

/**
 * Syncs health data from the native health app
 */
export const syncHealthData = async (platform: string): Promise<HealthData | null> => {
  // This would be implemented with actual health plugins
  console.log(`Health sync not yet implemented for ${platform}`);
  return null;
};

/**
 * Platform-specific health app names for display
 */
export const getHealthAppName = (platform: string): string => {
  switch (platform) {
    case 'ios':
      return 'Apple Health';
    case 'android':
      return 'Google Fit / Samsung Health';
    default:
      return 'Health App';
  }
};