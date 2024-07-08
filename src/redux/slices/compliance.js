import { createSlice } from '@reduxjs/toolkit';
// utils
import axios from '../../utils/axios';
//
import { dispatch } from '../store';

const initialState = {
  loading: null,
  error: null,
  ProductGroup: null,
  ProductLine: null,
  AuditTime: null,
  AuditType: null,
  Brand: null,
  AuditingResult: null,
  FactoryList: null,
  CustomerList: null,
  Auditors: null,
  SubFactoryList: null,
  CompanyList: null,
  Division: null,
  viewOnlyTodo: {},
  minId: 0,
  shouldCallApi: true,
  signalR: {
    id: null,
    sysNo: null,
    qcType: null,
    message: null,
    type: null,
    guid: null,
  },
};

const slice = createSlice({
  name: 'compliance',
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
    // SET ENUM AUDIT TYPE
    setEnumAuditType(state, action) {
      state.AuditType = action.payload;
    },
    // SET ENUM AUDIT TIME
    setEnumAuditTime(state, action) {
      state.AuditTime = action.payload;
    },
    // SET ENUM AUDITING RESULT
    setEnumAuditingResult(state, action) {
      state.AuditingResult = action.payload;
    },
    // SET ENUM PRODUCT GROUP
    setEnumProductGroup(state, action) {
      state.ProductGroup = action.payload;
    },
    // SET ENUM PRODUCT LINE
    setEnumProductLine(state, action) {
      state.ProductLine = action.payload;
    },
    // SET ENUM BRAND
    setEnumBrand(state, action) {
      state.Brand = action.payload;
    },
    // SET FACTORY LIST
    setFactoryList(state, action) {
      state.FactoryList = action.payload;
    },
    // SET CUSTOMER LIST
    setCustomerList(state, action) {
      state.CustomerList = action.payload;
    },
    // SET AUDITORS
    setAuditors(state, action) {
      state.Auditors = action.payload;
    },
    // SET SUBFACTORY LIST
    setSubFactoryList(state, action) {
      state.SubFactoryList = action.payload;
    },
    // SET COMPANY LIST
    setCompanyList(state, action) {
      state.CompanyList = action.payload;
    },
    // SET VIEW ONLT TODO
    setViewOnlyTodo(state, action) {
      state.viewOnlyTodo = action.payload;
    },
    setMinnId(state, action) {
      state.minId = action.payload;
    },
    setShouldCallApi(state, action) {
      state.shouldCallApi = action.payload;
    },
    setComplianceSignalR(state, action) {
      state.signalR = action.payload
    },
    setComplianceEnums(state, action) {
      action.payload.forEach(d => {
        state[d.Name] = [d]
      })
    },
  },
});

// Reducer
export default slice.reducer;

// Actions
export const { startLoading, setCurrentTab, setInspections, setViewOnlyTodo, setMinnId, setShouldCallApi, setComplianceSignalR } = slice.actions;

// get Enums

export const getComplianceEnums = () => {
  const enums = 'ProductGroup,ProductLine,AuditTime,AuditType,Brand,AuditingResult,Division';
  return async () =>
    axios
      .get(`/api/ComplianceMobileApi/GetSysEnumElements_ByEnumNames?enumNames=${enums}`)
      .then((response) => {
        // console.log(response.data);
        dispatch(slice.actions.setComplianceEnums(response.data));
      })
      .catch((err) => {
        console.log(err);
        dispatch(slice.actions.hasError(err));
      });
};
// get Enum AuditType for App
export const getEnumAuditType = () => {
  return async () =>
    axios
      .get(`/api/ComplianceMobileApi/GetSysEnumElements_ByEnumNames?enumNames=AuditType`)
      .then((response) => {
        // console.log(response.data);
        dispatch(slice.actions.setEnumAuditType(response.data));
      })
      .catch((err) => {
        console.log(err);
        dispatch(slice.actions.hasError(err));
      });
};

