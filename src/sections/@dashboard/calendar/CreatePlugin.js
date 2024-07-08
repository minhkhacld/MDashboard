import { sliceEvents, createPlugin } from '@fullcalendar/core';
import { Box, Typography, Stack, styled } from '@mui/material';
// import { keyframes } from "@emotion/react";
import { keyframes } from '@mui/system';
import moment from 'moment';
import _, { forEach } from 'lodash';
import { format } from 'date-fns'
import vi from 'date-fns/locale/vi'
import { useEffect, memo, useState, useCallback, useRef } from 'react';
import { setDate, getAndExpandEvents, setOpenForm, setSelectedEventId } from '../../../redux/slices/calendar';
import { dispatch, useSelector } from '../../../redux/store';
import Image from '../../../components/Image';
import axios from '../../../utils/axios';
import Iconify from '../../../components/Iconify';
// cover
import january from '../../../assets/images/january.jpeg';
import february from '../../../assets/images/february.jpeg';
import march from '../../../assets/images/march.jpeg';




const MONTH_LIST = [
    { month: 'Jan', image: january },
    { month: 'Feb', image: february },
    { month: 'Mar', image: march },
    { month: 'Apr', image: '../../../assets/images/january.jpeg' },
    { month: 'May', image: '../../../assets/images/january.jpeg' },
    { month: 'Jun', image: '../../../assets/images/january.jpeg' },
    { month: 'Jul', image: '../../../assets/images/january.jpeg' },
    { month: 'Aug', image: '../../../assets/images/january.jpeg' },
    { month: 'Sep', image: '../../../assets/images/january.jpeg' },
    { month: 'Oct', image: '../../../assets/images/january.jpeg' },
    { month: 'Nov', image: '../../../assets/images/january.jpeg' },
    { month: 'Dec', image: '../../../assets/images/january.jpeg' },
]

const dataArray = [
    {
        "Id": 179,
        "CreatedBy": "baphu.motives@outlook.com",
        "CreatedDate": "2023/05/09 10:14:16",
        "LastModifiedBy": "gagole@motivesvn.com",
        "LastModifiedDate": "2023/05/11 01:55:39",
        "Guid": "ff3b09bd-c590-432f-ba96-c4feda396c42",
        "IsDeleted": false,
        "Title": "Cầu lông ",
        "AllDay": false,
        "Description": "Quang bị defeat tới hết tháng",
        "Start": "2023/05/09 17:20:34",
        "End": "2023/05/31 18:20:34",
        "Location": "Rubi",
        "SharingModeId": 69021,
        "ActivityStatus": null,
        "Color": "#6E34CC",
        "DaysReminder": 0,
        "EventType": "Business Trip",
        "IsNotifyOnApproved": false,
        "IsOnceApproval": true,
        "MinutesReminder": 5,
        "ReferId": null,
        "ActivityStatusId": 69176,
        "IsMailExecuted": false,
        "MailValidTime": "2023/05/12 17:14:16",
        "EventTypeId": 69172,
        "Type": "Optional"
    },
    {
        "Id": 180,
        "CreatedBy": "baphu.motives@outlook.com",
        "CreatedDate": "2023/05/09 10:18:27",
        "LastModifiedBy": "gagole@motivesvn.com",
        "LastModifiedDate": "2023/05/10 01:50:53",
        "Guid": "3a3027de-00bb-4563-a1da-90123ab503f6",
        "IsDeleted": false,
        "Title": "Cầu long",
        "AllDay": false,
        "Description": "Long yyyyyyyy và các cháu có khỏe ",
        "Start": "2023/05/09 17:25:16",
        "End": "2023/05/09 18:25:16",
        "Location": "Vcl i can ",
        "SharingModeId": 69021,
        "ActivityStatus": null,
        "Color": "#FFB800",
        "DaysReminder": 0,
        "EventType": "Meeting",
        "IsNotifyOnApproved": true,
        "IsOnceApproval": true,
        "MinutesReminder": 5,
        "ReferId": null,
        "ActivityStatusId": 69176,
        "IsMailExecuted": false,
        "MailValidTime": "2023/05/12 17:18:27",
        "EventTypeId": 69475,
        "Type": "Optional"
    },
    {
        "Id": 181,
        "CreatedBy": "gagole@motivesvn.com",
        "CreatedDate": "2023/05/10 02:19:04",
        "LastModifiedBy": "gagole@motivesvn.com",
        "LastModifiedDate": "2023/05/10 02:39:04",
        "Guid": "f0986020-f04f-454f-875f-76bff0b8086c",
        "IsDeleted": false,
        "Title": "Gago Test 1",
        "AllDay": false,
        "Description": "New Event",
        "Start": "2023/05/10 09:17:52",
        "End": "2023/05/10 09:17:52",
        "Location": "Motives",
        "SharingModeId": 69021,
        "ActivityStatus": null,
        "Color": null,
        "DaysReminder": 0,
        "EventType": "Meeting",
        "IsNotifyOnApproved": true,
        "IsOnceApproval": true,
        "MinutesReminder": 30,
        "ReferId": null,
        "ActivityStatusId": 69176,
        "IsMailExecuted": false,
        "MailValidTime": "2023/05/13 09:19:04",
        "EventTypeId": 69475,
        "Type": "Optional"
    },
    {
        "Id": 183,
        "CreatedBy": "",
        "CreatedDate": "2023/05/10 02:52:34",
        "LastModifiedBy": "",
        "LastModifiedDate": "2023/05/10 02:53:01",
        "Guid": "392a8b35-ab69-42e6-b587-d5e96e73aecc",
        "IsDeleted": false,
        "Title": "❤😍🐱‍👓 Gagp Add new 15/05",
        "AllDay": false,
        "Description": "Test",
        "Start": "2023/05/15 10:11:19",
        "End": "2023/05/15 11:11:19",
        "Location": "VP Motives",
        "SharingModeId": 69022,
        "ActivityStatus": null,
        "Color": "#FF0000",
        "DaysReminder": 2,
        "EventType": "BOD Activity",
        "IsNotifyOnApproved": true,
        "IsOnceApproval": true,
        "MinutesReminder": 0,
        "ReferId": null,
        "ActivityStatusId": 69176,
        "IsMailExecuted": false,
        "MailValidTime": "2023/05/13 09:52:08",
        "EventTypeId": 69173,
        "Type": "Creator"
    },
    {
        "Id": 188,
        "CreatedBy": "higochu@motivesvn.com",
        "CreatedDate": "2023/05/15 03:12:39",
        "LastModifiedBy": "higochu@motivesvn.com",
        "LastModifiedDate": "2023/05/15 03:12:39",
        "Guid": "f9751279-c11f-491e-974f-772be2753c61",
        "IsDeleted": false,
        "Title": "Test event June",
        "AllDay": false,
        "Description": "Test",
        "Start": "2023/06/02 10:11:51",
        "End": "2023/06/05 11:11:51",
        "Location": "VP motive",
        "SharingModeId": 69021,
        "ActivityStatus": null,
        "Color": "#FFB800",
        "DaysReminder": 0,
        "EventType": "Meeting",
        "IsNotifyOnApproved": true,
        "IsOnceApproval": true,
        "MinutesReminder": 0,
        "ReferId": null,
        "ActivityStatusId": 69176,
        "IsMailExecuted": false,
        "MailValidTime": "2023/05/18 10:12:37",
        "EventTypeId": 69475,
        "Type": "Creator"
    }
]



