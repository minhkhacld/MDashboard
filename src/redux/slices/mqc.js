import { createSlice } from '@reduxjs/toolkit';
// utils
import { mqcDB } from '../../Db';
import axios from '../../utils/axios';
import { dispatch } from '../store';
//

const initialState = {
  loading: null,
  error: null,
  // MQCList: [],
  attachmentMinId: 0,
  Enums: [],
  isViewOnly: false,
  currentTab: '2',
  shouldCallApi: true,
  values: null,
  currentRootId: null,
  signalR: {
    // id: null,
    // sysNo: null,
    // qcType: null,
    // message: null,
    // type: null,'
    user: null,
    message: null,
    id: null,
    guid: null,
    type: null,
    sysNo: null,
    qcType: null,
    apiType: null,
  },
};

const slice = createSlice({
  name: 'mqc',
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
    // // SET ENUM AUDIT TYPE
    // setMqcList(state, action) {
    //   state.MQCList = action.payload;
    // },
    setAttachmentMinId(state, action) {
      state.attachmentMinId = action.payload;
    },
    // SET ENUMS
    setEnums(state, action) {
      state.Enums = action.payload;
    },
    // SET VIEWONLY
    setIsViewOnly(state, action) {
      state.isViewOnly = action.payload;
    },
    // SET CURRENT TAB
    setCurrentTab(state, action) {
      state.currentTab = action.payload;
    },
    // SET SHOULD CALL API
    setShouldCallApi(state, action) {
      state.shouldCallApi = action.payload;
    },
    // SET FORM VALUES
    setValues(state, action) {
      state.values = action.payload;
    },
    // SET CURRENT ROOT ID
    setCurrentRootId(state, action) {
      state.currentRootId = action.payload;
    },
    // SET SIGNALR
    setSignalR(state, action) {
      state.signalR = action.payload;
    },
  },
});

// Reducer
export default slice.reducer;

// Actions
export const {
  setAttachmentMinId,
  setIsViewOnly,
  setCurrentTab,
  setShouldCallApi,
  setValues,
  setCurrentRootId,
  setSignalR,
  startLoading,
} = slice.actions;

// GET ENUMS FOR APP
export function getEnums(enqueueSnackbar) {
  return async () => {
    try {
      const getEnums = axios.get(
        `api/QCMobileApi/GetSysEnumElements_ByEnumNames?enumNames=Color,ItemType,SizeWidthLength,AuditingResult,Unit,Category`
      );
      const getArtCode = axios.get(`/api/CommonLookupApi/GetMaterial_POMaterial`);
      const getSubFactory = axios.get(`/api/CommonLookupApi/GetSubFactory`);
      const getSupplier = axios.get(`/api/CommonLookupApi/Get/BusinessPartner?discriminator=Supplier`);
      const getCustomers = axios.get(`/api/CustomerApi/GetLookup`);
      const getAuditor = axios.get(`/api/QIMaterialFabricApi/GetEmployeeByGroup?groupName=MQCTeam`);
      const getDefectData = axios.get(`/api/QIMaterialFabricApi/GetDefectDataByMQCInspectionTemplate`);
      await Promise.all([
        getEnums,
        getArtCode,
        getSubFactory,
        getSupplier,
        getCustomers,
        getAuditor,
        getDefectData,
      ]).then((response) => {
        // console.log(response);
        if (response) {
          mqcDB.Enums.clear();
          const Enums = response[0]?.data;
          const ArtCode = { Name: 'ArtCode', Elements: response[1]?.data.data };
          const SubFactory = { Name: 'SubFactory', Elements: response[2]?.data.data };
          const Supplier = { Name: 'Supplier', Elements: response[3]?.data.data };
          const Customers = { Name: 'Customers', Elements: response[4]?.data.data };
          const Auditor = { Name: 'Auditor', Elements: response[5]?.data.data };
          const DefectData = { Name: 'DefectData', Elements: response[6]?.data.data };
          const AllData = [...Enums, ArtCode, SubFactory, Supplier, Customers, Auditor, DefectData];
          // console.log(AllData);
          dispatch(slice.actions.setEnums(AllData));
          mqcDB.Enums.bulkAdd(AllData);
        }
      });
    } catch (error) {
      dispatch(slice.actions.hasError(error));
      console.log(error);
      enqueueSnackbar(JSON.stringify(error), {
        variant: 'error',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center',
        },
      });
    }
  };
}
