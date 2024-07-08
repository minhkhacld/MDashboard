// config
import { HOST_API } from '../config';

export const getCreateStoreProps = (apiUrl) => {
  const accessToken = localStorage.getItem('accessToken');
  return {
    key: 'id',
    loadUrl: `${HOST_API}${apiUrl}`,
    insertUrl: `${HOST_API}${apiUrl}`,
    updateUrl: `${HOST_API}${apiUrl}`,
    deleteUrl: `${HOST_API}${apiUrl}`,
    onBeforeSend: (method, ajaxOptions) => {
      ajaxOptions.headers = { Authorization: `Bearer ${accessToken}` };
    },
  };
};

export const getDropDownCreateStoreProps = (apiUrl) => {
  const accessToken = localStorage.getItem('accessToken');
  return {
    key: 'id',
    loadUrl: `${HOST_API}${apiUrl}`,
    onBeforeSend: (method, ajaxOptions) => {
      ajaxOptions.headers = { Authorization: `Bearer ${accessToken}` };
    },
  };
};
