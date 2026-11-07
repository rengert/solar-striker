import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'net.bolzplatzarena.solarstriker',
  appName: 'Solar Striker',
  webDir: 'dist/solar-striker/browser',
  // keep the game out of the notch/home indicator; Android insets are handled by SystemBars (default 'css')
  ios: { contentInset: 'always', scrollEnabled: false },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: false,
      backgroundColor: '#000000',
      showSpinner: true,
      iosSpinnerStyle: 'small',
      spinnerColor: '#999999',
      splashFullScreen: true,
      splashImmersive: true,
      layoutName: 'LaunchScreen',
      useDialog: true,
    },
  },
};

export default config;
