import React, { useState, useEffect } from 'react';
import { dispatch, useSelector } from '../redux/store';

const useIsOnline = () => {
  // const [online, isOnline] = useState(navigator.onLine);

  // const setOnline = () => {
  //   console.log('We are online!');
  //   isOnline(true);
  // };
  // const setOffline = () => {
  //   console.log('We are offline!');
  //   isOnline(false);
  // };

  // // Register the event listeners
  // useEffect(() => {
  //   window.addEventListener('offline', setOffline);
  //   window.addEventListener('online', setOnline);
  //   // cleanup if we unmount
  //   return () => {
  //     window.removeEventListener('offline', setOffline);
  //     window.removeEventListener('online', setOnline);
  //   };
  // }, []);
  const { isOfflineMode } = useSelector((store) => store.setting);
  const [online, isOnline] = useState(isOfflineMode);
  useEffect(() => {
    isOnline(isOfflineMode);
  }, [isOfflineMode])
  // const online = isOfflineMode;
  return { online };
};

export default useIsOnline;
