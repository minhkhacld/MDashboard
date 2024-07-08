import { Capacitor } from '@capacitor/core';
import { Toast } from '@capacitor/toast';
import { Box, Button, IconButton, InputAdornment, Stack, TextField, Typography, useTheme } from '@mui/material';
// import { useLiveQuery } from 'dexie-react-hooks';
import { debounce } from 'lodash';
import moment from 'moment';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useState } from 'react';
import useDetectKeyboardOpen from "use-detect-keyboard-open";
// components
import Iconify from '../../../../components/Iconify';
import Scrollbar from '../../../../components/Scrollbar';
import Image from './Image';
// hooks
import useIsOnline from '../../../../hooks/useIsOnline';
import useLocales from '../../../../hooks/useLocales';
// config
import { HEADER, NOTCH_HEIGHT, QC_ATTACHEMENTS_HOST_API } from '../../../../config';
// utils
import { attachmentsDB } from '../../../../Db';
import IconName from '../../../../utils/iconsName';
import { transformNullToZero } from '../../../../utils/tranformNullToZero';
import PopUpContents from './PopupContent';
// redux


const BREAKCRUM_HEIGHT = 78;
const STEP_HEADER_HEIGHT = 56;
const SPACING = 50;
const DETAIL_SUMARY = 90;
const BUTTON_GROUP = 52;
const pageSize = 8;

CustomListWithSearch.propTypes = {
    isViewOnly: PropTypes.bool,
    currentInspection: PropTypes.object,
    EnumDefect: PropTypes.array,
};


