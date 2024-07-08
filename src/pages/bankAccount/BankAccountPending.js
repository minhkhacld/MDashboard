import { Capacitor } from '@capacitor/core';
import { LoadPanel, Position } from 'devextreme-react/load-panel';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
// notistack
// @mui
import { Box, Card, Container, Divider, Grid, Stack, Typography, useTheme } from '@mui/material';
// devextreme
import { List, SearchEditorOptions } from 'devextreme-react/list';
import fx from 'devextreme/animation/fx';
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
// const PAGE_TAB_KEY = 'APPROVAL_PENDING';

const BREAKCRUM_HEIGHT = 40;
const SPACING = 32;
const TAB_HEIGHT = 48;


export default function BankAccountPending() {
  // Hooks
  const { translate } = useLocales();
  const { themeStretch } = useSettings();
  const smUp = useResponsive('up', 'sm');
  const mdUp = useResponsive('up', 'md');
  const lgUp = useResponsive('up', 'lg');
  const theme = useTheme()
  // redux
  const { LoginUser } = useSelector((store) => store.workflow);

  // components state
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);

  // Devextreme store;

  const getDataSource = () =>
    axios.get('/api/BankAccountApi/Get', {
      params: {
        filter: JSON.stringify([
          [['WaitingFor', '=', LoginUser?.EmpKnowAs], 'and', ['Status', '<>', 'Done']],
          'and',
          ['Status', '=', 'Pending'],
        ]),
        requireTotalCount: true,
        paginate: true,
        pageSize: 20,
        // sort: JSON.stringify([{ selector: 'Type', desc: false }]),
      },
    });

  useEffect(() => {
    setLoading(true);
    getDataSource()
      .then((result) => {
        setDataSource(result.data);
        // console.log(result.data);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const listPlanning = document.getElementById('list-planing');
    const breacrumb = document.getElementById('header-breacrumb');
    if (listPlanning !== null && listPlanning !== undefined) {
      listPlanning.style.height = `${window.screen.height - (lgUp ? 280 : HEADER.MOBILE_HEIGHT) - breacrumb.getBoundingClientRect().height - 80
        }px`;
    }
  }, [dataSource]);

  // console.log(source)
  // RENDER LIST
  const itemTemplate = (data) => (
    <Link to={PATH_APP.bank_account.pending.report(data?.Id)} state={{ Guid: data.Guid }}>
      <Stack direction="row" justifyContent="space-between">
        <Grid container spacing={1}>
          <Grid item xs={12} md={12}>
            <Typography variant="caption" paragraph color="black" fontWeight={'bold'} mb={0}>
              {data?.SysNo}
            </Typography>
          </Grid>
          <Grid item xs={4} md={2}>
            <Typography variant="caption" paragraph mb={0}>
              Benificiary Name:
            </Typography>
          </Grid>
          <Grid item xs={8} md={10}>
            <Typography
              variant="caption"
              paragraph
              mb={0}
              sx={{ wordBreak: 'break-word' }}
              whiteSpace={'normal'}
            >{` ${data?.OwnerName}`}</Typography>
          </Grid>
          <Grid item xs={4} md={2}>
            <Typography variant="caption" paragraph mb={0}>
              Suggested by:
            </Typography>
          </Grid>
          <Grid item xs={8} md={10}>
            <Typography variant="caption" paragraph mb={0}>
              {` ${data?.SubmitterKnowAs}`}
            </Typography>
          </Grid>
        </Grid>
      </Stack>
    </Link>
  );


  const ANDROID_KEYBOARD = Capacitor.getPlatform() === 'android' ? 16 : 0;
  const IOS_KEYBOARD = Capacitor.getPlatform() === 'ios' ? 16 : 0;

  return (
    <Page title={translate('bankAccount_approval')}>
      <Container maxWidth={themeStretch ? false : 'lg'} sx={{ position: mdUp ? 'relative' : 'fixed' }}>
        <HeaderBreadcrumbs
          heading={translate('bankAccount_approval')}
          links={[{ name: translate('home'), href: PATH_APP.general.app }, { name: translate('bankAccount_approval') }]}
        />

        <Card sx={{
          minHeight: '70vh',
          height: {
            xs: `calc(100vh - ${HEADER.MOBILE_HEIGHT + BREAKCRUM_HEIGHT + SPACING + ANDROID_KEYBOARD + IOS_KEYBOARD + NOTCH_HEIGHT}px)`,
            sm: `calc(100vh - ${HEADER.MOBILE_HEIGHT + BREAKCRUM_HEIGHT + SPACING + ANDROID_KEYBOARD + IOS_KEYBOARD + NOTCH_HEIGHT}px)`,
            lg: `calc(100vh - ${HEADER.DASHBOARD_DESKTOP_HEIGHT + BREAKCRUM_HEIGHT + SPACING + ANDROID_KEYBOARD + IOS_KEYBOARD + NOTCH_HEIGHT}px)`,
          },
        }} id="aprroval-card">
          <Divider />
          {dataSource.data && dataSource.data.length > 0 ? (
            <Box sx={{ p: 1 }}>
              <List
                dataSource={dataSource.data}
                itemRender={itemTemplate}
                searchExpr={['OwnerName', 'SysNo', 'WaitingFor']}
                // height={smUp ? '62vh' : '68vh'}
                // id="list-planing"
                {...theme.breakpoints.only('lg') && { height: `calc(100vh - ${HEADER.DASHBOARD_DESKTOP_HEIGHT + BREAKCRUM_HEIGHT + SPACING + ANDROID_KEYBOARD + TAB_HEIGHT + IOS_KEYBOARD + NOTCH_HEIGHT}px)` }}
                {...theme.breakpoints.only('md') && { height: `calc(100vh - ${HEADER.MOBILE_HEIGHT + BREAKCRUM_HEIGHT + SPACING + ANDROID_KEYBOARD + TAB_HEIGHT + TAB_HEIGHT + IOS_KEYBOARD + NOTCH_HEIGHT}px)` }}
                {...theme.breakpoints.only('xs') && { height: `calc(100vh - ${HEADER.MOBILE_HEIGHT + BREAKCRUM_HEIGHT + SPACING + ANDROID_KEYBOARD + TAB_HEIGHT + TAB_HEIGHT + IOS_KEYBOARD + NOTCH_HEIGHT}px)` }}
                searchEnabled
                scrollingEnabled
                searchMode={'contains'}
                noDataText={translate('noDataText')}
                focusStateEnabled={false}
                collapsibleGroups
                onInitialized={(e) => {
                  fx.off = true;
                }}
                onContentReady={(e) => {
                  setTimeout(() => {
                    fx.off = false;
                  }, 2000);
                }}
              // visible={currentTab === LEGAL.MOTIVE_HK && source.currentLegal === LEGAL.MOTIVE_HK}
              >
                <SearchEditorOptions
                  placeholder={`${translate('search')} Sys No, Benificiary Name, Suggester `}
                  showClearButton
                />
              </List>
              <Box width={'100%'} mt={2} display="flex" justifyContent="flex-end" alignItems={'center'}>
                <Typography
                  variant="subtext1"
                  width={'100%'}
                  textAlign={'right'}
                  fontWeight={'bold'}
                  color="primary.dark"
                >
                  Total: {dataSource.totalCount || 0}
                </Typography>
              </Box>
            </Box>
          ) : null}

          {dataSource.data && dataSource.data.length === 0 && !loading ? (
            <NoItemsBanner title="No pending approval" />
          ) : null}
        </Card>

        {loading && (
          <LoadPanel hideOnOutsideClick message="Please, wait..." visible={loading} onHidden={() => setLoading(false)}
            showPane={false}
          // position='center'
          >
            <Position my="center" at="center" of="#aprroval-card" />
          </LoadPanel>
        )}
      </Container>
    </Page>
  );
}
