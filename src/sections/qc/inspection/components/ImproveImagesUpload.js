import {
  Camera,
  CameraDirection,
  CameraResultType, CameraSource
} from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { Toast } from '@capacitor/toast';
import { FilePicker as CapacitorFilePicker } from '@capawesome/capacitor-file-picker';
import { Popup } from 'devextreme-react';
import { useCallback, useEffect, useState } from 'react';
// import { Camera } from '@awesome-cordova-plugins/camera';
import { decode } from 'base64-arraybuffer';
import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
// Snack bar
import { useSnackbar } from 'notistack';
// import Proptype
import PropTypes from 'prop-types';
// Mui
import { Box, MenuItem, Stack, Typography } from '@mui/material';
// components
// import LightboxModal from '../../../../components/LightboxModal';
import LightboxModal from './LightboxModal';
import { RHFQCUploadMultiFile } from './RHFQCUploadMultiFile';
// Redux
import Iconify from '../../../../components/Iconify';
import MenuPopover from '../../../../components/MenuPopover';
import { QC_ATTACHEMENTS_HOST_API } from '../../../../config';
import useIsOnline from '../../../../hooks/useIsOnline';
import { setMinnId } from '../../../../redux/slices/qc';
import { dispatch, useSelector } from '../../../../redux/store';

import CustomImageEditor from './CustomImageEditor';
// util
import IconName from '../../../../utils/iconsName';
import processArray from '../../../../utils/processArray';



ImproveImagesUpload.propTypes = {
  translate: PropTypes.func,
  currentInspection: PropTypes.object,
  methods: PropTypes.any,
  isViewOnly: PropTypes.bool,
};


