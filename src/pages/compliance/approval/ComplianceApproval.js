import { Capacitor } from '@capacitor/core';
import { capitalCase } from 'change-case';
import { LoadPanel, Position } from 'devextreme-react/load-panel';
import _ from 'lodash';
import moment from 'moment';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// @mui
import { Box, Card, colors, Container, Divider, Stack, styled, TextField, Typography, useTheme } from '@mui/material';
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
import useFormatNumber from '../../../hooks/useFormatNumber';
import useLocales from '../../../hooks/useLocales';
import useResponsive from '../../../hooks/useResponsive';
import useSettings from '../../../hooks/useSettings';
// components
import HeaderBreadcrumbs from '../../../components/HeaderBreadcrumbs';
import Iconify from '../../../components/Iconify';
import Label from '../../../components/Label';
import NoItemsBanner from '../../../components/NoItemsBanner';
import axios from '../../../utils/axios';
import IconName from '../../../utils/iconsName';
import uuidv4 from '../../../utils/uuidv4';

// ENtityList
import { HEADER, NOTCH_HEIGHT, PAYMENT_KEY } from '../../../config';
import useTabs from '../../../hooks/useTabs';

// ----------------------------------------------------------------------

const RootStyle = styled('div')(({ theme }) => ({
  zIndex: 999,
  right: 0,
  display: 'flex',
  cursor: 'pointer',
  position: 'fixed',
  alignItems: 'center',
  top: '50%',
  height: theme.spacing(5),
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  paddingTop: theme.spacing(0),
  boxShadow: theme.customShadows.z20,
  color: theme.palette.success.dark,
  backgroundColor: 'transparent',
  borderTopLeftRadius: Number(theme.shape.borderRadius) * 2,
  borderBottomLeftRadius: Number(theme.shape.borderRadius) * 2,
  transition: theme.transitions.create('opacity'),
  '&:hover': { opacity: 0.72 },
}));

const BREAKCRUM_HEIGHT = 78;
const SPACING = 30;
const TAB_HEIGHT = 48;

