import { Dialog as CapDialog } from '@capacitor/dialog';
import Popup from 'devextreme-react/popup';
import ScrollView from 'devextreme-react/scroll-view';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import Draggable from 'devextreme-react/draggable';
import { Autocomplete, Backdrop, Box, Button, Checkbox, IconButton, Popper, Stack, TextField, Typography, useTheme } from '@mui/material';
import _ from 'lodash';
// util
import axios from '../../../utils/axios';
import IconName from '../../../utils/iconsName';
import uuidv4 from '../../../utils/uuidv4';
// components
import Iconify from '../../../components/Iconify';
// hooks
import useLocales from '../../../hooks/useLocales';
import useResponsive from '../../../hooks/useResponsive';
// db
import { complianceDB } from '../../../Db';
// config
import { setTabComplianceDetail } from '../../../redux/slices/tabs';
import { dispatch, useSelector } from '../../../redux/store';
import { PATH_APP } from '../../../routes/paths';


// ---------------------------------------------------

PopupCollaboration.propTypes = {
    visible: PropTypes.bool,
    onClose: PropTypes.func,
    popUpCollaborate: PropTypes.object,
};

export default function PopupCollaboration({
    visible,
    onClose = () => { },
    popUpCollaborate,
}) {

    // hooks
    const { translate } = useLocales();
    const { enqueueSnackbar } = useSnackbar();
    const theme = useTheme();
    const navigate = useNavigate();
    const smUp = useResponsive('up', 'sm')

    // redux state
    const { LoginUser } = useSelector(store => store.workflow);

    // components states
    const [auditItem, setAuditItem] = useState(null);
    const [dataSource, setDataSource] = useState([]);
    const [dialogNewAuditor, setDialogNewAuditor] = useState(false);
    const [auditors, setAuditor] = useState([]);
    const [diableSave, setDisableSave] = useState(false);
    const [disableAddtoTodo, setDisableAddtoTodo] = useState(true);
    const [disableAddNewAuditor, setDiableAddNewAuditor] = useState(false);
    const [loading, setLoading] = useState(false);

    const backdropStyles = useMemo(() => ({
        zIndex: '100000000000000 !important',
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
    }), []);

    const styles = useMemo(() => ({
        buttonStyles: { minWidth: { xs: 50, sm: 150 }, fontSize: { xs: 12, sm: 14 } }
    }), []);


    const animation = useMemo(() => ({
        show: {
            type: 'fade'
        },
        hide: {
            type: 'fade'
        }
    }), []);


    // CALLLING API TO GENERATE SECTIONS
    const initialize = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/ComplianceAuditMobileApi/GetByAuditId/${popUpCollaborate?.itemId}`);
            const todoItem = { ...response?.data[0] };
            const IsFinished = todoItem?.AuditingResultId !== null;
            const newLines = [...todoItem?.Lines].map(d => {
                if (d?.AuditorId !== undefined && d?.AuditorId !== null && d?.AuditorId !== "") {
                    return d
                }
                return { ...d, AuditorName: todoItem?.AuditorName, AuditorId: todoItem?.AuditorId };
            });
            const attachments = [...todoItem?.Attachments];
            const FactoryInfoLines = _.chain(todoItem?.FactoryInfoLines)
                .groupBy((data) => data.Section)
                .map((Items, Section, index) => ({ Items, Section, IsFinished, Id: uuidv4() }))
                .value();

            const newSections = _.chain(newLines)
                .groupBy((data) => data.SectionName)
                .map((Items, Section, index) => {
                    // append directly to todo list
                    if (Items[0]?.AuditorId !== undefined && Items[0]?.AuditorId !== null && Items[0]?.AuditorId !== "") {
                        return { Items, Section, IsFinished, Id: uuidv4(), AuditorName: Items[0]?.AuditorName, AuditorId: Items[0]?.AuditorId };
                    }
                    return { Items, Section, IsFinished, Id: uuidv4(), AuditorName: todoItem?.AuditorName, AuditorId: todoItem?.AuditorId };
                })
                .value();

            todoItem.ReportAttachments = [];
            todoItem.id = response.data[0].Id;
            todoItem.Sections = newSections;
            todoItem.FactoryInfoLines = FactoryInfoLines;
            delete todoItem.Id;
            delete todoItem.Lines;
            delete todoItem.Attachments;

            const generateAuditor = _.chain(newLines)
                .groupBy((data) => data.AuditorName)
                .map((Items, AuditorName, index) => {
                    // append directly to todo list
                    return { AuditorName, AuditorId: Items[0]?.AuditorId };
                })
                .value();

            // console.log(newSections);

            if (generateAuditor.length > 0) {
                setAuditor(generateAuditor);
            } else {
                setAuditor([{ AuditorId: todoItem.AuditorId, AuditorName: todoItem.AuditorName }]);
            };
            setAuditItem(todoItem);
            setDataSource(newSections);
            setLoading(false);

        } catch (error) {
            console.error(error)
            setLoading(false)
            enqueueSnackbar(JSON.stringify(error), {
                variant: 'error',
            })
        }
    }

    // side Effects;
    useEffect(() => {
        initialize();
    }, [popUpCollaborate.Id]);

    useEffect(() => {
        if (!auditItem) return;
        const isAllowEditting = auditItem?.AuditorId === LoginUser?.EmpId;

        if (!isAllowEditting) {
            setDiableAddNewAuditor(true);
            setDisableSave(true);
        };

    }, [dataSource, auditors, auditItem])


    // on drag end item;
    const onDragEnd = (result) => {

        const { destination, source, draggableId } = result;


        // if (!destination) return;

        // const updatedItems = [...dataSource];
        // const draggedItem = updatedItems.find(d => d.key === source.droppableId);
        // const draggedItemIndex = updatedItems.findIndex(d => d.key === source.droppableId);
        // const destinationItem = updatedItems.find(d => d.key === destination.droppableId);
        // const destinationItemsIndex = updatedItems.findIndex(d => d.key === destination.droppableId);
        // const newDestination = destinationItem.items.splice(destination.index, 0, {
        //     ...draggedItem.items[source.index],
        //     key: destination.droppableId
        // });

        // const newSource = draggedItem.items.splice(source.index, 1);
        // setDataSource(updatedItems);
    };

    // Item checked status
    const handleCheckItem = (checked, item, group) => {
        if (!checked) return;
        setDataSource(dataSource.map(d => {
            if (d.Id === item.Id && checked) {
                return {
                    ...d,
                    AuditorName: group.AuditorName,
                    AuditorId: group.AuditorId,
                }
            }
            return d
        }))

    };

    // add new auditor;
    const showAddNewAuditorDialog = () => {
        setDialogNewAuditor(true);
    };


    // hanlde confirm addd new auditor;
    const handleConfirmAddNewAuditor = (auditor) => {
        setAuditor([
            ...auditors,
            {
                AuditorId: auditor.Id,
                AuditorName: auditor.KnowAs,
            }
        ]);
    };

    // delete editor
    const onDeleteEditor = (auditorId) => {
        if (auditorId === LoginUser?.EmpId) {
            return enqueueSnackbar('Can not remove Owner',
                {
                    variant: 'error'
                })
        }
        setAuditor(auditors.filter(d => d.AuditorId !== auditorId));
        setDataSource(dataSource.map(d => {
            if (d.AuditorId === auditorId) {
                return {
                    ...d,
                    AuditorId: "",
                    AuditorName: "",
                };
            };
            return d;
        }))
    };


    // ON PRESS SAVE BUTTON
    const onSave = async () => {
        try {
            setLoading(true);
            const sectionNoAssign = dataSource.filter(d => d.AuditorId === "" || d.AuditorId === null);
            if (sectionNoAssign.length > 0) {
                throw Error('Some sections have not been assigned yet (yellow color). Please check again!');
            }
            const postData = dataSource.map((d, index) => d.Items.map(v => ({
                ComplianceAuditLineId: v.Id,
                AuditorId: d.AuditorId,
            }))).flatMap(r => r);


            const response = await axios.post('/api/ComplianceAuditMobileApi/AddAuditorForLines', postData);

            if (response.status === 200) {
                setDisableAddtoTodo(false);
            }
            // // await new Promise((resolve) => setTimeout(resolve, 500));
            enqueueSnackbar('Configuration for Collaborator has been saved!');
            setLoading(false);
        } catch (error) {
            setLoading(false);
            console.error(error);
            enqueueSnackbar(JSON.stringify(error?.message || error), {
                variant: 'error'
            });
        };
    };

    // ON PRESS ADD TO TODO BUTTON
    const onAddtoTodo = async () => {
        try {
            // await new Promise((resolve) => setTimeout(resolve, 500));
            const response = await axios.get(`/api/ComplianceAuditMobileApi/GetByAuditId/${popUpCollaborate?.itemId}`);
            // console.log('response getItem', response);
            const todoItem = { ...response?.data[0] };
            const IsFinished = todoItem?.AuditingResultId !== null;
            const newLines = [...todoItem?.Lines].filter(d => d.AuditorId === LoginUser.EmpId);
            const attachments = [...todoItem?.Attachments];
            const FactoryInfoLines = _.chain(todoItem?.FactoryInfoLines)
                .groupBy((data) => data.Section)
                .map((Items, Section, index) => ({ Items, Section, IsFinished: false, Id: uuidv4() }))
                .value();

            const newSections = _.chain(newLines)
                .groupBy((data) => data.SectionName)
                .map((Items, Section, index) => {
                    // append directly to todo list
                    return { Items, Section, IsFinished: false, Id: uuidv4(), };
                })
                .value();

            if (newSections.length === 0) {
                dispatch(setTabComplianceDetail('3'));
            }

            todoItem.ReportAttachments = [];
            todoItem.id = response.data[0].Id;
            todoItem.Sections = newSections;
            todoItem.FactoryInfoLines = FactoryInfoLines;
            delete todoItem.Id;
            delete todoItem.Lines;
            delete todoItem.Attachments;

            const item = await complianceDB.Todo.where('id').equals(todoItem.id).first();

            if (item) {

                const { value } = await CapDialog.confirm({
                    title: 'Item exist in Todo',
                    message: 'Do you want to replace it?',
                });

                if (value) {
                    const responseDelete = await complianceDB.Todo.delete(todoItem.id);
                    const responseAdd = await complianceDB.Todo.add(todoItem);
                    enqueueSnackbar(translate('message.addSuccess'), {
                        variant: 'success',
                        anchorOrigin: {
                            vertical: 'top',
                            horizontal: 'center',
                        },
                    });
                    onClose();
                    navigate(PATH_APP.compliance.audit.detail(todoItem.id), {
                        state: {
                            isViewOnly: false,
                        },
                        replace: false,
                    });
                };

            } else {

                await complianceDB.Todo.add(todoItem)
                    .then((res) => {
                        // Add todo;
                        console.log('Add item to do list response', res);
                        enqueueSnackbar(translate('message.addSuccess'), {
                            variant: 'success',
                            anchorOrigin: {
                                vertical: 'top',
                                horizontal: 'center',
                            },
                        });
                        onClose();
                        navigate(PATH_APP.compliance.audit.detail(todoItem.id), {
                            state: {
                                isViewOnly: false,
                            },
                            replace: false,
                        });
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
                    });

            }
            setLoading(false)
        } catch (error) {
            console.error(error);
            setLoading(false)
            enqueueSnackbar(JSON.stringify(error), {
                variant: 'error'
            })
        }
    }

    const handleDisplayAuditor = (item, index) => {
        const element = document.getElementById(`auditor-section-${item.AuditorId}-${index}`);
        const chevon = document.getElementById(`group-panel-chevon-${item.AuditorId}-${index}`);
        const isHiden = element.style.display === "none";
        if (isHiden) {
            element.style.display = "block";
            chevon.style.rotate = '-180deg'
        } else {
            element.style.display = "none"
            chevon.style.rotate = '0deg'
        };
    };

    const filterEmtySection = dataSource.filter(d => d.AuditorId === "" || d.AuditorId === null || d.AuditorId === undefined);


    // console.log(dataSource, auditItem);

    return (
        <Popup
            visible={visible}
            // visible
            onHiding={onClose}
            title='Collaboration'
            animation={animation}
            closeOnOutsideClick={false}
            showCloseButton
            width={'100%'}
            height={'100%'}
        >

            <MultiListDnD
                items={auditors}
                onDragEnd={onDragEnd}
                handleDisplayAuditor={handleDisplayAuditor}
                handleCheckItem={handleCheckItem}
                onDeleteEditor={onDeleteEditor}
                dataSource={dataSource}
                setDataSource={setDataSource}
                LoginUser={LoginUser}
            />

            {dialogNewAuditor &&
                <DialogNewAuditor
                    onClose={() => setDialogNewAuditor(false)}
                    open={dialogNewAuditor}
                    handleConfirmAddNewAuditor={handleConfirmAddNewAuditor}
                    auditors={auditors}
                />
            }

            <Stack direction={'row'} justifyContent={'center'} alignItems={'center'} position={'absolute'} bottom={10} width={'100%'} spacing={3}
                left={0}
                right={0}
                id="button-groups-items"
            >
                <Button
                    onClick={showAddNewAuditorDialog}
                    color='primary'
                    variant='outlined'
                    disabled={disableAddNewAuditor}
                    sx={styles.buttonStyles}
                    startIcon={smUp ? <Iconify icon={IconName.pluseSquare} /> : null}
                >New Collaborator</Button>
                <Button
                    onClick={onSave}
                    color='primary'
                    variant='contained'
                    disabled={diableSave || filterEmtySection.length > 0}
                    sx={styles.buttonStyles}
                    startIcon={smUp ? <Iconify icon={IconName.save} /> : null}
                >Save</Button>
                <Button
                    onClick={onAddtoTodo}
                    color='info'
                    variant='contained'
                    disabled={disableAddtoTodo || filterEmtySection.length > 0}
                    sx={styles.buttonStyles}
                    startIcon={smUp ? <Iconify icon={IconName.mobile} /> : null}
                >Add to Todo</Button>
            </Stack >

            <Backdrop
                sx={backdropStyles}
                open={loading}
            >
                <Box
                    width={'100%'}
                    height="100%"
                    display={'flex'}
                    justifyContent={'center'}
                    alignItems={'center'}
                    bgcolor='transparent'
                >
                    <Stack spacing={2} justifyContent="center" alignItems={'center'} width='70%'  >
                        <Typography color={theme.palette.primary.main} textAlign='center'>Loading...</Typography>
                    </Stack>
                </Box >
            </Backdrop >

        </Popup >
    )
};


const calculateSelectedItem = (auditorId, dataSource) => {
    const todoItems = dataSource.filter(d => d.AuditorId === auditorId);
    return todoItems.length || 0;
}

// Drag and drop
function MultiListDnD({
    items,
    onDragEnd,
    handleDisplayAuditor,
    handleCheckItem,
    onDeleteEditor,
    dataSource,
    setDataSource,
    LoginUser,
}) {

    // let scrollTimer = null;
    const [selectedItem, setSelectedItem] = useState(null);
    const LIST_HEIGHT = items.length === 1 ? '80%' : 500;

    const scrollViewRef = useRef(null);
    const [visibleHeader, setVisibleHeader] = useState('');

    const sortItems = items.sort((a, b) => (b?.AuditorName.localeCompare(a?.AuditorName))) || [];

    // const handleScroll = (e) => {
    //     if (!scrollViewRef.current?.instance) return
    //     // Clear previous scroll timer
    //     clearTimeout(scrollTimer);

    //     const scrollTop = scrollViewRef.current.instance.scrollTop();
    //     /* eslint-disable-next-line */
    //     for (let i = 0; i < sortItems.length; i++) {
    //         const groupElement = document.getElementById(`group-${sortItems[i].AuditorId}`);
    //         // console.log(scrollTop, groupElement.offsetTop, groupElement);
    //         if (scrollTop >= groupElement.offsetTop) {
    //             groupElement.style.position = 'sticky';
    //             groupElement.style.top = `0px`;
    //             groupElement.style.zIndex = `1000000`;
    //         };
    //     };

    //     // Adjust the visibility of the button group based on the scroll position
    //     if (scrollTop > 50) {
    //         document.getElementById(`button-groups-items`).style.display = 'none';
    //     } else {
    //         document.getElementById(`button-groups-items`).style.display = 'flex';
    //     }

    //     // Set a timeout to detect when scrolling stops
    //     scrollTimer = setTimeout(() => {
    //         document.getElementById(`button-groups-items`).style.display = 'flex';
    //         // console.log(scrollTop, groupElement.offsetTop, groupElement);
    //     }, 500); // Adjust the timeout duration as needed
    // };


    return (
        <ScrollView width={'100%'} height={'95%'}
        // ref={scrollViewRef}
        // onScroll={handleScroll}
        >
            {/* <DragDropContext onDragEnd={onDragEnd}> */}
            <Stack spacing={1}>
                {sortItems.length > 0 && sortItems.map((group, index) => (
                    // <Droppable key={group?.AuditorId} droppableId={String(group?.AuditorId)}>
                    //     {(provided, snapshot) => (

                    <Stack
                        // ref={provided.innerRef}
                        key={group?.AuditorId}
                    >

                        {/* // Header group */}
                        <Stack display={'flex'} direction='row' justifyContent={'space-between'} alignItems={'center'}
                            sx={{
                                backgroundColor: theme => theme.palette.grey[200],
                                p: 1,
                                borderRadius: 1,
                            }}
                            id={`group-${group.AuditorId}`}
                        // style={{ visibility: group.AuditorId === visibleHeader ? 'visible' : 'hidden' }}
                        >

                            <Typography
                                variant="button"
                                sx={{
                                    color: (theme) => theme.palette.info.main,
                                }}
                            >
                                {`${group?.AuditorName} (${calculateSelectedItem(group?.AuditorId, dataSource)}/${dataSource.length} Sections)`}
                            </Typography>


                            <Stack direction='row' justifyContent={'space-between'} alignItems={'center'} spacing={2}>

                                <IconButton
                                    onClick={() => onDeleteEditor(group?.AuditorId)}
                                    disabled={group?.AuditorId === LoginUser?.EmpId}
                                >
                                    <Iconify icon={IconName.delete} />
                                </IconButton>


                                <IconButton
                                    onClick={() => handleDisplayAuditor(group, index)}
                                >
                                    <Iconify icon={IconName.chevronDown} id={`group-panel-chevon-${group.AuditorId}-${index}`} />
                                </IconButton>
                            </Stack>

                        </Stack>

                        {/* // Section details */}

                        <Box id={`auditor-section-${group.AuditorId}-${index}`}>
                            <ScrollView width={'99%'} height={LIST_HEIGHT}>
                                {dataSource.map((item, index) => (
                                    // <Draggable key={item.Id} draggableId={String(item.Id)} index={index}>
                                    //     {(dragProvided, snapshot) => (
                                    <Box
                                        // ref={dragProvided.innerRef}
                                        // {...dragProvided.draggableProps}
                                        // {...dragProvided.dragHandleProps}
                                        key={item.Id}
                                        sx={{
                                            padding: '8px 4px',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            color: item?.AuditorId === "" ? 'warning.main' : 'black'
                                        }}
                                    >
                                        <Stack
                                            direction="row"
                                            justifyContent="space-between"
                                            alignItems={'center'}
                                            width="100%"
                                            height={'100%'}
                                            spacing={2}
                                            sx={{
                                                draggable: false,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            <Stack direction="row" justifyContent="center" alignItems={'center'} height="100%" textAlign={'left'}>
                                                <Typography variant="subtitle" paragraph fontWeight={'bold'} whiteSpace={'normal'} sx={{ margin: 'auto' }}>
                                                    {item?.Section}
                                                </Typography>
                                            </Stack>
                                            <Checkbox
                                                checked={item?.AuditorName === group?.AuditorName}
                                                onClick={e => handleCheckItem(e.target.checked, item, group)} />
                                        </Stack>

                                    </Box>
                                    // )}
                                    // </Draggable>
                                ))
                                }
                            </ScrollView>
                        </Box>
                        {/* 
                                     {provided.placeholder} */}

                    </Stack>
                    //     )}
                    // </Droppable>
                )
                )
                }

            </Stack >
            {/* </DragDropContext> */}
        </ScrollView >
    )
}


function DialogNewAuditor({ open, onClose, handleConfirmAddNewAuditor, auditors = [] }) {

    const [auditorList, setAuditorList] = useState([])
    const [auditor, setAuditor] = useState(null);
    const { enqueueSnackbar } = useSnackbar();
    const smUp = useResponsive('up', 'sm');

    useEffect(() => {
        (async () => {
            try {
                const response = await axios.get(`api/ComplianceMobileApi/GetEmployeeList`);
                // console.log(response);
                setAuditorList(response.data.data)
            } catch (error) {
                console.error(error);
                enqueueSnackbar(JSON.stringify(error), {
                    variant: 'error'
                })
            }
        })()
        return () => {
            setAuditor(null);
        }
    }, []);

    const handleConfirm = () => {
        handleConfirmAddNewAuditor(auditor);
        setAuditor(null);
        onClose();
    };

    const auditorIds = auditors.map(d => d.AuditorId)
    const filterAuditorOptions = auditorList.filter(d => !auditorIds.includes(d.Id));

    return (
        <Popup
            visible={open}
            onHiding={onClose}
            showCloseButton
            title='New Collaborator'
            width={smUp ? '60%' : '90%'}
            height={smUp ? '60%' : '65%'}
            closeOnOutsideClick={false}
        >

            <Autocomplete
                autoComplete
                disablePortal
                onChange={(event, newValue) => {
                    setAuditor(newValue)
                }}
                defaultValue={auditorList?.find((d) => d?.KnowAs === auditor?.KnowAs) || {}}
                value={auditorList?.find((d) => d?.KnowAs === auditor?.KnowAs) || {}}
                getOptionLabel={(option) => {
                    return option?.KnowAs === undefined ? '' : `${option?.KnowAs}` || '';
                }}
                options={filterAuditorOptions}
                size="small"
                fullWidth
                autoHighlight
                sx={{ width: '100%', minWidth: 150, mt: 1 }}
                renderInput={(params) => <TextField {...params} label="Collaborator nick name" size='small' fullWidth />}
                noOptionsText={<Typography>Search not found</Typography>}
                renderOption={(props, option) => {
                    return (
                        <Box component="li" {...props}>
                            {option?.KnowAs}
                        </Box>
                    );
                }}
                PopperComponent={(params) => {
                    return (
                        <Popper {...params}>
                            <ScrollView height={400} width="100%">
                                {params.children}
                            </ScrollView>
                        </Popper>
                    );
                }}
                isOptionEqualToValue={(option, value) => {
                    return `${option?.Id}` === `${value?.Id}`;
                }}
            />

            <Stack direction={'row'} justifyContent={'flex-end'} alignItems={'center'} position={'absolute'} bottom={10} left={0} right={0} spacing={3} width={'100%'} pr={3}>
                <Button onClick={onClose} color='error' variant='contained' >Cancel</Button>
                <Button onClick={() => handleConfirm()} disabled={auditor === null} variant='contained' >Add</Button>
            </Stack>

        </Popup>
    )
};

