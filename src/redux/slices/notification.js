import { Capacitor } from '@capacitor/core';
import { Device } from '@capacitor/device';
import { App } from '@capacitor/app';
import { createSlice } from '@reduxjs/toolkit';
// utils
import axios from '../../utils/axios';
//
import { dispatch } from '../store';

// ----------------------------------------------------------------------

const initialState = {
  isLoading: null,
  error: null,
  notification: null,
  pendingList: [],
  deviceId: null,
};

const slice = createSlice({
  name: 'notification',
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
    getNotification(state, action) {
      state.notification = action.payload;
    },
    // GET PENDING LIST
    getPendingList(state, action) {
      state.pendingList = action.payload;
    },

    // set Device id
    setDeviceId(state, action) {
      state.deviceId = action.payload;
    },
  },
});

// Reducer
export default slice.reducer;

// Actions
export const { getNotification, getPendingList, setDeviceId } = slice.actions;
// ----------------------------------------------------------------------


// GET PENDING NOTIFICATIONS
export function getPendingNotification(userId) {
  return async () => {
    try {
      await axios.get(`/api/UserMobileApi/GetAllApprovalPendingByUserId/${userId}`).then((response) => {
        // console.log('/api/FirebaseMessageMobileApi/GetByUserId', response.data);
        //   {
        //     "Id": 85151,
        //     "Guid": "2db3ee80-a0bc-44dc-9724-6790f9c29fa0",
        //     "SysNo": "Payment test Cash",
        //     "EntityName": "FRPayment",
        //     "EntityTypeName": "Payment Request",
        //     "TableName": "FinanceRequest",
        //     "WFStep": "Suggested",
        //     "FromEmpKnowAs": "Hank",
        //     "WFAction": "Pending",
        //     "CurrentEmpKnowAs": "Hank",
        //     "CurrentEmplId": 2191,
        //     "CurrentUserId": 2859,
        //     "SubmitTime": "2023/04/19",
        //     "MobileReportURL": "/accounting/pending/report/85151"
        // }
        if (response.data.data.length > 0) {
          const list = response.data.data.sort((a, b) => new Date(b.SubmitTime) - new Date(a.SubmitTime));
          dispatch(slice.actions.getPendingList(list));
        } else {
          dispatch(slice.actions.getPendingList([]));
        }
      });
    } catch (error) {
      console.error(error);
      dispatch(slice.actions.hasError(error));
    }
  };
};

// UPDATE NOTIFICATIONS
export function setMarkAsReadNotification(key, values) {
  return async () => {
    try {
      const formData = new FormData();
      // formData.append('key', key);
      formData.append('values', JSON.stringify(values));
      await axios.put(`/api/FirebaseMessageMobileApi/Put/${key}`, formData).then((response) => {
        // console.log('/api/FirebaseMessageMobileApi/Put/', response.data);
      });
    } catch (error) {
      console.error(error);
      dispatch(slice.actions.hasError(error));
    }
  };
};

// UPDATE DEIVCE INFOS
export function updateDeviceInfo(UserId, token, deviceId) {
  return async () => {
    try {
      if (Capacitor.getPlatform() === 'web') return;
      // const getId = await Device.getId();
      const getInfo = await Device.getInfo();
      const info = await App.getInfo();
      const formData = new FormData();
      formData.append(
        'values',
        JSON.stringify({
          OS: Capacitor.getPlatform().toUpperCase(),
          // DeviceId: getId?.identifier,
          DeviceId: deviceId,
          DeviceToken: token,
          UserId,
          OSVersion: getInfo?.osVersion,
          DeviceModel: `${getInfo?.model} - ${info.version}.${info.build}`,
          DeviceManufacturer: getInfo?.manufacturer,
          DeviceName: getInfo?.name,
        })
      );
      await axios.post(`/api/DeviceMobileApi/Post`, formData, deviceId).then(response => {
        // console.log('/api/DeviceMobileApi/Post', JSON.stringify(response.data));
      });

    } catch (error) {
      console.error('/api/DeviceMobileApi/Post', error);
      dispatch(slice.actions.hasError(error));
    }
  };
};
