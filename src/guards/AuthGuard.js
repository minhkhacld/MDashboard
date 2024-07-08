import PropTypes from 'prop-types';
import { useState } from 'react';
// import { useLastLocation } from 'react-router-dom-last-location';
import { Navigate, useLocation } from 'react-router-dom';
// hooks
import useAuth from '../hooks/useAuth';
// import { useAuth } from 'oidc-react';
// pages
// import Login from '../pages/auth/Login';
import EbsLogin from '../pages/auth/EbsLogin';
// components
import LoadingScreen from '../components/LoadingScreen';
import useIsOnline from '../hooks/useIsOnline';
import MenuOffline from '../pages/MenuOffline';

// ----------------------------------------------------------------------

AuthGuard.propTypes = {
  children: PropTypes.node,
};

export default function AuthGuard({ children }) {
  const { isAuthenticated, isInitialized, user } = useAuth();
  const { online } = useIsOnline();
  const { pathname } = useLocation();
  // const lastLocation = useLastLocation();
  // const lastPage = lastLocation?.lastLocation?.pathname;
  const [requestedLocation, setRequestedLocation] = useState(null);

  // const lastVisitPage = JSON.parse(localStorage.getItem('lastVisitPage'));
  // console.log(requestedLocation, lastPage, isInitialized, isAuthenticated)

  if (!isInitialized) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated && online) {
    if (pathname !== requestedLocation) {
      setRequestedLocation(pathname);
    }
    return <EbsLogin />;
  }

  // if (lastPage && pathname !== lastPage && lastPage !== "/auth/login" && lastPage !== '/error') {
  //   window.location.href = lastPage;
  //   localStorage.removeItem('lastVisitPage');
  // }

  // if (lastPage && pathname !== lastPage && lastPage !== "/auth/login" && lastPage !== '/error' && pathname !== requestedLocation) {
  //   setRequestedLocation(null);
  //   return <Navigate to={lastPage} />;
  // }

  if (requestedLocation && pathname !== requestedLocation) {
    setRequestedLocation(null);
    return <Navigate to={requestedLocation} />;
  }

  return <>{children}</>;
}