// get Enum AuditTime for App
export const getEnumAuditTime = () => {
  return async () =>
    axios
      .get(`/api/ComplianceMobileApi/GetSysEnumElements_ByEnumNames?enumNames=AuditTime`)
      .then((response) => {
        // console.log(response.data);
        dispatch(slice.actions.setEnumAuditTime(response.data));
      })
      .catch((err) => {
        console.log(err);
        dispatch(slice.actions.hasError(err));
      });
};
// get Enum AudittingResult for App
export const getEnumAuditingResult = () => {
  return async () =>
    axios
      .get(`/api/ComplianceMobileApi/GetSysEnumElements_ByEnumNames?enumNames=AuditingResult`)
      .then((response) => {
        // console.log(response.data);
        dispatch(slice.actions.setEnumAuditingResult(response.data));
      })
      .catch((err) => {
        console.log(err);
        dispatch(slice.actions.hasError(err));
      });
};
// get Enum ProductLine for App
export const getEnumProductLine = () => {
  return async () =>
    axios
      .get(`/api/ComplianceMobileApi/GetSysEnumElements_ByEnumNames?enumNames=ProductLine`)
      .then((response) => {
        console.log(response.data);
        dispatch(slice.actions.setEnumProductLine(response.data));
      })
      .catch((err) => {
        console.log(err);
        dispatch(slice.actions.hasError(err));
      });
};
// get Enum ProductGroup for App
export const getEnumProductGroup = () => {
  return async () =>
    axios
      .get(`/api/ComplianceMobileApi/GetSysEnumElements_ByEnumNames?enumNames=ProductGroup`)
      .then((response) => {
        console.log(response.data);
        dispatch(slice.actions.setEnumProductGroup(response.data));
      })
      .catch((err) => {
        console.log(err);
        dispatch(slice.actions.hasError(err));
      });
};
// get Enum Brand for App
export const getEnumBrand = () => {
  return async () =>
    axios
      .get(`/api/ComplianceMobileApi/GetSysEnumElements_ByEnumNames?enumNames=Brand`)
      .then((response) => {
        // console.log(response.data);
        dispatch(slice.actions.setEnumBrand(response.data));
      })
      .catch((err) => {
        console.log(err);
        dispatch(slice.actions.hasError(err));
      });
};
// get Factory List
export const getFactoryList = () => {
  return async () =>
    axios
      .get(`/api/ComplianceMobileApi/GetFactoryList`)
      .then((response) => {
        // console.log(response.data);
        dispatch(slice.actions.setFactoryList(response.data));
      })
      .catch((err) => {
        console.log(err);
        dispatch(slice.actions.hasError(err));
      });
};
// get Customer List
export const getCustomerList = () => {
  return async () =>
    axios
      .get(`/api/ComplianceMobileApi/GetCustomerList`)
      .then((response) => {
        // console.log(response.data);
        dispatch(slice.actions.setCustomerList(response.data));
      })
      .catch((err) => {
        console.log(err);
        dispatch(slice.actions.hasError(err));
      });
};
// Get Employee List
export const getAuditors = () => {
  return async () =>
    axios
      .get(`/api/ComplianceMobileApi/GetEmployeeList`)
      .then((response) => {
        // console.log(response.data);
        dispatch(slice.actions.setAuditors(response.data));
      })
      .catch((err) => {
        console.log(err);
        dispatch(slice.actions.hasError(err));
      });
};
// Get SubFactory List
export const getSubFactoryList = () => {
  return async () =>
    axios
      .get(`/api/ComplianceMobileApi/GetSubFactoryList`)
      .then((response) => {
        // console.log(response.data);
        dispatch(slice.actions.setSubFactoryList(response.data));
      })
      .catch((err) => {
        console.log(err);
        dispatch(slice.actions.hasError(err));
      });
};

// get Company List
export const getCompanyList = () => {
  return async () =>
    axios
      .get(`/api/ComplianceMobileApi/GetCompanyList`)
      .then((response) => {
        // console.log(response.data);
        dispatch(slice.actions.setCompanyList(response.data));
      })
      .catch((err) => {
        console.log(err);
        dispatch(slice.actions.hasError(err));
      });
};