function ImproveImagesUpload({ translate, currentInspection, methods, isViewOnly, setLoading, loading, setProgress }) {

  // HOOKS
  const { minId } = useSelector(store => store.qc);
  const { enqueueSnackbar } = useSnackbar();
  const platform = Capacitor.getPlatform();

  // CCOMPONENT STATES
  const [modalImageEditor, setModalImageEditor] = useState(false);
  const [openLightbox, setOpenLightbox] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [open, setOpen] = useState(null);
  const [processing, setProcessing] = useState(false);


  const { watch, setValue, } = methods;

  const values = watch();

  useEffect(() => {
    if (platform !== 'ios') return;
    const subCribe = async () => {
      await CapacitorFilePicker.addListener('pickerDismissed', (e) => {
        console.log('pickerDismissed', e);
        setLoading(false);
      })
    }
    subCribe();
    return () => {
      subCribe()
      CapacitorFilePicker.removeAllListeners()
    };
  }, []);


  const androidCameraGetPicture = async () => {

    // Request permision for ios
    if (platform === 'ios') {
      const permision = await Camera.checkPermissions();
      console.log('photo permision', permision);
      if (permision.photos === 'denied' || permision.photos === 'prompt') {
        await Camera.requestPermissions({ permissions: 'photos' }).then((res) => {
          console.log('res request Permision', res);
        });
      }
    };

    setLoading(true);
    const Attachments = [...values.Images] || [];

    // PICK IMAGES
    const { files } = await CapacitorFilePicker.pickImages({
      readData: true,
      multiple: true,
    });

    // console.log('files', JSON.stringify(files));
    if (files.length > 20 && platform === 'android') {
      setLoading(false);
      await Toast.show({
        text: 'Vui lòng chọn tối đa 20 hình',
      })
      return;
    }

    // conver image base64 to file
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

    // call function for proccessing image;
    handleDrop(imageLists);
  };


  // on drop with sequence
  const handleDrop = useCallback(async (acceptedFiles) => {
    try {

      if (!loading) {
        setLoading(true)
      }
      setProgress(pre => ({ ...pre, total: acceptedFiles.length }))

      const Images = [...values.Images] || [];
      const sortOrder = Images.map((d) => d.SortOrder);
      const MaxOrder = sortOrder.length > 0 ? Math.max(...sortOrder) : 0;

      let insertId;

      const imageResizeBase64 = await processArray(acceptedFiles, setProgress);
      setValue('Images', [
        ...imageResizeBase64
          .map((file, index) => {
            if (minId >= 0) {
              insertId = -1 - index;
            } else {
              insertId = minId - 1 - index;
            }
            if (index === acceptedFiles.length - 1) {
              dispatch(setMinnId(insertId));
            }
            return {
              Id: insertId,
              FileName: file?.name || `Image-${Images.length + 1}.jpeg`,
              ParentGuid: values.AfterGuid,
              Data: file.base64,
              Description: 'CorrectiveAction',
              Active: true,
              SortOrder: index + 1 + MaxOrder,
              Action: 'Insert',
              Guid: uuidv4(),
              MasterId: currentInspection?.Id,
            };
          }),
        ...Images,
      ]);
      setLoading(false);
      setProgress(pre => ({ ...pre, total: 0, current: 0 }))
    } catch (err) {
      console.error(err);
      setLoading(false);
      setProgress(pre => ({ ...pre, total: 0, current: 0 }))
    }
  }, [setValue, values]);

  //  Handle Take photo button
  const handleTakePhoto = async () => {
    try {

      // Request permision for ios
      if (Capacitor.getPlatform() === 'ios') {
        const permision = await Camera.checkPermissions();
        if (permision.camera === 'denied') {
          await Camera.requestPermissions({ permissions: 'camera' }).then((res) => {
            console.log('res request Permision', res);
          });
        }
      }

      const Attachments = [...values.Images] || [];

      // Take photo
      const cameraPhoto = await Camera.getPhoto({
        quality: 100,
        // quality: 70,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        // resultType: CameraResultType.Uri,
        saveToGallery: false,
        source: CameraSource.Camera,
        direction: CameraDirection.Rear,
        presentationStyle: 'fullscreen',
        // width: 1920,
        // height: 1920,
      });

      setLoading(true);

      // console.log(JSON.stringify(cameraPhoto));
      // handleDrop([`data:image/jpeg;base64,${cameraPhoto.base64String}`]);

      const blobImage = new Blob([new Uint8Array(decode(cameraPhoto.base64String))], {
        type: `image/${cameraPhoto.format}`,
      });

      const fileConvert = new File([blobImage], `Image-${Attachments.length + 1}.jpeg`, {
        lastModified: moment().unix(),
        type: blobImage.type,
      });

      handleDrop([fileConvert]);

    } catch (err) {
      console.error(err);
      setLoading(false)
    }
  };

  // Remove all picture
  const handleRemoveAll = () => {
    // setValue('Images', []);
    const Images = [...values.Images].filter((d) => d.Id > 0 || d.Description !== "CorrectiveAction");
    setValue(
      'Images',
      Images.map((image) => {
        if (image.Description === "CorrectiveAction") {
          const newImage = {
            ...image,
            Id: image.Id,
            Action: 'Delete',
          };
          return newImage;
        }
        return image;
      })
    );
  };


  const handleRemove = () => {
    const Images = [...values.Images];
    if (modalImageEditor.image.Id > 0) {
      const ImageIndex = Images.findIndex((d) => d.Id === modalImageEditor.image.Id);
      Images[ImageIndex] = {
        ...Images[ImageIndex],
        Id: modalImageEditor.image.Id,
        Action: 'Delete',
        FileName: modalImageEditor.image.FileName,
      };
      setValue('Images', Images);
    } else {
      // const filteredItems = values.Images?.filter((_file) => _file !== file);
      const filteredItems = values.Images?.filter((_file) => _file.Id !== modalImageEditor.image.Id);
      setValue('Images', filteredItems);
    }
    setOpen(null);
  };


  // SOURCE FOR IMAGE LIGHTBOX
  const imagesLightbox =
    values.Images.length > 0
      ? values.Images.filter((d) => {
        function extension(filename) {
          const r = /.+\.(.+)$/.exec(filename);
          return r ? r[1] : null;
        }
        const fileExtension = extension(d?.FileName).toLowerCase();
        const isImage = ['jpeg', 'png', 'jpg', 'gif', 'webp', 'avif', 'jfif'].includes(fileExtension);
        return isImage && d?.Action !== 'Delete';
      }).map((d) => {
        if (isViewOnly || d.Data === null) {
          return `${QC_ATTACHEMENTS_HOST_API}/${d?.Guid}`;
        }
        return d?.Data;
      })
      : [];

  // Open image editor
  const onOpenImageEditor = (image, e) => {
    const imageIndex = values.Images.findIndex((d) => d.Id === image.Id);
    if (!isViewOnly) {
      setModalImageEditor({
        ...modalImageEditor,
        image,
      });
      setSelectedImage(imageIndex);
      setOpen(e.currentTarget);
    } else {
      setSelectedImage(imageIndex);
      setOpenLightbox(true);
    }
  };

  // Image editor function
  const onClose = () => {
    setModalImageEditor({ visible: false, image: null });
  };

  const isStepCompleted = currentInspection?.Status?.Inspections || false;

  const handleFilterImages = (file) => file?.ParentGuid === values?.AfterGuid;

  return (
    <Stack>

      <Typography>{`Photos (Affter improvement)`}</Typography>

      <div>

        <RHFQCUploadMultiFile
          showPreview
          name="Images"
          accept={"image/*"}
          maxSize={30145728}
          minSize={1}
          onDrop={handleDrop}
          onRemove={handleRemove}
          onRemoveAll={handleRemoveAll}
          onUpload={() => console.log('ON UPLOAD')}
          onClick={onOpenImageEditor}
          disabled={isViewOnly || isStepCompleted}
          isViewOnly={isViewOnly}
          showTotal
          handleCamera={() => handleTakePhoto()}
          processing={processing}
          onOpenGallary={androidCameraGetPicture}
          filter={handleFilterImages}
        // showRemoveAll={false}
        />

      </div>

      {modalImageEditor?.visible && (
        <PopupImageEditor
          modalImageEditor={modalImageEditor}
          setModalImageEditor={setModalImageEditor}
          setValue={setValue}
          values={values}
          enqueueSnackbar={enqueueSnackbar}
        />
      )}

      <LightboxModal
        images={imagesLightbox}
        mainSrc={imagesLightbox[selectedImage]}
        photoIndex={selectedImage}
        setPhotoIndex={setSelectedImage}
        isOpen={openLightbox}
        onCloseRequest={() => setOpenLightbox(false)}
      />

      {/* // Menu -----------------------------------------------------------------------------------------*/}
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
        <Stack spacing={0.75}>
          <MenuItem
            onClick={(e) => {
              setOpenLightbox(true);
              setOpen(null);
            }}
          >
            <CustomIcon icon={IconName.view} />
            View
          </MenuItem>
          <MenuItem
            disabled={isViewOnly || modalImageEditor?.image?.Data === null || isStepCompleted}
            onClick={() => {
              setModalImageEditor({
                ...modalImageEditor,
                visible: true,
              });
              setOpen(null);
            }}
          >
            <CustomIcon icon={IconName.edit} />
            Edit
          </MenuItem>
          <MenuItem onClick={() => handleRemove()}
            disabled={isViewOnly || isStepCompleted}
          >
            <CustomIcon icon={IconName.delete} />
            Delete
          </MenuItem>
        </Stack>
      </MenuPopover>
    </Stack>
  );
};

