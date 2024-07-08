import { Browser } from '@capacitor/browser';
import { Camera, CameraDirection, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { yupResolver } from '@hookform/resolvers/yup';
import PropTypes from 'prop-types';
import { LoadingButton } from '@mui/lab';
import { Autocomplete, Box, Divider, Grid, Stack, styled, TextField, Typography, useTheme } from '@mui/material';
import { decode } from 'base64-arraybuffer';
import DataGrid, {
  Column,
  Button as DxButton,
  Editing,
  Form,
  Lookup,
  Paging,
  Popup,
  Scrolling,
  Texts
} from 'devextreme-react/data-grid';
import moment from 'moment';
import { useSnackbar } from 'notistack';
import { memo, useMemo, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Controller, useForm, useFormContext } from 'react-hook-form';
import useDetectKeyboardOpen from "use-detect-keyboard-open";
import * as Yup from 'yup';
import { FormProvider, RHFTextField } from '../../../components/hook-form/index';
// import LightboxModal from '../../../components/LightboxModal';
import Scrollbar from '../../../components/Scrollbar';
import { HEADER, NOTCH_HEIGHT, QC_ATTACHEMENTS_HOST_API } from '../../../config';
import useLocales from '../../../hooks/useLocales';
import useResponsive from '../../../hooks/useResponsive';
import LightboxModal from './components/LightboxModal';
import DetailSummary from './DetailSummary';
// COMPONENTS
import { UploadIllustration } from '../../../assets';
import Iconify from '../../../components/Iconify';
import { MobileBlockContent, RejectionFiles } from '../../../components/upload';
import { db } from '../../../Db';
import { getBase64 } from '../../../utils/getBase64';
import { getFileFormat } from '../../../utils/getFileFormat';
import IconName from '../../../utils/iconsName';
import resizeFile from '../../../utils/useResizeFile';
import uuidv4 from '../../../utils/uuidv4';


const BREAKCRUM_HEIGHT = 78;
const STEP_HEADER_HEIGHT = 56;
const SPACING = 90;
const DETAIL_SUMARY = 90;


Attachments.propTypes = {
  theme: PropTypes.any,
  currentInspection: PropTypes.object,
  Enums: PropTypes.array,
  isViewOnly: PropTypes.bool,
  handleNext: PropTypes.func,
};


function Attachments({
  theme,
  currentInspection,
  Enums,
  isViewOnly,
  handleNext,
}) {

  // Hooks
  const { translate, currentLang } = useLocales();
  const smUp = useResponsive('up', 'sm');
  const { enqueueSnackbar } = useSnackbar();
  const isKeyboardOpen = useDetectKeyboardOpen();

  // CCOMPONENT STATES
  const [openLightbox, setOpenLightbox] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  const defaultValues = useMemo(
    () => ({
      file: {
        Id: '',
        Title: '',
        Name: '',
        URL: '',
        Remark: '',
        RefId: '',
        CategoryId: '',
        InternalURL: '',
        Active: true,
      },
      files: currentInspection?.Attachments || [],
    }),
    []
  );

  const stepScheme = Yup.object().shape({
    // CategoryId: Yup.string().required(`Category ${translate('formValidate.isRequired')}`)
  });

  const methods = useForm({
    resolver: yupResolver(stepScheme),
    defaultValues,
  });

  const {
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = methods;

  const values = watch();

  const CategoryOptions = Enums.find((d) => d.Name === 'Category')?.Elements || [];

  // HANDLE SAVE Mesurement
  const handleSave = async () => {
    try {
      // Handle check files
      const files = values.files;
      // handle save
      await db.MqcInspection.where('Id')
        .equals(currentInspection.Id)
        .modify((x, ref) => {
          // console.log('default', x, ref);
          // Set newvalue to Mesurement
          ref.value.Attachments = values.files;
          // Assign item property to Edit
          ref.value.IsEditing = true;
        });
      enqueueSnackbar(translate('message.saveSuccess'), {
        variant: 'success',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center',
        },
      });
    } catch (error) {
      console.error(error);
      enqueueSnackbar(translate('message.saveError'), {
        variant: 'error',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center',
        },
      });
    }
  };

  // SELECT CATEGORY
  // const handleSelectCategory = (e, newValue) => {
  //   setValue('file.CategoryId', newValue.props.value);
  //   setValue('file.Name', newValue.props.children);
  // };

  // SET COMPLETED STEPS
  const setCompleteStep = async () => {
    try {
      // Handle check files
      const files = values.files;
      if (!currentInspection?.Status?.Attachments) {
        // if (currentInspection.QCType === 'Final') {
        //   console.log('do nothing')
        //     const qcPacking = CategoryOptions.find((d) => d.Caption === 'QC-Packing');
        //     const packingFile = files.filter((d) => d.CategoryId === qcPacking?.Value && d.Action !== "Delete");
        //     if (packingFile.length <= 0) {
        //       document.getElementById('category-input').scrollIntoView({ behavior: 'smooth', block: 'start' })
        //       return enqueueSnackbar(translate('inspection.attachment.requireQCAttachment'), {
        //         variant: 'error',
        //         anchorOrigin: {
        //           vertical: 'top',
        //           horizontal: 'center',
        //         },
        //       });
        //     }
        // } else {
        const qrMeasureMent = CategoryOptions.find((d) => d.Caption === 'QC-Measurement');
        const packingFile = files.filter((d) => d.CategoryId === qrMeasureMent?.Value && d.Action !== "Delete");
        if (packingFile.length <= 0) {
          document.getElementById('category-input').scrollIntoView({ behavior: 'smooth', block: 'start' })
          return enqueueSnackbar(translate('inspection.attachment.requireQCMeasurement'), {
            variant: 'error',
            anchorOrigin: {
              vertical: 'top',
              horizontal: 'center',
            },
          });
        }
        // }
      }

      await db.MqcInspection.where('Id')
        .equals(currentInspection.Id)
        .modify((x, ref) => {
          // console.log('default', x, ref);
          // Set Step complete
          ref.value.Attachments = values.files;
          ref.value.Status = {
            ...ref.value.Status,
            Attachments: !currentInspection?.Status?.Attachments,
          };
        });

      if (!currentInspection.Status.Attachments) {
        // carouselRef.current?.slickNext();
        handleNext();
      } else {
        // enqueueSnackbar(
        //   !currentInspection?.Status?.Attachments
        //     ? 'Step has been change to Completed status'
        //     : 'Step has been change to Uncompleted status',
        //   {
        //     variant: 'success',
        //     anchorOrigin: {
        //       vertical: 'top',
        //       horizontal: 'center',
        //     },
        //   }
        // );
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar(JSON.stringify(error), {
        variant: 'error',
        autoHideDuration: 8000,
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center',
        },
      });
    }
  };

  // SOURCE FOR IMAGE LIGHTBOX
  const imagesLightbox =
    values.files.length > 0
      ? values.files
        .filter((d) => {
          if (d?.Name === undefined || d?.Name === null) return false;
          function extension(filename) {
            const r = /.+\.(.+)$/.exec(filename);
            return r ? r[1] : null;
          }
          const fileExtension = extension(d?.Name).toLowerCase();
          const isImage = ['jpeg', 'png', 'jpg', 'gif', 'webp', 'avif', 'jfif'].includes(fileExtension);
          return isImage && d.Action !== 'Delete';
        })
        .map((d) => {
          if (isViewOnly || d.Id > 0) {
            return d?.URL || `${QC_ATTACHEMENTS_HOST_API}/${d?.Guid}`
          }
          return d?.Data;
        })
      : [];

  // HANDLE DROP FILES
  const handleDropFile = async (acceptedFiles) => {
    try {
      const files = [...values.files] || [];
      const base64 = [...acceptedFiles].map((file) => {
        const fileType = getFileFormat(file?.name);
        // console.log(fileType, file)
        if (fileType !== "image") {
          return getBase64(file).then((data) => data);
        }
        return resizeFile(file).then((data) => data);
      });
      const allIds = files.map((d) => d.Id);
      const minId = Math.min(...allIds);
      let insertId;

      Promise.all(base64).then((data) => {
        setValue('files', [
          ...files,
          ...acceptedFiles.map((file, index) => {
            if (minId >= 0) {
              insertId = -1 - index;
            } else {
              insertId = minId - 1 - index;
            }
            return {
              Id: insertId,
              Title: null,
              Name: file?.name,
              URL: null,
              Remark: values?.file?.Remark,
              RefId: null,
              CategoryId: values?.file?.CategoryId,
              InternalURL: null,
              Active: true,
              Data: data[index],
              Action: 'Insert',
              RecordGuid: uuidv4(),
            };
          }),
        ]);
      });
    } catch (err) {
      console.error(err);
    }
  };

  //  Handle Take photo button
  const handleTakePhoto = async () => {
    try {
      if (values.file.CategoryId === "") return;
      // Request permision for ios
      if (Capacitor.getPlatform() === 'ios') {
        const permision = Camera.checkPermission();
        if (permision === 'denied') {
          Camera.requestPermissions().then((res) => {
            console.log('res request Permision', res);
          });
        };
      };

      const Attachments = [...values.files] || [];
      // Take photo
      const cameraPhoto = await Camera.getPhoto({
        quality: 100,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        saveToGallery: false,
        direction: CameraDirection.Rear,
        presentationStyle: 'fullscreen',
        source: CameraSource.Camera,
        // width: 1920,
        // height: 1920,
      });

      const blobImage = new Blob([new Uint8Array(decode(cameraPhoto.base64String))], {
        type: `image/${cameraPhoto.format}`,
      });

      const fileConvert = new File([blobImage], `Image-${Attachments.length + 1}.jpeg`, {
        lastModified: moment().unix(),
        type: blobImage.type,
      });
      handleDropFile([fileConvert]);
    } catch (err) {
      console.error(err);
    }
  };

  // REMOVE FILES
  const handleRemoveAllFile = () => {
    setValue('files', []);
  };

  // Remove single picture
  const handleRemoveFile = (file) => { };





  // console.log(
  //   // CategoryOptions,
  //   // values,
  //   // imagesLightbox
  //   // errors,
  //   currentLang
  // )

  return (
    <Stack spacing={1} height="100%">
      <DetailSummary currentInspection={currentInspection} />
      <Divider />
      <Box>
        <FormProvider methods={methods} onSubmit={handleSubmit(setCompleteStep)}>
          <Scrollbar >
            <Box sx={{
              height: {
                xs: `calc(100vh - ${HEADER.MOBILE_HEIGHT + BREAKCRUM_HEIGHT + STEP_HEADER_HEIGHT + SPACING + DETAIL_SUMARY + NOTCH_HEIGHT}px)`,
                sm: `calc(100vh - ${HEADER.MOBILE_HEIGHT + BREAKCRUM_HEIGHT + STEP_HEADER_HEIGHT + SPACING + DETAIL_SUMARY + NOTCH_HEIGHT}px)`,
                lg: `calc(100vh - ${HEADER.DASHBOARD_DESKTOP_HEIGHT + BREAKCRUM_HEIGHT + STEP_HEADER_HEIGHT + SPACING + DETAIL_SUMARY + NOTCH_HEIGHT}px)`,
              },
              py: 2,
              ...(isKeyboardOpen && {
                minHeight: {
                  xs: `calc(100vh - ${HEADER.MOBILE_HEIGHT + BREAKCRUM_HEIGHT + SPACING + NOTCH_HEIGHT}px)`,
                  lg: `calc(100vh - ${HEADER.DASHBOARD_DESKTOP_HEIGHT + BREAKCRUM_HEIGHT + SPACING + NOTCH_HEIGHT}px)`,
                }
              })
            }}
            >
              <Grid container rowSpacing={3} columnSpacing={2} pb={3}>
                <Grid item xs={12} md={6} id="category-input">
                  <Autocomplete
                    autoComplete
                    blurOnSelect
                    value={values.file.CategoryId === '' ? '' : CategoryOptions.find((d) => d.Value === values.file.CategoryId) || null}
                    onChange={(event, newValue) => {
                      // console.log(newValue)
                      setValue('file.CategoryId', newValue?.Value);
                      setValue('file.Name', newValue?.Caption);
                    }}
                    getOptionLabel={(type) => (type?.Caption === undefined ? '' : `${type?.Caption}`)}
                    options={CategoryOptions.sort((a, b) => -b.Caption?.localeCompare(a?.Caption)) || []}
                    size="small"
                    autoHighlight
                    sx={{ width: '100%', minWidth: 150 }}
                    renderInput={(params) => <RenderInput params={params} label="Category" error={errors?.CategoryId} />}
                    noOptionsText={<Typography>Search not found</Typography>}
                    renderOption={(props, type) => {
                      return (
                        <Box component="li" {...props}>
                          {type?.Caption}
                        </Box>
                      );
                    }}
                    isOptionEqualToValue={(option, value) => {
                      // console.log(option, value);
                      return `${option?.Value}` === `${value?.Value}`;
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <RHFTextField name="file.Remark" size="small" label={'Remark'} multiline rows={4} />
                </Grid>

                <Grid item xs={12} md={12}>
                  <UploadMultiFile
                    name={'files'}
                    accept={["image/*", "application/msword", "application/vnd.ms-excel", "application/vnd.ms-powerpoint", ".doc", ".docx", "text/*,", ".xlsx", "application/pdf", "application/*"]}
                    minSize={1}
                    onDrop={handleDropFile}
                    onRemove={handleRemoveFile}
                    onRemoveAll={handleRemoveAllFile}
                    onUpload={() => console.log('ON UPLOAD')}
                    disabled={values.file.CategoryId === '' || currentInspection.Status.Attachments}
                    handleCamera={() => handleTakePhoto()}
                    {... (values.file.CategoryId === "" && {
                      helperText: currentLang.value === "vn" ? `Để upload tài liệu, hãy chọn Category trước!` : 'Please select Category frist before upload document!'
                    })}
                  />
                </Grid>

                <Grid item xs={12} md={12}>
                  <DataGridAttachements
                    dataSource={values.files}
                    smUp={smUp}
                    CategoryOptions={CategoryOptions}
                    setOpenLightbox={setOpenLightbox}
                    setSelectedImage={setSelectedImage}
                    imagesLightbox={imagesLightbox}
                    values={values}
                    setValue={setValue}
                    enqueueSnackbar={enqueueSnackbar}
                    currentInspection={currentInspection}
                    isViewOnly={isViewOnly}
                  />
                </Grid>
              </Grid>
            </Box>
          </Scrollbar>

          {/* {!isKeyboardOpen && */}
          <Stack
            direction='row'
            width={'100%'}
            id="button-group"
            sx={{
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
              backgroundColor: 'transparent',
              display: {
                xs: !isKeyboardOpen ? 'flex' : 'none',
                sm: 'flex',
              },
              justifyContent: 'flex-end',
            }}
            spacing={2}
          >
            <Stack
              width={{
                xs: '50%',
                sm: '50%',
                md: '25%',
              }}
            >
              <LoadingButton
                variant="outlined"
                fullWidth
                loading={isSubmitting}
                disabled={isViewOnly || currentInspection.IsFinished || currentInspection.Status.Attachments}
                onClick={handleSave}
              >
                {translate('button.save')}
              </LoadingButton>
            </Stack>
            <Stack
              width={{
                xs: '50%',
                sm: '50%',
                md: '25%',
              }}
            >
              <LoadingButton
                variant={'contained'}
                sx={{
                  backgroundColor: currentInspection.Status.Attachments
                    ? theme.palette.primary.main
                    : theme.palette.info.main,
                  '&:hover': {
                    backgroundColor: currentInspection.Status.Attachments
                      ? theme.palette.primary.main
                      : theme.palette.info.main,
                  },
                }}
                fullWidth
                type="submit"
                disabled={isViewOnly || currentInspection.IsFinished}
                loading={isSubmitting}
              >
                {!currentInspection.Status.Attachments ? 'Complete' : 'Completed'}
              </LoadingButton>
            </Stack>
          </Stack>
          {/* } */}
        </FormProvider>
      </Box>

      <LightboxModal
        images={imagesLightbox}
        photoIndex={selectedImage}
        setPhotoIndex={setSelectedImage}
        mainSrc={imagesLightbox[selectedImage]}
        isOpen={openLightbox}
        onCloseRequest={() => setOpenLightbox(false)}
      />
    </Stack>
  );
};

export default memo(Attachments);


RenderInput.propTypes = {
  params: PropTypes.object,
  label: PropTypes.string,
  error: PropTypes.any
};

// Render Input
function RenderInput({ params, label, error }) {
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
          <p className="ml-1">{label}</p>
        </Stack>
      }
      InputLabelProps={{
        style: { color: 'var(--label)' },
        shrink: true,
      }}
    />
  );
};

