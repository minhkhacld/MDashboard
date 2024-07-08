import { Capacitor } from '@capacitor/core';
import { Network } from '@capacitor/network';
import { yupResolver } from '@hookform/resolvers/yup';
import moment from 'moment';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import useDetectKeyboardOpen from 'use-detect-keyboard-open';
import * as Yup from 'yup';
// @mui
import { LoadingButton } from '@mui/lab';
import { Autocomplete, Box, Grid, MenuItem, Stack, TextField, Button } from '@mui/material';
// dev-extreme
// dexie
import { attachmentsDB, mqcDB } from '../../../Db';
// COMPONENTS
import Iconify from '../../../components/Iconify';
import Scrollbar from '../../../components/Scrollbar';
import { FormProvider, RHFDatePicker, RHFSelectMenuItem, RHFTextField } from '../../../components/hook-form/index';
import UploadFileBackDrop from '../components/UploadFileBackdrop';
import CustomDropDown from './CustomDropdown';
import CustomSelectBox from './CustomSelectBox';
// HOOK
import { useExternalScript } from '../../../hooks/useLoadScript';
import useLocales from '../../../hooks/useLocales';
// redux
import { setSignalR, setValues } from '../../../redux/slices/mqc';
import { dispatch, useSelector } from '../../../redux/store';
// routes
import { PATH_APP } from '../../../routes/paths';
// config
import { HEADER, HOST_API } from '../../../config';
// utils
import IconName from '../../../utils/iconsName';
import axios from '../../../utils/axios';

const externalScript = './resumable.js';

FabricInfo.propTypes = {
  isViewOnly: PropTypes.bool,
  currentTodoItem: PropTypes.object,
  onChange: PropTypes.func,
  Enums: PropTypes.array,
  online: PropTypes.bool,
  naviagte: PropTypes.func,
  AttachmentsData: PropTypes.array,
};

// Variable for responsive
const checkNotch = () => {
  const iPhone = /iPhone/.test(navigator.userAgent) && !window.MSStream;
  const aspect = window.screen.width / window.screen.height;
  if (iPhone && aspect.toFixed(3) === '0.462') {
    // I'm an iPhone X or 11...
    return 55;
  }
  return 0;
};

const NOTCH_HEIGHT = checkNotch();
const BREAKCRUM_HEIGHT = 41;
const SPACING = 24;
const ANDROID_KEYBOARD = 0;
const TAB_HEIGHT = 48;
const BACK_BUTTON_HEIGHT = 42;
const SUBMIT_BUTTON = 52;

// const PopperStyle = styled((props) => <Popper placement="bottom-start" {...props} />)({
//   width: '100% !important',
//   maxHeight: '600px !important',
//   minHeight: '500px !important',
// });

const itemType = [
  { title: 'MAIN FABRIC', id: 20411 },
  { title: 'LINING', id: 20414 },
];

