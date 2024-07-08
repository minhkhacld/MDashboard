import { Capacitor } from '@capacitor/core';
import { Network } from '@capacitor/network';
import { yupResolver } from '@hookform/resolvers/yup';
import { LoadingButton } from '@mui/lab';
import { useLiveQuery } from 'dexie-react-hooks';
import { useSnackbar } from 'notistack';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import useDetectKeyboardOpen from "use-detect-keyboard-open";
import * as Yup from 'yup';
// @mui
import { Alert, Box, Button, Card, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, Stack, Tab, Tabs, Typography } from '@mui/material';
// Redux
import Page from '../../../components/Page';
import { setComplianceSignalR, setShouldCallApi, startLoading } from '../../../redux/slices/compliance';
import { setTabComplianceDetail } from '../../../redux/slices/tabs';
import { dispatch, useSelector } from '../../../redux/store';
// routes
import { attachmentsDB, complianceDB } from '../../../Db';
import { PATH_APP } from '../../../routes/paths';
// hooks
import { FormProvider } from '../../../components/hook-form/index';
import useIsOnline from '../../../hooks/useIsOnline';
import { useExternalScript } from '../../../hooks/useLoadScript';
import useLocales from '../../../hooks/useLocales';
import useResponsive from '../../../hooks/useResponsive';
import useSettings from '../../../hooks/useSettings';
// components
import GoBackButton from '../../../components/GoBackButton';
import Scrollbar from '../../../components/Scrollbar';
import AuditFactoryInfo from '../../../sections/compliance/audit/detail/AuditFactoryInfo';
import AuditLines from '../../../sections/compliance/audit/detail/AuditLines';
import AuditResult from '../../../sections/compliance/audit/detail/AuditResult';
import UploadFileBackdrop from '../../../sections/qc/inspection/components/UploadFileBackdrop';
import TabPanel from '../../../components/tab/TabPanel';
// CONFIG
import { HEADER, HOST_API, NOTCH_HEIGHT } from '../../../config';
import axios from '../../../utils/axios';

// Utils

const externalScript = '../../../sections/qc/inspection/resumable.js';

// ----------------------------------------------------------------------

const BREAKCRUM_HEIGHT = 40;
const SPACING = 24;
const ANDROID_KEYBOARD = 0
const TAB_HEIGHT = 48;
const BACK_BUTTON_HEIGHT = 42;
const SUBMIT_BUTTON = 52;
const IOS_KEYBOARD = 0;



// Check form validations
const requiredField = [
  {
    field: 'Remark',
    label: 'Remark',
  },
  {
    field: 'CustomerId',
    label: 'Customer',
  },
  {
    field: 'BrandId',
    label: 'Brand',
  },
  {
    field: 'FactoryId',
    label: 'Factory',
  },
  {
    field: 'AuditorName',
    label: 'Auditor',
  },
  {
    field: 'AuditTypeId',
    label: 'Audit Type',
  },
  {
    field: 'AuditingResultId',
    label: 'Audit Result',
  },
  {
    field: 'TimeEffect',
    label: 'Time Effect',
  },
  {
    field: 'Grade',
    label: 'Grade',
  },
];

async function updateIndexDb(Id) {
  await attachmentsDB.compliance.where('ParentId')
    .equals(Id)
    .delete()
    .then(() => {
    });
  await complianceDB.Todo.where('id')
    .equals(Id)
    .delete()
    .then(() => {
    });
}

const getItemById = async (iteId) => {
  console.log(iteId);
  return complianceDB.Todo.get(iteId);
};

