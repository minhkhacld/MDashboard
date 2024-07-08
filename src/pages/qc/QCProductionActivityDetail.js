import { Capacitor } from '@capacitor/core';
import { Box, Button, Container, IconButton, Skeleton, Stack, TextField, Typography, alpha, styled } from '@mui/material';
import { MobileDatePicker } from '@mui/x-date-pickers';
import { createStore } from 'devextreme-aspnet-data-nojquery';
import List from 'devextreme-react/list';
import DataSource from 'devextreme/data/data_source';
import { AnimatePresence, m } from 'framer-motion';
import moment from 'moment';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
// hooks
import { useSnackbar } from 'notistack';
import { HEADER, HOST_API, NOTCH_HEIGHT } from '../../config';
import useLocales from '../../hooks/useLocales';
import useResponsive from '../../hooks/useResponsive';
import useSettings from '../../hooks/useSettings';
// components
import AdvanceLoadingBackDrop from '../../components/AdvanceLoadingBackDrop';
import GoBackButton from '../../components/GoBackButton';
import Iconify from '../../components/Iconify';
import Page from '../../components/Page';
import PopupAddInlineProductionActivity from '../../sections/qc/production_activity/PopupAddInlineProductionActivity';
// utils
import ReactBottomSheet from '../../components/dialog/ReactBottomSheet';
import { useSelector } from '../../redux/store';
import axios, { handleRefreshToken } from '../../utils/axios';
import IconName from '../../utils/iconsName';


// ----------------------------------------------------------------

const BANER_HEIGHT = 100;
const BREAKCRUM_HEIGHT = 78;
const SPACING = 50;

const RootStyle = styled(List, {
    shouldForwardProp: (prop) => true,
})(({ theme }) => {
    return {
        height: `calc(100vh - ${HEADER.MOBILE_HEIGHT + BREAKCRUM_HEIGHT + SPACING + NOTCH_HEIGHT}px)`,
        paddingBottom: 30,
        [theme.breakpoints.up('lg')]: {
            height: `calc(100vh - ${HEADER.DASHBOARD_DESKTOP_HEIGHT + HEADER.DASHBOARD_DESKTOP_OFFSET_HEIGHT + BREAKCRUM_HEIGHT + SPACING + NOTCH_HEIGHT}px)`,
        },
        [theme.breakpoints.between('sm', 'lg')]: {
            height: `calc(100vh - ${HEADER.MOBILE_HEIGHT + BREAKCRUM_HEIGHT + SPACING + NOTCH_HEIGHT}px)`
        },
    }
});