// --------------------------------------------------------------
// FILE UPLOAD -- USER MUST CHOOSE CATEGORY BEFORE UPLOAD DOCS
const DropZoneStyle = styled('div')(({ theme }) => ({
  outline: 'none',
  padding: theme.spacing(3, 1),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.neutral,
  border: `1px dashed ${theme.palette.grey[500_32]}`,
  '&:hover': { opacity: 0.72, cursor: 'pointer' },
}));

const DropZoneStyleCapacitor = styled('div')(({ theme }) => ({
  outline: 'none',
  padding: theme.spacing(3, 1),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.neutral,
  border: `1px dashed ${theme.palette.grey[500_32]}`,
  '&:hover': { opacity: 0.72, cursor: 'pointer' },
  width: '50%',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
}));

UploadMultiFile.propTypes = {
  name: PropTypes.string,
  helperText: PropTypes.string
  , errors: PropTypes.any
  , other: PropTypes.any
};

function UploadMultiFile({ name, helperText, errors, ...other }) {

  const { control } = useFormContext();
  const { getRootProps, getInputProps, isDragActive, isDragReject, fileRejections } = useDropzone({
    ...other,
  });
  const isWebApp = Capacitor.getPlatform() === 'web';

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        // const checkError = !!error && field.value?.length === 0;
        return (
          <Box sx={{ width: '100%' }}>
            {isWebApp ? (
              <DropZoneStyle
                {...getRootProps()}
                sx={{
                  ...(isDragActive && { opacity: 0.72 }),
                  ...((isDragReject || error) && {
                    color: 'error.main',
                    borderColor: 'error.light',
                    bgcolor: 'error.lighter',
                  }),
                }}
              >
                <input {...getInputProps()} />
                <MobileBlockContent showGraphic />
              </DropZoneStyle>
            ) : (
              <Stack direction={'row'} spacing={2}>
                <DropZoneStyleCapacitor onClick={() => other?.handleCamera()}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24">
                    <path
                      fill="#007b55"
                      d="M12 17.5q1.875 0 3.188-1.313T16.5 13q0-1.875-1.313-3.188T12 8.5q-1.875 0-3.188 1.313T7.5 13q0 1.875 1.313 3.188T12 17.5ZM4 21q-.825 0-1.413-.588T2 19V7q0-.825.588-1.413T4 5h3.15L9 3h6l1.85 2H20q.825 0 1.413.588T22 7v12q0 .825-.588 1.413T20 21H4Z"
                    />
                  </svg>
                </DropZoneStyleCapacitor>
                <DropZoneStyleCapacitor
                  {...getRootProps()}
                  sx={{
                    ...(isDragActive && { opacity: 0.72 }),
                    ...((isDragReject || error) && {
                      color: 'error.dark',
                      borderColor: 'error.light',
                      bgcolor: 'error.lighter',
                    }),
                  }}
                >
                  <input {...getInputProps()} />
                  <UploadIllustration sx={{ height: 70 }} />
                </DropZoneStyleCapacitor>
              </Stack>
            )}
            {fileRejections.length > 0 && <RejectionFiles fileRejections={fileRejections} />}
            {helperText && <Typography variant='caption' color='error'>{helperText}</Typography>}
          </Box>
        );
      }}
    />
  );
};

