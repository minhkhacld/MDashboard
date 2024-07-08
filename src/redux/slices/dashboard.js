import { createSlice } from '@reduxjs/toolkit';
// utils

// ----------------------------------------------------------------------
const initialState = {
  error: null,
  loading: false,

};

const slice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    // HAS ERROR
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },

  },
});

// Reducer
export default slice.reducer;

