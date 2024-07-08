// Capacitor
import { AppState, App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { TextZoom } from "@capacitor/text-zoom";
// React
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LastLocationProvider } from 'react-router-dom-last-location';
import {
  useErrorBoundary
} from "react-use-error-boundary";
import Router from './routes';
// theme
import ThemeProvider from './theme';
// components
import MotionLazyContainer from './components/animate/MotionLazyContainer';
import { ChartStyle } from './components/chart';
import NotistackProvider from './components/NotistackProvider';
import { ProgressBarStyle } from './components/ProgressBar';
import ThemeSettings from './components/settings';
import './devextreme.css';
// hooks
import useIsOnline from './hooks/useIsOnline';
// Redux
import SessionExpired from './components/dialog/SessionExpired';
import DoneButton from './components/DoneButton';
import CustomWebWorkerProvider from './components/WebWorkerProvider';
import useSilentAuth from './hooks/useSilentAuth';
import { useSelector } from './redux/store';
import CheckAppOTAUpdate from './utils/appOTAUpdate';
import CheckAppUpdate from './utils/appUpdate';
import { handleRefreshToken } from './utils/axios';
import PushNotificationsContainer from './utils/capacitorNotification';


// ----------------------------------------------------------------------
export default function App() {

  // hooks
  const location = useLocation();
  const navigate = useNavigate();
  const { pathname } = location;
  const { online } = useIsOnline();
  const { isAuthenticated } = useSelector((store) => store.setting);
  // const { deviceId } = useSelector(store => store.notification);
  const platform = Capacitor.getPlatform();

  // error handlers
  const [error, errorInfo] = useErrorBoundary(
    (error, errorInfo) => {
      if (pathname !== "/error" && error) {
        navigate('/error', {
          state: {
            error: {
              message: error?.message,
              pathname,
              componentStack: errorInfo.componentStack,
            }
          }
        });
      }
    }
  );

  // for silient renew refresh token
  useSilentAuth();

  // side effect to handle custom configs
  useEffect(() => {

    const showMenuOffline = !pathname.includes('/qc') && !pathname.includes('/mqc') && !pathname.includes('/compliance');

    if (!online && showMenuOffline && isAuthenticated) {
      navigate('/offline');
    };

    if (platform === 'android') {
      TextZoom.set({ value: 1 }).then(res => console.log('set TextZoom result', JSON.stringify(res))).catch(error => console.log('set TextZoom errors', JSON.stringify(error)));
    };

    CapacitorApp.addListener('appStateChange', (appState: AppState) => {
      // console.log(appState);
      if (appState.isActive) {
        handleRefreshToken()
      }
    });
  }, [online]);


  if (platform !== 'web') {
    PushNotificationsContainer();
  };

  return (
    <MotionLazyContainer>
      <ThemeProvider>
        <ThemeSettings>
          <NotistackProvider>
            <ProgressBarStyle />
            <ChartStyle />
            <LastLocationProvider>
              <CustomWebWorkerProvider>
                <Router />
              </CustomWebWorkerProvider>
            </LastLocationProvider>
            <CheckAppUpdate />
            <CheckAppOTAUpdate />
            <DoneButton />
            <SessionExpired />
          </NotistackProvider>
        </ThemeSettings>
      </ThemeProvider>
    </MotionLazyContainer>
  );
}
