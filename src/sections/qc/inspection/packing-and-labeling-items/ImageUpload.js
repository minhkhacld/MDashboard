// Capacitor
import { Camera, CameraDirection, CameraResultType, CameraSource, } from "@capacitor/camera";
import { Capacitor } from "@capacitor/core";
import { Toast } from '@capacitor/toast';
import { FilePicker as CapacitorFilePicker } from '@capawesome/capacitor-file-picker';
import { Box, MenuItem, Stack, Typography, useTheme } from '@mui/material';
import { decode } from "base64-arraybuffer";
import moment from "moment";
import { useSnackbar } from "notistack";
import Proptypes from 'prop-types';
import { useState } from "react";
// devextreme
import { Popup } from "devextreme-react";
import useIsOnline from "../../../../hooks/useIsOnline";
// components
import Iconify from "../../../../components/Iconify";
import MenuPopover from "../../../../components/MenuPopover";
import useResponsive from "../../../../hooks/useResponsive";
import CustomImageEditor from "../components/CustomImageEditor";
import LightboxModal from "../components/LightboxModal";
import { RHFQCUploadMultiFile } from "../components/RHFQCUploadMultiFile";
// ultil
import IconName from "../../../../utils/iconsName";
import processArray from '../../../../utils/processArray';
import uuidv4 from "../../../../utils/uuidv4";
// config
import { QC_ATTACHEMENTS_HOST_API } from "../../../../config";
import useLocales from "../../../../hooks/useLocales";
// redux
import { setMinnId } from "../../../../redux/slices/qc";
import { dispatch, useSelector } from "../../../../redux/store";


PackingAndLabelImagesUpload.propTypes = {
    values: Proptypes.object,
    setValue: Proptypes.func,
    isViewOnly: Proptypes.bool,
    handleSave: Proptypes.func,
    inspectionId: Proptypes.any,
    isStepCompleted: Proptypes.bool,
    setLoading: Proptypes.func,
    loading: Proptypes.bool,
    setProgress: Proptypes.func,
};


