/* eslint-disable */
import { Network } from '@capacitor/network';
import { LoadingButton } from '@mui/lab';
import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, Grid, Stack, Table, TableBody, TableCell, TableContainer, TableRow } from '@mui/material';
// import { useLiveQuery } from 'dexie-react-hooks';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import { memo, useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// hooks
import { useExternalScript } from '../../../hooks/useLoadScript';
import useLocales from '../../../hooks/useLocales';
// COMPONENTS
import TableHeadCustom from '../../../components/table/TableHeadCustom';
import DetailSummary from './DetailSummary';
// db
import { attachmentsDB, db } from '../../../Db';
// redux
import { setCurrentTab, setSignalR, setUploadQueue, setUploadingItem, startLoading } from '../../../redux/slices/qc';
import { dispatch, useSelector } from '../../../redux/store';
// config
import { HOST_API, } from '../../../config';
import { PATH_APP } from '../../../routes/paths';
// utils

const externalScript = './resumable.js';


// Merge data before posting to server;
const mergeDetailAttachment = (inspection, attachements, enqueueSnackbar, dispatch, startLoading) => {
  return new Promise((resolve) => {
    // console.log(attachements);
    try {
      if (attachements.length > 0) {
        const mergeObj = {
          ...inspection,
          Inspections: inspection.Inspections.map(d => {
            return {
              ...d,
              Images: d.Images.map(v => {
                if (v.Id > 0) {
                  return v
                }
                return {
                  ...v,
                  Data: attachements.find(u => Math.abs(u.Id) === Math.abs(v.Id))?.Data || null
                }
              })
            }
          }),
          PackingAndLabelings: inspection.PackingAndLabelings.map(u => {
            return {
              ...u,
              Images: u.Images.map(v => {
                if (v.Id > 0) {
                  return v
                }
                return {
                  ...v,
                  Data: attachements.find(u => Math.abs(u.Id) === Math.abs(v.Id))?.Data || null
                }
              })
            }
          })
        }
        resolve(mergeObj);
      } else {
        resolve(inspection)
      }
    } catch (error) {
      console.error(error);
      dispatch(startLoading(false));
      enqueueSnackbar('Some images have error, please replace it with new image, then try again!',
        {
          variant: 'error',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'center',
          },
        }
      );
    }
  });
}


async function updateIndexDb(Id) {
  await attachmentsDB.qc.where('MasterId')
    .equals(Id)
    .delete()
    .then(() => {
    });
  await db.MqcInspection.where('Id')
    .equals(Id)
    .delete()
    .then(() => {
    });
}

Summary.propTypes = {
  theme: PropTypes.any,
  currentInspection: PropTypes.object,
  isViewOnly: PropTypes.bool,
};