export default function ComplianceAuditDetail() {

  // Hooks
  const { themeStretch } = useSettings();
  const mdUp = useResponsive('up', 'md');
  const lgUp = useResponsive('up', 'lg');
  const smUp = useResponsive('up', 'sm');
  const location = useLocation();
  const { name } = useParams();
  const navigate = useNavigate();
  const { online } = useIsOnline();
  const { enqueueSnackbar } = useSnackbar();
  const { translate } = useLocales()
  const isKeyboardOpen = useDetectKeyboardOpen();
  const isViewOnly = location?.state?.isViewOnly;
  const isAndroid = Capacitor.getPlatform() === 'android';
  // const itemData = location?.state?.item || null;

  // INDEXDB
  const [localItem] = useLiveQuery(() => complianceDB.Todo.get({ id: Number(name) }).then(localItem => [localItem]), [name], []);
  // const TodoList = useLiveQuery(() => complianceDB?.Todo.where('id').equals(Number(name)).toArray()) || [];
  const { viewOnlyTodo } = useSelector((store) => store.compliance);
  const complianceAttachments = useLiveQuery(() => attachmentsDB?.compliance.where('ParentId').equals(Number(name)).toArray()) || [];
  const scriptStatus = useExternalScript(externalScript);

  // Redux
  const { signalR, loading } = useSelector((store) => store.compliance);
  const { complianceDetailTab } = useSelector((store) => store.tabs);
  const { LoginUser } = useSelector((store) => store.workflow);

  const currentTodoItem = isViewOnly
    ? //  itemData
    viewOnlyTodo
    // : TodoList.find((d) => String(d.id) === name);
    : localItem;


  const isOwner = LoginUser?.EmpId === currentTodoItem?.AuditorId;

  // Components state;
  // const [sending, setSending] = useState(false);
  const [open, setOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  // components state
  const [isLoading, setLoading] = useState(false);

  // Side Effects
  useEffect(() => {
    if (scriptStatus === 'ready') {
      // Do something with it
      console.log('script loaded')
    }
    dispatch(setShouldCallApi(false));
  }, []);


  useEffect(() => {
    (async () => {
      // if nothing happen
      if (signalR.id === null || !currentTodoItem) return;
      if (signalR.message === "12" && currentTodoItem?.IsProcessing && signalR.id === Number(currentTodoItem.id)) {
        await updateIndexDb(signalR.id);
        dispatch(startLoading(false));
        dispatch(setComplianceSignalR({ id: null, sysNo: null, qcType: null, message: null, type: null, guid: null }));
        navigate(PATH_APP.compliance.audit.root);
        enqueueSnackbar('Submit sent successfully!', {
          variant: 'success',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'center',
          },
        });
      }
    })();

  }, [signalR,]);

  useEffect(() => {

    if (!currentTodoItem) {
      return
    };
    const newLines = [...currentTodoItem?.Sections].filter(d => d.AuditorId === LoginUser?.EmpId);
    if (newLines.length === 0) {
      dispatch(setTabComplianceDetail('3'));
    };

    return () => {
      dispatch(startLoading(false));
      dispatch(setComplianceSignalR({ id: null, sysNo: null, qcType: null, message: null, type: null, guid: null }));
    };
  }, [
    currentTodoItem?.Sections,
    LoginUser]);


  const defaultValues = useMemo(() => ({
    AuditDateFrom: currentTodoItem?.AuditDateFrom || '',
    AuditDateTo: currentTodoItem?.AuditDateTo || '',
    Grade: currentTodoItem?.Grade || '',
    TimeEffect: currentTodoItem?.TimeEffect || '',
    AuditingResultId: currentTodoItem?.AuditingResultId || '',
    Remark: currentTodoItem?.Remark || '',
    AuditTypeId: currentTodoItem?.AuditTypeId || '',
    ComplianceInspectionTemplateId: currentTodoItem?.ComplianceInspectionTemplateId || '',
    SysNo: currentTodoItem?.SysNo || '',
    AuditorName: currentTodoItem?.AuditorName || '',
    AuditingResult: currentTodoItem?.AuditingResult || '',
    AuditType: currentTodoItem?.AuditType || '',
    AuditingCompanyName: currentTodoItem?.AuditingCompanyName || '',
    AuditingCompanyId: currentTodoItem?.AuditingCompanyId,
    AuditTime: currentTodoItem?.AuditTime || '',
    AuditTimeId: currentTodoItem?.AuditTimeId || '',
    CustomerName: currentTodoItem?.CustomerName || '',
    CustomerId: currentTodoItem?.CustomerId || '',
    BrandName: currentTodoItem?.BrandName || '',
    BrandId: currentTodoItem?.BrandId || '',
    FactoryName: currentTodoItem?.FactoryName || '',
    FactoryId: currentTodoItem?.FactoryId || '',
    id: currentTodoItem?.id,
  })
    ,
    [name, { ...currentTodoItem }]
  );


  const TodoInfoScheme = Yup.object().shape({});

  const methods = useForm({
    resolver: yupResolver(TodoInfoScheme),
    defaultValues,
  });


  const {
    handleSubmit,
    setError,
    watch,
    setValue,
    formState: { isSubmitting, errors },
  } = methods;

  const values = watch();

  const handleChangeTab = (e, newValue) => {
    dispatch(setTabComplianceDetail(newValue));
  };

  const onOpen = () => {
    setOpen(true);
  }
  const onClose = () => {
    setOpen(false);
  }

  // HANDLE SUBMIT INFORMATIONS
  const handleSave = async () => {
    try {

      let Errors = [];
      requiredField.forEach((field) => {
        if (
          currentTodoItem[field.field] === null ||
          currentTodoItem[field.field] === undefined ||
          currentTodoItem[field.field] === ''
        ) {
          Errors = [...Errors, field];
        }
      });

      // Check audit Info
      if (Errors.length > 0 && isOwner) {
        Errors.forEach((d) => {
          setError(d.label, { type: 'focus', message: `${d.label} is required` }, { shouldFocus: true });
        });
        onClose();
        return;
      }


      // Check factory info;
      const countFactoryInfoUnFinished = currentTodoItem.FactoryInfoLines.filter((d) => !d.IsFinished);
      if (countFactoryInfoUnFinished.length > 0 && isOwner) {
        setError(
          'Unfinished',
          {
            type: 'focus',
            message: `${countFactoryInfoUnFinished.length} section have not finished evaluation. Please complete all section before submitting!`,
          },
          { shouldFocus: true }
        );
        dispatch(setTabComplianceDetail('2'));
        onClose();
        return;
      };

      // Check all section finished;
      const countUnFinished = currentTodoItem.Sections.filter((d) => !d.IsFinished);
      if (countUnFinished.length > 0) {
        setError(
          'Unfinished',
          {
            type: 'focus',
            message: `${countUnFinished.length} section have not finished evaluation. Please complete all section before submitting!`,
          },
          { shouldFocus: true }
        );
        dispatch(setTabComplianceDetail('3'));
        onClose();
        return;
      };


      // check internet conenction
      const status = await Network.getStatus();

      // HAS INTERNET CONNECTION
      if (!status.connected) {
        return enqueueSnackbar('No internet connection! Please connect to the internet and submit later.', {
          variant: 'error',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'center',
          },
        });
      }

      // set loading screen
      dispatch(startLoading(true));

      // If no errors do post
      const postData = { ...currentTodoItem };
      postData.Lines = postData.Sections.map((d) => d.Items).flatMap((r) => r);
      postData.FactoryInfoLines = postData.FactoryInfoLines.map((d) => d.Items).flatMap((r) => r);

      const { Sections, ...newPostData } = postData;

      // get all images of this inspection item
      const images = await attachmentsDB.compliance.where('ParentId').equals(currentTodoItem.id).toArray();
      // console.log(images);

      // set flag for uploading item to indexdb;
      await complianceDB.Todo.update(currentTodoItem.id, {
        IsProcessing: true
      });

      // check audit item is create new or follow up;
      const IsFollowUp = postData.AuditTime === "FOLLOW-UP" && postData.WFStatusName !== "Open";

      // Delete props to prevent confic with server;
      if (IsFollowUp) {
        delete newPostData.Sections;
        // delete newPostData.id;
        delete newPostData.Guid;
      };

      const postImages = images.filter(d => {
        if (d.Action === "Insert" && d.Data === null) {
          return false;
        }
        return true
      });

      // create file from merge object
      const mergeObj = {
        complianceAuditDto: newPostData,
        Images: postImages,
      };


      const postFile = new File([JSON.stringify(mergeObj)], `QC_${currentTodoItem.id}.json`, {
        type: "text/plain",
      });

      // // Create a download link
      // const link = document.createElement('a');
      // link.href = URL.createObjectURL(postFile);
      // link.download = 'compliant.txt';

      // // Append the link to the body
      // document.body.appendChild(link);

      // // Trigger the click event on the link
      // link.click();

      // // Remove the link from the body
      // document.body.removeChild(link);

      /* eslint-disable */
      // change file path, name, extension;
      const fileNameWithoutExtension = postFile.name.replace(/\.[^/.]+$/, "");
      const now = new Date();
      const chunkFolder = now.getMonth() + '_' + now.getDate() + '_' + now.getFullYear() + '_' + now.getHours() + '_' + now.getMinutes() + '_' + now.getSeconds() + '_' + fileNameWithoutExtension;
      const chunkPath = now.getMonth() + '_' + now.getDate() + '_' + now.getFullYear() + '_' + now.getHours() + '_' + now.getMinutes() + '_' + now.getSeconds();

      // start send the file to server
      await sendFile(postFile, setUploadProgress, chunkFolder, chunkPath, enqueueSnackbar).then(async res => {
        // console.log('sendFile response', res);
        if (res === 'Done') {
          // start finalize file
          await finalizeFile(postFile.name, chunkFolder, chunkPath, enqueueSnackbar, IsFollowUp).then(async res => {
            console.log('----------------------------------Finalize result', res);
          });
        }
      });

    } catch (error) {
      console.error(error);
      dispatch(startLoading(false));
      enqueueSnackbar(JSON.stringify(error), {
        variant: 'error',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center',
        },
      });
    }
  };

  const RenderErrors = () => {
    if (Object.keys(errors).length === 0) {
      return null;
    }
    if (errors?.Unfinished) {
      return (
        <Box mb={1} mt={1}>
          <Alert severity="error" sx={{ py: 0 }}>
            {errors?.Unfinished?.message}
          </Alert>
        </Box>
      );
    }
    if (Object.keys(errors).length > 0) {
      return (
        <Box mb={1} mt={1}>
          <Alert severity="error" sx={{ py: 0 }}>
            {Object.keys(errors).join(', ')} is required!
          </Alert>
        </Box>
      );
    }
  };

  const cardHeight = {
    xs: `calc(100vh - ${HEADER.MOBILE_HEIGHT + SPACING + BACK_BUTTON_HEIGHT + NOTCH_HEIGHT}px)`,
    sm: `calc(100vh - ${HEADER.MOBILE_HEIGHT + SPACING + BACK_BUTTON_HEIGHT + NOTCH_HEIGHT}px)`,
    lg: `calc(100vh - ${HEADER.DASHBOARD_DESKTOP_HEIGHT + SPACING + + BACK_BUTTON_HEIGHT + NOTCH_HEIGHT}px)`,
  };

  const tabResultHeight = {
    xs: `calc(100vh - ${HEADER.MOBILE_HEIGHT + SPACING + ANDROID_KEYBOARD + TAB_HEIGHT + BACK_BUTTON_HEIGHT + IOS_KEYBOARD + NOTCH_HEIGHT}px)`,
    sm: `calc(100vh - ${HEADER.MOBILE_HEIGHT + SPACING + ANDROID_KEYBOARD + TAB_HEIGHT + BACK_BUTTON_HEIGHT + IOS_KEYBOARD + NOTCH_HEIGHT}px)`,
    lg: `calc(100vh - ${HEADER.DASHBOARD_DESKTOP_HEIGHT + SPACING + ANDROID_KEYBOARD + TAB_HEIGHT + BACK_BUTTON_HEIGHT + IOS_KEYBOARD + NOTCH_HEIGHT}px)`,
  };

  const tabFactoryInfoHeight = {
    xs: `calc(100vh - ${HEADER.MOBILE_HEIGHT + SPACING + ANDROID_KEYBOARD + TAB_HEIGHT + BACK_BUTTON_HEIGHT + IOS_KEYBOARD + NOTCH_HEIGHT}px)`,
    sm: `calc(100vh - ${HEADER.MOBILE_HEIGHT + SPACING + ANDROID_KEYBOARD + TAB_HEIGHT + BACK_BUTTON_HEIGHT + IOS_KEYBOARD + NOTCH_HEIGHT}px)`,
    lg: `calc(100vh - ${HEADER.DASHBOARD_DESKTOP_HEIGHT + SPACING + ANDROID_KEYBOARD + TAB_HEIGHT + BACK_BUTTON_HEIGHT + IOS_KEYBOARD + NOTCH_HEIGHT}px)`
  };

  const tabAuditHeight = {
    xs: `calc(100vh - ${HEADER.MOBILE_HEIGHT + SPACING + ANDROID_KEYBOARD + TAB_HEIGHT + BACK_BUTTON_HEIGHT + IOS_KEYBOARD + NOTCH_HEIGHT + 50}px)`,
    sm: `calc(100vh - ${HEADER.MOBILE_HEIGHT + SPACING + ANDROID_KEYBOARD + TAB_HEIGHT + BACK_BUTTON_HEIGHT + IOS_KEYBOARD + NOTCH_HEIGHT + 50}px)`,
    lg: `calc(100vh - ${HEADER.DASHBOARD_DESKTOP_HEIGHT + SPACING + ANDROID_KEYBOARD + TAB_HEIGHT + BACK_BUTTON_HEIGHT + IOS_KEYBOARD + NOTCH_HEIGHT + 50}px)`
  }


  // Menu
  const TABS = [
    {
      label: 'Audit Info',
      value: '1',
      disabled: !isOwner && !isViewOnly,
    },
    {
      label: 'Factory Info',
      value: '2',
      disabled: !isOwner && !isViewOnly,
    },
    {
      label: 'Audit Check List',
      value: '3',
      disabled: false,
    },
  ];

  // console.log(values, currentTodoItem);

  return (
    <Page title={'Compliance Detail'}>
      <Container maxWidth={themeStretch ? false : 'lg'}
        sx={{
          paddingLeft: 1,
          paddingRight: 1,
          position: {
            xs: 'fixed',
            lg: 'relative',
          }
        }}>

        <FormProvider methods={methods} onSubmit={handleSubmit(handleSave)}>

          <GoBackButton onClick={() => navigate(PATH_APP.compliance.audit.root)} sx={{ mb: 1 }}
            rightButton={
              <Stack >
                <LoadingButton
                  variant="contained"
                  fullWidth
                  sx={{ minWidth: 150 }}
                  // type="submit"
                  onClick={onOpen}
                  loading={isSubmitting}
                  disabled={isViewOnly}
                >
                  {
                    translate('button.sync')
                  }
                </LoadingButton>
              </Stack>
            }
          />

          <Card id="compliance-card-detail" sx={{
            minHeight: '50vh',
            height: cardHeight,
          }}
          >

            <Tabs
              allowScrollButtonsMobile
              variant="scrollable"
              scrollButtons="auto"
              id="tab-panel"
              value={complianceDetailTab}
              onChange={(e, newValue) => handleChangeTab(e, newValue)}
              sx={{ px: mdUp ? 2 : 1, bgcolor: 'background.neutral', }}
            >
              {TABS.map((tab) => (
                <Tab
                  key={tab.value}
                  value={tab.value}
                  label={
                    <Typography variant="body1" fontSize={smUp ? 14 : 12} fontWeight={'bold'}>
                      {tab.label}
                    </Typography>
                  }
                  style={{ minWidth: 60, }}
                  disabled={tab?.disabled}
                />
              ))}
            </Tabs>

            <Divider />
            <RenderErrors />

            <TabPanel value={'1'} currentTab={complianceDetailTab}>
              {complianceDetailTab === '1' &&
                <Scrollbar>
                  <Box sx={{
                    height: tabResultHeight,
                    py: 2,
                    px: 1,
                  }}
                  >
                    <AuditResult
                      isViewOnly={isViewOnly}
                      currentTodoItem={currentTodoItem}
                      methods={methods}
                    />
                  </Box>
                </Scrollbar>
              }
            </TabPanel>

            <TabPanel value={'2'} currentTab={complianceDetailTab}>
              {complianceDetailTab === '2' &&
                <AuditFactoryInfo
                  dataSource={currentTodoItem?.FactoryInfoLines || []}
                  height={tabFactoryInfoHeight}
                  isViewOnly={isViewOnly}
                  todoId={name}

                />
              }
            </TabPanel>

            <TabPanel value={'3'} currentTab={complianceDetailTab}>
              {complianceDetailTab === '3' &&
                <AuditLines
                  isViewOnly={isViewOnly}
                  currentTodoItem={currentTodoItem}
                  height={tabAuditHeight}
                />
              }
            </TabPanel>
          </Card>


          <Dialog
            open={open} >
            <DialogTitle mb={3}>Confirm</DialogTitle>
            <DialogContent>
              <DialogContentText>Are you sure you want to sync this item to server?</DialogContentText>
            </DialogContent>
            <DialogActions>
              <Stack spacing={3} direction={'row'} justifyContent={'flex-end'} alignItems={'center'} width={'100%'}>
                <Button
                  variant='contained'
                  color='error'
                  onClick={onClose}
                  loading={isSubmitting}
                  disabled={isViewOnly}
                >
                  Cancel
                </Button>
                <Button
                  variant='contained'
                  color='primary'
                  onClick={handleSave}
                  type="submit"
                  loading={isSubmitting}
                  disabled={isViewOnly}
                >
                  Yes
                </Button>
              </Stack>
            </DialogActions>
          </Dialog>

        </FormProvider>

        {
          loading && <UploadFileBackdrop
            loading={loading}
            progress={uploadProgress}
            signalR={signalR}
          />
        }

      </Container>
    </Page >
  );
}


