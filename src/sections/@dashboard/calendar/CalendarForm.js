import { isBefore } from 'date-fns';
import { LoadPanel, Position } from 'devextreme-react/load-panel';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import moment from 'moment';
import * as normalAxios from 'axios';
// form
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
// @mui
import { LoadingButton } from '@mui/lab';
import { Autocomplete, Box, Button, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography, useTheme, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
// components
import Iconify from '../../../components/Iconify';
import LightboxModal from '../../../components/LightboxModal';
import Scrollbar from '../../../components/Scrollbar';
import { FormProvider } from '../../../components/hook-form';
import { UploadMultiFile } from '../../../components/upload';
import { QC_ATTACHEMENTS_HOST_API } from '../../../config';
import useLocales from '../../../hooks/useLocales';
import useResponsive from '../../../hooks/useResponsive';
import { SkeletonPostItem } from '../../../components/skeleton';
import useAuth from '../../../hooks/useAuth';
// import { getCalendarDetail } from '../../../redux/slices/calendar';
import { useDispatch, useSelector } from '../../../redux/store';
import { PATH_APP } from '../../../routes/paths';
import axios from '../../../utils/axios';
import { fToNow, getDateDistanceOfWeek, getTimeDistance, fDistance } from '../../../utils/formatTime';
import { getFileFormat } from '../../../utils/getFileFormat';
import { getImageLightBox } from '../../../utils/getImageLightBox';
import MsFilesPreview from './child/FilesPreview';
import SkeletonCalendar from '../../../components/skeleton/SkeletonCalendar';

// ----------------------------------------------------------------------

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
];

const INITIAL_RANGE = [
  { label: 'before 5 minutes', value: 5, },
  { label: 'before 15 minutes', value: 15, },
  { label: 'before 30 minutes', value: 30, },
  { label: 'before 1 hour', value: 60, },
  { label: 'before 3 hours', value: 180, },
  { label: 'before 6 hours', value: 360, },
  { label: 'before 12 hours', value: 720, },
  { label: 'before 1 day', value: 1440, },
  { label: 'before 2 days', value: 2880, },
  { label: 'before 5 days', value: 7200, },
  { label: 'before 10 days', value: 14400, },
]

// const COLOR_OPTIONS = [
//   '#00AB55', // theme.palette.primary.main,
//   '#1890FF', // theme.palette.info.main,
//   '#54D62C', // theme.palette.success.main,
//   '#FFC107', // theme.palette.warning.main,
//   '#FF4842', // theme.palette.error.main
//   '#04297A', // theme.palette.info.darker
//   '#7A0C2E', // theme.palette.error.darker
// ];


const getInitialValues = (event, calendarDetails) => {

  const initialEvent = {
    "Attachments": {
      Images: [],
      Files: [],
    },
    "Id": 1,
    "Title": "",
    "AllDay": false,
    "IsImportant": false,
    "Description": "",
    "Start": new Date().toISOString(),
    "End": new Date().toISOString(),
    "Location": "",
    "SharingModeId": null,
    "SharingMode": null,
    "CIPRequireds": [],
    "CIPOptionals": [],
    "CIPViewOnlys": [],
    "CreatedBy": null,
    "CreatedDate": "",
    "LastModifiedBy": null,
    "LastModifiedDate": null,
    "Guid": "",
    "IsDeleted": false,
    MinutesReminder: null,
    DaysReminder: null,
    IsNotifyOnApproved: null,
    EventType: null,
    Color: null,
  };

  //   // if (event || range) {
  //   //   return merge({}, initialEvent, event);
  //   // }

  if (calendarDetails !== null) {
    const newCalendarItemDetail = { ...calendarDetails };
    newCalendarItemDetail.Attachments = {
      Images: newCalendarItemDetail?.Attachments?.filter(d => {
        const fileType = getFileFormat(d?.Name)
        return fileType === 'image'
      }) || [],
      Files: newCalendarItemDetail?.Attachments?.filter(d => {
        const fileType = getFileFormat(d?.Name)
        return fileType !== 'image'
      }) || [],
    }
    // console.log(newCalendarItemDetail)
    return newCalendarItemDetail;
  }

  return initialEvent;
};

// ----------------------------------------------------------------------

CalendarForm.propTypes = {
  event: PropTypes.object,
  range: PropTypes.object,
  onCancel: PropTypes.func,
  onDeleteEvent: PropTypes.func,
  onCreateUpdateEvent: PropTypes.func,
  allowEditing: PropTypes.any,
  loginUserName: PropTypes.string,
};