const ImageCover = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'isCollapse',
})(({ image, theme }) => ({
    // "@keyframes scrollToTop": {
    //     from: {
    //         // transform: "translateY(0px)",
    //         backgroundPositionY: "50px",
    //     },
    //     to: {
    //         // transform: "translateY(-80px)",
    //         backgroundPositionY: "-50px",
    //     }
    // },
    // "@keyframes scrollToBottom": {
    //     from: {
    //         // transform: "translateY(-80px)",
    //         backgroundPositionY: "-50px",
    //     },
    //     to: {
    //         // transform: "translateY(0px)",
    //         backgroundPositionY: "50px",
    //     }
    // },
    position: 'inherit',
    backgroundImage: `url(${image})`,
    width: '100%',
    height: '150%',
    minHeight: 150,
    backgroundSize: 'cover',
    backgroundAttachment: 'scroll',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    '&.scroll-top': {
        animation: `scrollToTop 2s linear`,
        transition: "1s all ease",
    },
    '&.scroll-bottom': {
        animation: `scrollToBottom 2s linear`,
        transition: "1s all ease",
    },
}));

const scrollToTop = keyframes`
  from {
    transform: translateY(-20px);
  }
  to{
    transform: translateY(-50px);
  }
`;

const scrollToBottom = keyframes`
  from {
    transform: translateY(-50px);
  }
  to {
    transform: translateY(-2px);
  }
`;

