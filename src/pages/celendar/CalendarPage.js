import { Capacitor } from '@capacitor/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';
import FullCalendar from '@fullcalendar/react'; // => request placed at the top
// import timeGridPlugin from '@fullcalendar/timegrid';
// import timelinePlugin from '@fullcalendar/timeline';
import moment from 'moment';
import { useSnackbar } from 'notistack';
import { useLocation, useNavigate } from 'react-router-dom';

//
import { useCallback, useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
// @mui
import { Box, Button, Card, Container, Dialog, Typography, useTheme } from '@mui/material';
// redux
import { createEvent, deleteEvent, getEvents, getSharingModeEveryOne, getSysEnumElements, setDate, setOpenForm, setSelectedEventId, setView, updateEvent } from '../../redux/slices/calendar';
import { getNotification } from '../../redux/slices/notification';
import { useDispatch, useSelector } from '../../redux/store';
// routes
import { PATH_APP } from '../../routes/paths';
// utils
// hooks
import useAuth from '../../hooks/useAuth';
import useResponsive from '../../hooks/useResponsive';
// components
import { CustomBreadcrumbs } from '../../components/custom-breadcrumbs';
import { useDateRangePicker } from '../../components/date-range-picker';
import Iconify from '../../components/Iconify';
import useSettings from '../../hooks/useSettings';
// sections
import Scrollbar from '../../components/Scrollbar';
import {
  CalendarFilterDrawer,
  CalendarForm, CalendarToolbar, StyledCalendar
} from '../../sections/@dashboard/calendar';
// Configs
import { HEADER } from '../../config';


// ----------------------------------------------------------------------
// const COLOR_OPTIONS = [
//   '#00AB55', // theme.palette.primary.main,
//   '#1890FF', // theme.palette.info.main,
//   '#54D62C', // theme.palette.success.main,
//   '#FFC107', // theme.palette.warning.main,
//   '#FF4842', // theme.palette.error.main
//   '#04297A', // theme.palette.info.darker
//   '#7A0C2E', // theme.palette.error.darker
// ];

const COLOR_OPTIONS = [
  { label: 'Yearly event', value: '#1890FF', },
  { label: 'BOD activity', value: '#FF0000' },
  { label: 'Business trip', value: '#6E34CC' },
  { label: 'Customer visit', value: '#00BC57' },
  { label: 'Birthday', value: '#FF7A00' }, // theme.palette.error.main
];

const PARTICIPANT_OPTIONS = [{ label: 'Required', value: 'Required' }, { label: 'Optional', value: 'Optional' }, { label: 'Viewer', value: 'Viewer' }]

// ----------------------------------------------------------------------

export default function CalendarPage() {
  const { enqueueSnackbar } = useSnackbar();

  const { themeStretch } = useSettings();
  const theme = useTheme()
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { LoginUser } = useSelector(store => store.workflow);
  const { date, view } = useSelector(store => store.calendar);

  const isDesktop = useResponsive('up', 'sm');
  const mdUp = useResponsive('up', 'md');
  const lgUp = useResponsive('up', 'lg');

  const calendarRef = useRef(null);
  const touchStartRef = useRef(0);
  const touchEndRef = useRef(0);


  // const [openForm, setOpenForm] = useState(false);

  // const [selectedEventId, setSelectedEventId] = useState(null);

  const [selectedRange, setSelectedRange] = useState(null);

  const picker = useDateRangePicker(null, null);

  // const [date, setDate] = useState(new Date());

  const [openFilter, setOpenFilter] = useState(false);

  const [filterEventColor, setFilterEventColor] = useState([]);

  // const [view, setView] = useState('dayGridMonth');

  const [morePopover, setMorePopover] = useState(null);

  const [filterParticipant, setFilterParticipant] = useState([])

  const { events, sysEnum, everyOne, openForm, selectedEventId, } = useGetEvents(LoginUser.UserId, date);

  const eventStatusOptions = sysEnum.find(d => d?.Name === 'CalendarActivityStatus')?.Elements || [];

  const { userClaim } = useAuth();

  const allowEditing = userClaim.find(d => d?.ClaimType === 'calendar' && d.ClaimValue === 'update');
  const allowCreating = userClaim.find(d => d?.ClaimType === 'calendar' && d.ClaimValue === 'create');

  const selectedEvent = useSelector(() => {
    if (selectedEventId) {
      // return events.find((event) => event.id === selectedEventId);
      return events.find((event) => event?.Id === selectedEventId);
    }
    return null;
  });

  useEffect(() => {
    const calendarEl = calendarRef.current;
    if (calendarEl) {
      const calendarApi = calendarEl.getApi();
      // console.log(calendarApi)
      if (view === "listMonth" && !isDesktop) {
        // Scroll to current month date
        const currentDateElement = document.querySelector(`[data-date="${moment(date).format('YYYY-MM-DD')}"]`);
        if (currentDateElement) {
          currentDateElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        // const listTable = document.getElementsByClassName("fc-list-table");
        // listTable[0].addEventListener('scroll', (e) => console.log(e))
      }
    }
  }, [isDesktop, view, date,]);

  const handleOpenModal = (eventId) => {
    // setOpenForm(true);
    // setSelectedEventId(eventId);
    dispatch(setOpenForm(true));
    // dispatch(setSelectedEventId(eventId))

  };

  const handleNavigate = (type) => {
    navigate(PATH_APP.calendar.event, { state: { events, type } })
  }

  const handleCloseModal = () => {
    setSelectedRange(null);
    // setOpenForm(false);
    // setSelectedEventId(null);
    dispatch(setOpenForm(false))
    dispatch(setSelectedEventId(null));
    dispatch(getNotification(null))
    // const calendarEl = calendarRef.current;
    // const calendarApi = calendarEl.getApi();
    // calendarApi.unselect();
  };

  const handleClickToday = () => {
    const calendarEl = calendarRef.current;
    if (calendarEl) {
      const calendarApi = calendarEl.getApi();
      calendarApi.today();
      // setDate(calendarApi.getDate());
      dispatch(setDate(calendarApi.getDate()))
    }
  };

  const handleChangeView = (newView) => {
    // console.log(newView)
    const calendarEl = calendarRef.current;
    if (calendarEl) {
      const calendarApi = calendarEl.getApi();
      calendarApi.changeView(newView);
      // setView(newView);
      dispatch(setView(newView))
    }
  };

  const handleClickDatePrev = () => {
    const calendarEl = calendarRef.current;
    if (calendarEl) {
      const calendarApi = calendarEl.getApi();
      // console.log(calendarApi.view.getCurrentData())
      calendarApi.prev("nextMonth");
      // setDate(calendarApi.getDate());
      dispatch(setDate(calendarApi.getDate()))
    }
  };

  const handleClickDateNext = () => {
    const calendarEl = calendarRef.current;
    if (calendarEl) {
      const calendarApi = calendarEl.getApi();
      calendarApi.next("nextMonth");
      // setDate(calendarApi.getDate());
      dispatch(setDate(calendarApi.getDate()))
    }
  };

  const handleSelectRange = (arg) => {
    // console.log('handleSelectRange', arg)
    const calendarEl = calendarRef.current;
    if (calendarEl) {
      const calendarApi = calendarEl.getApi();
      calendarApi.unselect();
    }
    handleOpenModal();
    setSelectedRange({
      start: arg.start,
      end: arg.end,
    });
  };

  // AGENDAR SELECTION
  const handleSelectEvent = (arg) => {
    // console.log(arg, arg.event.id)
    if (arg.event.id) {
      // setSelectedEventId(Number(arg.event.id));
      dispatch(setSelectedEventId(Number(arg.event.id)))
    }
    handleOpenModal();
  };


  const handleResizeEvent = ({ event }) => {
    try {
      dispatch(
        updateEvent(event.id, {
          allDay: event.allDay,
          start: event.start,
          end: event.end,
        })
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleDropEvent = ({ event }) => {
    try {
      dispatch(
        updateEvent(event.id, {
          allDay: event.allDay,
          start: event.start,
          end: event.end,
        })
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateUpdateEvent = (newEvent) => {
    if (selectedEventId) {
      dispatch(updateEvent(selectedEventId, newEvent));
      enqueueSnackbar('Update success!');
    } else {
      dispatch(createEvent(newEvent));
      enqueueSnackbar('Create success!');
    }
  };

  const handleDeleteEvent = () => {
    try {
      if (selectedEventId) {
        handleCloseModal();
        dispatch(deleteEvent(selectedEventId));
        enqueueSnackbar('Delete success!');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleFilterEventColor = (eventColor) => {
    // if (eventColor.length > 0) {
    //   setFilterEventColor(eventColor);
    // } else {
    const checked = filterEventColor.includes(eventColor)
      ? filterEventColor.filter((value) => value !== eventColor)
      : [...filterEventColor, eventColor];
    // console.log(checked, filterEventColor, eventColor)
    setFilterEventColor(checked);
    // }
  };

  const handleResetFilter = () => {
    const { setStartDate, setEndDate } = picker;
    if (setStartDate && setEndDate) {
      setStartDate(null);
      setEndDate(null);
    }
    setFilterEventColor([]);
    setFilterParticipant([])
  };

  const dataFiltered = applyFilter({
    inputData: events,
    filterEventColor,
    filterParticipant,
    filterStartDate: picker.startDate,
    filterEndDate: picker.endDate,
    isError: !!picker.isError,
  });


  const handleTouchStart = useCallback((e) => {
    touchStartRef.current = e.changedTouches[0].clientX;
    touchEndRef.current = 0;
  }, [])

  const handleTouchMove = useCallback((e) => {
    touchEndRef.current = e.changedTouches[0].clientX;
  }, [])

  const handleTouchEnd = useCallback((e) => {
    const touchEnd = touchEndRef.current;
    const touchStart = touchStartRef.current;
    if (touchEnd === 0) {
      return
    }
    if (touchEnd < touchStart && Math.abs(touchEnd - touchStart) >= 100) {
      handleClickDateNext()
    }
    if (touchEnd > touchStart && Math.abs(touchEnd - touchStart) >= 100) {
      handleClickDatePrev()
    }
  }, [])

  const handleRenderEventTimeDuration = useCallback((e) => {

    if (e.event.extendedProps.ActivityStatusId === 69177) {
      e.el.classList.add('event-canceled')
      e.el.setAttribute('id', 'event-canceled')
    };

    // e.el.firstElementChild.style.backgroundColor = 'red'
    // console.log(e.el.classList, e, e.event.extendedProps.ActivityStatusId, e);

    if (e.view.type === 'listMonth') {

      const columnElement = document.createElement('td');
      if (!e.isStart && !e.isEnd) {
        columnElement.textContent = "24 hours";
        e.el.firstElementChild.append(columnElement);
      }
      if (e.isStart && !e.isEnd) {
        const endOfDay = moment(e.event.start).endOf('day');
        const inDayDistance = endOfDay.add(30, 'minutes').diff(moment(e.event.start), 'hours');
        columnElement.textContent = `${inDayDistance} hours`;
        e.el.firstElementChild.append(columnElement);
      }
      if (!e.isStart && e.isEnd) {
        const startOfDay = moment(e.event.end).startOf('day');
        const inDayDistance = moment(e.event.end).add(30, 'minutes').diff(startOfDay, 'hours');
        columnElement.textContent = `${inDayDistance} hours`;
        e.el.firstElementChild.append(columnElement);
      }
    };

  }, [view, date]);

  const BREAKCRUM_HEIGHT = 40;
  const SPACING = 24;
  const TAB_HEIGHT = 48;
  const ANDROID_KEYBOARD = Capacitor.getPlatform() === 'android' ? 16 : 0;
  const IOS_KEYBOARD = Capacitor.getPlatform() === 'ios' ? 16 : 0;
  const checkNotch = () => {
    const iPhone = /iPhone/.test(navigator.userAgent) && !window.MSStream
    const aspect = window.screen.width / window.screen.height
    if (iPhone && aspect.toFixed(3) === "0.462") {
      // I'm an iPhone X or 11...
      return 55
    }
    return 0
  }
  const NOTCH_HEIGHT = checkNotch()


  // console.log(
  //   events,
  //   // userClaim,
  //   // allowCreating,
  //   // LoginUser,
  //   // dataFiltered,
  //   //  sysEnum,
  //   // openForm,
  //   // selectedEventId,
  //   // filterEventColor,
  //   // filterParticipant,
  //   // userClaim,
  //   // allowEditing,
  //   // window.getComputedStyle(document.documentElement).getPropertyValue("--sat"),
  //   // NOTCH_HEIGHT,
  // );

  return (
    <>
      <Helmet>
        <title> Calendar | M System</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'xl'} sx={{
        pl: 1, pr: 1,
        position: mdUp ? 'relative' : 'fixed'
      }}>
        <CustomBreadcrumbs
          links={[
            {
              name: 'Home',
              href: PATH_APP.general.app,
            },
            {
              name: 'Calendar',
            },
          ]}
          sx={{
            mb: 1
          }}
          action={allowCreating ?
            <Button
              variant="contained"
              startIcon={<Iconify icon="eva:plus-fill" />}
              onClick={() => handleNavigate("Add new")}

            >
              New Event
            </Button> : null
          }
        />

        <Card
          sx={{
            minHeight: '70vh',
            height: {
              xs: `calc(100vh - ${HEADER.MOBILE_HEIGHT + BREAKCRUM_HEIGHT + SPACING + ANDROID_KEYBOARD + IOS_KEYBOARD + NOTCH_HEIGHT}px)`,
              sm: `calc(100vh - ${HEADER.MOBILE_HEIGHT + BREAKCRUM_HEIGHT + SPACING + ANDROID_KEYBOARD + IOS_KEYBOARD + NOTCH_HEIGHT}px)`,
              lg: `calc(100vh - ${HEADER.DASHBOARD_DESKTOP_HEIGHT + BREAKCRUM_HEIGHT + SPACING + ANDROID_KEYBOARD + IOS_KEYBOARD + NOTCH_HEIGHT}px)`,
            },
          }}
        >
          <StyledCalendar>
            <CalendarToolbar
              date={date}
              view={view}
              onNextDate={handleClickDateNext}
              onPrevDate={handleClickDatePrev}
              onToday={handleClickToday}
              onChangeView={handleChangeView}
              onOpenFilter={() => {
                setOpenFilter(true)
                // setFilterEventColor(COLOR_OPTIONS.map(d => d.value));
                // setFilterParticipant(PARTICIPANT_OPTIONS.map(d => d.value));
              }}
              setDate={setDate}
              calendarRef={calendarRef}
            />
            <Scrollbar
            >
              <Box
                onTouchStart={(e) => handleTouchStart(e)}
                onTouchMove={(e) => handleTouchMove(e)}
                onTouchEnd={(e) => handleTouchEnd(e)}
              >
                <FullCalendar
                  // showNonCurrentDates={false}.
                  eventBackgroundColor={e => console.log(e)}
                  id='fullcalendar-container'
                  fixedWeekCount={false}
                  handleWindowResize
                  // dayCount={4}
                  weekends
                  editable={false}
                  droppable={false}
                  selectable={false}
                  selectMirror={false}
                  rerenderDelay={1}
                  allDayMaintainDuration
                  eventResizableFromStart
                  ref={calendarRef}
                  initialDate={date}
                  initialView={view}
                  dayMaxEventRows={3}
                  eventDisplay="block"
                  events={dataFiltered}
                  headerToolbar={false}
                  initialEvents={events}
                  selectAllow={() => false}
                  // select={handleSelectRange}
                  // eventDrop={handleDropEvent}
                  eventClick={handleSelectEvent}
                  // eventLeave={e => console.log(e)}
                  longPressDelay={0}
                  eventLongPressDelay={0}
                  // selectLongPressDelay={0}
                  // dateClick={handleSelectEvent}
                  // eventChange={e => console.log(e)}
                  // eventResize={handleResizeEvent}
                  eventDataTransform={e => {
                    // console.log(e)
                    const ActivityStatus = eventStatusOptions.find(d => d.Value === e.ActivityStatusId)?.Caption;
                    let color = e?.Color
                    if (ActivityStatus === 'Replaced') {
                      color = theme.palette.grey[500]
                    }
                    const data = {
                      id: e.Id,
                      createdBy: e.CreatedBy,
                      createdDate: e.CreatedDate,
                      lastModifiedBy: e.LastModifiedBy,
                      lastModifiedDate: e.LastModifiedDate,
                      guid: e.Guid,
                      isDeleted: e.IsDeleted,
                      title: e.Title,
                      allDay: e.allDay,
                      description: e.Description,
                      start: new Date(e.Start).toISOString(),
                      end: new Date(e.End).toISOString(),
                      location: e.Location,
                      sharingModeId: e.SharingModeId,
                      textColor: 'white',
                      backgroundColor: color,
                      borderColor: color,
                      "ActivityStatus": e.ActivityStatus,
                      "Color": 'blue',
                      "DaysReminder": e.DaysReminder,
                      "EventType": e.EventType,
                      "IsNotifyOnApproved": e.IsNotifyOnApproved,
                      "IsOnceApproval": e.IsOnceApproval,
                      "MinutesReminder": e.MinutesReminder,
                      "ReferId": e.ReferId,
                      "ActivityStatusId": e.ActivityStatusId,
                      "IsMailExecuted": e.IsMailExecuted,
                      "MailValidTime": e.MailValidTime,
                      "EventTypeId": e.EventTypeId,
                      extendedProps: {
                        Start: e.Start,
                        End: e.End,
                      }
                    }
                    return data
                  }}
                  height={lgUp ?
                    // 720
                    `calc(100vh - ${HEADER.DASHBOARD_DESKTOP_HEIGHT + BREAKCRUM_HEIGHT + SPACING + ANDROID_KEYBOARD + IOS_KEYBOARD + NOTCH_HEIGHT + TAB_HEIGHT + 24}px)`
                    : `calc(100vh - ${HEADER.MOBILE_HEIGHT + BREAKCRUM_HEIGHT + SPACING + ANDROID_KEYBOARD + IOS_KEYBOARD + NOTCH_HEIGHT + TAB_HEIGHT + 24}px)`}
                  plugins={[
                    listPlugin,
                    dayGridPlugin,
                    // timelinePlugin,
                    // timeGridPlugin,
                    // interactionPlugin,
                    // CustomView
                  ]}
                  dayHeaders
                  nowIndicator
                  unselectAuto
                  eventDidMount={(e) => {
                    handleRenderEventTimeDuration(e)
                  }}
                  displayEventTime
                  eventContent={(e) => {
                    if (view === 'dayGridMonth' && !isDesktop) {
                      return <Typography sx={{
                        fontSize: 11, fontWeight: 'bold',
                      }} >{e?.event?.title.slice(0, 6)}</Typography>
                    }
                    return <Typography sx={{ fontSize: 11, fontWeight: 'bold' }} noWrap>{e?.event?.title}</Typography>
                  }}
                />
              </Box>
            </Scrollbar>
          </StyledCalendar>
        </Card>
      </Container>

      <Dialog
        fullWidth
        open={openForm}
        onClose={handleCloseModal}
        id="calendar-form"
        sx={{
          '&.MuiPaper-root-MuiDialog-paper': {
            margin: '5px !important',
          },
        }}
        scroll={'paper'}
        aria-labelledby="scroll-dialog-title"
        aria-describedby="scroll-dialog-description"
      >
        {selectedEvent !== null &&
          <CalendarForm
            event={selectedEvent}
            selectedEventId={selectedEventId}
            range={selectedRange}
            onCancel={handleCloseModal}
            onCreateUpdateEvent={handleCreateUpdateEvent}
            onDeleteEvent={handleDeleteEvent}
            sysEnum={sysEnum}
            everyOne={everyOne}
            openForm={openForm}
            allowEditing={allowEditing}
            loginUserName={LoginUser?.UserName}
          />
        }

      </Dialog >


      <CalendarFilterDrawer
        events={events}
        picker={picker}
        openFilter={openFilter}
        colorOptions={COLOR_OPTIONS}
        onResetFilter={handleResetFilter}
        filterEventColor={filterEventColor}
        onCloseFilter={() => {
          setOpenFilter(false)
          picker.setStartDate(null)
          picker.setEndDate(null)
        }}
        onFilterEventColor={handleFilterEventColor}
        onSelectEvent={(eventId) => {
          // console.log(eventId)
          if (eventId) {
            handleOpenModal();
            // setSelectedEventId(eventId)
            dispatch(setSelectedEventId(eventId))
          }
        }}
        userId={LoginUser?.UserId}
        date={date}
        sysEnum={sysEnum}
        filterParticipant={filterParticipant}
        setFilterParticipant={setFilterParticipant}
        PARTICIPANT_OPTIONS={PARTICIPANT_OPTIONS}
        dataFiltered={dataFiltered}
      />
    </>
  );
}

// ----------------------------------------------------------------------

const useGetEvents = (userId, currentDate) => {
  const dispatch = useDispatch();
  const { pathname } = useLocation()

  const { events: data, sysEnum, everyOne, openForm, selectedEventId, } = useSelector((state) => state.calendar);

  const params = {
    // filter: JSON.stringify([["Start", ">=", moment(date).startOf('months').format('YYYY-MM-DD 00:00:00')], 'AND', ["End", "<=", moment(date).add(1, 'month').startOf('months').format('YYYY-MM-DD 00:00:00')]]),
    filter: JSON.stringify([["Start", ">=", moment(currentDate).subtract(1, 'months').startOf('months').format('YYYY-MM-DD 00:00:00')], 'AND', ["End", "<=", moment(currentDate).add(1, 'month').endOf('months').format('YYYY-MM-DD 00:00:00')]]),
  }

  const getAllEvents = useCallback(() => {
    dispatch(getEvents(userId, params));
    dispatch(getSysEnumElements());
    dispatch(getSharingModeEveryOne());
  }, [dispatch, userId, currentDate, pathname]);

  useEffect(() => {
    getAllEvents();
  }, [getAllEvents, currentDate, pathname]);

  const events = data.map((event) => ({
    ...event,
    textColor: event.color,
  }));

  return { events, sysEnum, everyOne, openForm, selectedEventId, };
};


// ----------------------------------------------------------------------

function applyFilter({ inputData, filterEventColor, filterParticipant, filterStartDate, filterEndDate, isError, }) {
  const stabilizedThis = inputData.map((el, index) => [el, index]);

  inputData = stabilizedThis.map((el) => el[0]);

  if (filterEventColor.length) {
    inputData = inputData.filter((event) => filterEventColor.includes(event.Color));
  }

  if (filterParticipant.length) {
    inputData = inputData.filter((event) => filterParticipant.includes(event.Type));
  }

  // if (filterStartDate && filterEndDate && !isError) {
  //   inputData = inputData.filter(
  //     (event) =>
  //       fTimestamp(event.Start) >= fTimestamp(filterStartDate) &&
  //       fTimestamp(event.End) <= fTimestamp(filterEndDate)
  //   );
  // }

  return inputData;
}
