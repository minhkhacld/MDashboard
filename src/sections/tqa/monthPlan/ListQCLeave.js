import _ from 'lodash';
import moment from 'moment';
import { useCallback, useEffect, useState } from 'react';
// store
import { Browser } from '@capacitor/browser';
import { Stack } from "@mui/material";
import Avatar from '@mui/material/Avatar';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Typography from '@mui/material/Typography';
import List from 'devextreme-react/list';
import { useSnackbar } from 'notistack';
// config

// utils
import axios from '../../../utils/axios';

// hooks
import useLocales from '../../../hooks/useLocales';
import useResponsive from '../../../hooks/useResponsive';



// ----------------------------------------------------------------
export default function ListQCLeave({ queryDate = new Date(), filterExpanded = true }) {

    // hooks
    const { translate } = useLocales();
    const { enqueueSnackbar } = useSnackbar();
    const lgUp = useResponsive('up', 'lg')

    // states
    const [loading, setLoading] = useState(false);
    const [qcLeaveList, setQcLeaveList] = useState([]);

    const getMapReport = useCallback(async (MonthPlan) => {
        try {

            setLoading(true);

            const postData = {
                "MonthPlan": moment(MonthPlan).format('YYYY-MM-DD'),
            };

            // const result = await axios.post('/api/PPTQAMobileApi/GetMapReport', postData);
            const result = await axios.post('/api/PPTQAMobileApi/GetTQALeave', postData)

            // console.log(result.data);
            // group by subfactory
            const groupByFactory = _.chain(result.data).groupBy(o => o.DepartmentId).map((items, key) => {
                // console.log(items)
                return {
                    key,
                    DepartmentName: items[0].DepartmentName,
                    SortOrder: items[0].SortOrder,
                    items,
                    // items: [...new Set(items.map(d => d.EmpFullName))].map(d => ({
                    //     EmpFullName: d,
                    //     IsLeave: items.find(v => v.QCHandlerName === d)?.IsLeave,
                    //     Picture: items.find(v => v.QCHandlerName === d)?.QCHandlerPicture,
                    // }))
                    //     .filter(v => v.IsLeave),
                }
            })
                .filter(o => o.items.length > 0)
                .orderBy(o => Number(o.SortOrder), ['asc']).value();

            // console.log(groupByFactory);

            setQcLeaveList(groupByFactory);
            setLoading(false);

        } catch (error) {
            console.error(error);
            setLoading(false);
            enqueueSnackbar(JSON.stringify(error), {
                variant: 'error',
                anchorOrigin: {
                    vertical: 'top',
                    horizontal: 'center',
                },
            });
        }
    }, []);

    useEffect(() => {
        getMapReport(queryDate);
    }, [queryDate]);

    const hanldeViewImage = async (data) => {
        await Browser.open({ url: data.Avatar });
    }


    const renderItem = (data) => {
        return (
            <ListItem alignItems="center" sx={{
                "&.MuiListItem-root": {
                    paddingLeft: "0px !important",
                    padddingRight: "0px !important",
                }
            }}

            >
                <ListItemAvatar onClick={() => hanldeViewImage(data)}>
                    <Avatar
                        alt="Remy Sharp"
                        src={data?.Avatar}
                        sx={{ width: 60, height: 60 }}
                    />
                </ListItemAvatar>
                <Stack>
                    <Typography variant='subtext' fontWeight="bold">{data?.EmpKnowAs}</Typography>
                    <Typography variant='subtext2'>{data?.EmpFullName}</Typography>
                </Stack>
            </ListItem>
        )
    };

    return (
        <List
            items={qcLeaveList}
            itemRender={renderItem}
            scrollingEnabled
            showScrollbar={'onScroll'}
            noDataText={"No QC leave information for this day"}
            focusStateEnabled={false}
            pageLoadMode="scrollBottom"
            elementAttr={{
                id: 'product_avtivities_line_list'
            }}
            height={() => {
                if (!filterExpanded) {
                    return "calc(100vh - 180px)"
                }
                return "calc(100vh - 500px)"
            }}
            width="100%"
            grouped
            groupRender={renderGroup}
            collapsibleGroups
        />
    )
}


function renderGroup(data) {
    return (
        <Stack>
            <Typography variant='subtitle' fontWeight="bold">{data?.DepartmentName}</Typography>
        </Stack>
    )
}