function Summary({ theme, currentInspection, isViewOnly }) {

  // Hooks
  const { translate, } = useLocales();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  // CCOMPONENT STATES
  const { loading, signalR, uploadQueue, uploadingItem } = useSelector((store) => store.qc);
  const [open, setOpen] = useState(false);
  // const [uploadProgress, setUploadProgress] = useState(0);
  const [btnVisible, setBtnVisible] = useState(false);

  const scriptStatus = useExternalScript(externalScript);

  const isUploadingItem = uploadQueue.filter(d => d.Id === currentInspection.Id).length > 0 || false

  useEffect(() => {
    if (scriptStatus === 'ready') {
      // Do something with it
      console.log('script loaded')
    }
    (async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setBtnVisible(true)
    })()
    // Cleanup function
    return () => {
      // This code runs when the component unmounts
      // Clear the data to prevent displaying outdated data
      dispatch(setSignalR({ id: null, sysNo: null, qcType: null, message: null, type: null, guid: null }));
      console.log('ApiCallComponent is unmounting. Clean up here.');
    };
  }, [scriptStatus, currentInspection]);

  // useEffect(() => {
  //   (async () => {
  //     if (signalR.message === "4" && currentInspection.Id === signalR.id && currentInspection.IsProcessing) {
  //       await updateIndexDb(signalR.id);
  //       // await new Promise(resolve => setTimeout(resolve, 1000));
  //       setOpen(false);
  //       dispatch(startLoading(false));
  //       dispatch(setSignalR({ id: null, sysNo: null, qcType: null, message: null, type: null, guid: null }));
  //       navigate(PATH_APP.qc.inspection.root);
  //       const completeMessage = currentInspection?.IsRefinal ? `Your QC Re-final’s SysNo: ${signalR.sysNo} is Updated!` : translate('inspection.summary.updateSuccess')
  //       enqueueSnackbar(completeMessage, {
  //         variant: 'success',
  //         anchorOrigin: {
  //           vertical: 'top',
  //           horizontal: 'center',
  //         },
  //       });
  //     }
  //   })();
  // }, [signalR]);


  const checkAllStep = Object.keys(currentInspection.Status).filter(
    (key) => {
      // If PreFinal or inLine
      if (currentInspection.QCType !== 'Final') {
        return !currentInspection.Status[key] && key !== 'Summary'
          && key !== "PackingAndLabeling"
      };
      return !currentInspection.Status[key] && key !== 'Summary';
    }
  );

  /* eslint-disable */
  const handleSave = async (type) => {

    const accessToken = window.localStorage.getItem('accessToken');

    // check item validation for submit
    if (checkAllStep.length > 0) {
      const plainText = checkAllStep.join(', ');
      if (open) {
        setOpen(!open)
      }
      // dispatch(startLoading(false));
      return enqueueSnackbar(`Steps ${plainText} ${translate('inspection.summary.notComplete')}`,
        {
          variant: 'error',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'center',
          },
        }
      );
    };

    // set loading screen
    // dispatch(startLoading(true));

    //check internet conenction
    const status = await Network.getStatus();

    // HAS INTERNET CONNECTION
    if (status.connected) {

      // get all images of this inspection item
      const results = await attachmentsDB.qc.where('MasterId').equals(currentInspection.Id).toArray();

      // set flag for uploading item to indedb;
      await db.MqcInspection.update(currentInspection.id, {
        IsProcessing: true
      });

      // merge all images into inspection detail
      await mergeDetailAttachment(currentInspection, results.filter(d => d.Data !== null), enqueueSnackbar, dispatch, startLoading).then(async mergeData => {

        // delete indexdb id;
        // delete mergeData.id;

        // change status if Submit or Finish
        if (type !== "submit") {
          mergeData.IsFinished = true;
          await db.MqcInspection.update(currentInspection.id, {
            IsFinished: true
          });
        };

        // check if this item is Refinal
        // const IsRefinal = mergeData?.IsRefinal || false;

        // console.log(mergeData);

        // create file from merge object
        // const postFile = new File([JSON.stringify(mergeData)], `QC_${currentInspection.Id}.json`, {
        //   type: "text/plain",
        // });

        // // change file path, name, extension;
        // const fileNameWithoutExtension = postFile.name.replace(/\.[^/.]+$/, "");
        // const now = new Date();
        // const chunkFolder = now.getMonth() + '_' + now.getDate() + '_' + now.getFullYear() + '_' + now.getHours() + '_' + now.getMinutes() + '_' + now.getSeconds() + '_' + fileNameWithoutExtension;
        // const chunkPath = now.getMonth() + '_' + now.getDate() + '_' + now.getFullYear() + '_' + now.getHours() + '_' + now.getMinutes() + '_' + now.getSeconds();

        // start send the file to server
        // await sendFile(postFile, accessToken, setUploadProgress, chunkFolder, chunkPath, enqueueSnackbar).then(async res => {
        //   // console.log('sendFile response', res);
        //   if (res === 'Done') {
        //     // start finalize file
        //     await finalizeFile(postFile.name, chunkFolder, chunkPath, accessToken, enqueueSnackbar, IsRefinal).then(async res => {
        //       console.log('----------------------------------Finalize result', res);
        //     });
        //   }
        // });

        // const worker = new Worker('resumableWorker.js');

        // // Send data to the web worker
        // worker.postMessage(JSON.stringify(
        //   {
        //     mergeData,
        //     accessToken,
        //     enqueueSnackbar,
        //     HOST_API,
        //     Id: currentInspection.Id,
        //     IsRefinal,
        //   })
        // );

        if (uploadingItem === null) {
          dispatch(setUploadingItem(currentInspection.Id));
        }
        dispatch(setUploadQueue([...uploadQueue, { Id: currentInspection.Id, No: uploadQueue.length + 1, IsFinished: mergeData.IsFinished }]))
        navigate(PATH_APP.qc.inspection.root);
        dispatch(setCurrentTab('1'));

      });
    }
    else {
      setOpen(false)
      dispatch(startLoading(false));
      return enqueueSnackbar(translate('inspection.summary.noConnection'), {
        variant: 'error',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center',
        },
      });
    };

  };

  const tableLabels = [
    { id: 'Result', label: translate('Result'), minWidth: 80 },
    { id: 'Major', label: translate('Major') },
    { id: 'Minor', label: translate('Minor') },
    { id: 'Critical', label: translate('Critical') },
  ];

  const tableContainerStyle = {
    minWidth: 350,
    minHeight: 200,
    maxHeight: 450,
    p: 0,
  };

  const buttonGroupStyles = {
    position: {
      xs: 'fixed',
      sm: 'fixed',
      md: 'absolute',
      lg: 'absolute',
    },
    bottom: {
      xs: 3,
      sm: 3,
      md: 0,
      lg: 0
    },
    left: 1,
    right: 1,
    p: 1,
    justifyContent: 'flex-end',

  }

  // console.log(
  //   uploadQueue, loading, isUploadingItem,
  // );

  return (
    <Stack spacing={1} height="100%">
      <DetailSummary currentInspection={currentInspection} />
      <Divider />
      <Box
        sx={{
          px: 0,
          py: 2,
        }}
      >

        <Grid container rowSpacing={3} columnSpacing={2}>
          <Grid item xs={12} md={12}>
            <TableContainer
              sx={tableContainerStyle}
            >
              <Table stickyHeader sx={{ px: 0 }}>
                <TableHeadCustom headLabel={tableLabels} fixedColumnIndex={0} sx={{ px: 0 }} />
                <TableBody sx={{ p: 0 }}>
                  <TableRow>
                    <TableCell>Allow</TableCell>
                    <TableCell>{currentInspection?.Summary?.MajorDefectAllow || 0}</TableCell>
                    <TableCell>{currentInspection?.Summary?.MinorDefectAllow || 0}</TableCell>
                    <TableCell>{currentInspection?.Summary?.CriticalDefectAllow || 0}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Found</TableCell>
                    <TableCell>{currentInspection?.Summary?.MajorDefectNumber || 0}</TableCell>
                    <TableCell>{currentInspection?.Summary?.MinorDefectNumber || 0}</TableCell>
                    <TableCell>{currentInspection?.Summary?.CriticalDefectNumber || 0}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>

        {btnVisible &&
          <Stack
            direction='row'
            width={'100%'}
            id="button-group"
            sx={buttonGroupStyles}
            spacing={2}
          >
            {!currentInspection?.IsImproved &&
              <Stack
                width={{
                  xs: '50%',
                  sm: '50%',
                  md: '25%',
                }}
              >
                <LoadingButton
                  variant="contained"
                  fullWidth
                  sx={{
                    mt: 1,
                    backgroundColor: theme.palette.primary.dark
                  }}
                  type="submit"
                  disabled={(loading || isViewOnly || currentInspection.IsFinished) && isUploadingItem}
                  loading={loading && isUploadingItem}
                  onClick={() => setOpen(true)}
                >
                  Submit
                </LoadingButton>
              </Stack>
            }
            <Stack
              width={{
                xs: '50%',
                sm: '50%',
                md: '25%',
              }}
            >
              <LoadingButton
                variant="contained"
                fullWidth
                sx={{
                  mt: 1,
                  backgroundColor: currentInspection.Status.Summary
                    ? theme.palette.primary.main
                    : theme.palette.info.main,
                  '&:focus': {
                    backgroundColor: currentInspection.Status.Summary
                      ? theme.palette.primary.main
                      : theme.palette.info.main,
                  },
                }}
                type="submit"
                disabled={(loading || isViewOnly || currentInspection.IsFinished) && isUploadingItem}
                loading={loading && isUploadingItem}
                onClick={() => handleSave('save')}
              >
                {!currentInspection.Status.Summary ? 'Finish' : 'Finished'}
              </LoadingButton>
            </Stack>
          </Stack>
        }

        {open &&
          <DiagLogSubmit open={open} setOpen={setOpen}
            handleSubmit={handleSave} loading={loading}
            checkAllStep={checkAllStep} isUploadingItem={isUploadingItem}
          />
        }

        {/* {
          loading && <UploadFileBackdrop
            loading={loading}
            progress={uploadProgress}
            signalR={signalR}
          />
        } */}

        {/* {
          loading &&
          <UploadSnackBar
            loading={loading}
            progress={uploadProgress}
            signalR={signalR}
          />
        } */}

      </Box>
    </Stack>
  );
};

