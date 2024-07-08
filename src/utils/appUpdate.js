import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import { Device } from '@capacitor/device';
import { AppUpdate } from '@capawesome/capacitor-app-update';
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Stack } from '@mui/material';
import { useSnackbar } from 'notistack';
import { memo, useCallback, useEffect, useState } from 'react';
import { attachmentsDB, complianceDB, db, mqcDB } from '../Db';
import { useSelector } from '../redux/store';
import axios from './axios';
import CheckFileSystemPermission from './storeDataToDevice';
import useAccessToken from '../hooks/useAccessToken';

const openAppStore = async () => {
  if (Capacitor.getPlatform() === 'android') {
    await AppUpdate.openAppStore();
  } else {
    await Browser.open({ url: 'https://apps.apple.com/us/app/m-system/id6445936927' });
  }
};

const CheckAppUpdate = () => {

  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const accessToken = useAccessToken();
  const { enqueueSnackbar } = useSnackbar();

  const { LoginUser } = useSelector(store => store.workflow);

  const handleUploadBackUpData = useCallback(async (deviceId) => {
    try {
      // console.log('accessToken', accessToken)
      if (accessToken === null || accessToken === undefined) return;
      // START UPLOAD LOCAL DB TO SERVER FOR DATA BACKUP
      setUploading(true);
      const qcInsp = db.MqcInspection.toArray((array) => array);
      const complianceInsp = complianceDB.Todo.toArray((array) => array);
      const mqcInsp = mqcDB.ToDo.toArray((array) => array);
      const attachments = attachmentsDB?.compliance.toArray();
      const attachmentsQc = attachmentsDB?.qc.toArray();

      Promise.all([qcInsp, complianceInsp, mqcInsp, attachments, attachmentsQc]).then(async values => {
        if (values[0].length > 0 || values[1].length > 0 || values[2].length > 0) {
          // console.log('run update data to server')
          const postData = {
            qc: values[0],
            compliance: values[1],
            mqc: values[2],
            attachments: values[3],
            attachmentsQc: values[4],
          };
          const formData = new FormData();
          formData.append('values', JSON.stringify({ AppDataBackUp: postData }));
          await axios.post(`/api/DeviceMobileApi/UpdateAppDataBackUp/${LoginUser?.UserId}/${deviceId}`, formData, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }).then(response => {
            console.log(`/api/DeviceMobileApi/UpdateAppDataBackUp`, JSON.stringify(response.data));
            setUploading(false);
          }).catch(err => {
            console.log('update errors', JSON.stringify(err));
            if (err.code === 'ECONNABORTED') {
              console.log('Request timed out');
            } else {
              console.log(err.message);
            }
            setUploading(false);
          })
        }
        else {
          console.log(`/api/DeviceMobileApi/UpdateAppDataBackUp`, 'No data to back up');
          setUploading(false);
        }
      })

    } catch (error) {

      setUploading(false);
      console.error(error);
      enqueueSnackbar(JSON.stringify(error), {
        variant: 'error',
      });


    }
  }, [accessToken]);

  useEffect(() => {

    (async () => {
      if (Capacitor.getPlatform() === 'web') return;

      const result = await AppUpdate.getAppUpdateInfo();
      // const deviceInfo = await Device.getInfo();
      const deviceId = await Device.getId();
      CheckFileSystemPermission();

      // console.log(deviceInfo);
      // {"availableVersion":"1.5","currentVersion":"1.6","minimumOsVersion":"13.0","updateAvailability":1,"availableVersionReleaseDate":"2023-05-12T19:31:05Z"}
      if (parseFloat(result.availableVersion) === 0 || result.availableVersion === '0') {
        // Old device can not detect version
        const response = await axios
          .get(`/api/MobileAppVersionApi/GetByOS/${Capacitor.getPlatform().toUpperCase()}`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          })
          .then((res) => {
            console.log('response GetByOS', `${JSON.stringify(res)}`);
          })
          .catch((err) => console.error(err));
        if (parseFloat(response.data[0].Version) > parseFloat(result.currentVersion)) {
          setOpen(true);
          handleUploadBackUpData(deviceId.uuid)
        }
      };

      // console.log('getAppUpdateInfo', result);
      // New devices can detect version
      if (parseFloat(result.availableVersion) > parseFloat(result.currentVersion)) {
        // if (parseFloat(result.currentVersion) >= parseFloat(result.availableVersion)) {
        setOpen(true);
        handleUploadBackUpData(deviceId.uuid);

        const formData = new FormData();
        formData.append(
          'values',
          JSON.stringify({
            OS: Capacitor.getPlatform().toUpperCase(),
            Version: result?.availableVersion,
          })
        );

        await axios
          .post(`/api/MobileAppVersionApi/POST`, formData, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          })
          .then((res) => {
            console.log('response update', `${JSON.stringify(res)}`);
          })
          .catch((err) => console.error(err));
      }

    })();

  }, [accessToken]);


  const handleClose = () => {
    setOpen(false);
  };

  // console.log(LoginUser);

  return (
    <Dialog
      open={open}
    // onClose={handleClose}
    >
      <DialogTitle sx={{ mb: 2 }}>App update</DialogTitle>
      <DialogContent>
        <DialogContentText>
          M System new version is now available. We strongly recommend you to update the latest version!
        </DialogContentText>
        {uploading &&
          <Stack spacing={2} width='100%' justifyContent='center' alignItems='center' mt={3}>
            <CircularProgress color='success' />
            <DialogContentText>
              Uploading backup data, please wait...
            </DialogContentText>
          </Stack>
        }
      </DialogContent>
      <DialogActions>
        <Button color="success" onClick={openAppStore} disabled={uploading}>
          Go to Store
        </Button>
        <Button color="error" onClick={handleClose} disabled={uploading}>
          Update Later
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default memo(CheckAppUpdate);
