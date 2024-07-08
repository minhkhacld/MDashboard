import { useSnackbar } from 'notistack';
import { useLocation, useNavigate } from 'react-router-dom';
//
import { useCallback, useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
// @mui
import { Card, Container } from '@mui/material';
// redux
import { createEvent, deleteEvent, getSharingModeEveryOne, getSysEnumElements } from '../../redux/slices/calendar';
import { useDispatch, useSelector } from '../../redux/store';
// routes
import { PATH_APP } from '../../routes/paths';
// utils
// hooks
import useResponsive from '../../hooks/useResponsive';
// components

import { CustomBreadcrumbs } from '../../components/custom-breadcrumbs';
import { useDateRangePicker } from '../../components/date-range-picker';
import useSettings from '../../hooks/useSettings';

// sections
import Scrollbar from '../../components/Scrollbar';
import {
    CalendarEditForm
} from '../../sections/@dashboard/calendar';

// Configs

// ----------------------------------------------------------------------
// get date diff with momentjs?


// const COLOR_OPTIONS = [
//     '#00AB55', // theme.palette.primary.main,
//     '#1890FF', // theme.palette.info.main,
//     '#54D62C', // theme.palette.success.main,
//     '#FFC107', // theme.palette.warning.main,
//     '#FF4842', // theme.palette.error.main
//     '#04297A', // theme.palette.info.darker
//     '#7A0C2E', // theme.palette.error.darker
// ];
// ----------------------------------------------------------------------

export default function CalendarEditPage() {
    const { enqueueSnackbar } = useSnackbar();

    const { themeStretch } = useSettings();
    const navigate = useNavigate();

    const dispatch = useDispatch();

    const isDesktop = useResponsive('up', 'sm');
    const mdUp = useResponsive('up', 'md');
    const lgUp = useResponsive('up', 'lg');

    const calendarRef = useRef(null);

    const { sysEnum, everyOne } = useSysEnum();


    const location = useLocation();
    const {
        itemDetail } = location.state

    const [openForm, setOpenForm] = useState(false);

    const [selectedEventId, setSelectedEventId] = useState(null);

    const [selectedRange, setSelectedRange] = useState(null);

    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);

    const { events } = useSelector((store) => store.calendar);
    const selectedEvent = useSelector((store) => {
        if (selectedEventId) {
            return store.calendar.find((event) => event?.Id === selectedEventId);
        }
        return null;
    });

    const picker = useDateRangePicker(null, null);

    const [date, setDate] = useState(new Date());

    const [openFilter, setOpenFilter] = useState(false);

    const [filterEventColor, setFilterEventColor] = useState([]);


    const handleNavigate = (type) => {
        navigate(PATH_APP.calendar.event, { state: { events, type } })
    };

    const handleCreateUpdateEvent = (newEvent, attachments) => {
        const callBackMsg = (error, errorObj) => {
            if (error !== undefined) {
                return enqueueSnackbar(error, errorObj);
            }
            return enqueueSnackbar(itemDetail !== undefined ? 'Event updated' : 'Event created')
        }
        dispatch(createEvent(newEvent, attachments, callBackMsg, navigate));
        // navigate(-1)
    };

    const handleDeleteEvent = () => {
        try {
            if (selectedEventId) {
                dispatch(deleteEvent(selectedEventId));
                enqueueSnackbar('Delete success!');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const linkItems = [
        {
            name: 'Home',
            href: PATH_APP.general.app,
        },
        {
            name: 'Calendar',
            href: PATH_APP.calendar.activity,
        },
        {
            name: location?.state?.itemDetail ? 'Edit Event' : 'Add Event',
        },
    ];

    return (
        <>
            <Helmet>
                <title> Calendar Edit | M System</title>
            </Helmet>
            <Container maxWidth={themeStretch ? false : 'xl'} sx={{
                pl: 1, pr: 1,
                // position: mdUp ? 'relative' : 'fixed',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
            }}>
                <CustomBreadcrumbs
                    links={linkItems}
                    sx={{
                        mb: 1,
                        width: "100%",
                    }}
                />
                <Card sx={{
                    maxWidth: "md",
                    width: {
                        xs: '100%',
                        lg: '50%',
                    },
                }} >
                    <Scrollbar>
                        <CalendarEditForm
                            event={selectedEvent}
                            range={selectedRange}
                            onCancel={handleNavigate}
                            onCreateUpdateEvent={handleCreateUpdateEvent}
                            onDeleteEvent={handleDeleteEvent}
                            sysEnum={sysEnum}
                            everyOne={everyOne}
                        />
                    </Scrollbar>
                </Card>
            </Container>
        </>
    );
}

// ----------------------------------------------------------------------

const useSysEnum = () => {
    const dispatch = useDispatch();

    const { sysEnum, everyOne, } = useSelector((state) => state.calendar);

    const getAllEvents = useCallback(() => {
        dispatch(getSysEnumElements());
        dispatch(getSharingModeEveryOne());
    }, [dispatch,]);

    useEffect(() => {
        getAllEvents();
    }, [getAllEvents]);


    return { sysEnum, everyOne }
}