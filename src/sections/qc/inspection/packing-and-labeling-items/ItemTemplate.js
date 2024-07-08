// Capacitor
import { Camera, CameraDirection, CameraResultType, CameraSource, } from "@capacitor/camera";
import { Capacitor } from "@capacitor/core";
import { FilePicker as CapacitorFilePicker } from '@capawesome/capacitor-file-picker';
import { Box, CircularProgress, Grid, MenuItem, Stack, Typography } from '@mui/material';
import { decode } from "base64-arraybuffer";
import moment from "moment";
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
// import { useLiveQuery } from "dexie-react-hooks";
// config
import { QC_ATTACHEMENTS_HOST_API } from "../../../../config";
import { attachmentsDB, db } from '../../../../Db';
// components
import Iconify from "../../../../components/Iconify";
import MenuPopover from "../../../../components/MenuPopover";
import Image from '../components/Image';
import LightboxModal from "../components/LightboxModal";
import PopUpContents from './PopupContents';
// hooks
// import { UploadIllustration } from '../../../../assets';
import useLocales from '../../../../hooks/useLocales';
// ultil
import { saveAttachment } from "../../../../utils/handleDbAttachment";
import IconName from "../../../../utils/iconsName";
import processArray from "../../../../utils/processArray";
import uuidv4 from "../../../../utils/uuidv4";
// redux
import { setMinnId } from "../../../../redux/slices/qc";
import { dispatch, useSelector } from "../../../../redux/store";


// -------------------------------------------------------


const mergeBase64 = (store, db,) => {
    if (store.length === 0) {
        return []
    }
    return store.map(d => {
        if (d.Id > 0) {
            return {
                ...d,
                URL: `${QC_ATTACHEMENTS_HOST_API}/${d?.Guid}`,
                hasBase64: false,
            }
        }
        return {
            ...d,
            Data: db.find(v => Math.abs(v.Id) === Math.abs(d.Id))?.Data || null,
            hasBase64: true,
        }

    })
};


ItemTemplate.propTypes = {
    dataSource: PropTypes.array,
    isViewOnly: PropTypes.bool,
    currentInspection: PropTypes.object,
    packingMethodEnum: PropTypes.any,
    data: PropTypes.object,
};


