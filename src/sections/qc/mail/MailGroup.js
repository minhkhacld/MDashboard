import { Autocomplete, Chip, IconButton, InputAdornment, Stack, TextField } from '@mui/material';
import { createStore } from 'devextreme-aspnet-data-nojquery';
import { Popup } from 'devextreme-react';
import DataGrid, {
    Column,
    Editing,
    HeaderFilter,
    Lookup, Pager, Paging, Scrolling,
    //  SearchPanel,
    Sorting
} from 'devextreme-react/data-grid';
import DataSource from 'devextreme/data/data_source';
import { useLiveQuery } from 'dexie-react-hooks';
import { debounce } from 'lodash';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
// Hooks
import { Controller } from 'react-hook-form';
import useLocales from '../../../hooks/useLocales';
import useResponsive from '../../../hooks/useResponsive';
import useAccessToken from '../../../hooks/useAccessToken';
// components
import Iconify from '../../../components/Iconify';
// Util
import IconName from '../../../utils/iconsName';
// config
import { HOST_API } from '../../../config';
import { db } from '../../../Db';



const blurActiveElement = () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(document.activeElement.blur());
        }, 500)
    })
}

MailGroups.propTypes = {
    values: PropTypes.object,
    setValue: PropTypes.func,
    handleSetGroups: PropTypes.func,
    control: PropTypes.any,
    errors: PropTypes.object,
};

function MailGroups({ values, setValue, handleSetGroups, control, errors, }) {

    // Hooks
    const { enqueueSnackbar } = useSnackbar();
    const MailType = useLiveQuery(() => db?.Enums.where('Name').equals('MailType').toArray()) || [];
    const { translate } = useLocales()

    // components states;
    const [emailGroup, setEmailGroup] = useState(false);


    // custom fuction
    const handleMailGroupConfig = useCallback(() => {
        // document.activeElement.blur();
        // setEmailGroup(true);
        blurActiveElement().then(() => {
            setEmailGroup(true);
        })
    }, []);

    return (
        <>
            <Stack direction={'row'} spacing={1}>
                <Controller
                    control={control}
                    render={({ field }) => (
                        <Autocomplete
                            multiple
                            size='small'
                            limitTags={3}
                            fullWidth
                            id="group-limit-tags"
                            options={values.groupOptions
                                .filter(d => {
                                    const filtered = !values.groups.map(v => v.GroupName).includes(d.GroupName)
                                    return filtered
                                })
                                .
                                sort((a, b) => -b?.GroupName.localeCompare(a?.GroupName))
                            }
                            getOptionLabel={(option) => {
                                return String(option?.GroupName
                                    || "")
                            }}
                            defaultValue={values.groups}
                            value={values.groups}
                            onChange={(event, newValue) => handleSetGroups(newValue)}
                            renderInput={(params) => (
                                <TextField {...params} label="Groups" placeholder={translate('search')} InputLabelProps={{
                                    style: {
                                        color: 'var(--label)'
                                    }, shrink: true,
                                }}
                                    error={errors.groups !== undefined}
                                    {...(errors?.groups && {
                                        helperText: 'Group must require at least one person'
                                    })}
                                />
                            )}
                            renderTags={(tagValue, getTagProps) =>
                                tagValue.map((option, index) => {
                                    return (
                                        <Chip
                                            label={option?.GroupName}
                                            {...getTagProps({ index })}
                                        />
                                    )
                                })
                            }
                            isOptionEqualToValue={(option, value) => {
                                return option?.GroupName === value?.GroupName
                            }}
                        />)}
                />

                <IconButton onClick={() => handleMailGroupConfig()}>
                    <Iconify icon={IconName.plusCircle} />
                </IconButton>
            </Stack>

            {emailGroup &&
                <EmailGroupDialog emailGroup={emailGroup}
                    setEmailGroup={setEmailGroup} enqueueSnackbar={enqueueSnackbar}
                    // accessToken={accessToken}
                    MailType={MailType} values={values} setValue={setValue}
                />
            }
        </>
    )
}

export default MailGroups;


EmailGroupDialog.propTypes = {
    values: PropTypes.object,
    setValue: PropTypes.func,
    emailGroup: PropTypes.bool,
    setEmailGroup: PropTypes.func,
    enqueueSnackbar: PropTypes.func,
    MailType: PropTypes.array,
};


