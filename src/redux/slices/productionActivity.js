import { createSlice } from '@reduxjs/toolkit';
// utils

// ----------------------------------------------------------------------

const initialState = {
    error: null,
    loading: null,
    tabListStatus: {
        selectedTabName: null,
        searchValue: {
            onGoing: null,
            finished: null,
            all: null,
        }
    }
};

const slice = createSlice({
    name: 'productionActivity',
    initialState,
    reducers: {
        // HAS ERROR
        hasError(state, action) {
            state.isLoading = false;
            state.error = action.payload;
        },
        setTabListStatus(state, action) {
            state.tabListStatus = action.payload;

        },
    },
});

// Reducer
export default slice.reducer;

export const { setTabListStatus } = slice.actions;
