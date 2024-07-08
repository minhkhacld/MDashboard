import { Capacitor } from '@capacitor/core';
import { useState } from 'react';
// @mui
import { Box, Container, Tab, Tabs } from '@mui/material';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
// routes
import { PATH_APP } from '../../routes/paths';
// hooks
import useLocales from '../../hooks/useLocales';
import useSettings from '../../hooks/useSettings';
// _mock_
// components
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import Iconify from '../../components/Iconify';
import Page from '../../components/Page';
// sections
import { AccountGeneral, Settings } from '../../sections/@dashboard/user/account';


// ----------------------------------------------------------------------

export default function UserAccount() {

  const { themeStretch } = useSettings();
  const { translate } = useLocales();

  const [tabValue, setTabValue] = useState(0)
  const isWebApp = Capacitor.getPlatform() === 'web'
  // const isWebApp = false


  const ACCOUNT_TABS = [
    {
      value: 'general',
      icon: <Iconify icon={'ic:round-account-box'} width={20} height={20} />,
      component: <AccountGeneral />,
      tab: 0,
    },
    {
      value: 'accountGroup.setting.title',
      icon: <Iconify icon={'ep:setting'} width={20} height={20} />,
      component: <Settings />,
      tab: 1,
    },
  ];

  const onChangeTabValue = (event, newValue) => {
    const tab = ACCOUNT_TABS.find(d => d.tab === newValue)
    setTabValue(tab?.tab)

  }


  return (
    <Page title="User: Account Settings">

      <Container maxWidth={themeStretch ? false : 'lg'} sx={{
        paddingLeft: 1, paddingRight: 1,
      }}>

        {
          isWebApp && <>
            <HeaderBreadcrumbs
              heading={translate('account')}
              links={[{ name: translate('home'), href: PATH_APP.general.app }, { name: translate('account') }]}
            />

            <Tabs
              allowScrollButtonsMobile
              variant="scrollable"
              scrollButtons="auto"
              value={tabValue}
              onChange={(e, newValue) => onChangeTabValue(e, newValue)}
            >
              {ACCOUNT_TABS.map((tab) => (
                <Tab disableRipple key={tab.value} label={translate(tab.value)} icon={tab.icon} value={tab.tab} />
              ))}
            </Tabs>
          </>
        }


        <Box sx={{ mb: 3 }} />

        {ACCOUNT_TABS.map((tab) => {
          const isMatched = tab.tab === tabValue;
          return isMatched && <Box key={tab.value}>{tab.component}</Box>;
        })}

        {
          !isWebApp &&
          <Box
            width={'100%'}
            position={'absolute'}
            bottom={0}
            left={0}
            right={0}
          >
            <BottomNavigation
              showLabels
              value={tabValue}
              onChange={(event, newValue) => {
                onChangeTabValue(event, newValue)
              }}
            >
              <BottomNavigationAction sx={{
                color: theme => tabValue === 0 ? theme.palette.primary.main : 'gray',
                textTransform: 'capitalize'
              }} label={translate('general')} icon={<Iconify icon={'ic:round-account-box'} width={20} height={20} />} />
              <BottomNavigationAction
                sx={{
                  color: theme => tabValue === 1 ? theme.palette.primary.main : 'gray',
                  textTransform: 'capitalize'
                }}
                label={translate('accountGroup.setting.title')} icon={<Iconify icon={'ep:setting'} width={20} height={20} />} />
            </BottomNavigation>
          </Box>
        }

      </Container>
    </Page>
  );
}
