import { createSlice } from '@reduxjs/toolkit';
// utils
//

// ----------------------------------------------------------------------

const initialState = {
  loading: null,
  error: null,
  currentTab: '1',
  inspectionList: [],
  shouldCallApi: true,
  minId: 0,
  modalContent: {
    visible: false,
    item: null,
    isAddNew: false,
  },
  signalR: {
    id: null,
    sysNo: null,
    qcType: null,
    message: null,
    type: null,
    guid: null,
  },
  uploadProgress: 0,
  uploadQueue: [],
  uploadingItem: null,
  disableResubmit: true,

};

const slice = createSlice({
  name: 'qc',
  initialState,
  reducers: {
    // START LOADING
    startLoading(state, action) {
      state.loading = action.payload;
    },
    // HAS ERROR
    hasError(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    // SET CURRENT TAB
    setCurrentTab(state, action) {
      state.currentTab = action.payload;
    },
    // Set INSPECTION LIST
    setInspections(state, action) {
      state.inspectionList = action.payload;
    },
    setShouldCallApi(state, action) {
      state.shouldCallApi = action.payload;
    },
    setMinnId(state, action) {
      state.minId = action.payload;
    },
    setModalContent(state, action) {
      state.modalContent = action.payload;
    },
    setSignalR(state, action) {
      state.signalR = action.payload
    },
    setUploadProgress(state, action) {
      state.uploadProgress = action.payload
    },
    setUploadQueue(state, action) {
      state.uploadQueue = action.payload
    },
    setUploadingItem(state, action) {
      state.uploadingItem = action.payload;
    },
    resetSubmiting(state, action) {
      state.uploadProgress = 0;
      state.uploadQueue = [];
      state.uploadingItem = null;
      state.loading = false;
    },
    setDisableResubmit(state, action) {
      state.disableResubmit = action.payload;
    },
  },
});

// Reducer
export default slice.reducer;

// Actions
export const { startLoading, setCurrentTab, setInspections, setShouldCallApi, setMinnId, setModalContent, setSignalR, setUploadProgress, setUploadQueue, setUploadingItem, resetSubmiting, setDisableResubmit } = slice.actions;
// ----------------------------------------------------------------------

// const addNewTable = (tableData, tableName) =>
//   new Promise((resolve) => {
//     tableData.forEach((d) => db[tableName].add(d));
//     resolve('finished');
//   });
