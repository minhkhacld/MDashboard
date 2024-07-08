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
  RelatedDocGuid: null,
};

const slice = createSlice({
  name: 'bankAccount',
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
    setWFInstance(state, action) {
      state.WFInstance = action.payload;
    },
    // set WFInstanceDocument
    setWFInstanceDocument(state, action) {
      state.WFInstanceDocument = action.payload;
    },
    // set related doc guide
    setRelatedDocGuid(state, action) {
      state.RelatedDocGuid = action.payload;
    },
  },
});

// Reducer
export default slice.reducer;

// Actions
// export const { getApproveWFSuccess } = slice.actions;
// ----------------------------------------------------------------------

// GET BANKACCOUNT WORKFLOW
export function getWFInstance(bankAccountId) {
  return async () => {
    try {
      await axios.get(`/api/BankAccountApi/GetWFInstance/${bankAccountId}`).then((response) => {
        // console.log('getWFInstance', response.data);
        dispatch(slice.actions.setWFInstance(response.data));
      });
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

// GET BANKACCOUNT WORKFLOW DOCUMENTS
export function getWFInstanceDocument(bankAccountId) {
  return async () => {
    try {
      await axios.get(`/api/ShipmentStatementReviewApi/GetDocuments?key=${bankAccountId}`).then((response) => {
        // console.log('getWFInstanceDocument', response.data);
        dispatch(slice.actions.setWFInstanceDocument(response.data.data));
      });
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

// GET BANKACCOUNT DocGuid
export function getShipmentRelatedDocGuid(bankAccountGuid) {
  return async () => {
    await axios
      .get(`/api/AttachmentApi/${bankAccountGuid}/attachments`)
      .then((response) => {
        // console.log('getShipmentRelatedDocGuid', response);
        dispatch(slice.actions.setRelatedDocGuid(response.data.Self));
      })
      .catch((err) => console.error(err));
  };
}
