import { Capacitor } from '@capacitor/core';
import { LoadPanel, Position } from 'devextreme-react/load-panel';
import moment from 'moment';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
// @mui
import { Box, Card, Container, Stack, Typography, useTheme } from '@mui/material';
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
import { HEADER } from '../../config';
import axios from '../../utils/axios';


// ENtityList

// ----------------------------------------------------------------------

export default function ShipmentPendingList() {
  // Hooks
  const { translate } = useLocales();
  const { themeStretch } = useSettings();
  const smUp = useResponsive('up', 'sm');
  const mdUp = useResponsive('up', 'md');
  const lgUp = useResponsive('up', 'lg');
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  // redux
  const { LoginUser } = useSelector((store) => store.workflow);

  // components state
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);

  // Devextreme store;

  const getDataSource = () => {
    setLoading(true);
    return axios.get('/api/ShipmentStatementReviewPendingApi/Get', {
      params: {
        filter: JSON.stringify([['WaitingForId', '=', LoginUser?.EmpId], 'and', ['WFStep', '<>', 'Finance Dep.']]),
        requireTotalCount: true,
        paginate: true,
        pageSize: 20,
        sort: JSON.stringify([{ selector: 'ETD', desc: false }]),
      },
    });
  };

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    const checkNotch = () => {
      const iPhone = /iPhone/.test(navigator.userAgent) && !window.MSStream
      const aspect = window.screen.width / window.screen.height
      if (iPhone && aspect.toFixed(3) === "0.462") {
        // I'm an iPhone X or 11...
        return 55
      }
      return 0
    }
    const NOTCH_HEIGHT = checkNotch()
    const listPlanning = document.getElementById('list-planing');
    const breacrumb = document.getElementById('header-breacrumb');
    if (listPlanning !== null && listPlanning !== undefined) {
      listPlanning.style.height = `${window.screen.height - (lgUp ? 280 : HEADER.MOBILE_HEIGHT) - breacrumb.getBoundingClientRect().height - 70 - NOTCH_HEIGHT - 16
        }px`;
    }
  }, [dataSource]);

  // console.log(source)
  // RENDER LIST
  const itemTemplate = (data) => {
    // console.log(data);
    return (
      <Link to={PATH_APP.shipment.pending.report(data.Id)} state={{ Guid: data.Guid }}
        // pl={smUp ? 1 : 0}
        p={1}
      >
        <Stack direction="row" justifyContent="space-between">
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
      </Link>
    );
  };

  const BREAKCRUM_HEIGHT = 40;
  const SPACING = 40;
  const ANDROID_KEYBOARD = Capacitor.getPlatform() === 'android' ? 16 : 0;
  const TAB_HEIGHT = 0;
  const IOS_KEYBOARD = Capacitor.getPlatform() === 'ios' ? 16 : 0;
  const checkNotch = () => {
    const iPhone = /iPhone/.test(navigator.userAgent) && !window.MSStream
    const aspect = window.screen.width / window.screen.height
    if (iPhone && aspect.toFixed(3) === "0.462") {
      // I'm an iPhone X or 11...
      return 55
    }
    return 0
  };
  const NOTCH_HEIGHT = checkNotch();

  return (
    <Page title={translate('shipment_approval')}>
      <Container maxWidth={themeStretch ? false : 'lg'} sx={{ p: 1, pt: 0, position: mdUp ? 'relative' : 'fixed' }}>
        <HeaderBreadcrumbs
          heading={translate('shipment_approval')}
          links={[{ name: translate('home'), href: PATH_APP.general.app }, { name: translate('shipment_approval') }]}
        />
        <Card id="shipment-pending-card" sx={{
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
                {...theme.breakpoints.only('lg') && { height: `calc(100vh - ${HEADER.DASHBOARD_DESKTOP_HEIGHT + BREAKCRUM_HEIGHT + SPACING + ANDROID_KEYBOARD + TAB_HEIGHT + IOS_KEYBOARD + NOTCH_HEIGHT}px)` }}
                {...theme.breakpoints.only('md') && { height: `calc(100vh - ${HEADER.MOBILE_HEIGHT + BREAKCRUM_HEIGHT + SPACING + ANDROID_KEYBOARD + TAB_HEIGHT + TAB_HEIGHT + IOS_KEYBOARD + NOTCH_HEIGHT}px)` }}
                {...theme.breakpoints.only('xs') && { height: `calc(100vh - ${HEADER.MOBILE_HEIGHT + BREAKCRUM_HEIGHT + SPACING + ANDROID_KEYBOARD + TAB_HEIGHT + TAB_HEIGHT + IOS_KEYBOARD + NOTCH_HEIGHT}px)` }}
                searchEnabled
                scrollingEnabled
                searchMode={'contains'}
                noDataText={translate('noDataText')}
                focusStateEnabled={false}
                collapsibleGroups
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
            <NoItemsBanner title="No pending approval" />
          ) : null}
        </Card>

        {loading && (
          <LoadPanel hideOnOutsideClick message="Please, wait..." visible={loading} onHidden={() => setLoading(false)}
            // position='center'
            showPane={false}
          >
            <Position my="center" at="center" of="#shipment-pending-card" />
          </LoadPanel>
        )}
      </Container>
    </Page>
  );
}
