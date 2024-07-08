import { CapacitorConfig } from '@capacitor/cli';
import { Capacitor } from '@capacitor/core';

let config: CapacitorConfig;

const baseConfig: CapacitorConfig = {
  appId: 'com.motivesvn.reactjsebs',
  appName: 'msystem',
  webDir: 'build',
  bundledWebRuntime: false,
};

// CUSTOM ENVIROMENT VARIABLES;
// const PLATFORM = 'ios';
const PLATFORM = 'android';
// useLiveReload = true to enable Live reload mode for debugging;
const useLiveReload = false;
// Codepush server configuration
const STAGING = true;
const ANDROID_DEPLOY_KEY = STAGING ? "ElW4CAonYLD7IqNm9NS8mWWjSN2SpUFtJ7zVV" : "QhTFcQ9ECQA1AuovwK0PglObKmPhAadMxWh4O";
const IOS_DEPLOY_KEY = STAGING ? "X8uXeKZifiaUvJ9ybqVikbz5Q0GRNJ9ANr4Uv" : "NCsABoZPJlXB94NsCHzRLjonAolP-DwNXuH0n";

// specific config for each platform
switch (PLATFORM) {
  case 'ios':
    config = {
      ...baseConfig,
      server: {
        hostname: 'motivesiosapp',
        ...(useLiveReload && {
          // for debugging only do not commit to gihub.
          url: "http://10.10.9.18:5053",
          cleartext: true,
        })
      },
      ios: {
        contentInset: 'always',
        preferredContentMode: "mobile",
      },
      plugins: {
        LocalNotifications: {
          smallIcon: 'ic_stat_motive_logo',
          iconColor: '#488AFF',
          sound: 'notifycation.wav',
        },
        PushNotifications: {
          presentationOptions: ['badge', 'sound', 'alert'],
        },
        SplashScreen: {
          launchShowDuration: 3000,
          launchAutoHide: true,
          backgroundColor: '#ffffffff',
          androidSplashResourceName: 'splash',
          androidScaleType: 'CENTER_CROP',
          showSpinner: true,
          androidSpinnerStyle: 'large',
          iosSpinnerStyle: 'small',
          spinnerColor: '#999999',
          splashFullScreen: true,
          splashImmersive: true,
          layoutName: 'launch_screen',
          useDialog: true,
        },
        "CodePush": {
          "IOS_DEPLOY_KEY": IOS_DEPLOY_KEY,
          "SERVER_URL": "https://codepush.appcenter.ms/",
        },
      },
    };
    break;
  default:
    config = {
      ...baseConfig,
      server: {
        hostname: 'motivesandroidapp',
        androidScheme: 'https',
        ...(useLiveReload && {
          // for debugging only do not commit to gihub
          url: "http://10.10.9.18:5053",
          cleartext: true,
        })
      },
      android: {
        contentInset: 'always',
        allowMixedContent: true,
        preferredContentMode: "mobile",
      },
      plugins: {
        LocalNotifications: {
          smallIcon: 'ic_stat_motive_logo',
          iconColor: '#488AFF',
          sound: 'notifycation.wav',
        },
        PushNotifications: {
          presentationOptions: ['badge', 'sound', 'alert'],
        },
        SplashScreen: {
          launchShowDuration: 3000,
          launchAutoHide: true,
          backgroundColor: '#ffffffff',
          androidSplashResourceName: 'splash',
          androidScaleType: 'CENTER_CROP',
          showSpinner: true,
          androidSpinnerStyle: 'large',
          iosSpinnerStyle: 'small',
          spinnerColor: '#999999',
          splashFullScreen: true,
          splashImmersive: true,
          layoutName: 'launch_screen',
          useDialog: true,
        },
        "CodePush": {
          "ANDROID_DEPLOY_KEY": ANDROID_DEPLOY_KEY,
          "SERVER_URL": "https://codepush.appcenter.ms/",
        },
      },
    };
    break;
}

export default config;
