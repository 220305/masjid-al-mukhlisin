import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.masjid.almukhlisin',
  appName: 'Masjid Al-Mukhlisin',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    cleartext: true,
  },
  plugins: {
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0a1f18',
    },
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: '#0a1f18',
      showSpinner: false,
    },
  },
};

export default config;
