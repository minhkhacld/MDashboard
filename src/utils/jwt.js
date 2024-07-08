import jwtDecode from 'jwt-decode';
import moment from 'moment';
// routes
import { PATH_AUTH } from '../routes/paths';
import { dispatch } from '../redux/store';
import {
  setShowDialogSessionExpired
} from '../redux/slices/setting';
//
import axios from './axios';

// ----------------------------------------------------------------------

const isValidToken = (accessToken) => {
  // console.log(accessToken);
  if (!accessToken) {
    return false;
  }
  const decoded = jwtDecode(accessToken);

  const currentTime = Date.now() / 1000;
  // console.log(decoded);
  return decoded.exp > currentTime;
};

const handleTokenExpired = (exp) => {

  let expiredTimer;
  const currentTime = Date.now();

  // Test token expires after 15 days
  // const timeLeft = currentTime + 5000 - currentTime; // ~10s
  const timeLeft = currentTime + (15 * 24 * 60 * 60 * 1000) - currentTime;
  // const timeLeft = exp * 1000 - currentTime;
  // console.log(timeLeft);

  clearTimeout(expiredTimer);
  expiredTimer = setTimeout(async () => {
    // eslint-disable-next-line no-alert
    // alert('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại');
    // window.localStorage.removeItem('accessToken');
    // window.location.href = PATH_AUTH.login;
    const newAccessToken = await handleRefreshToken();
    if (newAccessToken === null) {
      // alert('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại');
      window.localStorage.removeItem('accessToken');
      window.localStorage.removeItem('refreshToken');
      // window.location.href = PATH_AUTH.login;
      dispatch(setShowDialogSessionExpired(true))
    };
    const decoded = jwtDecode(newAccessToken);
    axios.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
    handleTokenExpired(decoded.exp);
  }, timeLeft);

};

const setSession = (accessToken) => {
  if (accessToken) {
    window.localStorage.setItem('accessToken', accessToken);
    axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    axios.defaults.headers.common['api-version'] = '1';
    // This function below will handle when token is expired
    const { exp } = jwtDecode(accessToken); // ~5 days by minimals server
    handleTokenExpired(exp);
  } else {
    window.localStorage.removeItem('accessToken');
    window.localStorage.removeItem('refreshToken');
    delete axios.defaults.headers.common.Authorization;
  }
};


export { isValidToken, setSession };


// Function to refresh access token using refresh token
const handleRefreshToken = async () => {
  try {

    const refreshToken = localStorage.getItem('refreshToken');
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
    return newAccessToken;

  } catch (error) {
    console.error('Error refreshing access token:', JSON.stringify(error));
    if (error?.error === "invalid_grant" || JSON.stringify(error).includes("invalid_grant")
    ) {
      return null;
    }

  }
};