function CustomListWithSearch({
    isViewOnly = false,
    currentInspection,
    EnumDefect,
}) {

    // Ref


    // hooks
    const { online } = useIsOnline();
    const { translate } = useLocales();
    const isKeyboardOpen = useDetectKeyboardOpen();
    const isAndroid = Capacitor.getPlatform() === 'android';

    // components states
    const [search, setSearch] = useState('');
    const [userQuery, setUserQuery] = useState("");
    const [listItems, setListItem] = useState([]);
    const [modalContent, setModalContent] = useState({
        visible: false,
        item: null,
        isAddNew: false,
    });


    const updateQuery = () => {
        setUserQuery(search)
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

    useEffect(() => {
        const Items = currentInspection?.Inspections.filter(d => (d.Remark.toLowerCase().includes(userQuery.toLowerCase())
            || d.DefectData.toLowerCase().includes(userQuery.toLowerCase())) && !d.IsDeleted
        ) || [];
        if (Items.length > pageSize) {

            if (listItems.length <= pageSize) {
                const items = Items.slice(0, pageSize)
                setListItem(items);
            } else {
                const items = Items.slice(0, listItems.length)
                setListItem(items);
            }
        } else {
            setListItem(Items);
        }
    }, [userQuery, currentInspection?.Inspections])


    const handleScroll = async (e) => {
        try {
            const bottom = e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
            if (bottom) {
                const remain = currentInspection?.Inspections.length - listItems.length;
                if (remain === 0) {
                    return
                }
                if (remain > pageSize) {
                    document.getElementById('loading-text').style.display = 'flex';
                    setListItem(listItems.concat(currentInspection?.Inspections.slice(listItems.length, listItems.length + pageSize)))
                    await new Promise((resolve) => setTimeout(resolve, 500));
                    document.getElementById('loading-text').style.display = 'none'
                } else {
                    document.getElementById('loading-text').style.display = 'flex';
                    setListItem(listItems.concat(currentInspection?.Inspections.slice(listItems.length, listItems.length + remain)))
                    await new Promise((resolve) => setTimeout(resolve, 500));
                    document.getElementById('loading-text').style.display = 'none'
                }
            };
        } catch (error) {
            alert(JSON.stringify(error))
        }
    };

    const handleExpandListSrcAndroid = async () => {
        const remain = currentInspection?.Inspections.length - listItems.length;
        if (remain === 0) {
            return
        }
        if (remain > pageSize) {
            await new Promise((resolve) => setTimeout(resolve, 500));
            setListItem(listItems.concat(currentInspection?.Inspections.slice(listItems.length, listItems.length + pageSize)))
        } else {
            await new Promise((resolve) => setTimeout(resolve, 500));
            setListItem(listItems.concat(currentInspection?.Inspections.slice(listItems.length, listItems.length + remain)))
        }
    }

    // OPEN MODAL CREATE NEW DEFECT
    const handleCreateDefect = () => {
        if (currentInspection.Status.Inspections) {
            return Toast.show({
                text: `Vui lòng chuyển bước này về trạng thái Complete (xanh dương) để thêm/sửa defect`,
                position: 'bottom',
            });
        };
        setModalContent({ visible: true, item: null, isAddNew: true });
    };


    // console.log(listItems);

    return (
        <Stack spacing={1}>
            <Box
                sx={{
                    width: '100%',
                    minHeight: 40,
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                }}
            >

                <TextField
                    value={search}
                    fullWidth
                    InputLabelProps={{
                        style: { color: 'var(--label)' },
                    }}
                    onFocus={(e) => {
                        e.target.select();
                    }}
                    size="small"
                    label={`${translate('search')} Remark`}
                    InputProps={{
                        fontSize: 12,
                        endAdornment: (
                            <InputAdornment position="end">
                                {search !== '' && (
                                    <IconButton
                                        aria-label="toggle password visibility"
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
                    onChange={(e) => { handleChangeSerachValue(e) }}
                    sx={{
                        width: '100%',
                        zIndex: 10,
                    }}
                />
                <IconButton
                    onClick={handleCreateDefect}
                    disabled={isViewOnly || currentInspection.IsFinished
                    }
                    sx={{
                        width: 60
                    }}
                >
                    {iconPlusCircle(online)}
                </IconButton>
            </Box>

            <Scrollbar>
                <Box
                    // onScroll={handleScroll}
                    {...!isAndroid && {
                        onScroll: handleScroll
                    }}
                    sx={{
                        draggable: false,
                        overflowX: 'hidden',
                        paddingBottom: 15,
                        height: {
                            lg: `calc(100vh - ${HEADER.DASHBOARD_DESKTOP_HEIGHT +
                                BREAKCRUM_HEIGHT +
                                STEP_HEADER_HEIGHT +
                                SPACING +
                                DETAIL_SUMARY +
                                BUTTON_GROUP + 70 +
                                NOTCH_HEIGHT
                                }px)`,
                            md: `calc(100vh - ${HEADER.MOBILE_HEIGHT +
                                BREAKCRUM_HEIGHT +
                                STEP_HEADER_HEIGHT +
                                SPACING +
                                DETAIL_SUMARY +
                                BUTTON_GROUP + 70 +
                                NOTCH_HEIGHT
                                }px)`,
                            xs: `calc(100vh - ${HEADER.MOBILE_HEIGHT +
                                BREAKCRUM_HEIGHT +
                                STEP_HEADER_HEIGHT +
                                SPACING +
                                DETAIL_SUMARY +
                                BUTTON_GROUP + 20 +
                                NOTCH_HEIGHT
                                }px)`,
                        },
                        ...(isKeyboardOpen && {
                            minHeight: {
                                xs: `calc(100vh - ${HEADER.MOBILE_HEIGHT + BREAKCRUM_HEIGHT + SPACING + NOTCH_HEIGHT}px)`,
                                lg: `calc(100vh - ${HEADER.DASHBOARD_DESKTOP_HEIGHT + BREAKCRUM_HEIGHT + SPACING + NOTCH_HEIGHT}px)`,
                            }
                        })
                    }}
                    id="compliance-section-list"
                >

                    {listItems.length > 0 &&
                        listItems.map((item, index) => {
                            return (
                                <ItemTemplate
                                    key={index}
                                    data={item}
                                    currentInspection={currentInspection}
                                    EnumDefect={EnumDefect}
                                    isViewOnly={isViewOnly}
                                    setListItem={setListItem}
                                    modalContent={modalContent}
                                    setModalContent={setModalContent}
                                />
                            );
                        })}

                    {listItems.length < currentInspection?.Inspections.length &&
                        isAndroid && userQuery === "" &&
                        <Box mt={1} justifyContent={'center'} alignItems={'center'} width={'100%'}>
                            <Button onClick={handleExpandListSrcAndroid} fullWidth>
                                {`View more (+${currentInspection?.Inspections.length - listItems.length})`}
                            </Button>
                        </Box>
                    }

                    {listItems.length === currentInspection?.Inspections.length && userQuery === "" &&
                        <Box mt={1} justifyContent={'center'} alignItems={'center'} width={'100%'}>
                            <Box p={1} bgcolor={'white'}>
                                <Typography variant="subtitle2" textAlign={'center'} width={'100%'} sx={{
                                    color: theme => theme.palette.primary.main
                                }}>End of list {`(Total: ${listItems.length} items)`}</Typography>
                            </Box>
                        </Box>
                    }

                    <Box mt={1} id='loading-text' display={'none'} position={'absolute'} bottom={45} justifyContent={'center'} alignItems={'center'} width={'100%'}>
                        <Box p={1} bgcolor={'white'}>
                            <Typography variant="subtitle2" textAlign={'center'} width={'100%'} sx={{
                                color: theme => theme.palette.primary.main
                            }}>{translate('loading')}</Typography>
                        </Box>
                    </Box>

                    {listItems.length === 0 && (
                        <Box mt={1}>
                            <Typography variant="subtitle2">{translate('noDataText')}</Typography>
                        </Box>
                    )}

                </Box>
            </Scrollbar >

            {modalContent.visible ? (
                <PopUpContents
                    modalContent={modalContent}
                    setModalContent={setModalContent}
                    currentInspection={currentInspection}
                    EnumDefect={EnumDefect}
                    isViewOnly={isViewOnly}
                    setListItem={setListItem}
                />
            ) : null}
        </ Stack >
    )
}


// export default memo(CustomListWithSearch);
export default CustomListWithSearch;



const mergeBase64 = (store, db) => {
    return store.map(d => {
        if (d.Id > 0) {
            return {
                ...d,
                URL: `${QC_ATTACHEMENTS_HOST_API}/${d?.Guid}`,
                hasBase64: false,
            }
        }
        return {
            ...d,
            Data: db.find(v => v.Id === Math.abs(d.Id))?.Data || "",
            hasBase64: true,
        }

    })
};

// // Function that processes an array of items asynchronously
// /* eslint-disable */
// const processArray = async (array, db) => {
//     let result = []
//     for (let i = 0; i < array.length; i++) {
//         const item = await processItem(array[i], db);
//         result.push(item)
//     }
//     // console.log('All items processed');
//     return result;
// };

// // Simulated asynchronous processing of an item
// const processItem = (item, db) => {
//     return new Promise((resolve) => {
//         // Simulate some asynchronous processing time
//         setTimeout(() => {
//             // console.log(`Processed item: ${item}`);
//             let result = null;
//             if (item.Id > 0) {
//                 result = {
//                     ...item,
//                     URL: `${QC_ATTACHEMENTS_HOST_API}/${item?.Guid}`,
//                     hasBase64: false,
//                 }
//             } else {
//                 result = {
//                     ...item,
//                     Data: db.find(v => v.Id === Math.abs(item.Id))?.Data || "",
//                     hasBase64: true,
//                 }
//             }
//             resolve(result);
//         }, 50); // Adjust the timeout as needed
//     });
// };




ItemTemplate.propTypes = {
    data: PropTypes.object,
    setListItem: PropTypes.func,
    currentInspection: PropTypes.object,
    EnumDefect: PropTypes.array,
    isViewOnly: PropTypes.bool,
    modalContent: PropTypes.object,
    setModalContent: PropTypes.func,
};

function ItemTemplate({
    data,
    setListItem,
    currentInspection,
    EnumDefect,
    isViewOnly,
    modalContent,
    setModalContent,
}) {

    // const Images = useLiveQuery(() => attachmentsDB.qc.where('MasterId').equals(currentInspection.Id).toArray(), []) || []
    const [Images, setImages] = useState([])
    const theme = useTheme();
    // const [images, setImage] = useState([])

    useEffect(() => {
        (async () => {
            const results = await attachmentsDB.qc.where('MasterId').equals(currentInspection.Id).and((record) => record.ParentGuid === data.Guid || record?.ParentGuid === data?.AfterGuid).toArray();
            setImages(results);

            // processArray(data?.Images, results).then(res => {
            //     // console.log(res)
            //     setImage(res)
            // }).catch(error => {
            //     console.log(error)
            // })
            // // console.log(results)

        })();
    }, [data?.Images])

    const images = mergeBase64(data?.Images, Images);
    const modalItem = { ...data, Images: images };


    // OPEN MODAL EDIT DEFECT
    const handleSetModalItem = useCallback((data) => {
        const item = { ...modalItem };
        Object.keys(modalItem).forEach((key) => {
            if (key === 'DueDate') {
                item[key] = item[key] === null ? '' : moment(item[key]).format('DD/MM/YYYY')
            } else if (key === 'Major' || key === 'Minor' || key === 'Critical') {
                item[key] = transformNullToZero(data[key])
            } else {
                item[key] = data[key] === null ? '' : data[key]
            }
        });
        setModalContent({ isAddNew: false, visible: true, item });
    }, []);


    return (
        <Stack justifyContent={'center'}
            sx={{
                position: 'relative',
                padding: 0,
                margin: 0,
                minHeight: 100,
                draggable: false,
                borderBottomColor: (theme) => theme.palette.grey[300],
                borderBottomWidth: 0.1,
            }}
        >

            <Stack direction="row" justifyContent="space-between" onClick={() => handleSetModalItem(modalItem)}>
                <Stack direction="column" justifyContent="flex-start">
                    <Typography variant="caption" paragraph color={theme.palette.error.dark} fontWeight={'bold'} mb={0}>
                        {`Defect: ${data?.DefectData} `}
                    </Typography>
                    <Typography variant="caption" paragraph mb={0} sx={{ wordBreak: 'break-word' }} whiteSpace="normal">
                        {`Category: ${data?.DefectCategory} - Area: ${data?.DefectArea} `}
                    </Typography>
                    <Typography variant="caption" paragraph mb={0}>
                        {`Major: ${transformNullToZero(data?.Major)} - Minor: ${transformNullToZero(
                            data?.Minor
                        )
                            } - Critical: ${transformNullToZero(data?.Critical)} `}
                    </Typography>
                    <Typography variant="caption" paragraph mb={0}>
                        {`Remark: ${data?.Remark} `}
                    </Typography>
                </Stack>
                <Stack justifyContent={'center'} alignItems={'center'}>
                    {data?.Images?.length === 0 ||
                        data?.Images?.filter((value) => value?.Action === 'Delete').length === data?.Images?.length ? (
                        <>
                            {' '}
                            <Typography
                                variant="caption"
                                paragraph
                                display={'inline'}
                                sx={{ textDecoration: 'underline', ml: 1.5 }}
                            >{`No Image`}</Typography>
                        </>
                    ) : (
                        <>
                            <Box
                                sx={{
                                    p: 0,
                                    width: 80,
                                    height: 80,
                                    borderRadius: 1.25,
                                    overflow: 'hidden',
                                    position: 'relative',
                                    display: 'inline-flex',
                                    border: (theme) => `solid 1px ${theme.palette.divider} `,
                                }}
                            >
                                <Image
                                    alt="preview"
                                    src={images[0]?.hasBase64 ? images[0]?.Data : images[0]?.URL}
                                    numberImage={images?.filter((value) => value?.Action !== 'Delete')?.length - 1}
                                    ratio="1/1"
                                />
                            </Box>
                        </>
                    )}
                </Stack>
            </Stack>

            {/* <Stack justifyContent="flex-start" alignItems="flex-start" width="100%" mb={1}>
                <Button onClick={() => handleSetModalItem(modalItem)} size="small" startIcon={<Iconify icon={IconName.pluseSquare} />}>Corrective action</Button>
            </Stack> */}

        </Stack>
    );

}

const iconPlusCircle = (online) => {
    if (!online) {
        return (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="26"
                height="26"
                preserveAspectRatio="xMidYMid meet"
                viewBox="0 0 1024 1024"
            >
                <path
                    fill="currentColor"
                    d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448s448-200.6 448-448S759.4 64 512 64zm192 472c0 4.4-3.6 8-8 8H544v152c0 4.4-3.6 8-8 8h-48c-4.4 0-8-3.6-8-8V544H328c-4.4 0-8-3.6-8-8v-48c0-4.4 3.6-8 8-8h152V328c0-4.4 3.6-8 8-8h48c4.4 0 8 3.6 8 8v152h152c4.4 0 8 3.6 8 8v48z"
                />
            </svg>
        );
    }
    return <Iconify icon={IconName.plusCircle} />;
};