export default function ComplianceApproval() {
  // Hooks
  const { fShortenNumber } = useFormatNumber();
  const { translate } = useLocales();
  const { themeStretch } = useSettings();
  const mdUp = useResponsive('up', 'md');
  const smUp = useResponsive('up', 'sm');
  const lgUp = useResponsive('up', 'lg');
  const navigate = useNavigate();
  const [activeCache, setActiveCache] = useState(false);

  // redux
  const reduxData = useSelector((store) => store.compliance);
  const { LoginUser } = useSelector((store) => store.workflow);

  const theme = useTheme();
  const { onChangeTab } = useTabs('');

  // components state
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState();
  const [searchText, setSearchText] = useState('');
  const [modalContent, setModalContent] = useState({
    visible: false,
    item: null,
    isAddNew: false,
  });

  // Devextreme store;
  const getDataSource = () => {
    setLoading(true);
    dispatch(getEnumAuditTime());
    dispatch(getAuditors());
    const getComplianceRequestList = axios.get('/api/ComplianceRequestMobileApi/GetList');
    const getComplianceAuditList = axios.get('/api/ComplianceAuditMobileApi/GetList');
    return Promise.all([getComplianceRequestList, getComplianceAuditList]);
  };

  useEffect(() => {
    getDataSource()
      .then((result) => {
        // console.log(result);
        if (result) {
          // get Source for Compliance Request
          const requestList = _.chain(result[0]?.data?.data)
            .filter((item) => item.WFStatusName !== 'Approved' && item.CurrentEmplId === LoginUser?.EmpId)
            .value();
          // console.log(requestList);

          // get Source for Compliance Audit
          const auditList = _.chain(result[1]?.data?.data)
            .filter(
              (item) =>
                item.WFStatusName !== 'Approved' &&
                item.AuditingResult !== null &&
                item.CurrentEmplId === LoginUser?.EmpId
            )
            .value();

          // console.log(auditList);
          setSource([
            {
              items: _.orderBy(requestList, [(item) => {
                return moment(item.StartAuditDate)
              }], ['desc']), key: 'Compliance Request'
            },
            {
              items: _.orderBy(auditList, [(item) => {
                return moment(item.StartAuditDate)
              }], ['desc']), key: 'Compliance Audit'
            },
          ]);
        }
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleChooseItem = (data) => {
    setModalContent({ visible: true, isAddNew: false, item: data });
  };

  const handleClickItemAudit = async (data) => {
    // handleItemClick();
    const response = await axios.get(`/api/ComplianceAuditMobileApi/GetByAuditId/${data.Id}`);
    if (response.data) {
      // console.log('/api/ComplianceAuditMobileApi/GetByAuditId', response);
      const currentTodoItem = response.data[0];
      const IsFinished = currentTodoItem?.AuditingResultId !== null;
      const Sections = _.chain(currentTodoItem?.Lines)
        .groupBy((data) => data.SectionName)
        .map((Items, Section) => ({ Items, Section, IsFinished, Id: uuidv4() }))
        .value();
      currentTodoItem.Sections = Sections;
      currentTodoItem.id = response.data[0].Id;
      delete currentTodoItem.Id;
      navigate(PATH_APP.compliance.approval.detail(data.Id), {
        state: { EntityTypeName: 'Compliance Audit', Guid: data?.Guid },
      });
    }
    setActiveCache(true);
  };

  const handleClickItemRequest = (data) => {
    navigate(PATH_APP.compliance.approval.detail(data?.Id), { state: { EntityTypeName: 'Compliance Request' } });
  };

  // RENDER LIST
  const itemTemplate = (data, index) => {

    // if (data.SysNo === "CI.0124.0028") {
    //   console.log(data);
    // };

    if (data?.key === 'Compliance Request') {
      return (
        <>
          {data?.Id !== undefined ? (

            <Stack
              direction="row"
              justifyContent="space-between"
              pl={smUp ? 1 : 0}
              sx={{ position: 'relative', padding: 0 }}
              onClick={() => handleClickItemRequest(data)}
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
          ) :
            null}
        </>
      );
    }
    return (
      <>
        {data?.Id !== undefined ? (
          <Stack
            direction="row"
            justifyContent="center"
            alignItems={'center'}
            id={`list-item-row-${data?.Id}`}
            sx={{ position: 'relative', padding: 0 }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              // id={`button-list-content-${data?.Id}`}
              width="100%"
              onClick={() => handleClickItemAudit(data)}
              p={1}
            >
              <Stack direction="column" sx={{ width: '70%' }} justifyContent="flex-start">
                <Typography
                  variant="caption"
                  paragraph
                  sx={{ color: (theme) => theme.palette.error.dark }}
                  fontWeight={'bold'}
                  mb={0}
                >
                  {`${data?.SysNo || 'N/A'} - ${data?.AuditType || 'N/A'}`}
                </Typography>
                <Typography variant="caption" paragraph mb={0} sx={{ wordBreak: 'break-word' }} whiteSpace="normal">
                  {`Factory: ${data?.SubFactoryName || data?.FactoryName || 'N/A'}`}
                </Typography>
                <Typography variant="caption" paragraph mb={0}>
                  {`Customer: ${data?.CustomerName || 'N/A'}`}
                </Typography>
                <Typography variant="caption" paragraph mb={0} sx={{ wordBreak: 'break-word' }} whiteSpace="normal">
                  {`Remark: ${data?.Remark || 'N/A'}`}
                </Typography>
              </Stack>
              <Stack
                direction="column"
                justifyContent="flex-end"
                sx={{ width: '30%' }}
                alignItems={'flex-end'}
              >
                {data.AuditingResult !== null && (
                  <Label
                    variant="ghost"
                    color={
                      data.AuditingResult === 'Pass' || data.AuditingResult === 'Pass With Condition' ? 'success' : 'error'
                    }
                  >
                    {data.AuditingResult}
                  </Label>
                )}
                <Typography variant="caption" paragraph fontWeight={'bold'} mb={0} mt={1}>
                  {`Audit From: ${moment(data?.AuditDateFrom).format('DD/MM/YYYY')}`}
                </Typography>
                <Typography variant="caption" paragraph fontWeight={'bold'} mb={0} mt={1}>
                  {`Auditor: ${data?.AuditorName}`}
                </Typography>
              </Stack>
            </Stack>
          </Stack >
        ) : null
        }
      </>
    );
  };


  const ANDROID_KEYBOARD = Capacitor.getPlatform() === 'android' ? 0 : 0;
  const IOS_KEYBOARD = Capacitor.getPlatform() === 'ios' ? 16 : 0;
  const cardHeight = {
    xs: `calc(100vh - ${HEADER.MOBILE_HEIGHT + BREAKCRUM_HEIGHT + ANDROID_KEYBOARD + NOTCH_HEIGHT + IOS_KEYBOARD}px)`,
    sm: `calc(100vh - ${HEADER.MOBILE_HEIGHT + BREAKCRUM_HEIGHT + ANDROID_KEYBOARD + NOTCH_HEIGHT + IOS_KEYBOARD}px)`,
    lg: `calc(100vh - ${HEADER.DASHBOARD_DESKTOP_HEIGHT + BREAKCRUM_HEIGHT + ANDROID_KEYBOARD + NOTCH_HEIGHT + IOS_KEYBOARD}px)`,
  };
  const searchExpr = useMemo(() => (['FactoryName', 'SysNo', 'CustomerName', 'AuditorName', 'SubFactoryName']), [])

  return (
    <Page title={translate('compliance_approval')}>
      <Container maxWidth={themeStretch ? false : 'lg'} sx={{ p: 1, pt: 0, position: mdUp ? 'relative' : 'fixed' }}>
        <HeaderBreadcrumbs
          heading={'Compliance Approval'}
          links={[{ name: translate('home'), href: PATH_APP.general.app }, { name: translate('compliance_approval') }]}
        />

        <Card
          sx={{
            // height: 'auto',
            height: cardHeight,
            minHeight: '65vh',
          }}
          id="aprroval-card"
        >
          <Divider />
          <Box sx={{ p: 1 }}>
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
                  NOTCH_HEIGHT +
                  IOS_KEYBOARD
                  }px)`,
              })}
              {...(theme.breakpoints.only('md') && {
                height: `calc(100vh - ${HEADER.MOBILE_HEIGHT + BREAKCRUM_HEIGHT + SPACING + ANDROID_KEYBOARD + NOTCH_HEIGHT + IOS_KEYBOARD
                  }px)`,
              })}
              {...(theme.breakpoints.only('xs') && {
                height: `calc(100vh - ${HEADER.MOBILE_HEIGHT + BREAKCRUM_HEIGHT + SPACING + ANDROID_KEYBOARD + NOTCH_HEIGHT + IOS_KEYBOARD
                  }px)`,
              })}
              grouped
              searchEnabled
              // height={smUp ? '62vh' : '68vh'}
              id="list-planing"
              scrollingEnabled
              searchMode={'contains'}
              noDataText={translate('noDataText')}
              focusStateEnabled={false}
              collapsibleGroups
              searchValue={searchText}
              groupRender={GroupRender}
              onInitialized={(e) => {
                fx.off = true;
              }}
              onContentReady={(e) => {
                setTimeout(() => {
                  fx.off = false;
                }, 2000);
              }}
              onGroupRendered={(e) => {
                if (source?.length > 1 && searchText === '') {
                  e.component.collapseGroup(e.groupIndex);
                }
              }}
            >
              <SearchEditorOptions
                placeholder={`${translate('search')}  FactoryName, SysNo, Customer, Auditor`}
                showClearButton
                value={searchText}
                onValueChanged={(e) => setSearchText(e.value)}
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
      </Container>
    </Page>
  );
}

// Render Input
const RenderInput = ({ params, label }) => {
  return (
    <TextField
      {...params}
      fullWidth
      onFocus={(event) => {
        event.target.select();
      }}
      size="small"
      label={
        <Stack direction="row" justifyContent="center" alignItems="center">
          <Iconify icon={IconName.search} />
          <p className="ml-1">{label}</p>
        </Stack>
      }
      InputLabelProps={{
        style: { color: 'var(--label)' },
        shrink: true,
      }}
    />
  );
};

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
        {`${capitalCase(data?.key)}`}
      </Typography>
    </Box>
  );
};
