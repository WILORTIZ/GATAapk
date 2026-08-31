import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gata.turnos',
  appName: 'GATA',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  android: {
    backgroundColor: '#f8fafc',
    allowMixedContent: true
  }
};

export default config;