function FabricInfo({ isViewOnly, currentTodoItem, Enums, onChange, online, naviagte, AttachmentsData }) {
  // component state
  const [openLightbox, setOpenLightbox] = useState(false);
  const [isSync, setIsSync] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [open, setOpen] = useState(null);
  const [imageEditor, setImageEditor] = useState({
    visible: false,
    image: null,
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  // translation
  const { translate } = useLocales();
  // notistack
  const { enqueueSnackbar } = useSnackbar();
  // redux
  const { LoginUser } = useSelector((store) => store.workflow);
  const { signalR } = useSelector((store) => store.mqc);
  // set Enums
  // const ItemTypeOpt =  Enums?.find((item) => item?.Name === 'ItemType')?.Elements || [];
  // const SizeWidthLengthOpt =  Enums?.find((item) => item?.Name === 'SizeWidthLength')?.Elements || [];
  const CategoryOptions = Enums.find((d) => d.Name === 'Category')?.Elements || [];
  const AuditingResultOpt = Enums?.find((item) => item?.Name === 'AuditingResult')?.Elements || [];
  const UnitOpt = Enums?.find((item) => item?.Name === 'Unit')?.Elements || [];
  const SubFactory = Enums?.find((item) => item?.Name === 'SubFactory')?.Elements || [];
  const Supplier = Enums?.find((item) => item?.Name === 'Supplier')?.Elements || [];
  const Customers = Enums?.find((item) => item?.Name === 'Customers')?.Elements || [];
  const Auditor = Enums?.find((item) => item?.Name === 'Auditor')?.Elements || [];
  // attachments
  const attachments = isViewOnly
    ? currentTodoItem?.Images
    : AttachmentsData?.filter(
        (attachment) =>
          currentTodoItem?.Images?.map((img) => img?.id)?.indexOf(attachment?.id) >= 0 &&
          attachment?.Action !== 'Delete'
      );
  // boolean variables
  const isWebApp = Capacitor.getPlatform() === 'web';
  const isKeyboardOpen = useDetectKeyboardOpen();
  //
  const scriptStatus = useExternalScript(externalScript);
  // form
  const defaultValues = useMemo(
    () => ({
      SysNo: currentTodoItem?.SysNo || '',
      TotalPenaltyQuantity: currentTodoItem?.TotalPenaltyQuantity || 0,
      TotalPoint: '',
      MaxPenaltyQuantity: currentTodoItem?.MaxPenaltyQuantity || '',
      AuditingResult: currentTodoItem?.AuditingResult || '',
      AuditingResultId: currentTodoItem?.AuditingResultId || '',
      SupplierName: currentTodoItem?.SupplierName || '',
      SupplierId: currentTodoItem?.SupplierId || '',
      AuditorName: Auditor?.find((auditor) => currentTodoItem?.AuditorName === auditor?.KnowAs)?.KnowAs || '',
      AuditorId: Auditor?.find((auditor) => currentTodoItem?.AuditorName === auditor?.KnowAs)?.Id || '',
      CustomerName: currentTodoItem?.CustomerName || '',
      CustomerId: currentTodoItem?.CustomerId || '',
      FactoryName: currentTodoItem?.FactoryName || '',
      FactoryId: currentTodoItem?.FactoryId || '',
      ItemCode: currentTodoItem?.ItemCode || '',
      Color: currentTodoItem?.Color || '',
      ColorId: currentTodoItem?.ColorId || '',
      Quantity: currentTodoItem?.Quantity || '',
      MaterialInvoiceNo: currentTodoItem?.MaterialInvoiceNo || '',
      Remark: currentTodoItem?.Remark || '',
      TotalQuantity: '',
      UnitId: currentTodoItem?.UnitId || '',
      ItemTypeId: currentTodoItem?.ItemTypeId || null,
      StartAuditDate: currentTodoItem?.StartAuditDate || moment(new Date()).format('yyyy-MM-DD'),
    }),
    [currentTodoItem, Auditor]
  );

  const TodoInfoScheme = Yup.object().shape({
    SupplierName: Yup.string().required('Supplier is required'),
    AuditorName: Yup.string().required('Auditor is required'),
    CustomerName: Yup.string().required('Customer is required'),
    AuditingResult: Yup.string().required('AuditingResult is required'),
    ColorId: Yup.number().required('Color is required'),
    ItemCode: Yup.string().required('Art is required'),
    StartAuditDate: Yup.string().required('StartAuditDate is required'),
    FactoryName: Yup.string().required('Factory is required'),
    ItemTypeId: Yup.number().required('Item Type is required'),
  });

  const methods = useForm({
    resolver: yupResolver(TodoInfoScheme),
    defaultValues,
  });

  const {
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = methods;

  const values = watch();

  // useEffect block
  useEffect(() => {
    if (currentTodoItem && !isViewOnly) {
      if (currentTodoItem?.UnitId !== 10673) onChange({ UnitId: 10673 });
      if (currentTodoItem?.StartAuditDate === null)
        onChange({ StartAuditDate: moment(new Date()).format('yyyy-MM-DD') });
    }
    setValue('SysNo', currentTodoItem?.SysNo || '');
    setValue('TotalPenaltyQuantity', currentTodoItem?.TotalPenaltyQuantity || 0);
    setValue('MaxPenaltyQuantity', currentTodoItem?.MaxPenaltyQuantity || '');
    setValue('AuditingResult', currentTodoItem?.AuditingResult || '');
    setValue('AuditingResultId', currentTodoItem?.AuditingResultId || '');
    setValue('SupplierName', currentTodoItem?.SupplierName || '');
    setValue('SupplierId', currentTodoItem?.SupplierId || '');
    setValue('AuditorName', currentTodoItem?.AuditorName || '');
    setValue('AuditorId', currentTodoItem?.AuditorId || '');
    setValue('StartAuditDate', currentTodoItem?.StartAuditDate || moment(new Date()).format('yyyy-MM-DD'));
    setValue('CustomerName', currentTodoItem?.CustomerName || '');
    setValue('CustomerId', currentTodoItem?.CustomerId || '');
    setValue('FactoryName', currentTodoItem?.FactoryName || '');
    setValue('FactoryId', currentTodoItem?.FactoryId || '');
    setValue('ItemCode', currentTodoItem?.ItemCode || '');
    setValue('Color', currentTodoItem?.Color || '');
    setValue('ColorId', currentTodoItem?.ColorId || '');
    setValue('Quantity', currentTodoItem?.Quantity || '');
    setValue('MaterialInvoiceNo', currentTodoItem?.MaterialInvoiceNo || '');
    setValue('Remark', currentTodoItem?.Remark || '');
    setValue('ItemTypeId', currentTodoItem?.ItemTypeId || null);
    dispatch(setValues(currentTodoItem));
  }, [currentTodoItem]);

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      const scrolElement = document.getElementById(Object.keys(errors)[0]);
      if (scrolElement) {
        scrolElement.scrollIntoView(false, { behavior: 'smooth' });
      }
    }
  }, [errors]);

  useEffect(() => {
    if (scriptStatus === 'ready') {
      // Do something with it
      console.log('script loaded');
    }
  }, [currentTodoItem, scriptStatus]);

  useEffect(() => {
    return () => {
      // This code runs when the component unmounts
      // Clear the data to prevent displaying outdated data
      dispatch(setSignalR({ id: null, sysNo: null, qcType: null, message: null, type: null, guid: null }));
      console.log('ApiCallComponent is unmounting. Clean up here.');
    };
  }, []);

  useEffect(() => {
    // ⚡️  [log] - ReceiveNotifyMessage 45118 QC Inspection updated
    // ⚡️  [log] - ReceiveNotifyMessage 45118 Inspection 274544 updated
    // ⚡️  [log] - ReceiveNotifyMessage 45118 Inspection 274549 updated
    // ⚡️  [log] - ReceiveNotifyMessage 45118 Inspection 274555 updated
    // ⚡️  [log] - ReceiveNotifyMessage 45118 Inspection 274556 updated
    // ⚡️  [log] - ReceiveNotifyMessage 45118 Inspection 274557 updated
    // ⚡️  [log] - ReceiveNotifyMessage 45118 Inspection 274568 inserted
    // ⚡️  [log] - ReceiveNotifyMessage 45118 Attachment updated
    // ⚡️  [log] - ReceiveNotifyMessage 45118 FinalizeDone
    (async () => {
      if (signalR.message === '4' && signalR.type !== 'Error' && currentTodoItem?.id === signalR?.id) {
        await mqcDB.ToDo.where('id').equals(signalR?.id).delete();
        await attachmentsDB.mqc.where('ParentId').equals(signalR?.id).delete();
        dispatch(setSignalR({ id: null, sysNo: null, qcType: null, message: null, type: null }));
        enqueueSnackbar(translate('mqc.saveSuccess'), {
          variant: 'success',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'center',
          },
        });
        setIsSync(false);
        naviagte(PATH_APP.mqc.root);
      }
    })();
  }, [signalR]);

  // functions
  const processDataBeforeSync = (postObject, QIMaterialFabricLines) => {
    const imageList = AttachmentsData?.filter((att) => att?.ParentId === postObject?.id);
    // prepare object to sync
    const postObjectWithoutImage = {
      ...postObject,
      QIMaterialFabricLines: QIMaterialFabricLines?.map((line) => {
        delete line?.id;
        return {
          ...line,
          QIMaterialFabricRatings: line?.QIMaterialFabricRatings?.map((rating) => {
            delete rating?.id;
            delete rating?.Images;
            return {
              ...rating,
            };
          }),
        };
      }),
      isFinished: true,
    };
    if (postObjectWithoutImage) {
      postObjectWithoutImage.Id =
        postObjectWithoutImage.Id === undefined ? postObjectWithoutImage?.id : postObjectWithoutImage.Id;
    }
    delete postObjectWithoutImage?.id;
    delete postObjectWithoutImage?.Images;
    delete postObjectWithoutImage?.Color;
    delete postObjectWithoutImage?.AuditingResult;

    // get Images from fabric
    const AttachmentsDetail = [
      ...postObject?.Images?.map((image) => {
        const imageData = AttachmentsData?.find((att) => att?.id === image?.id && att?.Guid === image?.Guid);
        return {
          ...image,
          ImageForEntity: 'QIMaterialFabric',
          Data: imageData?.Data,
        };
      }),
    ].filter((image) => image?.Action !== null);
    // get Images from rating
    const AttachmentsFromRating = postObject?.QIMaterialFabricLines?.map((line, indexLine) => {
      return line?.QIMaterialFabricRatings?.map((rating, indexRating) => {
        return rating?.Images?.map((image) => {
          const imageData = AttachmentsData?.find((att) => att?.id === image?.id && att?.Guid === image?.Guid);
          return {
            ...image,
            ImageForEntity: 'QIMaterialFabricRating',
            ParentGuid: imageData?.ParentGuid,
            Data: imageData?.Data,
          };
        });
      });
    }).map((attachments) => {
      return attachments?.map((attachment) => {
        AttachmentsDetail?.push(
          ...attachment
            ?.filter((image) => image?.Action !== null)
            .map((image) => {
              return { ...image };
            })
        );
        return attachment;
      });
    });

    return { QIMaterialFabric: postObjectWithoutImage, Images: AttachmentsDetail };
  };

  const checkSyncRules = (QIMaterialFabricLines, Images) => {
    // Check have line at least 1 rating
    const invalidLines = QIMaterialFabricLines?.filter((line) => line?.QIMaterialFabricRatings?.length === 0);
    // Check Defects have at least 1 images
    const invalidDefects = QIMaterialFabricLines?.filter(
      (line) =>
        line?.QIMaterialFabricRatings?.filter(
          (rating) => rating?.Images?.filter((image) => image?.Action !== 'Delete')?.length === 0
        )?.length > 0
    );
    const hasError = QIMaterialFabricLines?.length === 0 || invalidLines?.length > 0 || invalidDefects?.length > 0;
    if (hasError) {
      enqueueSnackbar(translate('mqc.error.syncRules'), {
        variant: 'error',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center',
        },
      });
      setIsSync(false);
      return false;
    }

    // Images tab Rules
    const categoryMQC = [
      { Code: 'MQC-1', count: 0 },
      { Code: 'MQC-2', count: 0 },
      { Code: 'MQC-3', count: 0 },
    ];
    const imagesTabItems = [...Images?.filter((i) => i?.Action !== 'Delete')];
    imagesTabItems?.map((item) => {
      const itemCategory = CategoryOptions.find((category) => category?.Value === item?.CategoryId);
      if (itemCategory !== undefined) {
        categoryMQC.map((cate) => {
          if (itemCategory?.Code === cate.Code) {
            cate.count += 1;
          }
          return cate;
        });
      }
      return item;
    });
    const imagesTabError = categoryMQC.find((catMQC) => catMQC.count === 0);
    if (imagesTabError !== undefined) {
      enqueueSnackbar(
        'Please attach MQC-Color Shading Report, MQC-Shading Off Report, and MQC-Fabric Inspection Report',
        {
          variant: 'error',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'center',
          },
        }
      );
      setIsSync(false);
      return false;
    }

    return true;
  };

  /* eslint-disable */
  const syncData = async (postObjectProcessed, type) => {
    // try {

    // dispatch(startLoading(true));
    const status = await Network.getStatus();

    // HAS INTERNET CONNECTION
    if (status.connected) {
      const postFile = new File([JSON.stringify(postObjectProcessed)], `MQC_${currentTodoItem.id}.json`, {
        type: 'text/plain',
      });

      const fileNameWithoutExtension = postFile.name.replace(/\.[^/.]+$/, '');
      const now = new Date();
      const chunkFolder =
        now.getMonth() +
        '_' +
        now.getDate() +
        '_' +
        now.getFullYear() +
        '_' +
        now.getHours() +
        '_' +
        now.getMinutes() +
        '_' +
        now.getSeconds() +
        '_' +
        fileNameWithoutExtension;
      const chunkPath =
        now.getMonth() +
        '_' +
        now.getDate() +
        '_' +
        now.getFullYear() +
        '_' +
        now.getHours() +
        '_' +
        now.getMinutes() +
        '_' +
        now.getSeconds();

      await sendFile(postFile, setUploadProgress, chunkFolder, chunkPath, enqueueSnackbar).then(async (res) => {
        // console.log('sendFile response', res);
        if (res === 'Done') {
          await finalizeFile(postFile.name, type, chunkFolder, chunkPath, enqueueSnackbar).then(async (res) => {
            console.log('----------------------------------Finalize result', res);
          });
        }
      });
      // });
    } else {
      setIsSync(false);
      return enqueueSnackbar(translate('inspection.summary.noConnection'), {
        variant: 'error',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center',
        },
      });
    }
  };

  const handleSync = () => {
    setIsSync(true);
    const postObject = { ...currentTodoItem };
    const QIMaterialFabricLines = JSON.parse(JSON.stringify(currentTodoItem?.QIMaterialFabricLines));
    const Images = [...currentTodoItem?.Images];
    if (!checkSyncRules(QIMaterialFabricLines, Images)) {
      return;
    }
    const postObjectProcessed = processDataBeforeSync(postObject, QIMaterialFabricLines);
    console.log(postObjectProcessed);

    // Main handle sync
    try {
      if (currentTodoItem?.Id === undefined) {
        syncData(postObjectProcessed, 'create');
      } else {
        syncData(postObjectProcessed, 'update');
      }
    } catch (e) {
      console.log(e);
      enqueueSnackbar(translate('mqc.error.syncError'), {
        variant: 'error',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center',
        },
      });
      setIsSync(false);
    }
  };

  const onError = (e) => {
    if (e?.ItemTypeId !== null && values?.ItemTypeId === null) {
      enqueueSnackbar('Please select Inspection type (Fabric, Lining)', {
        variant: 'error',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center',
        },
      });
      return;
    }
    Object.keys(e).map((key) => {
      if (e[key] !== undefined && e[key].message !== undefined) {
        enqueueSnackbar(translate('mqc.error.required'), {
          variant: 'error',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'center',
          },
        });
        return;
      }
      return null;
    });
  };

  return (
    <Scrollbar id="FabricHeader">
      <FormProvider methods={methods} onSubmit={handleSubmit(handleSync, onError)}>
        <Box
          sx={{
            height: {
              xs: `calc(100vh - ${
                HEADER.MOBILE_HEIGHT + SPACING + ANDROID_KEYBOARD + TAB_HEIGHT + NOTCH_HEIGHT + SUBMIT_BUTTON
              }px)`,
              sm: `calc(100vh - ${
                HEADER.MOBILE_HEIGHT + SPACING + ANDROID_KEYBOARD + TAB_HEIGHT + NOTCH_HEIGHT + SUBMIT_BUTTON
              }px)`,
              lg: `calc(100vh - ${
                HEADER.DASHBOARD_DESKTOP_HEIGHT + NOTCH_HEIGHT + SPACING + ANDROID_KEYBOARD + TAB_HEIGHT + SUBMIT_BUTTON
              }px)`,
            },
            py: 2,
            px: 1,
          }}
        >
          <Grid container rowSpacing={3} columnSpacing={2} pb={12}>
            <Grid item xs={12} md={12}>
              {itemType?.map((i) => {
                return (
                  <Button
                    key={i.id}
                    variant={i.id === values?.ItemTypeId ? 'contained' : 'outlined'}
                    color={errors?.ItemTypeId && values?.ItemTypeId === null ? 'error' : 'info'}
                    sx={{ mr: 2, pointerEvents: isViewOnly ? 'none' : '' }}
                    onClick={() => {
                      setValue('ItemTypeId', i.id);
                      onChange({ ItemTypeId: i.id });
                    }}
                  >
                    {i.title}
                  </Button>
                );
              })}
            </Grid>
            <Grid item xs={12} md={6}>
              <RHFTextField
                size="small"
                label={'Doc No'}
                multiline
                maxRows={1}
                value={currentTodoItem?.SysNo || ''}
                InputProps={{ readOnly: true }}
                disabled
              />
            </Grid>
            <Grid item xs={6} md={6}>
              <RHFTextField
                size="small"
                label={'Total Penalty Qty'}
                multiline
                maxRows={1}
                value={currentTodoItem?.TotalPenaltyQuantity || 0}
                disabled
              />
            </Grid>
            <Grid item xs={6} md={4}>
              <TextField
                fullWidth
                onFocus={(event) => {
                  event.target.select();
                }}
                size="small"
                label={
                  <Stack direction="row" justifyContent="center" alignItems="center">
                    <p className="ml-1">{'Max Penalty Qty'}</p>
                  </Stack>
                }
                InputLabelProps={{
                  style: { color: 'var(--label)' },
                  shrink: true,
                }}
                value={currentTodoItem?.MaxPenaltyQuantity || ''}
                multiline
                maxRows={1}
                disabled
              />
            </Grid>
            <Grid item xs={6} md={4}>
              <RHFSelectMenuItem
                size="small"
                id="AuditingResult"
                inputProps={{ readOnly: isViewOnly }}
                label={
                  <>
                    Auditing Result
                    <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 16 16">
                      <path
                        fill="red"
                        d="M8 0a1 1 0 0 1 1 1v5.268l4.562-2.634a1 1 0 1 1 1 1.732L10 8l4.562 2.634a1 1 0 1 1-1 1.732L9 9.732V15a1 1 0 1 1-2 0V9.732l-4.562 2.634a1 1 0 1 1-1-1.732L6 8L1.438 5.366a1 1 0 0 1 1-1.732L7 6.268V1a1 1 0 0 1 1-1z"
                      />
                    </svg>
                  </>
                }
                value={AuditingResultOpt?.find((d) => d?.Value === currentTodoItem?.AuditingResultId)?.Value || ''}
                onChange={(e, newValue) => {
                  setValue('AuditingResult', newValue?.props?.children);
                  setValue('AuditingResultId', newValue?.props?.value);
                  onChange({ AuditingResult: newValue?.props?.children, AuditingResultId: newValue?.props?.value });
                }}
                error={errors?.AuditingResult !== undefined}
              >
                {AuditingResultOpt.length > 0 &&
                  AuditingResultOpt.map((item) => (
                    <MenuItem key={item?.Value} value={item?.Value}>
                      {item?.Caption}
                    </MenuItem>
                  ))}
              </RHFSelectMenuItem>
            </Grid>

            <Grid item xs={6} md={4}>
              <Autocomplete
                id="SupplierName"
                autoComplete
                readOnly={isViewOnly}
                onChange={(e, newValue) => {
                  setValue('SupplierName', newValue?.Name);
                  setValue('SupplierId', newValue?.Id);
                  onChange({ SupplierName: newValue?.Name, SupplierId: newValue?.Id });
                }}
                defaultValue={Supplier?.find((d) => d?.Id === currentTodoItem?.SupplierId) || {}}
                value={Supplier?.find((d) => d?.Id === currentTodoItem?.SupplierId) || {}}
                getOptionLabel={(option) => {
                  return option?.Name === undefined ? '' : `${option?.Name}` || '';
                }}
                options={Supplier || []}
                size="small"
                autoHighlight
                sx={{ width: '100%', minWidth: 150 }}
                renderInput={(params) => (
                  <RenderInput
                    params={{ ...params, error: errors?.SupplierName !== undefined }}
                    label="Supplier"
                    required
                  />
                )}
                // PopperComponent={PopperStyle}
                renderOption={(props, option) => {
                  delete props?.key;
                  return (
                    <Box component="li" key={props.id} {...props}>
                      {option?.Name}
                    </Box>
                  );
                }}
                isOptionEqualToValue={(option, value) => {
                  return `${option?.Id}` === `${value?.Id}`;
                }}
              />
            </Grid>
            <Grid item xs={6} md={6}>
              <Autocomplete
                id="AuditorName"
                autoComplete
                readOnly={isViewOnly}
                defaultValue={
                  Auditor?.find((d) => d?.Id === currentTodoItem?.AuditorId) ||
                  // Auditor?.find((d) => d?.Id === LoginUser?.EmpId) ||
                  {}
                }
                value={
                  Auditor?.find((d) => d?.Id === currentTodoItem?.AuditorId) ||
                  // Auditor?.find((d) => d?.Id === LoginUser?.EmpId) ||
                  {}
                }
                onChange={(e, newValue) => {
                  setValue('AuditorName', newValue?.KnowAs);
                  setValue('AuditorId', newValue?.Id);
                  onChange({ AuditorName: newValue?.KnowAs, AuditorId: newValue?.Id });
                }}
                getOptionLabel={(option) => {
                  return option?.KnowAs === undefined ? '' : `${option?.KnowAs}` || '';
                }}
                options={Auditor || []}
                size="small"
                autoHighlight
                sx={{ width: '100%', minWidth: 150 }}
                renderInput={(params) => (
                  <RenderInput
                    params={{ ...params, error: errors?.AuditorName !== undefined }}
                    label="Auditor"
                    required
                  />
                )}
                // PopperComponent={PopperStyle}
                renderOption={(props, option) => {
                  return (
                    <Box component="li" {...props}>
                      {option?.KnowAs}
                    </Box>
                  );
                }}
                isOptionEqualToValue={(option, value) => {
                  return `${option?.KnowAs}` === `${value?.KnowAs}`;
                }}
              />
            </Grid>

            <Grid item xs={6} md={6}>
              <RHFDatePicker
                // label="Audit Date"
                id="StartAuditDate"
                label={'Audit Date'}
                value={moment(values?.StartAuditDate || new Date()).format('yyyy-MM-DD')}
                onChange={(e) => {
                  const changedDate =
                    moment(e).format('yyyy-MM-DD') === 'Invalid date'
                      ? moment(new Date()).format('yyyy-MM-DD')
                      : moment(e).format('yyyy-MM-DD');
                  setValue('StartAuditDate', changedDate);
                  onChange({ StartAuditDate: changedDate });
                }}
                readOnly={isViewOnly}
                required
              />
            </Grid>
            <Grid item xs={6} md={6}>
              <Autocomplete
                id="CustomerName"
                autoComplete
                readOnly={isViewOnly}
                defaultValue={Customers?.find((d) => d?.Name === currentTodoItem?.CustomerName) || {}}
                value={Customers?.find((d) => d?.Name === currentTodoItem?.CustomerName) || {}}
                onChange={(event, newValue) => {
                  setValue('CustomerName', newValue?.Name);
                  setValue('CustomerId', newValue?.Id);
                  onChange({ CustomerName: newValue?.Name, CustomerId: newValue?.Id });
                }}
                getOptionLabel={(option) => {
                  return option?.Name === undefined ? '' : `${option?.Name}` || '';
                }}
                options={Customers || []}
                size="small"
                autoHighlight
                sx={{ width: '100%', minWidth: 150 }}
                renderInput={(params) => (
                  <RenderInput
                    params={{ ...params, error: errors?.CustomerName !== undefined }}
                    label="Customer"
                    required
                  />
                )}
                // PopperComponent={PopperStyle}
                renderOption={(props, option) => {
                  return (
                    <Box component="li" {...props}>
                      {option?.Name}
                    </Box>
                  );
                }}
                isOptionEqualToValue={(option, value) => {
                  return `${option?.Name}` === `${value?.Name}`;
                }}
              />
            </Grid>
            <Grid item xs={6} md={6}>
              <Autocomplete
                id="FactoryName"
                autoComplete
                readOnly={isViewOnly}
                defaultValue={SubFactory?.find((d) => d?.Name === currentTodoItem?.FactoryName) || {}}
                value={SubFactory?.find((d) => d?.Name === currentTodoItem?.FactoryName) || {}}
                onChange={(event, newValue) => {
                  setValue('FactoryName', newValue?.Name);
                  setValue('FactoryId', newValue?.Id);
                  onChange({
                    FactoryName: newValue?.Name,
                    FactoryId: newValue?.Id,
                    SubFactoryName: newValue?.Name,
                    SubFactoryId: newValue?.Id,
                  });
                }}
                getOptionLabel={(option) => {
                  return option?.Name === undefined ? '' : `${option?.Name}` || '';
                }}
                options={SubFactory || []}
                size="small"
                autoHighlight
                sx={{ width: '100%', minWidth: 150 }}
                renderInput={(params) => (
                  <RenderInput
                    params={{ ...params, error: errors?.FactoryName !== undefined }}
                    label="Factory"
                    required
                  />
                )}
                // PopperComponent={PopperStyle}
                renderOption={(props, option) => {
                  return (
                    <Box component="li" {...props}>
                      {option?.Name}
                    </Box>
                  );
                }}
                isOptionEqualToValue={(option, value) => {
                  return `${option?.Name}` === `${value?.Name}`;
                }}
              />
            </Grid>
            <Grid item xs={12} md={12}>
              <CustomDropDown errors={errors} isViewOnly={isViewOnly} methods={methods} onChange={onChange} />
            </Grid>
            <Grid item xs={12} md={12}>
              <CustomSelectBox errors={errors} isViewOnly={isViewOnly} methods={methods} onChange={onChange} />
            </Grid>
            <Grid item xs={6} md={4}>
              <TextField
                fullWidth
                onFocus={(event) => {
                  event.target.select();
                }}
                size="small"
                label={
                  <Stack direction="row" justifyContent="center" alignItems="center">
                    <p className="ml-1">{'Total Quantity'}</p>
                  </Stack>
                }
                InputLabelProps={{
                  style: { color: 'var(--label)' },
                  shrink: true,
                }}
                value={values?.Quantity || ''}
                InputProps={{
                  readOnly: isViewOnly,
                  inputProps: { inputMode: 'decimal' },
                }}
                maxRows={1}
                onChange={(e) => {
                  setValue('Quantity', e?.target?.value.replace(',', '.'));
                  onChange({ Quantity: e?.target?.value.replace(',', '.') });
                }}
                onBlur={(e) => {
                  const value = Number(e?.target?.value.replace(',', '.'));
                  setValue('Quantity', Number(value.toFixed(2)));
                  onChange({ Quantity: Number(value.toFixed(2)) });
                }}
                type="text"
              />
            </Grid>
            <Grid item xs={6} md={4}>
              <Autocomplete
                autoComplete
                readOnly={isViewOnly}
                disabled
                defaultValue={
                  UnitOpt?.find((d) => d?.Value === currentTodoItem?.UnitId && isViewOnly) ||
                  UnitOpt?.find((d) => d?.Value === 10673) ||
                  {}
                }
                value={
                  UnitOpt?.find((d) => d?.Value === currentTodoItem?.UnitId && isViewOnly) ||
                  UnitOpt?.find((d) => d?.Value === 10673) ||
                  {}
                }
                getOptionLabel={(option) => {
                  // console.log(option);
                  return option?.Caption === undefined ? '' : `${option?.Caption}` || '';
                }}
                options={UnitOpt || []}
                size="small"
                autoHighlight
                sx={{ width: '100%', minWidth: 150 }}
                renderInput={(params) => <RenderInput params={params} label="Unit" required />}
                renderOption={(props, option) => {
                  return (
                    <Box component="li" {...props}>
                      {option?.Caption}
                    </Box>
                  );
                }}
                isOptionEqualToValue={(option, value) => {
                  return `${option?.Value}` === `${value?.Value}`;
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                onFocus={(event) => {
                  event.target.select();
                }}
                size="small"
                label={
                  <Stack direction="row" justifyContent="center" alignItems="center">
                    <p className="ml-1">{'Material Invoice No'}</p>
                  </Stack>
                }
                InputLabelProps={{
                  style: { color: 'var(--label)' },
                  shrink: true,
                }}
                defaultValue={currentTodoItem?.MaterialInvoiceNo || ''}
                onChange={(e) => {
                  setValue('MaterialInvoiceNo', e?.target?.value);
                  onChange({ MaterialInvoiceNo: e?.target?.value });
                }}
                InputProps={{ readOnly: isViewOnly }}
                multiline
                maxRows={1}
              />
            </Grid>
            <Grid item xs={12} md={12}>
              <TextField
                fullWidth
                onFocus={(event) => {
                  event.target.select();
                }}
                size="small"
                label={
                  <Stack direction="row" justifyContent="center" alignItems="center">
                    <p className="ml-1">{'Remark'}</p>
                  </Stack>
                }
                InputLabelProps={{
                  style: { color: 'var(--label)' },
                  shrink: true,
                }}
                defaultValue={currentTodoItem?.Remark || ''}
                onChange={(e) => {
                  setValue('Remark', e?.target?.value);
                  onChange({ Remark: e?.target?.value });
                }}
                InputProps={{ readOnly: isViewOnly }}
                multiline
                maxRows={3}
              />
            </Grid>
          </Grid>
        </Box>
        {/* {isSync ? <LoadingBackDrop loading={isSync} text={'Synchronizing data, please wait...!!!'} /> : null} */}
        {isSync && <UploadFileBackDrop loading={isSync} progress={uploadProgress} signalR={signalR} />}

        {!isKeyboardOpen && (
          <Box
            sx={{
              width: {
                xs: '100%',
                md: '25%',
                lg: '25%',
              },
              position: 'fixed',
              overflow: 'hidden',
              bottom: 3,
              left: { xs: 1, md: 'auto', lg: 'auto' },
              pl: 1,
              pr: 1,
              pb: 1,
            }}
            id="sync-button-mqc"
          >
            <LoadingButton
              variant={'contained'}
              fullWidth
              type="submit"
              disabled={!online || isSync || isViewOnly}
              loading={isSync}
            >
              {translate('mqc.sync')}
            </LoadingButton>
          </Box>
        )}
      </FormProvider>
    </Scrollbar>
  );
}

export default FabricInfo;

const RenderInput = ({ params, label, ...other }) => {
  RenderInput.propTypes = {
    params: PropTypes.object,
    label: PropTypes.string,
  };

  return (
    <TextField
      {...params}
      fullWidth
      onFocus={(event) => {
        event.target.select();
      }}
      size="small"
      label={
        <Stack direction="row" justifyContent="center" alignItems="center">
          <Iconify icon={IconName.search} />
          <p className="ml-1 mr-1">{label}</p>
          {other?.required && (
            // <Iconify icon={'bi:asterisk'} sx={{ color: 'red', ml: 1, fontSize: 7 }} />
            <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 16 16">
              <path
                fill="red"
                d="M8 0a1 1 0 0 1 1 1v5.268l4.562-2.634a1 1 0 1 1 1 1.732L10 8l4.562 2.634a1 1 0 1 1-1 1.732L9 9.732V15a1 1 0 1 1-2 0V9.732l-4.562 2.634a1 1 0 1 1-1-1.732L6 8L1.438 5.366a1 1 0 0 1 1-1.732L7 6.268V1a1 1 0 0 1 1-1z"
              />
            </svg>
          )}
        </Stack>
      }
      InputLabelProps={{
        style: { color: 'var(--label)' },
        shrink: true,
      }}
    />
  );
};

/* eslint-disable */

async function sendFile(file, setUploadProgress, chunkFolder, chunkPath, enqueueSnackbar) {
  console.log('1. Start upload file');

  const url = `${HOST_API}/api/MQCMobileApi/UploadFileForInspection`;
  // 1 megabyte =1000000 bytes;
  // const chunkSize = 10000000;
  const chunkSize = 1000000;
  const totalChunks = Math.ceil(file.size / chunkSize);
  let message = '';
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
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        // keepalive: true,
      });

      if (response.ok) {
        setUploadProgress(Math.round((currentChunk / totalChunks) * 100));
        const findIndex = chunkPromises.findIndex((d) => d.chunk === currentChunk);
        if (findIndex < 0) {
          chunkPromises.push({
            chunk: currentChunk,
            status: true,
          });
        } else {
          chunkPromises[findIndex] = {
            chunk: currentChunk,
            status: true,
          };
        }
        const result = await response.json();
        // console.log(result);
        if (currentChunk === totalChunks) {
          message = result.message;
        }
        // await new Promise(resolve => setTimeout(resolve, 2000));
      } else {
        const chunkExit = chunkPromises.find((d) => d.chunk === currentChunk);
        if (!chunkExit) {
          chunkPromises.push({
            chunk: currentChunk,
            status: false,
          });
        }

        // Nếu có lỗi, hoặc nếu server trả về status khác 200, xem xét resumable upload
        console.error('Server responded with an error:', response.statusText);

        // Chờ 2 giây trước khi thực hiện upload lại chunk này
        await new Promise((resolve) => setTimeout(resolve, 2000));
        // Giảm giá trị của currentChunk để upload lại chunk này
        currentChunk--;
        continue; // Chuyển sang chunk tiếp theo trong vòng lặp
      }
    } catch (error) {
      const chunkExit = chunkPromises.find((d) => d.chunk === currentChunk);
      if (!chunkExit) {
        chunkPromises.push({
          chunk: currentChunk,
          status: false,
        });
      }

      // Xử lý lỗi
      console.error('An error occurred while making the request:', error);

      // Chờ 2 giây trước khi thực hiện upload lại chunk này
      await new Promise((resolve) => setTimeout(resolve, 2000));
      // Giảm giá trị của currentChunk để upload lại chunk này
      currentChunk--;
      continue; // Chuyển sang chunk tiếp theo trong vòng lặp
    }
  }

  console.log('2.Upload completed!');
  return message;
}

