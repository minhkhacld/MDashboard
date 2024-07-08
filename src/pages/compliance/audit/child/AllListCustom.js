import { Capacitor } from '@capacitor/core';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Stack, Typography, useTheme } from '@mui/material';
import { createStore } from 'devextreme-aspnet-data-nojquery';
import DataSource from 'devextreme/data/data_source';
import { useLiveQuery } from 'dexie-react-hooks';
import _ from 'lodash';
import moment from 'moment';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactHammer from 'react-hammerjs';
import { useNavigate } from 'react-router-dom';
// Redux
import { setViewOnlyTodo } from '../../../../redux/slices/compliance';
import { setComplianceFilter, setMemoSearchValue, setMemoSelectedItemIndex } from '../../../../redux/slices/memo';
import { dispatch, useSelector } from '../../../../redux/store';
// configuration
import { HEADER, HOST_API, NOTCH_HEIGHT, QC_ATTACHEMENTS_HOST_API } from '../../../../config';
import { attachmentsDB, complianceDB } from '../../../../Db';
import { PATH_APP } from '../../../../routes/paths';
// Hooks
import useLocales from '../../../../hooks/useLocales';
// Componets
import LoadingBackDrop from '../../../../components/BackDrop';
import Label from '../../../../components/Label';
import CustomList from '../../../../components/list/CustomList';
import SwipeableItemButton, { handleItemClick, handleItemSwipe } from '../../../../components/SwipeableItemButton';
// Util
import axios from '../../../../utils/axios';
import { getBase64FromUrl } from '../../../../utils/mobileDownloadFile';
import uuidv4 from '../../../../utils/uuidv4';
import useAccessToken from '../../../../hooks/useAccessToken';

// ---------------------------------------------------------------

const API_URL = `${HOST_API}/api/ComplianceAuditMobileApi/GetList`;