// ----------------------------------------------------------------
const QCProductionActivityDetail = () => {

    // ref
    // const bottomSheetRef = useRef(null)
    const loadingRef = useRef(null);
    const popupRef = useRef(null);

    // hooks
    const { name } = useParams();
    const location = useLocation();
    const { enqueueSnackbar } = useSnackbar();
    const themeStretch = useSettings();
    const { translate } = useLocales();
    const mdUp = useResponsive('up', 'md');
    const smUp = useResponsive('up', 'sm');
    const navigate = useNavigate();
    const plaform = Capacitor.getPlatform();
    const isViewOnly = location?.state?.isViewOnly || false;
    const itemHeaderData = location?.state;

    // redux
    const { LoginUser } = useSelector(store => store.workflow);

    // states
    const [loading, setLoading] = useState({
        visible: false,
        messages: ''
    });
    const dataSourceRef = useRef(null);
    const [visible, setVisible] = useState(false);
    const [Employees, setEmployees] = useState([]);
    const [EnumElements, setEnumElements] = useState([]);

    // get data
    const callApi = async () => {
        try {

            setLoading({ visible: true, messages: 'Loading...' });
            const getEmployeeListResponse = await axios
                .get(`${HOST_API}/api/PAMobileApi/GetEmployeeList`);
            const GetSysEnumElements = await axios.get(`${HOST_API}/api/PAMobileApi/GetSysEnumElements_ByEnumNames?enumNames=ProductionStatus,ProductionStage`);
            // console.log('GetSysEnumElements', GetSysEnumElements.data);
            setEmployees(getEmployeeListResponse.data?.data || []);
            setEnumElements(GetSysEnumElements.data);
            // await (() => {
            //     return new Promise((resolve, reject) => {
            //         setTimeout(() => {
            //             console.log("call api: Completed");
            //             resolve();
            //         }, 500);
            //     });
            // })();
            setLoading({ visible: false, messages: '' });
        } catch (error) {
            console.error(error);
            // enqueueSnackbar(JSON.stringify(error), {
            //     variant: 'error',
            // });
            setLoading({ visible: false, messages: '' });
        }
    };


    // stores
    const storeDataSource = useMemo(() => {
        const API_URL = `${HOST_API}/api/PAMobileApi/GetPAListByProductionScheduleLineId/${name}`;
        return new DataSource({
            store: createStore({
                key: 'Id',
                loadUrl: API_URL,
                insertUrl: API_URL,
                updateUrl: API_URL,
                deleteUrl: API_URL,
                onBeforeSend: (method, ajaxOptions) => {
                    const newAccessToken = localStorage.getItem('accessToken');
                    ajaxOptions.headers = { Authorization: `Bearer ${newAccessToken}` };
                },
                onAjaxError: async (e) => {
                    console.log('onAjaxError', e);
                    const statusCode = e.httpStatus;
                    // Handle token expiration error (e.g., 401 Unauthorized)
                    if (statusCode === 401) {
                        // Refresh the access token
                        const newAccessToken = await handleRefreshToken();
                        // Retry the request with the new access token
                        e.component.load({ headers: { Authorization: `Bearer ${newAccessToken}` } });
                    }
                }
            }),
            requireTotalCount: false,
            // skip: 0,
            // take: 30,
            sort: [{ selector: 'SortOrder', desc: false }],
            group: [{ selector: 'ReportDate', isExpanded: true, desc: true }],
            paginate: true,
            pageSize: 20,
        });
    }, [name, !visible,]);



    // LOAD FORM DEFAULT VALUES
    useEffect(() => {
        callApi();
    }, []);


    // handle goback
    const handlegoback = () => {
        navigate(-1)
    };

    // add new report 
    const onOpen = async () => {
        setVisible(true);
        popupRef.current.show();
    };


    // right button
    const rightButton = (<Button
        variant='outlined'
        startIcon={<Iconify icon={IconName.pluseSquare} />}
        onClick={onOpen}
        disabled={isViewOnly}
    >New report</Button>)


    const handleDisplayAuditor = (item, index) => {
        const element = document.getElementById(`auditor-section-${item?.key}-${index}`);
        const chevon = document.getElementById(`group-panel-chevon-${item?.key}-${index}`);
        const isHiden = !element.classList.contains('active');
        if (isHiden) {
            element.style.display = "block";
            chevon.style.rotate = '-180deg';
            chevon.style.transition = 'rotate 0.1s ease';
            element.classList.add('active');
        } else {
            element.style.display = "none"
            chevon.style.rotate = '0deg';
            chevon.style.transition = 'rotate 0.1s ease';
            element.classList.remove('active');
        };
    };

    const handleScroll = (e) => {
        // console.log(e);
    }

    // console.log(itemHeaderData);


    return (
        <Page title={translate('qcs.inspList.pageTitle')}>

            <Container
                maxWidth={'lg'}
                sx={{
                    paddingLeft: 1,
                    paddingRight: 1,
                    position: mdUp ? 'relative' : 'fixed'
                }}
                id="qc_ins_page_container"
            >

                <GoBackButton
                    onClick={handlegoback}
                    disabled={isViewOnly}
                    rightButton={rightButton}
                    sx={{ marginBottom: 1, zIndex: 2 }}
                />


                <div style={{ position: 'relative' }}>

                    <HeaderTemplate
                        data={itemHeaderData}
                    />

                    <RootStyle
                        dataSource={storeDataSource}
                        itemRender={(data, index) => <ItemTemplate
                            data={data}
                            index={index}
                            mdUp={mdUp}
                            handleDisplayAuditor={handleDisplayAuditor}
                            isViewOnly={isViewOnly}
                            dataSourceRef={dataSourceRef}
                            EnumElements={EnumElements}
                            enqueueSnackbar={enqueueSnackbar}
                            loadingRef={loadingRef}
                            popupRef={popupRef}
                            Employees={Employees}
                            // bottomSheetRef={bottomSheetRef}
                            loading={loading}
                            headerId={itemHeaderData?.Id}
                        />}
                        searchEnabled={false}
                        searchExpr={['ReporterName']}
                        searchMode='contains'
                        searchTimeout={1500}
                        scrollingEnabled
                        showScrollbar={'onScroll'}
                        noDataText={translate('noDataText')}
                        focusStateEnabled={false}
                        collapsibleGroups
                        pageLoadMode="scrollBottom"
                        elementAttr={{
                            id: 'product_avtivities_line_list'
                        }}
                        ref={dataSourceRef}
                        onScroll={handleScroll}
                    />

                </div>


                <PopupAddInlineProductionActivity
                    visible={visible}
                    setVisible={setVisible}
                    Employees={Employees}
                    translate={translate}
                    mdUp={mdUp}
                    isViewOnly={isViewOnly}
                    enqueueSnackbar={enqueueSnackbar}
                    navigate={navigate}
                    id={name}
                    storeDataSource={storeDataSource}
                    ref={popupRef}
                    headerId={itemHeaderData?.Id}
                />


                <AdvanceLoadingBackDrop
                    loading={loading.visible}
                    text={loading.messages}
                    width='100%'
                    height='100%'
                    ref={loadingRef}
                />

            </Container>

        </Page>
    )
}

