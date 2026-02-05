import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nexa.dashboard',
  appName: 'Dashboard App',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    LiveUpdates: {
      appId: 'YOUR_APPFLOW_APP_ID',
      channel: 'Production',
      autoUpdateMethod: 'background',
      key: 'YOUR_PUBLIC_KEY',
    },
  },

};

export default config;
