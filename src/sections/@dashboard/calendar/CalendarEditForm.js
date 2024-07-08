import { isBefore } from 'date-fns';
import moment from 'moment';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
// form
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
// @mui
import { LoadingButton } from '@mui/lab';
import {
    Alert, Autocomplete, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormHelperText, InputLabel, MenuItem, Select, Stack, TextField, Typography, useTheme,
    Chip
} from '@mui/material';
import { MobileDateTimePicker } from '@mui/x-date-pickers';
// components
import { FormProvider, RHFSwitch, RHFTextField, RHFUploadMultiFile } from '../../../components/hook-form';
import Iconify from '../../../components/Iconify';
import LightboxModal from '../../../components/LightboxModal';
import useAuth from '../../../hooks/useAuth';
import useLocales from '../../../hooks/useLocales';
// Redux
import { useSelector, dispatch } from '../../../redux/store';
import { deleteEventSuccess, updateEventWithIdSuccess } from '../../../redux/slices/calendar';
import axios from '../../../utils/axios';
import { getBase64 } from '../../../utils/getBase64';
import { getFileFormat } from '../../../utils/getFileFormat';
import { getImageLightBox } from '../../../utils/getImageLightBox';
import resizeFile from '../../../utils/useResizeFile';
import MsFilesPreview from './child/FilesPreview';
import LoadingBackDrop from '../../../components/BackDrop';
// ----------------------------------------------------------------------

CalendarEditForm.propTypes = {
    event: PropTypes.object,
    range: PropTypes.object,
    onCancel: PropTypes.func,
    onDeleteEvent: PropTypes.func,
    onCreateUpdateEvent: PropTypes.func,
    sysEnum: PropTypes.array,
    everyOne: PropTypes.array,
};


const REMINDER_OPTIONS1 = [
    { label: "None", value: 0 },
    { label: "5 minutes", value: 5 },
    { label: "10 minutes", value: 10 },
    { label: "15 minutes", value: 15 },
    { label: "30 minutes", value: 30 },
    { label: "1 hours", value: 60 },
    { label: "2 hours", value: 120 },
    { label: "3 hours", value: 180 },
    { label: "4 hours", value: 240 },
    { label: "5 hours", value: 300 },
    { label: "6 hours", value: 360 },
    { label: "7 hours", value: 420 },
    { label: "8 hours", value: 480 },
    { label: "9 hours", value: 540 },
    { label: "10 hours", value: 600 },
];

const REMINDER_OPTIONS2 = [
    { label: "None", value: 0 },
    { label: "1 day", value: 1 },
    { label: "2 days", value: 2 },
    { label: "3 days", value: 3 },
    { label: "4 days", value: 4 },
    { label: "5 days", value: 5 },
    { label: "6 days", value: 6 },
    { label: "7 days", value: 7 },
    { label: "8 days", value: 8 },
    { label: "9 days", value: 9 },
    { label: "10 days", value: 10 },
    { label: "11 days", value: 11 },
    { label: "12 days", value: 12 },
    { label: "13 days", value: 13 },
    { label: "14 days", value: 14 },
    { label: "15 days", value: 15 },
    { label: "16 days", value: 16 },
    { label: "17 days", value: 17 },
    { label: "18 days", value: 18 },
    { label: "19 days", value: 19 },
    { label: "20 days", value: 20 },
    { label: "21 days", value: 21 },
    { label: "22 days", value: 22 },
    { label: "23 days", value: 23 },
    { label: "24 days", value: 24 },
    { label: "25 days", value: 25 },
    { label: "26 days", value: 26 },
    { label: "27 days", value: 27 },
    { label: "28 days", value: 28 },
    { label: "29 days", value: 29 },
    { label: "30 days", value: 30 },
];