const CustomView = ({ props }) => {

    const { date, events } = useSelector(store => store.calendar);
    const { LoginUser } = useSelector(store => store.workflow);
    const [eventData, setEventData] = useState([]);
    const [scrollPostion, setScrollPostition] = useState(0)

    const [eventStore, setEventStore] = useState(events || []);

    const fetchData = useCallback(async () => {
        const params = {
            filter: JSON.stringify([["Start", ">=", moment().startOf('year').format('YYYY-MM-DD 00:00:00')], 'AND', ["End", "<=", moment().endOf('year').format('YYYY-MM-DD 00:00:00')]]),
        }
        const response = await axios.get(`/api/CalendarMobileApi/GetCalendarItemsByUserId/${LoginUser?.UserId}`
            , { params }
        );
        return response || []
    }, []);

    useEffect(() => {
        fetchData().then(eventList => {
            // console.log(eventList)
            let result = []
            if (eventList.data.data.length > 0) {
                (eventList?.data?.data || []).forEach(event => {
                    const dateDiff = moment(event.End).diff(event.Start, 'days');
                    if (dateDiff > 0) {
                        [...new Array(dateDiff)].forEach((day, index) => {
                            if (index === 0) {
                                // console.log('=0', index)
                                result = [...result, {
                                    ...event,
                                    Start: event?.Start,
                                    End: moment(event.Start).endOf('days').format('YYYY-MM-DD HH:mm:ss'),
                                }]
                            }
                            if (index > 0 && index < dateDiff - 1) {
                                // console.log('>0&&<', index)
                                result = [...result, {
                                    ...event,
                                    Start: moment(event.Start).add(index, 'days').startOf('days').format('YYYY-MM-DD HH:mm:ss'),
                                    End: moment(event.Start).add(index, 'days').endOf('days').format('YYYY-MM-DD HH:mm:ss'),
                                }]
                            }
                            if (index === dateDiff - 1) {
                                // console.log('>', index)
                                result = [...result, {
                                    ...event,
                                    Start: moment(event.End).startOf('days').format('YYYY-MM-DD HH:mm:ss'),
                                    End: event.End,
                                }]
                            }
                        })
                    } else {
                        result.push(event)
                    }
                });

                const groupByMonth = _.chain(result).groupBy(o => {
                    return moment(o.Start).format('MMM - YYYY')
                }).map((eventList, monthName) => {
                    return {
                        eventList: _.chain(eventList).groupBy(o => {
                            return moment(o.Start).lang('vi').format(
                                `dddd, DD - MM`)

                        }).map((dayList, dayName) => {
                            return {
                                dayList,
                                dayName
                            }
                        }).sortBy(o => moment(o.Start), 'asc').value(),
                        monthName
                    }
                }).sortBy(o => moment(o.Start), 'asc').value();

                const FullMonth = MONTH_LIST.map(d => {
                    const monthExist = groupByMonth.find(v => d.month === v.monthName.slice(0, 3))
                    if (monthExist) {
                        return {
                            ...d,
                            ...monthExist
                        }
                    }
                    return {
                        ...d,
                        monthName: `${d.month} - ${moment().year()}`,
                        eventList: []
                    }
                })

                // console.log(groupByMonth, FullMonth)
                setEventData(FullMonth)
            }
        })
        // throw new Error('new error occurred!');
    }, []);

    useEffect(() => {
        const currentMonth = document.getElementById(`${moment().format('MMM - YYYY')}`);
        // console.log('currentMonth', currentMonth)
        if (currentMonth) {
            currentMonth.scrollIntoView({ behavior: 'smooth', block: 'center', inline: "nearest" })
        }
    }, [eventData,]);

    // console.log(props)
    const hanldeScroll = (e) => {

        const monthCover = document.querySelectorAll('.month-cover-image');
        const { scrollHeight, scrollTop, clientHeight, } = e.target;

        // console.log('scrolled to bottom', scrollHeight, scrollTop, clientHeight,);

        monthCover.forEach(image => {
            if (scrollTop > scrollPostion) {
                // console.log('scrolled to bottom', scrollTop);
                image.classList.add('scroll-bottom');
                image.classList.remove('scroll-top');
                // image.style.backgroundPositionY = '10px';
                // image.style.animation = `${scrollToBottom} 2s ease`;

            } else {
                // console.log('scrolled to top', scrollTop,);
                image.classList.add('scroll-top');
                image.classList.remove('scroll-bottom');
                // image.style.backgroundPositionY = '-10px';
                // image.style.animation = `${scrollToTop} 2s ease`;

            }
            // image.style.backgroundPositionY = '-10px';
            // image.style.backgroundCover = 'contain';
            // image.style.transform = 'translateY(-20px)';

        });

        setScrollPostition(scrollTop);

        // // console.log(e)
        // const { scrollHeight, scrollTop, clientHeight, } = e.target;
        // // console.log('scroll', scrollHeight, scrollTop, clientHeight);
        // if (Math.abs(scrollHeight - clientHeight - scrollTop) < 1) {
        //     // console.log('scrolled to bottom', scrollHeight, scrollTop, clientHeight);
        //     const params = {
        //         filter: JSON.stringify([["Start", ">=", moment(date).startOf('months').format('YYYY-MM-DD 00:00:00')], 'AND', ["End", "<=", moment(date).add(1, 'month').startOf('months').format('YYYY-MM-DD 00:00:00')]]),
        //     }
        //     // dispatch(setDate(moment(date).add(1, 'months').format('YYYY-MM-DD 00:00:00')));
        //     // dispatch(getAndExpandEvents(LoginUser.UserId, params));
        // };

        // if (scrollTop === 0) {
        //     // console.log('scrolled to top', scrollHeight, scrollTop, clientHeight);
        //     const params = {
        //         filter: JSON.stringify([["Start", ">=", moment(date).startOf('months').format('YYYY-MM-DD 00:00:00')], 'AND', ["End", "<=", moment(date).add(1, 'month').startOf('months').format('YYYY-MM-DD 00:00:00')]]),
        //     }
        //     // dispatch(setDate(moment(date).subtract(1, 'months').format('YYYY-MM-DD 00:00:00')))
        //     // dispatch(getAndExpandEvents(LoginUser.UserId, params));
        // };
    };


    // const mockData = _.chain([...new Array(20)].map((d, index) => ({
    //     extendedProps: {
    //         Start: moment().add(index + 1, 'month'),
    //         End: moment().add(index + 1, 'month'),
    //     },
    //     title: Math.random() * 100,
    //     defId: `${Math.random() * 100}`,
    // }))).groupBy(o => {
    //     return moment(o.extendedProps.Start).format('MMM - YYYY')
    // }).map((eventList, monthName) => {
    //     return {
    //         eventList,
    //         monthName
    //     }
    // }).value();

    const hanldeClickEvent = (event) => {
        dispatch(setOpenForm(true));
        dispatch(setSelectedEventId(event?.Id));
    };


    // console.log(eventData,scrollToBottom);

    return (
        <Stack sx={{
            width: '100%',
            height: '100%',
            p: 1,
            overflowY: 'scroll',
        }}
            spacing={2}
            onScroll={(e) => hanldeScroll(e)}
        >
            {
                eventData.length > 0 &&
                eventData.map(event => {
                    return (
                        <Stack key={event?.monthName} spacing={1} id={event?.monthName}>
                            <Box sx={{
                                position: 'relative',
                                overflow: 'hidden',
                                zIndex: -1,
                                height: 100,
                            }}>

                                <ImageCover
                                    className='month-cover-image'
                                    image={event?.image}
                                />
                                <Typography sx={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%,-50%)',
                                    color: theme => theme.palette.primary.main
                                }} variant='title' fontWeight={'bold'}>{event?.monthName}</Typography>
                            </Box>

                            {
                                event?.eventList.length > 0 ? event?.eventList.map((ent, index) => {
                                    return (
                                        <Stack key={index} spacing={2} >
                                            <Stack direction={'row'} justifyContent='space-between' sx={{
                                                backgroundColor: theme => theme.palette.grey[200], p: 1,
                                            }}>
                                                <Typography variant='subtitle2'>{ent?.dayName}</Typography>
                                            </Stack>
                                            {
                                                ent.dayList.map(dayEnv => {
                                                    return (
                                                        <Stack direction={'row'} key={dayEnv?.Id} spacing={2} onClick={() => hanldeClickEvent(dayEnv)} p={1}>
                                                            <Box width={'35%'}
                                                                sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}
                                                            >
                                                                <Typography variant='caption' noWrap>{moment(dayEnv?.Start).format('HH:mm')} - {moment(dayEnv?.End).format('HH:mm')} </Typography>
                                                            </Box>
                                                            <Box width={'15%'} sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                                                                <Box
                                                                    sx={{
                                                                        width: 15,
                                                                        height: 15,
                                                                        borderRadius: '50%',
                                                                        backgroundColor: dayEnv?.Color
                                                                    }}
                                                                />
                                                            </Box>
                                                            <Box width={'50%'} sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                                                                <Typography variant='caption'>{dayEnv?.Title}</Typography>
                                                            </Box>
                                                        </Stack>
                                                    )
                                                })
                                            }
                                        </Stack>
                                    )
                                }) :
                                    <Stack with='100%'
                                        sx={{
                                            width: '100%',
                                            justifyContent: 'center',
                                            alignItems: 'center'
                                        }}
                                        spacing={2}
                                    >
                                        <Box sx={{
                                            width: '100%',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center'
                                        }}>
                                            <Iconify icon={'fluent:clock-alarm-32-filled'} sx={{
                                                fontSize: 30,
                                                color: theme => theme.palette.primary.main
                                            }} />
                                        </Box>
                                        <Typography variant='caption'>No activity in this month</Typography>
                                    </Stack>
                            }

                        </Stack>
                    )
                })
            }
        </Stack>
    )
}

const CustomViewConfig = {
    classNames: ['custom-view'],
    content: (props) => {
        return <CustomView props={props} />
    }
}

export default createPlugin({
    views: {
        custom: CustomViewConfig
    }
});