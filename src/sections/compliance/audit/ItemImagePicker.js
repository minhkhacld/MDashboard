import { Camera, CameraDirection, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { FilePicker as CapacitorFilePicker } from '@capawesome/capacitor-file-picker';
import { Box, CircularProgress, MenuItem, Stack, Typography } from '@mui/material';
import { decode } from 'base64-arraybuffer';
import { Toast } from '@capacitor/toast';
import moment from 'moment';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
// 
import { useDropzone } from 'react-dropzone';
import MenuPopover from '../../../components/MenuPopover';
// redux
import { setMinnId } from '../../../redux/slices/compliance';
import { dispatch, useSelector } from '../../../redux/store';
// hooks
import useLocales from '../../../hooks/useLocales';
// components
import Iconify from '../../../components/Iconify';
import IconName from '../../../utils/iconsName';
import Image from '../../qc/inspection/components/Image';
import LightboxModal from '../../qc/inspection/components/LightboxModal';
// config
import { QC_ATTACHEMENTS_HOST_API } from '../../../config';
import { attachmentsDB } from '../../../Db';
// utils
import { getFileFormat } from '../../../utils/getFileFormat';
import { processArrayComplianceLineImages } from '../../../utils/handleDbAttachment';
import processArray from '../../../utils/processArray';
import uuidv4 from '../../../utils/uuidv4';



// const defaultOptions = [
//     {
//         label: 'Take photo',
//         value: 'takePhoto',
//         icon: IconName.camera,
//         disabled: false,
//     },
//     {
//         label: 'Pick Image',
//         value: 'getPhoto',
//         icon: IconName.folder,
//         disabled: false,
//     },
//     {
//         label: 'View Image',
//         value: 'viewPhoto',
//         icon: IconName.view,
//         disabled: false,
//     }
// ];

ItemImagePicker.propTypes = {
    images: PropTypes.array,
    isViewOnly: PropTypes.bool,
    // MENU_OPTIONS: PropTypes.array,
    RecordGuid: PropTypes.string,
    ParentId: PropTypes.number,
    complianceAttachments: PropTypes.array,
    IsFinished: PropTypes.bool,
};


export default function ItemImagePicker({
    images = [],
    isViewOnly,
    // MENU_OPTIONS ,
    RecordGuid,
    ParentId,
    complianceAttachments = [],
    IsFinished,
}) {


    const { currentLang } = useLocales();
    const isWebApp = Capacitor.getPlatform() === 'web';
    const { minId } = useSelector((store) => store.compliance);
    const [progress, setProgress] = useState({ current: 0, total: 0 });
    const [processing, setProcessing] = useState(false);
    const [popupOpen, setOpen] = useState(null);
    const [openLightbox, setOpenLightbox] = useState(false);
    const [selectedImage, setSelectedImage] = useState(0);
    const [imagesLightbox, setImageLightBox] = useState([]);

    const MENU_OPTIONS = [
        {
            label: 'Take photo',
            value: 'takePhoto',
            icon: IconName.camera,
            disabled: isWebApp || isViewOnly || IsFinished,
        },
        {
            label: 'Pick Image',
            value: 'getPhoto',
            icon: IconName.folder,
            disabled: isViewOnly || IsFinished,
        },
        {
            label: 'View Image',
            value: 'viewPhoto',
            icon: IconName.view,
            disabled: false,
        },
    ];


    // ON DROP SEQUENCE
    const onDrop = async (acceptedFiles) => {
        // Do something with the files
        try {
            if (!processing) {
                setProcessing(true)
            }
            setProgress(pre => ({ ...pre, total: acceptedFiles.length * 2 }));
            // await handleDrop(acceptedFiles);
            // Can be set to the src of an image now
            const Attachments = [...images] || [];
            let insertId;

            const imageResizeBase64 = await processArray(acceptedFiles, setProgress);

            const changeImage = [
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
                        Data: file.base64,
                        Action: 'Insert',
                        RecordGuid,
                        ParentId,
                    };
                }),
            ];

            await processArrayComplianceLineImages(changeImage, attachmentsDB, complianceAttachments, setProgress)
                .then(async () => {
                    console.log('images save to db')
                })
                .catch((err) => console.error(err));

            setProcessing(false);
            setProgress({ current: 0, total: 0 })
        } catch (err) {
            console.error('Image upload failed!');
            setProcessing(false);
            setProgress({ current: 0, total: 0 })
        }
    };

    const { open } = useDropzone({
        onDrop,
        accept: 'image/*',
        disabled: isViewOnly,
        // Disable click and keydown behavior
        noClick: true,
        noKeyboard: true,
        useFsAccessApi: true,
    });


    useEffect(() => {
        return () => {
            setProcessing(false);
            setProgress({ current: 0, total: 0 });
        }
    }, []);

    const handleOpen = (event) => {
        setOpen(event.target);
    };

    const handleClose = () => {
        setOpen(null);
    };

    const openFileOrFiles = async (multiple = true) => {

        try {
            // Feature detection. The API needs to be supported
            // and the app not run in an iframe.
            setProcessing(true)
            const supportsFileSystemAccess =
                "showOpenFilePicker" in window &&
                (() => {
                    try {
                        return window.self === window.top;
                    } catch {
                        return false;
                    }
                })();

            // If the File System Access API is supported…
            if (supportsFileSystemAccess) {
                let fileOrFiles;
                try {
                    // Show the file picker, optionally allowing multiple files.
                    const handles = await window.showOpenFilePicker({ multiple });
                    // Only one file is requested.
                    if (!multiple) {
                        // Add the `FileSystemFileHandle` as `.handle`.
                        fileOrFiles = await handles[0].getFile();
                        fileOrFiles.handle = handles[0];
                    } else {
                        fileOrFiles = await Promise.all(
                            handles.map(async (handle) => {
                                const file = await handle.getFile();
                                // Add the `FileSystemFileHandle` as `.handle`.
                                file.handle = handle;
                                return file;
                            })
                        );
                    }
                } catch (err) {
                    // Fail silently if the user has simply canceled the dialog.
                    if (err.name !== 'AbortError') {
                        console.error(err.name, err.message);
                    }
                }
                onDrop(fileOrFiles);
                // return fileOrFiles;
            }
            else {
                console.log('Un support file picker')
                // Append a new `<input type="file" multiple? />` and hide it.
                const input = document.createElement('input');
                input.style.display = 'none';
                input.type = 'file';
                input.accept = "image/*";
                document.body.append(input);
                if (multiple) {
                    input.multiple = true;
                }
                // The `change` event fires when the user interacts with the dialog.
                input.addEventListener('change', () => {
                    // Remove the `<input type="file" multiple? />` again from the DOM.
                    input.remove();
                    // If no files were selected, return.
                    if (!input.files) {
                        return;
                    }
                    // Return all files or just one file.
                    onDrop(Array.from(input.files));
                });
                // Show the picker.
                if ('showPicker' in HTMLInputElement.prototype) {
                    input.showPicker();
                } else {
                    input.click();
                }
            }
        } catch (error) {
            await Toast.show({
                text: `Upload Error ${JSON.stringify(error)}`
            });;
            setProcessing(false);
        }

    };

    const capacitorImagePicker = async () => {

        try {
            setProcessing(true)
            // Request permision for ios
            if (Capacitor.getPlatform() === 'ios') {
                const permision = Camera.checkPermission();
                if (permision === 'denied') {
                    Camera.requestPermissions().then((res) => {
                        console.log('res request Permision', res);
                    });
                }
            };

            const Attachments = images || [];

            const { files } = await CapacitorFilePicker.pickImages({
                readData: true,
                multiple: true,
            });

            // console.log('files', files);

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

            onDrop(imageLists);

        } catch (error) {
            await Toast.show({
                text: `Upload Error ${JSON.stringify(error)}`
            });;
            setProcessing(false);
        }

    }

    const imageProcessingProgress = Math.round(progress.current / progress.total * 100) || 0;

    // Open image editor
    const onOpenImageLightBox = () => {
        // SOURCE FOR IMAGE LIGHTBOX
        const imagesPreview =
            images.length > 0
                ? images.filter((d) => {
                    const isImage = getFileFormat(d?.FileName || d?.Name) === 'image'
                    return isImage && d?.Action !== 'Delete';
                }).map((d) => {
                    if (isViewOnly || d.id > 0) {
                        return `${QC_ATTACHEMENTS_HOST_API}/${d?.Guid}`;
                    }
                    return d?.Data;
                })
                : [];
        setOpenLightbox(true);
        setSelectedImage(0);
        setImageLightBox(imagesPreview);
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
            };

            const Attachments = [...images] || [];

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

            const blobImage = new Blob([new Uint8Array(decode(cameraPhoto.base64String))], {
                type: `image/${cameraPhoto.format}`,
            });

            const fileConvert = new File([blobImage], `Image-${Attachments.length + 1}.jpeg`, {
                lastModified: moment().unix(),
                type: blobImage.type,
            });

            onDrop([fileConvert]);

        } catch (err) {
            console.error(err);
        };
    };

    const handleClickItem = async (option) => {
        if (option.value === "takePhoto") {
            handleTakePhoto();
            handleClose();
        };
        if (option.value === "getPhoto") {
            if (isWebApp) {
                openFileOrFiles(true)
            } else {
                capacitorImagePicker()
            }
            // fileOpen()
            handleClose();
        };
        if (option.value === "viewPhoto") {
            onOpenImageLightBox();
            handleClose();
        };
    };

    return (
        <>
            <Box
                onClick={(e) => handleOpen(e)}
                component={'button'}
                sx={{
                    p: .5,
                    width: 80,
                    height: 80,
                    borderRadius: 1.25,
                    overflow: 'hidden',
                    position: 'relative',
                    display: 'inline-flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    // border: (theme) => `solid 1px ${theme.palette.divider}`,
                }}
            >
                <Box
                    sx={{
                        p: 0,
                        width: '100%',
                        height: '100%',
                        borderRadius: 1.25,
                        overflow: 'hidden',
                        position: 'relative',
                        display: 'inline-flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        border: (theme) => `solid 1px ${theme.palette.divider}`,
                    }}
                >
                    {processing &&
                        <Box sx={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}>
                            <CircularProgress variant="determinate" value={imageProcessingProgress} color="primary" />
                        </Box>
                    }

                    {images.length === 0 ?
                        <>
                            <Box
                                component="span"
                                sx={{
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                            >
                                <Iconify
                                    icon={'vscode-icons:file-type-image'}
                                    sx={{ fontSize: 64, }}
                                />
                            </Box>
                        </>
                        :
                        <Image
                            alt="preview"
                            src={
                                images[0]?.Data
                                    ? `${images[0]?.Data}`
                                    : `${QC_ATTACHEMENTS_HOST_API}/${images[0]?.Guid}`
                            }
                            numberImage={images.length - 1}
                            ratio="1/1"
                        />

                    }
                </Box>
            </Box>


            {
                images.length > 0 &&
                <LightboxModal
                    images={imagesLightbox}
                    mainSrc={imagesLightbox[selectedImage]}
                    photoIndex={selectedImage}
                    setPhotoIndex={setSelectedImage}
                    isOpen={openLightbox}
                    onCloseRequest={() => setOpenLightbox(false)}
                />
            }

            <MenuPopover
                open={Boolean(popupOpen)}
                anchorEl={popupOpen}
                onClose={handleClose}
                sx={{
                    p: 0,
                    mt: 1.5,
                    ml: 0.75,
                    '& .MuiMenuItem-root': {
                        typography: 'body2',
                        borderRadius: 0.75,
                    },
                }
                }
            >
                <Stack sx={{ p: 1 }}>
                    {MENU_OPTIONS.map((option) => (
                        <MenuItem key={option.label} onClick={() => handleClickItem(option)} disabled={option.disabled}>
                            <Stack direction={'row'} spacing={2} justifyContent={'center'} alignItems={'center'}>
                                <Iconify icon={option.icon} sx={{ fontSize: 20 }} />
                                <Typography> {option.label}</Typography>
                            </Stack>
                        </MenuItem>
                    ))}
                </Stack>

            </MenuPopover >

        </>
    )

}
