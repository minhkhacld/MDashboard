import { Capacitor } from '@capacitor/core';
import { Box, Button, Checkbox, FormControlLabel, IconButton, InputAdornment, Skeleton, Stack, TextField, Typography } from '@mui/material';
import { debounce } from 'lodash';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useDetectKeyboardOpen from "use-detect-keyboard-open";
// components
import Iconify from '../../../../components/Iconify';
import Scrollbar from '../../../../components/Scrollbar';
import ItemTemplate from './ItemTemplate';
// iconame
import IconName from '../../../../utils/iconsName';
// hooks
import useLocales from '../../../../hooks/useLocales';
// config
import { HEADER, NOTCH_HEIGHT } from '../../../../config';


const BREAKCRUM_HEIGHT = 78;
const STEP_HEADER_HEIGHT = 56;
const SPACING = 50;
const DETAIL_SUMARY = 90;
const BUTTON_GROUP = 52;
const pageSize = 10;

const options = ['Required', 'Have Image', 'No Image'];

CustomList.propTypes = {
    dataSource: PropTypes.array,
    isViewOnly: PropTypes.bool,
    currentInspection: PropTypes.object,
    handleChangeFilter: PropTypes.func,
    packingMethodEnum: PropTypes.any,
    isApplyFilter: PropTypes.bool,
};


