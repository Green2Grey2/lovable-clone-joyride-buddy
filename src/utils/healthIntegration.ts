
interface HealthDataPoint {
  steps: number;
  heartRate?: number;
  calories?: number;
  activeMinutes?: number;
  distance?: number;
  timestamp: Date;
}

interface HealthPermissions {
  granted: boolean;
  platform: 'samsung' | 'google' | 'apple' | 'none';
  error?: string;
}

// Enhanced platform detection with proper Samsung Health detection
export const detectHealthPlatform = (): 'samsung' | 'google' | 'apple' | 'none' => {
  if (typeof window === 'undefined') return 'none';
  
  // Check for iOS/Safari and HealthKit availability
  if (/iPhone|iPad|iPod/.test(navigator.userAgent) || 
      (navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome'))) {
    return 'apple';
  }
  
  // Check for Samsung Health specifically
  if (navigator.userAgent.includes('Samsung') || 
      navigator.userAgent.includes('SM-') ||
      // Check if Samsung Health is available
      ('samsungHealth' in window) ||
      // Check for Samsung Internet browser
      navigator.userAgent.includes('SamsungBrowser')) {
    return 'samsung';
  }
  
  // Check for Android (but not Samsung)
  if (navigator.userAgent.includes('Android')) {
    return 'google';
  }
  
  return 'none';
};

// Request permissions with enhanced error handling
export const requestHealthPermissions = async (): Promise<HealthPermissions> => {
  const platform = detectHealthPlatform();
  
  try {
    switch (platform) {
      case 'apple':
        return await requestAppleHealthPermissions();
      case 'samsung':
        return await requestSamsungHealthPermissions();
      case 'google':
        return await requestGoogleFitPermissions();
      default:
        return { granted: false, platform: 'none', error: 'No health platform detected' };
    }
  } catch (error) {
    return {
      granted: false,
      platform,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Apple Health (HealthKit) integration - web fallback only
const requestAppleHealthPermissions = async (): Promise<HealthPermissions> => {
  try {
    console.log('Requesting Apple Health permissions...');
    
    // For web/PWA, use Web API if available
    if ('permissions' in navigator) {
      try {
        const result = await navigator.permissions.query({ name: 'accelerometer' as any });
        return { granted: result.state === 'granted', platform: 'apple' };
      } catch {
        // Permission API not supported
      }
    }
    
    // Fallback - assume granted for demo (real implementation would handle this differently)
    console.log('Apple HealthKit: Using fallback permission grant');
    return { granted: true, platform: 'apple' };
  } catch (error) {
    return {
      granted: false,
      platform: 'apple',
      error: error instanceof Error ? error.message : 'HealthKit permission denied'
    };
  }
};

// Samsung Health integration with enhanced detection
const requestSamsungHealthPermissions = async (): Promise<HealthPermissions> => {
  try {
    console.log('Requesting Samsung Health permissions...');
    
    // Check if Samsung Health is available
    if ('samsungHealth' in window) {
      // Use Samsung Health SDK
      const samsungHealth = (window as any).samsungHealth;
      const result = await samsungHealth.requestPermissions(['steps', 'heartRate', 'calories']);
      return { granted: result.success, platform: 'samsung' };
    }
    
    // For Capacitor/Cordova environment
    if (typeof window !== 'undefined' && 'cordova' in window) {
      // Use Samsung Health Cordova plugin if available
      return new Promise((resolve) => {
        (window as any).cordova.plugins.samsungHealth.requestPermissions(
          ['steps', 'heartRate', 'calories'],
          () => resolve({ granted: true, platform: 'samsung' }),
          (error: any) => resolve({ granted: false, platform: 'samsung', error: error.message })
        );
      });
    }
    
    // Web fallback - check for Samsung browser and assume permission
    if (navigator.userAgent.includes('SamsungBrowser')) {
      console.log('Samsung Health: Detected Samsung browser, assuming permission');
      return { granted: true, platform: 'samsung' };
    }
    
    throw new Error('Samsung Health not available on this device');
  } catch (error) {
    return {
      granted: false,
      platform: 'samsung',
      error: error instanceof Error ? error.message : 'Samsung Health permission denied'
    };
  }
};

// Google Fit integration with real API calls
const requestGoogleFitPermissions = async (): Promise<HealthPermissions> => {
  try {
    console.log('Requesting Google Fit permissions...');
    
    // Check if Google APIs are available
    if (typeof window !== 'undefined' && 'gapi' in window) {
      const gapi = (window as any).gapi;
      
      await new Promise((resolve) => gapi.load('auth2', resolve));
      
      const authInstance = gapi.auth2.getAuthInstance();
      if (!authInstance) {
        await gapi.auth2.init({
          client_id: 'YOUR_GOOGLE_CLIENT_ID', // This should be configured
        });
      }
      
      const user = await gapi.auth2.getAuthInstance().signIn({
        scope: 'https://www.googleapis.com/auth/fitness.activity.read https://www.googleapis.com/auth/fitness.body.read'
      });
      
      return { granted: user.isSignedIn(), platform: 'google' };
    }
    
    // Fallback for Android without Google APIs loaded
    if (navigator.userAgent.includes('Android')) {
      // In a real app, this would use the Google Fit Android SDK
      console.log('Google Fit: Android detected, using fallback permission');
      return { granted: true, platform: 'google' };
    }
    
    throw new Error('Google Fit not available');
  } catch (error) {
    return {
      granted: false,
      platform: 'google',
      error: error instanceof Error ? error.message : 'Google Fit permission denied'
    };
  }
};

// Fetch real health data from the appropriate platform
export const fetchHealthData = async (dateRange: { start: Date; end: Date }): Promise<HealthDataPoint[]> => {
  const platform = detectHealthPlatform();
  const permissions = JSON.parse(localStorage.getItem('healthPermissions') || '{"granted": false}');
  
  if (!permissions.granted) {
    throw new Error('Health permissions not granted');
  }
  
  try {
    switch (platform) {
      case 'apple':
        return await fetchAppleHealthData(dateRange);
      case 'samsung':
        return await fetchSamsungHealthData(dateRange);
      case 'google':
        return await fetchGoogleFitData(dateRange);
      default:
        return [];
    }
  } catch (error) {
    console.error('Error fetching health data:', error);
    // Return empty array instead of mock data when real fetch fails
    return [];
  }
};

// Apple Health data fetching - web fallback only
const fetchAppleHealthData = async (dateRange: { start: Date; end: Date }): Promise<HealthDataPoint[]> => {
  try {
    // Fallback: return empty array instead of mock data
    console.log('Apple HealthKit: Real API not available, returning empty data');
    return [];
  } catch (error) {
    console.error('Apple Health fetch error:', error);
    return [];
  }
};

// Samsung Health data fetching with real API calls
const fetchSamsungHealthData = async (dateRange: { start: Date; end: Date }): Promise<HealthDataPoint[]> => {
  try {
    if ('samsungHealth' in window) {
      const samsungHealth = (window as any).samsungHealth;
      
      const data = await samsungHealth.readData({
        dataTypes: ['steps', 'heartRate', 'calories'],
        startDate: dateRange.start.getTime(),
        endDate: dateRange.end.getTime()
      });
      
      return data.map((item: any) => ({
        steps: item.steps || 0,
        heartRate: item.heartRate || undefined,
        calories: item.calories || undefined,
        timestamp: new Date(item.timestamp)
      }));
    }
    
    // Fallback: return empty array instead of mock data
    console.log('Samsung Health: Real API not available, returning empty data');
    return [];
  } catch (error) {
    console.error('Samsung Health fetch error:', error);
    return [];
  }
};

// Google Fit data fetching with real API calls
const fetchGoogleFitData = async (dateRange: { start: Date; end: Date }): Promise<HealthDataPoint[]> => {
  try {
    if (typeof window !== 'undefined' && 'gapi' in window) {
      const gapi = (window as any).gapi;
      
      const response = await gapi.client.fitness.users.dataSources.datasets.get({
        userId: 'me',
        dataSourceId: 'derived:com.google.step_count.delta:com.google.android.gms:estimated_steps',
        datasetId: `${dateRange.start.getTime()}000000-${dateRange.end.getTime()}000000`
      });
      
      const points = response.result.point || [];
      return points.map((point: any) => ({
        steps: point.value[0]?.intVal || 0,
        timestamp: new Date(parseInt(point.startTimeNanos) / 1000000)
      }));
    }
    
    // Fallback: return empty array instead of mock data
    console.log('Google Fit: Real API not available, returning empty data');
    return [];
  } catch (error) {
    console.error('Google Fit fetch error:', error);
    return [];
  }
};

// Sync health data and update user stats
export const syncHealthData = async (): Promise<{ success: boolean; data?: HealthDataPoint[]; error?: string }> => {
  try {
    const dateRange = {
      start: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
      end: new Date()
    };
    
    const healthData = await fetchHealthData(dateRange);
    
    if (healthData.length > 0) {
      const latestData = healthData[healthData.length - 1];
      return { success: true, data: healthData };
    }
    
    return { success: false, error: 'No health data available from your device' };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to sync health data'
    };
  }
};

// Save permission status
export const saveHealthPermissions = (permissions: HealthPermissions) => {
  localStorage.setItem('healthPermissions', JSON.stringify(permissions));
};

// Check if permissions are granted
export const checkHealthPermissions = (): HealthPermissions => {
  const saved = localStorage.getItem('healthPermissions');
  if (saved) {
    return JSON.parse(saved);
  }
  return { granted: false, platform: 'none' };
};
