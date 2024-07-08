import React from 'react';
import Popup from 'devextreme-react/popup';
import Proptypes from 'prop-types'
import { Stack, Box, styled } from '@mui/material';
import DataGrid, { Column, Scrolling, Summary, SummaryTexts, Pager, Paging, TotalItem, HeaderFilter, SearchPanel } from 'devextreme-react/data-grid';

const DialogStyled = styled(Popup)(({ theme, ownerState }) => {
    return {
        width: '100%',
        height: '100%',
        // ...(theme.breakpoints.up('sm') && {
        //     width: '90%',
        //     height: '90%'
        // })
    };
});

DialogFactoryInfo.propTypes = {
    open: Proptypes.bool,
    onClose: Proptypes.func,
    data: Proptypes.array,
}

const pages = [30, 50, 100, 500];

const animations = {
    show: {
        type: 'slide',
    },
    hide: {
        type: 'slide',
    }
}

export default function DialogFactoryInfo({
    open,
    onClose,
    data,
}) {

    return (
        <DialogStyled
            visible={open}
            onHiding={onClose}
            title="Factory list"
            fullScreen
            closeOnOutsideClick
            animation={animations}
        >
            <DataGrid
                dataSource={data}
                height={'100%'}
            >
                <Column caption={'Factory'} dataField={'Factory'} />
                <Column caption={'Lines'} dataField={'SewingLine'} width={100} />
                <Column caption={'Manpower'} dataField={'Mainpower'} width={100} />
                <Column caption={'Capacity'} dataField={'Capacity'} width={150} />
                <Column caption={'Product categories'} dataField={'ProductCategories'} />
                <Column caption={'Latitude'} dataField={'Latitude'} width={100} />
                <Column caption={'Longitude'} dataField={'Longitude'} width={100} />
                <Column caption={'Alive'} dataField={'Alive'} width={100} />
                <HeaderFilter visible />
                <Pager allowedPageSizes={pages} visible showNavigationButtons showPageSizeSelector />
                <Paging enabled defaultPageSize={500} />
                <Summary
                // calculateCustomSummary={calculateSelectedRow}
                >
                    <TotalItem
                        column={'Factory'}
                        summaryType="count"
                    />
                    <TotalItem
                        column={'Alive'}
                        summaryType="sum"
                    // name="SelectedRowsSummary"
                    // summaryType="custom"
                    />
                </Summary>
                <Scrolling mode={'standard'} />
            </DataGrid>
        </DialogStyled>
    )
}
