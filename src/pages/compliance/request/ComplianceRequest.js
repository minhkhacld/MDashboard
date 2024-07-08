import { Capacitor } from '@capacitor/core';
import { capitalCase } from 'change-case';
import { LoadPanel, Position } from 'devextreme-react/load-panel';
import _ from 'lodash';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// @mui
import { Box, Button, Card, colors, Container, Divider, Stack, Typography, useTheme } from '@mui/material';
// devextreme
import { List, SearchEditorOptions } from 'devextreme-react/list';
import fx from 'devextreme/animation/fx';
// Redux
import Page from '../../../components/Page';
import { getAuditors, getEnumAuditTime } from '../../../redux/slices/compliance';
import { dispatch, useSelector } from '../../../redux/store';
// routes
import { PATH_APP } from '../../../routes/paths';
// hooks
import useLocales from '../../../hooks/useLocales';
import useResponsive from '../../../hooks/useResponsive';
import useSettings from '../../../hooks/useSettings';
// components
import FloatButton from '../../../components/button/FloatButton';
import HeaderBreadcrumbs from '../../../components/HeaderBreadcrumbs';
import Label from '../../../components/Label';
import NoItemsBanner from '../../../components/NoItemsBanner';
import axios from '../../../utils/axios';

// ENtityList
import { HEADER, NOTCH_HEIGHT, PAYMENT_KEY } from '../../../config';

// ----------------------------------------------------------------------
const BREAKCRUM_HEIGHT = 78;
const SPACING = 30;
const TAB_HEIGHT = 48;

