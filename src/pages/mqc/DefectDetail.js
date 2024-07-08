import { Camera, CameraDirection, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { FilePicker as CapacitorFilePicker } from '@capawesome/capacitor-file-picker';
import { yupResolver } from '@hookform/resolvers/yup';
import { LoadingButton } from '@mui/lab';
import { decode } from 'base64-arraybuffer';
import { useLiveQuery } from 'dexie-react-hooks';
import moment from 'moment';
import PropTypes from 'prop-types';
import * as Yup from 'yup';
// devextreme
import { Popup } from 'devextreme-react';
// hook
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
// material ui
import { Autocomplete, Box, Card, Grid, MenuItem, Stack, TextField, useTheme } from '@mui/material';
import { useSnackbar } from 'notistack';
// IndexDB
import { attachmentsDB, mqcDB } from '../../Db';
// components
import Iconify from '../../components/Iconify';
import MenuPopover from '../../components/MenuPopover';
import PopupConfirm from '../../components/PopupConfirm';
import Scrollbar from '../../components/Scrollbar';
import { FormProvider, RHFUploadMultiFile, RHFUploadMultiFileCapacitor } from '../../components/hook-form/index';
// hook
import useLocales from '../../hooks/useLocales';
import useResponsive from '../../hooks/useResponsive';
import useSettings from '../../hooks/useSettings';
// redux
import { setAttachmentMinId } from '../../redux/slices/mqc';
import { dispatch, useSelector } from '../../redux/store';
// sections
import CustomIcon from '../../sections/mqc/components/CustomIcon';
import LightboxModal from '../../sections/mqc/components/LightboxModal';
import CustomImageEditor from '../../sections/qc/inspection/components/CustomImageEditor';
// utils
import IconName from '../../utils/iconsName';
import resizeFile from '../../utils/useResizeFile';
import uuidv4 from '../../utils/uuidv4';
// config
import { HEADER, QC_ATTACHEMENTS_HOST_API } from '../../config';

DefectDetail.propTypes = {
  modalContent: PropTypes.object,
  setModalContent: PropTypes.func,
  isViewOnly: PropTypes.bool,
  onSave: PropTypes.func,
  ratings: PropTypes.array,
  setIsSaved: PropTypes.func,
  calculateRollPenaltyPoint: PropTypes.func,
  calculateTotalPenaltyQuantity: PropTypes.func,
  parentItems: PropTypes.array,
  currentParentItem: PropTypes.object,
  setCurrentParentItem: PropTypes.func,
  formField: PropTypes.object,
  filedForRules: PropTypes.object,
};

function DefectDetail({
  modalContent,
  setModalContent,
  ratings,
  currentParentItem,
  onSave,
  isViewOnly,
  calculateRollPenaltyPoint,
  calculateTotalPenaltyQuantity,
  parentItems,
  setCurrentParentItem,
  setIsSaved,
  formField,
  fieldForRules,
  AttachmentsData,
}) {
  // component state
  const [openLightbox, setOpenLightbox] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [open, setOpen] = useState(null);
  const [imageEditor, setImageEditor] = useState({
    visible: false,
    image: null,
  });
  const [currentTodoItem, setCurrentTodoItem] = useState();
  const [deleteModal, setDeleteModal] = useState(false);
  // translation
  const { translate } = useLocales();
  // notistack
  const { enqueueSnackbar } = useSnackbar();
  // theme
  const theme = useTheme();
  const { themeStretch } = useSettings();
  const mdUp = useResponsive('up', 'md');
  const smUp = useResponsive('up', 'sm');
  // redux
  const { attachmentMinId, currentRootId } = useSelector((store) => store.mqc);
  // boolean variables
  const isAddNew = modalContent?.isAddNew && currentTodoItem?.id === undefined && currentTodoItem?.Id === undefined;
  const isWebApp = Capacitor.getPlatform() === 'web';
  // get data from IndexDB
  const DefectDataFromLocal = useLiveQuery(() => mqcDB?.Enums.where('Name').equals('DefectData').toArray()) || [];
  const DefectData = DefectDataFromLocal[0]?.Elements?.filter(
    (defect) => defect.MQCInspectionTemplateId === fieldForRules?.MQCInspectionTemplateId
  );
  const AuditingResultFromLocal =
    useLiveQuery(() => mqcDB?.Enums.where('Name').equals('AuditingResult').toArray()) || [];
  const AuditingResult = AuditingResultFromLocal[0]?.Elements;
  const attachments = isViewOnly
    ? currentTodoItem?.Images
    : AttachmentsData?.filter(
        (attachment) =>
          // currentTodoItem?.Images?.map((img) => img?.id)?.indexOf(attachment?.id) >= 0 &&
          attachment?.ParentGuid === currentTodoItem?.Guid && attachment?.Action !== 'Delete'
      );
  // form
  const defaultValues = useMemo(() => ({
    DefectData: '',
    DefectDataId: '',
    DefectDataName: '',
    P1: '',
    P2: '',
    P3: '',
    P4: '',
    Remark: '',
    Images: [],
    ActQuantity: formField?.ActQuantity || '',
    ActualWidth: formField?.ActualWidth || '',
    RollNo: formField?.RollNo || '',
  }));

  const TodoInfoScheme = Yup.object().shape({
    DefectDataName: Yup.string()
      .required()
      .transform((curr, orig) => (orig === null ? '' : curr)),
    P1: Yup.number().transform((curr, orig) => (orig === '' ? 0 : Number(curr))),
    P2: Yup.number().transform((curr, orig) => (orig === '' ? 0 : Number(curr))),
    P3: Yup.number().transform((curr, orig) => (orig === '' ? 0 : Number(curr))),
    P4: Yup.number().transform((curr, orig) => (orig === '' ? 0 : Number(curr))),
    ActQuantity: Yup.string().required('Please insert ActQuantity from Roll Info tab'),
    ActualWidth: Yup.string().required('Please insert ActualWidth from Roll Info tab'),
    RollNo: Yup.string()
      .required('Please insert RollNo from Roll Info tab')
      .transform((curr, orig) => (orig === null ? '' : curr)),
  });

  const methods = useForm({
    resolver: yupResolver(TodoInfoScheme),
    defaultValues,
  });

  const {
    watch,
    handleSubmit,
    setError,
    setValue,
    formState: { isSubmitting, errors },
  } = methods;

  const values = watch();

  // useEffect block
  useEffect(() => {
    setCurrentTodoItem(modalContent?.item);
  }, [modalContent]);

  useEffect(() => {
    setValue('DefectData', currentTodoItem?.DefectData || null);
    setValue('DefectDataId', currentTodoItem?.DefectDataId || null);
    setValue('DefectDataName', currentTodoItem?.DefectDataName || null);
    setValue('P1', currentTodoItem?.P1 || 0);
    setValue('P2', currentTodoItem?.P2 || 0);
    setValue('P3', currentTodoItem?.P3 || 0);
    setValue('P4', currentTodoItem?.P4 || 0);
    setValue('Remark', currentTodoItem?.Remark || null);
  }, [currentTodoItem]);

  useEffect(() => {
    setValue('Images', attachments || []);
  }, [AttachmentsData, currentTodoItem]);

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      const scrolElement = document.getElementById(Object.keys(errors)[0]);
      if (scrolElement) {
        scrolElement.scrollIntoView(false, { behavior: 'smooth' });
      }
    }
  }, [errors]);

  // functions
  const addNewItem = async () => {
    // get min Id
    const newRatings = [...ratings];
    const idList = newRatings?.map((value) => {
      if (value?.id) {
        return value?.id;
      }
      return value?.Id;
    });
    const minId = idList ? Math.min(...idList) : 1;
    // set current Id and Guid
    const currentId = minId >= 0 ? -1 : minId - 1;
    const currentGuid = uuidv4();
    // set new Defect Data and add to list named 'ratings'
    const imageWithNoData = values?.Images?.map((img) => {
      if (img) {
        img.ParentGuid = currentGuid;
      }
      attachmentsDB?.mqc.add(img);
      return {
        id: img?.id,
        Guid: img?.Guid,
        Title: img?.Guid?.Title,
        FileName: img?.FileName,
        URL: img?.URL,
        Remark: img?.Remark,
        InternalURL: img?.InternalURL,
        Data: null,
        Action: img?.Action,
        ParentGuid: img?.ParentGuid,
      };
    });
    const newValue = { ...values, id: currentId, Guid: currentGuid, Images: imageWithNoData };
    delete newValue?.ActualWidth;
    delete newValue?.ActQuantity;
    delete newValue?.RollNo;
    newRatings?.push(newValue);
    // calculate RollPenaltyPoint
    const RollPenaltyPoint = calculateRollPenaltyPoint(newRatings);
    // set new QIMaterialFabricRatings and RollPenaltyPoint to currentParentItem
    currentParentItem = { ...currentParentItem, QIMaterialFabricRatings: newRatings, RollPenaltyPoint };
    let QIMaterialFabricLines = parentItems || [];
    if (currentParentItem?.id !== undefined || currentParentItem?.Id !== undefined) {
      QIMaterialFabricLines = QIMaterialFabricLines.map((value) => {
        if (
          (value?.Id === currentParentItem?.Id && currentParentItem?.Id !== undefined) ||
          (value?.id === currentParentItem?.id && currentParentItem?.id !== undefined)
        ) {
          return currentParentItem;
        }
        return value;
      });
    } else {
      const idList = parentItems?.map((value) => {
        if (value?.id) {
          return value?.id;
        }
        return value?.Id;
      });
      const minId = idList ? Math.min(...idList) : 1;
      const currentId = minId >= 0 ? -1 : minId - 1;
      // prop formField has RollPenaltyPoint
      currentParentItem = {
        ...currentParentItem,
        ...formField,
        QIMaterialFabricRatings: ratings,
        id: currentId,
        RollPenaltyPoint,
      };
      QIMaterialFabricLines.push(currentParentItem);
    }
    const TotalPenaltyQuantity = calculateTotalPenaltyQuantity(QIMaterialFabricLines);
    const checkRulesForAuditResult = TotalPenaltyQuantity <= fieldForRules?.MaxPenaltyQuantity;

    await onSave({
      QIMaterialFabricLines,
      TotalPenaltyQuantity,
      AuditingResult: checkRulesForAuditResult ? 'Pass' : 'Fail',
      AuditingResultId: checkRulesForAuditResult
        ? AuditingResult?.find((result) => result?.Caption === 'Pass')?.Value
        : AuditingResult?.find((result) => result?.Caption === 'Fail')?.Value,
    })
      .then(() => {
        setCurrentParentItem(currentParentItem);
        setCurrentTodoItem(newValue);
        setIsSaved(true);
        // onClose();
        enqueueSnackbar(translate('mqc.saveSuccess'), {
          variant: 'success',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'center',
          },
        });
      })
      .catch((e) => {
        console.log(e);
        enqueueSnackbar(translate('mqc.error.saveError'), {
          variant: 'error',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'center',
          },
        });
      });
  };

  const updateItem = async () => {
    const attachmentsInDatabase = attachmentsDB?.mqc
      .where('ParentGuid')
      .equals(currentTodoItem?.Guid || currentTodoItem?.id)
      .and((result) => result?.ParentId === currentRootId && result?.Action !== 'Delete')
      .toArray()
      .then((res) => {
        // Update or add Attachments
        values?.Images?.map((img) => {
          const listId = res?.map((i) => i?.id);
          if (listId?.includes(img?.id) && img?.Action !== null) {
            attachmentsDB?.mqc.where('id').equals(img?.id).modify({ Data: img?.Data, Action: img?.Action });
          }
          if (!listId?.includes(img?.id)) {
            attachmentsDB?.mqc.add(img);
          }
          return img;
        });
        // Delete Attachments
        res?.map((att) => {
          const listId = values?.Images?.map((i) => i?.id);
          if (!listId?.includes(att?.id)) {
            attachmentsDB?.mqc.where('id').equals(att?.id).delete();
          }
          return att;
        });
      });

    const imageWithNoData = values?.Images?.map((img) => {
      return {
        id: img?.id,
        Guid: img?.Guid,
        Title: img?.Guid?.Title,
        FileName: img?.FileName,
        URL: img?.URL,
        Remark: img?.Remark,
        InternalURL: img?.InternalURL,
        Data: null,
        Action: img?.Action,
      };
    });

    const newValues = ratings?.map((value) => {
      if (
        (value?.Id === currentTodoItem?.Id && currentTodoItem?.Id !== undefined) ||
        (value?.id === currentTodoItem?.id && currentTodoItem?.id !== undefined)
      ) {
        const newItem = { ...value, ...values, Images: imageWithNoData };
        delete newItem?.ActualWidth;
        delete newItem?.ActQuantity;
        delete newItem?.RollNo;
        return newItem;
      }
      return value;
    });
    const RollPenaltyPoint = calculateRollPenaltyPoint(newValues);
    currentParentItem = { ...currentParentItem, QIMaterialFabricRatings: newValues, RollPenaltyPoint };
    const QIMaterialFabricLines = parentItems?.map((value) => {
      if (
        (value?.Id === currentParentItem?.Id && currentParentItem?.Id !== undefined) ||
        (value?.id === currentParentItem?.id && currentParentItem?.id !== undefined)
      ) {
        return currentParentItem;
      }
      return value;
    });
    const TotalPenaltyQuantity = calculateTotalPenaltyQuantity(QIMaterialFabricLines);

    const checkRulesForAuditResult = TotalPenaltyQuantity <= fieldForRules?.MaxPenaltyQuantity;

    await onSave({
      QIMaterialFabricLines,
      TotalPenaltyQuantity,
      AuditingResult: checkRulesForAuditResult ? 'Pass' : 'Fail',
      AuditingResultId: checkRulesForAuditResult
        ? AuditingResult?.find((result) => result?.Caption === 'Pass')?.Value
        : AuditingResult?.find((result) => result?.Caption === 'Fail')?.Value,
    })
      .then(() => {
        setCurrentParentItem(currentParentItem);
        setCurrentTodoItem(
          newValues.find(
            (value) =>
              (value?.Id === currentTodoItem?.Id && currentTodoItem?.Id !== undefined) ||
              (value?.id === currentTodoItem?.id && currentTodoItem?.id !== undefined)
          )
        );
        setIsSaved(true);
        // onClose();
        enqueueSnackbar(translate('mqc.saveSuccess'), {
          variant: 'success',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'center',
          },
        });
      })
      .catch((e) => {
        console.log(e);
        enqueueSnackbar(translate('mqc.error.saveError'), {
          variant: 'error',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'center',
          },
        });
      });
  };

  const handleSave = async () => {
    // Check Defect Point
    const TotalDefectPoint = values?.P1 + values?.P2 + values?.P3 + values?.P4;
    if (TotalDefectPoint <= 0) {
      enqueueSnackbar(translate('mqc.error.defectPointError'), {
        variant: 'error',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center',
        },
      });
      return;
    }
    // Check Item has image
    if (values?.Images.length === 0 || values?.Images?.filter((value) => value?.Action !== 'Delete')?.length === 0) {
      // console.log('cannot save');
      enqueueSnackbar(translate('mqc.error.noImage2'), {
        variant: 'error',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center',
        },
      });
      return;
    }
    if (isAddNew) {
      // Add New
      addNewItem();
    } else {
      // Update
      updateItem();
    }
  };

  const handleDeleteDetail = async () => {
    try {
      const newValue = [...ratings];
      const index = newValue.indexOf(
        ratings?.find(
          (value) =>
            (value?.Id === currentTodoItem?.Id && currentTodoItem?.Id !== undefined) ||
            (value?.id === currentTodoItem?.id && currentTodoItem?.id !== undefined)
        )
      );
      if (newValue[index]?.id) {
        newValue?.splice(index, 1);
      } else {
        newValue[index] = { ...newValue[index], IsDeleted: true };
      }

      // Delete images
      currentTodoItem?.Images?.map((img) => {
        attachmentsDB?.mqc.where('id').equals(img?.id).delete();
        return img;
      });
      // Re-canculate Penalty Point
      const RollPenaltyPoint = calculateRollPenaltyPoint(newValue.filter((value) => value?.IsDeleted !== true));
      currentParentItem = { ...currentParentItem, QIMaterialFabricRatings: newValue, RollPenaltyPoint };
      const QIMaterialFabricLines = parentItems?.map((value) => {
        if (
          (value?.Id === currentParentItem?.Id && currentParentItem?.Id !== undefined) ||
          (value?.id === currentParentItem?.id && currentParentItem?.id !== undefined)
        ) {
          return currentParentItem;
        }
        return value;
      });
      // Re-canculate TotalPenaltyQuantity Point
      const TotalPenaltyQuantity = calculateTotalPenaltyQuantity(QIMaterialFabricLines);
      await onSave({ QIMaterialFabricLines, TotalPenaltyQuantity })
        .then(() => {
          setCurrentParentItem(currentParentItem);
          setIsSaved(true);
          onClose();
          enqueueSnackbar(translate('mqc.deleteSuccess'), {
            variant: 'success',
            anchorOrigin: {
              vertical: 'top',
              horizontal: 'center',
            },
          });
        })
        .catch((e) => {
          console.log(e);
          enqueueSnackbar(translate('mqc.error.deleteError'), {
            variant: 'error',
            anchorOrigin: {
              vertical: 'top',
              horizontal: 'center',
            },
          });
        });
    } catch (e) {
      console.log(e);
      enqueueSnackbar(translate('mqc.error.deleteError'), {
        variant: 'error',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center',
        },
      });
    }
  };

  const onError = (e) => {
    Object.keys(e).map((key) => {
      if (e[key] !== undefined && e[key].message !== undefined) {
        if (key === 'RollNo' || key === 'ActualWidth' || key === 'ActQuantity') {
          enqueueSnackbar(translate('mqc.error.requiredOutside'), {
            variant: 'error',
            anchorOrigin: {
              vertical: 'top',
              horizontal: 'center',
            },
          });
          return;
        }
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

  const onClose = () => {
    setModalContent({ visible: false, item: null, isAddNew: false });
  };

  const handleDrop = (acceptedFiles) => {
    try {
      // Can be set to the src of an image now
      const Attachments = [...values.Images] || [];
      let insertId;
      const base64 = [...acceptedFiles].map((file) => {
        return resizeFile(file).then((data) => data);
      });
      Promise.all(base64).then((data) => {
        setValue('Images', [
          ...acceptedFiles.reverse().map((file, index) => {
            if (attachmentMinId >= 0) {
              insertId = -1 - index;
            } else {
              insertId = attachmentMinId - 1 - index;
            }
            // if (index === acceptedFiles.length - 1) {
            dispatch(setAttachmentMinId(insertId));
            // }
            const attachmentGuid = uuidv4();
            return {
              id: insertId,
              Guid: attachmentGuid,
              // Guid: null,
              Title: null,
              FileName: file?.name.includes('image') ? `Image ${Attachments.length + 1 + index}.jpg` : file?.name,
              URL: null,
              Remark: null,
              InternalURL: null,
              ParentGuid: currentTodoItem?.Guid,
              Data: data[index],
              Action: 'Insert',
              ParentId: currentRootId,
              ImageForEntity: 'QIMaterialFabricRating',
            };
          }),
          ...Attachments,
        ]);
      });
      document
        .getElementById('multi-image-review-container')
        .scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' });
    } catch (err) {
      console.error(err);
    }
  };

  const androidCameraGetPicture = async () => {
    // Request permision for ios
    if (Capacitor.getPlatform() === 'ios') {
      const permision = Camera.checkPermission();
      if (permision === 'denied') {
        Camera.requestPermissions().then((res) => {
          console.log('res request Permision', res);
        });
      }
    }
    const Attachments = [...values.Images] || [];

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
  };

  // Handle remove all files
  const handleRemoveAll = () => {
    setValue('Images', []);
  };

  // Handle remove file
  const handleRemove = () => {
    const Attachments = [...values.Images];
    if (Attachments.length > 0) {
      if (Attachments[selectedImage]?.Id > 0 || Attachments[selectedImage]?.id > 0) {
        Attachments[selectedImage].Action = 'Delete';
        setValue('Images', Attachments);
        setOpen(null);
      } else {
        Attachments?.splice(selectedImage, 1);
        // Attachments[selectedImage].IsDeleted = true;
        setValue('Images', Attachments);
        setOpen(null);
      }
    }
  };

  // OPEN LIGHTBOX VIEW PICTURE
  const handleClick = async (file, e) => {
    const Attachments = values.Images;
    const imageIndex = Attachments.findIndex((d) => {
      if (file.Id) {
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

  //  Handle Take photo button
  const handleTakePhoto = async () => {
    try {
      // Request permision for ios
      if (Capacitor.getPlatform() === 'ios') {
        const permision = Camera.checkPermission();
        if (permision === 'denied') {
          Camera.requestPermissions().then((res) => {
            console.log('res request Permision', res);
          });
        }
      }
      const Attachments = [...values.Images] || [];
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
      handleDrop([fileConvert]);
    } catch (err) {
      console.error(err);
      enqueueSnackbar(translate('products.addEdit.errorMsg'), {
        variant: 'error',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center',
        },
      });
    }
  };

  // SOURCE FOR IMAGE LIGHTBOX
  const imagesLightbox =
    values.Images && values.Images.length > 0
      ? values?.Images.filter((d) => {
          function extension(filename) {
            const r = /.+\.(.+)$/.exec(filename);
            return r ? r[1] : null;
          }
          const fileExtension = extension(d?.FileName).toLowerCase();
          const isImage = ['jpeg', 'png', 'jpg', 'gif', 'webp', 'avif', 'jfif'].includes(fileExtension);
          return isImage && d?.Action !== 'Delete';
        })
      : [];

  const ImageUrl = `${QC_ATTACHEMENTS_HOST_API}/${imagesLightbox[selectedImage]?.Guid}`;

  const renderImage =
    imagesLightbox.length > 0
      ? imagesLightbox.map((d) => (d?.Data !== null ? d?.Data : `${QC_ATTACHEMENTS_HOST_API}/${d?.Guid}`))
      : [];

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

  // for reponsive
  const NOTCH_HEIGHT = checkNotch();
  const BREAKCRUM_HEIGHT = 40;
  const SPACING = 24;
  const ANDROID_KEYBOARD = Capacitor.getPlatform() === 'android' ? 16 : 0;
  const TAB_HEIGHT = 48;
  const BACK_BUTTON_HEIGHT = 42;
  const SUBMIT_BUTTON = 52;

  return (
    <Popup
      visible={modalContent.visible}
      onHiding={onClose}
      dragEnabled={false}
      hideOnOutsideClick
      showCloseButton
      showTitle
      title={'Defect Detail'}
      // container=".dx-viewport"
      width={mdUp ? 700 : '100%'}
      height={mdUp ? '100%' : '100%'}
      animation={{
        show: {
          type: 'fade',
          duration: 400,
          from: 0,
          to: 1,
        },
        hide: {
          type: 'fade',
          duration: 400,
          from: 1,
          to: 0,
        },
      }}
    >
      <FormProvider methods={methods} onSubmit={handleSubmit(handleSave, onError)}>
        <Stack spacing={3} sx={{ paddingBottom: 20 }}>
          <Card
            id="compliance-card-detail"
            sx={{
              minHeight: '50vh',
              height: {
                xs: `calc(100vh - ${HEADER.MOBILE_HEIGHT + SPACING + ANDROID_KEYBOARD + TAB_HEIGHT + NOTCH_HEIGHT}px)`,
                sm: `calc(100vh - ${HEADER.MOBILE_HEIGHT + SPACING + ANDROID_KEYBOARD + TAB_HEIGHT + NOTCH_HEIGHT}px)`,
                lg: `calc(100vh - ${
                  HEADER.DASHBOARD_DESKTOP_HEIGHT + SPACING + ANDROID_KEYBOARD + TAB_HEIGHT + NOTCH_HEIGHT
                }px)`,
              },
            }}
          >
            <Scrollbar>
              <Box
                sx={{
                  minHeight: '50vh',
                  height: {
                    xs: `calc(100vh - ${
                      HEADER.MOBILE_HEIGHT + SPACING + ANDROID_KEYBOARD + TAB_HEIGHT + NOTCH_HEIGHT + BACK_BUTTON_HEIGHT
                    }px)`,
                    sm: `calc(100vh - ${
                      HEADER.MOBILE_HEIGHT + SPACING + ANDROID_KEYBOARD + TAB_HEIGHT + NOTCH_HEIGHT + BACK_BUTTON_HEIGHT
                    }px)`,
                    lg: `calc(100vh - ${
                      HEADER.DASHBOARD_DESKTOP_HEIGHT +
                      SPACING +
                      ANDROID_KEYBOARD +
                      TAB_HEIGHT +
                      NOTCH_HEIGHT +
                      BACK_BUTTON_HEIGHT
                    }px)`,
                  },
                  px: 1,
                  py: 2,
                }}
              >
                <Grid container rowSpacing={3} columnSpacing={2} pb={4}>
                  <Grid item xs={12} md={12}>
                    <Autocomplete
                      autoComplete
                      readOnly={isViewOnly}
                      defaultValue={DefectData?.find((d) => d?.DefectDataId === values?.DefectDataId) || {}}
                      value={DefectData?.find((d) => d?.DefectDataId === values?.DefectDataId) || {}}
                      onChange={(event, newValue) => {
                        setValue('DefectDataName', newValue?.DefectDataName);
                        setValue('DefectDataId', newValue?.DefectDataId);
                      }}
                      getOptionLabel={(option) => {
                        return option?.DefectDataName === undefined ? '' : `${option?.DefectDataName}` || '';
                      }}
                      options={DefectData || []}
                      size="small"
                      autoHighlight
                      sx={{ width: '100%', minWidth: 150 }}
                      renderInput={(params) => (
                        <RenderInput
                          params={{ ...params, error: errors?.DefectDataName !== undefined }}
                          label="Defect"
                          required
                        />
                      )}
                      renderOption={(props, option) => {
                        delete props.key;
                        return (
                          <Box component="li" key={props.id} {...props}>
                            {option?.DefectDataName}
                          </Box>
                        );
                      }}
                      isOptionEqualToValue={(option, value) => {
                        return `${option?.DefectDataId}` === `${value?.DefectDataId}`;
                      }}
                    />
                  </Grid>

                  <Grid item xs={3} md={3}>
                    <TextField
                      fullWidth
                      onFocus={(event) => {
                        event.target.select();
                      }}
                      size="small"
                      label={
                        <Stack direction="row" justifyContent="center" alignItems="center">
                          <p className="ml-1">{'P1'}</p>
                        </Stack>
                      }
                      InputLabelProps={{
                        style: { color: 'var(--label)' },
                        shrink: true,
                      }}
                      value={values?.P1 || ''}
                      onChange={(e) => {
                        setValue('P1', Number(Number(e?.target?.value).toFixed(0)));
                      }}
                      type="number"
                      InputProps={{ readOnly: isViewOnly, inputProps: { inputMode: 'numeric' } }}
                      rows={1}
                    />
                  </Grid>
                  <Grid item xs={3} md={3}>
                    <TextField
                      fullWidth
                      onFocus={(event) => {
                        event.target.select();
                      }}
                      size="small"
                      label={
                        <Stack direction="row" justifyContent="center" alignItems="center">
                          <p className="ml-1">{'P2'}</p>
                        </Stack>
                      }
                      InputLabelProps={{
                        style: { color: 'var(--label)' },
                        shrink: true,
                      }}
                      value={values?.P2 || ''}
                      onChange={(e) => {
                        setValue('P2', Number(Number(e?.target?.value).toFixed(0)));
                      }}
                      type="number"
                      InputProps={{ readOnly: isViewOnly, inputProps: { inputMode: 'numeric' } }}
                      rows={1}
                    />
                  </Grid>
                  <Grid item xs={3} md={3}>
                    <TextField
                      fullWidth
                      onFocus={(event) => {
                        event.target.select();
                      }}
                      size="small"
                      label={
                        <Stack direction="row" justifyContent="center" alignItems="center">
                          <p className="ml-1">{'P3'}</p>
                        </Stack>
                      }
                      InputLabelProps={{
                        style: { color: 'var(--label)' },
                        shrink: true,
                      }}
                      value={values?.P3 || ''}
                      onChange={(e) => {
                        setValue('P3', Number(Number(e?.target?.value).toFixed(0)));
                      }}
                      type="number"
                      InputProps={{ readOnly: isViewOnly, inputProps: { inputMode: 'numeric' } }}
                      rows={1}
                    />
                  </Grid>
                  <Grid item xs={3} md={3}>
                    <TextField
                      fullWidth
                      onFocus={(event) => {
                        event.target.select();
                      }}
                      size="small"
                      label={
                        <Stack direction="row" justifyContent="center" alignItems="center">
                          <p className="ml-1">{'P4'}</p>
                        </Stack>
                      }
                      InputLabelProps={{
                        style: { color: 'var(--label)' },
                        shrink: true,
                      }}
                      value={values?.P4 || ''}
                      onChange={(e) => {
                        setValue('P4', Number(Number(e?.target?.value).toFixed(0)));
                      }}
                      type="number"
                      InputProps={{ readOnly: isViewOnly, inputProps: { inputMode: 'numeric' } }}
                      rows={1}
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
                      value={values?.Remark || ''}
                      onChange={(e) => {
                        setValue('Remark', e?.target?.value);
                      }}
                      InputProps={{ readOnly: isViewOnly }}
                      multiline
                      rows={3}
                    />
                  </Grid>
                  <Grid item xs={12} md={12} id="multi-image-review-container">
                    {isWebApp ? (
                      <RHFUploadMultiFile
                        showPreview
                        name="Images"
                        accept="image/*"
                        // maxSize={15145728}
                        minSize={1}
                        onDrop={handleDrop}
                        onRemove={handleRemove}
                        onRemoveAll={handleRemoveAll}
                        onUpload={() => console.log('ON UPLOAD')}
                        onClick={handleClick}
                        smallBlockContent
                        disabled={isViewOnly}
                        showTotal
                        showMenuActions
                      />
                    ) : (
                      <RHFUploadMultiFileCapacitor
                        showPreview
                        name="Images"
                        accept="image/*"
                        // maxSize={15145728}
                        minSize={1}
                        onDrop={handleDrop}
                        onRemove={handleRemove}
                        onRemoveAll={handleRemoveAll}
                        onUpload={() => console.log('ON UPLOAD')}
                        onClick={handleClick}
                        smallBlockContent
                        disabled={isViewOnly}
                        showTotal
                        showMenuActions
                        handleCamera={() => handleTakePhoto()}
                        onOpenGallary={androidCameraGetPicture}
                      />
                    )}
                  </Grid>
                </Grid>
              </Box>
            </Scrollbar>
          </Card>
          <Box sx={{ width: '100%', position: 'fixed', overflow: 'hidden', bottom: 3, py: 1, pr: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={6} md={6}>
                <LoadingButton
                  variant={'contained'}
                  sx={{
                    backgroundColor: theme.palette.error.main,
                  }}
                  fullWidth
                  onClick={() => setDeleteModal(true)}
                  disabled={isViewOnly || isAddNew}
                >
                  {translate('button.delete')}
                </LoadingButton>
              </Grid>
              <Grid item xs={6} md={6}>
                <LoadingButton variant={'contained'} fullWidth type="submit" disabled={isViewOnly}>
                  {translate('button.save')}
                </LoadingButton>
              </Grid>
            </Grid>
          </Box>
        </Stack>

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
          <Stack spacing={0.75}>
            <MenuItem
              onClick={(e) => {
                setOpenLightbox(true);
                setOpen(null);
              }}
            >
              <CustomIcon icon={IconName.view} />
              {translate('button.view')}
            </MenuItem>
            <MenuItem
              onClick={() => {
                setImageEditor({
                  ...imageEditor,
                  visible: true,
                });
                setOpen(null);
              }}
              disabled={imageEditor?.image === null || imageEditor?.image?.Id > 0 || imageEditor?.image?.id > 0}
            >
              <CustomIcon icon={IconName.edit} />
              {translate('button.edit')}
            </MenuItem>
            <MenuItem onClick={() => handleRemove()}>
              <CustomIcon icon={IconName.delete} />
              {translate('button.delete')}
            </MenuItem>
          </Stack>
        </MenuPopover>
        {deleteModal ? (
          <PopupConfirm
            title={translate('mqc.deleteConfirm.title')}
            visible={deleteModal}
            onClose={() => setDeleteModal(false)}
            onProcess={handleDeleteDetail}
            description={translate('mqc.deleteConfirm.message')}
          />
        ) : null}
      </FormProvider>
    </Popup>
  );
}

export default DefectDetail;

// Render Input
const RenderInput = ({ params, label, ...other }) => {
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
      const Attachments = [...values.Images];
      const ImageIndex = Attachments.findIndex((d) => d.Id === imageEditor.image?.Id);
      if (seletedImage < 0) return;
      Attachments[seletedImage] = { ...Attachments[seletedImage], Data: image };
      setValue('Images', Attachments);
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
        class: 'popup-image-editor',
      }}
    >
      <CustomImageEditor source={imageEditor.image} handleSave={handleSaveCustomImage} />
    </Popup>
  );
};
