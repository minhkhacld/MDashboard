import { createStore } from 'devextreme-aspnet-data-nojquery';
import CustomStore from 'devextreme/data/custom_store';
import DataSource from 'devextreme/data/data_source';
import { HOST_API } from '../config';
import axios from '../utils/axios';
import useAccessToken from './useAccessToken';
// ------------------------------------------
const useCreateDataSource = (
  apiUrl,
  filter = [],
  sort = [],
  group = []
  // cacheRawData = true, loadMode = 'raw'
) => {
  const API_URL = `${HOST_API}${apiUrl}`;
  const accessToken = useAccessToken();
  return new DataSource({
    store: createStore({
      key: 'Id',
      loadUrl: API_URL,
      insertUrl: API_URL,
      updateUrl: API_URL,
      deleteUrl: API_URL,
      onBeforeSend: (method, ajaxOptions) => {
        // console.log(accessToken);
        const newAccessToken = localStorage.getItem('accessToken');
        ajaxOptions.headers = { Authorization: `Bearer ${newAccessToken}` };
      },
      // cacheRawData,
      // loadMode,
    }),
    // filter: [['productNoteId', '=', productNoteId], 'AND', ['expenseTypeId', '<>', null]],
    filter,
    sort,
    group,
    requireTotalCount: true,
    // "requireGroupCount": null,
    // "isCountQuery": null,
    // "skip": 0,
    // "take": 20,
    // "sort": null,
    // "group": null,
    // "filter": null,
    // "totalSummary": null,
    // "groupSummary": null,
    // "select": null,
    // "preSelect": null,
    // "remoteSelect": null,
    // "remoteGrouping": null,
    // "primaryKey": null,
    // "defaultSort": null,
    // "stringToLower": null
  });
};

export const useCreateStore = (
  apiUrl
  // filter = []
  //  cacheRawData = true, loadMode = 'raw'
) => {
  const API_URL = `${HOST_API}${apiUrl}`;
  return createStore({
    key: 'id',
    loadUrl: API_URL,
    insertUrl: API_URL,
    updateUrl: API_URL,
    deleteUrl: API_URL,
    onBeforeSend: (method, ajaxOptions) => {
      ajaxOptions.headers = { Authorization: `Bearer ${accessToken}` };
    },
    // cacheRawData,
    // loadMode,
  });
};

export const useCustomStore = (apiUrl, filter = []) => {
  return new CustomStore({
    key: 'id',
    load: async () => {
      // console.log(loadOptions);
      await axios.get(apiUrl).then((res) => console.log(res));
    },
    insert: (values) => {
      // ...
    },
    update: (key, values) => {
      // ...
    },
    remove: (key) => {
      // ...
    },
    filter,
  });
};

export default useCreateDataSource;
