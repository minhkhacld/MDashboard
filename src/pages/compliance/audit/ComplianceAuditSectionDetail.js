import { Camera, CameraDirection, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { FilePicker as CapacitorFilePicker } from '@capawesome/capacitor-file-picker';
import { yupResolver } from '@hookform/resolvers/yup';
import { decode } from 'base64-arraybuffer';
import { Popup, ScrollView } from 'devextreme-react';
import { useLiveQuery } from 'dexie-react-hooks';
import moment from 'moment';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import useDetectKeyboardOpen from 'use-detect-keyboard-open';
import * as Yup from 'yup';
// @mui
import { LoadingButton } from '@mui/lab';
import { Box, FormControlLabel, FormGroup, FormHelperText, Grid, MenuItem, Stack, Switch, TextField, Typography, useTheme } from '@mui/material';
// Redux
// routes
import { attachmentsDB, complianceDB } from '../../../Db';
// hooks
import {
  FormProvider,
  RHFSelectMenuItem,
  RHFSwitch,
  RHFTextField,
  RHFTextMobileDatePicker,
  RHFUploadMultiFile,
  RHFUploadMultiFileCapacitor
} from '../../../components/hook-form/index';
import useLocales from '../../../hooks/useLocales';
import useResponsive from '../../../hooks/useResponsive';
// components
import LightboxModal from '../../../sections/qc/inspection/components/LightboxModal';
// CONFIG
import Iconify from '../../../components/Iconify';
import MenuPopover from '../../../components/MenuPopover';
import { NOTCH_HEIGHT, QC_ATTACHEMENTS_HOST_API } from '../../../config';
import useIsOnline from '../../../hooks/useIsOnline';
import { setMinnId } from '../../../redux/slices/compliance';
import { dispatch, useSelector } from '../../../redux/store';
import CustomImageEditor from '../../../sections/qc/inspection/components/CustomImageEditor';
// utils
import BackDrop from '../../../components/BackDrop';
import { processArrayComplianceLineImages } from '../../../utils/handleDbAttachment';
import IconName from '../../../utils/iconsName';
import processArray from '../../../utils/processArray';
import uuidv4 from '../../../utils/uuidv4';

// ----------------------------------------------------------------------

const SPACING = 24 + 36 + 10 + 55;
const SHOW_CRITICAL_OPTIONS = ["Technical", "Social", "C-TPAT"];

// Props types
ComplianceAuditSectionDetail.propTypes = {
  isViewOnly: PropTypes.bool,
  itemData: PropTypes.object,
  Section: PropTypes.object,
  modalDetail: PropTypes.object,
  setModalDetail: PropTypes.func,
  dataSource: PropTypes.array,
  setDataSource: PropTypes.func,
  currentTodoItem: PropTypes.object,
  Enums: PropTypes.array,
};


export default
  // memo(
  function ComplianceAuditSectionDetail({
    isViewOnly,
    itemData,
    Section,
    modalDetail,
    setModalDetail,
    dataSource,
    setDataSource,
    currentTodoItem,
    Enums,
  }) {

  // Hooks;

  const { translate } = useLocales();
  const smUp = useResponsive('up', 'sm');
  const mdUp = useResponsive('up', 'md');
  const { enqueueSnackbar } = useSnackbar();
  const complianceAttachments = useLiveQuery(() => attachmentsDB?.compliance.where('RecordGuid').equals(itemData?.Guid).toArray(), [dataSource, itemData]) || [];
  const isKeyboardOpen = useDetectKeyboardOpen();

  // redux
  const { minId } = useSelector((store) => store.compliance);
  const platform = Capacitor.getPlatform();
  const isWebApp = platform === 'web';

  // COMPONENT STATES
  const [openLightbox, setOpenLightbox] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(null);
  const [imageEditor, setImageEditor] = useState({
    visible: false,
    image: null,
  });

  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const closeModal = useCallback((item) => {
    setModalDetail({ ...modalDetail, visible: false, item: null });
  }, []);

  const defaultValues = useMemo(() => itemData, [itemData,]);

  const EvaluationSchema = Yup.object().shape({
    IsNA: Yup.boolean().required('Remark is required'),
  });

  const methods = useForm({
    resolver: yupResolver(EvaluationSchema),
    defaultValues,
  });

  const {
    watch,
    setValue, reset,
    formState: { errors },
  } = methods;

  const values = watch();

  useEffect(() => {
    return () => {
      setProgress(pre => ({ ...pre, total: 0, current: 0 }));
      setImageEditor({
        visible: false,
        image: null,
      })
    }
  }, [])


  // HANDLE SAVE PREPRODUCTION
  const handleSave = async (e) => {
    try {
      // console.log(errors);
      if (Object.keys(errors).length > 0) {
        return;
      }
      setLoading(true);

      const newValues = { ...values };
      const Attachments = newValues.Attachments;
      setProgress(pre => ({ ...pre, total: Attachments.length }))
      const LineDetails = { ...newValues, Attachments: [], IsFinished: true };
      // updateAttachements(Attachments, newValues.IsNA)
      await processArrayComplianceLineImages(Attachments, attachmentsDB, complianceAttachments, setProgress)
        .then(async () => {
          delete values.Attachments;
          delete LineDetails.Attachments;
          await complianceDB.Todo.where('id')
            .equals(currentTodoItem?.id)
            .modify((x, ref) => {
              // console.log('default', x, ref);
              // const newSections = JSON.parse(JSON.stringify(currentTodoItem.Sections));
              const newSections = [...currentTodoItem.Sections];
              const sectionIndex = newSections.findIndex((d) => d.Id === Section.Id);
              const newItems = newSections[sectionIndex].Items;
              const itemIndex = newItems.findIndex((d) => d.Id === newValues.Id);
              // newItems[itemIndex] = values;
              newItems[itemIndex] = LineDetails;
              newSections[sectionIndex].Items = newItems;
              ref.value = { ...currentTodoItem, Sections: newSections };
              setDataSource(
                dataSource.map((d) => {
                  if (d.Id === newItems[itemIndex].Id) {
                    return newItems[itemIndex];
                  }
                  return d;
                })
              );
            })
            .then(() => {
              closeModal(modalDetail.item);
            });
        })
        .catch((err) => console.error(err));
      setLoading(false);
      setProgress(pre => ({ ...pre, total: 0, current: 0 }));
    } catch (error) {
      console.error(error);
      setLoading(false);
      setProgress(pre => ({ ...pre, total: 0, current: 0 }));
      enqueueSnackbar(JSON.stringify(error), {
        variant: 'error',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center',
        },
      });
    }
  };


  // Handle upload multi file;
  const handleDrop = async (acceptedFiles) => {
    try {
      if (!loading) {
        setLoading(true)
      }
      setProgress(pre => ({ ...pre, total: acceptedFiles.length }))
      // Can be set to the src of an image now
      const Attachments = [...values.Attachments] || [];
      let insertId;

      const imageResizeBase64 = await processArray(acceptedFiles, setProgress);

      setValue('Attachments', [
        ...imageResizeBase64.reverse().map((file, index) => {
          if (minId >= 0) {
            insertId = -1 - index;
          } else {
            insertId = minId - 1 - index;
          }
          if (index === acceptedFiles.length - 1) {
            dispatch(setMinnId(insertId));
          }
          return {
            id: insertId,
            Guid: uuidv4(),
            Title: null,
            Name: file?.name.includes('image') ? `Image ${Attachments.length + 1 + index}.jpg` : file?.name,
            URL: null,
            Remark: null,
            InternalURL: null,
            RecordGuid: itemData?.Guid,
            Data: file.base64,
            Action: 'Insert',
            ParentId: currentTodoItem.id,
          };
        }),
        ...Attachments,
      ]);
      setLoading(false);
      setProgress(pre => ({ ...pre, total: 0, current: 0 }));
    } catch (err) {
      console.error(err);
      setLoading(false);
      setProgress(pre => ({ ...pre, total: 0, current: 0 }));
    }
  };

  //  Handle Take photo button
  const handleTakePhoto = async () => {
    try {

      // Request permision for ios
      if (platform === 'ios') {
        const permision = await Camera.checkPermissions();
        if (permision.camera === 'denied') {
          await Camera.requestPermissions({ permissions: 'camera' }).then((res) => {
            console.log('res request Permision', res);
          });
        }
      };

      const Attachments = [...values.Attachments] || [];

      // Take photo
      const cameraPhoto = await Camera.getPhoto({
        quality: 100,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        saveToGallery: false,
        direction: CameraDirection.Rear,
        presentationStyle: 'fullscreen',
        source: CameraSource.Camera,
      });

      const blobImage = new Blob([new Uint8Array(decode(cameraPhoto.base64String))], {
        type: `image/${cameraPhoto.format}`,
      });

      const fileConvert = new File([blobImage], `Image_${Attachments.length + 1}.jpeg`, {
        lastModified: moment().unix(),
        type: blobImage.type,
      });

      handleDrop([fileConvert]);

    } catch (err) {

      console.error(err);

    }
  };


  const androidCameraGetPicture = async () => {

    // Request permision for ios
    if (platform === 'ios') {
      const permision = await Camera.checkPermissions();
      // console.log('photo permision', permision);
      if (permision.photos === 'denied' || permision.photos === 'prompt') {
        await Camera.requestPermissions({ permissions: 'photos' }).then((res) => {
          console.log('res request Permision', res);
        });
      }
    };

    const Attachments = [...values.Attachments] || [];

    const { files } = await CapacitorFilePicker.pickImages({
      readData: true,
      multiple: true,
    });

    // console.log('files', JSON.stringify(files));

    const imageLists = files.map((photo, index) => {

      const blobImage = new Blob([new Uint8Array(decode(photo.data))], {
        type: photo?.mimeType || `image/jpeg`,
      });

      const fileConvert = new File([blobImage], `Image-${Attachments.length + 1 + index}.jpeg`, {
        lastModified: moment().unix(),
        type: blobImage.type,
      });

      return fileConvert;

    });

    handleDrop(imageLists);
  }


  const handleRemoveAll = () => {
    const Attachments = [...values.Attachments];
    if (Attachments.length > 0) {
      setValue('Attachments', Attachments.map(d => ({ ...d, Action: 'Delete', Data: null })));
    };
  };



  // Remove single picture
  // const handleRemove = (file) => {
  //   const Attachments = values.Attachments;
  //   if (Attachments.length > 0) {
  //     const fileIndex = Attachments.findIndex((d) => d.id === file.id);
  //     Attachments[fileIndex].Action = 'Delete';
  //     setValue('Attachments', Attachments);
  //   }
  // };

  const handleRemove = () => {
    const Attachments = [...values.Attachments];
    if (Attachments.length > 0) {
      Attachments[selectedImage].Action = 'Delete';
      setValue('Attachments', Attachments);
      setOpen(null);
    };
  };




  // OPEN LIGHTBOX VIEW PICTURE
  const handleClick = async (file, e) => {
    const Attachments = values.Attachments;
    const imageIndex = Attachments.findIndex((d) => {
      if (isViewOnly) {
        return d.Id === file.Id;
      }
      return d.id === file.id;
    });
    if (isViewOnly) {
      setOpenLightbox(true);
      setSelectedImage(imageIndex);
    } else {
      setSelectedImage(imageIndex);
      setOpen(e.currentTarget);
      setImageEditor({
        ...imageEditor,
        image: file,
      });
    }
  };

  // SOURCE FOR IMAGE LIGHTBOX
  const imagesLightbox =
    values.Attachments && values.Attachments.length > 0
      ? values?.Attachments.filter((d) => {
        function extension(filename) {
          const r = /.+\.(.+)$/.exec(filename);
          return r ? r[1] : null;
        }
        const fileExtension = extension(d?.Name).toLowerCase();
        const isImage = ['jpeg', 'png', 'jpg', 'gif', 'webp', 'avif', 'jfif'].includes(fileExtension);
        return isImage && d?.Action !== 'Delete';
      })
      : [];

  const ImageUrl = `${QC_ATTACHEMENTS_HOST_API}/${imagesLightbox[selectedImage]?.Guid}`;

  const AuditingResultsOpt =
    Enums.find((d) => d.Name === 'ComplianceLineEvaluation')?.Elements.filter((d) => d?.Caption !== 'N/A') || [];
  const TechnicalAuditingResultOption = [
    { label: 3, value: 3 },
    { label: 2, value: 2 },
    { label: 1, value: 1 },
    { label: 0, value: 0 },
  ];

  const defaultEvaluation =
    AuditingResultsOpt.length > 0
      ? AuditingResultsOpt.find((d) => d.Value === values?.EvaluationId)?.Value || ''
      : values?.EvaluationId || '';
  const defaultEvaluationScore =
    values?.EvaluationScore === null
      ? ''
      : TechnicalAuditingResultOption.find((d) => Number(d.value) === Number(values?.EvaluationScore))?.value || 0;

  /// handle select result
  const handleSelectAuditingResult = (e, newValue) => {
    setValue('EvaluationName', newValue.props.children);
    setValue('EvaluationId', newValue.props.value);
  };

  const handleSelectTechnicalAuditingResult = (e, newValue) => {
    setValue('EvaluationScore', newValue.props.value);
  };

  const handleToggleNA = async (e) => {
    if (e.target.checked) {
      setValue('IsNA', true);
      // setValue('Attachments', []);
      setValue('EvaluationScore', null);
      setValue('EvaluationId', null);
      setValue('Classification', null);
      setValue('DetailedFinding', null);
      setValue('MotivesSuggestion', null);
      setValue('ExpectedCompletion', null);
      setValue('IsCriticalFound', false);
      setValue('Attachments', values.Attachments.map(d => ({ ...d, Action: 'Delete' })));
    } else {
      setValue('IsNA', false);
    };
  };

  const renderImage =
    imagesLightbox.length > 0
      ? imagesLightbox.map((d) => (d?.Data !== null ? d?.Data : `${QC_ATTACHEMENTS_HOST_API}/${d?.Guid}`))
      : [];

  const showCritical = SHOW_CRITICAL_OPTIONS.includes(currentTodoItem?.AuditType);


  // console.log(
  //   values,
  //   // itemData,
  //   // Section,
  //   // currentTodoItem
  // );


  return (
    <Box sx={{ height: '100%', }}>
      <ScrollView width={'100%'} height={'100%'}>
        <FormProvider methods={methods}>
          <Box p={1} sx={{
            paddingBottom: 100,
            height: {
              xs: `calc(100vh - ${SPACING + NOTCH_HEIGHT}px)`,
              sm: `calc(100vh - ${SPACING + NOTCH_HEIGHT}px)`,
              lg: `calc(100vh - ${SPACING + NOTCH_HEIGHT}px)`,
            },
          }}>
            <Grid container spacing={2} pb={20}>

              <Grid item xs={12} md={12}>
                <Typography
                  variant="subtitle"
                  paragraph
                  fontWeight={'bold'}
                  whiteSpace={'normal'}
                  textAlign="left"
                  sx={{ margin: 'auto' }}
                  width="100%"
                >
                  {modalDetail?.item?.Requirement}
                </Typography>
              </Grid>

              <Grid item xs={12} md={4}>
                {currentTodoItem?.AuditType !== 'Technical' ? (
                  <RHFSelectMenuItem
                    size="small"
                    name="EvaluationId"
                    label={'Result'}
                    disabled={isViewOnly || Section?.IsFinished || values.IsNA}
                    defaultValue={defaultEvaluation}
                    value={defaultEvaluation}
                    inputProps={{ readOnly: isViewOnly || Section?.IsFinished }}
                    onChange={(e, newValue) => handleSelectAuditingResult(e, newValue)}
                  >
                    {AuditingResultsOpt.length > 0 &&
                      AuditingResultsOpt.map((item) => (
                        <MenuItem key={item.Value} value={item.Value} disabled={values.IsNA}>
                          {item.Caption}
                        </MenuItem>
                      ))}
                  </RHFSelectMenuItem>
                ) : (
                  <RHFSelectMenuItem
                    size="small"
                    name="EvaluationScore"
                    label={'Result'}
                    disabled={isViewOnly || Section?.IsFinished || values.IsNA}
                    defaultValue={defaultEvaluationScore}
                    value={defaultEvaluationScore}
                    onChange={(e, newValue) => handleSelectTechnicalAuditingResult(e, newValue)}
                    inputProps={{ readOnly: isViewOnly || Section?.IsFinished, type: 'number' }}
                  >
                    {TechnicalAuditingResultOption.length > 0 &&
                      TechnicalAuditingResultOption.map((item) => (
                        <MenuItem key={item.label} value={item.value} disabled={values.IsNA}>
                          {`${item.label}`}
                        </MenuItem>
                      ))}
                  </RHFSelectMenuItem>
                )}
              </Grid>

              <Grid item xs={6} md={4}>

                {/* <RHFSwitch
                  //  name="IsNA"
                  label={'N/A'} disabled={isViewOnly || Section?.IsFinished}
                  onChange={e => handleToggleNA(e)}
                  checked={values?.IsNA || false}

                /> */}

                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        sx={{
                          '& .MuiSwitch-track': {
                            borderRadius: 26 / 2,
                            backgroundColor: 'error.light',
                          },
                          '& .MuiSwitch-thumb': {
                            borderRadius: 26 / 2,
                            backgroundColor: values.IsNA ? 'primary.main' : 'error.main',
                          },
                        }}
                      />}
                    label="N/A"
                    onChange={e => handleToggleNA(e)}
                    checked={values?.IsNA}
                  />

                </FormGroup>

                {errors.IsNA?.message && (
                  <FormHelperText sx={{ color: (theme) => theme.palette.error.main }}>
                    {errors?.IsNA?.message} *
                  </FormHelperText>
                )}
              </Grid>

              {showCritical && (
                <Grid item xs={6} md={4}>
                  <RHFSwitch name="IsCriticalFound" label={'Critical'} disabled={isViewOnly || Section?.IsFinished || values.IsNA}
                  />
                  {errors.IsCriticalFound?.message && (
                    <FormHelperText sx={{ color: (theme) => theme.palette.error.main }}>
                      {errors?.IsCriticalFound?.message} *
                    </FormHelperText>
                  )}
                </Grid>
              )}

              <Grid item xs={12} md={12}>
                <RHFTextField
                  name="Classification"
                  size="small"
                  label={'Classification'}
                  multiline
                  rows={3}
                  InputProps={{ readOnly: isViewOnly || Section?.IsFinished || values.IsNA }}
                />
              </Grid>

              <Grid item xs={12} md={12}>
                <RHFTextField
                  name="DetailedFinding"
                  size="small"
                  label={'Detailed Finding'}
                  multiline
                  rows={3}
                  InputProps={{ readOnly: isViewOnly || Section?.IsFinished || values.IsNA }}
                />
              </Grid>

              <Grid item xs={12} md={12}>
                <RHFTextField
                  name="MotivesSuggestion"
                  size="small"
                  label={'Motives Suggesstion'}
                  multiline
                  rows={3}
                  InputProps={{ readOnly: isViewOnly || Section?.IsFinished || values.IsNA }}
                // isRequired
                />
              </Grid>

              <Grid item xs={12} md={12}>
                {/* <RHFDatePicker
                  label={'Expected completion'}
                  value={values.ExpectedCompletion}
                  onChange={e => {
                    setValue('ExpectedCompletion', moment(e).format('YYYY-MM-DD') || null)
                  }}
                  views={['year', 'month', 'day']}
                  inputFormat="dd/MM/yyyy"
                  disabled={values.IsNA}
                /> */}

                <RHFTextMobileDatePicker
                  label={'Expected completion'}
                  value={values.ExpectedCompletion}
                  onChange={e => {
                    if (!values.IsNA) {
                      setValue('ExpectedCompletion', moment(e).format('YYYY-MM-DD') || null)
                    }
                  }}
                  views={['year', 'month', 'day']}
                  inputFormat="dd/MM/yyyy"
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      size='small'
                      label={'Expected completion'}

                      InputLabelProps={{
                        style: {
                          color: 'var(--label)',
                        }, shrink: true,
                      }}
                    />
                  )}
                  disaled={values.IsNA}
                />

              </Grid>

              {
                !values.IsNA &&
                <Grid item xs={12} md={12}>
                  {isWebApp ? (
                    <RHFUploadMultiFile
                      showPreview
                      name="Attachments"
                      accept="image/*"
                      // maxSize={15145728}
                      minSize={1}
                      onDrop={handleDrop}
                      onRemove={handleRemove}
                      onRemoveAll={handleRemoveAll}
                      onUpload={() => console.log('ON UPLOAD')}
                      onClick={handleClick}
                      smallBlockContent
                      disabled={isViewOnly || Section?.IsFinished || values.IsNA}
                      showTotal
                      showMenuActions
                      showRemoveAll
                    />
                  ) : (
                    <RHFUploadMultiFileCapacitor
                      showPreview
                      name="Attachments"
                      accept="image/*"
                      // maxSize={15145728}
                      minSize={1}
                      onDrop={handleDrop}
                      onRemove={handleRemove}
                      onRemoveAll={handleRemoveAll}
                      onUpload={() => console.log('ON UPLOAD')}
                      onClick={handleClick}
                      smallBlockContent
                      disabled={isViewOnly || Section?.IsFinished || values.IsNA}
                      showTotal
                      showMenuActions
                      handleCamera={() => handleTakePhoto()}
                      onOpenGallary={androidCameraGetPicture}
                      showRemoveAll
                    />
                  )}
                </Grid>
              }
            </Grid>
          </Box>


          {/* {!isKeyboardOpen && */}
          <Stack
            justifyContent={'flex-end'}
            width={'96%'}
            alignItems="flex-end"
            sx={{
              paddingRight: {
                xs: 0,
                sm: 2,
                md: 3,
              },
              position: 'fixed',
              zIndex: 100000000,
              bottom: 10,
            }}
          >
            <Stack
              width={{
                xs: '100%',
                sm: '50%',
                md: '25%',
              }}
            >
              <LoadingButton
                variant={'contained'}
                sx={{
                  minWidth: 200,
                }}
                fullWidth={!smUp}
                disabled={isViewOnly || Section?.IsFinished}
                onClick={handleSave}
                loading={loading}
              >
                Save
              </LoadingButton>
            </Stack>
          </Stack>
          {/* } */}

        </FormProvider>
      </ScrollView>

      <LightboxModal
        images={renderImage}
        mainSrc={imagesLightbox[selectedImage]?.Data !== null ? imagesLightbox[selectedImage]?.Data : ImageUrl}
        photoIndex={selectedImage}
        setPhotoIndex={setSelectedImage}
        isOpen={openLightbox}
        onCloseRequest={() => setOpenLightbox(false)}
      />

      {/* // Editor */}
      {imageEditor.visible && (
        <PopupImageEditor
          imageEditor={imageEditor}
          setImageEditor={setImageEditor}
          setValue={setValue}
          values={values}
          enqueueSnackbar={enqueueSnackbar}
          translate={translate}
          seletedImage={selectedImage}
        />
      )}

      {/* // Menu */}
      <MenuPopover
        open={Boolean(open)}
        anchorEl={open}
        onClose={() => setOpen(null)}
        sx={{
          mt: 1.5,
          ml: 0.75,
          width: 180,
          '& .MuiMenuItem-root': { px: 1, typography: 'body2', borderRadius: 0.75 },
          zIndex: 10000,
        }}
      >
        <Stack spacing={2}>
          <MenuItem
            onClick={(e) => {
              setOpenLightbox(true);
              setOpen(null);
            }}
          >
            {/* <Iconify icon={IconName.view} sx={{ fontSize: 20, color: 'var(--icon)', marginRight: 1 }} /> */}
            <CustomIcon icon={IconName.view} />
            View
          </MenuItem>
          <MenuItem
            onClick={() => {
              setImageEditor({
                ...imageEditor,
                visible: true,
              });
              setOpen(null);
            }}
            disabled={imageEditor?.image?.Data === null}
          >
            {/* <Iconify icon={IconName.edit} sx={{ fontSize: 20, color: 'var(--icon)', marginRight: 1 }} /> */}
            <CustomIcon icon={IconName.edit} />
            Edit
          </MenuItem>
          <MenuItem onClick={() => handleRemove()}
            disabled={Section?.IsFinished}
          >
            {/* <Iconify icon={IconName.delete} sx={{ fontSize: 20, color: 'var(--icon)', marginRight: 1 }} /> */}
            <CustomIcon icon={IconName.delete} />
            Delete
          </MenuItem>
        </Stack>
      </MenuPopover>

      {loading &&
        <BackDrop
          loading={loading}
          variant='determinate'
          progress={progress}
          setProgress={setProgress}
          width='100%'
          height='100%'
        />
      }
    </Box>
  );
}
// )