export default function PackingAndLabelImagesUpload({
    values, setValue,
    isViewOnly, handleSave,
    inspectionId,
    isStepCompleted,
    setLoading = () => { },
    loading,
    setProgress = () => { },
}) {
    // Hooks
    const { translate } = useLocales()
    const { enqueueSnackbar } = useSnackbar();
    const platform = Capacitor.getPlatform();
    const { minId } = useSelector(store => store.qc)

    // COMPONETE STATE
    const [modalImageEditor, setModalImageEditor] = useState(false);
    const [openLightbox, setOpenLightbox] = useState(false);
    const [selectedImage, setSelectedImage] = useState(0);
    const [open, setOpen] = useState(null);
    const [processing, setProcessing] = useState(false);

    // Drop and update picture (include call api)
    const handleDrop = async (acceptedFiles) => {
        try {
            setLoading(true)
            setProgress(pre => ({ ...pre, total: acceptedFiles.length }))
            const Images = [...values.Images] || [];
            const sortOrder = Images.map((d) => d.SortOrder);
            const MaxOrder = sortOrder.length > 0 ? Math.max(...sortOrder) : 0;
            let insertId;

            const imageResizeBase64 = await processArray(acceptedFiles, setProgress);
            const changeImages = [
                ...imageResizeBase64
                    .map((file, index) => {
                        if (minId >= 0) {
                            insertId = -1 - index;
                        } else {
                            insertId = minId - 1 - index;
                        }
                        dispatch(setMinnId(insertId));
                        return {
                            Id: insertId,
                            FileName: file?.name || `${Images.length + 1}_${uuidv4()}.jpeg`,
                            ParentGuid: values.Guid,
                            Data: file.base64,
                            Description: '',
                            Active: true,
                            SortOrder: index + 1 + MaxOrder,
                            Action: 'Insert',
                            MasterId: inspectionId,
                        };
                    }),
                ...Images,
            ];
            setValue('Images', changeImages);
            setLoading(false);
            setProgress(pre => ({ ...pre, total: 0, current: 0 }))
            // const base64 = [...acceptedFiles].map((file, index) => {
            //     return resizeFile(file).then((data) => data);
            // });

            // Promise.all(base64).then((data) => {
            //     const changeImages = [
            //         ...acceptedFiles
            //             .map((file, index) => {

            //                 if (minId >= 0) {
            //                     insertId = -1 - index;
            //                 } else {
            //                     insertId = minId - 1 - index;
            //                 }
            //                 dispatch(setMinnId(insertId));
            //                 return {
            //                     Id: insertId,
            //                     FileName: file?.name || `${Images.length + 1}_${uuidv4()}.jpeg`,
            //                     ParentGuid: values.Guid,
            //                     Data: data[index],
            //                     Description: '',
            //                     Active: true,
            //                     SortOrder: index + 1 + MaxOrder,
            //                     Action: 'Insert',
            //                     MasterId: inspectionId,
            //                 };
            //             }),
            //         ...Images,
            //     ];
            //     setValue('Images', changeImages);
            //     setProcessing(false)
            // });


        } catch (err) {
            console.error('Image upload failed!', err);
            setLoading(false);
            setProgress(pre => ({ ...pre, total: 0, current: 0 }))
        }
    };

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
            };

            const Attachments = [...values.Images] || [];

            // Take photo;
            const cameraPhoto = await Camera.getPhoto({
                quality: 100,
                allowEditing: false,
                resultType: CameraResultType.Base64,
                saveToGallery: false,
                direction: CameraDirection.Rear,
                presentationStyle: 'fullscreen',
                source: CameraSource.Camera,
            });
            setLoading(true);
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


    const androidCameraGetPicture = async () => {
        // Request permision for ios
        if (Capacitor.getPlatform() === 'ios') {
            const permision = await Camera.checkPermissions();
            if (permision.photos === 'denied' || permision.photos === 'prompt') {
                await Camera.requestPermissions({ permissions: 'photos' }).then((res) => {
                    console.log('res request Permision', res);
                });
            }
        };
        const Attachments = [...values.Images] || [];

        const { files } = await CapacitorFilePicker.pickImages({
            readData: true,
            multiple: true,
        });

        if (files.length > 20 && platform === 'android') {
            setLoading(false)
            await Toast.show({
                text: 'Vui lòng chọn tối đa 20 hình'
            })
            return
        }

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

    // Remove all picture
    const handleRemoveAll = () => {
        // const Images = [...values.Images].filter((d) => d.Id > 0);
        const Images = [...values.Images]
        setValue(
            'Images',
            Images.map((image) => {
                const newImage = {
                    ...image,
                    Id: image.Id,
                    Action: 'Delete',
                };
                return newImage;
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
            // const filteredItems = values.Images?.filter((_file) => _file.Id !== modalImageEditor.image.Id);
            // setValue('Images', filteredItems);
            const Images = [...values.Images];
            const ImageIndex = Images.findIndex((d) => d.Id === modalImageEditor.image.Id);
            Images[ImageIndex] = {
                ...Images[ImageIndex],
                Id: modalImageEditor.image.Id,
                Action: 'Delete',
                FileName: modalImageEditor.image.FileName,
            };
            setValue('Images', Images);
        }
        setOpen(null);
    };

    // const onSubmit = async (file) => { };

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
                if (isViewOnly || d.Id > 0) {
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
            setOpen(null);
        }
    };

    // Image editor function
    // const onClose = () => {
    //     setModalImageEditor({ visible: false, image: null });
    // };

    // console.log(values);

    return (
        <Stack height={'100%'}>
            <Typography>{translate('image')}</Typography>

            <RHFQCUploadMultiFile
                showPreview
                name="Images"
                accept="image/*"
                // maxSize={15145728}
                onDrop={handleDrop}
                onRemove={handleRemove}
                onRemoveAll={handleRemoveAll}
                onUpload={() => console.log('ON UPLOAD')}
                onClick={onOpenImageEditor}
                disabled={isViewOnly || isStepCompleted}
                isViewOnly={isViewOnly}
                showTotal
                handleCamera={handleTakePhoto}
                processing={processing}
                onOpenGallary={androidCameraGetPicture}
            // showRemoveAll={false}
            />

            {modalImageEditor?.visible && (
                <PopupImageEditor
                    modalImageEditor={modalImageEditor}
                    setModalImageEditor={setModalImageEditor}
                    // methods={methods}
                    enqueueSnackbar={enqueueSnackbar}
                    translate={translate}
                    handleSave={handleSave}
                    values={values}
                    setValue={setValue}
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

function PopupImageEditor({
    modalImageEditor,
    setModalImageEditor,
    // methods,
    enqueueSnackbar,
    translate,
    handleSave,
    values,
    setValue
}) {

    const onClose = () => {
        setModalImageEditor({ visible: false, image: null });
    };
    const smUp = useResponsive('up', 'sm');

    const handleSaveCustomImage = (image) => {
        try {
            const Images = [...values.Images];
            const ImageIndex = Images.findIndex((d) => d.Id === modalImageEditor.image?.Id);
            if (ImageIndex < 0) return;
            Images[ImageIndex] = { ...Images[ImageIndex], Data: image };
            setValue('Images', Images);
            // handleSave({ Images });
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

const CustomIcon = ({ icon }) => {
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
};

const iconForOffline = (online, theme, iconName = '', label = '', color = '', filter = () => { }) => {
    if (online) {
        return <Iconify icon={iconName} color={color} />;
    }
    if (label === 'close') {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <path
                    fill={color === '' ? 'currentColor' : color}
                    d="M6.4 19L5 17.6l5.6-5.6L5 6.4L6.4 5l5.6 5.6L17.6 5L19 6.4L13.4 12l5.6 5.6l-1.4 1.4l-5.6-5.6L6.4 19Z"
                />
            </svg>
        );
    }
    return null;
};
