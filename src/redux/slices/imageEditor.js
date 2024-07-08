import { createSlice } from '@reduxjs/toolkit';
// ----------------------------------------------------------------------

const initialState = {
  ARROW: {
    stroke: '#FF3030',
    strokeWidth: 8,
  },
  TEXT: {
    stroke: '#FF3030',
  },
  RECT: {
    stroke: '#FF3030',
    strokeWidth: 5,
  },
  CIRCLE: {
    stroke: '#FF3030',
    strokeWidth: 5,
  },
  LINE: {
    stroke: '#FF3030',
    strokeWidth: 5,
  },
};

const slice = createSlice({
  name: 'Image editor',
  initialState,
  reducers: {
    setEditor: (state, actions) => {
      const tool = actions.payload;
      state[tool.name] = {
        ...state[tool.name],
        ...tool.payload,
      };
    },
  },
});

// Reducer
export default slice.reducer;

// Actions
export const { setEditor } = slice.actions;