function AllListCustom({ complianceListTab }) {

    // Ref
    const listRefAll = useRef(null);
    const loadRef = useRef(null);
    const searchRef = useRef(null)

    // Hooks
    const theme = useTheme();
    const { enqueueSnackbar } = useSnackbar();
    const { translate } = useLocales();
    const navigate = useNavigate();

    // redux
    const { complianceSearchValue, complianceFilter, complianceItemSelectedIndex } = useSelector(store => store.memo);


    // states
    const [filter, setFilter] = useState(['WFStatusName', '=', 'Open']);

    const API_URL = `${HOST_API}/api/ComplianceAuditMobileApi/GetList`;
    const accessToken = useAccessToken();

    const [dataSource, setDataSource] = useState([]);

    useEffect(() => {
        (async () => {
            try {
                const response = await axios.get(`api/ComplianceAuditMobileApi/GetList`, {
                    params: {
                        requireTotalCount: true,
                        skip: 0,
                        take: 30,
                        filter: JSON.stringify(complianceFilter),
                        sort: JSON.stringify([{ selector: 'AuditDateFrom', desc: true }]),
                        searchValue: complianceSearchValue,
                    }
                })
                console.log(response)
                setDataSource(response.data.data)
            } catch (error) {
                console.error(error)
            }

        })();
    }, [accessToken])

    // data Source
    const storeDataSource = useMemo(() => new DataSource({
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
        }),
        requireTotalCount: true,
        skip: 0,
        take: 30,
        filter: complianceFilter,
        sort: [{ selector: 'AuditDateFrom', desc: true }],
        searchValue: complianceSearchValue,
        onChanged: (e) => console.log(e),
        onLoadError: (e) => console.error(e),
    }), [complianceFilter, complianceSearchValue, accessToken]);


    // get dataSource
    const handleSetDataSource = async () => {
        const searchValue = listRefAll.current.instance._searchEditor._changedValue;
        // console.log(loadRef.current, searchValue, listRefAll.current);
        if (loadRef.current === null) {
            const filtersArr = [
                ['CustomerName', 'contains', searchValue],
                'or',
                ['SysNo', 'contains', searchValue],
                'or',
                ['FactoryName', 'contains', searchValue],
                'or',
                ['AuditorName', 'contains', searchValue],
                'or',
                ['AuditType', 'contains', searchValue],
            ];
            if (searchValue === '' || searchValue === undefined || searchValue !== null) {
                storeDataSource.filter(null);
            } else {
                storeDataSource.filter(filtersArr);
            }
            storeDataSource?.load().then(() => {
                const count = storeDataSource?.totalCount();
                document.getElementById('tab-label-1').innerHTML = count;
                document.getElementById('compliance-list-count').innerHTML = count;
                // listRefAll.current.instance.option('dataSource', storeDataSource);
            });
            document.getElementById('button-text-mode').innerHTML = loadRef.current === null ? translate('button.viewLess') : translate('button.viewAll');
            document.getElementById('text-mode').innerHTML =
                loadRef.current === null ? 'All Compliance Audit' : 'Open Compliance Audit';
            loadRef.current = 'All';
        } else {
            const filtersArr = [
                [
                    ['CustomerName', 'contains', searchValue],
                    'or',
                    ['SysNo', 'contains', searchValue],
                    'or',
                    ['FactoryName', 'contains', searchValue],
                    'or',
                    ['AuditorName', 'contains', searchValue],
                    'or',
                    ['AuditType', 'contains', searchValue],
                ],
                'AND',
                ['WFStatusName', '=', 'Open'],
            ];
            if (searchValue === '' || searchValue === undefined || searchValue !== null) {
                storeDataSource.filter(['WFStatusName', '=', 'Open']);
            } else {
                storeDataSource.filter(filtersArr);
            }
            storeDataSource.load().then((res) => {
                document.getElementById('tab-label-1').innerHTML = res.length;
                document.getElementById('compliance-list-count').innerHTML = res.length;
                // listRefAll.current.instance.option('dataSource', storeDataSource);
            });
            document.getElementById('button-text-mode').innerHTML = loadRef.current === null ? translate('button.viewLess') : translate('button.viewAll');
            document.getElementById('text-mode').innerHTML =
                loadRef.current === null ? 'All Compliance Audit' : 'Open Compliance Audit';
            loadRef.current = null;
        }
    };

    // SwipItem
    const onItemSwipe = useCallback((e) => {
        handleItemSwipe(e);
    }, []);


    const SPACING = 48;
    const ANDROID_KEYBOARD = Capacitor.getPlatform() === 'android' ? 0 : 0;
    const TAB_HEIGHT = 48;
    const BUTTON_GROUP = 48;
    const IOS_KEYBOARD = Capacitor.getPlatform() === 'ios' ? 16 : 0;

    return (
        <Stack>
            <Box width={'100%'} p={1} id="custom-button-group">
                <Stack direction={'row'} justifyContent="space-between" alignItems={'center'}>

                    <Stack direction={'row'} spacing={1}>
                        <Typography
                            sx={{
                                color: theme.palette.compliance.success,
                            }}
                            variant="body2"
                            id="text-mode"
                        >
                            {complianceFilter !== null ? "Open Compliance Audit" : "All Compliance Audit"}
                        </Typography>
                    </Stack>

                    <Button
                        variant="none"
                        sx={{
                            color: theme.palette.compliance.success,
                        }}
                        onClick={handleSetDataSource}
                    >
                        <span id="button-text-mode">{complianceFilter !== null ? translate('button.viewAll') : translate('button.viewLess')}</span>
                    </Button>

                </Stack>
            </Box>

            <div className="widget-container" style={{ paddingBottom: 20 }}>

                <CustomList
                    children={(data, index) => {
                        return <ItemTemplate
                            key={data?.Id}
                            data={data}
                            listRefAll={listRefAll}
                            loadRef={loadRef}
                            itemIndex={index}
                            handleItemSwipe={handleItemSwipe}
                        />
                    }}
                    dataSource={dataSource}
                    listRef={listRefAll}
                    searchExpr={['CustomerName', 'SysNo', 'FactoryName', 'AuditorName', 'AuditType']}
                    height={{
                        lg: `calc(100vh - ${HEADER.DASHBOARD_DESKTOP_HEIGHT +
                            SPACING +
                            ANDROID_KEYBOARD +
                            TAB_HEIGHT + BUTTON_GROUP
                            }px)`,
                        md: `calc(100vh - ${HEADER.MOBILE_HEIGHT + SPACING + ANDROID_KEYBOARD + TAB_HEIGHT + BUTTON_GROUP + IOS_KEYBOARD + NOTCH_HEIGHT
                            })px`,
                        xs: `calc(100vh - ${HEADER.MOBILE_HEIGHT + SPACING + ANDROID_KEYBOARD + TAB_HEIGHT + BUTTON_GROUP + IOS_KEYBOARD + NOTCH_HEIGHT
                            }px)`,
                    }}
                />

            </div>


        </Stack>

    );
};