export default memo(Summary);


DiagLogSubmit.propTypes = {
  open: PropTypes.bool,
  setOpen: PropTypes.func,
  handleSubmit: PropTypes.func,
  loading: PropTypes.bool,
  checkAllStep: PropTypes.array,
};

function DiagLogSubmit({ open, setOpen, handleSubmit, loading, checkAllStep, isUploadingItem }) {

  const handleCancel = useCallback(() => {
    setOpen(false)
  });
  const { translate } = useLocales();
  const plainText = checkAllStep.join(', ');
  const handleConfirm = () => {
    handleCancel()
    handleSubmit('submit')
  }

  return (
    <Dialog open={open}>
      <DialogTitle sx={{ mb: 2 }}>Confirm</DialogTitle>
      <DialogContent sx={{ minWidth: 280 }}>
        {
          loading && isUploadingItem ?
            <Stack sx={{ width: '100%' }} justifyContent='center' alignItems={'center'} spacing={3}>
              <DialogContentText sx={{ fontWeight: 'bold', color: 'red', width: '100%', textAlign: 'center' }}>{translate('loadingStatus.sending')}</DialogContentText>
              <CircularProgress color='success' size={30} />
            </Stack> :
            <>
              Warning: {checkAllStep.length > 0 &&
                <DialogContentText color={'error'}>
                  {
                    `Steps ${plainText} ${translate('inspection.summary.notComplete')}`
                  }
                </DialogContentText>
              }
              <DialogContentText mt={1}>
                {
                  translate('inspection.summary.afterSummitText')
                }
              </DialogContentText>
              <DialogContentText>

                {
                  translate('inspection.summary.afterSummitNote')
                }
              </DialogContentText>
            </>
        }
      </DialogContent>

      <DialogActions>
        <Button color="error" onClick={handleCancel}
          disabled={loading && isUploadingItem}
        >
          {translate('button.cancel')}
        </Button>
        <Button color="success" onClick={() => handleConfirm()}
          disabled={loading && isUploadingItem}
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  )
}

