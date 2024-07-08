import { createSlice } from '@reduxjs/toolkit';
// utils
//

// ----------------------------------------------------------------------

const initialState = {
  complianceListTab: '1',
  complianceDetailTab: '1',
};

const slice = createSlice({
  name: 'tabs',
  initialState,
  reducers: {
    // START LOADING
    setTabComplianceList(state, actions) {
      state.complianceListTab = actions.payload;
    },
    // TABS COMPLIANCE DETAIL
    setTabComplianceDetail(state, actions) {
      state.complianceDetailTab = actions.payload;
    },
  },
});

// Reducer
export default slice.reducer;

// Actions
export const { setTabComplianceList, setTabComplianceDetail } = slice.actions;
// ----------------------------------------------------------------------
