import axios from 'axios';
// config
import { HOST_API } from '../config';
import { isValidToken } from './jwt';

// ----------------------------------------------------------------------

const axiosInstance = axios.create({
  baseURL: HOST_API,
});



axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('error.response.status', error.response.status);
    if (error.response && error?.response?.status === 401) {
      // Token expired, update token and retry the request
      /* eslint-disable-next-line */
      return new Promise((resolve, reject) => {
        const refreshToken = localStorage.getItem('refreshToken');
        handleRefreshToken().then(newAccessToken => {
          // Retry the original request
          const originalRequest = error.config;
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          axiosInstance.request(originalRequest).then(response => {
            resolve(response);
          })
            .catch(err => {
              reject(err);
            });
        });

      });
    }
    if (error.response && error.response?.status === 404) {
      // Token expired, update token and retry the request
      return Promise.reject((error.response && error.response?.data) || { status: 404, message: 'API not found! please check the requets URL and try again' })
    }
    return Promise.reject((error.response && error.response.data) || 'Something went wrong! Please check your internet connection')
  }
);

export default axiosInstance;


// Function to refresh access token using refresh token
export const handleRefreshToken = async () => {
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
    return newAccessToken;

  } catch (error) {
    console.error('Error refreshing access token:', JSON.stringify(error));
    if (error?.error === "invalid_grant" || JSON.stringify(error).includes("invalid_grant")
    ) {
      return null;
    }

  }
};