export default function CalendarEditForm({
    event,
    range,
    onCreateUpdateEvent,
    onDeleteEvent,
    onCancel,
    sysEnum,
    everyOne,
}) {

    const location = useLocation();
    const eventOptions = sysEnum.find(d => d?.Name === 'CalendarEventType')?.Elements || []
    const viewerOptions = sysEnum.find(d => d?.Name === 'CalendarSharingMode')?.Elements.map(d => {
        return {
            ...d,
        }
    }) || [];

    const eventStatusOptions = sysEnum.find(d => d?.Name === 'CalendarActivityStatus')?.Elements || [];
    const { itemDetail = undefined } = location?.state;

    const getInitialValues = (event, range, viewerOptions) => {
        const initialEvent = {
            Attachments: {
                Images: [],
                Files: [],
            },
            Title: "",
            AllDay: false,
            Description: "",
            Start: moment().add(1, 'hours').toISOString(),
            End: moment().add(2, 'hours').toISOString(),
            Location: "",
            SharingModeId: "",
            SharingMode: "",
            CIPRequireds: [],
            CIPOptionals: [],
            CIPViewOnlys: [],
            CreatedBy: "",
            CreatedDate: "",
            LastModifiedBy: "",
            LastModifiedDate: "",
            Guid: "",
            IsDeleted: false,
            MinutesReminder: 30,
            DaysReminder: 0,
            IsNotifyOnApproved: false,
            EventType: "",
            Color: "",
            EventTypeId: "",
            ActivityStatusId: "",
            ActivityStatus: "",
            IsOnceApproval: false,
            ReferId: "",
            MailValidTime: "",
            IsMailExecuted: false,
        };

        if (itemDetail !== undefined) {
            return {
                ...itemDetail,
                MinutesReminder: itemDetail?.MinutesReminder,
                DaysReminder: itemDetail?.DaysReminder,
            }
        }

        return initialEvent;
    }

    const { enqueueSnackbar } = useSnackbar();
    const { calendarDetails, isLoading, error } = useSelector((state) => state.calendar);
    // const { notification } = useSelector((state) => state.notification);
    const { user, userClaim } = useAuth();
    const { LoginUser } = useSelector(store => store.workflow)
    const theme = useTheme()
    const navigate = useNavigate();
    const { translate } = useLocales();

    const [openLightbox, setOpenLightbox] = useState(false);
    const [selectedImage, setSelectedImage] = useState(0);
    const [storeViewerOnly, setStoreViewerOnly] = useState([]);
    const [showWarning, setShowwarning] = useState({ show: false, type: null });
    const [loading, setLoading] = useState(false);

    const allowAdding = userClaim.find(d => d?.ClaimType === 'calendar' && d.ClaimValue === 'create')
    const allowDeleting = userClaim.find(d => d?.ClaimType === 'calendar' && d.ClaimValue === 'cancel')
    const defaultCreatedUser = everyOne.find(d => d.UserId === user?.UserId);


    const EventSchema = Yup.object().shape({
        Title: Yup.string().max(255).required('Title is required'),
        EventType: Yup.string().required('Event type is required').min(2, 'Event type is required'),
        SharingMode: Yup.string().required('Sharing mode type is required'),
        CIPRequireds: Yup.array().required().min(1).required('Activity must require at least one person'),
    });

    const methods = useForm({
        resolver: yupResolver(EventSchema),
        defaultValues: getInitialValues(event, range, viewerOptions),
    });

    const {
        reset,
        watch,
        control,
        handleSubmit, setValue, setError,
        formState: { isSubmitting, errors },
    } = methods;


    useEffect(() => {
        // console.log(user, defaultCreatedUser)
        if (itemDetail !== undefined && viewerOptions.length > 0) {
            setValue('SharingMode', viewerOptions.find(d => d.Value === itemDetail?.SharingModeId)?.Caption);
            setValue('MinutesReminder', itemDetail?.MinutesReminder);
            setValue('DaysReminder', itemDetail.DaysReminder);
            setValue('IsNotifyOnApproved', false);
        }
        if (itemDetail === undefined) {
            setValue('ActivityStatusId', eventStatusOptions.find(d => d.Caption === "Open")?.Value);
            setValue('ActivityStatus', eventStatusOptions.find(d => d.Caption === "Open")?.Caption);
            setValue('SharingMode', 'No More');
            setValue('SharingModeId', 69021);
            setValue('CIPRequireds', [{
                EmployeeKnowAs: user?.EmpKnowAs,
                EmployeeId: defaultCreatedUser?.EmployeeId,
                UserId: user?.UserId,
                EmpKnowAs: user?.EmpKnowAs,
            }])
            if (moment().diff(values.Start, 'days') < 1) {
                setValue('MinutesReminder', 30)
            }
        }
    }, [sysEnum, itemDetail, defaultCreatedUser]);

    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            const scrolElement = document.getElementById(Object.keys(errors)[0])
            if (scrolElement) {
                scrolElement.scrollIntoView({ behavior: 'smooth', block: 'start', })
            }
        }
    }, [errors]);

    const hasEventData = !!event;

    const values = watch();

    // HANDLE CLOSE;
    const handleClose = () => {
        navigate(-1)
    };

    // SUBMIT
    const onSubmit = async (data) => {
        try {
            // Send notify for revising events;
            if (!data.IsOnceApproval) {
                setShowwarning({ show: true, type: 'submit' });
            } else {
                handleSubmitData()
            }

        } catch (error) {
            console.error(error);
        }
    };

    // CONFIRM SUBMIT DATA;
    const handleSubmitData = async () => {
        try {
            setLoading(true)
            // remove enventType, activity status;
            const ActivityStatus = eventStatusOptions.find(d => d.Caption === 'Open');
            // const newEvent = JSON.parse(JSON.stringify(values));

            const newEvent = values;
            const postObject = {
                "Title": newEvent.Title,
                "AllDay": newEvent.AllDay,
                "Description": newEvent.Description,
                "Start": moment(newEvent.Start).format('YYYY-MM-DD HH:mm:ss'),
                "End": moment(newEvent.End).format('YYYY-MM-DD HH:mm:ss'),
                "Location": newEvent.Location,
                "SharingModeId": newEvent.SharingModeId,
                "CIPRequireds": newEvent.CIPRequireds,
                "CIPOptionals": newEvent.CIPOptionals,
                "CIPViewOnlys": newEvent.CIPViewOnlys,
                "MinutesReminder": newEvent.MinutesReminder,
                "DaysReminder": newEvent.DaysReminder,
                "IsNotifyOnApproved": newEvent.IsNotifyOnApproved,
                "EventType": newEvent.EventType,
                "Color": newEvent.Color,
                "EventTypeId": newEvent.EventTypeId,
                "ActivityStatusId": newEvent.ActivityStatusId,
                "ReferId": newEvent.ReferId,
                Id: newEvent.Id,
            };

            // delete newEvent.Attachments;
            if (itemDetail === undefined) {
                Object.assign(postObject, {
                    ActivityStatusId: ActivityStatus?.Value
                });
                delete postObject.Id
            };

            const attachments = [...values.Attachments.Images, ...values.Attachments.Files].filter(d => d.Action !== null);

            const formData = new FormData();
            formData.append('values', JSON.stringify(postObject));
            // UPDATE/CREATE EVENT
            await axios.post(`api/CalendarMobileApi/CreateUpdateCalendar`, formData).then(response => {
                // console.log(response, attachments);
                if (response) {
                    // IF HAS ATTACHMENTS
                    if (attachments.length > 0) {
                        attachments.forEach(async element => {
                            element.RecordGuid = response.data.Guid;
                            const AttFormData = new FormData();
                            AttFormData.append('values', JSON.stringify(element));
                            await axios.post(`api/CalendarMobileApi/CreateUpdateAttachment`, AttFormData).then(res => {
                                // console.log('api/CalendarMobileApi/CreateUpdateAttachment', res)
                                enqueueSnackbar(itemDetail === undefined ? 'Event created' : 'Event Updated!')
                                setShowwarning({ show: false, type: null });
                                setLoading(false);
                                navigate(-1);
                                // Update event details
                                dispatch(updateEventWithIdSuccess(values));
                            }).catch(err => {
                                setLoading(false)
                                console.error(err)
                                enqueueSnackbar(err, {
                                    variant: 'error'
                                })
                            });
                        });
                    } else {
                        // IF NO ATTACHMENTS
                        enqueueSnackbar(itemDetail === undefined ? 'Event created' : 'Event Updated!')
                        setShowwarning({ show: false, type: null });
                        setLoading(false);
                        // Update event details
                        dispatch(updateEventWithIdSuccess(values));
                        navigate(-1);

                    }
                };

            }).catch(err => {
                setLoading(false)
                console.error(err)
                enqueueSnackbar(JSON.stringify(err).slice(0, 700), {
                    variant: 'error'
                })
            });

        } catch (error) {
            console.error(error);
            enqueueSnackbar(JSON.stringify(error).slice(0, 700), {
                variant: 'error'
            })
        }
    };


    // Handle upload multi file;
    const handleDrop = async (acceptedFiles) => {
        try {
            // Can be set to the src of an image now
            const acceptedImages = acceptedFiles.filter(d => {
                const fileType = getFileFormat(d.name);
                return fileType === 'image'
            });
            const acceptedMsFiles = acceptedFiles.filter(d => {
                const fileType = getFileFormat(d.name);
                return ['excel', 'word', 'pdf'].includes(fileType);
            });
            // console.log(acceptedImages, acceptedMsFiles)
            // File fis MS Image
            if (acceptedImages.length > 0) {
                const images = [...values.Attachments.Images];
                const base64 = [...acceptedImages].map((file) => {
                    return resizeFile(file).then((data) => data);
                });
                Promise.all(base64).then((data) => {
                    setValue('Attachments.Images', [
                        ...acceptedImages.reverse().map((file, index) => {
                            return {
                                Title: null,
                                Name: file?.name.includes('image') ? `Image ${images.length + 1 + index}.jpg` : file?.name,
                                URL: null,
                                Remark: null,
                                InternalURL: null,
                                RecordGuid: "",
                                Data: data[index],
                                Action: 'Insert',
                                Id: -([...values.Attachments.Files, ...values.Attachments.Images].length + 1),
                            };
                        }),
                        ...images,
                    ]);
                });
            };

            // File fis MS files
            if (acceptedMsFiles.length > 0) {
                const files = [...values.Attachments.Files];
                const base64 = [...acceptedMsFiles].map((file) => {
                    return getBase64(file).then((data) => data);
                });
                Promise.all(base64).then((data) => {
                    setValue('Attachments.Files', [
                        ...acceptedMsFiles.reverse().map((file, index) => {
                            return {
                                Title: null,
                                Name: file?.name,
                                URL: null,
                                Remark: null,
                                InternalURL: null,
                                RecordGuid: "",
                                Data: data[index],
                                Action: 'Insert',
                                Id: -([...values.Attachments.Files, ...values.Attachments.Images].length + 1),
                            };
                        }),
                        ...files,
                    ]);
                })
            }

        } catch (err) {
            console.error(err);
            enqueueSnackbar('Fail to upload file!', {
                variant: 'error',
                anchorOrigin: {
                    vertical: 'top',
                    horizontal: 'center',
                },
            });
        }
    };


    // REMOVE ALL FILES
    const handleRemoveAll = () => {
        setValue('Attachments.Images', []);
    };

    // REMOVE SINGLE FILE
    const handleRemove = (file) => {
        const fileType = getFileFormat(file?.Name || file?.name);
        if (fileType === 'image') {
            const images = [...values.Attachments.Images];
            if (itemDetail !== undefined) {
                setValue('Attachments.Images', images.map(d => {
                    if (d?.Id === file?.Id) {
                        return {
                            ...d,
                            Action: 'Delete'
                        }
                    }
                    return d
                }));
            } else {
                const newImages = images.filter(d => d.Id !== file.Id);
                setValue('Attachments.Images', newImages);
            }

        } else {
            const files = [...values.Attachments.Files];
            if (itemDetail !== undefined) {
                setValue('Attachments.Files', files.map(d => {
                    if (d?.Id === file?.Id) {
                        return {
                            ...d,
                            Action: 'Delete'
                        }
                    }
                    return d
                }));
            }
            else {
                const newFiles = files.filter(d => d.Id !== file.Id);
                setValue('Attachments.Files', newFiles);
            }

        }
    };


    // OPEN LIGHTBOX VIEW PICTURE
    const handleClick = async (file, e) => {
        // console.log(file, e)
        const attachments = values.Attachments.Images;
        const imageIndex = attachments.findIndex((d) => {
            return d?.Id === file?.Id;
        });
        setOpenLightbox(true);
        setSelectedImage(imageIndex);
    };

    // Hanndle onViewerChange
    const handleChangeViewer = async (e) => {

        if (errors?.SharingMode) {
            delete errors.SharingMode;
        }

        setValue('SharingMode', e?.props?.children);
        setValue('SharingModeId', e?.props?.value);

        if (e?.props?.children === 'Higher Level' || e?.props?.children === 'Lower Level') {
            const stringRequiredOptionalUser = `${values.CIPRequireds.map(d => d.EmployeeId).toString()},${values.CIPOptionals.map(d => d.EmployeeId).toString()}`;
            await axios.get(`api/CalendarMobileApi/GetCalendarPaticipantsBySharingMode?sharingMode=${e?.props?.children.replaceAll(' ', '')}&currentPaticipantEmpIds=${stringRequiredOptionalUser}`).then(res => {
                const distinctEmp = res.data.filter(d => {
                    return !values.CIPRequireds.map(v => v.EmployeeId).includes(d?.EmployeeId) && !values.CIPOptionals.map(u => u.EmployeeId).includes(d?.EmployeeId)
                });
                setValue("CIPViewOnlys", distinctEmp.map(d => {
                    return {
                        ...d,
                        EmployeeKnowAs: d.EmployeeKnowAs
                    }
                }));
                setStoreViewerOnly(distinctEmp);
            });
        }

        else if (e?.props?.children === 'Everyone') {
            setValue("CIPViewOnlys", [])
        }

        else {
            await axios.get(`api/CalendarMobileApi/GetCalendarPaticipantsBySharingMode?sharingMode=${e?.props?.children.replaceAll(' ', '')}`).then(res => {
                const distinctEmp = res.data.filter(d => {
                    return !values.CIPRequireds.map(v => v.EmployeeId).includes(d?.EmployeeId) && !values.CIPOptionals.map(u => u.EmployeeId).includes(d?.EmployeeId)
                })
                setValue("CIPViewOnlys", distinctEmp.map(d => {
                    return {
                        ...d,
                        EmployeeKnowAs: d.EmployeeKnowAs
                    }
                }))
                setStoreViewerOnly(distinctEmp);
            });
        }

    };

    // CANCLE ACTIVITIES;
    const handleCancelActivity = async () => {
        try {
            const ActivityStatus = eventStatusOptions.find(d => d.Caption === 'Open');
            const newEvent = JSON.parse(JSON.stringify(values));
            const postData = {
                "Title": newEvent.Title,
                "AllDay": newEvent.AllDay,
                "Description": newEvent.Description,
                "Start": moment(newEvent.Start).format('YYYY-MM-DD HH:mm:ss'),
                "End": moment(newEvent.End).format('YYYY-MM-DD HH:mm:ss'),
                "Location": newEvent.Location,
                "SharingModeId": newEvent.SharingModeId,
                "CIPRequireds": newEvent.CIPRequireds,
                "CIPOptionals": newEvent.CIPOptionals,
                "CIPViewOnlys": newEvent.CIPViewOnlys,
                "MinutesReminder": newEvent.MinutesReminder,
                "DaysReminder": newEvent.DaysReminder,
                "IsNotifyOnApproved": newEvent.IsNotifyOnApproved,
                "EventType": newEvent.EventType,
                "Color": newEvent.Color,
                "EventTypeId": newEvent.EventTypeId,
                "ActivityStatusId": newEvent.ActivityStatusId,
                "ReferId": newEvent.ReferId,
                Id: newEvent.Id,
            };

            // delete newEvent.Attachments;
            if (itemDetail === undefined) {
                Object.assign(postData, {
                    ActivityStatusId: ActivityStatus?.Value
                });
                delete postData.Id
            }

            const formData = new FormData();
            formData.append('values', JSON.stringify(postData));
            const response = await axios.post(`api/CalendarMobileApi/CancelCalendar`, formData);
            enqueueSnackbar('Activity deleted');
            dispatch(deleteEventSuccess({ eventId: newEvent.Id }));
            navigate(-1)
        } catch (e) {
            console.error(e)
            enqueueSnackbar(e, {
                variant: 'error'
            })
        }

    };

    const isStartDateError = values.Start && moment().diff(values.Start, 'days') > 0 && itemDetail === undefined
    const isDateError =
        !values.AllDay && values.Start && values.End
            ? isBefore(new Date(values.End), new Date(values.Start))
            : false;

    const imagesLightbox = getImageLightBox(values.Attachments.Images, itemDetail === undefined ? 'Data' : 'URL');
    const ActivityStatus = eventStatusOptions.find(d => d.Value === values.ActivityStatusId)?.Caption;

    // console.log('calendar edit page',
    //     values,
    //     // user,
    //     // LoginUser,
    //     // errors,
    //     // ActivityStatus,
    //     // itemDetail,
    //     // eventOptions,
    //     // everyOne,
    //     //  storeViewerOnly,
    //     // sysEnum,
    //     // viewerOptions,
    //     //  ActivityStatus,
    // );

    return (
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={3} sx={{ py: 3, px: 1 }}>

                <RHFTextField name="Title" label="Title" placeholder='Event title' id="Title" />

                <RHFTextField name="Description" label="Description" multiline rows={3} placeholder='Describe event detail' id="Description" />

                <FormControl fullWidth variant='outlined'>
                    <InputLabel id="EventType" shrink style={{
                        color: 'var(--label)',
                        backgroundColor: 'white'
                    }} sx={{
                        '& .MuiInputLabel-root': {
                            zIndex: 10000000
                        }
                    }} variant='outlined'>Event type</InputLabel>
                    <Select
                        labelId="EventType"
                        id='select-eventType'
                        value={values?.EventTypeId}
                    >
                        {(eventOptions || []).map(_ => (
                            <MenuItem key={_?.Value} value={_?.Value}
                                onClick={() => {
                                    setValue('EventType', _.Caption);
                                    setValue('EventTypeId', _.Value);
                                    setValue('Color', _?.Color);
                                    if (errors?.EventType) {
                                        delete errors.EventType;
                                    }
                                }}
                            >
                                <Stack direction={'row'} justifyContent={'flex-start'} alignItems={'center'} spacing={1}>
                                    <Box
                                        sx={{
                                            width: 20,
                                            height: 20,
                                            display: 'flex',
                                            borderRadius: '50%',
                                            position: 'relative',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            bgcolor: 'currentColor',
                                            transition: (theme) =>
                                                theme.transitions.create('all', {
                                                    duration: theme.transitions.duration.shortest,
                                                }),
                                            color: _?.Color,
                                        }}
                                    >
                                        <Iconify icon={'eva:checkmark-fill'} />
                                    </Box>
                                    <Typography variant='body2'>{_?.Caption}</Typography>
                                </Stack>
                            </MenuItem>
                        ))}
                    </Select>
                    {errors.EventType
                        && <FormHelperText sx={{ color: 'red', }}>{'Event type is required'}</FormHelperText>}
                </FormControl>



                <RHFSwitch name="AllDay" label="All day" id="AllDay" />

                <Controller
                    name="Start"
                    control={control}
                    render={({ field }) => {
                        return (
                            <MobileDateTimePicker
                                {...field}
                                onChange={(newValue) => {
                                    field.onChange(newValue)
                                    setValue('End', moment(newValue).add(60, 'minutes'))
                                }}
                                label="Start date"
                                inputFormat="dd/MM/yyyy hh:mm a"
                                renderInput={(params) => <TextField {...params} fullWidth
                                    error={!!isStartDateError}
                                    helperText={isStartDateError && 'Start date must be future day'}
                                    InputLabelProps={{
                                        style: {
                                            color: 'var(--label)'
                                        }
                                    }}
                                />}
                                id="Start"
                            />
                        )
                    }}
                />

                <Controller
                    name="End"
                    control={control}
                    render={({ field }) => (
                        <MobileDateTimePicker
                            {...field}
                            onChange={(newValue) => {
                                // field.onChange(moment(newValue).format('YYYY-MM-DD HH:mm:ss'))
                                field.onChange(newValue)
                            }}
                            label="End date"
                            inputFormat="dd/MM/yyyy hh:mm a"
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    fullWidth
                                    error={!!isDateError}
                                    helperText={isDateError && 'End date must be later than start date'}
                                    InputLabelProps={{
                                        style: {
                                            color: 'var(--label)',
                                        }, shrink: true,
                                    }}
                                />
                            )}
                            id="End"
                        />
                    )}
                />

                <RHFTextField name="Location" label="Location" multiline rows={1} placeholder='Input event location' id="Location" />

                {everyOne.length > 0 &&
                    <>
                        <Controller
                            // name="CIPRequireds"
                            control={control}
                            render={({ field }) => (
                                <Autocomplete
                                    id="CIPRequireds"
                                    multiple
                                    limitTags={3}
                                    options={[...everyOne]
                                        .filter(d => {
                                            if (values.CIPOptionals.length > 0) {
                                                const filtered = !values.CIPRequireds.map(v => v.EmployeeId).includes(d.EmployeeId) && !values.CIPOptionals.map(v => v.EmployeeId).includes(d.EmployeeId)
                                                return filtered
                                            }
                                            const filtered = !values.CIPRequireds.map(v => v.EmployeeId).includes(d.EmployeeId)
                                            return filtered
                                        })
                                        .
                                        sort((a, b) => -b?.EmployeeKnowAs.localeCompare(a?.EmployeeKnowAs))
                                    }
                                    getOptionLabel={(option) => {
                                        return String(option?.EmployeeKnowAs
                                            || "")
                                    }}
                                    defaultValue={values.CIPRequireds}
                                    value={values.CIPRequireds}
                                    onChange={(event, newValue) => {
                                        if (errors?.CIPRequireds) {
                                            delete errors?.CIPRequireds
                                        }
                                        setValue("CIPRequireds", [...newValue].map(d => {
                                            return {
                                                ...d,
                                                EmployeeKnowAs: d?.EmployeeKnowAs || everyOne.find(v => v.UserId === d.UserId)?.EmployeeKnowAs,
                                                EmployeeId: d.EmployeeId || everyOne.find(v => v.UserId === d.UserId)?.EmployeeId,
                                            }
                                        }))
                                    }}
                                    renderInput={(params) => (
                                        <TextField {...params} label="Required" placeholder="Search" InputLabelProps={{
                                            style: {
                                                color: 'var(--label)'
                                            }, shrink: true,
                                        }}
                                            error={errors.CIPRequireds !== undefined}
                                            {...(errors?.CIPRequireds && {
                                                helperText: 'Every activity must require at least one person'
                                            })}
                                        />
                                    )}
                                    renderTags={(tagValue, getTagProps) =>
                                        tagValue.map((option, index) => {
                                            // console.log(option)
                                            return (
                                                <Chip
                                                    label={option?.EmpKnowAs || option?.EmployeeKnowAs}
                                                    {...getTagProps({ index })}
                                                    disabled={user?.EmpId === option?.EmployeeId}
                                                />
                                            )
                                        })
                                    }
                                    isOptionEqualToValue={(option, value) => {
                                        return option?.UserId === value?.UserId
                                    }}
                                    sx={{
                                        '&.MuiAutocomplete-root .MuiAutocomplete-inputRoot .MuiAutocomplete-input': {
                                            minWidth: 250,
                                        },
                                        '&.MuiOutlinedInput-root.MuiInputBase-sizeSmall.MuiAutocomplete-input': {
                                            padding: 8,
                                        }
                                    }}
                                />)}
                        />

                        <Controller
                            // name="CIPOptionals"
                            control={control}
                            render={({ field }) => (
                                <Autocomplete
                                    id="CIPOptionals"
                                    multiple
                                    limitTags={3}
                                    value={[...values.CIPOptionals]}
                                    defaultValue={[...values.CIPOptionals]}
                                    options={[...everyOne]
                                        .filter(d => {
                                            if (values.CIPRequireds.length > 0) {
                                                const filtered = !values.CIPRequireds.map(v => v.EmployeeId).includes(d.EmployeeId) && !values.CIPOptionals.map(v => v.EmployeeId).includes(d.EmployeeId)
                                                return filtered
                                            }
                                            const filtered = !values.CIPOptionals.map(v => v.EmployeeId).includes(d.EmployeeId)
                                            return filtered

                                        }).
                                        sort((a, b) => -b?.EmployeeKnowAs.localeCompare(a?.EmployeeKnowAs))}
                                    getOptionLabel={(option) => {
                                        return String(option?.EmployeeKnowAs
                                            || "")
                                    }}
                                    onChange={(event, newValue) => {
                                        setValue("CIPOptionals", [...newValue].map(d => {
                                            return {
                                                ...d,
                                                EmployeeKnowAs: d?.EmployeeKnowAs || everyOne.find(v => v.UserId === d.UserId)?.EmployeeKnowAs,
                                            }
                                        }))
                                    }}
                                    renderInput={(params) => (
                                        <TextField {...params} label="Optional" placeholder="Search"
                                            InputLabelProps={{
                                                style: {
                                                    color: 'var(--label)'
                                                }, shrink: true,
                                            }}

                                        />
                                    )}
                                    isOptionEqualToValue={(option, value) => {
                                        return option.EmployeeId === value.EmployeeId
                                    }}
                                    sx={{
                                        '&.MuiAutocomplete-root .MuiAutocomplete-inputRoot .MuiAutocomplete-input': {
                                            minWidth: 250,
                                        },
                                        '&.MuiOutlinedInput-root.MuiInputBase-sizeSmall.MuiAutocomplete-input': {
                                            padding: 8,
                                        }
                                    }}
                                />)} />
                    </>
                }

                {(viewerOptions || []).length > 0 &&
                    <FormControl fullWidth variant='outlined' id="SharingModeId">
                        <InputLabel id="label" shrink style={{
                            color: 'var(--label)',
                            backgroundColor: 'white'
                        }} sx={{
                            '& .MuiInputLabel-root': {
                                zIndex: 10000000
                            }
                        }} variant='outlined'>Viewer only</InputLabel>
                        <Select
                            labelId="label"
                            id='select-viewers'
                            onChange={(e, newValue) => handleChangeViewer(newValue)}
                            value={values?.SharingModeId}
                            defaultValue={values?.SharingModeId}
                        >
                            {[...viewerOptions].sort((a, b) => -b?.Caption.localeCompare(a?.Caption)).map(_ => (
                                <MenuItem key={_?.Value} value={_?.Value} >{_?.Caption}</MenuItem>
                            ))}
                        </Select>
                        {errors.SharingMode
                            && <FormHelperText sx={{ color: 'red' }}>{'Every activity must declare sharing mode'}</FormHelperText>}
                    </FormControl>
                }

                {
                    values.SharingModeId !== 69021 && values.SharingModeId !== 69022 &&
                    <Autocomplete
                        {...theme.breakpoints.only('xs') && {
                            limitTags: 3,
                            multiple: true,
                        }}
                        id="CIPViewOnlys"
                        value={values.CIPViewOnlys}
                        options={[...storeViewerOnly]}
                        getOptionLabel={(option) => {
                            return String(option?.EmployeeKnowAs
                                || "")
                        }}
                        defaultValue={[...storeViewerOnly]}
                        onChange={(event, newValue) => {
                            setValue("CIPViewOnlys", [...newValue].map(d => {
                                return {
                                    ...d,
                                    EmployeeKnowAs: d?.EmployeeKnowAs || everyOne.find(v => v.UserId === d.UserId)?.EmployeeKnowAs,
                                }
                            }))
                        }}
                        disabled={values?.SharingMode === 'Everyone'}
                        renderInput={(params) => (
                            <TextField {...params} label="" placeholder="Search"
                                InputLabelProps={{
                                    style: {
                                        color: 'var(--label)'
                                    }, shrink: true,
                                }}
                            />
                        )}
                        isOptionEqualToValue={(option, value) => option?.EmployeeId === value?.EmployeeId}
                        sx={{
                            '&.MuiAutocomplete-root .MuiAutocomplete-inputRoot .MuiAutocomplete-input': {
                                minWidth: 250,
                            },
                            '&.MuiOutlinedInput-root.MuiInputBase-sizeSmall.MuiAutocomplete-input': {
                                padding: 8,
                            }
                        }}
                    />
                }




                <FormControl fullWidth variant='outlined' id="MinutesReminder">
                    <InputLabel id="MinutesReminder-label" shrink style={{
                        color: 'var(--label)',
                        backgroundColor: 'white'
                    }} sx={{
                        '& .MuiInputLabel-root': {
                            zIndex: 10000000
                        }
                    }} variant='outlined'>Reminder 1 (default)</InputLabel>
                    <Select
                        labelId="MinutesReminder-label"
                        id='reminder-limit-tags-MinutesReminder'
                        onChange={(event, newValue) => {
                            // console.log(newValue)
                            setValue("MinutesReminder", newValue.props.value)
                        }}
                        value={values?.MinutesReminder}
                        defaultValue={REMINDER_OPTIONS1.find(d => d.value === values.MinutesReminder)}
                    >
                        {REMINDER_OPTIONS1.filter(d => {
                            const dateDiff = moment().diff(values.Start, 'minutes')
                            // console.log(dateDiff)
                            if (dateDiff > 0) {
                                return true
                            }
                            return d.value <= Math.abs(dateDiff)
                        }).map(_ => (
                            <MenuItem key={_?.value} value={_?.value} >{_?.label}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl fullWidth variant='outlined' id="DaysReminder">
                    <InputLabel id="label-DaysReminder" shrink style={{
                        color: 'var(--label)',
                        backgroundColor: 'white'
                    }} sx={{
                        '& .MuiInputLabel-root': {
                            zIndex: 10000000
                        }
                    }} variant='outlined'>Reminder 2 (optional)</InputLabel>
                    <Select
                        labelId="label-DaysReminder"
                        id='select-viewers-label-DaysReminder'
                        onChange={(event, newValue) => {
                            // console.log(newValue)
                            setValue("DaysReminder", newValue.props.value)
                        }}
                        value={values?.DaysReminder}
                        defaultValue={REMINDER_OPTIONS2.find(d => d.value === values.DaysReminder)}
                        MenuProps={{
                            PaperProps: {
                                style: {
                                    maxHeight: `500px`,
                                },
                            },
                        }}
                    >
                        {REMINDER_OPTIONS2.filter(d => {
                            const dateDiff = moment().diff(values.Start, 'days')
                            // console.log(dateDiff)
                            if (dateDiff > 0) {
                                return true
                            }
                            return d.value <= Math.abs(dateDiff)
                        }).map(_ => (
                            <MenuItem key={_?.value} value={_?.value} >{_?.label}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <RHFSwitch name="IsNotifyOnApproved" label="Send notify when this Activity is created" />

                {values?.Attachments?.Images &&
                    <RHFUploadMultiFile
                        showPreview
                        name="Attachments.Images"
                        accept={["image/*", "application/msword", "application/vnd.ms-excel", "application/vnd.ms-powerpoint", ".doc", ".docx", "text/*,", ".xlsx",
                            "application/pdf", "application/*"]}
                        // maxSize={15145728}
                        minSize={1}
                        onDrop={handleDrop}
                        onRemove={handleRemove}
                        onRemoveAll={handleRemoveAll}
                        onUpload={() => console.log('ON UPLOAD')}
                        onClick={handleClick}
                        smallBlockContent
                        showTotal
                    />
                }

                {
                    values.Attachments.Files.length > 0 &&
                    <MsFilesPreview attachments={values.Attachments} onRemove={handleRemove} />
                }

                {errors !== undefined && Object.keys(errors).length > 0 &&
                    <Alert severity='error'>There are some field have errors, please check again!</Alert>
                }

                <Stack spacing={3} direction='row'
                    sx={{
                        justifyContent: {
                            xs: 'center',
                            sm: 'center',
                            md: 'flex-end'
                        }
                    }}
                >
                    <Button variant='outlined' sx={{ minWidth: 100 }} onClick={handleClose} disabled={isSubmitting}>{translate('button.goBack')}</Button>

                    {allowAdding &&
                        <LoadingButton type="submit" variant="contained" loading={isSubmitting} disabled={isSubmitting} sx={{ minWidth: 100 }}>
                            {translate(itemDetail === undefined ? 'Create' : 'Save')}
                        </LoadingButton>
                    }

                    {
                        ActivityStatus !== "Open" && allowDeleting &&
                        <Button variant='outlined' sx={{
                            minWidth: 100,
                        }} color={'error'}
                            onClick={() => setShowwarning({ show: true, type: 'delete' })}
                            disabled={isSubmitting}>{translate('button.delete')}</Button>
                    }

                </Stack>

                <LightboxModal
                    images={imagesLightbox}
                    mainSrc={imagesLightbox[selectedImage]}
                    photoIndex={selectedImage}
                    setPhotoIndex={setSelectedImage}
                    isOpen={openLightbox}
                    onCloseRequest={() => setOpenLightbox(false)}
                />

            </Stack>

            <Dialog fullWidth open={showWarning.show}
                onClose={() => setShowwarning({ show: false, type: null })}
                sx={{
                    minHeight: {
                        xs: 500,
                        sm: 600,
                        md: 700,
                    },
                    p: 1,
                }}
            >
                <DialogTitle mb={3}>Confirm</DialogTitle>

                <DialogContent sx={{ overflowY: 'scroll' }}>

                    {showWarning.type === 'submit' &&
                        <Typography variant='body2' mb={2}>{
                            "Please review overview activity info again:"
                        }</Typography>
                    }

                    {showWarning.type === 'delete' &&
                        <Typography variant='body2'>{
                            "Are you sure that you want to delete this activity?"
                        }</Typography>
                    }

                    <Typography variant='body2'>Title: <strong>{
                        values.Title
                    }</strong></Typography>

                    <Typography variant='body2'>Start: <strong>{
                        moment(values.Start).format('DD/MM/yyyy hh:mm A')
                    }</strong></Typography>

                    <Typography variant='body2'>Location:  <strong>{
                        values.Location
                    }</strong></Typography>

                    {values.CIPRequireds.length > 0 && <Typography variant='body2'>Required: <strong>{
                        values.CIPRequireds.map((d, index) => {
                            if (index === values.CIPRequireds.length - 1) {
                                return `${d?.EmployeeKnowAs}`
                            }
                            return `${d.EmployeeKnowAs}, `
                        })
                    }</strong></Typography>}

                    {values.CIPOptionals
                        .length > 0 && <Typography variant='body2'>Optional: <strong>{
                            values.CIPOptionals
                                .map((d, index) => {
                                    if (index === values.CIPOptionals
                                        .length - 1) {
                                        return `${d?.EmployeeKnowAs}`
                                    }
                                    return `${d.EmployeeKnowAs}, `
                                })
                        }</strong></Typography>}

                    {values.SharingMode === 'Everyone' ?
                        <Typography variant='body2'>View only: Everyone</Typography> :
                        values.CIPViewOnlys.length > 0 && <Typography variant='body2'>View only: <strong>{
                            values.CIPViewOnlys
                                .map((d, index) => {
                                    if (index === values.CIPViewOnlys
                                        .length - 1) {
                                        return `${d?.EmployeeKnowAs}`
                                    }
                                    return `${d?.EmployeeKnowAs}, `
                                })
                        }</strong></Typography>
                    }

                </DialogContent>

                <DialogActions>
                    <Stack spacing={3} direction={'row'}>
                        <Button variant="outlined" color="error" onClick={() => setShowwarning({ show: false, type: null })}
                            disabled={loading}
                        >
                            {translate('button.cancel')}
                        </Button>
                        {showWarning.type === 'submit' &&
                            <Button variant="outlined" color="success" onClick={handleSubmitData}
                                disabled={loading}
                            >
                                Ok
                            </Button>
                        }
                        {showWarning.type === 'delete' &&
                            <Button variant="outlined" color="success" onClick={handleCancelActivity}
                                disabled={loading}

                            >
                                {translate('button.delete')}
                            </Button>
                        }
                    </Stack>
                </DialogActions>
            </Dialog >
            <LoadingBackDrop loading={loading} text={'Please wait...'} />
        </FormProvider >
    );
}