export default QCProductionActivityDetail;


// RENDER LIST HEADER
function HeaderTemplate({ data, headerStyle, }) {

    // hooks
    const mdUp = useResponsive('up', 'md');
    // states
    const [expand, setExpand] = useState(true);

    const isCurrentDate = moment().diff(data?.ReportDate, 'days') >= 0;

    const handleClickItem = () => {
        setExpand(!expand);
    };

    useEffect(() => {

        const el = document.getElementById('product_avtivities_line_list');
        // const height = el.getBoundingClientRect().height;

        const setHeight = (bannerHeight = 0) => {
            if (mdUp) {
                return `calc(100vh - ${HEADER.DASHBOARD_DESKTOP_HEIGHT + HEADER.DASHBOARD_DESKTOP_OFFSET_HEIGHT + BREAKCRUM_HEIGHT + SPACING + NOTCH_HEIGHT - bannerHeight}px)`;
            }
            return `calc(100vh - ${HEADER.MOBILE_HEIGHT + BREAKCRUM_HEIGHT + SPACING + NOTCH_HEIGHT - bannerHeight}px)`;
        }

        if (expand) {
            el.style.height = setHeight(0);
            el.style.transition = `height 1s ease-in-out`;
        }

        if (!expand) {
            el.style.height = setHeight(40);
            el.style.transition = `height 1s ease-in-out`;
        }

    }, [expand])

    return (
        <AnimatePresence>

            <Stack
                component={m.div}
                sx={{
                    borderRadius: 2,
                    border: theme => `1px solid ${theme.palette.divider}`,
                    p: 1,
                    mb: 1,
                    zIndex: theme => theme.zIndex.appBar,
                    justifyContent: 'center',
                    alignItems: 'center',
                    overflow: 'hidden',
                    backgroundColor: 'white',
                }}
                position={'relative'}
                initial={{ height: BANER_HEIGHT }}
                animate={{ height: !expand ? 40 : BANER_HEIGHT }}
                transition={{ duration: 0.5 }}
                exit={{ height: BANER_HEIGHT }}
            >

                <Stack direction="row" justifyContent="flex-start" alignItems={'center'} zIndex={1} width={'100%'} >
                    <Typography
                        variant="caption"
                        paragraph
                        sx={{ color: (theme) => theme.palette.error.dark }}
                        fontWeight={'bold'}
                        mb={0}
                    >
                        Sub Factory: {`${data?.Factory}`}
                    </Typography>
                </Stack>

                <Stack direction="row" justifyContent="space-between" alignItems={'center'} zIndex={1} width={'100%'}
                    component={m.div}
                    initial={{ height: 'auto' }}
                    animate={{ height: !expand ? 0 : 'auto' }}
                    transition={{ duration: 0.5 }}
                    exit={{ height: 'auto' }}
                >

                    <Stack direction="column" justifyContent="flex-start" width={'60%'}>

                        <Box
                            component={m.div}
                            initial={{ opacity: 1 }}
                            animate={{ opacity: !expand ? 0 : 1 }}
                            transition={{ duration: 0.5 }}
                            exit={{ opacity: 1 }}
                        >
                            <Typography variant="caption" paragraph mb={0} sx={{ wordBreak: 'break-word' }} whiteSpace="normal">
                                Style No: {`${data?.StyleNo}`}
                            </Typography>
                            <Typography variant="caption" paragraph mb={0} whiteSpace='normal' overflow={'hidden'}>
                                PO: {`${data?.CustomerPO}`} - QTY: {data?.Quantity}
                            </Typography>
                            <Typography variant="caption" paragraph mb={0}>
                                Delivery date: {`${data?.DeliveryDate}`}
                            </Typography>
                        </Box>


                    </Stack>

                    <Stack display={'flex'} direction="column" justifyContent="flex-start" alignItems={'flex-start'} position={'relative'} height={expand ? '100%' : 'auto'}>
                        <Typography
                            variant="caption"
                            paragraph
                            fontWeight={'bold'}
                            sx={{ color: theme => theme.palette[isCurrentDate ? 'success' : 'error'].dark }}
                            component={m.p}
                            initial={{}}
                            animate={{ transform: !expand ? 'translate(-35px,-2px)' : 'translate(0px,0px)', }}
                            transition={{ duration: 0.5 }}
                            exit={{}}
                        >
                            {`${data?.ReportDate}`}
                        </Typography>
                    </Stack>

                </Stack>

                <IconButton
                    onClick={handleClickItem}
                    sx={{ position: 'absolute', right: 1, bottom: 1, cursor: 'pointer', zIndex: 1000 }}
                    focusRipple={false}
                >
                    <Iconify icon={IconName.chevronDown} sx={{
                        transform: expand ? 'rotate(180deg)' : 'rotate(0deg)',
                        color: 'gray',
                    }} />
                </IconButton>

            </Stack>

        </AnimatePresence >
    );
};


