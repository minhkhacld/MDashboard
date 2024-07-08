import { createSlice } from '@reduxjs/toolkit';
// utils
import axios from '../../utils/axios';
// import axios from 'axios';
//
import { dispatch } from '../store';

// ----------------------------------------------------------------------

const initialState = {
  provinces: [],
  districts: [],
  wards: [],
  landUseTypes: [],
  expenses: [],
  revenues: [],
  userList: [],
  filters: {
    provinces: [],
    districts: [],
    wards: [],
    landUseTypes: [],
  },
};

const slice = createSlice({
  name: 'enum',
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

    // GET PROVINCE
    getProvices(state, action) {
      state.provinces = action.payload;
    },
    // GET DISTRICT
    getDistricts(state, action) {
      state.districts = action.payload;
    },
    // GET WARD
    getWards(state, action) {
      state.wards = action.payload;
    },
    // GET LAND USE TYPE
    getLandUseTypes(state, action) {
      state.landUseTypes = action.payload;
    },
    // GET EXPENSE TYPE
    getExpenseTypes(state, action) {
      state.expenses = action.payload;
    },
    // GET RENUEVE TYPE
    getRevenueTypes(state, action) {
      state.revenues = action.payload;
    },

    // GET USER LIST
    getUserList(state, action) {
      state.userList = action.payload;
    },
    // FILTER PRODUCT LIST

    setFilterProvinces(state, action) {
      state.filters = {
        ...state.filters,
        provinces: action.payload,
      };
    },
    setFilterDistricts(state, action) {
      state.filters = {
        ...state.filters,
        districts: action.payload,
      };
    },
    setFilterWards(state, action) {
      state.filters = {
        ...state.filters,
        wards: action.payload,
      };
    },
    setFilterLandUseTypes(state, action) {
      state.filters = {
        ...state.filters,
        landUseTypes: action.payload,
      };
    },
  },
});

// Reducer
export default slice.reducer;

// Actions
export const { getProvinces, getDistricts, getWards } = slice.actions;

// ----------------------------------------------------------------------

export function getProvinceList() {
  return async () => {
    try {
      await axios.get('api/app/enum-line/province').then((response) => {
        // console.log('redux-slice-enum-provices', response)
        if (response.data.length > 0) {
          dispatch(slice.actions.getProvices(response.data.sort((a, b) => a.value.localeCompare(b.value))));
        }
      });
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function getDistrictList(provinceId) {
  return async () => {
    try {
      await axios.get(`api/app/enum-line/district/${provinceId}`).then((response) => {
        // console.log('redux-slice-enum-district', response)
        if (response.data.length > 0) {
          dispatch(slice.actions.getDistricts(response.data.sort((a, b) => a.value.localeCompare(b.value))));
        }
      });
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function getWardList(districtId) {
  return async () => {
    try {
      await axios.get(`api/app/enum-line/ward/${districtId}`).then((response) => {
        // console.log('redux-slice-enum-wards', response);
        if (response.data.length > 0) {
          dispatch(slice.actions.getWards(response.data.sort((a, b) => a.value.localeCompare(b.value))));
        }
      });
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function getLandUseTypeList() {
  return async () => {
    try {
      await axios.get(`api/app/enum-line/land-use-type`).then((response) => {
        // console.log('redux-slice-enum-landuseTypes', response);
        if (response.data.length > 0) {
          dispatch(slice.actions.getLandUseTypes(response.data.sort((a, b) => a.value.localeCompare(b.value))));
        }
      });
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

// GET EXPENSE LIST TYPES
export function getExpenseListType() {
  return async () => {
    try {
      await axios.get('/api/app/enum-line/expense-type').then((response) => {
        // console.log('enum-expense-type', response.data);
        dispatch(slice.actions.getExpenseTypes(response.data));
      });
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

// GET REVENUE LIST TYPES
export function getRevenueListType() {
  return async () => {
    try {
      await axios.get('/api/app/enum-line/revenue-type').then((response) => {
        // console.log('enum-revenue-type', response.data);
        dispatch(slice.actions.getRevenueTypes(response.data));
      });
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

// GET USER LIST
export function getUserList() {
  return async () => {
    try {
      await axios.get(`/api/app/app-user`).then((response) => {
        // console.log('payment-get-user-list', response.data);
        dispatch(slice.actions.getUserList(response.data));
      });
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

// ---------------------------------- ENUM FOR FILTER PRODUCT LIST ------------------------------------------------------------------------

export function getProvinceFilterList() {
  return async () => {
    try {
      await axios.get('/api/app/enum-line/product-province').then((response) => {
        // console.log('redux-slice-enum-provices', response)
        if (response.data.length > 0) {
          dispatch(slice.actions.setFilterProvinces(response.data.sort((a, b) => a.value.localeCompare(b.value))));
        }
      });
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function getDistrictFilterList(provinceId) {
  return async () => {
    try {
      await axios.get(`api/app/enum-line/product-district/${provinceId}`).then((response) => {
        // console.log('redux-slice-enum-district', response)
        if (response.data.length > 0) {
          dispatch(slice.actions.setFilterDistricts(response.data.sort((a, b) => a.value.localeCompare(b.value))));
        }
      });
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function getWardFilterList(districtId) {
  return async () => {
    try {
      await axios.get(`api/app/enum-line/product-ward/${districtId}`).then((response) => {
        // console.log('redux-slice-enum-wards', response);
        if (response.data.length > 0) {
          dispatch(slice.actions.setFilterWards(response.data.sort((a, b) => a.value.localeCompare(b.value))));
        }
      });
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function getLandUseTypeFilterList() {
  return async () => {
    try {
      await axios.get(`api/app/enum-line/product-land-use-type`).then((response) => {
        // console.log('redux-slice-enum-landuseTypes', response);
        if (response.data.length > 0) {
          dispatch(slice.actions.setFilterLandUseTypes(response.data.sort((a, b) => a.value.localeCompare(b.value))));
        }
      });
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}
