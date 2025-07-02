import { useState, useEffect } from 'react';
import { getPlatformInfo, PlatformInfo, getHealthAppName } from '@/utils/platformHealthIntegration';

export const usePlatformHealth = () => {
  const [platformInfo, setPlatformInfo] = useState<PlatformInfo>({
    isNative: false,
    platform: 'web',
    supportsHealthSync: false
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const detectPlatform = async () => {
      try {
        const info = await getPlatformInfo();
        setPlatformInfo(info);
      } catch (error) {
        console.error('Failed to detect platform:', error);
      } finally {
        setIsLoading(false);
      }
    };

    detectPlatform();
  }, []);

  const healthAppName = getHealthAppName(platformInfo.platform);

  return {
    ...platformInfo,
    healthAppName,
    isLoading
  };
};