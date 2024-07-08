import { Capacitor } from '@capacitor/core';
import { LoadPanel, Position } from 'devextreme-react/load-panel';
import moment from 'moment';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
// @mui
import {
  Box,
  Button,
  Card,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  Typography, useTheme,
} from '@mui/material';
// devextreme
import { List, SearchEditorOptions } from 'devextreme-react/list';
// Redux
import Page from '../../components/Page';
import { useSelector } from '../../redux/store';
// routes
import { PATH_APP } from '../../routes/paths';
// hooks
import useLocales from '../../hooks/useLocales';
import useResponsive from '../../hooks/useResponsive';
import useSettings from '../../hooks/useSettings';
// components
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import NoItemsBanner from '../../components/NoItemsBanner';
import { HEADER, NOTCH_HEIGHT } from '../../config';
import axios from '../../utils/axios';

// ENtityList

// ----------------------------------------------------------------------
const BREAKCRUM_HEIGHT = 40;
const SPACING = 40;
const TAB_HEIGHT = 0;


export default function ShipmentRecall() {
  // Hooks

  const { translate } = useLocales();
  const { themeStretch } = useSettings();
  const smUp = useResponsive('up', 'sm');
  const mdUp = useResponsive('up', 'md');
  const lgUp = useResponsive('up', 'lg');
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  // redux
  const { LoginUser } = useSelector((store) => store.workflow);

  // components state
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [recallModal, setRecallModal] = useState({
    visible: null,
    itemData: null,
    itemIndex: null,
  });

  // Devextreme store;
  // console.log(LoginUser)

  const getDataSource = () => {
    setLoading(true);
    return axios.get('/api/ShipmentStatementReviewPendingApi/Get', {
      params: {
        filter: JSON.stringify(['SubmitterEmplId', '=', LoginUser?.EmpId]),
        requireTotalCount: true,
        pageSize: 5,
        sort: JSON.stringify([{ selector: 'ETD', desc: false }]),
      },
    });
  };

  const handleSetDataSource = () => {
    getDataSource()
      .then((result) => {
        // console.log(result);
        setDataSource(result.data);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
        enqueueSnackbar(JSON.stringify(err), {
          variant: 'error',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'center',
          },
        });
      });
  };

  useEffect(() => {
    handleSetDataSource();
  }, []);

  // useEffect(() => {
  //   const listPlanning = document.getElementById('list-planing');
  //   const breacrumb = document.getElementById('header-breacrumb');
  //   if (listPlanning !== null && listPlanning !== undefined) {
  //     listPlanning.style.height = `${window.screen.height - (lgUp ? 280 : HEADER.MOBILE_HEIGHT) - breacrumb.getBoundingClientRect().height - 70
  //       }px`;
  //   }
  // }, [dataSource]);

  const handleOpenModal = (row) => {
    // console.log(row);
    setRecallModal({
      visible: true,
      itemData: row.itemData,
      itemIndex: row.itemIndex,
    });
  };

  // console.log(source)
  // RENDER LIST
  const itemTemplate = (data) => {
    // console.log(data);
    return (
      <Stack direction="row" justifyContent="space-between" pl={smUp ? 1 : 0}>
        <Stack direction="column" justifyContent="flex-start" flexWrap width={'70%'}>
          <Typography variant="caption" paragraph color="black" fontWeight={'bold'} mb={0}>
            {data?.SysNo}
          </Typography>
          <Typography variant="caption" paragraph mb={0}>
            {`${data?.CustomerName}`}
          </Typography>
          <Typography
            variant="caption"
            paragraph
            mb={0}
            sx={{
              wordWrap: 'break-word',
              whiteSpace: 'normal',
            }}
          >
            Invoice No: {`${data?.InvoiceNo}`}
          </Typography>
          <Typography variant="caption" paragraph mb={0}>
            Requested by: {`${data?.SubmittedBy}`}
          </Typography>
        </Stack>
        <Stack direction="column" sx={{ width: '30%' }} justifyContent="flex-start">
          <Typography variant="caption" paragraph mb={1} textAlign="right" color="black" fontWeight={'bold'}>
            ETD: {data.ETD !== null ? moment(data.ETD).format('DD MMM YYYY') : 'Unset'}
          </Typography>

        </Stack>
      </Stack>
    );
  };

  const ANDROID_KEYBOARD = Capacitor.getPlatform() === 'android' ? 16 : 0;
  const IOS_KEYBOARD = Capacitor.getPlatform() === 'ios' ? 16 : 0;

  return (
    <Page title={translate('shipment_recall')}>
      <Container maxWidth={themeStretch ? false : 'lg'} sx={{ p: 1, pt: 0, position: mdUp ? 'relative' : 'fixed' }}>
        <HeaderBreadcrumbs
          heading={translate('shipment_recall')}
          links={[{ name: translate('home'), href: PATH_APP.general.app }, { name: translate('shipment_recall') }]}
        />
        <Card id="shipment-recal-card" sx={{
          minHeight: '70vh',
          height: {
            xs: `calc(100vh - ${HEADER.MOBILE_HEIGHT + BREAKCRUM_HEIGHT + SPACING + ANDROID_KEYBOARD + IOS_KEYBOARD + NOTCH_HEIGHT}px)`,
            sm: `calc(100vh - ${HEADER.MOBILE_HEIGHT + BREAKCRUM_HEIGHT + SPACING + ANDROID_KEYBOARD + IOS_KEYBOARD + NOTCH_HEIGHT}px)`,
            lg: `calc(100vh - ${HEADER.DASHBOARD_DESKTOP_HEIGHT + BREAKCRUM_HEIGHT + SPACING + ANDROID_KEYBOARD + IOS_KEYBOARD + NOTCH_HEIGHT}px)`,
          },
        }}>
          {dataSource.data && dataSource.data.length > 0 ? (
            <Box >
              <List
                dataSource={dataSource.data}
                itemRender={itemTemplate}
                searchExpr={['CustomerName', 'SysNo', 'InvoiceNo', 'ARInvoiceNo']}
                searchEnabled
                {...theme.breakpoints.only('lg') && { height: `calc(100vh - ${HEADER.DASHBOARD_DESKTOP_HEIGHT + BREAKCRUM_HEIGHT + SPACING + ANDROID_KEYBOARD + TAB_HEIGHT + IOS_KEYBOARD + NOTCH_HEIGHT}px)` }}
                {...theme.breakpoints.only('md') && { height: `calc(100vh - ${HEADER.MOBILE_HEIGHT + BREAKCRUM_HEIGHT + SPACING + ANDROID_KEYBOARD + TAB_HEIGHT + TAB_HEIGHT + IOS_KEYBOARD + NOTCH_HEIGHT}px)` }}
                {...theme.breakpoints.only('xs') && { height: `calc(100vh - ${HEADER.MOBILE_HEIGHT + BREAKCRUM_HEIGHT + SPACING + ANDROID_KEYBOARD + TAB_HEIGHT + TAB_HEIGHT + IOS_KEYBOARD + NOTCH_HEIGHT}px)` }}
                scrollingEnabled
                searchMode={'contains'}
                noDataText={`${translate('noDataText')}, accept search fields: 'CustomerName',
                     'SysNo', 'InvoiceNo', 'ARInvoiceNo' `}
                focusStateEnabled={false}
                collapsibleGroups
                onItemClick={(e) => handleOpenModal(e)}
              >
                <SearchEditorOptions
                  placeholder={`${translate('search')}  Customer Name, Sys No, Invoice No, ARInvoice No`}
                  showClearButton
                />
              </List>
              {/* <Box width={'100%'} mt={2} display="flex" justifyContent="flex-end" alignItems={'center'}>
                <Typography
                  variant="subtext1"
                  width={'100%'}
                  textAlign={'right'}
                  fontWeight={'bold'}
                  color="primary.dark"
                >
                  Total: {dataSource.totalCount || 0}
                </Typography>
              </Box> */}
            </Box>
          ) : null}
          {dataSource.data && dataSource.data.length === 0 && !loading ? (
            <NoItemsBanner title="No pending approval request to recall" />
          ) : null}
        </Card>

        {loading && (
          <LoadPanel hideOnOutsideClick message="Please, wait..." visible={loading} onHidden={() => setLoading(false)}
            showPane={false}
          // position='center'
          >
            <Position my="center" at="center" of="#shipment-recal-card" />
          </LoadPanel>
        )}
        {/* // Recalll modal */}
        {recallModal.visible ? (
          <RecallDialog
            recallModal={recallModal}
            setRecallModal={setRecallModal}
            LoginUser={LoginUser}
            enqueueSnackbar={enqueueSnackbar}
            handleSetDataSource={handleSetDataSource}
            dataSource={dataSource}
            setDataSource={setDataSource}
          />
        ) : null}
      </Container>
    </Page>
  );
}