export default function CalendarForm({
  event,
  range,
  onCreateUpdateEvent,
  onDeleteEvent,
  onCancel,
  selectedEventId,
  sysEnum,
  everyOne,
  openForm,
  allowEditing,
  loginUserName
}) {

  // const hasEventData = !!event;
  const theme = useTheme()
  const smUp = useResponsive('up', 'sm');
  const { enqueueSnackbar } = useSnackbar()
  const { translate } = useLocales();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth()
  const {
    // calendarDetails,
    isLoading, error } = useSelector((state) => state.calendar);
  const viewerOptions = sysEnum.find(d => d?.Name === 'CalendarSharingMode')?.Elements.map(d => {
    return {
      ...d,
    }
  }) || [];
  const eventOptions = sysEnum.find(d => d?.Name === 'CalendarEventType')?.Elements || [];
  const { notification } = useSelector(store => store.notification)

  // components state;
  const [calendarDetails, setCalendarDetails] = useState(undefined);
  const [loading, setLoading] = useState(false);
  const [reminderOption, setReminderOption] = useState([]);
  // const [reminderValue, setReminderValue] = useState("");

  const getEventDetail =
    useCallback(
      async () => {
        // dispatch(getCalendarDetail(event?.Id))
        if (event?.Id !== undefined) {
          setLoading(true)
          await axios.get(`api/CalendarMobileApi/GetCalendarItemsById/${event?.Id}`).then(response => {
            setCalendarDetails(response.data);
            setLoading(false);
            if (notification) {
              // set reminder
              const diff = moment(response.data.Start) - moment();
              if (diff > 0) {
                const minuteDistance = moment.duration(diff).asMinutes()
                const maxOption = minuteDistance;
                const options = INITIAL_RANGE.filter(d => d.value <= maxOption)
                setReminderOption(options)
              }
            }
          }).catch(err => {
            console.error(JSON.stringify(err));
            setLoading(false)
            enqueueSnackbar(err, {
              variant: 'error'
            })
          });
        }
      }
      , [dispatch, openForm, event?.Id]);

  useEffect(() => {
    getEventDetail();
  }, [getEventDetail, openForm,]);

  const EventSchema = Yup.object().shape({
  });

  const methods = useForm({
    resolver: yupResolver(EventSchema),
    defaultValues: getInitialValues(event, calendarDetails),
  });

  const {
    reset,
    watch,
    control, setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const [openLightbox, setOpenLightbox] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  const values = watch();

  const onSubmit = async (data) => {
    try {
      const newEvent = {
        title: data.title,
        description: data.description,
        color: data.color,
        allDay: data.allDay,
        start: data.start,
        end: data.end,
      };
      onCreateUpdateEvent(newEvent);
      onCancel();
      reset();
    } catch (error) {
      console.error(error);
    }
  };

  const isDateError =
    !values.AllDay && values.Start && values.End
      ? isBefore(new Date(values.End), new Date(values.Start))
      : false;

  const handleCancel = useCallback(() => {
    onCancel();
  }, [])

  // OPEN LIGHTBOX VIEW PICTURE
  const handleClick = async (file) => {
    const attachments = Attachments?.Images;
    const imageIndex = attachments.findIndex((d) => {
      return d?.Id === file?.Id;
    });
    setOpenLightbox(true);
    setSelectedImage(imageIndex);
  };

  // GOTO UPDATE PAGES
  const hanldeGoToUpdate = () => {
    const newCalendarItemDetail = { ...calendarDetails };
    newCalendarItemDetail.Attachments = {
      Images: newCalendarItemDetail?.Attachments?.filter(d => {
        const fileType = getFileFormat(d?.Name)
        return fileType === 'image'
      }) || [],
      Files: newCalendarItemDetail?.Attachments?.filter(d => {
        const fileType = getFileFormat(d?.Name)
        return fileType !== 'image'
      }) || [],
    }
    handleCancel()
    navigate(PATH_APP.calendar.event, { state: { itemDetail: newCalendarItemDetail } })
  }

  const Attachments = {
    Images: calendarDetails?.Attachments?.filter(d => {
      const fileType = getFileFormat(d?.Name)
      return fileType === 'image'
    }).map(v => {
      return {
        ...v,
        URL: `${QC_ATTACHEMENTS_HOST_API}/${v?.Guid}`
      }
    }) || [],
    Files: calendarDetails?.Attachments?.filter(d => {
      const fileType = getFileFormat(d?.Name)
      return fileType !== 'image'
    }).map(v => {
      return {
        ...v,
        URL: `${QC_ATTACHEMENTS_HOST_API}/${v?.Guid}`
      }
    }) || [],
  } || {
    Images: [],
    Files: [],
  };

  const imagesLightbox = getImageLightBox(Attachments.Images, 'URL') || [];

  // console.log('popup detail',
  //   //   // values,
  //   calendarDetails,
  //   //   //   Attachments,
  //   //   //    imagesLightbox, 
  //   //   //   selectedImage, 
  //   // everyOne, 
  //   // viewerOptions,
  //   // sysEnum,
  //   // notification,
  //   // reminderOption,
  //   //  user,
  // );

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <DialogTitle
        sx={{
          p: {
            xs: 2,
            md: 3
          },
          backgroundColor: calendarDetails?.Color,
          '&.MuiDialogTitle-root': {
            boxShadow: theme.shadows[20],
          },
        }}
      >
        <Stack direction='row' justifyContent={'space-between'}
          alignItems='center'>

          <Stack direction={'row'} justifyContent={'flex-start'} alignItems={'center'} spacing={1}>
            {eventOptions.length > 0 &&
              <Box
                sx={{
                  display: 'flex',
                  borderRadius: '50%',
                  position: 'relative',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                }}
              >
                <Iconify icon={eventOptions.find(d => d.Caption === calendarDetails?.EventType)?.Icon} />
              </Box>
            }
            <Typography variant='title' fontWeight={'bold'} color={'white'}
            >{calendarDetails?.EventType}</Typography>
          </Stack>
          {
            calendarDetails?.Start &&
            <Typography variant='body1' color={'white'}>{fDistance(calendarDetails?.Start)?.string}</Typography>
          }
        </Stack>
      </DialogTitle>
      <DialogContent dividers sx={{
        height: {
          xs: 470,
          md: 550,
          lg: 600
        },
        p: 0,
        // '@media (max-width: 600px)': {
        //   '&.MuiDialogContent-root': {
        //     height: '70% !important',
        //   }
        // },
      }} >
        {loading ?
          <Box p={2}>
            <SkeletonCalendar />
          </Box>
          :
          // <Scrollbar >
          <Stack
            spacing={3} sx={{
              py: 2,
              px: { xs: 1, md: 2 },
              pb: 3,
            }}
          >
            <>
              <Stack direction={'row'}
                sx={{ flexGrow: 1 }}
              >
                <Typography variant="h6" >{calendarDetails?.Title}</Typography>
              </Stack>

              <Stack direction={'row'}>
                <Box display={'flex'}
                  justifyContent='flex-start'
                  alignItems={'center'}
                  sx={{
                    width: {
                      xs: 40,
                      md: 50
                    },
                  }}
                >
                  <Iconify icon="material-symbols:nest-clock-farsight-analog-outline-rounded" sx={{
                    fontSize: {
                      xs: 25,
                      lg: 28,
                    },
                    color: theme.palette.info.dark,
                  }} />
                </Box>

                {calendarDetails?.Start && calendarDetails?.End && !calendarDetails?.AllDay &&
                  <Stack sx={{ flexGrow: 1, color: theme.palette.info.dark }}>
                    <Typography variant="body1">{`${getDateDistanceOfWeek(calendarDetails?.Start, calendarDetails?.End)}`}</Typography>
                    <Typography variant="body1">{getTimeDistance(calendarDetails?.Start, calendarDetails?.End)}</Typography>
                  </Stack>
                }

                {calendarDetails?.AllDay &&
                  <Stack sx={{ flexGrow: 1, color: theme.palette.info.dark }}>
                    <Typography variant="body1">{`${moment(calendarDetails?.Start).format('DD-MMM-YYYY')}`}</Typography>
                    <Typography variant="body1">{`All day`}</Typography>
                  </Stack>
                }

              </Stack>

              <Stack direction={'row'}>
                <Box display={'flex'}
                  justifyContent='flex-start'
                  alignItems={'center'}
                  sx={{
                    width: {
                      xs: 40,
                      md: 50
                    },
                  }}
                >
                  <Iconify icon="material-symbols:location-on-outline" sx={{
                    fontSize: {
                      xs: 25,
                      lg: 28
                    },
                    color: theme.palette.info.dark
                  }} />
                </Box>
                <Stack display='flex' flexDirection='column' justifyContent='center' alignItems='center' sx={{ flexGrow: 1, color: theme.palette.info.dark }} >
                  <Typography variant="body1" width='100%'> {calendarDetails?.Location || "N/A"}</Typography>
                </Stack>
              </Stack>
            </>


            {/* <Typography variant="body1" paragraph whiteSpace={'normal'}>{calendarDetails?.Description}</Typography> */}

            <TextField label="Description" InputLabelProps={{
              style: {
                color: 'var(--label)'
              }, shrink: true,
            }}
              InputProps={{ readOnly: true }}
              size='small'
              value={`${calendarDetails?.Description}` || ""}
              multiline
              minRows={6}
              maxRows={10}
            />

            {calendarDetails?.CIPRequireds?.length > 0 &&
              <Stack spacing={2}>
                <Typography variant="subtitle2">Participant:</Typography>
                <Controller
                  name="CIPRequireds"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      multiple
                      id="required-limit-tags"
                      limitTags={10}
                      size='small'
                      options={calendarDetails?.CIPRequireds}
                      defaultValue={calendarDetails?.CIPRequireds}
                      getOptionLabel={(option) => {
                        return option?.EmployeeKnowAs
                      }}
                      renderInput={(params) => (
                        <TextField {...params} label="Required" InputLabelProps={{
                          style: {
                            color: 'var(--label)'
                          }, shrink: true,
                        }}
                        />
                      )}
                      readOnly
                      isOptionEqualToValue={(option, value) => option?.EmployeeId === value?.EmployeeId}
                    />)} />
              </Stack>
            }

            {calendarDetails?.CIPOptionals && calendarDetails?.CIPOptionals?.length > 0 &&
              <Controller
                name="CIPOptionals"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    multiple
                    size='small'
                    id="optional-limit-tags"
                    limitTags={10}
                    options={calendarDetails?.CIPOptionals}
                    getOptionLabel={(option) => {
                      return option?.EmployeeKnowAs
                    }}
                    defaultValue={calendarDetails?.CIPOptionals}
                    renderInput={(params) => (
                      <TextField {...params} label="Optional" InputLabelProps={{
                        style: {
                          color: 'var(--label)'
                        }, shrink: true,
                      }}
                      />
                    )}
                    readOnly
                    isOptionEqualToValue={(option, value) => option?.EmployeeId === value?.EmployeeId}
                  />)} />
            }

            {calendarDetails?.CIPViewOnlys && calendarDetails?.CIPViewOnlys?.length > 0 &&
              <Controller
                name="CIPViewOnlys"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    multiple
                    size='small'
                    id="optional-limit-tags"
                    limitTags={10}
                    options={calendarDetails?.CIPViewOnlys}
                    getOptionLabel={(option) => {
                      return option?.EmployeeKnowAs
                    }}
                    defaultValue={calendarDetails?.CIPViewOnlys}
                    renderInput={(params) => (
                      <TextField {...params} label="Viewer" InputLabelProps={{
                        style: {
                          color: 'var(--label)'
                        }, shrink: true,
                      }}
                      />
                    )}
                    readOnly
                    isOptionEqualToValue={(option, value) => option?.EmployeeId === value?.EmployeeId}
                  />)} />
            }

            {
              calendarDetails?.SharingModeId === 69022 &&
              <TextField label="Viewer" InputLabelProps={{
                style: {
                  color: 'var(--label)'
                }, shrink: true,
              }}
                size='small'
                value={viewerOptions.find(d => d.Value === calendarDetails?.SharingModeId)?.Caption}
              />
            }


            {calendarDetails?.MinutesReminder > 0 &&
              <TextField label="Reminder 1" InputLabelProps={{
                style: {
                  color: 'var(--label)'
                }, shrink: true,
              }}
                InputProps={{ readOnly: true }}
                size='small'
                value={`before ${REMINDER_OPTIONS1.find(d => d.value === calendarDetails?.MinutesReminder).label}` || ""}
              />
            }


            {calendarDetails?.DaysReminder > 0 &&
              <TextField label="Reminder 2" InputLabelProps={{
                style: {
                  color: 'var(--label)'
                }, shrink: true,
              }}
                InputProps={{ readOnly: true }}
                size='small'
                value={`before ${REMINDER_OPTIONS2.find(d => d.value === calendarDetails?.DaysReminder).label}` || ""}
              />
            }

            {
              Attachments?.Images.length > 0 &&
              <UploadMultiFile
                files={Attachments.Images}
                disableBlockContent
                showPreview
                onClick={handleClick}
                showTotal
              />
            }

            {
              Attachments?.Files.length > 0 &&
              <MsFilesPreview attachments={Attachments} />
            }

            {notification &&
              <ReminderOption
                reminderOption={reminderOption} user={user} notification={notification}
                enqueueSnackbar={enqueueSnackbar} calendarDetails={calendarDetails} onCancel={onCancel}
              />
            }

          </Stack>

          // </Scrollbar>
        }

      </DialogContent>

      {!loading &&
        <DialogActions
          disableSpacing
          sx={{
            padding: smUp ? 3 : 0,
            '&.MuiPaper-root-MuiDialog-paper.MuiDialog-paper .MuiDialogActions-root': {
              padding: 0,
            },
            '&.MuiDialogActions-root': {
              boxShadow: theme.shadows[20],
            },
          }}>

          <Box sx={{ flexGrow: 1 }} />

          <Button variant="outlined" color="inherit" onClick={handleCancel} sx={{ minWidth: 100 }}>
            {translate('button.close')}
          </Button>

          {allowEditing && loginUserName === calendarDetails?.CreatedBy &&
            <LoadingButton variant="contained" loading={isSubmitting}
              onClick={hanldeGoToUpdate}
              sx={{ minWidth: 100 }}>
              {translate('button.edit')}
            </LoadingButton>
          }

        </DialogActions>
      }

      <LightboxModal
        images={imagesLightbox}
        mainSrc={imagesLightbox[selectedImage]}
        photoIndex={selectedImage}
        setPhotoIndex={setSelectedImage}
        isOpen={openLightbox}
        onCloseRequest={() => setOpenLightbox(false)}
      />

      {
        loading && (
          <LoadPanel hideOnOutsideClick message="Please, wait..." visible={loading}
            showPane={false}
          // position='center'
          >
            <Position my="center" at="center" of="#calendar-form" />
          </LoadPanel>
        )
      }
    </FormProvider >
  );
}


