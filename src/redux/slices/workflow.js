import { createSlice } from '@reduxjs/toolkit';
// utils
import axios from '../../utils/axios';
//
import { dispatch } from '../store';

// ----------------------------------------------------------------------

const initialState = {
  isLoading: null,
  error: null,
  WFInstance: null,
  WFInstanceDocument: null,
  LoginUser: null,
  RelatedDocGuid: null,
  AllUser: null,
};

const slice = createSlice({
  name: 'workflow',
  initialState,
  reducers: {
    // START LOADING
    startLoading(state) {
      state.isLoading = true;
    },
    // HAS ERROR
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    // GET wf
    setWFInstanceWithToken(state, action) {
      state.WFInstance = action.payload;
    },
    // set WFInstanceDocument
    setWFInstanceDocument(state, action) {
      state.WFInstanceDocument = action.payload;
    },
    // setLoginUserSuccess
    setLoginUserSuccess(state, action) {
      state.LoginUser = action.payload;
    },
    // set related doc guide
    setRelatedDocGuid(state, action) {
      state.RelatedDocGuid = action.payload;
    },
    // set all user success
    setAllUserSuccess(state, action) {
      state.AllUser = action.payload;
    },

  },
});

// Reducer
export default slice.reducer;

// Actions
export const { getApproveWFSuccess, setLoginUserSuccess } = slice.actions;
// ----------------------------------------------------------------------

// GET APPROVE WORKFLOW
export function getWFInstanceWithToken(paymentId) {
  return async () => {
    try {
      await axios.get(`/api/FRApprovalApi/GetWFInstance/${paymentId}`).then((response) => {
        // console.log('GetWFInstance', response.data);
        dispatch(slice.actions.setWFInstanceWithToken(response.data));
      });
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

// GET WORKFLOW DOCUMENTS
export function getWFInstanceDocument(paymentId) {
  return async () => {
    try {
      await axios.get(`/api/FRApprovalApi/GetDocuments?key=${paymentId}`).then((response) => {
        // console.log('GetDocumentsWithToken', response.data);
        dispatch(slice.actions.setWFInstanceDocument(response.data.data));
      });
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

// GET EMPLOYEELIST
export function getEmployeeInfo(userId) {
  return async () => {
    await axios
      .get(`/api/userApi/GetLoginUser/${userId}`)
      .then((response) => {
        // console.log('GetLoginUser', response.data);
        dispatch(slice.actions.setLoginUserSuccess(response.data));
      })
      .catch((err) => console.error(err));
  };
}

// GET EMPLOYEELIST
export function getPaymentRelatedDocGuid(paymentId) {
  return async () => {
    await axios
      .get(`/api/FRApprovalApi/GetPaymentRelatedDocGuid/${paymentId}`)
      .then((response) => {
        // console.log('GetPaymentRelatedDocGuid', response.data);
        dispatch(slice.actions.setRelatedDocGuid(response.data));
      })
      .catch((err) => console.error(err));
  };
}

// GET ALL USER
export function getAllUser() {
  return async () => {
    await axios
      .get(`/api/userApi/GetAllUser`)
      .then((response) => {
        // console.log('GetAllUser', response.data);
        dispatch(slice.actions.setAllUserSuccess(response.data));
      })
      .catch((err) => console.error(err));
  };
}
