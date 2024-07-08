import { LoadingButton } from '@mui/lab';
import { Stack, Typography, styled } from '@mui/material';
import { createStore } from 'devextreme-aspnet-data-nojquery';
import List from 'devextreme-react/list';
import Popup from 'devextreme-react/popup';
import DataSource from 'devextreme/data/data_source';
import moment from 'moment';
import { useSnackbar } from 'notistack';
import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// components
import FilterPanel from '../../../components/tab/FilterPanel';
import { useSelector } from '../../../redux/store';
// hooks
import useLocales from '../../../hooks/useLocales';
// configs
import { HOST_API } from '../../../config';
// utils
import AdvanceLoadingBackDrop from '../../../components/AdvanceLoadingBackDrop';
import useResponsive from '../../../hooks/useResponsive';
import { PATH_APP } from '../../../routes/paths';
import axios, { handleRefreshToken } from '../../../utils/axios';

// ----------------------------------------------------------------
const RootStyledPopup = styled(Popup, { shouldForwardProp: props => props !== "item" })(({ theme }) => {
    return {
        width: '100%',
        height: `100%`,
        [theme.breakpoints.up('lg')]: {
            height: '80%',
        },
        [theme.breakpoints.between('md', 'lg')]: {
            height: '80%',
        },
        paddingBottom: 24,
    }
})