export default function ComplianceRequest() {
  // Hooks
  const { translate } = useLocales();
  const { themeStretch } = useSettings();
  const smUp = useResponsive('up', 'sm');
  const mdUp = useResponsive('up', 'md');
  const lgUp = useResponsive('up', 'lg');
  const theme = useTheme();
  // redux
  const { LoginUser } = useSelector((store) => store.workflow);

  const navigate = useNavigate();

  // components state
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState();
  // const [isSearching, setIsSearching] = useState(false);
  const [isViewAll, setIsViewAll] = useState(false);

  // Devextreme store;
  const getDataSource = () => {
    setLoading(true);
    dispatch(getEnumAuditTime());
    dispatch(getAuditors());
    return axios.get('/api/ComplianceRequestMobileApi/GetList', {
      params: {
        sort: JSON.stringify([
          // { selector: 'Id', desc: true }, 
          { selector: 'StartAuditDate', desc: true }])
      },
    });
  };

  useEffect(() => {
    setIsViewAll(false);
    // const listPlanning = document.getElementById('list-planing');
    // const btnGroup = document.getElementById('custom-button-group');
    // const breacrumb = document.getElementById('header-breacrumb');
    // if (listPlanning !== null && listPlanning !== undefined) {
    //   listPlanning.style.height = `${
    //     window.screen.height -
    //     (lgUp ? 280 : HEADER.MOBILE_HEIGHT) -
    //     breacrumb.getBoundingClientRect().height -
    //     50 -
    //     btnGroup.getBoundingClientRect().height -
    //     ANDROID_KEYBOARD -
    //     SPACING
    //   }px`;
    // }
  }, [document.getElementById('accordion-group')?.getBoundingClientRect()?.height]);

  useEffect(() => {
    if (!isViewAll) {
      getDataSource()
        .then((result) => {
          // console.log(result.data.data);
          const openRequest = _.chain(result.data.data)
            .filter((item) => item.WFStatusName !== 'Approved' && item.CurrentEmplId === LoginUser?.EmpId)
            // .sort((a, b) => b.Id - a.Id)
            .groupBy((item) => item.WFStatusName)
            .map((items, key) => ({ items, key }))
            .value();
          setSource(openRequest);
        })
        .catch((err) => {
          console.log(err);
          setLoading(false);
        })
        .finally(() => {
          // setIsViewAll(false);
          setLoading(false);
        });
    }
    if (isViewAll) {
      getDataSource()
        .then((result) => {
          // console.log(result.data.data);
          let newData = [];
          const obj = { key: 'All', items: result.data.data };
          newData = [...newData, obj];
          setSource(newData);
        })
        .catch((err) => {
          console.log(err);
          setLoading(false);
        })
        .finally(() => {
          // setIsViewAll(true);
          setLoading(false);
        });
    }
  }, [isViewAll]);

  const handleViewAll = () => {
    setLoading(true);
    setIsViewAll(true);
  };
  const handleViewLess = () => {
    setLoading(true);
    setIsViewAll(false);
  };

  const handleItemClick = (data) => {
    // dispatch(setCurrentRequestDetail({ Id: data?.Id, WFStatusName: data?.WFStatusName, AuditTime: data?.AuditTime }));
    navigate(PATH_APP.compliance.request.detail(data?.Id));
  };

  const handleAddbuttonClick = () => {
    // dispatch(setCurrentRequestDetail({ isAddNew: true }));
    navigate(PATH_APP.compliance.request.detail('add'));
  };
  // RENDER LIST
  const itemTemplate = (data) => {
    // console.log(data);
    return (
      <>
        {data?.Id !== undefined ? (
          <Stack
            direction="row"
            justifyContent="space-between"
            pl={smUp ? 1 : 0}
            sx={{ position: 'relative', padding: 0 }}
            onClick={() => handleItemClick(data)}
          >
            <Stack direction="column" justifyContent="flex-start">
              <Typography variant="caption" paragraph color="black" fontWeight={'bold'} mb={0}>
                {data?.SysNo || 'N/A'}
              </Typography>
              <Typography variant="caption" paragraph mb={0}>
                {`${data?.CustomerName || 'N/A'}-${data?.AuditType || 'N/A'} - ${data?.SubFactoryName || data?.FactoryName || "N/A"}`}
              </Typography>
              <Typography variant="caption" paragraph mb={0}>
                Auditor: {`${data?.AuditorName || 'N/A'}`}
              </Typography>
              <Typography variant="caption" paragraph mb={0}>
                Start Audit Date: {`${data?.StartAuditDate || 'N/A'}`}
              </Typography>
            </Stack>
          </Stack>
        ) : null}
      </>
    );
  };




  const ANDROID_KEYBOARD = Capacitor.getPlatform() === 'android' ? 0 : 0;
  const IOS_KEYBOARD = Capacitor.getPlatform() === 'ios' ? 16 : 0;
  const searchExpr = useMemo(() => (['FactoryName', 'SysNo', 'CustomerName', 'AuditorName', 'AuditType', 'SubFactoryName']), [])


  return (
    <Page title={translate('compliance_request')}>
      <Container maxWidth={themeStretch ? false : 'lg'} sx={{ p: 1, pt: 0, position: mdUp ? 'relative' : 'fixed' }}>
        <HeaderBreadcrumbs
          heading={'Compliance Request'}
          links={[{ name: translate('home'), href: PATH_APP.general.app }, { name: translate('compliance_request') }]}
        />
        <FloatButton onClick={handleAddbuttonClick} />
        <Box flex={1} id="aprroval-card">
          <Card
            sx={{
              // height: 'auto',
              height: {
                xs: `calc(100vh - ${HEADER.MOBILE_HEIGHT + BREAKCRUM_HEIGHT + ANDROID_KEYBOARD + NOTCH_HEIGHT + IOS_KEYBOARD
                  }px)`,
                sm: `calc(100vh - ${HEADER.MOBILE_HEIGHT + BREAKCRUM_HEIGHT + ANDROID_KEYBOARD + NOTCH_HEIGHT + IOS_KEYBOARD
                  }px)`,
                lg: `calc(100vh - ${HEADER.DASHBOARD_DESKTOP_HEIGHT +
                  // HEADER.DASHBOARD_DESKTOP_OFFSET_HEIGHT +
                  BREAKCRUM_HEIGHT +
                  // SPACING +
                  ANDROID_KEYBOARD +
                  NOTCH_HEIGHT +
                  IOS_KEYBOARD
                  }px)`,
              },
              minHeight: '65vh',
            }}
          >
            <Divider />
            <Box sx={{ p: 2 }}>
              <Stack
                direction={'row'}
                justifyContent="flex-end"
                alignItems={'center'}
                spacing={2}
                mb={1}
                id="custom-button-group"
              >
                {!isViewAll ? (
                  <Button height={30} onClick={handleViewAll}>
                    <Typography variant="caption">{translate('button.viewAll')}</Typography>
                  </Button>
                ) : (
                  <Button height={30} onClick={handleViewLess}>
                    <Typography variant="caption">{translate('View Less')}</Typography>
                  </Button>
                )}
              </Stack>
              <List
                dataSource={source !== undefined ? source : []}
                itemRender={itemTemplate}
                searchExpr={searchExpr}
                {...(theme.breakpoints.only('lg') && {
                  height: `calc(100vh - ${HEADER.DASHBOARD_DESKTOP_HEIGHT +
                    HEADER.DASHBOARD_DESKTOP_OFFSET_HEIGHT +
                    BREAKCRUM_HEIGHT +
                    SPACING +
                    ANDROID_KEYBOARD +
                    TAB_HEIGHT
                    }px)`,
                })}
                {...(theme.breakpoints.only('md') && {
                  height: `calc(100vh - ${HEADER.MOBILE_HEIGHT + BREAKCRUM_HEIGHT + SPACING + ANDROID_KEYBOARD + TAB_HEIGHT
                    }px)`,
                })}
                {...(theme.breakpoints.only('xs') && {
                  height: `calc(100vh - ${HEADER.MOBILE_HEIGHT + BREAKCRUM_HEIGHT + SPACING + ANDROID_KEYBOARD + TAB_HEIGHT
                    }px)`,
                })}
                grouped
                searchEnabled
                // height={smUp ? '62vh' : '65vh'}
                id="list-planing"
                style={{ paddingBottom: 20 }}
                scrollingEnabled
                searchMode={'contains'}
                noDataText={translate('noDataText')}
                focusStateEnabled={false}
                // collapsibleGroups
                groupRender={GroupRender}
                onInitialized={(e) => {
                  fx.off = true;
                }}
                onContentReady={(e) => {
                  setTimeout(() => {
                    fx.off = false;
                  }, 2000);
                }}
              // onGroupRendered={(e) => {
              //   if (source?.length > 1 && e.groupIndex !== 0) {
              //     e.component.collapseGroup(e.groupIndex);
              //   }
              // }}
              >
                <SearchEditorOptions
                  placeholder={`${translate('search')}  FactoryName, SysNo, Customer, Auditor`}
                  showClearButton
                // onFocusIn={(e) => setIsSearching(true)}
                // onFocusOut={(e) => setIsSearching(false)}
                />
              </List>
            </Box>
          </Card>

          {source?.data && source?.data.length === 0 && !loading ? <NoItemsBanner title="No pending approval" /> : null}

          {loading && (
            <LoadPanel
              hideOnOutsideClick
              message="Please, wait..."
              visible={loading}
              onHidden={() => setLoading(false)}
              showPane={false}
            // position='center'
            >
              <Position my="center" at="center" of="#aprroval-card" />
            </LoadPanel>
          )}
        </Box>
      </Container>
    </Page>
  );
}

const GroupRender = (data) => {
  return (
    <Box>
      {data.items[0].Id !== undefined ? (
        <Label color={'success'}>{data.items.length}</Label>
      ) : (
        <Label color={'success'}>0</Label>
      )}
      <Typography
        variant="subtext2"
        sx={{
          color: PAYMENT_KEY[PAYMENT_KEY.findIndex((d) => d.label === 'COMPLIANCE')].color || colors.red[500],
          paddingLeft: 1,
        }}
      >
        {`${capitalCase(data?.key)} Requests`}
      </Typography>
    </Box>
  );
};