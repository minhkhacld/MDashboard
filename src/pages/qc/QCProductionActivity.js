import { Capacitor } from '@capacitor/core';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// @mui
import { Card, Container, Divider, Tab, Tabs, Typography } from '@mui/material';
// devextreme
// Redux
import Page from '../../components/Page';
import { dispatch, useSelector } from '../../redux/store';
// routes
import { PATH_APP } from '../../routes/paths';
// hooks
import useAccessToken from '../../hooks/useAccessToken';
import useIsOnline from '../../hooks/useIsOnline';
import useLocales from '../../hooks/useLocales';
import useResponsive from '../../hooks/useResponsive';
import useSettings from '../../hooks/useSettings';
// components
import TabPanel from '../../components/tab/TabPanel';
import FinishedList from '../../sections/qc/production_activity/FinishedList';
import OnGoingList from '../../sections/qc/production_activity/OnGoingList';
import ProductivityAllList from '../../sections/qc/production_activity/ProductivityAllList';

// CONFIG
import Iconify from '../../components/Iconify';
import { HEADER, NOTCH_HEIGHT } from '../../config';
import { setTabListStatus } from '../../redux/slices/productionActivity';


// ----------------------------------------------------------------------
const SPACING = 24;


export default function QCProductionActivity() {

  // Hooks
  const { translate } = useLocales();
  const { themeStretch } = useSettings();
  const mdUp = useResponsive('up', 'md');
  const smUp = useResponsive('up', 'sm');
  const { online } = useIsOnline();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const platform = Capacitor.getPlatform();

  // redux
  const accessToken = useAccessToken();
  const { tabListStatus } = useSelector(store => store.productionActivity);

  // states
  const [currentTab, setCurrentTab] = useState('1')

  useEffect(() => {
    if (tabListStatus.selectedTabName !== null) {
      handleChangeTab(null, tabListStatus.selectedTabName)
    }
  }, []);

  const handleChangeTab = (e, newValue) => {
    setCurrentTab(newValue);
    dispatch(setTabListStatus({
      selectedTabName: newValue,
      searchValue: {
        onGoing: null,
        finished: null,
        all: null,
      }
    }))
  };

  const adaptiveBreacrumbs = online
    ? [{ name: translate('home'), href: PATH_APP.general.app }, { name: translate('qcs.inspList.pageTitle') }]
    : [{ name: translate('qcs.inspList.pageTitle'), href: PATH_APP.qc.inspection.root }];


  function renderTab() {
    if (online) {
      return [
        {
          label: 'OnGoing',
          value: '1',
          count: 1,
          color: 'info',
          icon: 'grommet-icons:in-progress',
        },
        {
          label: 'Finished',
          value: '2',
          count: 2,
          color: 'error',
          icon: 'ic:baseline-done',
        },
        {
          label: 'All',
          value: '3',
          count: 2,
          color: 'error',
          icon: 'ic:round-clear-all',
        },
      ];
    }
    return [{ label: 'Todo', value: '1', count: 3, color: 'info' }];
  };

  const TABS = renderTab();

  const cardHeight = {
    xs: `calc(100vh - ${HEADER.MOBILE_HEIGHT + NOTCH_HEIGHT}px)`,
    sm: `calc(100vh - ${HEADER.MOBILE_HEIGHT + NOTCH_HEIGHT}px)`,
    md: `calc(100vh - ${HEADER.MOBILE_HEIGHT + NOTCH_HEIGHT}px)`,
    lg: `calc(100vh - ${HEADER.DASHBOARD_DESKTOP_HEIGHT + HEADER.DASHBOARD_DESKTOP_OFFSET_HEIGHT + 22 + NOTCH_HEIGHT}px)`,
  };

  // console.log(tabListStatus);

  return (
    <Page title={"QC - Production Activity"}>
      <Container maxWidth={themeStretch ? false : 'lg'}
        sx={{
          paddingLeft: 1,
          paddingRight: 1,
          position: mdUp ? 'relative' : 'fixed',
        }}
        id="qc_ins_page_container"
      >
        <Card
          id="inspection-list"
          sx={{
            minHeight: '65vh',
            height: cardHeight,
          }}
        >

          <Tabs
            allowScrollButtonsMobile
            variant="scrollable"
            scrollButtons="auto"
            id="tab-panel"
            value={currentTab}
            onChange={(e, newValue) => handleChangeTab(e, newValue)}
            sx={{
              px: 2,
              bgcolor: 'background.neutral',
            }}
          >
            {TABS.map((tab, index) => (
              <Tab
                key={tab.value}
                value={tab.value}
                label={
                  <Typography variant="body1" fontSize={smUp ? 14 : 12} fontWeight={'bold'}
                    color={currentTab !== tab.value ? 'black' : 'primary.main'}
                  >
                    {tab.label}
                  </Typography>
                }
                icon={<Iconify icon={tab.icon} sx={{ color: currentTab !== tab.value ? 'black' : 'primary.main' }} />}
                sx={{
                  minWidth: {
                    xs: 50,
                    md: 60,
                  },
                  maxWidth: {
                    xs: '90%',
                    md: 320
                  },
                }}
              />
            ))}
          </Tabs>

          <Divider />

          <TabPanel value={'1'} currentTab={currentTab}>
            <OnGoingList />
          </TabPanel>

          <TabPanel value={'2'} currentTab={currentTab}>
            <FinishedList />
          </TabPanel>

          <TabPanel value={'3'} currentTab={currentTab}>
            <ProductivityAllList />
          </TabPanel>

        </Card>

      </Container>
    </Page>
  );
}