/* eslint-disable */

async function sendFile(file, accessToken, setUploadProgress, chunkFolder, chunkPath, enqueueSnackbar) {
  console.log('1. Start upload file');

  const url = `${HOST_API}/api/QCMobileApi/UploadFileForInspection`;
  // 1 megabyte =1000000 bytes;
  // const chunkSize = 10000000;
  const chunkSize = 1000000;
  const totalChunks = Math.ceil(file.size / chunkSize);
  let message = "";
  let chunkPromises = [];

  for (let currentChunk = 1; currentChunk <= totalChunks; currentChunk++) {

    // console.log(chunkPromises);
    if (chunkPromises.length === totalChunks && chunkPromises[currentChunk - 1]?.status) {
      message = 'Done';
      return message;
    }

    const formData = new FormData();
    formData.append('resumableChunkNumber', currentChunk.toString());
    formData.append('resumableTotalChunks', totalChunks.toString());
    formData.append('resumableIdentifier', 'example-identifier');
    formData.append('resumableFilename', file.name);
    formData.append('chunkFolder', chunkFolder);
    formData.append('chunkPath', chunkPath);

    const startByte = (currentChunk - 1) * chunkSize;
    const endByte = currentChunk === totalChunks ? file.size : currentChunk * chunkSize;

    const chunk = file.slice(startByte, endByte);
    formData.append('file', chunk);
    // setUploadProgress(Math.round(currentChunk / totalChunks * 100))

    console.log(`Uploading chunk ${currentChunk} of ${totalChunks}`);

    try {

      // Thực hiện yêu cầu HTTP POST bằng Fetch API
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers: {
          "Authorization": `Bearer ${accessToken}`
        },
        // keepalive: true,
      });

      if (response.ok) {
        setUploadProgress(Math.round(currentChunk / totalChunks * 100))
        const findIndex = chunkPromises.findIndex(d => d.chunk === currentChunk)
        if (findIndex < 0) {
          chunkPromises.push({
            chunk: currentChunk,
            status: true
          })
        } else {
          chunkPromises[findIndex] = {
            chunk: currentChunk,
            status: true
          }
        }
        const result = await response.json();
        // console.log(result);
        if (currentChunk === totalChunks) {
          message = result.message
        }
        // await new Promise(resolve => setTimeout(resolve, 2000));
      } else {
        const chunkExit = chunkPromises.find(d => d.chunk === currentChunk)
        if (!chunkExit) {
          chunkPromises.push({
            chunk: currentChunk,
            status: false
          })
        }

        // Nếu có lỗi, hoặc nếu server trả về status khác 200, xem xét resumable upload
        console.error('Server responded with an error:', response.statusText);

        // Chờ 2 giây trước khi thực hiện upload lại chunk này
        await new Promise(resolve => setTimeout(resolve, 2000));
        // Giảm giá trị của currentChunk để upload lại chunk này
        currentChunk--;
        continue; // Chuyển sang chunk tiếp theo trong vòng lặp

      }
    } catch (error) {

      const chunkExit = chunkPromises.find(d => d.chunk === currentChunk)
      if (!chunkExit) {
        chunkPromises.push({
          chunk: currentChunk,
          status: false
        })
      }

      // Xử lý lỗi
      console.error('An error occurred while making the request:', error);

      // Chờ 2 giây trước khi thực hiện upload lại chunk này
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Giảm giá trị của currentChunk để upload lại chunk này
      currentChunk--;
      continue; // Chuyển sang chunk tiếp theo trong vòng lặp
    }
  }

  console.log('2.Upload completed!');
  return message;
}