// Hàm nối file khi tất cả các chunk đã được upload
async function finalizeFile(finalFileName, type, chunkFolder, chunkPath, enqueueSnackbar) {
  const accessToken = window.localStorage.getItem('accessToken');
  // debugger
  const finalizeUrl = `${HOST_API}/api/MQCMobileApi/FinalizeFile/${type}`;
  const finalizeData = {
    // Thông tin cần thiết để xác định file và thực hiện nối
    finalFileName: finalFileName,
    chunkFolder: chunkFolder,
    chunkPath: chunkPath,
  };
  let finalizeResult = '';

  // try {
  // const response = await fetch(finalizeUrl, {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     Authorization: `Bearer ${accessToken}`,
  //   },
  //   body: JSON.stringify(finalizeData),
  //   keepalive: true,
  // });

  // if (response.ok) {
  //   const result = await response.json();
  //   console.log('3.finalizeFile', result.message);
  //   finalizeResult = 'Done';
  // } else {
  //   console.error('Error finalizing file:', response.statusText || 'Error finalizing file');
  //   finalizeResult = response.statusText || 'Error finalizing file';
  // }
  // } catch (error) {
  //   finalizeResult = 'Error finalizing file'
  //   console.error('An error occurred while finalizing file:', error);
  // }

  const response = await axios.post(finalizeUrl, finalizeData);
  // console.log(response);
  if (response.status === 200) {
    finalizeResult = 'Done'
  } else {
    finalizeResult = response.data.message || response.statusText || 'Error finalizing file'
  }

  return finalizeResult;
}
