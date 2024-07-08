import React, { useState, useRef, useEffect, forwardRef, useCallback } from 'react';
import { debounce } from 'lodash';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Box, TextField, Stack, IconButton, InputAdornment, } from '@mui/material';
import Scrollbar from '../Scrollbar';
import Iconify from '../Iconify';
import useIsMountedRef from '../../hooks/useIsMountedRef';
import axios from '../../utils/axios';
import IconName from '../../utils/iconsName';
import useLocales from '../../hooks/useLocales';

const CustomList = forwardRef(({ height = '100%', dataLength = 30, searchEnable = true, searchExpr = [], apiUrl = "", params = {}, children, inputRef = null, listRef = null, dataSource = [], ...props }, ref) => {

    // hooks
    const isMountedRef = useIsMountedRef;
    const { translate } = useLocales();

    // States
    const [search, setSearch] = useState('');
    const [isFocus, setIsFocus] = useState(false);
    const [userQuery, setUserQuery] = useState("");

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


    if (dataSource.length === 0) {
        return <h4>No data...</h4>;
    }

    const filterData = () => {
        let filterByProp = [];
        if (userQuery === '') {
            return dataSource;
        }
        if (userQuery !== '') {
            filterByProp = dataSource.filter((d) => {
                let valid = false;
                searchExpr.forEach((field) => {
                    if (d[field] !== null && d[field] !== undefined) {
                        if (typeof d[field] === 'string') {
                            if (d[field]?.toLowerCase().includes(userQuery?.toLowerCase())) {
                                valid = true;
                            }
                        }
                        if (typeof d[field] === 'boolean' || typeof d[field] === 'number') {
                            if (d[field] === userQuery?.toLowerCase()) {
                                valid = true;
                            }
                        }
                    }
                });
                return valid;
            });
        }
        return filterByProp;
    };

    const fetchMoreData = () => {
        // a fake async api call like which sends
        // 20 more records in 1.5 secs
        console.log('ren');
        // setTimeout(() => {
        //   axios.get(apiUrl, { params }).then((res) => {
        //     setDataSource(dataSource.concat(Array.from({ length: 20 })));
        //   });
        // }, 1500);
    };

    const renderDataSource = filterData();

    return (
        <Box width={'100%'}>
            {searchEnable && (
                <TextField
                    value={search}
                    InputLabelProps={{
                        style: { color: 'var(--label)' },
                    }}
                    onFocus={(e) => {
                        e.target.select();
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
                    ref={inputRef}
                    sx={{
                        width: '100%',
                        backgroundColor: 'white !important'
                    }}
                />

            )}
            <Box
                component={'div'}
                id="scrollableDiv"
                width={'100%'}
                sx={{
                    height,
                    overflow: 'auto',
                    display: 'flex',
                    pb: 35,
                    // flexDirection: 'column-reverse',

                }}
            >
                {/* Put the scroll bar always on the bottom */}
                <InfiniteScroll
                    dataLength={dataLength}
                    next={fetchMoreData}
                    style={{
                        display: 'flex', flexDirection: 'column-reverse',
                    }} // To put endMessage and loader to the top.
                    inverse={false}
                    hasMore
                    loader={<h4>Loading...</h4>}
                    scrollableTarget="scrollableDiv"
                    ref={listRef}
                // refreshFunction={this.refresh}
                //   pullDownToRefresh
                //   pullDownToRefreshThreshold={50}
                //   pullDownToRefreshContent={<h3 style={{ textAlign: 'center' }}>&#8595; Pull down to refresh</h3>}
                //   releaseToRefreshContent={<h3 style={{ textAlign: 'center' }}>&#8593; Release to refresh</h3>}
                >
                    {renderDataSource.map((data, index) => children(data, props))}
                </InfiniteScroll>
            </Box>
        </Box>
    );
});

export default CustomList;