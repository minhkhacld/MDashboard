import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Stack, Typography, } from '@mui/material';
import DataGrid, { Column, HeaderFilter, Pager, Paging, Scrolling, Sorting, Summary, TotalItem } from 'devextreme-react/data-grid';
import PropTypes from 'prop-types';
import { useCallback } from 'react';
// components
import Iconify from '../../../components/Iconify';
// utils
import { MAP_COLORS } from '../../../pages/tqa/mapStyle';
import IconName from '../../../utils/iconsName';



DialogDetail.propTypes = {
    dialogDetail: PropTypes.object,
    setDialogDetail: PropTypes.func,
    data: PropTypes.object,
}


export default function DialogDetail({
    dialogDetail = {}, setDialogDetail = () => { }, data = {},
}) {

    const onClose = useCallback(() => {
        setDialogDetail({ visible: false })
    }, []);


    return (
        <Dialog
            open={dialogDetail.visible}
            onClose={onClose}
            fullWidth
            fullScreen
            className='map-dialog-detail'
            sx={{
                // '@media (max-width: 900px)': {
                '.css-10m0l2i-MuiPaper-root-MuiDialog-paper': {
                    margin: '0 !important',
                },
                // backgroundColor: 'red',
                // '&.MuiPaper-root MuiPaper-elevation MuiPaper-rounded MuiPaper-elevation24 MuiDialog-paper MuiDialog-paperScrollPaper MuiDialog-paperWidthSm MuiDialog-paperFullWidth MuiDialog-paperFullScreen MuiPaper-root-MuiDialog-paper': {
                //     backgroundColor: 'blue',
                //     margin: '0px !important'
                // },
                // },
            }}
            scroll={'paper'}
            aria-labelledby="scroll-dialog-title"
            aria-describedby="scroll-dialog-description"
        >
            <DialogTitle
                sx={{
                    p: {
                        xs: 1.5,
                        md: 1
                    },
                    backgroundColor: MAP_COLORS.BG,
                    '&.MuiDialogTitle-root': {
                        boxShadow: theme => theme.shadows[20],
                    },
                }}
            >
                <Stack direction='row' justifyContent={'space-between'}
                    alignItems='center'>
                    <Stack direction={'row'} justifyContent={'flex-start'} alignItems={'center'} spacing={1}>
                        <Typography variant='title' fontWeight={'bold'} color={'white'}
                        >Month Plan Detail</Typography>
                    </Stack>

                    <IconButton onClick={onClose}>
                        <Iconify icon={IconName.close} sx={{ color: 'white' }} />
                    </IconButton>

                </Stack>
            </DialogTitle>
            <DialogContent sx={{ py: { xs: 0, md: 2 }, px: { xs: 0, md: 1 } }}>
                <DxGridMonthPlan dataSource={data.items} />
            </DialogContent>
            <DialogActions>
                <Button variant='contained' onClick={onClose} sx={{ backgroundColor: MAP_COLORS.BG }}>Close</Button>
            </DialogActions>

        </Dialog>
    )
}

DxGridMonthPlan.propTypes = {
    dataSource: PropTypes.array,
}


function DxGridMonthPlan({ dataSource = [] }) {
    const pageSize = [30, 50, 100, 200];
    return (
        <DataGrid
            dataSource={dataSource}
            width={'100%'}
            height={'100%'}
            wordWrapEnabled
            keyExpr={'PPTQADId'}
            elementAttr={{ id: 'mail-group-popup' }}
            columnAutoWidth
        >
            <Column dataField="LeaderKnowAs" groupIndex={0} defaultSortIndex={0} caption={'Leader'}
                defaultSortOrder="desc" width={0} allowSearch />
            <Column dataField="FactoryName" caption={'Sub-Factory'} width={120} alignment={'left'} />
            <Column dataField="CustomerName" caption={'Customer'} width={120} />
            <Column dataField="ProductLineName" caption={'Product Line'} />
            <Column dataField="ProductGroupName" caption={'Product Group'} />
            <Column dataField="PlanQty" caption={'Quantity'}
                format={'#,##0.##'}
            />
            <Column dataField="SubFtyLine" caption={'SubFty Line'} />
            <Column dataField="Input" caption={'Input'} dataType="date" format={'ddd/MM/yyyy'}
            />
            <Column dataField="Output" caption={'Output'} dataType="date" format={'ddd/MM/yyyy'} />
            <Column dataField="QCHandlerName" caption={'QC'} />
            <Column dataField="Remark" caption={'Remark'} />
            <HeaderFilter visible allowSearch />
            <Pager visible showInfo showPageSizeSelector allowedPageSizes={pageSize} displayMode='compact' />
            <Paging enabled defaultPageSize={100} />
            <Scrolling mode='virtual' columnRenderingMode='virtual' />
            <Sorting mode="single" />
            <Summary>
                <TotalItem
                    column="PlanQty"
                    summaryType="sum"
                    valueFormat={'#,##0'}
                    displayFormat={`Total: {0}`}
                />
            </Summary>
        </DataGrid>
    )
}