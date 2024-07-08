import { yupResolver } from '@hookform/resolvers/yup';
import { LoadingButton } from '@mui/lab';
import {
    Alert,
    Autocomplete,
    Box,
    Card,
    Grid,
    Stack,
    TextField,
    Typography,
    useTheme,
} from '@mui/material';
import { Popup } from 'devextreme-react';
import ScrollView from 'devextreme-react/scroll-view';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import useDetectKeyboardOpen from "use-detect-keyboard-open";
import * as Yup from 'yup';

import { FormProvider, RHFTextField } from '../../../../components/hook-form/index';
// COMPONENTS
import { attachmentsDB, db } from '../../../../Db';
import LoadingBackDrop from '../../../../components/BackDrop';
import Iconify from '../../../../components/Iconify';
import PopupConfirm from '../../../../components/PopupConfirm';
import { deleteAttachment, saveAttachment } from '../../../../utils/handleDbAttachment';
import InspectionImagesUpload from './ImagesUpload';
// hooks
import useLocales from '../../../../hooks/useLocales';
import useResponsive from '../../../../hooks/useResponsive';
// Util
import IconName from '../../../../utils/iconsName';
import uuidv4 from '../../../../utils/uuidv4';
import ImproveImagesUpload from './ImproveImagesUpload';



const requiredField = [
    {
        field: 'DefectCategoryId',
        label: 'Category',
    },
    {
        field: 'DefectAreaId',
        label: 'Area',
    },
    {
        field: 'DefectDataId',
        label: 'Defect',
    },
    {
        field: 'Major',
        label: 'Major',
    },
    {
        field: 'Minor',
        label: 'Minor',
    },
    {
        field: 'Critical',
        label: 'Critical',
    },
];

const popUpOptions = {
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
};


PopUpContents.propTypes = {
    modalContent: PropTypes.any,
    setModalContent: PropTypes.func,
    currentInspection: PropTypes.object,
    EnumDefect: PropTypes.array,
    isViewOnly: PropTypes.bool,
    setListItem: PropTypes.func,
};