/* eslint-disable */

async function sendFile(file, setUploadProgress, chunkFolder, chunkPath, enqueueSnackbar) {
  console.log('1. Start upload file');

  const url = `${HOST_API}/api/ComplianceAuditMobileApi/UploadFileForInspection`;
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
      const accessToken = window.localStorage.getItem('accessToken');

      // Thực hiện yêu cầu HTTP POST bằng Fetch API
      // const response = await fetch(url, {
      //   method: 'POST',
      //   body: formData,
      //   headers: {
      //     "Authorization": `Bearer ${accessToken}`
      //   },
      //   // keepalive: true,
      // });

      const response = await axios.post(url, formData);

      // console.log(response);

      if (response.status === 200) {
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
        // const result = await response.json();
        const result = await response.data;
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
        console.error('Server responded with an error:', response.data.message);

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
async function finalizeFile(finalFileName, chunkFolder, chunkPath, enqueueSnackbar, IsFollowUp) {
  // debugger
  // const finalizeUrl = `${HOST_API}/api/QCMobileApi/FinalizeFileForQC`;
  const finalizeUrl = !IsFollowUp ? `${HOST_API}/api/ComplianceAuditMobileApi/FinalizeFile/update` : `${HOST_API}/api/ComplianceAuditMobileApi/FinalizeFile/create`;
  console.log('Is follow up', IsFollowUp, finalizeUrl);
  const finalizeData = {
    // Thông tin cần thiết để xác định file và thực hiện nối
    finalFileName: finalFileName,
    chunkFolder: chunkFolder,
    chunkPath: chunkPath
  };
  let finalizeResult = "";


  // const accessToken = window.localStorage.getItem('accessToken');
  // const response = await fetch(finalizeUrl, {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     "Authorization": `Bearer ${accessToken}`
  //   },
  //   body: JSON.stringify(finalizeData),
  //   keepalive: true,
  // });

  // if (response.ok) {
  //   const result = await response.json();
  //   console.log('3.finalizeFile', result.message);
  //   finalizeResult = 'Done'
  // } else {
  //   console.error('Error finalizing file:', response.statusText || 'Error finalizing file');
  //   finalizeResult = response.statusText || 'Error finalizing file'
  // }

  const response = await axios.post(finalizeUrl, finalizeData);
  // console.log(response);
  if (response.status === 200) {
    finalizeResult = 'Done'
  } else {
    finalizeResult = response.data.message || response.statusText || 'Error finalizing file'
  }

  return finalizeResult
}