export default ImproveImagesUpload;


PopupImageEditor.propTypes = {
  modalImageEditor: PropTypes.object,
  setModalImageEditor: PropTypes.func,
  setValue: PropTypes.func,
  values: PropTypes.object,
  enqueueSnackbar: PropTypes.func,
};


function PopupImageEditor({ modalImageEditor, setModalImageEditor, setValue, values, enqueueSnackbar, }) {
  const onClose = () => {
    setModalImageEditor({ visible: false, image: null });
  };

  const handleSaveCustomImage = (image) => {
    try {
      const Images = [...values.Images];
      const ImageIndex = Images.findIndex((d) => d.Id === modalImageEditor.image?.Id);
      if (ImageIndex < 0) return;
      Images[ImageIndex] = { ...Images[ImageIndex], Data: image };
      setValue('Images', Images);
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
    }
  };

  return (
    <Popup
      visible={modalImageEditor.visible}
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
      animation={{
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
      }}
    >
      <CustomImageEditor source={modalImageEditor.image} handleSave={handleSaveCustomImage} />
    </Popup>
  );
};

// Custom icon for offline mode
const CustomIcon = ({ icon }) => {

  CustomIcon.propTypes = {
    icon: PropTypes.string,
  }
  const { online } = useIsOnline();
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
};
