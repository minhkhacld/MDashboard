import { Capacitor } from '@capacitor/core';
import { LoadPanel, Position } from 'devextreme-react/load-panel';
import _ from 'lodash';
import moment from 'moment';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
// notistack
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
  Divider,
  Stack,
  Tab,
  Tabs,
  Typography,
  useTheme,
} from '@mui/material';
// devextreme
import { List, SearchEditorOptions } from 'devextreme-react/list';
import fx from 'devextreme/animation/fx';
// Redux
import Page from '../../components/Page';
import { useSelector } from '../../redux/store';
// routes
import { PATH_APP } from '../../routes/paths';
// hooks
import useFormatNumber from '../../hooks/useFormatNumber';
import useLocales from '../../hooks/useLocales';
import useResponsive from '../../hooks/useResponsive';
import useSettings from '../../hooks/useSettings';
// components
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import Label from '../../components/Label';
import NoItemsBanner from '../../components/NoItemsBanner';
import axios from '../../utils/axios';

// ENtityList
import { HEADER, LEGALS, NOTCH_HEIGHT } from '../../config';

// ----------------------------------------------------------------------
const PAGE_TAB_KEY = 'APPROVAL_PENDING';

const BREAKCRUM_HEIGHT = 40;
const SPACING = 32;
const TAB_HEIGHT = 48;


