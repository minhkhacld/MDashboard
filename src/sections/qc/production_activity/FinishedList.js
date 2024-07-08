import { Stack, Typography } from '@mui/material';
import { createStore } from 'devextreme-aspnet-data-nojquery';
import DataSource from 'devextreme/data/data_source';
import moment from 'moment';
import { useSnackbar } from 'notistack';
import { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// config
import { HOST_API } from '../../../config';
import { PATH_APP } from '../../../routes/paths';
// components
import Label from '../../../components/Label';
import { ListWithoutBreakcrumb } from '../../../components/tab/DxList';
import FilterPanel from '../../../components/tab/FilterPanel';
// hooks
import useLocales from '../../../hooks/useLocales';
import { setTabListStatus } from '../../../redux/slices/productionActivity';
import { dispatch, useSelector } from '../../../redux/store';
import { handleRefreshToken } from '../../../utils/axios';


// ----------------------------------------------------------------
const FinishedList = forwardRef((props, ref) => {

    // ref
    const listRef = useRef(null);
    const filterPanelRef = useRef(null);

    // hooks
    const { enqueueSnackbar } = useSnackbar();
    const { translate } = useLocales();
    const navigate = useNavigate();

    // redux
    const { LoginUser } = useSelector(store => store.workflow);
    const { tabListStatus } = useSelector(store => store.productionActivity);

    const defaultFilter = [["ReporterId", "=", LoginUser.EmpId], "AND", ['StatusName', '=', 'Finished']]
    //  states
    const [filter, setFilter] = useState(defaultFilter);


    // side effects
    useEffect(() => {

        if (tabListStatus.searchValue.finished !== "" && tabListStatus.searchValue.finished !== null) {
            listRef.current.instance.option('searchValue', tabListStatus.searchValue.finished);
            filterPanelRef.current.hide();
        };
        return () => { };

    }, [tabListStatus.searchValue.all, listRef.current, filterPanelRef]);

    // stores
    const storeDataSource = useMemo(() => {
        const API_URL = `${HOST_API}/api/PAMobileApi/GetPSList/`;
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
                // onAjaxError: err => {
                //     const message = handleRequestError(err.xhr);
                //     enqueueSnackbar(JSON.stringify(message), {
                //         variant: 'error'
                //     })
                // }
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
            requireTotalCount: true,
            skip: 0,
            take: 30,
            sort: [
                { selector: 'DeliveryDate', desc: false },
            ],
            filter,
            searchValue: tabListStatus.searchValue.finished || "",
        });
    }, [filter]);


    const searchEditorOptions = useMemo(() => ({
        placeholder: `${translate('search')} Style, Factory, PO`,
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


    const handleSelectItem = (data) => {
        navigate(PATH_APP.qc.production_activity.detail(data?.Id), { state: { ...data, isViewOnly: true }, });
        dispatch(setTabListStatus({
            selectedTabName: '2',
            searchValue: {
                onGoing: null,
                finished: null,
                all: listRef.current.instance._searchEditor._changedValue,
            }
        }))
    }


    return (
        <div>

            <FilterPanel
                setDataSource={getDataSource}
                storeDataSource={storeDataSource}
                id={'list-finished'}
            />

            <ListWithoutBreakcrumb
                dataSource={storeDataSource}
                // itemComponent={ItemTemplate}
                itemComponent={({ data }) => <ItemTemplate data={data} navigate={navigate} handleSelectItem={handleSelectItem} />}
                searchExpr={searchExpr}
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
            />
        </div>
    )
})

export default FinishedList;


// RENDER LIST FOR LIST ALL ITEMS
function ItemTemplate({ data, navigate, handleSelectItem }) {
    const isCurrentDate = moment(data?.ReportDate).diff(moment(), 'days') >= 0;
    return (
        <Stack onClick={() => handleSelectItem(data)}>
            <Stack direction="row" justifyContent="space-between" zIndex={1}>
                <Stack direction="column" justifyContent="flex-start" >
                    <Typography
                        variant="caption"
                        paragraph
                        sx={{ color: (theme) => theme.palette.error.dark }}
                        fontWeight={'bold'}
                        mb={0}
                    >
                        Factory: {`${data?.Factory}`}
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
                <Stack direction="column" justifyContent="flex-start" alignItems={'flex-end'}>
                    <Label variant="unset" color={isCurrentDate ? 'success' : 'error'}>
                        {moment(data?.ReportDate).format('DD/MM/YYYY') || 'N/A'}
                    </Label>
                    <Typography variant="caption" paragraph fontWeight={'bold'} mb={0} mt={1}>
                        In {`${data?.StateName}: ${data?.TotalQuantity === null ? 0 : data?.TotalQuantity}`}
                    </Typography>
                </Stack>
            </Stack>
        </Stack>
    );
};