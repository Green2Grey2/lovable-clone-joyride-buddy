
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.olivevieducla.wellness',
  appName: 'Olive View UCLA Medical Center Wellness',
  webDir: 'dist',
  server: {
    url: 'https://604c372c-6fd6-4281-814e-09088433b7fe.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
  },
};

export default config;