// Custom icon for offline mode
const CustomIcon = memo(({ icon }) => {
  const { online } = useIsOnline();
  const theme = useTheme();
  if (online) {
    return <Iconify icon={icon} sx={{ fontSize: 20, color: 'var(--icon)', marginRight: 1 }} />;
  }
  if (icon === IconName.view) {
    return (
      <Box
        sx={{
          width: 20,
          height: 20,
          marginRight: 1,
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path
            fill="var(--icon)"
            d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5s5 2.24 5 5s-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3s3-1.34 3-3s-1.34-3-3-3z"
          />
        </svg>
      </Box>
    );
  }
  if (icon === IconName.edit) {
    return (
      <Box
        sx={{
          width: 20,
          height: 20,
          marginRight: 1,
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path
            fill="var(--icon)"
            d="M19.045 7.401c.378-.378.586-.88.586-1.414s-.208-1.036-.586-1.414l-1.586-1.586c-.378-.378-.88-.586-1.414-.586s-1.036.208-1.413.585L4 13.585V18h4.413L19.045 7.401zm-3-3l1.587 1.585l-1.59 1.584l-1.586-1.585l1.589-1.584zM6 16v-1.585l7.04-7.018l1.586 1.586L7.587 16H6zm-2 4h16v2H4z"
          />
        </svg>
      </Box>
    );
  }
  if (icon === IconName.delete) {
    return (
      <Box
        sx={{
          width: 20,
          height: 20,
          marginRight: 1,
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
          <path
            fill="var(--icon)"
            d="M360 184h-8c4.4 0 8-3.6 8-8v8h304v-8c0 4.4 3.6 8 8 8h-8v72h72v-80c0-35.3-28.7-64-64-64H352c-35.3 0-64 28.7-64 64v80h72v-72zm504 72H160c-17.7 0-32 14.3-32 32v32c0 4.4 3.6 8 8 8h60.4l24.7 523c1.6 34.1 29.8 61 63.9 61h454c34.2 0 62.3-26.8 63.9-61l24.7-523H888c4.4 0 8-3.6 8-8v-32c0-17.7-14.3-32-32-32zM731.3 840H292.7l-24.2-512h487l-24.2 512z"
          />
        </svg>
      </Box>
    );
  }
});

// Image Editors
const PopupImageEditor = ({
  imageEditor,
  setImageEditor,
  setValue,
  values,
  enqueueSnackbar,
  translate,
  seletedImage,
}) => {
  const onClose = async () => {
    setImageEditor({ visible: false, image: null });
  };
  const smUp = useResponsive('up', 'sm');

  const handleSaveCustomImage = (image) => {
    try {
      const Attachments = [...values.Attachments];
      const ImageIndex = Attachments.findIndex((d) => d.Id === imageEditor.image?.Id);
      if (seletedImage < 0) return;
      Attachments[seletedImage] = { ...Attachments[seletedImage], Data: image, IsModify: true };
      setValue('Attachments', Attachments);
      onClose();
    } catch (e) {
      console.error(e);
      enqueueSnackbar('Save image error!', {
        variant: 'error',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center',
        },
      });
    };
  };

  const poupAnimation = {
    show: {
      type: 'fade',
      duration: 400,
      from: 0,
      to: 1
    },
    hide: {
      type: 'fade',
      duration: 400,
      from: 1,
      to: 0
    }
  }

  return (
    <Popup
      visible={imageEditor.visible}
      onHiding={onClose}
      dragEnabled={false}
      hideOnOutsideClick
      showCloseButton
      showTitle
      title="3. Edit Image"
      width={'100%'}
      height={'100%'}
      wrapperAttr={{
        class: 'popup-image-editor'
      }}
      animation={poupAnimation}
    >
      <CustomImageEditor source={imageEditor.image} handleSave={handleSaveCustomImage} />
    </Popup>
  );
};
