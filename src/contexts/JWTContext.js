// signalR
import { Capacitor } from '@capacitor/core';
import { Network } from '@capacitor/network';
import { Toast } from '@capacitor/toast';
import jwtDecode from 'jwt-decode';
import PropTypes from 'prop-types';
import { createContext, useEffect, useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
// utils
import axios from 'axios';
import { HOST_API } from '../config';
import { getDeviceId } from '../utils/appDevice';
import axiosInstance from '../utils/axios';
import { setSession, isValidToken } from '../utils/jwt';
// hook
import useLocales from '../hooks/useLocales';
import { getPendingNotification, setDeviceId, updateDeviceInfo } from '../redux/slices/notification';
import { getBackUpData, setAuthenticated } from '../redux/slices/setting';
import { setLoginUserSuccess } from '../redux/slices/workflow';
import { dispatch as StoreDispatch, useSelector } from '../redux/store';
// import startSignalRConnection from '../utils/appSignalR';

// ----------------------------------------------------------------

const checkDeviceId = async (deviceId) => {
  let isValid = true;
  if (deviceId === undefined || deviceId === null) {
    await Toast.show({
      text: 'Device Id not found!'
    })
    isValid = false;
    return isValid
  }
  await axios.get(`${HOST_API}/api/DeviceMobileApi/CheckDeviceValidity/${-1}/${deviceId
    // '7a231012823daf24'
    }`).then(response => {
      console.log('/api/DeviceMobileApi/CheckDeviceValidity/ with response', JSON.stringify(response))
      if (response.data !== true) {
        isValid = false;
        return isValid
      }
      return isValid
    }).catch(error => {
      console.log('/api/DeviceMobileApi/CheckDeviceValidity/ with error', JSON.stringify(error?.response))
      if (JSON.stringify(error?.response?.data).includes('Not found DeviceId:') || JSON.stringify(error?.message).includes('Not found DeviceId:')) {
        isValid = false;
      };
    });
  return isValid;
}

// ----------------------------------------------------------------------
const initialState = {
  isAuthenticated: false,
  isInitialized: false,
  user: null,
  message: null,
  isLoading: false,
  avatar: {
    id: '',
    url: '',
    seal: '',
  },
  userInfo: null,
  loginCount: 5,
};

const handlers = {
  INITIALIZE: (state, action) => {
    const { isAuthenticated, user, avatar, userInfo, userClaim } = action.payload;
    return {
      ...state,
      isAuthenticated,
      isInitialized: true,
      user,
      avatar,
      userInfo,
      userClaim,
    };
  },

  LOGIN: (state, action) => {
    const { user, message, isAuthenticated, isLoading, userClaim, loginCount, } = action.payload;
    return {
      ...state,
      isAuthenticated,
      user,
      message,
      isLoading,
      userClaim,
      loginCount,
    };
  },

  LOGOUT: (state) => ({
    ...state,
    isAuthenticated: false,
    user: null,
  }),

  REGISTER: (state, action) => {
    const { user } = action.payload;
    return {
      ...state,
      isAuthenticated: true,
      user,
    };
  },

  SET_AVATAR: (state, action) => {
    const { avatar } = action.payload;
    return {
      ...state,
      avatar,
    };
  },
};

const reducer = (state, action) => (handlers[action.type] ? handlers[action.type](state, action) : state);

const AuthContext = createContext({
  ...initialState,
  method: 'jwt',
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  register: () => Promise.resolve(),
  setAvartar: () => Promise.resolve(),
});

// ----------------------------------------------------------------------
AuthProvider.propTypes = {
  children: PropTypes.node,
};

function AuthProvider({ children }) {

  const [state, dispatch] = useReducer(reducer, initialState);
  const { pushNotificationToken, isAuthenticated, } = useSelector((store) => store.setting);
  const { translate } = useLocales();
  const lastVisitPage = JSON.parse(localStorage.getItem('lastVisitPage'));
  const navigate = useNavigate();
  const platform = Capacitor.getPlatform();

  useEffect(() => {

    // When user reload the page triger this function
    const initialize = async () => {
      try {

        const deviceId = await getDeviceId();

        // CHECK DEVICE ID
        if (platform !== 'web') {
          StoreDispatch(setDeviceId(deviceId));
          const isValid = await checkDeviceId(deviceId);
          if (!isValid) {
            window.localStorage.removeItem('lastVisitPage');
            return navigate('/invalid-device');
          };
        }

        // IF DEVICE IS VALID
        let accessToken
        // check internet conenction
        const status = await Network.getStatus();

        if (!status.connected) {
          accessToken = window.localStorage.getItem('accessToken');
        }
        else {
          accessToken = await handleRefreshToken();
        }

        // const accessToken = await handleRefreshToken();
        // const accessToken = window.localStorage.getItem('accessToken');
        if (accessToken
          && isValidToken(accessToken)
        ) {

          // startSignalRConnection(accessToken, deviceId)
          setSession(accessToken);
          const decoded = jwtDecode(accessToken);

          //  Get user information
          const res = await axiosInstance
            .get(`${HOST_API}/api/userApi/GetLoginUser/${decoded?.sub}`).then(res => res).catch(err => {
              return handleError(err, `${HOST_API}/api/userApi/GetLoginUser/${decoded?.sub}`)
            });

          if (!res.data) return;

          // if device isvalid
          StoreDispatch(setLoginUserSuccess(res.data));
          StoreDispatch(getPendingNotification(res.data.UserId));
          if (platform !== 'web') {
            StoreDispatch(getBackUpData(res.data.UserId,
              deviceId,
              accessToken
            ));
            StoreDispatch(updateDeviceInfo(decoded?.sub, pushNotificationToken, deviceId));
          }

          const userClaim = await axiosInstance.get(`${HOST_API}/api/UserMobileApi/GetClaimsByUserId/${res.data.UserId}`).then(res => res).catch(err => {
            return handleError(err, `${HOST_API}/api/UserMobileApi/GetClaimsByUserId/${res.data.UserId}`);
          });

          if (userClaim) {
            dispatch({
              type: 'INITIALIZE',
              payload: {
                isAuthenticated: true,
                user: res.data,
                isLoading: false,
                userClaim: userClaim.data,
              },
            });

            if (lastVisitPage !== null && lastVisitPage !== undefined && window.location.pathname !== '/error' && window.location.pathname !== lastVisitPage) {
              navigate(lastVisitPage);
            }
          }
        }
        // token expired
        else {
          dispatch({
            type: 'INITIALIZE',
            payload: {
              isAuthenticated: false,
            },
          });
        }
      }
      // CATCH ERROR
      catch (err) {
        console.error(err);
        dispatch({
          type: 'INITIALIZE',
          payload: {
            isAuthenticated: false,
            user: null,
          },
        });
      }
    };

    initialize();

  }, []);


  // LOGIN FUNCTIONS
  const login = async (userName, password, name) => {
    // Set loading
    dispatch({
      type: 'LOGIN',
      payload: {
        isLoading: true,
      },
    });

    const settings = {
      data: {
        grant_type: process.env.REACT_APP_GRANT_TYPE_LOGIN,
        username: userName,
        password,
        client_id: process.env.REACT_APP_CLIENT_ID,
        client_secret: process.env.REACT_APP_CLIENT_SECRET,
      },
    };

    // check internet conenction
    const status = await Network.getStatus();

    if (Boolean(status.connected) === false) {
      return dispatch({
        type: 'LOGIN',
        payload: {
          user: null,
          isAuthenticated: false,
          message: 'No internet connection, please connect to the internet!',
        },
      });
    };

    // Check authentication
    await axios
      .post(`${process.env.REACT_APP_STS_AUTHORITY}/connect/token`, new URLSearchParams(settings.data))
      .then(async (response) => {
        // console.log('authentication token', JSON.stringify(response.data));
        if (response.data) {
          const accessToken = response.data.access_token;
          const decoded = jwtDecode(accessToken);
          const refreshToken = response.data.refresh_token;
          localStorage.setItem('refreshToken', refreshToken);
          setSession(accessToken);
          //  Get user information
          const res = await axios
            .get(`${HOST_API}/api/userApi/GetLoginUser/${decoded?.sub}`, {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            })

          if (!res.data) return;
          const deviceId = await getDeviceId();

          // CHECK DEVICE ID
          if (platform !== 'web') {
            StoreDispatch(setDeviceId(deviceId));
            const isValid = await checkDeviceId(deviceId);
            if (!isValid) {
              window.localStorage.removeItem('lastVisitPage');
              return navigate('/invalid-device');
            };
          }

          // if device isvalid
          StoreDispatch(setLoginUserSuccess(res.data));
          StoreDispatch(getPendingNotification(res.data.UserId));

          if (platform !== 'web') {
            StoreDispatch(getBackUpData(res.data.UserId,
              deviceId,
              accessToken
            ));
            StoreDispatch(updateDeviceInfo(decoded?.sub, pushNotificationToken, deviceId));
          }

          const userClaim = await axios.get(`${HOST_API}/api/UserMobileApi/GetClaimsByUserId/${res.data.UserId}`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          if (userClaim) {
            dispatch({
              type: 'LOGIN',
              payload: {
                isAuthenticated: true,
                user: res.data,
                isLoading: false,
                message: null,
                userClaim: userClaim?.data,
                loginCount: 5,
              },
            });

            if (!isAuthenticated) {
              StoreDispatch(setAuthenticated(true))
            };

            window.localStorage.setItem('isGrantBiometric', 'true');

            if (lastVisitPage !== null && lastVisitPage !== undefined && window.location.pathname !== '/error' && window.location.pathname !== lastVisitPage) {
              navigate(lastVisitPage);
            };
          };

        } else {
          alert('Something went wrong!');
        }
      })
      .catch((err) => {
        console.log('250 JWT', err.response);
        if (err?.response?.data?.error === 'invalid_grant') {
          dispatch({
            type: 'LOGIN',
            payload: {
              user: null,
              isAuthenticated: false,
              message: state.loginCount > 1 ? `${translate('auth.loginErrorMsg')} (${translate('auth.loginFailedCount')} ${state.loginCount - 1})` : translate('auth.acountLocked'),
              loginCount: state.loginCount > 1 ? state.loginCount - 1 : 0,
            },
          });
        } else {
          dispatch({
            type: 'LOGIN',
            payload: {
              user: null,
              isAuthenticated: false,
              message: translate('auth.loginRequestFailed'),
            },
          });
        }
      });
  };

  const register = async (email, password, firstName, lastName) => {
    const response = await axios.post('/api/account/register', {
      email,
      password,
      firstName,
      lastName,
    });
    const { accessToken, user } = response.data;
    window.localStorage.setItem('accessToken', accessToken);
    dispatch({
      type: 'REGISTER',
      payload: {
        user,
      },
    });
  };

  const logout = async () => {
    setSession(null);
    dispatch({ type: 'LOGOUT' });
    window.localStorage.removeItem('accessToken');
    window.localStorage.removeItem('lastVisitPage');
    window.localStorage.removeItem('refreshToken');
  };

  const setAvartar = async (id, fileName) => {
    dispatch({
      type: 'SET_AVATAR',
      payload: {
        avatar: {
          id,
          url: `/files/host/userprofileimage/${fileName}`,
        },
      },
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        method: 'jwt',
        login,
        logout,
        register,
        setAvartar,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext, AuthProvider };


// function handleError
const handleError = async (error, url) => {
  if (error.response && error.response.status === 401) {
    // Token expired, update token and retry the request
    const refreshToken = localStorage.getItem('refreshToken');
    const newAccessToken = await handleRefreshToken();
    // Retry the original request
    return axiosInstance.get(url, {
      headers: {
        Authorization: `Bearer ${newAccessToken}`
      }
    }).then(res => res)
  }
}



// Function to refresh access token using refresh token
const handleRefreshToken = async () => {
  try {

    const refreshToken = localStorage.getItem('refreshToken');
    // Make a request to your backend server to refresh the access token
    const response = await axios.post(`${process.env.REACT_APP_STS_AUTHORITY}/connect/token`, new URLSearchParams({
      "grant_type": process.env.REACT_APP_GRANT_TYPE_REFRESH_TOKEN,
      "refresh_token": refreshToken,
      client_id: process.env.REACT_APP_CLIENT_ID,
      client_secret: process.env.REACT_APP_CLIENT_SECRET,
    }));

    const data = response.data;
    const newAccessToken = data.access_token;
    localStorage.setItem('refreshToken', data.refresh_token);
    localStorage.setItem('accessToken', newAccessToken);
    axiosInstance.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
    axiosInstance.defaults.headers.common['api-version'] = '1';

    // This function below will handle when token is expired;
    return newAccessToken;

  } catch (error) {
    console.error('Error refreshing access token:', JSON.stringify(error));
    if (error?.error === "invalid_grant" || JSON.stringify(error).includes("invalid_grant")) {
      window.localStorage.removeItem('accessToken');
      window.localStorage.removeItem('refreshToken');
      delete axiosInstance.defaults.headers.common.Authorization;
      throw new Error('Session expired!')
    }
  }
};