const ReminderOption = ({ reminderOption, user, notification, enqueueSnackbar, calendarDetails, onCancel }) => {

  const [reminderValue, setReminderValue] = useState("");

  useEffect(() => {
    setReminderValue(INITIAL_RANGE[1].value)
  }, [])

  const handleSaveReminder = async () => {
    try {

      // const postObj = {
      //   EntityId: notification?.data?.EntityId,
      //   UserId: user?.UserId,
      //   Message: notification?.body,
      //   Reminder: reminderValue,
      //   StartTime: notification?.data?.StartTime
      // }
      const startReminder = moment(calendarDetails?.Start).subtract(Number(reminderValue), 'minutes');
      const startNotifyFromNow = moment.duration(startReminder - moment());

      const days = startNotifyFromNow._data.days;
      const hours = startNotifyFromNow._data.hours;
      const minutes = startNotifyFromNow._data.minutes;
      const seconds = startNotifyFromNow._data.seconds;
      const timeString = `${days}.${hours}:${minutes}:${seconds}`
      // console.log(startReminder, startNotifyFromNow, days, hours, minutes, seconds, timeString);

      const postObj = {
        EntityId: calendarDetails?.Id,
        UserId: user?.UserId,
        Message: notification?.body,
        Reminder: timeString,
        StartTime: calendarDetails?.Start
      }
      // generate post obj
      const formData = new FormData();
      formData.append('values', JSON.stringify(postObj))
      const accessToken = window.localStorage.getItem('accessToken')
      // post object to server
      const response = await normalAxios.post("https://ser.motivesfareast.com/api/hangfire/createCalendarNoticeJob", formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      if (response) {
        console.log(response)
        enqueueSnackbar('Notification saved!')
        onCancel();
      }
    } catch (e) {
      console.error(e)
      enqueueSnackbar(e, { variant: 'error' })
    }
  };


  return (
    <Stack spacing={2}>
      <Typography variant="subtitle2">Reminder option:</Typography>
      {reminderOption.length > 0 &&
        <Stack direction={'row'} spacing={2}>

          <FormControl fullWidth variant='outlined'>
            <InputLabel id="MinutesReminder-label" shrink style={{
              color: 'var(--label)',
              backgroundColor: 'white',
              padding: 2,
            }} sx={{
              '& .MuiInputLabel-root': {
                zIndex: 10000000
              },
            }} variant='outlined'>Next reminder</InputLabel>
            <Select
              labelId="MinutesReminder-label"
              id='reminder-options'
              onChange={(event, newValue) => {
                console.log(newValue);
                setReminderValue(newValue.props.value);
              }}
              size='small'
              value={reminderValue}
            >
              {reminderOption.map(_ => (
                <MenuItem key={_?.value} value={_?.value} >{_?.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button color='error' variant='contained' type='button' onClick={() => handleSaveReminder()} disabled={reminderValue === ""}>Snooze</Button>
        </Stack>
      }

    </Stack>
  )

}