export default memo(AllListCustom);
// export default AllListCustom;


// RENDER LIST FOR LIST ALL ITEMS
function ItemTemplate({ data, listRefAll, loadRef, itemIndex, handleItemSwipe }) {

    ItemTemplate.propTypes = {
        data: PropTypes.object,
    };

    // Hooks
    const theme = useTheme();
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();
    const { translate } = useLocales()

    const TodoList = useLiveQuery(() => complianceDB?.Todo.toArray()) || [];
    const complianceAttachments = useLiveQuery(() => attachmentsDB?.compliance.toArray()) || [];

    // Add item todo list
    const [modalExist, setModalExist] = useState({ visible: false, itemId: null });
    const [loading, setLoading] = useState(false);

    // NAVIGATE TO DETAIL
    const navigateToComplianceDetail = (Id, isViewOnly = false, replace = false) => {
        navigate(PATH_APP.compliance.audit.detail(Id), {
            state: {
                isViewOnly,
            },
            replace,
        });
        // localStorage.setItem('lastVisitPage', JSON.stringify(PATH_APP.compliance.audit.detail(Id)));
    }

    // CLICK TO VIEW ITEM
    const handleClickItem = async (data) => {
        handleItemClick();
        const response = await axios.get(`/api/ComplianceAuditMobileApi/GetByAuditId/${data.Id}`);
        if (response.data) {
            console.log('/api/ComplianceAuditMobileApi/GetByAuditId', response);
            const todoItem = response.data[0];
            const IsFinished = todoItem?.AuditingResultId !== null;
            const Sections = _.chain(todoItem?.Lines)
                .groupBy((data) => data.SectionName)
                .map((Items, Section) => ({ Items, Section, IsFinished, Id: uuidv4() }))
                .value();
            const FactoryInfoLines = _.chain(todoItem?.FactoryInfoLines)
                .groupBy((data) => data.Section)
                .map((Items, Section, index) => ({ Items, Section, IsFinished, Id: uuidv4() }))
                .value();
            todoItem.Sections = Sections;
            todoItem.id = response.data[0].Id;
            todoItem.FactoryInfoLines = FactoryInfoLines;
            delete todoItem.Id;
            delete todoItem.Lines;
            dispatch(setViewOnlyTodo(todoItem));
            if (listRefAll.current.instance._searchEditor._changedValue !== "" && listRefAll.current.instance._searchEditor._changedValue !== undefined) {
                dispatch(setMemoSearchValue({ field: 'complianceSearchValue', value: listRefAll.current.instance._searchEditor._changedValue }))
                dispatch(setComplianceFilter(loadRef.current === 'All' ? null : listRefAll.current._instance._userOptions.dataSource._storeLoadOptions.filter))
                dispatch(setMemoSelectedItemIndex({
                    field: 'complianceItemSelectedIndex',
                    value: itemIndex
                    // value: data?.Id
                }))
            };
            navigateToComplianceDetail(data.Id, true, false);
        }
    };

    // add to todo
    const handleAddtoToDoList = async () => {
        try {

            const itemExits = TodoList.find((d) => d.id === data.Id);
            // console.log(itemExits);
            if (itemExits !== undefined) {
                setModalExist({ visible: true, itemId: itemExits?.id });
            } else {
                setLoading(true)
                const response = await axios.get(`/api/ComplianceAuditMobileApi/GetByAuditId/${data.Id}`);
                console.log('response getItem', response, data.Id);
                if (response?.data) {
                    const todoItem = response?.data[0];
                    const IsFinished = todoItem?.AuditingResultId !== null;
                    const newLines = [...todoItem?.Lines];
                    const attachments = [...todoItem?.Attachments];
                    const FactoryInfoLines = _.chain(todoItem?.FactoryInfoLines)
                        .groupBy((data) => data.Section)
                        .map((Items, Section, index) => ({ Items, Section, IsFinished, Id: uuidv4() }))
                        .value();

                    // Convert base64 image from link and append to Data onject
                    const Attachments = async () => {
                        return new Promise((resolve) => {
                            let items = []
                            if (attachments.length === 0) {
                                resolve(items);
                                return items
                            }
                            attachments
                                .forEach(async (Items) => {
                                    const newItem = JSON.parse(JSON.stringify(Items));
                                    const imageUrl = `${QC_ATTACHEMENTS_HOST_API}/${Items.Guid}`;
                                    getBase64FromUrl(imageUrl, true).then(async (res) => {
                                        newItem.Data = res;
                                        newItem.ParentId = todoItem.id;
                                        newItem.id = newItem?.Id;
                                        delete newItem.Id;
                                        await attachmentsDB.compliance.add(newItem);
                                        items = [...items, newItem]
                                    });
                                })
                            resolve(items);
                        });
                    };

                    // Add to do list
                    await Attachments().then(async (res) => {
                        todoItem.Attachments = res;
                        const newSections = _.chain(newLines)
                            .groupBy((data) => data.SectionName)
                            .map((Items, Section, index) => {
                                // append directly to todo list
                                return { Items, Section, IsFinished, Id: uuidv4() };
                            })
                            .value();
                        todoItem.id = response.data[0].Id;
                        todoItem.Sections = newSections;
                        todoItem.FactoryInfoLines = FactoryInfoLines;
                        delete todoItem.Id;
                        delete todoItem.Lines;
                        delete todoItem.Attachments;
                        await complianceDB.Todo.add(todoItem)
                            .then((res) => {
                                console.log('add item to do list response', res);
                                enqueueSnackbar(translate('message.addSuccess'), {
                                    variant: 'success',
                                    anchorOrigin: {
                                        vertical: 'top',
                                        horizontal: 'center',
                                    },
                                });
                                setLoading(false);
                                navigateToComplianceDetail(data.Id, false, false)
                            })
                            .catch((err) => {
                                console.error(err);
                                enqueueSnackbar(err, {
                                    variant: 'error',
                                    anchorOrigin: {
                                        vertical: 'top',
                                        horizontal: 'center',
                                    },
                                });
                                setLoading(false)
                            });
                    });
                }
            }
        } catch (e) {
            console.error(e);
            enqueueSnackbar(e, {
                variant: 'error',
                anchorOrigin: {
                    vertical: 'top',
                    horizontal: 'center',
                },
            });
            setLoading(false)
        }
    };

    // replace exist items in to do list
    const handleReplace = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/ComplianceAuditMobileApi/GetByAuditId/${data.Id}`);
            if (response.data) {
                const todoItem = { ...response.data[0] };
                const IsFinished = todoItem?.AuditingResultId !== null;
                const Sections = _.chain(todoItem?.Lines)
                    .groupBy((data) => data.SectionName)
                    .map((Items, Section, index) => ({ Items, Section, IsFinished, Id: uuidv4() }))
                    .value();
                const FactoryInfoLines = _.chain(todoItem?.FactoryInfoLines)
                    .groupBy((data) => data.Section)
                    .map((Items, Section, index) => ({ Items, Section, IsFinished, Id: uuidv4() }))
                    .value();

                const attachments = [...todoItem?.Attachments];
                const Attachments = async () => {
                    return new Promise((resolve) => {
                        let items = []
                        if (attachments.length === 0) {
                            resolve(items);
                            return items
                        }
                        attachments
                            .forEach(async (Items) => {
                                const newItem = JSON.parse(JSON.stringify(Items));
                                const imageUrl = `${QC_ATTACHEMENTS_HOST_API}/${Items.Guid}`;
                                getBase64FromUrl(imageUrl, true).then(async (res) => {
                                    newItem.Data = res;
                                    newItem.ParentId = todoItem.id;
                                    newItem.id = newItem?.Id;
                                    delete newItem.Id;
                                    const itemExits = complianceAttachments.find((d) => d.id === newItem.id);
                                    if (itemExits) {
                                        await attachmentsDB.compliance
                                            .where('id')
                                            .equals(newItem.id)
                                            .modify((x) => {
                                                x = newItem;
                                            });
                                    } else {
                                        await attachmentsDB.compliance.add(newItem);
                                    }
                                    items = [...items, newItem]
                                });
                            })
                        resolve(items);
                    });
                };


                await Attachments().then(async () => {
                    todoItem.Sections = Sections;
                    todoItem.FactoryInfoLines = FactoryInfoLines;
                    todoItem.id = response.data[0].Id;
                    delete todoItem.Id;
                    delete todoItem.Lines;
                    delete todoItem.Attachments;
                    await complianceDB.Todo.where('id')
                        .equals(modalExist.itemId)
                        .modify((x) => {
                            x = todoItem;
                        })
                        .then((res) => {
                            console.log('replace item to do list response', res);
                            enqueueSnackbar(translate('message.replaceSuccess'), {
                                variant: 'success',
                                anchorOrigin: {
                                    vertical: 'top',
                                    horizontal: 'center',
                                },
                            });
                            navigateToComplianceDetail(data.Id, false, true)
                        });
                });
                setLoading(false)
            }
        } catch (e) {
            console.error(e);
            setLoading(false)
        }
    };

    // CREATE FOLLOW UP REQUEST
    const handleFollowup = async () => {
        try {

            const itemExits = TodoList.find((d) => d.id === data.Id);

            if (itemExits) {
                return enqueueSnackbar(translate('Item exist!'), {
                    variant: 'info',
                    anchorOrigin: {
                        vertical: 'top',
                        horizontal: 'center',
                    },
                });
            };

            setLoading(true);
            const response = await axios.get(`/api/ComplianceAuditMobileApi/GetByAuditId/${data.Id}`);
            console.log('/api/ComplianceAuditMobileApi/GetByAuditId/', response.data);

            if (response.data) {

                const todoItem = JSON.parse(JSON.stringify(response.data[0]));
                const newLines = [...todoItem?.Lines].filter(d => d?.DetailedFinding !== null || d?.DetailedFinding === "") || [];
                if (newLines.length === 0) {
                    setLoading(false);
                    return enqueueSnackbar(translate('This item has nothing to follow up!'), {
                        variant: 'info',
                        anchorOrigin: {
                            vertical: 'top',
                            horizontal: 'center',
                        },
                    });
                }

                // when clone the item change Line Guid and attachment RecordGuid, Action===Insert to match with parent;
                const newLineGuidList = [...newLines].map(d => d.Guid);
                const attachments = [...todoItem?.Attachments].filter(d => newLineGuidList.includes(d.RecordGuid));
                let changeAttachments = [];
                let changeNewLines = [];

                newLines.forEach(line => {

                    const newGuid = uuidv4();
                    changeNewLines = [...changeNewLines, {
                        ...line,
                        Guid: newGuid
                    }];

                    if (attachments.length > 0) {
                        const lineAttachment = attachments.filter(att => att.RecordGuid === line.Guid);
                        if (lineAttachment.length >= 0) {
                            const newLineAttachment = lineAttachment.map(v => ({ ...v, RecordGuid: newGuid, Action: 'Insert' }));
                            changeAttachments = [...changeAttachments, ...newLineAttachment];
                        }
                    };
                });

                const IsFinished = todoItem?.AuditingResultId !== null;
                const Sections = _.chain(changeNewLines)
                    .groupBy((data) => data.SectionName)
                    .map((Items, Section,) => ({
                        Items, Section, IsFinished, Id: uuidv4()
                    }))
                    .value();

                const FactoryInfoLines = _.chain(todoItem?.FactoryInfoLines)
                    .groupBy((data) => data.Section)
                    .map((Items, Section, index) => ({ Items, Section, IsFinished, Id: uuidv4() }))
                    .value();

                // Convert base64 image from link and append to Data object, store to local indexDb;
                const Attachments = async () => {
                    return new Promise((resolve) => {
                        let items = []
                        if (changeAttachments.length === 0) {
                            resolve(items);
                            return items
                        }

                        changeAttachments
                            .forEach(async (Items) => {
                                const newItem = JSON.parse(JSON.stringify(Items));
                                if (newItem.Data !== null) {
                                    newItem.ParentId = todoItem.id;
                                    newItem.id = newItem?.Id;
                                    delete newItem.Id;
                                    const itemExits = complianceAttachments.find((d) => d.id === newItem.id);
                                    if (itemExits) {
                                        await attachmentsDB.compliance
                                            .where('id')
                                            .equals(newItem.id)
                                            .modify((x) => {
                                                x = newItem;
                                            });
                                    } else {
                                        await attachmentsDB.compliance.add(newItem);
                                    }
                                    items = [...items, newItem]
                                };

                                const imageUrl = `${QC_ATTACHEMENTS_HOST_API}/${Items.Guid}`;
                                getBase64FromUrl(imageUrl, true).then(async (res) => {
                                    newItem.Data = res;
                                    newItem.ParentId = todoItem.id;
                                    newItem.id = newItem?.Id;
                                    delete newItem.Id;
                                    const itemExits = complianceAttachments.find((d) => d.id === newItem.id);
                                    if (itemExits) {
                                        await attachmentsDB.compliance
                                            .where('id')
                                            .equals(newItem.id)
                                            .modify((x) => {
                                                x = newItem;
                                            });
                                    } else {
                                        await attachmentsDB.compliance.add(newItem);
                                    }
                                    items = [...items, newItem]
                                });
                            })
                        resolve(items);
                    });
                };


                // Post attachment first, then update detail;
                await Attachments().then(async (storeAttArr) => {

                    console.log(storeAttArr)
                    todoItem.FactoryInfoLines = FactoryInfoLines;
                    todoItem.Sections = [...Sections];
                    todoItem.id = response.data[0].Id;
                    todoItem.AuditTime = "FOLLOW-UP";
                    todoItem.AuditTimeId = 11742;

                    delete todoItem.Id;
                    delete todoItem.Lines;
                    delete todoItem.Attachments;

                    await complianceDB.Todo.add(todoItem)
                        .then(async (res) => {
                            // post request to create inspections follow up with details and attachments
                            // await Promise.all(storeAttArr).then(v => {
                            //   handleCreateFollowUp(v, todoItem);
                            // })
                            // console.log('add item to do list response', res);
                            enqueueSnackbar(translate('message.addSuccess'), {
                                variant: 'success',
                                anchorOrigin: {
                                    vertical: 'top',
                                    horizontal: 'center',
                                },
                            });
                            setLoading(false);
                            navigateToComplianceDetail(response.data[0].Id, false, false);
                        })
                        .catch((err) => {
                            console.error(err);
                            enqueueSnackbar(err, {
                                variant: 'error',
                                anchorOrigin: {
                                    vertical: 'top',
                                    horizontal: 'center',
                                },
                            });
                            setLoading(false);
                        });
                });
                setLoading(false);

            }
        } catch (e) {
            console.error(e);
            setLoading(false);
            enqueueSnackbar(JSON.stringify(e), {
                variant: 'error',
                anchorOrigin: {
                    vertical: 'top',
                    horizontal: 'center',
                },
            });
        }
    };


    const handleCreateFollowUp = (Attachments, todoItem) => {
        try {
            // Upload attachements;
            const postAttachments = () => {
                return new Promise((resolve) => {
                    if (Attachments.length > 0) {
                        Attachments.forEach((img) => {
                            const formData = new FormData();
                            // delete id, guid before send attachment to server
                            delete img.Id;
                            delete img.id;
                            delete img.Guid;
                            delete img.ParentId;
                            formData.append('values', JSON.stringify(img));
                            axios.post(`/api/ComplianceAuditMobileApi/UpdateAttachment`, formData).then((res) => {
                                console.log(res);
                            });
                        });
                    }
                    resolve('finished success');
                });
            };

            todoItem.Lines = todoItem.Sections.map((d) => d.Items).flatMap((r) => r);
            todoItem.FactoryInfoLines = todoItem.FactoryInfoLines.map((d) => d.Items).flatMap((r) => r);

            // Must delete id and guid before send to server;
            delete todoItem.Sections;
            delete todoItem.id;
            delete todoItem.Guid;

            // Upload contents;
            postAttachments()
                .then(async () => {
                    const formData = new FormData();
                    formData.append('values', JSON.stringify(todoItem));
                    // console.log(postData);
                    await axios
                        .post(`api/ComplianceAuditMobileApi/CreateInspection/`, formData)
                        .then(async (res) => {
                            if (res) {
                                console.log('api/ComplianceAuditMobileApi/CreateInspection/', res);
                            }
                        })
                });
        } catch (error) {
            console.log(error)
            enqueueSnackbar(JSON.stringify(error), {
                variant: 'error',
                anchorOrigin: {
                    vertical: 'top',
                    horizontal: 'center',
                },
            });
        }
    }


    // CREATE BUTTON GROUPS
    const buttons = [
        {
            text: 'Add to Todo',
            color: theme.palette.compliance.primary.main,
            action: () => handleAddtoToDoList(),
            disabled: data.WFStatusName !== 'Open' || loading,
            visible: data.WFStatusName === 'Open',
        },
        {
            text: 'Follow up',
            color: theme.palette.compliance.info.main,
            action: () => handleFollowup(),
            disabled: loading,
            visible: data.WFStatusName !== 'Open',
        },
    ].filter(d => d.visible);


    return (
        <ReactHammer
            onSwipeRight={e => {
                console.log(e)
                handleItemSwipe({ itemIndex, itemData: { Id: data?.Id } })
            }}
            onSwipeLeft={e => console.log(e)}

        >
            <Stack
                direction="row"
                justifyContent="center"
                alignItems={'center'}
                id={`list-item-row-${data?.Id}`}
                sx={{ position: 'relative', padding: 0 }}
                key={data.Id}
                width="100%"
            >

                <Stack
                    direction="row"
                    justifyContent="space-between"
                    width="100%"
                    onClick={() => {
                        handleClickItem(data);
                    }}
                    p={1}
                >
                    <Stack direction="column" justifyContent="flex-start">
                        <Typography
                            variant="caption"
                            paragraph
                            sx={{ color: (theme) => theme.palette.error.dark }}
                            fontWeight={'bold'}
                            mb={0}
                        >
                            {`${data?.SysNo} - ${data?.AuditType}`}
                        </Typography>
                        <Typography variant="caption" paragraph mb={0} sx={{ wordBreak: 'break-word' }} whiteSpace="normal">
                            {`Factory: ${data?.FactoryName}`}
                        </Typography>
                        <Typography variant="caption" paragraph mb={0}>
                            {`Customer: ${data?.CustomerName || ''}`}
                        </Typography>
                        <Typography variant="caption" paragraph mb={0} whiteSpace="normal">
                            {`Remark: ${data?.Remark || ''}`}
                        </Typography>
                    </Stack>
                    <Stack direction="column" justifyContent="flex-end" alignItems={'flex-end'}>
                        {data.AuditingResult !== null && (
                            <Label
                                variant="ghost"
                                color={
                                    data.AuditingResult === 'Pass' || data.AuditingResult === 'Pass With Condition' ? 'success' : 'error'
                                }
                            >
                                {data.AuditingResult}
                            </Label>
                        )}
                        <Typography variant="caption" paragraph fontWeight={'bold'} mb={0} mt={1}>
                            {`Audit From: ${moment(data?.AuditDateFrom).format('DD/MM/YYYY')}`}
                        </Typography>
                        <Typography variant="caption" paragraph fontWeight={'bold'} mb={0} mt={1}>
                            {`Auditor: ${data?.AuditorName}`}
                        </Typography>
                    </Stack>
                </Stack>


                <SwipeableItemButton
                    id={`button-list-button-${data?.Id}`}
                    buttons={buttons}
                    variant="subtext2"
                    textColor="white"
                    width={90}
                />

                {modalExist.visible && (
                    <ModalExist modalExist={modalExist} setModalExist={setModalExist} handleReplace={handleReplace} />
                )}

                {loading &&
                    <LoadingBackDrop
                        text={translate('loading')}
                        loading={loading}
                    />
                }

            </Stack>
        </ReactHammer>
    );
};

function ModalExist({ modalExist, setModalExist, handleReplace }) {
    ModalExist.propTypes = {
        modalExist: PropTypes.object,
        setModalExist: PropTypes.func,
        handleReplace: PropTypes.func,
    };

    const { translate } = useLocales()

    const handleClose = useCallback(() => {
        setModalExist({ visible: false, itemId: null });
    }, []);

    const handleReplaceAndClose = useCallback(() => {
        handleReplace();
        handleClose();
    }, []);

    return (
        <Dialog open={modalExist.visible} onClose={handleClose} aria-labelledby="confirmed-popup">
            <DialogTitle mb={3}>Item exist</DialogTitle>
            <DialogContent>
                <DialogContentText>{translate('confirm.itemExist')}</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="info">
                    {translate('button.cancel')}
                </Button>
                <Button onClick={handleReplaceAndClose} color="success">
                    {translate('button.replace')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
