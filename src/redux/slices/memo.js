import { createSlice } from '@reduxjs/toolkit';
// utils
//

// ----------------------------------------------------------------------

const initialState = {
    loading: null,
    error: null,
    complianceSearchValue: '',
    complianceFilter: ['WFStatusName', '=', 'Open'],
    complianceItemSelectedIndex: null,
    mqcSearchValue: '',
    qcSearchValue: '',
    qcFilterObj: null,

};

const slice = createSlice({
    name: 'memo',
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

        // SET SEARCHVALUE
        setMemoSearchValue(state, action) {
            state[action.payload.field] = action.payload.value;
        },

        // SET COMPLIANCE FILTER
        setComplianceFilter(state, action) {
            state.complianceFilter = action.payload;
        },

        // SET QC FILTER OBJ
        setQCfilterObj(state, action) {
            state.qcFilterObj = action.payload;
        },

        // SET ITEM SELECTED
        setMemoSelectedItemIndex(state, action) {
            state[action.payload.field] = action.payload.value;
        },
    },
});

// Reducer
export default slice.reducer;

// Actions
export const { startLoading, hasError, setMemoSearchValue, setComplianceFilter, setQCfilterObj, setMemoSelectedItemIndex } = slice.actions;
// ----------------------------------------------------------------------