export default function ApproveRecall() {
  // Hooks
  const { fShortenNumber } = useFormatNumber();
  const { translate } = useLocales();
  const { themeStretch } = useSettings();
  const mdUp = useResponsive('up', 'md');
  const smUp = useResponsive('up', 'sm');
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
  const [tabValue, setTabValue] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  // Devextreme store;
  const getLegal = () => {
    setLoading(true);
    return axios.get('/api/FRApprovalAllApi/Get', {
      params: {
        filter: JSON.stringify([
          ['SubmitterEmplId', '=', LoginUser?.EmpId],
          'and',
          ['CurrentEmplId', '=', LoginUser?.EmpId],
          'and',
          ['WaitingFor', '<>', LoginUser?.EmpKnowAs],
        ]),
        requireTotalCount: true,
        // pageSize: 5,
        group: JSON.stringify([{ selector: 'Legal', desc: false, isExpanded: true }]),
      },
    });
  };

  const handleSetDataSource = () => {
    getLegal()
      .then((response) => {
        // console.log(response);
        const arrayData = response.data?.data.filter((d) => d.key !== null);
        const groupItem = arrayData.map((d) => {
          const newItems = _.chain(d.items)
            .groupBy((item) => item.Type)
            .map((items, key) => ({ items, key }))
            .value();
          return {
            ...d,
            items: newItems,
          };
        });
        setDataSource(groupItem);
        setTabValue(arrayData[0]?.key);
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

  const handleChangeTab = (e, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenModal = (row) => {
    setRecallModal({
      visible: true,
      itemData: row.itemData,
      itemIndex: row.itemIndex.item,
    });
  };

  // RENDER LIST
  const itemTemplate = (data) => {
    // console.log(data);
    return (
      <Stack direction="row" justifyContent="space-between" pl={smUp ? 1 : 0}>
        <Stack direction="column" justifyContent="flex-start">
          <Typography variant="caption" paragraph color="black" fontWeight={'bold'} mb={0}>
            {data?.SysNo}
          </Typography>
          <Typography variant="caption" paragraph mb={0}>
            {`${data?.Department}`}
          </Typography>
          <Typography variant="caption" paragraph mb={0}>
            {`${data?.BPDivision}`}
          </Typography>
          <Typography variant="caption" paragraph mb={0}>
            Requested by: {`${data?.Requested}`}
          </Typography>
        </Stack>
        <Stack direction="column" sx={{ width: mdUp ? 200 : 100 }} justifyContent="flex-end" alignItems={'flex-end'}>
          <Typography variant="caption" paragraph mb={0} textAlign="right" color="black" fontWeight={'bold'}>
            ID:{data.Id}
          </Typography>
          <Typography variant="caption" paragraph mb={0} textAlign="right">
            {`${data?.Currency} ${data?.TotalAmount}`}
          </Typography>
          <Typography variant="caption" paragraph mb={0} textAlign="right">
            {data.DueDate !== null ? moment(data.DueDate).format('DD MMM YYYY') : ''}
          </Typography>
          <Typography variant="caption" paragraph mb={0} textAlign="right">
            {data.ReferenceNo}
          </Typography>
        </Stack>
      </Stack>
    );
  };

  const generateTabs = () => {
    if (dataSource.length > 0) {
      const tabs =
        dataSource
          .map((legal, index) => ({
            ...legal,
            label: legal?.key === null ? `Others` : legal?.key,
            count: legal?.items.map((d) => d?.items).flatMap((r) => r).length || 0,
          }))
          .sort((a, b) => -b?.label.localeCompare(a?.label)) || [];
      return tabs;
    }
    return [];
  };

  const TABS = generateTabs();
  const ANDROID_KEYBOARD = Capacitor.getPlatform() === 'android' ? 16 : 0;
  const IOS_KEYBOARD = Capacitor.getPlatform() === 'ios' ? 16 : 0;

  return (
    <Page title={translate('accounting_recall')}>
      <Container maxWidth={themeStretch ? false : 'lg'} sx={{ p: 1, pt: 0, position: mdUp ? 'relative' : 'fixed' }}>
        <HeaderBreadcrumbs
          heading={translate('accounting_recall')}
          links={[{ name: translate('home'), href: PATH_APP.general.app }, { name: translate('accounting_recall') }]}
        />

        <Card sx={{
          minHeight: '70vh',
          height: {
            xs: `calc(100vh - ${HEADER.MOBILE_HEIGHT + BREAKCRUM_HEIGHT + SPACING + ANDROID_KEYBOARD + IOS_KEYBOARD + NOTCH_HEIGHT}px)`,
            sm: `calc(100vh - ${HEADER.MOBILE_HEIGHT + BREAKCRUM_HEIGHT + SPACING + ANDROID_KEYBOARD + IOS_KEYBOARD + NOTCH_HEIGHT}px)`,
            lg: `calc(100vh - ${HEADER.DASHBOARD_DESKTOP_HEIGHT + BREAKCRUM_HEIGHT + SPACING + ANDROID_KEYBOARD + IOS_KEYBOARD + NOTCH_HEIGHT}px)`,
          },
        }} id="aprroval-recall-card">
          <Tabs
            allowScrollButtonsMobile
            variant="scrollable"
            scrollButtons="auto"
            id="tab-panel"
            value={tabValue}
            onChange={(e, newValue) => handleChangeTab(e, newValue)}
            sx={{
              px: { xs: 1, md: 2 }
              , bgcolor: 'background.neutral'
            }}
          >
            {TABS.length > 0 &&
              TABS.map((tab, index) => {
                return (
                  <Tab
                    // disableRipple
                    key={tab.label}
                    value={tab.label}
                    icon={<Label color={LEGALS[index]?.color}>{tab?.count}</Label>}
                    label={
                      <Typography variant="body1" fontSize={smUp ? 14 : 12} fontWeight={'bold'} noWrap>
                        {tab.label === null ? 'Others' : tab?.label}
                      </Typography>
                    }
                    style={{
                      minWidth: 100,
                    }}
                    sx={{
                      maxWidth: {
                        xs: '90%',
                        md: 320
                      }
                    }}
                  />
                );
              })}
          </Tabs>
          <Divider />
          <Box sx={{ p: 1 }}>
            {TABS.length > 0 &&
              TABS.map((tab, index) => (
                <div
                  key={`${tab.label}-${index}`}
                  role="tabpanel"
                  hidden={tabValue !== tab.label}
                  id={`simple-tabpanel-${tabValue}-${index}`}
                  aria-labelledby={`simple-tab-${tabValue}-${index}`}
                >
                  {/* {tabValue === tab.label ? ( */}
                  <List
                    dataSource={tab.items}
                    itemRender={itemTemplate}
                    searchExpr={['Type', 'SysNo', 'Id', 'Requested']}
                    grouped
                    searchEnabled
                    {...theme.breakpoints.only('lg') && { height: `calc(100vh - ${HEADER.DASHBOARD_DESKTOP_HEIGHT + BREAKCRUM_HEIGHT + SPACING + ANDROID_KEYBOARD + TAB_HEIGHT}px)` }}
                    {...theme.breakpoints.only('md') && { height: `calc(100vh - ${HEADER.MOBILE_HEIGHT + BREAKCRUM_HEIGHT + SPACING + ANDROID_KEYBOARD + TAB_HEIGHT + TAB_HEIGHT}px)` }}
                    {...theme.breakpoints.only('xs') && { height: `calc(100vh - ${HEADER.MOBILE_HEIGHT + BREAKCRUM_HEIGHT + SPACING + ANDROID_KEYBOARD + TAB_HEIGHT + TAB_HEIGHT}px)` }}
                    // id="list-planing"
                    scrollingEnabled
                    searchMode={'contains'}
                    noDataText={`${translate('noDataText')}`}
                    focusStateEnabled={false}
                    collapsibleGroups
                    pageLoadMode="scrollBottom"
                    groupRender={GroupRender}
                    itemDeleteMode="toggle"
                    onInitialized={(e) => {
                      fx.off = true;
                    }}
                    onContentReady={(e) => {
                      setTimeout(() => {
                        fx.off = false;
                      }, 2000);
                    }}
                    onGroupRendered={(e) => {
                      if (dataSource.length > 1 && !isSearching && recallModal.itemIndex?.group !== e.groupIndex) {
                        e.component.collapseGroup(e.groupIndex);
                      }
                    }}
                    onItemClick={(e) => handleOpenModal(e)}
                  >
                    <SearchEditorOptions
                      placeholder={`${translate('search')}  Type, SysNo, Id`}
                      showClearButton
                      onFocusIn={(e) => setIsSearching(true)}
                      onFocusOut={(e) => setIsSearching(false)}
                    />
                  </List>
                  {/* ) : null} */}
                </div>
              ))}
          </Box>

          {dataSource.length === 0 && !loading ? <NoItemsBanner title="No pending request for recalling" /> : null}
        </Card>

        {loading && (
          <LoadPanel hideOnOutsideClick message="Please, wait..." visible={loading} onHidden={() => setLoading(false)}
            showPane={false}
          // position='center'
          >
            <Position my="center" at="center" of="#aprroval-recall-card" />
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
          />
        ) : null}
      </Container>
    </Page>
  );
}

const GroupRender = (data) => {
  return (
    <Box>
      <Typography
        variant="subtext2"
        sx={{
          // color: PAYMENT_KEY[PAYMENT_KEY.findIndex((d) => d.label === data.key)].color || colors.red[500],
          color: (theme) => theme.palette.info.main,
        }}
      >
        {/* {`${capitalCase(data?.key)} (${data.items.length})`} */}
        {`${data?.key} (${data.items.length})`}
      </Typography>
    </Box>
  );
};

const RecallDialog = ({ recallModal, setRecallModal, LoginUser, enqueueSnackbar, handleSetDataSource }) => {
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
      .get(`/api/FRApprovalApi/GetPaymentRelatedDocGuid/${recallModal.itemData.Id}`)
      .then(async (res) => {
        // console.log(res);
        if (res.data) {
          const recallData = {
            ActionId: recallModal.itemData.WFStatusActionId,
            LoginUserId: LoginUser.UserId,
            FRReportParams: res.data,
          };
          // console.log(recallData);
          await axios
            .post(`/api/WorkflowApi/ExecuteActionFinanceRequests`, recallData)
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
      <DialogTitle id="responsive-dialog-title">{'Recall payment approval?'}</DialogTitle>
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