// POPUP SET DETAIL INSPECTION
function PopUpContents({
    modalContent,
    setModalContent,
    currentInspection,
    EnumDefect,
    isViewOnly,
    setListItem,
}) {


    // HOOKS

    const theme = useTheme();
    const { enqueueSnackbar } = useSnackbar();
    const { translate } = useLocales();
    const mdUp = useResponsive('up', 'md');
    const isKeyboardOpen = useDetectKeyboardOpen();

    const defaultValues = useMemo(
        () =>
            modalContent.isAddNew ? {
                Images: [],
                Id: '',
                DefectCategoryId: '',
                DefectCategory: '',
                DefectDataId: '',
                DefectData: '',
                DefectAreaId: '',
                DefectArea: '',
                Major: 0,
                Minor: 0,
                Critical: 0,
                Remark: '',
                Guid: uuidv4(),
                AfterGuid: uuidv4(),
            } : {
                ...modalContent.item,
                AfterGuid: modalContent.item?.AfterGuid === undefined || modalContent.item?.AfterGuid === null || modalContent.item?.AfterGuid === "" ? uuidv4() : modalContent?.item?.AfterGuid,
            }
        ,
        [currentInspection, modalContent]
    );

    const stepScheme = Yup.object().shape({
        Images: Yup.array().min(1).required(`Image ${translate('formValidate.isRequired')}`),
        DefectCategoryId: Yup.string().required(`Category ${translate('formValidate.isRequired')}`),
        DefectAreaId: Yup.string().required(`Area ${translate('formValidate.isRequired')}`),
        DefectDataId: Yup.string().required(`Defect ${translate('formValidate.isRequired')}`),
        Major: Yup.number()
            .required()
            .min(0, `Major ${translate('formValidate.moreThanOrEqualTo')}`)
            .transform((curr, orig) => (orig === '' ? 0 : Number(curr))),
        Minor: Yup.number()
            .required()
            .min(0, `Minor ${translate('formValidate.moreThanOrEqualTo')}`)
            .transform((curr, orig) => (orig === '' ? 0 : Number(curr))),
        Critical: Yup.number()
            .required()
            .min(0, `Critical ${translate('formValidate.moreThanOrEqualTo')}`)
            .transform((curr, orig) => (orig === '' ? 0 : Number(curr))),
    });

    const methods = useForm({
        resolver: yupResolver(stepScheme),
        defaultValues,
    });

    const {
        watch,
        setValue,
        handleSubmit,
        setError,
        reset, clearErrors,
        formState: { errors, isSubmitting, isValid, },
    } = methods;

    const values = watch();


    // COMPONENTS STATE
    const [deleteModal, setDeleteModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0 });
    const [itemInspection, setItemInspection] = useState([])

    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            const scrolElement = document.getElementById(Object.keys(errors)[0]);
            if (scrolElement) {
                scrolElement.scrollIntoView({ behavior: 'smooth' });
            }
        }
        return () => {
            setProgress({ current: 0, total: 0 });
        }
    }, [errors]);

    useEffect(() => {
        if (values.Major > 0 || values.Minor > 0 || values.Critical > 0) {
            clearErrors("Major");
            clearErrors("Minor");
            clearErrors("Critical");
            clearErrors("AQL");
        };
    }, [values.Major, values.Minor, values.Critical]);

    useEffect(() => {
        const subcribe = async () => {
            const item = await db.MqcInspection.get({ Id: currentInspection?.Id });
            if (item) {
                const inspections = [...item?.Inspections];
                setItemInspection(inspections);
            };
        };
        subcribe();
        return () => {
            subcribe();
        }
    }, [currentInspection?.Inspections]);


    // DROPDOWN SOURCE
    const AreaOptions = EnumDefect.find((d) => d.Id === values?.DefectCategoryId)?.DefectAreas || [];
    const DefectOptions = AreaOptions.find((d) => d.Id === values?.DefectAreaId)?.DefectDatas || [];

    // CLOSE MODAL
    const onClose = () => {
        setModalContent({ visible: false, item: null, isAddNew: false });
        setValue('Images', []);
        reset();
    };

    const handleSaveOnly = async () => {
        try {
            // const inspections = [...currentInspection.Inspections];
            const item = await db.MqcInspection.get({ Id: currentInspection.Id });
            const inspections = [...item.Inspections];

            let Errors = [];
            requiredField.forEach((field) => {
                if (field.field === 'Major' || field.field === 'Minor' || field.field === 'Critical') {
                    if (Number(values.Major) <= 0 && Number(values.Minor) <= 0 && Number(values.Critical <= 0)) {
                        setError('AQL', {
                            type: 'focus',
                            message: 'Giữa Major, Minor, Critical Phải có một số lớn hơn 0',
                        });
                        Errors = [...Errors, field];
                    }
                } else {
                    // eslint-disable-next-line
                    if (values[field.field] === null || values[field.field] === undefined || values[field.field] === '') {
                        Errors = [...Errors, field];
                    }
                }
            });

            if (Errors.length > 0) {
                Errors.forEach((d) => {
                    setError(d.label, { type: 'focus', message: `${d.label} is required` }, { shouldFocus: true });
                });
                return;
            }

            setLoading(true);
            // If No error
            const Major = values.Major === '' ? 0 : Number(values.Major);
            const Minor = values.Minor === '' ? 0 : Number(values.Minor);
            const Critical = values.Critical === '' ? 0 : Number(values.Critical);


            const itemExist = inspections.find(d => d.Id === values.Id);

            // if (values?.Id === "") {
            if (!itemExist) {

                // create new negative id for new defect line;
                const allIds = inspections.map((d) => d.Id);
                const minId = Math.min(...allIds);
                let insertId;
                if (minId >= 0) {
                    insertId = -1;
                } else {
                    insertId = minId - 1;
                }
                await saveAttachment(attachmentsDB.qc, values.Images.filter(d => d.Id < 0 && d.Action !== null), currentInspection.Id);
                const deleteBase64 = values.Images.map(d => ({ ...d, Data: null }))
                await db.MqcInspection.where('Id')
                    .equals(currentInspection.Id)
                    .modify((x, ref) => {
                        ref.value.Inspections = [...inspections, { ...values, Id: insertId, Major, Minor, Critical, Images: deleteBase64 }];
                    });
                enqueueSnackbar(translate('message.addSuccess'), {
                    variant: 'success',
                    anchorOrigin: {
                        vertical: 'top',
                        horizontal: 'center',
                    },
                });

                // add new item to list itesm
                setListItem((pre) => [...pre, { ...values, Id: insertId, Major, Minor, Critical, Images: deleteBase64 }])
                setLoading(false);

            } else {
                const itemIndex = inspections.findIndex((d) => String(d.Id) === String(values.Id));
                await saveAttachment(attachmentsDB.qc, values.Images.filter(d => d.Id < 0 && d.Action !== null), currentInspection.Id);
                const deleteBase64 = values.Images.map(d => ({ ...d, Data: null }))
                inspections[itemIndex] = { ...values, Major, Minor, Critical, Images: deleteBase64 };
                await db.MqcInspection.where('Id')
                    .equals(currentInspection.Id)
                    .modify((x, ref) => {
                        // console.log('default', x, ref);
                        ref.value.Inspections = inspections;
                    });

                // update list items
                setListItem((pre) =>
                    pre.map(d => {
                        if (d.Id === modalContent?.item?.Id) {
                            return values
                        }
                        return d
                    }))
                setLoading(false);
            }
            onClose();

        } catch (error) {
            console.error(error);
            enqueueSnackbar(JSON.stringify(error), {
                variant: 'error',
                anchorOrigin: {
                    vertical: 'top',
                    horizontal: 'center',
                },
            });
            setLoading(false);
        }
    }

    // SAVE OR ADD DEFECT
    const handleSave = async (data, event) => {
        // Determine which button was clicked
        console.log('Submit Button', data, event);
        const buttonClicked = event.nativeEvent.submitter;
        if (buttonClicked.name === 'handleSaveOnly') {
            // Handle submitButton1 click
            console.log('Submit Button 1 clicked');
            handleSaveOnly()
        } else if (buttonClicked.name === 'handleSaveAndNext') {
            // Handle submitButton2 click
            console.log('Submit Button 2 clicked');
            handleSaveAndNext()
        };
    };

    // DELETE DEFECT
    const handleDeleteDefect = async () => {
        try {
            if (values.Id > 0) {
                const defectLine = { ...values };
                defectLine.IsDeleted = true;
                await db.MqcInspection.where('Id')
                    .equals(currentInspection.Id)
                    .modify((x, ref) => {
                        ref.value.Inspections = ref.value.Inspections.map(d => {
                            if (d.Id === values.Id) {
                                return defectLine
                            }
                            return d
                        });
                    });
                setListItem((pre) => pre.map(d => {
                    if (d.Id === values.Id) {
                        return defectLine
                    }
                    return d
                }))

            } else {
                await deleteAttachment(attachmentsDB.qc, values.Images, currentInspection.Id)
                const inspections = currentInspection.Inspections.filter((d) => d.Id !== values.Id);
                await db.MqcInspection.where('Id')
                    .equals(currentInspection.Id)
                    .modify((x, ref) => {
                        ref.value.Inspections = inspections;
                    });
                setListItem((pre) => pre.filter(d => d.Id !== modalContent.item.Id))
            }

            enqueueSnackbar(translate('message.deleteSuccess'), {
                variant: 'success',
                anchorOrigin: {
                    vertical: 'top',
                    horizontal: 'center',
                },
            });

            onClose();

        } catch (error) {
            console.error(error);
            enqueueSnackbar(JSON.stringify(error), {
                variant: 'error',
                anchorOrigin: {
                    vertical: 'top',
                    horizontal: 'center',
                },
            });
        }
    };

    const renderErrorMessage = () => {
        const errorFields = requiredField.filter(d => errors[d.field] !== undefined && !["Major", "Minor", "Critical"].includes(d.field)).map(d => d.label).join(", ");
        return errorFields
    };

    const errorMessage = renderErrorMessage();

    const handleSaveBeforeNext = async () => {
        let message = ''
        try {
            // const inspections = [...currentInspection.Inspections];
            const item = await db.MqcInspection.get({ Id: currentInspection.Id });
            const inspections = [...item.Inspections];

            let Errors = [];
            requiredField.forEach((field) => {
                if (field.field === 'Major' || field.field === 'Minor' || field.field === 'Critical') {
                    if (Number(values.Major) <= 0 && Number(values.Minor) <= 0 && Number(values.Critical <= 0)) {
                        setError('AQL', {
                            type: 'focus',
                            message: 'Giữa Major, Minor, Critical Phải có một số lớn hơn 0',
                        });
                        Errors = [...Errors, field];
                    }
                } else {
                    // eslint-disable-next-line
                    if (values[field.field] === null || values[field.field] === undefined || values[field.field] === '') {
                        Errors = [...Errors, field];
                    }
                }
            });

            if (Errors.length > 0) {
                Errors.forEach((d) => {
                    setError(d.label, { type: 'focus', message: `${d.label} is required` }, { shouldFocus: true });
                });
                message = 'error';
                return message;
            }

            setLoading(true);
            // If No error
            const Major = values.Major === '' ? 0 : Number(values.Major);
            const Minor = values.Minor === '' ? 0 : Number(values.Minor);
            const Critical = values.Critical === '' ? 0 : Number(values.Critical);

            const itemExist = inspections.find(d => d.Id === values.Id);
            // if (values?.Id === "") {
            if (!itemExist) {
                // create new negative id for new defect line;
                const allIds = inspections.map((d) => d.Id);
                const minId = Math.min(...allIds);
                let insertId;
                if (minId >= 0) {
                    insertId = -1;
                } else {
                    insertId = minId - 1;
                }
                await saveAttachment(attachmentsDB.qc, values.Images.filter(d => d.Id < 0 && d.Action !== null), currentInspection.Id);
                const deleteBase64 = values.Images.map(d => ({ ...d, Data: null }))
                await db.MqcInspection.where('Id')
                    .equals(currentInspection.Id)
                    .modify((x, ref) => {
                        ref.value.Inspections = [...inspections, { ...values, Id: insertId, Major, Minor, Critical, Images: deleteBase64 }];
                    });

                // add new item to list itesm
                setListItem((pre) => [...pre, { ...values, Id: insertId, Major, Minor, Critical, Images: deleteBase64 }])
                setLoading(false);

            } else {
                const itemIndex = inspections.findIndex((d) => String(d.Id) === String(values.Id));
                await saveAttachment(attachmentsDB.qc, values.Images.filter(d => d.Id < 0 && d.Action !== null), currentInspection.Id);
                const deleteBase64 = values.Images.map(d => ({ ...d, Data: null }))
                inspections[itemIndex] = { ...values, Major, Minor, Critical, Images: deleteBase64 };
                await db.MqcInspection.where('Id')
                    .equals(currentInspection.Id)
                    .modify((x, ref) => {
                        // console.log('default', x, ref);
                        ref.value.Inspections = inspections;
                    });

                // update list items
                setListItem((pre) =>
                    pre.map(d => {
                        if (d.Id === modalContent?.item?.Id) {
                            return values
                        }
                        return d
                    }))
                setLoading(false);
            }

            return message;

        } catch (error) {
            console.error(error);
            enqueueSnackbar(JSON.stringify(error), {
                variant: 'error',
                anchorOrigin: {
                    vertical: 'top',
                    horizontal: 'center',
                },
            });
            setLoading(false);
            message = JSON.stringify(error);
            return message;
        }
    };

    // SAVE AND NEXT
    const handleSaveAndNext = async () => {
        try {
            // save current defect line before create new one
            const result = await handleSaveBeforeNext();
            console.log('save and next', result);
            if (result !== '') return
            // const inspections = [...currentInspection.Inspections];
            const item = await db.MqcInspection.get({ Id: currentInspection.Id });
            const inspections = [...item.Inspections];
            // create new defectline id for new defect line;
            const allIds = inspections.map((d) => d.Id);
            const minId = Math.min(...allIds);
            let insertId;
            if (minId >= 0) {
                insertId = -1;
            } else {
                insertId = minId - 1;
            }

            // re-asign  new defect lines;
            const newDefectLine = {
                Images: [],
                Id: insertId,
                DefectCategoryId: values.DefectCategoryId,
                DefectCategory: values.DefectCategory,
                DefectDataId: values.DefectDataId,
                DefectData: values.DefectData,
                DefectAreaId: values.DefectAreaId,
                DefectArea: values.DefectArea,
                Major: 0,
                Minor: 0,
                Critical: 0,
                Remark: '',
                Guid: uuidv4(),
                AfterGuid: uuidv4(),
            };

            // update popup state
            Object.keys(newDefectLine).forEach(key => {
                setValue(key, newDefectLine[key])
            });
            // update index db
            // await db.MqcInspection.where('Id')
            //     .equals(currentInspection.Id)
            //     .modify((x, ref) => {
            //         ref.value.Inspections = [...inspections, newDefectLine];
            //     });

            // update list item
            // setListItem((pre) => [...pre, newDefectLine]);
            // close loading back drop
            setLoading(false);
            enqueueSnackbar(translate('message.saveAndNextSuccess'));

        } catch (error) {
            console.error(error);
            const errorString = JSON.stringify(error);
            enqueueSnackbar(errorString, {
                variant: 'error',
                anchorOrigin: {
                    vertical: 'top',
                    horizontal: 'center',
                },
            });
        }

    }

    const onChangeCategory = (event, newValue) => {
        setValue('DefectCategoryId', newValue.Id);
        setValue('DefectCategory', newValue.Name);
        setValue('DefectAreaId', '');
        setValue('DefectArea', '');
        setValue('DefectDataId', '');
        setValue('DefectData', '');
        delete errors.DefectCategoryId;
        delete errors.DefectAreaId;
        delete errors.DefectDataId;
    };

    const onChangeArea = (event, newValue) => {
        setValue('DefectAreaId', newValue.Id);
        setValue('DefectArea', newValue.Name);
        setValue('DefectDataId', '');
        setValue('DefectData', '');
        delete errors.DefectAreaId;
        delete errors.DefectDataId;
    };

    const onChangeDefectData = (event, newValue) => {
        setValue('DefectDataId', newValue.Id);
        setValue('DefectData', newValue.Name);
        if (errors.DefectDataId) {
            delete errors.DefectDataId;
        };
    };

    const itemInsExist = itemInspection.find(d => d.Id === values?.Id);

    // console.log(values);

    return (
        <Popup
            visible={modalContent.visible}
            onHiding={onClose}
            dragEnabled={false}
            hideOnOutsideClick
            showCloseButton
            showTitle
            title="3. Inspection Detail"
            width={mdUp ? 700 : '100%'}
            height={mdUp ? '90%' : '100%'}
            animation={popUpOptions}
        >
            <FormProvider methods={methods} onSubmit={handleSubmit(handleSave)}>
                <ScrollView id="list-item" style={{ paddingBottom: 8, paddingTop: 8, height: '83vh' }} width="100%">
                    <Stack spacing={3} sx={{ paddingBottom: 20 }}>
                        <Card
                            sx={{
                                px: 1,
                                py: 2,
                            }}
                        >
                            <InspectionImagesUpload
                                translate={translate}
                                methods={methods}
                                currentInspection={currentInspection}
                                isViewOnly={isViewOnly || currentInspection?.IsImproved}
                                setLoading={setLoading}
                                loading={loading}
                                setProgress={setProgress}
                            />
                        </Card>
                        <Card
                            sx={{
                                px: 1,
                                py: 2,
                            }}
                        >
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6} id="DefectCategoryId">
                                    <Autocomplete
                                        blurOnSelect
                                        autoComplete
                                        defaultValue={EnumDefect.find((d) => d.Id === values.DefectCategoryId) || null}
                                        value={EnumDefect.find((d) => d.Id === values.DefectCategoryId) || null}
                                        onChange={(event, newValue) => onChangeCategory(event, newValue)}
                                        getOptionLabel={(type) => (type.Name === undefined ? '' : `${type?.Name}` || '')}
                                        options={
                                            EnumDefect !== undefined && !Array.isArray(EnumDefect)
                                                ? []
                                                : EnumDefect.sort((a, b) => -b.Name.localeCompare(a.Name)) || []
                                        }
                                        size="small"
                                        autoHighlight
                                        sx={{ width: '100%', minWidth: 150 }}
                                        renderInput={(params) => <RenderInput params={params} label="Category" isRequired error={errors?.DefectCategoryId !== undefined} errorMessage={errors?.DefectCategoryId} />}
                                        noOptionsText={<Typography>Search not found</Typography>}
                                        renderOption={(props, type) => {
                                            return (
                                                <Box component="li" {...props}>
                                                    {type?.Name}
                                                </Box>
                                            );
                                        }}
                                        isOptionEqualToValue={(option, value) => {
                                            return `${option.Id}` === `${value.Id}`;
                                        }}
                                        readOnly={isViewOnly || currentInspection?.Status?.Inspections || currentInspection?.IsImproved}

                                    />
                                </Grid>

                                <Grid item xs={12} md={6} id="DefectAreaId">
                                    <Autocomplete
                                        autoComplete
                                        blurOnSelect
                                        defaultValue={
                                            values.DefectAreaId === '' ? '' : AreaOptions.find((d) => d.Id === values.DefectAreaId) || null
                                        }
                                        value={
                                            values.DefectArea === '' ? '' : AreaOptions.find((d) => d.Id === values.DefectAreaId) || null
                                        }
                                        onChange={(event, newValue) => onChangeArea(event, newValue)}
                                        getOptionLabel={(type) => (type.Name === undefined ? '' : `${type?.Name}` || '')}
                                        options={
                                            AreaOptions === undefined || AreaOptions.length === 0
                                                ? []
                                                : AreaOptions.sort((a, b) => -b.Name.localeCompare(a.Name)) || []
                                        }
                                        size="small"
                                        autoHighlight
                                        sx={{ width: '100%', minWidth: 150 }}
                                        renderInput={(params) => <RenderInput params={params} label="Area" isRequired error={errors?.DefectAreaId !== undefined} errorMessage={errors?.DefectAreaId} />}
                                        noOptionsText={<Typography>Search not found</Typography>}
                                        renderOption={(props, type) => {
                                            return (
                                                <Box component="li" {...props}>
                                                    {type?.Name}
                                                </Box>
                                            );
                                        }}
                                        isOptionEqualToValue={(option, value) => {
                                            return `${option.Id}` === `${value.Id}` || false;
                                        }}
                                        readOnly={isViewOnly || currentInspection?.Status?.Inspections || currentInspection?.IsImproved}
                                    />
                                </Grid>

                                <Grid item xs={12} md={6} id="DefectDataId">
                                    <Autocomplete
                                        autoComplete
                                        blurOnSelect
                                        defaultValue={
                                            values.DefectDataId === ''
                                                ? ''
                                                : [...new Set(DefectOptions)].find((d) => d.Id === values.DefectDataId) || null
                                        }
                                        value={
                                            values.DefectData === ''
                                                ? ''
                                                : [...new Set(DefectOptions)].find((d) => d.Id === values.DefectDataId) || null
                                        }
                                        onChange={(event, newValue) => onChangeDefectData(event, newValue)}
                                        getOptionLabel={(type) => (type.Name === undefined ? '' : `${type?.Name}` || '')}
                                        options={
                                            DefectOptions === undefined || DefectOptions.length === 0
                                                ? []
                                                : [...new Set(DefectOptions)].sort((a, b) => -b.Name.localeCompare(a.Name)) || []
                                        }
                                        size="small"
                                        autoHighlight
                                        sx={{ width: '100%', minWidth: 150 }}
                                        renderInput={(params) => <RenderInput params={params} label="Defect" isRequired error={errors?.DefectDataId !== undefined} errorMessage={errors?.DefectDataId} />}
                                        noOptionsText={<Typography>Search not found</Typography>}
                                        isOptionEqualToValue={(option, value) => {
                                            // console.log(option, value);
                                            return option?.Id === value?.Id || false;
                                        }}
                                        renderOption={(props, type) => {
                                            return (
                                                <Box component="li" {...props}>
                                                    {type?.Name}
                                                </Box>
                                            );
                                        }}
                                        readOnly={isViewOnly || currentInspection?.Status?.Inspections || currentInspection?.IsImproved}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6} id="Major">
                                    <RHFTextField
                                        name="Major"
                                        size="small"
                                        label={'Major'}
                                        type="number"
                                        InputProps={{
                                            inputProps: { min: 0, inputMode: 'decimal', },
                                            readOnly: isViewOnly || currentInspection?.Status?.Inspections || currentInspection?.IsImproved
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6} id="Minor">
                                    <RHFTextField
                                        name="Minor"
                                        size="small"
                                        label={'Minor'}
                                        type="number"
                                        InputProps={{
                                            inputProps: { min: 0, inputMode: 'decimal', },
                                            readOnly: isViewOnly || currentInspection?.Status?.Inspections || currentInspection?.IsImproved
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6} id="Critical">
                                    <RHFTextField
                                        name="Critical"
                                        size="small"
                                        label={'Critical'}
                                        type="number"
                                        InputProps={{
                                            inputProps: { min: 0, inputMode: 'decimal', },
                                            readOnly: isViewOnly || currentInspection?.Status?.Inspections || currentInspection?.IsImproved
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={12} id="Remark">
                                    <RHFTextField name="Remark" size="small" label={translate('remark')} multiline rows={10} InputProps={{
                                        readOnly: isViewOnly || currentInspection?.Status?.Inspections || currentInspection?.IsImproved
                                    }} />
                                </Grid>
                                <Grid item xs={12} md={12} >
                                    {errors?.AQL && errors?.AQL?.message !== undefined && (
                                        <Alert severity="error">Error: {errors?.AQL?.message}</Alert>
                                    )}
                                    {errorMessage && (
                                        <Alert severity="error"> {errorMessage} {translate('formValidate.isRequired')}</Alert>
                                    )}
                                </Grid>

                                <Grid item xs={12} id="RootCause">
                                    <ImproveImagesUpload
                                        translate={translate}
                                        methods={methods}
                                        currentInspection={currentInspection}
                                        isViewOnly={isViewOnly}
                                        setLoading={setLoading}
                                        loading={loading}
                                        setProgress={setProgress}
                                    />
                                </Grid>
                                <Grid item xs={12} id="RootCause">
                                    <RHFTextField
                                        name="RootCause"
                                        size="small"
                                        label={'Root cause'}
                                        type="text"
                                        multiline
                                        minRows={2}
                                        maxRows={4}
                                    />
                                </Grid>
                                <Grid item xs={12} id="PreventiveAction">
                                    <RHFTextField
                                        name="PreventiveAction"
                                        size="small"
                                        label={'Preventive action'}
                                        type="text"
                                        multiline
                                        minRows={2}
                                        maxRows={4}
                                    />
                                </Grid>


                            </Grid>
                        </Card>
                    </Stack>
                </ScrollView>

                {/* // button groups */}
                <Grid
                    container
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
                        display: {
                            xs: !isKeyboardOpen ? 'flex' : 'none',
                            sm: 'flex',
                        },
                    }}
                    spacing={2}
                >

                    <Grid item xs={4} sm={4} >
                        <LoadingButton
                            variant="outlined"
                            fullWidth
                            type="submit"
                            disabled={(isViewOnly || currentInspection.IsFinished || currentInspection.Status.Inspections) && !currentInspection?.IsImproved}
                            sx={{
                                backgroundColor: theme.palette.info.main, color: 'white',
                                '&:hover': {
                                    backgroundColor: theme.palette.primary.main,
                                },
                                fontSize: 12,
                                padding: 1,
                            }}
                            focusRipple={false}
                            name="handleSaveOnly"
                        >
                            {translate('button.save')}
                        </LoadingButton>
                    </Grid>

                    {!currentInspection?.IsImproved &&
                        <Grid item xs={4} sm={4} >
                            <LoadingButton
                                variant="outlined"
                                fullWidth
                                disabled={(isViewOnly || currentInspection.IsFinished || currentInspection.Status.Inspections)}
                                sx={{
                                    backgroundColor: theme.palette.primary.main, color: 'white',
                                    '&:hover': {
                                        backgroundColor: theme.palette.primary.main,
                                    },
                                    fontSize: 12,
                                    padding: 1,
                                }}
                                type="submit"
                                focusRipple={false}
                                name="handleSaveAndNext"
                            >
                                {translate('button.saveAndNext')}
                            </LoadingButton>
                        </Grid>
                    }


                    {values.Id !== "" && itemInsExist && !currentInspection?.IsImproved &&
                        <Grid item xs={4} sm={4} >
                            <LoadingButton
                                variant="contained"
                                fullWidth
                                onClick={() => setDeleteModal(true)}
                                sx={{
                                    backgroundColor: theme.palette.error.main,
                                    '&:hover': {
                                        backgroundColor: theme.palette.error.main,
                                    },
                                    fontSize: 12,
                                    padding: 1,
                                }}
                                disabled={(isViewOnly || currentInspection.IsFinished || currentInspection.Status.Inspections)}
                                focusRipple={false}
                            >
                                {translate('button.delete')}
                            </LoadingButton>
                        </Grid>
                    }
                </Grid>

                {deleteModal ? (
                    <PopupConfirm
                        title={'Delete Defect'}
                        visible={deleteModal}
                        onClose={() => setDeleteModal(!deleteModal)}
                        onProcess={handleDeleteDefect}
                        description={translate('confirm.delete')}
                    />
                ) : null}

            </FormProvider>

            <LoadingBackDrop
                loading={loading}
                variant='determinate'
                progress={progress}
                setProgress={setProgress}
                width='100%'
                height='100%'
            />

        </Popup >
    );
};


export default PopUpContents;


RenderInput.propTypes = {
    params: PropTypes.any,
    label: PropTypes.any,
    error: PropTypes.any,
    isRequired: PropTypes.bool,
    errorMessage: PropTypes.string,
};


// Render Input
function RenderInput({ params = {}, label = "", error = null, isRequired = false, errorMessage = null }) {
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
                    {isRequired && (
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
            error={error}
            helperText={errorMessage?.message}
        />
    );
};