function EmailGroupDialog({ emailGroup, setEmailGroup, enqueueSnackbar,
    MailType, values, setValue }) {

    const gridRef = useRef(null)

    const { translate } = useLocales();
    const mdUp = useResponsive('up', 'md')

    const MAIL_TYPE_OPTIONS = MailType[0]?.Elements || [];

    const editingOptions = {
        cancelAllChanges: translate('button.cancel'),
        cancelRowChanges: translate('button.cancel'),
        confirmDeleteTitle: translate('button.delete'),
        confirmDeleteMessage: translate('message.action'),
        deleteRow: translate('button.delete'),
        editRow: translate('button.edit'),
        saveAllChanges: translate('button.save'),
        saveRowChanges: translate('button.save'),
    };

    const animationStyle = {
        show: {
            type: 'fade',
            duration: 400,
            from: 0,
            to: 1
        },
        hide: {
            type: 'fade',
            duration: 400,
            from: 1,
            to: 0
        }
    };

    const wrapperAttr = { id: 'mail-group-dxpopup' }

    const pageSize = [30, 50, 100, 200];

    const [search, setSearch] = useState('');
    const [userQuery, setUserQuery] = useState("");

    const updateQuery = () => {
        setUserQuery(search)
        dataStore.filter(["GroupName", 'contains', search])
    };

    const delayedQuery = useCallback(debounce(updateQuery, 500), [search]);

    const handleChangeSerachValue = e => {
        setSearch(e.target.value)
    };

    useEffect(() => {
        delayedQuery();
        // Cancel the debounce on useEffect cleanup.
        return delayedQuery.cancel;
    }, [search, delayedQuery]);

    // Email group dataGrid;
    const API_URL = `${HOST_API}/api/QIProductEmailConfigApi/`;
    const accessToken = useAccessToken();


    // Side effects;
    const dataStore = useMemo(() => new DataSource({
        store: createStore({
            key: 'Id',
            loadUrl: `${API_URL}Get`,
            insertUrl: `${API_URL}Post`,
            updateUrl: `${API_URL}Put`,
            deleteUrl: `${API_URL}Delete`,
            onBeforeSend: (method, ajaxOptions) => {
                const newAccessToken = localStorage.getItem('accessToken');
                ajaxOptions.headers = { Authorization: `Bearer ${newAccessToken}`, 'api-version': '1' };
            },
        }),
        group: JSON.stringify([{ "selector": "GroupName", "desc": true, "isExpanded": false }]),
        sort: JSON.stringify([{ "selector": "GroupName", "desc": false, }]),
    }), [accessToken])

    // close modal
    const handleClose = useCallback(() => {
        setEmailGroup(false)
    }, []);

    const handleRowClick = useCallback((e) => {
        if (e.data.key === undefined) {
            enqueueSnackbar(translate('inspection.sendMail.rowClickWarning'))
            return
        };

        if (e.data.key !== undefined) {
            const { key, items, collapsedItems } = e.data;
            const to = [];
            const cc = [];
            const bcc = [];

            if (items !== undefined && items !== null) {
                items.forEach((row, index) => {

                    const mailType = MAIL_TYPE_OPTIONS.find(el => el.Value === row.MailTypeId).Caption;

                    // console.log(mailType, index);

                    switch (mailType) {

                        case 'TO':
                            to.push(row.Email)
                            break;
                        case 'CC':
                            cc.push(row.Email)
                            break;
                        case 'BCC':
                            bcc.push(row.Email)
                            break;
                        default:
                    }
                });
            }

            if (collapsedItems !== undefined && collapsedItems !== null) {
                collapsedItems.forEach((row, index) => {

                    const mailType = MAIL_TYPE_OPTIONS.find(el => el.Value === row.MailTypeId).Caption;

                    // console.log(mailType, index);

                    switch (mailType) {

                        case 'TO':
                            to.push(row.Email)
                            break;
                        case 'CC':
                            cc.push(row.Email)
                            break;
                        case 'BCC':
                            bcc.push(row.Email)
                            break;
                        default:
                    }
                });
            }

            if (to.length > 0) {
                setValue('to', values.to.concat(to))
            }
            if (cc.length > 0) {
                setValue('cc', values.cc.concat(cc))
            }
            if (bcc.length > 0) {
                setValue('bcc', values.bcc.concat(bcc))
            }
            setValue('groups', [...values.groups, { GroupName: key }])
            setEmailGroup(false)
        };
    }, []);


    // const handleCustomSave = (e) => {
    //     try {
    //         e.component.option("toolbarItems[0].options.text", "Lưu");
    //         e.component.option("toolbarItems[1].options.text", "Huỷ bỏ");
    //         e.component.option("toolbarItems[0].options.onClick", async el => {
    //             const visibleRow = gridRef.current.instance.getVisibleRows();
    //             const newRow = visibleRow.find(d => d.isNewRow && d.isEditing && d.rowType === 'data');
    //             const editRow = visibleRow.find(d => d.isEditing && d.rowType === 'data');
    //             console.log(newRow, editRow, e.component.option());
    //             if (newRow !== undefined) {
    //                 const response = await axios.post(`${API_URL}Post`, { data: newRow.data });
    //             }
    //             if (editRow !== undefined) {
    //                 const formData = new FormData();
    //                 formData.append('value', JSON.stringify({ key: editRow.key }));
    //                 const response = await axios.put(`${API_URL}Put`, formData);
    //                 console.log(response.data);
    //             }
    //             gridRef.current.instance.refresh()
    //         });
    //     } catch (error) {
    //         console.log(error);
    //         enqueueSnackbar(JSON.stringify(error), {
    //             variant: 'error',
    //             anchorOrigin: {
    //                 vertical: 'top',
    //                 horizontal: 'center'
    //             }
    //         });
    //     };
    // };


    return (
        <Popup
            visible={emailGroup}
            onHiding={handleClose}
            dragEnabled={false}
            hideOnOutsideClick={false}
            closeOnOutsideClick={false}
            showCloseButton
            showTitle
            title={'Email Group'}
            // width={'98%'}
            // height={'100%'}
            width={mdUp ? 800 : '100%'}
            height={mdUp ? '90%' : '100%'}
            wrapperAttr={wrapperAttr}
            animation={animationStyle}
        >
            <TextField
                value={search}
                fullWidth
                InputLabelProps={{
                    style: { color: 'var(--label)' },
                }}
                size="small"
                label={`${translate('search')} Group`}
                InputProps={{
                    fontSize: 12,
                    startAdornment: (
                        <InputAdornment position="start">
                            <Iconify icon={IconName.search} />
                        </InputAdornment>
                    ),
                    endAdornment: (
                        <InputAdornment position="end">
                            {search !== '' && (
                                <IconButton
                                    aria-label="toggle reset search visibility"
                                    onClick={() => {
                                        setSearch('');
                                    }}
                                    edge="end"
                                >
                                    <Iconify icon={IconName.close} />
                                </IconButton>
                            )}
                        </InputAdornment>
                    ),
                }}
                onChange={handleChangeSerachValue}
                sx={{
                    position: 'absolute',
                    top: 55,
                    left: 8,
                    width: '70%',
                    zIndex: 10000000000,
                    maxHeight: 30,
                }}
            />
            <DataGrid dataSource={dataStore} style={{
                height: '100%',
            }}
                wordWrapEnabled
                // keyExpr={'Id'}
                key={'Guid'}
                elementAttr={{ id: 'mail-group-popup' }}
                onRowClick={handleRowClick}
                ref={gridRef}
                onEditingStart={blurActiveElement}
            >
                <Column dataField="GroupName" groupIndex={0} defaultSortIndex={0} caption={translate('groupName')}
                    defaultSortOrder="desc" width={0} allowSearch />
                <Column dataField="Email" width={180} />
                <Column dataField="MailTypeId" caption={translate('mailType')} allowSearch>
                    <Lookup dataSource={MAIL_TYPE_OPTIONS} displayExpr='Caption' valueExpr={'Value'} />
                </Column>
                <Editing
                    allowAdding
                    allowDeleting
                    allowUpdating
                    mode={'popup'}
                    useIcons
                // refreshMode='full'
                // texts={editingOptions}
                />
                {/* <DxFormPopup title="Edit email group" showTitle width={'90%'} height={'90%'}
                        onContentReady={handleCustomSave} />
                    <Form>
                        <Item itemType="group" colCount={2} colSpan={2}>
                            <Item dataField="GroupName" />
                            <Item dataField="Email" />
                            <Item dataField="MailTypeId" editorType="dxSelectBox" />
                        </Item>
                    </Form>
                </Editing> */}
                <HeaderFilter visible allowSearch />
                <Pager visible showInfo showPageSizeSelector allowedPageSizes={pageSize} displayMode='compact' />
                <Paging enabled defaultPageSize={100} />
                <Scrolling mode='virtual' />
                <Sorting mode="single" />
            </DataGrid>
        </Popup >
    )
};
