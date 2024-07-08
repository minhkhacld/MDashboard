import { Capacitor } from '@capacitor/core';
import numeral from 'numeral';
// @mui
import { colors } from '@mui/material';
import { enUS, viVN } from '@mui/material/locale';
// routes
import { PATH_APP } from './routes/paths';
// API
import FailedImg from './assets/images/failed.png';
import PassedImg from './assets/images/passed.png';


// ----------------------------------------------------------------------

export const HOST_API = process.env.REACT_APP_HOST_API_KEY || '';
export const QC_ATTACHEMENTS_HOST_API = process.env.REACT_APP_HOST_ATTACHMENT;
export const SERVER_HOST = process.env.REACT_APP_SERVER_HOST || '';
export const HRM_HOST_API = process.env.REACT_APP_HRM_SERVER;
export const isDev = () => !process.env.NODE_ENV || process.env.NODE_ENV === 'development';


export const LOGIN_CONFIG = {
  grant_type: 'password',
  scope: 'offline_access RealEstate',
  client_id: 'RealEstate_App',
  client_secret: '1q2w3e*',
};

export const APP_VERSIONS = {
  ...(Capacitor.getPlatform() === 'android' && {
    version: '2.4.06072023',
    versionCode: 24,
    lastPublishedDate: 'July, 06, 2023',
    appUrl: 'https://play.google.com/store/apps/details?id=com.motivesvn.reactjsebs',
  }),
  ...(Capacitor.getPlatform() === 'ios' && {
    version: '1.7.06072023',
    versionCode: 1,
    lastPublishedDate: 'July, 06, 2023',
    appUrl: 'https://apps.apple.com/us/app/m-system/id6445936927',
  }),
  ...(Capacitor.getPlatform() === 'web' && {
    version: '2.9.01042024',
    versionCode: 1,
    lastPublishedDate: 'April, 01, 2024',
    appUrlIos: 'https://apps.apple.com/us/app/m-system/id6445936927',
    appUrlAndroid: 'https://play.google.com/store/apps/details?id=com.motivesvn.reactjsebs',
  }),
};

export const PAYMENT_KEY = [
  { label: 'CREDIT NOTE', color: colors.red[500] },
  { label: 'DEBIT NOTE', color: colors.green[500] },
  { label: 'PAYMENT REQUEST', color: colors.indigo[500] },
  { label: 'WIRE TRANSFER REQUEST', color: colors.orange[500] },
  { label: 'ADVANCE REQUEST', color: colors.blue[500] },
  { label: 'ADVANCE SETTLEMENT', color: colors.grey[500] },
  {
    label: 'SHIPMENT STATEMENT REQUEST',
    color: colors.grey[500],
  },
  {
    label: 'BANK ACCOUNT REQUEST',
    color: colors.green[500],
  },
  {
    label: 'QC PLANNING',
    color: colors.green[500],
  },
  {
    label: 'QC INSPECTION',
    color: colors.green[500],
  },
  {
    label: 'COMPLIANCE',
    color: colors.green[500],
  },
  {
    label: 'CALENDAR',
    color: colors.green[500],
  },
  {
    label: 'MQC',
    color: colors.green[500],
  },
];

export const LEGALS = [
  { label: 'MOTIVES INTERNATIONAL (HONG KONG) LIMITED', color: 'success', shortName: 'Motives Int. HK' },
  { label: 'MOTIVES INTERNATIONAL PTE. Ltd', color: 'error', shortName: 'Motives Int. PTE' },
  { label: 'MOTIVES (FAR EAST) LTD', color: 'info', shortName: 'Motives FAR EAST' },
  { label: 'Motives  Asia', color: 'info', shortName: 'Motives ASIA' },
];

export const QC_STATES = ['OPENED', 'FINISHED'];
export const QC_STEPS_CONFIG = [
  'Header',
  'Contents',
  'Inspections',
  'PreProduction',
  'Packing',
  'Measurement',
  'Attachment',
  'PackingAndLabeling',
  'Summary',
];

export const PASSED_IMAGE_SRC = PassedImg;
export const FAILED_IMAGE_SRC = FailedImg;

export const FIREBASE_API = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APPID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

export const COGNITO_API = {
  userPoolId: process.env.REACT_APP_AWS_COGNITO_USER_POOL_ID,
  clientId: process.env.REACT_APP_AWS_COGNITO_CLIENT_ID,
};

export const AUTH0_API = {
  clientId: process.env.REACT_APP_AUTH0_CLIENT_ID,
  domain: process.env.REACT_APP_AUTH0_DOMAIN,
};

// ROOT PATH AFTER LOGIN SUCCESSFUL
export const PATH_AFTER_LOGIN = PATH_APP.general.app; // as '/dashboard/app'
// export const PATH_AFTER_LOGIN = PATH_APP.calendar.activity
// LAYOUT
// ----------------------------------------------------------------------

export const HEADER = {
  // MOBILE_HEIGHT: 64,
  MOBILE_HEIGHT: 48,
  MAIN_DESKTOP_HEIGHT: 88,
  // DASHBOARD_DESKTOP_HEIGHT: 92,
  // DASHBOARD_DESKTOP_OFFSET_HEIGHT: 92 - 32,
  DASHBOARD_DESKTOP_HEIGHT: 50,
  DASHBOARD_DESKTOP_OFFSET_HEIGHT: 50 - 32,
};

export const NAVBAR = {
  BASE_WIDTH: 260,
  DASHBOARD_WIDTH: 280,
  DASHBOARD_COLLAPSE_WIDTH: 88,
  //
  DASHBOARD_ITEM_ROOT_HEIGHT: 48,
  DASHBOARD_ITEM_SUB_HEIGHT: 40,
  DASHBOARD_ITEM_HORIZONTAL_HEIGHT: 32,
};

export const ICON = {
  NAVBAR_ITEM: 22,
  NAVBAR_ITEM_HORIZONTAL: 20,
};

// SETTINGS
// Please remove `localStorage` when you change settings.
// ----------------------------------------------------------------------

export const defaultSettings = {
  themeMode: 'light',
  themeDirection: 'ltr',
  themeContrast: 'default',
  themeLayout: 'horizontal',
  themeColorPresets: 'default',
  themeStretch: false,
};

// MULTI LANGUAGES
// Please remove `localStorage` when you change settings.
// ----------------------------------------------------------------------

export const allLangs = [
  {
    label: 'Vietnamese',
    value: 'vn',
    systemValue: viVN,
    icon: '/assets/icons/flags/Flag_of_Vietnam.png',
    iconName: 'twemoji:flag-vietnam',
  },
  {
    label: 'English',
    value: 'en',
    systemValue: enUS,
    icon: '/assets/icons/flags/Flag_United_Kingdom.png',
    iconName: 'twemoji:flag-united-kingdom',
  },
];

export const defaultLang = allLangs[1]; // English

//  register format number by locale Vietnamese
numeral.register('locale', allLangs[0].value, {
  delimiters: {
    thousands: ',',
    decimal: '.',
  },
  abbreviations: {
    thousand: ' k',
    million: ' tr',
    billion: ' tỷ',
    trillion: ' ng tỷ',
  },
  currency: {
    symbol: 'đ ',
  },
});


const checkNotch = () => {
  const iPhone = /iPhone/.test(navigator.userAgent) && !window.MSStream
  const aspect = window.screen.width / window.screen.height
  if (iPhone && aspect.toFixed(3) === "0.462") {
    // I'm an iPhone X or 11...
    return 55
  }
  return 0;
};

export const NOTCH_HEIGHT = checkNotch();