function CustomList({ dataSource, isViewOnly, currentInspection, handleChangeFilter, packingMethodEnum,
    isApplyFilter
}) {

    // Ref
    const inputRef = useRef(null);
    const isKeyboardOpen = useDetectKeyboardOpen()

    // components state;
    const [search, setSearch] = useState('');
    const [isFocus, setIsFocus] = useState(false);
    const [userQuery, setUserQuery] = useState("");
    const [listItems, setListItem] = useState([]);
    const isAndroid = Capacitor.getPlatform() === 'android';

    // hooks
    const { translate } = useLocales();

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
        const Items = dataSource.filter(d => (d.Title.toLowerCase().includes(userQuery.toLowerCase()))) || [];
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
    }, [userQuery, dataSource]);

    const handleScroll = async (e) => {
        try {
            const bottom = e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
            if (bottom) {
                const remain = dataSource.length - listItems.length;
                if (remain === 0) {
                    return
                }
                if (remain > pageSize) {
                    document.getElementById('loading-text').style.display = 'flex';
                    await new Promise((resolve) => setTimeout(resolve, 500));
                    setListItem(listItems.concat(dataSource.slice(listItems.length, listItems.length + pageSize)))
                    // await new Promise((resolve) => setTimeout(resolve, 500));
                    document.getElementById('loading-text').style.display = 'none'
                } else {
                    document.getElementById('loading-text').style.display = 'flex';
                    await new Promise((resolve) => setTimeout(resolve, 500));
                    setListItem(listItems.concat(dataSource.slice(listItems.length, listItems.length + remain)))
                    // await new Promise((resolve) => setTimeout(resolve, 500));
                    document.getElementById('loading-text').style.display = 'none'
                }
            };
        } catch (error) {
            console.error(error);
        }
    }

    const handleExpandListSrcAndroid = async () => {
        const remain = dataSource.length - listItems.length;
        if (remain === 0) {
            return
        }
        if (remain > pageSize) {
            await new Promise((resolve) => setTimeout(resolve, 500));
            setListItem(listItems.concat(dataSource.slice(listItems.length, listItems.length + pageSize)))
        } else {
            await new Promise((resolve) => setTimeout(resolve, 500));
            setListItem(listItems.concat(dataSource.slice(listItems.length, listItems.length + remain)))
        }
    }

    const listStyles = useMemo(() => ({
        draggable: false,
        overflowX: 'hidden',
        paddingBottom: 15,
        height: {
            lg: `calc(100vh - ${HEADER.DASHBOARD_DESKTOP_HEIGHT +
                BREAKCRUM_HEIGHT +
                STEP_HEADER_HEIGHT +
                SPACING +
                DETAIL_SUMARY +
                BUTTON_GROUP +
                NOTCH_HEIGHT + 90
                }px)`,
            md: `calc(100vh - ${HEADER.MOBILE_HEIGHT +
                BREAKCRUM_HEIGHT +
                STEP_HEADER_HEIGHT +
                SPACING +
                DETAIL_SUMARY +
                BUTTON_GROUP + 90 +
                NOTCH_HEIGHT
                }px)`,
            xs: `calc(100vh - ${HEADER.MOBILE_HEIGHT +
                BREAKCRUM_HEIGHT +
                STEP_HEADER_HEIGHT +
                SPACING +
                DETAIL_SUMARY +
                BUTTON_GROUP + 40 +
                NOTCH_HEIGHT
                }px)`,
        },
        ...(isKeyboardOpen && {
            minHeight: {
                xs: `calc(100vh - ${HEADER.MOBILE_HEIGHT + BREAKCRUM_HEIGHT + SPACING + NOTCH_HEIGHT}px)`,
                lg: `calc(100vh - ${HEADER.DASHBOARD_DESKTOP_HEIGHT + BREAKCRUM_HEIGHT + SPACING + NOTCH_HEIGHT}px)`,
            }
        })
    }),
        [isKeyboardOpen])


    return (
        <Box>
            <Stack direction={'row'} justifyContent={'center'} alignItems={'center'} spacing={1}>
                <TextField
                    value={search}
                    InputLabelProps={{
                        style: { color: 'var(--label)' },
                    }}
                    onFocus={(e) => {
                        e.target.select();
                        document.getElementById('check-box-group-pnl').style.display = 'none';
                        setIsFocus(true)
                    }}
                    size="small"
                    label={`${translate('search')} Title`}
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
                        style: {
                            backgroundColor: 'white'
                        }
                    }}
                    onChange={(e) => { handleChangeSerachValue(e) }}
                    ref={(ref) => { inputRef.current = ref }}
                    onBlur={() => {
                        document.getElementById('check-box-group-pnl').style.display = 'inline-flex';
                        setIsFocus(false)
                    }}
                    id='SearchEditorOptionsPackingLabel'
                    sx={{
                        width: {
                            xs: isFocus ? '100%' : '45%',
                            md: isFocus ? '100%' : '80%'
                        },
                        zIndex: 10,
                        backgroundColor: 'white !important'
                    }}
                />

                <Stack
                    id="check-box-group-pnl"
                    direction={'row'}
                    sx={{
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: {
                            xs: '55%',
                            md: '20%',
                        },
                        zIndex: 9,
                    }}
                >

                    {options?.map((option) => {
                        return (
                            <FormControlLabel
                                key={option}
                                value={option}
                                control={<Checkbox onChange={handleChangeFilter} />}
                                label={LabelCheckBox(option)}
                                labelPlacement="top"
                                sx={{
                                    '&.MuiFormControlLabel-root': {
                                        m: 1,
                                    }
                                }}
                            />
                        );
                    })}

                </Stack>
            </Stack>

            <Scrollbar>
                <Box
                    // onScroll={handleScroll}
                    {...!isAndroid && {
                        onScroll: handleScroll
                    }}
                    sx={listStyles}
                >

                    {listItems.length > 0 &&
                        listItems.map((data) => {
                            return (
                                <ItemTemplate
                                    key={data.Id}
                                    data={data}
                                    isViewOnly={isViewOnly}
                                    currentInspection={currentInspection}
                                    packingMethodEnum={packingMethodEnum}
                                    dataSource={dataSource}
                                />
                            );
                        })
                    }

                    {listItems.length < dataSource.length && !isApplyFilter &&
                        isAndroid &&
                        <Box mt={1} justifyContent={'center'} alignItems={'center'} width={'100%'}>
                            <Button onClick={handleExpandListSrcAndroid} fullWidth>
                                {`View more (+${dataSource.length - listItems.length})`}
                            </Button>
                        </Box>
                    }


                    {listItems.length === dataSource.length && !isApplyFilter &&
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

                    {dataSource.length === 0 &&
                        <Box mt={1}>
                            <Typography variant="subtitle2">{translate('noDataText')}</Typography>
                        </Box>
                    }

                    {currentInspection === undefined || (listItems.length === 0 && dataSource.length > 0) && (
                        <Stack spacing={2}>
                            {
                                [...new Array(5)].map((d, index) => (
                                    <Stack spacing={2} key={index} direction={'row'}>
                                        <Skeleton variant='rectangular' animation='wave' width={'80%'} height={80} sx={{ borderRadius: 1 }} />
                                        <Box width={'20%'}
                                            display={'flex'}
                                            justifyContent={'center'}
                                            alignItems={'center'}
                                        >
                                            <Skeleton variant='rectangular' animation='wave' width={80} height={80} sx={{ borderRadius: 1 }} />
                                        </Box>
                                    </Stack>
                                )
                                )
                            }
                        </Stack>
                    )}

                </Box>
            </Scrollbar >
        </ Box >
    )
}



export default CustomList



const LabelCheckBox = (option) => {
    return (
        <Typography
            variant="caption"
            paragraph
            sx={{
                fontSize: '8px',
                margin: 0,
                // overflow: 'hidden',
            }}
            display={'inline-block'}
            height={'10%'}
        >{`${option}`}</Typography>
    );
};