// Hàm nối file khi tất cả các chunk đã được upload
async function finalizeFile(finalFileName, chunkFolder, chunkPath, accessToken, enqueueSnackbar, IsRefinal) {
  // debugger
  // const finalizeUrl = `${HOST_API}/api/QCMobileApi/FinalizeFileForQC`;
  const finalizeUrl = IsRefinal ? `${HOST_API}/api/QCMobileApi/FinalizeFileForQC/refinal` : `${HOST_API}/api/QCMobileApi/FinalizeFileForQC/update`;
  console.log(finalizeUrl)

  const finalizeData = {
    // Thông tin cần thiết để xác định file và thực hiện nối
    finalFileName: finalFileName,
    chunkFolder: chunkFolder,
    chunkPath: chunkPath
  };
  let finalizeResult = "";

  // try {
  const response = await fetch(finalizeUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      "Authorization": `Bearer ${accessToken}`
    },
    body: JSON.stringify(finalizeData),
    keepalive: true,
  });

  if (response.ok) {
    const result = await response.json();
    console.log('3.finalizeFile', result.message);
    finalizeResult = 'Done'
  } else {
    console.error('Error finalizing file:', response.statusText || 'Error finalizing file');
    finalizeResult = response.statusText || 'Error finalizing file'
  }
  // } catch (error) {
  //   finalizeResult = 'Error finalizing file'
  //   console.error('An error occurred while finalizing file:', error);
  // }
  return finalizeResult
}