DataGridAttachements.propTypes = {
  dataSource: PropTypes.array,
  smUp: PropTypes.bool,
  CategoryOptions: PropTypes.array,
  setOpenLightbox: PropTypes.func,
  setSelectedImage: PropTypes.func,
  imagesLightbox: PropTypes.array,
  values: PropTypes.object,
  setValue: PropTypes.func,
  enqueueSnackbar: PropTypes.func,
  currentInspection: PropTypes.object,
  isViewOnly: PropTypes.bool,
};

// --------------------------------------------------------------
// DATA GRID ATTACHEMENTS WITH PICTURE LIGHTBOX MODAL
function DataGridAttachements({
  dataSource,
  smUp,
  CategoryOptions,
  setOpenLightbox,
  setSelectedImage,
  imagesLightbox,
  values,
  setValue,
  enqueueSnackbar,
  currentInspection,
  isViewOnly,
}) {

  const { translate } = useLocales()
  const grirRef = useRef(null);
  const onInitNewRow = (e, parentKey) => {
    e.data.productId = parentKey;
  };

  const onEditorPreparing = (e) => {
    if (e.parentType === 'dataRow' && e.dataField === 'Name') {
      e.editorOptions.readOnly = true;
      e.editorOptions.disabled = true;
    }
  };

  // const onAddNewRecord = () => {
  //   grirRef.current.instance.addRow();
  //   grirRef.current.instance.deselectAll();
  // };

  // show attachement
  const handleCellClick = async (e) => {
    if (e.rowType === 'data' && e.columnIndex === 0) {
      const fileType = getFileFormat(e.data.Name)
      if (imagesLightbox.length > 0 && fileType === 'image') {
        // const imageIndex = imagesLightbox.findIndex((d) => d.Name === e.value);
        const imageIndex = imagesLightbox.findIndex((d) => {
          if (isViewOnly || e.data.Id > 0) {
            return d === e.data?.URL || d === `${QC_ATTACHEMENTS_HOST_API}/${e.data?.Guid}`;
          }
          return d === e.data?.Data;
        });
        // console.log(imagesLightbox)
        if (imageIndex >= 0) {
          setSelectedImage(imageIndex);
          setOpenLightbox(true);
        }
      } else {
        await Browser.open({
          url: e.data.URL || `${QC_ATTACHEMENTS_HOST_API}/${e.data?.Guid}`
        })
      }
    }
  };

  // Delete attachment
  const handleDeleteAttachement = (e) => {
    if (currentInspection.Status.Attachments) {
      return enqueueSnackbar(translate('inspection.attachment.editFailed'), {
        variant: 'error',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center',
        },
      });
    }

    const files = [...values.files];

    if (e.row.data.Id > 0) {
      const fileIndex = files.findIndex((d) => d.Id === e.row.data.Id);
      files[fileIndex] = {
        ...files[fileIndex],
        Id: e.row.data.Id,
        Action: 'Delete',
      };
      setValue('files', files);
    } else {
      const filteredItems = files?.filter((_file) => _file.Id !== e.row.data.Id);
      setValue('files', filteredItems);
    }
  };

  return (
    <DataGrid
      dataSource={dataSource.filter((d) => d.Action !== 'Delete') || []}
      key="id"
      columnAutoWidth
      allowColumnResizing
      showBorders
      allowColumnReordering
      onInitNewRow={(e) => onInitNewRow(e, null)}
      onEditorPreparing={onEditorPreparing}
      remoteOperations
      ref={(ref) => {
        grirRef.current = ref;
      }}
      className="h-[250px] w-full"
      wordWrapEnabled
      onCellClick={(e) => handleCellClick(e)}
    >
      <Column dataField="Name" caption={'Name'} width={150} />
      <Column dataField="CategoryId" caption={'Category'} minWidth={120}>
        <Lookup dataSource={CategoryOptions} displayExpr="Caption" valueExpr="Value" />
      </Column>
      <Paging defaultPageSize={10} />
      <Scrolling mode="infinity" />
      <Editing allowDeleting allowUpdating useIcons mode="popup">
        <Form labelMode="floating" />
        <Texts
          deleteRow={'Yes'}
          saveRowChanges={'Save'}
          cancelRowChanges={'No'}
          confirmDeleteTitle={'Delete'}
          confirmDeleteMessage={
            translate('inspection.attachment.deleteConfirm')
          }
        />
        <Popup
          showTitle
          title={
            translate('inspection.attachment.AddAndEdit')
          }
          showCloseButton
          height={smUp ? 700 : '100%'}
          width={smUp ? 700 : '100%'}
        />
      </Editing>
      <Column type="buttons" position="right" width={90}>
        <DxButton name="edit" />
        <DxButton name="update" />
        <DxButton name="delete" onClick={(e) => handleDeleteAttachement(e)} />
      </Column>
    </DataGrid>
  );
};