function ItemTemplate({ data, isViewOnly, currentInspection, packingMethodEnum, dataSource = [] }) {


    // dexie js
    // const images = useLiveQuery(() => attachmentsDB.qc.where('MasterId').equals(currentInspection.Id).and((record) => record.ParentGuid === data.Guid).toArray(), []) || []

    // redux
    const { minId } = useSelector(store => store.qc)

    // compoenents states
    const [modalContent, setModalContent] = useState({
        visible: false,
        item: null,
        isAddNew: false,
    });
    const [openLightbox, setOpenLightbox] = useState(false);
    const [selectedImage, setSelectedImage] = useState(0);
    const [imagesLightbox, setImageLightBox] = useState([]);
    const [popupOpen, setOpen] = useState(null);
    const [images, setImages] = useState([]);
    const [progress, setProgress] = useState({ current: 0, total: 0 });
    const [processing, setProcessing] = useState(false);

    useEffect(() => {

        const subcribe = async () => {
            if (isViewOnly) {
                setImages(data?.Images);
            } else {
                if (data?.Images.length > 0) {
                    const results = await attachmentsDB.qc.where('MasterId').equals(currentInspection.Id).and((record) => record.ParentGuid === data.Guid).toArray();
                    const items = mergeBase64(data?.Images, results);
                    setImages(items);
                } else {
                    setImages([]);
                };
            }
        }

        subcribe();

        return () => {
            subcribe()
            setProcessing(false);
            setProgress({ current: 0, total: 0 });
        }

        // }, [dataSource, data.Images, currentInspection.PackingAndLabelings, setImages, modalContent.visible]);
    }, [isViewOnly]);

    const handleOpen = (event) => {
        setOpen(event.target);
    };

    const handleClose = () => {
        setOpen(null);
    };

    // OPEN MODAL EDIT DEFECT
    const handleSetModalItem = () => {
        const modalItem = { ...data, Images: images };
        setModalContent({ ...modalContent.isAddNew, visible: true, item: modalItem });
    };


    // ON DROP SEQUENCE
    const onDrop = async (acceptedFiles) => {
        // Do something with the files
        try {
            if (!acceptedFiles) return;
            setProcessing(true)
            setProgress(pre => ({ ...pre, total: acceptedFiles.length }));
            const Images = images || [];
            const sortOrder = Images.map((d) => d.SortOrder);
            const MaxOrder = sortOrder.length > 0 ? Math.max(...sortOrder) : 0;
            let insertId;
            // reduce file size before store to values
            const imageResizeBase64 = await processArray(acceptedFiles, setProgress);
            // console.log(imageResizeBase64);

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
                            ParentGuid: data.Guid,
                            Data: file.base64 || null,
                            Description: '',
                            Active: true,
                            SortOrder: index + 1 + MaxOrder,
                            Action: 'Insert',
                            MasterId: currentInspection.Id,
                            Guid: uuidv4(),
                        };
                    }),
                ...Images,
            ];

            // console.log(changeImages);
            await saveAttachment(attachmentsDB.qc, changeImages, currentInspection.Id);

            await db.MqcInspection.get(currentInspection.id).then(async res => {
                // console.log(res);
                await db.MqcInspection.where('id')
                    .equals(currentInspection.id)
                    .modify((x, ref) => {
                        const newPackingAndLabelings = res.PackingAndLabelings.map((pnl) => {
                            if (pnl?.Id === data?.Id) {
                                return {
                                    ...data,
                                    Images: changeImages.map(d => ({ ...d, Data: null }))
                                };
                            }
                            return pnl;
                        });
                        x.PackingAndLabelings = newPackingAndLabelings
                    });
            });

            setImages(changeImages)
            setProcessing(false);
            setProgress({ current: 0, total: 0 })
        } catch (err) {
            console.error('Image upload failed!');
            setProcessing(false);
            setProgress({ current: 0, total: 0 })
        }
    };

    const {
        //  getRootProps, getInputProps, isDragActive, isDragReject,
        open } = useDropzone({
            onDrop,
            accept: 'image/*',
            disabled: isViewOnly,
            // Disable click and keydown behavior
            noClick: true,
            noKeyboard: true,
            useFsAccessApi: true,
        });

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
        }
    };

    const PackingMethodLineCaption = (packingMethodEnum || []).find(d => d.Value === data.PackingMethodId)?.Caption || 'N/A';


    // Open image editor
    const onOpenImageLightBox = () => {
        // SOURCE FOR IMAGE LIGHTBOX
        const imagesPreview =
            images.length > 0
                ? images.filter((d) => {
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
        setOpenLightbox(true);
        setSelectedImage(0);
        setImageLightBox(imagesPreview);
    };

    const isStepCompleted = currentInspection?.Status?.PackingAndLabeling || false;
    const imageProcessingProgress = Math.round(progress.current / progress.total * 100);
    const renderImage = images.filter((value) => value?.Action !== 'Delete');


    // console.log(images, renderImage);

    return (
        <Stack
            sx={{
                position: 'relative',
                padding: 0,
                margin: 0,
                minHeight: 80,
                draggable: false,
                borderBottomColor: (theme) => theme.palette.grey[300],
                borderBottomWidth: 0.1,
            }}
        >
            <Grid container spacing={2} sx={{ p: 1 }} justifyContent={'center'} alignItems={'center'}>
                <Grid item xs={9} md={10}>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                            minHeight: 80,
                            width: '100%',
                        }}
                        component={'button'}
                        // onClick={() => handleSetModalItem(data)}
                        onClick={() => handleSetModalItem()}
                    >
                        <Typography
                            variant="button"
                            paragraph
                            sx={{ wordBreak: 'break-word', margin: 0 }}
                            display={'inline'}
                            whiteSpace={'normal'}
                            width={'100%'}
                            height={'100%'}
                            textAlign={'left'}
                        >
                            {`${data?.Title} `}
                            {data?.IsRequired && (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="8"
                                    height="8"
                                    viewBox="0 0 16 16"
                                    style={{ display: 'inline-block' }}
                                >
                                    <path
                                        fill="red"
                                        d="M8 0a1 1 0 0 1 1 1v5.268l4.562-2.634a1 1 0 1 1 1 1.732L10 8l4.562 2.634a1 1 0 1 1-1 1.732L9 9.732V15a1 1 0 1 1-2 0V9.732l-4.562 2.634a1 1 0 1 1-1-1.732L6 8L1.438 5.366a1 1 0 0 1 1-1.732L7 6.268V1a1 1 0 0 1 1-1z"
                                    />
                                </svg>
                            )}
                        </Typography>

                    </Box>
                </Grid>

                <Grid sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', }} item xs={3} md={2}>

                    <Box
                        onClick={(e) => handleOpen(e)}
                        component={'button'}
                        sx={{
                            p: 0,
                            width: 80,
                            height: 80,
                            borderRadius: 1.25,
                            overflow: 'hidden',
                            position: 'relative',
                            display: 'inline-flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            border: (theme) => `solid 1px ${theme.palette.divider}`,
                        }}
                    >
                        <Box
                            // {...getRootProps()}
                            sx={{
                                p: 0,
                                width: 80,
                                height: 80,
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

                            {renderImage.length === 0 ?
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
                                            sx={{ fontSize: 64, mb: 2 }}
                                        />
                                    </Box>
                                </>
                                :
                                <RenderImage images={renderImage} />
                            }
                        </Box>
                        <Box sx={{
                            zIndex: 10,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            width: '100%',
                            backgroundColor: '#0606074d',
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                        }}>
                            <Typography color='white' variant="caption">{PackingMethodLineCaption}</Typography>
                        </Box>
                    </Box>

                </Grid>
            </Grid>

            {
                renderImage.length > 0 &&
                <LightboxModal
                    images={imagesLightbox}
                    mainSrc={imagesLightbox[selectedImage]}
                    photoIndex={selectedImage}
                    setPhotoIndex={setSelectedImage}
                    isOpen={openLightbox}
                    onCloseRequest={() => setOpenLightbox(false)}
                />
            }

            {
                modalContent.visible ? (
                    <PopUpContents
                        modalContent={modalContent}
                        setModalContent={setModalContent}
                        currentInspection={currentInspection}
                        isViewOnly={isViewOnly}
                        dataSource={dataSource}
                        setImages={setImages}
                    />
                ) : null
            }

            <FilePicker
                handleClose={handleClose}
                popupOpen={popupOpen}
                onDrop={onDrop}
                handleTakePhoto={handleTakePhoto}
                onOpenImageLightBox={onOpenImageLightBox}
                images={images}
                fileOpen={open}
                isViewOnly={isViewOnly}
                isStepCompleted={isStepCompleted}
            />

        </Stack >
    )
};

export default ItemTemplate;


FilePicker.propTypes = {
    popupOpen: PropTypes.any,
    handleClose: PropTypes.func,
    onDrop: PropTypes.func,
    handleTakePhoto: PropTypes.func,
    onOpenImageLightBox: PropTypes.func,
    images: PropTypes.array,
    // fileOpen: PropTypes.bool,
    isViewOnly: PropTypes.bool,
    isStepCompleted: PropTypes.bool,
};

function FilePicker({
    popupOpen,
    handleClose,
    onDrop,
    handleTakePhoto,
    onOpenImageLightBox,
    images,
    // fileOpen,
    isViewOnly,
    isStepCompleted,
}) {

    const { currentLang } = useLocales();
    const isWebApp = Capacitor.getPlatform() === 'web';

    const MENU_OPTIONS = [
        {
            label: currentLang.value !== 'vn' ? 'Take photo' : "Chụp ảnh",
            value: 'takePhoto',
            icon: IconName.camera,
            disabled: isWebApp || isViewOnly || isStepCompleted,
        },
        {
            label: currentLang.value !== 'vn' ? 'Pick Image' : "Chọn ảnh",
            value: 'getPhoto',
            icon: IconName.folder,
            disabled: isViewOnly || isStepCompleted,
        },
        {
            label: currentLang.value !== 'vn' ? 'View Image' : "Xem ảnh",
            value: 'viewPhoto',
            icon: IconName.view,
            disabled: images.filter((value) => value?.Action !== 'Delete').length === 0,
        }
    ];

    const handleClickItem = (option) => {
        if (option.value === "takePhoto") {
            handleTakePhoto();
            handleClose();
        }
        if (option.value === "getPhoto") {
            if (isWebApp) {
                openFileOrFiles(true)
            } else {
                capacitorImagePicker()
            }
            // fileOpen()
            handleClose();
        }
        if (option.value === "viewPhoto") {
            onOpenImageLightBox();
            handleClose();
        }
    };

    const openFileOrFiles = async (multiple = true) => {

        // Feature detection. The API needs to be supported
        // and the app not run in an iframe.

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

    };

    const capacitorImagePicker = async () => {
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
        // const { photos } = await Camera.pickImages({
        //     quality: 100,
        //     presentationStyle: 'fullscreen',
        // });

        // RESULT FROM THE WEB
        // {
        //     photos:
        //     [
        //         {
        //             "webPath": "blob:http://localhost:5053/591dfe67-75a9-46f1-9b8d-c2c1ff94ed44",
        //             "format": "png"
        //         },
        //     ]
        // }

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
    }

    return (<MenuPopover
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
                    <Stack direction={'row'} spacing={1} justifyContent={'center'} alignItems={'center'}>
                        <Iconify icon={option.icon} sx={{ fontSize: 20 }} />
                        <Typography> {option.label}</Typography>
                    </Stack>
                </MenuItem>
            ))}
        </Stack>

    </MenuPopover >)
}

const RenderImage = ({ images }) => {
    const hasBase64 = images.find(d => d.hasBase64 || d.Data !== null);

    if (hasBase64) {
        return (
            <Image
                alt="preview"
                src={images.find(d => d.Data !== null)?.Data}
                numberImage={images?.length - 1}
                ratio="1/1"
            />
        )
    }

    return (
        <Image
            alt="preview"
            src={`${QC_ATTACHEMENTS_HOST_API}/${images[0].Guid}`}
            numberImage={images?.length - 1}
            ratio="1/1"
        />
    )
}