// ----------------------------------------------------------------
const PopupNewProductActivity = forwardRef((props, ref) => {

    // ref
    const listRef = useRef(null);
    useImperativeHandle(ref, () => {
        return {
            present: () => {
                setVisible(true);
            },
            dismiss: () => {
                setVisible(false)
            },
        }
    }, []);

    // hooks
    const { enqueueSnackbar } = useSnackbar();
    const { translate } = useLocales();
    const navigate = useNavigate();
    const smUp = useResponsive('up', 'sm')

    // redux
    const { LoginUser } = useSelector(store => store.workflow)
    const defaultFilter = [['StatusName', '<>', 'Finished']];

    // compoenents states
    const [visible, setVisible] = useState(false);
    const [filter, setFilter] = useState(defaultFilter);
    const [popupHeight, setPopupHeight] = useState(0);
    const [loading, setLoading] = useState(false);
    const [childPopup, setChildPopup] = useState({
        visible: false,
        data: null
    });

    const handlePopupShown = (e) => {
        const popupElement = e.component.content().parentElement;
        const height = popupElement.clientHeight;
        setPopupHeight(height);
    };

    // custom functions
    const onClose = () => {
        setVisible(false);
    };

    // stores
    const storeDataSource = useMemo(() => {
        const API_URL = `${HOST_API}/api/PAMobileApi/GetPSList/`;
        return new DataSource({
            store: createStore({
                // key: `Id`,
                key: ["Id", "ReporterName", "CustomerPO", "ReportDate"],
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
                },
            }),
            requireTotalCount: true,
            skip: 0,
            take: 30,
            sort: [
                { selector: 'DeliveryDate', desc: false },
            ],
            filter,
        });
    }, [filter]);

    const searchEditorOptions = useMemo(() => ({
        placeholder: `${translate('search')} Style, Factory, CustomerPO`,
        showClearButton: true
    }), []);

    const searchExpr = useMemo(() => (['StyleNo', 'Factory', 'CustomerPO']), []);

    // Get dataSource
    const getDataSource = async (values) => {
        try {

            const fieldContainValues = Object.keys(values).filter((key) => values[key] !== '' && values[key] !== null && values[key] !== undefined);

            if (fieldContainValues.length === 0) {
                setFilter(defaultFilter);
                return;
            };

            let filterObj = [];
            fieldContainValues.forEach((key, index) => {
                /* eslint-disable */
                if (key === 'CustomerPO') {
                    const arrayValues = values['CustomerPO'].split(',');
                    let result = [];
                    arrayValues.forEach((d, index) => {
                        if (index < arrayValues.length - 1) {
                            result = [...result, [`CustomerPO`, 'contains', d.trim()], 'OR'];
                        } else {
                            result = [...result, [`CustomerPO`, 'contains', d.trim()]];
                        }
                    });
                    filterObj = [...filterObj, result];
                } else if (key === 'Factory' || key === 'CustomerName' || key === 'SubFactoryName') {
                    if (index < fieldContainValues.length - 1) {
                        filterObj = [...filterObj, [`${key}`, '=', values[key]], 'AND'];
                    } else {
                        filterObj = [...filterObj, [`${key}`, '=', values[key]]];
                    }
                } else {
                    if (index < fieldContainValues.length - 1) {
                        filterObj = [...filterObj, [`${key}`, 'contains', values[key]], 'AND'];
                    } else {
                        filterObj = [...filterObj, [`${key}`, 'contains', values[key]]];
                    }
                }
            });

            // if filter value same with previous filter data
            if (filter !== null && _.isEqual(filter, filterObj)) {
                console.log('same values filter')
                return
            };

            setFilter([defaultFilter, 'AND', filterObj]);

        } catch (error) {
            console.error(error);
            enqueueSnackbar('Network error! Can not connect to server', {
                variant: 'error',
                anchorOrigin: {
                    vertical: 'top',
                    horizontal: 'center',
                },
            });

        }
    };



    // HANDLE ADD PRODUCTION ACTIVITY
    const handleAddProductionActivity = async () => {
        try {

            setLoading(true);
            const newselected = listRef.current.instance._selection.options.selectedItems;
            if (newselected.length === 0) {
                setLoading(false);
                return enqueueSnackbar('Please select at least 1 item!', {
                    variant: 'error',
                    anchorOrigin: {
                        vertical: 'top',
                        horizontal: 'center',
                    },
                });
            };

            const isProductionActivityExist = newselected.find(d => moment().diff(d?.ReportDate, 'days') === 0);
            if (isProductionActivityExist) {
                setLoading(false);
                setChildPopup({
                    visible: true,
                    data: newselected[0]
                });
                return
            }

            const response = await axios.post(`${HOST_API}/api/PAMobileApi/CreatePA/${newselected[0].Id}`);
            const getItemResones = await axios.get(`${HOST_API}/api/PAMobileApi/GetPSList/`, {
                params: {
                    filter: JSON.stringify(["Id", "=", newselected[0].Id])
                }
            });

            const item = getItemResones.data?.data[0];

            if (item) {
                navigate(PATH_APP.qc.production_activity.detail(newselected[0].Id), {
                    state: {
                        ...item,
                    }
                });

                enqueueSnackbar('New Production activity added!');

            } else {
                enqueueSnackbar('Not found item', {
                    variant: "error"
                });
            }

            setLoading(false);

        } catch (error) {

            setLoading(false)
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

    // Overide Activity
    const handleOverideProductionActivity = async () => {
        try {

            const getItemResones = await axios.get(`${HOST_API}/api/PAMobileApi/GetPSList/`, {
                params: {
                    filter: JSON.stringify(["Id", "=", childPopup.data?.Id])
                }
            });

            const item = getItemResones.data?.data[0];

            // open existing;
            if (LoginUser?.EmpKnowAs === childPopup.data?.ReporterName) {
                navigate(PATH_APP.qc.production_activity.detail(childPopup.data?.Id), {
                    state: {
                        ...item,
                    }
                });
            }

            // update reporter name;
            else {
                const formData = new FormData();
                const postData = {
                    "ProductionActivityId": childPopup.data?.Id,
                    "ReporterId": LoginUser?.EmpId,
                };
                formData.append('values', JSON.stringify(postData));
                const response = await axios.post(`${HOST_API}/api/PAMobileApi/UpdatePA/${childPopup.data?.Id}/${childPopup.data?.ReporterId}/${LoginUser?.EmpId}/${moment(childPopup.data?.ReportDate).format("YYYY-MM-DD")}`)
                navigate(PATH_APP.qc.production_activity.detail(childPopup.data?.Id), {
                    state: {
                        ...item,
                    }
                });
            };

            setLoading(false);
            setChildPopup({
                visible: false,
                data: null,
            })

        } catch (error) {
            setLoading(false)
            console.error(error);
            enqueueSnackbar(JSON.stringify(error), {
                variant: 'error',
                anchorOrigin: {
                    vertical: 'top',
                    horizontal: 'center',
                },
            });
        };
    };

    const ACCORDINATION = 22;
    const BUTTON_GROUP = 32;
    const SPACING = 130;
    const ListHeight = popupHeight - ACCORDINATION - BUTTON_GROUP - SPACING;

    // console.log(childPopup.data);

    return (
        <Popup
            width={smUp ? '70%' : '99%'}
            height={smUp ? '70%' : '90%'}
            visible={visible}
            onHiding={onClose}
            title='Add to Production Activity'
            closeOnOutsideClick={false}
            showCloseButton={!loading}
            onShown={handlePopupShown}
        >

            <div style={{ position: 'relative' }}>

                <FilterPanel
                    id="add_new_activity"
                    setDataSource={getDataSource}
                    storeDataSource={storeDataSource}
                />

                <List
                    dataSource={storeDataSource}
                    itemComponent={({ data }) => <ItemTemplate data={data} navigate={navigate} />}
                    searchExpr={searchExpr}
                    itemKeyFn={(item => `${String(item?.Id)}-${item?.ReporterName}-${item?.CustomerPO}-${item?.ReportDate}`)}
                    searchEnabled
                    scrollingEnabled
                    searchMode={'contains'}
                    noDataText={`${translate('noDataText')}. ${translate('useFilter')}`}
                    focusStateEnabled={false}
                    searchTimeout={1500}
                    pageLoadingText={translate("loading")}
                    pageLoadMode="scrollBottom"
                    showScrollbar={'onScroll'}
                    ref={listRef}
                    searchEditorOptions={searchEditorOptions}
                    height={ListHeight}
                    selectionMode='single'
                    showSelectionControls
                />

                <Stack
                    mt={2}
                    width={'100%'}
                    justifyContent={'flex-end'}
                    display={'flex'}
                    flexDirection={'row'}
                    alignItems={'center'}
                >
                    <LoadingButton
                        variant="contained"
                        color='primary'
                        onClick={handleAddProductionActivity}
                        disabled={loading}
                    >
                        Add
                    </LoadingButton>
                </Stack>

            </div>

            {loading &&
                <AdvanceLoadingBackDrop
                    loading={loading}
                    text='Creating new Production Activity report, please wait!'
                    width='100%'
                    height='100%'
                />}

            {
                childPopup.visible &&
                <Popup
                    width={smUp ? '50%' : '60%'}
                    height={'30%'}
                    minHeight={300}
                    minWidth={300}
                    visible={childPopup.visible}
                    onHiding={() => setChildPopup({ visible: false, data: null })}
                    title='Overide Production Activity'
                    closeOnOutsideClick={false}
                    showCloseButton={!loading}
                >
                    <Stack position={'relative'} width={'100%'} height={'100%'}>
                        <Typography>Đã có 1 Report tạo bởi <strong>{childPopup.data?.ReporterName}</strong> ngày <strong>{moment(childPopup.data?.ReportDate).format('DD/MM/YYYY')}</strong>, Anh Chị chắc chắn muốn {LoginUser?.EmpKnowAs === childPopup.data?.ReporterName ? "xem" : "thay đổi"}?</Typography>
                        <Stack
                            mt={2}
                            width={'100%'}
                            justifyContent={'flex-end'}
                            display={'flex'}
                            flexDirection={'row'}
                            alignItems={'center'}
                            position={'absolute'}
                            bottom={3}
                        >
                            <LoadingButton
                                variant="contained"
                                color='primary'
                                onClick={handleOverideProductionActivity}
                                disabled={loading}
                            >
                                {LoginUser?.EmpKnowAs === childPopup.data?.ReporterName ? "Open" : "Add"}
                            </LoadingButton>
                        </Stack>
                    </Stack>
                </Popup>
            }
        </Popup >
    )
})


export default PopupNewProductActivity;



// RENDER LIST FOR LIST ALL ITEMS
function ItemTemplate({ data, navigate }) {
    const isCurrentDate = moment(data?.ReportDate).diff(moment(), 'days') >= 0;
    return (
        <Stack onClick={() => navigate(PATH_APP.qc.production_activity.detail(data?.Id), { state: data })}>
            <Stack direction="row" justifyContent="space-between" zIndex={1}>
                <Stack direction="column" justifyContent="flex-start" >
                    <Typography
                        variant="caption"
                        paragraph
                        sx={{ color: (theme) => theme.palette.error.dark }}
                        fontWeight={'bold'}
                        mb={0}
                    >
                        Sub Fty: {`${data?.Factory}`}
                    </Typography>
                    <Typography variant="caption" paragraph mb={0} sx={{ wordBreak: 'break-word' }} whiteSpace="normal">
                        Style No: {`${data?.StyleNo}`}
                    </Typography>
                    <Typography variant="caption" paragraph mb={0} whiteSpace='normal' overflow={'hidden'}>
                        PO: {`${data?.CustomerPO}`} - QTY: {data?.Quantity}
                    </Typography>
                    <Typography variant="caption" paragraph mb={0}>
                        Delivery date: {`${data?.DeliveryDate}`}
                    </Typography>
                </Stack>
                <Stack direction="column" justifyContent="flex-end" alignItems={'flex-end'}>
                    <Typography variant="caption" paragraph fontWeight={'bold'} mb={0} mt={1}>
                        Handler: {`${data?.ReporterName}` || 'N/A'}
                    </Typography>
                </Stack>
            </Stack>

        </Stack>
    );
};