const RecallDialog = ({
  recallModal,
  setRecallModal,
  LoginUser,
  enqueueSnackbar,
  handleSetDataSource,
  // dataSource,
  // setDataSource,
}) => {
  RecallDialog.propTypes = {
    recallModal: PropTypes.object,
    setRecallModal: PropTypes.func,
    LoginUser: PropTypes.object,
    enqueueSnackbar: PropTypes.func,
    handleSetDataSource: PropTypes.func,
    // dataSource: PropTypes.object,
    // setDataSource: PropTypes.func,
  };
  // console.log(source);

  const handleClose = () => {
    setRecallModal({
      ...recallModal,
      visible: false,
      itemData: null,
    });
  };

  const [loading, setLoading] = useState(false);

  const handleRecall = async () => {
    setLoading(true);
    await axios
      .get(`/api/ShipmentStatementReviewApi/GetStatementRelatedDocGuid/${recallModal.itemData.Id}`)
      .then(async (res) => {
        // console.log(res);
        if (res.data) {
          const recallData = {
            ActionId: recallModal.itemData.WFStatusActionId,
            LoginUserId: LoginUser.UserId,
            SSReportParams: res.data,
          };
          // console.log(recallData);
          await axios
            .post(`/api/WorkflowApi/ExecuteActionShipmentStatement`, recallData)
            .then((result) => {
              setLoading(false);
              // console.log(result);
              enqueueSnackbar('Recall sucessfully', {
                variant: 'success',
                anchorOrigin: {
                  vertical: 'top',
                  horizontal: 'center',
                },
              });
              handleSetDataSource();
              setRecallModal({
                ...recallData,
                visible: false,
                itemData: null,
              });
            })
            .catch((err) => {
              setLoading(false);
              console.error(err);
              enqueueSnackbar(JSON.stringify(err), {
                variant: 'error',
                anchorOrigin: {
                  vertical: 'top',
                  horizontal: 'center',
                },
              });
            });
        }
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
        enqueueSnackbar(JSON.stringify(err), {
          variant: 'error',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'center',
          },
        });
      });
  };

  return (
    <Dialog open={recallModal.visible} onClose={handleClose} aria-labelledby="responsive-dialog-title">
      <DialogTitle id="responsive-dialog-title">{'Recall shipment approval?'}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {`Are you sure that you want to recall the request for SysNo: ${recallModal.itemData.SysNo} ?`}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={() => handleRecall()} disabled={loading} autoFocus color="error">
          {loading ? 'Recalling' : 'Recall now'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
