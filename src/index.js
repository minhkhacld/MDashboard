import { Capacitor } from '@capacitor/core';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { Network } from '@capacitor/network';
import { Toast } from '@capacitor/toast';
import { defineCustomElements } from '@ionic/pwa-elements/loader';
// import { InstallMode, SyncStatus, codePush } from 'capacitor-codepush';
import { useEffect } from 'react';
import {
  ErrorBoundaryContext,
} from "react-use-error-boundary";
// i18n
import './locales/i18n';

// highlight
import './utils/highlight';

// scroll bar
import 'simplebar/src/simplebar.css';

// lightbox
import 'react-image-lightbox/style.css';

// editor
import 'react-quill/dist/quill.snow.css';

// slick-carousel
import 'slick-carousel/slick/slick-theme.css';
import 'slick-carousel/slick/slick.css';

// lazy image
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import 'react-lazy-load-image-component/src/effects/black-and-white.css';
import 'react-lazy-load-image-component/src/effects/blur.css';
import 'react-lazy-load-image-component/src/effects/opacity.css';
import { Provider as ReduxProvider } from 'react-redux';
import { BrowserRouter, } from 'react-router-dom';
import { PersistGate } from 'redux-persist/lib/integration/react';
// @mui
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
// redux
import { dispatch, persistor, store } from './redux/store';
// contexts
import App from './App';
import { CollapseDrawerProvider } from './contexts/CollapseDrawerContext';
import { AuthProvider } from './contexts/JWTContext';
import { SettingsProvider } from './contexts/SettingsContext';
import './index.css';
import { setDarkStatusbar } from './pages/dashboard/GeneralApp';
import { setStartingAppUpdate, setUpdateInfo, setUpdateMessage } from './redux/slices/setting';
import reportWebVitals from './reportWebVitals';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

// ----------------------------------------------------------------------

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

function AppLevelEntryModule() {

  // code push implementation
  // useEffect(() => {

  //   setDarkStatusbar();

  //   const isWeb = Capacitor.getPlatform() === 'web';

  //   if (isWeb) return;

  //   (async () => {

  //     const { connected } = await Network.getStatus();

  //     if (!connected) return;

  //     await codePush.notifyApplicationReady();

  //     const downloadProgress = (progress) => {
  //       if (progress) {
  //         console.log('codePush Progress', JSON.stringify(progress));
  //       };
  //     };

  //     codePush.sync(
  //       {
  //         updateDialog: {
  //           appendReleaseDescription: true,
  //           descriptionPrefix: "\n\nChange logs:\n",
  //         },
  //         installMode: InstallMode.IMMEDIATE,
  //         mandatoryInstallMode: InstallMode.IMMEDIATE,
  //         onSyncError: async (error) => {
  //           await Toast.show({ text: `Update failed: ${JSON.stringify(error)}`, duration: 'long' });
  //           dispatch(setStartingAppUpdate(false));
  //         },
  //         onSyncStatusChanged: (status) => {
  //           // console.log('synce status changed', JSON.stringify(status));
  //           switch (status) {
  //             case SyncStatus.DOWNLOADING_PACKAGE:
  //               dispatch(setStartingAppUpdate(true));
  //               dispatch(setUpdateMessage(`Downloading package...`));
  //               break;
  //             case SyncStatus.INSTALLING_UPDATE:
  //               // Hide "downloading" modal
  //               dispatch(setUpdateMessage(`Installing package...`));
  //               break;
  //             case SyncStatus.UPDATE_INSTALLED:
  //               dispatch(setUpdateMessage(`Finalizing and reload application...`));
  //               dispatch(setStartingAppUpdate(false));
  //               break;
  //             default:
  //             // console.log('default');
  //           }
  //         },
  //       }
  //       ,
  //       downloadProgress).then(async syncStatus => {
  //         // console.log('syncStatus', JSON.stringify(syncStatus));
  //         if (syncStatus === SyncStatus.UPDATE_INSTALLED) {
  //           await Toast.show({ text: 'New version has been installed!', duration: 'long' });
  //         }
  //       }).catch(err => {
  //         alert(JSON.stringify(err));
  //       });

  //     const file = await Filesystem.readFile({
  //       path: `codepush/currentPackage.json`,
  //       encoding: Encoding.UTF8,
  //       directory: Directory.Data,
  //     });

  //     const appVersion = JSON.parse(file.data);
  //     if (appVersion) {
  //       dispatch(setUpdateInfo(appVersion));
  //     };

  //   })();

  // }, []);


  return (
    <BrowserRouter>
      <AuthProvider>
        <HelmetProvider>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <SettingsProvider>
              <CollapseDrawerProvider>
                <ErrorBoundaryContext>
                  <App />
                </ErrorBoundaryContext >
              </CollapseDrawerProvider>
            </SettingsProvider>
          </LocalizationProvider>
        </HelmetProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

root.render(
  <ReduxProvider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <AppLevelEntryModule />
    </PersistGate>
  </ReduxProvider>
);

// Call the element loader after the app has been rendered the first time
defineCustomElements(window);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.unregister();
// serviceWorkerRegistration.register();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