// item template
const ItemTemplate = ({
    data,
    index,
    mdUp,
    handleDisplayAuditor,
    isViewOnly,
    dataSourceRef,
    EnumElements = [],
    enqueueSnackbar,
    loadingRef,
    popupRef,
    Employees,
    loading,
    headerId,
    // bottomSheetRef,
}) => {



    // ref
    const bottomSheetRef = useRef(null);

    const ProductionStage = EnumElements.find(d => d.Name === "ProductionStage")?.Elements || [];
    const ProductionStatus = EnumElements.find(d => d.Name === "ProductionStatus")?.Elements || [];

    const [itemData, setItemData] = useState({ key: null, items: [] });
    const [isEditing, setIsEditing] = useState(false);
    const [isItemChanged, setItemChanged] = useState(false);

    useEffect(() => {
        setItemData(data);
    }, [data]);

    const handleChangeHeaderVisibility = () => {
        handleDisplayAuditor(data, index);
        setIsEditing(false);
        setItemChanged(false);
    }

    // change Production Activity Line daily quantiy
    const handleChangeDailyQty = (e, item,) => {
        setItemData({
            ...itemData,
            items: itemData.items.map(d => {
                if (d.Id === item.Id) {
                    return {
                        ...d,
                        DailyQuantity: Number(e.target.value),
                    }
                }
                return d;
            })
        });
        if (!isItemChanged) {
            setItemChanged(true);
        }
    };

    // change Production Activity Line total quantiy
    const handleChangeTotalQty = (e, item,) => {
        setItemData({
            ...itemData,
            items: itemData.items.map(d => {
                if (d.Id === item.Id) {
                    return {
                        ...d,
                        TotalQuantity: Number(e.target.value),
                    }
                }
                return d;
            })
        })
        if (!isItemChanged) {
            setItemChanged(true);
        }
    };


    // change Production Activity Line
    const handleSaveItemState = async (item) => {

        if (item.StatusName === 'Finished') {
            const findStatus = ProductionStatus.find(d => d.Caption === "InProcess");
            setItemData({
                ...itemData,
                items: itemData.items.map(d => {
                    if (d.Id === item.Id) {
                        return {
                            ...d,
                            ProductionStatusId: findStatus.Value,
                            StatusName: findStatus.Caption,
                        }
                    }
                    return d;
                })
            })
        }

        else if (item.StatusName === 'Open' || item.StatusName === 'InProcess') {
            const findStatus = ProductionStatus.find(d => d.Caption === "Finished");
            setItemData({
                ...itemData,
                items: itemData.items.map(d => {
                    if (d.Id === item.Id) {
                        return {
                            ...d,
                            ProductionStatusId: findStatus.Value,
                            StatusName: findStatus.Caption,
                        }
                    }
                    return d;
                })
            })
        }

        if (!isItemChanged) {
            setItemChanged(true);
        }

    };

    // Update Production Activity Line
    const handleSaveState = async (state) => {
        try {

            loadingRef.current?.display()
            const formData = new FormData();
            const postData = {
                "ProductionActivityStages": itemData.items.map(d => ({ Id: d.Id, DailyQuantity: d.DailyQuantity, ProductionStatusId: d.ProductionStatusId })),
                "ProductionActivityId": itemData.items[0]?.ProductionActivityId,
                "ReportDate": itemData.items[0]?.ReportDate,
                "ReporterId": Employees.find(d => d.EmployeeKnowAs === itemData.items[0]?.ReporterName)?.EmployeeId,
            }
            formData.append('values', JSON.stringify(postData));
            const response = await axios.post(`${HOST_API}/api/PAMobileApi/UpdatePALine`, formData);
            // console.log('response Update Production Activity Line', response.data);
            const getResult = await axios.get(`${HOST_API}/api/PAMobileApi/GetPALine/${itemData.items[0]?.ProductionActivityLineId}`);
            loadingRef.current?.dismiss();

            setIsEditing(false);
            setItemChanged(false);
            setItemData({
                ...itemData,
                items: itemData.items.map(d => {
                    const findItem = getResult.data.find(item => item.Id === d.Id);
                    if (findItem) {
                        return {
                            ...d,
                            TotalQuantity: findItem.TotalQuantity,
                        }
                    }
                    return d
                })
            });

        } catch (error) {
            console.error(error);
            enqueueSnackbar(JSON.stringify(error), {
                variant: 'error'
            });

            loadingRef.current?.dismiss();
        };
    };

    const handleReset = () => {
        setItemData(data);
        setItemChanged(false);
    };

    // open pop  up edit report
    const setEditingMode = () => {
        setIsEditing(!isEditing);
        const element = document.getElementById(`auditor-section-${data?.key}-${index}`);
        const chevon = document.getElementById(`group-panel-chevon-${data?.key}-${index}`);
        const isHiden = !element.classList.contains('active');
        if (isHiden) {
            element.style.display = "block";
            chevon.style.rotate = '-180deg';
            chevon.style.transition = 'rotate 0.1s ease';
            element.classList.add('active');
        }
    };


    // handle select handlers
    const handleSelectHandler = (handler) => {
        try {
            // const setItemState = () => {
            setItemData({
                ...itemData,
                items: itemData.items.map(d => ({
                    ...d,
                    ReporterName: handler?.EmployeeKnowAs
                }))
            });

            if (!isItemChanged) {
                setItemChanged(true);
            }
            // };

            // bottomSheetRef?.current?.onSelectedItem(setItemState);
        } catch (error) {
            console.error(error);
        }
    };

    // handle change date
    const handleChangeDate = (date) => {

        setItemData({
            ...itemData,
            key: moment(date).format('DD MMM YYYY'),
            items: itemData.items.map(d => ({
                ...d,
                ReportDate: moment(date).format('DD MMM YYYY'),
            }))
        });

        if (!isItemChanged) {
            setItemChanged(true);
        }
    };

    const showBottomSheet = () => {
        if (!isEditing) return;
        bottomSheetRef?.current.show(Employees);
    };


    return (

        <Stack sx={{ padding: 0 }}>

            {
                !loading.visible ?
                    <>
                        {/* // Header group */}
                        <Stack
                            display={'flex'}
                            direction='row'
                            justifyContent={'space-between'}
                            alignItems={'center'}
                            sx={{
                                backgroundColor: theme => theme.palette.grey[200],
                                px: 1,
                                py: 0.1,
                                borderRadius: 1,
                                minHeight: 40,
                            }}
                            id={`group-${data?.key}-${index}`}
                        >

                            <Stack direction='row' justifyContent={'space-between'} alignItems={'center'} spacing={2}>

                                <IconButton
                                    focusRipple={false}
                                    onClick={handleChangeHeaderVisibility}
                                >
                                    <Iconify icon={IconName.chevronDown} id={`group-panel-chevon-${data?.key}-${index}`} />
                                </IconButton>

                            </Stack>

                            <Box
                                width={mdUp ? '80%' : '90%'}
                                justifyContent={'flex-start'}
                                alignItems={'center'}
                            >
                                <Stack direction={'row'} justifyContent={'flex-start'} alignItems={'center'} spacing={1.0} overflow={'hidden'} width={'100%'}>

                                    {
                                        mdUp && <Typography>Date: </Typography>
                                    }

                                    {!isEditing
                                        ?
                                        <>
                                            <Box
                                                component={isEditing ? Typography : 'button'}
                                                noWrap
                                                sx={{
                                                    ...(isEditing && {
                                                        color: theme => theme.palette.info.dark,
                                                        backgroundColor: theme => alpha(theme.palette.info.dark, 0.16),
                                                        height: 22,
                                                        minWidth: 22,
                                                        lineHeight: 0,
                                                        borderRadius: 11,
                                                        cursor: 'default',
                                                        alignItems: 'center',
                                                        whiteSpace: 'nowrap',
                                                        display: 'inline-flex',
                                                        justifyContent: 'center',
                                                        padding: 1,
                                                    }
                                                    )
                                                }}
                                            >{itemData?.key !== null ? `${moment(itemData?.key).format('DD MMM YYYY')} -` : "Loading..."}</Box>
                                        </>
                                        :
                                        <CustomeDatePicker
                                            itemData={itemData}
                                            setItemData={setItemData}
                                            isItemChanged={isItemChanged}
                                            setItemChanged={setItemChanged}
                                            headerId={headerId}
                                        />
                                    }

                                    {
                                        mdUp &&
                                        <Typography>Reporter: </Typography>
                                    }


                                    <Box
                                        component={isEditing ? Typography : 'button'}
                                        noWrap
                                        onClick={() => showBottomSheet()}
                                        sx={{
                                            ...(isEditing && {
                                                // color: theme => theme.palette.info.dark,
                                                // backgroundColor: theme => alpha(theme.palette.info.dark, 0.16),
                                                cursor: 'default',
                                                alignItems: 'center',
                                                whiteSpace: 'nowrap',
                                                display: 'inline-flex',
                                                justifyContent: 'center',
                                                borderRadius: 1,
                                                padding: '2px 16px !important',
                                                backgroundColor: 'white',
                                                textAlign: 'left',
                                                border: theme => `1px solid ${theme.palette.divider} `,
                                            }
                                            ),
                                        }}>
                                        <Typography
                                            sx={{
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                display: '-webkit-box',
                                                WebkitLineClamp: '1',
                                                WebkitBoxOrient: 'vertical',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {itemData?.items[0]?.ReporterName}
                                        </Typography>
                                    </Box>

                                </Stack>

                            </Box>

                            <Stack spacing={2}>

                                <IconButton
                                    onClick={() => setEditingMode()}
                                    sx={{ color: theme => theme.palette[isEditing ? 'primary' : 'grey'].dark }}
                                    disabled={isViewOnly}
                                >
                                    <Iconify icon={IconName.edit} />
                                </IconButton>

                            </Stack>


                        </Stack >


                        <Box id={`auditor-section-${data?.key}-${index}`} display={'none'}>

                            <Box
                                sx={{
                                    padding: '0px',
                                    display: 'flex',
                                    justifyContent: 'flex-start',
                                    alignItems: 'center',
                                    mt: 2,
                                }}
                            >

                                <Stack
                                    direction="column"
                                    justifyContent="flex-end"
                                    alignItems={'flex-end'}
                                    width="100%"
                                    height={'100%'}
                                    spacing={3}
                                >

                                    {itemData.items.map((item, index) => (

                                        <Stack key={index} direction="row" justifyContent="center" alignItems={'center'} height="100%" spacing={2}>

                                            <TextField
                                                label={`Daily ${item.StateName} Qty`}
                                                size='small'
                                                type='number'
                                                InputProps={{ inputProps: { min: 0, inputMode: 'decimal', }, readOnly: isViewOnly, }}
                                                disabled={item?.StatusName === 'Finished' || !isEditing}
                                                value={item.DailyQuantity}
                                                onChange={(e) => handleChangeDailyQty(e, item)}
                                                InputLabelProps={{
                                                    style: {
                                                        color: 'var(--label)'
                                                    },
                                                    shrink: true,
                                                }}
                                            />

                                            <TextField
                                                label={`Total ${item.StateName} Qty`}
                                                size='small'
                                                type='number'
                                                InputProps={{ inputProps: { min: 0, inputMode: 'decimal', }, readOnly: isViewOnly }}
                                                disabled
                                                value={item.TotalQuantity}
                                                onChange={(e) => handleChangeTotalQty(e, item)}
                                                InputLabelProps={{
                                                    style: {
                                                        color: 'var(--label)'
                                                    },
                                                    shrink: true,
                                                }}
                                            />

                                            {isEditing &&
                                                <Button
                                                    variant='outlined'
                                                    sx={{ minWidth: 80, }}
                                                    onClick={() => handleSaveItemState(item)}
                                                    disabled={isViewOnly}
                                                // color={}
                                                >
                                                    {item?.StatusName === 'Open' || item?.StatusName === 'InProcess' ? 'Finish' : 'Reopen'}
                                                    {/* {item?.StatusName} */}
                                                </Button>
                                            }

                                        </Stack>
                                    )
                                    )
                                    }

                                    {isEditing &&
                                        <Stack
                                            width={'100%'}
                                            direction={'row'}
                                            sx={{
                                                justifyContent: {
                                                    xs: 'flex-end',
                                                    md: 'flex-end',
                                                },
                                                alignItems: {
                                                    xs: 'flex-end',
                                                    md: 'flex-end',
                                                },
                                            }}
                                            spacing={2}
                                        >
                                            <Button
                                                variant='contained'
                                                sx={{ minWidth: 80 }}
                                                color='error'
                                                onClick={() => handleReset(data)}
                                                disabled={isViewOnly || !isItemChanged}
                                            >
                                                Reset
                                            </Button>

                                            <Button
                                                variant='contained'
                                                sx={{ minWidth: 80 }}
                                                onClick={() => handleSaveState(data)}
                                                disabled={isViewOnly || !isItemChanged}
                                            >
                                                Save
                                            </Button>

                                        </Stack>
                                    }

                                </Stack>

                            </Box>

                        </Box>

                        <ReactBottomSheet
                            title="Select Handler"
                            onSelect={handleSelectHandler}
                            ref={bottomSheetRef}
                            displayExp="EmployeeKnowAs"
                        />

                    </>
                    :
                    [... new Array(8)].map((_, index) => (
                        <Skeleton key={index} variant='rectangular' width={'100%'} height={5} animation="wave" />
                    ))
            }

        </Stack >

    )
};



// CHANGE DATE PICKER COMPONENTS

const CustomeDatePicker = ({ itemData, setItemData, isItemChanged, setItemChanged, headerId }) => {

    const [curMonth, setCurMonth] = useState(moment(itemData.key));
    const [reportMonths, setReportMonths] = useState(null);
    const { enqueueSnackbar } = useSnackbar()

    useEffect(() => {

        const getReportByMonth = async () => {
            try {
                const response = await axios.get(`${HOST_API}/api/PAMobileApi/GetAllReportDateByMonth/${moment(curMonth).year()}/${moment(curMonth).month() + 1}/${headerId}`);
                setReportMonths(response.data)
                // console.log(response.data);
            } catch (error) {
                console.log(error);
                enqueueSnackbar(JSON.stringify(error), {
                    variant: 'error'
                })
            }
        }

        getReportByMonth();
        return () => {

        };

    }, [curMonth]);

    const shouldDisableDate = (date) => {
        if (!reportMonths) return false; // DataSource not loaded yet
        const isSameDate = reportMonths.some(item => moment(item.ReportDate).isSame(date) && !moment(item.ReportDate).isSame(itemData.key))
        return isSameDate;
    };

    // handle change date
    const handleChangeDate = (date) => {

        setItemData({
            ...itemData,
            key: moment(date).format('DD MMM YYYY'),
            items: itemData.items.map(d => {
                if (d.Id) {
                    return {
                        ...d,
                        ReportDate: moment(date).format('DD MMM YYYY'),
                    }
                }
                return d
            })
        });

        if (!isItemChanged) {
            setItemChanged(true);
        }

    };


    return (
        <MobileDatePicker
            onChange={(newValue) => {
                handleChangeDate(newValue);
            }}
            value={itemData?.key}
            label="Report date"
            inputFormat="dd/MM/yyyy"
            renderInput={(params) =>
                <TextField {...params}
                    size='small'
                    label=""
                    variant="outlined"
                    hiddenLabel
                    InputLabelProps={{
                        style: {
                            color: 'var(--label)'
                        }
                    }}
                    sx={{
                        maxWidth: 120,
                        '& .MuiInputBase-input': {
                            padding: '4px 4px !important',
                            backgroundColor: 'white',
                            textAlign: 'center',
                            borderRadius: 1,
                        }
                    }}
                />
            }
            shouldDisableDate={(date) => shouldDisableDate(date)}
            onMonthChange={(s) => setCurMonth(s)}
        />
    )
}