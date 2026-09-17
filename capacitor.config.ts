import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'fr.carbumap.app',
  appName: 'Carbumap',
  webDir: 'dist',
  android: {
    // Même fond que le thème sombre du site, pour éviter un flash blanc au lancement.
    backgroundColor: '#0d1117',
  },
};

export default config;
