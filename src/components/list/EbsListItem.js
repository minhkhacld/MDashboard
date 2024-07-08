import React, { useState, useEffect } from 'react';
import InfiniteScroll from "react-infinite-scroll-component";
import { styled } from '@mui/material'
import axios from '../../utils/axios';
import { HEADER, HOST_API, NOTCH_HEIGHT } from '../../config';
import Scrollbar from '../Scrollbar';

const BANER_HEIGHT = 100;
const BREAKCRUM_HEIGHT = 78;
const SPACING = 60;

const RootStyle = styled(Scrollbar, {
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

const EbsLisItem = ({
    apiUrl,
    ItemRender,
}) => {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [skip, setSkip] = useState(0);
    const [take, setTake] = useState(20);
    const [totalGroups, setTotalGroups] = useState(0)
    const pageSize = 10; // Number of items to load per page

    // Simulated function to fetch data from the server
    const fetchDataFromServer = async (pageNumber) => {
        // Simulated API URL
        // const API_URL = `https://api.example.com/data?page=${pageNumber}&pageSize=${pageSize}`;
        const API_URL = apiUrl
        try {
            setIsLoading(true);
            const response = await axios.get(API_URL, {
                params:
                {
                    skip,
                    take: 10,
                    sort: JSON.stringify([{ selector: 'SortOrder', desc: false }]),
                    group: JSON.stringify([{ selector: 'ReportDate', isExpanded: true, desc: true }]),
                    paginate: true,
                    pageSize: 10,
                    requireTotalCount: true,
                    requireGroupCount: true,

                }

            });
            console.log(response.data);
            const newData = response.data.data;

            // Append new data to existing data
            setData((prevData) => [...prevData, ...newData]);
            setPage(pageNumber + 1);
            setSkip((pre) => pre + newData.length);
            setTake((pre) => pre + newData.length);
            setTotalGroups(response.data.groupCount)

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Function to handle scroll events
    const handleScroll = (event) => {
        const { scrollTop, clientHeight, scrollHeight } = event.currentTarget;
        const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
        if (distanceFromBottom < 50 && !isLoading) {
            // Fetch new data when scrolled to the bottom (50 is a threshold)
            fetchDataFromServer(page);
        }
    };

    // Simulated initial data fetching on component mount
    useEffect(() => {
        fetchDataFromServer(page);
    }, []);

    return (
        // <RootStyle onScroll={handleScroll}>
        //     {data.map((item, index) => (
        //         <div key={index}>
        //             {/* {ItemRender(item)} */}
        //             <p style={{ marginTop: 50 }}>{item.Id}</p>
        //         </div>
        //     ))}
        //     {isLoading && <p>Loading...</p>}
        // </RootStyle>
        <RootStyle>
            <InfiniteScroll
                dataLength={10} // This is important field to render the next data
                next={fetchDataFromServer}
                hasMore
                loader={<h4>Loading...</h4>}
                endMessage={
                    <p style={{ textAlign: 'center' }}>
                        <b>Yay! You have seen it all</b>
                    </p>
                }
                // below props only if you need pull down functionality
                refreshFunction={() => console.log('refresh')}
                pullDownToRefresh
                pullDownToRefreshThreshold={50}
                pullDownToRefreshContent={
                    < h3 style={{ textAlign: 'center' }}>&#8595; Pull down to refresh</h3 >
                }
                releaseToRefreshContent={
                    < h3 style={{ textAlign: 'center' }}>&#8593; Release to refresh</h3 >
                }
            >
                {
                    data.map((item, index) => (
                        <div key={index}>
                            {/* {ItemRender(item)} */}
                            <p style={{ marginTop: 50 }}>{item.key}</p>
                        </div>
                    ))
                }
            </InfiniteScroll >
        </RootStyle>
    );
};

export default EbsLisItem;
