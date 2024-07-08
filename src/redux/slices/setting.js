import { Toast } from '@capacitor/toast';
import { createSlice } from '@reduxjs/toolkit';
import axios from '../../utils/axios';
// import axios from 'axios';
import { HOST_API } from '../../config';
import { attachmentsDB, complianceDB, db, mqcDB } from '../../Db';

// ----------------------------------------------------------------------


const initialState = {
  open: false,
  pushNotificationToken: '',
  isAuthenticated: false,
  isOfflineMode: true,
  validate: null,
  backupData: {
    qc: [],
    mqc: [],
    compliance: [],
    attachments: [],
  },
  backupDataStatus: null,
  netWorkStatus: null,
  appInfo: null,
  startUpdate: false,
  updateMessage: "",
  updateInfo: null,
  accessToken: null,
  openDialogSessionExpired: false,
};

const slice = createSlice({
  name: 'Seting',
  initialState,
  reducers: {
    // START LOADING
    setOpen: (state, actions) => {
      state.open = actions.payload;
    },
    // SET PUSH NOTIFICATION TOKEN
    setPushNotificationToken: (state, actions) => {
      state.pushNotificationToken = actions.payload;
    },
    // SET AUTHENTICATED
    setAuthenticated: (state, actions) => {
      state.isAuthenticated = actions.payload;
    },

    // SET OFFLINE MODE
    setOfflineMode: (state, actions) => {
      state.isOfflineMode = actions.payload;
    },

    // SET VALIDATION
    setValidate: (state, actions) => {
      state.validate = actions.payload;
    },

    // SET BACKUP DATA
    setBackUpData: (state, actions) => {
      state.backupData = actions.payload;
    },

    // SET BACK UP STATUS
    setBackUpDataStatus: (state, actions) => {
      state.backupDataStatus = actions.payload;
    },

    // SET NET WORK STATUS
    setNetWorkStatus: (state, actions) => {
      state.netWorkStatus = actions.payload;
    },

    // SET APP INFO
    setAppInfo: (state, actions) => {
      state.appInfo = actions.payload;
    },

    // SET APP UPDATE
    setStartingAppUpdate: (state, action) => {
      state.startUpdate = action.payload;
    },

    // SET UPDATE MESSAGE
    setUpdateMessage: (state, action) => {
      state.updateMessage = action.payload;
    },

    // SET UPDATE INFO
    setUpdateInfo: (state, action) => {
      state.updateInfo = action.payload;
    },

    // SET ACCESSTOKEN
    setAccessToken: (state, action) => {
      state.accessToken = action.payload;
    },
    // DIALOG SESSION EXPIRED
    setShowDialogSessionExpired: (state, action) => {
      state.openDialogSessionExpired = action.payload;
    },

  },
});

// Reducer
export default slice.reducer;

// Actions
export const { setOpen, setPushNotificationToken, setAuthenticated, setOfflineMode, setNetWorkStatus, setAppInfo, setStartingAppUpdate, setUpdateMessage, setUpdateInfo, setAccessToken, setShowDialogSessionExpired } = slice.actions;


// GET BACK UP DATA
export function getBackUpData(UserId, deviceId, accessToken) {
  return async (dispatch) => {
    try {
      // CHECK BACK UP DATA
      const backUp = await axios.get(`${HOST_API}/api/DeviceMobileApi/CheckNeedDownloadBackup/${UserId}/${deviceId}`, { headers: { Authorization: `Bearer ${accessToken}` } })

      console.log(`Need to back up`, JSON.stringify(backUp?.data?.IsDonwloadAppDataBackUp));

      // if have already download backup
      if (backUp.data.IsDonwloadAppDataBackUp) {
        return
      }

      // otherwise download backup data
      const responseDownloadBackup = await axios.get(`${HOST_API}/api/DeviceMobileApi/GetAppDataBackUp/${UserId}/${deviceId}`
        , { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      // console.log(`get back up file`, JSON.stringify(responseDownloadBackup?.data));
      // set back up data to local index db
      if (responseDownloadBackup?.data) {
        dispatch(slice.actions.setBackUpData(responseDownloadBackup?.data?.AppDataBackUp));
        dispatch(slice.actions.setBackUpDataStatus(responseDownloadBackup?.data?.IsDonwloadAppDataBackUp));
        const { qc, compliance, mqc, attachments } = responseDownloadBackup?.data?.AppDataBackUp;

        if (qc.length > 0) {
          await db.MqcInspection.bulkAdd(qc);
        }

        if (compliance.length > 0) {
          await complianceDB.Todo.bulkAdd(compliance);
        }

        if (mqc.length > 0) {
          await mqcDB.ToDo.bulkAdd(mqc);
        }

        if (attachments.length > 0) {
          await attachmentsDB?.compliance.bulkAdd(attachments);
        }
      }

    } catch (error) {
      console.error('error getBackup data', JSON.stringify(error));
      // await Toast.show({
      //   text: JSON.stringify(error),
      //   duration: 5000,
      //   position: 'bottom'
      // });

    }
  };
}