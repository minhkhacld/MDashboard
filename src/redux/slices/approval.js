import { createSlice } from '@reduxjs/toolkit';
// utils

// ----------------------------------------------------------------------

const initialState = {
  error: null,
  loading: null,
  currentTab: {
    pending: null,
    all: null,
    recall: null,
  },
};

const slice = createSlice({
  name: 'approval',
  initialState,
  reducers: {
    // HAS ERROR
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    // USE THIS TO SET CURRENT ATTACHEMENT FOR APPROVE DETAIL PAGE
    setCurrentTabs(state, action) {
      state.currentTab = {
        ...state.currentTab,
        pending: action.payload.pending ? action.payload.pending : state.currentTab.pending,
        all: action.payload.all ? action.payload.all : state.currentTab.all,
        recall: action.payload.recall ? action.payload.recall : state.currentTab.recall,
      };
    },
  },
});

// Reducer
export default slice.reducer;

export const { setCurrentTabs } = slice.actions;
