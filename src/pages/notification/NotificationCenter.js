import { Capacitor } from '@capacitor/core';
import { List, SearchEditorOptions } from 'devextreme-react/list';
import PropTypes from 'prop-types';
import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
// @mui
import { Container, Stack, Typography, useTheme } from '@mui/material';
// hooks
import useLocales from '../../hooks/useLocales';
import useSettings from '../../hooks/useSettings';
// components
import Label from '../../components/Label';
import Page from '../../components/Page';
// config
import GoBackButton from '../../components/GoBackButton';
import { HEADER } from '../../config';
import useIsOnline from '../../hooks/useIsOnline';
import { useSelector } from '../../redux/store';
import { PATH_APP } from '../../routes/paths';

const NotificationCenter = () => {
  // Hooks
  const theme = useTheme();
  const { translate } = useLocales();
  const { themeStretch } = useSettings();
  const { online } = useIsOnline();
  const { pendingList } = useSelector((store) => store.notification);
  const navigate = useNavigate();



  const handleNavigate = (notification) => {

    switch (notification?.TableName) {

      case 'BankAccount':
        navigate(PATH_APP.bank_account.pending.report(notification?.Id), { state: { Guid: notification?.Guid } })
        // statements
        break;

      case 'FinanceRequest':
        // console.log('FinanceRequest')
        navigate(PATH_APP.accounting.pending.report(notification?.Id), { state: { Guid: notification?.Guid } })
        // statements
        break;

      case 'QualityInspection':
        navigate(PATH_APP.compliance.approval.detail(notification?.Id), { state: { Guid: notification?.Guid, EntityTypeName: notification.EntityTypeName } })
        // statements
        break;

      case 'ShipmentStatement':
        navigate(PATH_APP.shipment.pending.report(notification?.Id), { state: { Guid: notification?.Guid } })
        // statements
        break;

      case 'QualityRequest':
        navigate(PATH_APP.compliance.request.detail(notification?.Id), { state: { Guid: notification?.Guid } })
        // statements
        break;

      default:
      // default statements
    }

  };

  const handleClickItem = async (data,) => {
    handleNavigate(data)
  };



  const handleGoBack = () => {
    navigate(-1)
  };

  const SPACING = 24;
  const ANDROID_KEYBOARD = 0
  const BACK_BUTTON_HEIGHT = 42;
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
    <Page title={'Notification Center'}>
      <Container maxWidth={themeStretch ? false : 'lg'} sx={{ paddingLeft: 1, paddingRight: 1 }}>
        <GoBackButton
          onClick={handleGoBack}
        />
        <List
          dataSource={pendingList}
          itemComponent={(data) => {
            return (
              <ItemTemplate
                data={data.data}
                theme={theme}
                handleClickItem={handleClickItem}

              />
            );
          }}
          className="compliance-swiable-list"
          searchExpr={['CurrentEmpKnowAs', 'FromEmpKnowAs', 'SubmitTime', 'SysNo', 'WFAction']}
          {...theme.breakpoints.only('lg') && { height: `calc(100vh - ${HEADER.DASHBOARD_DESKTOP_HEIGHT + SPACING + NOTCH_HEIGHT + BACK_BUTTON_HEIGHT}px)` }}
          {...theme.breakpoints.only('md') && { height: `calc(100vh - ${HEADER.MOBILE_HEIGHT + SPACING + NOTCH_HEIGHT + BACK_BUTTON_HEIGHT}px)` }}
          {...theme.breakpoints.only('xs') && { height: `calc(100vh - ${HEADER.MOBILE_HEIGHT + SPACING + NOTCH_HEIGHT + BACK_BUTTON_HEIGHT}px)` }}
          searchEnabled
          scrollingEnabled
          searchMode={'contains'}
          noDataText={`${translate('noDataText')}`}
          focusStateEnabled={false}
          activeStateEnabled
          searchTimeout={1500}
          pullRefreshEnabled
          refreshingText={translate("refreshing")}
          pageLoadingText={translate("loading")}
          pageLoadMode="scrollBottom"
          showScrollbar={'onScroll'}
          selectionMode="single"
          repaintChangesOnly
        >
          <SearchEditorOptions placeholder={`${translate('search')} message`} showClearButton />
        </List>
      </Container>
    </Page>
  );
};

export default memo(NotificationCenter);

// RENDER LIST FOR LIST ALL ITEMS
const ItemTemplate = ({ data, theme, handleClickItem,
}) => {

  // console.log(data)
  ItemTemplate.propTypes = {
    data: PropTypes.object,
    theme: PropTypes.any,
    handleClickItem: PropTypes.func,
  };


  const NOTIFY_CONFIG = {
    Recall: {
      color: 'warning',
      primary: `Sorry this request: ${data?.SysNo} is not right. We would like to recall for adjusting some information.`,
      FinanceRequest: {
        text: 'Finance request',
        path: PATH_APP.accounting.recall.report(data?.Id),
      },
      ShipmentRequest: {
        text: 'Shipment statement request',
        path: PATH_APP.shipment.recall.report(data?.Id),
      },
      BankAccountRequest: {
        text: 'Bank Account request',
      },
      ComplianceRequest: {
        text: 'Compliance request',
      },
    },
    Reject: {
      color: 'error',
      primary: `Sorry this request: ${data?.SysNo} was rejected by ${data?.FromEmpKnowAs}`,
      FinanceRequest: {
        text: 'Finance request',
        path: PATH_APP.accounting.pending.report(data?.Id),
      },
      ShipmentRequest: {
        text: 'Shipment statement request',
        path: PATH_APP.shipment.pending.report(data?.Id),
      },
      BankAccountRequest: {
        text: 'Bank Account request',
        path: PATH_APP.bank_account.pending.report(data?.Id),
      },
      ComplianceRequest: {
        text: 'Compliance request',
      },
    },
    Forward: {
      color: 'success',
      primary: `Request No#: ${data?.SysNo} was submitted by  ${data?.FromEmpKnowAs}`,
      FinanceRequest: {
        text: 'Finance request',
        path: PATH_APP.accounting.pending.report(data?.Id),
      },
      ShipmentRequest: {
        text: 'Shipment statement request',
        path: PATH_APP.shipment.pending.report(data?.Id),
      },
      BankAccountRequest: {
        text: 'Bank Account request',
        path: PATH_APP.bank_account.pending.report(data?.Id),
      },
      ComplianceRequest: {
        text: 'Compliance request',
      },
    },
    Pending: {
      color: 'warning',
      primary: `Request No#: ${data?.SysNo} was submitted by ${data?.FromEmpKnowAs}`,
      FRDebit: {
        navigate: PATH_APP.accounting.pending.report(data?.Id),
      },
      FRPayment: {
        navigate: PATH_APP.accounting.pending.report(data?.Id),
      },
      FRCredit: {
        navigate: PATH_APP.accounting.pending.report(data?.Id),
      },
      QICompliance: {

      },
      BankAccount: {
        navigate: PATH_APP.bank_account.pending.report(data?.Id),
      },
    },
  };

  return (
    <Stack
      direction="row"
      justifyContent="center"
      alignItems={'center'}
      id={`list-item-row-${data?.Id}`}
      sx={{ position: 'relative', padding: 0 }}
      key={data.Id}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        width="100%"
        onClick={() => {
          handleClickItem(data);
        }}
        p={1}
      >
        <Stack direction="column" justifyContent="flex-start">
          <Typography variant="title" fontWeight={'bold'}>{data?.EntityTypeName}</Typography>
          <Typography
            variant="caption"
            paragraph
            sx={{ color: (theme) => theme.palette.error.dark }}
            fontWeight={'bold'}
            mb={0}
          >
            {NOTIFY_CONFIG[data?.WFAction][data?.EntityName]?.text}
          </Typography>
          <Typography variant="caption" paragraph mb={0} sx={{ wordBreak: 'break-word' }} whiteSpace="normal">
            {NOTIFY_CONFIG[data?.WFAction]?.primary}
          </Typography>
          <Typography
            variant="caption"
            paragraph
            mb={0}
            sx={{ wordBreak: 'break-word', fontStyle: 'italic' }}
            whiteSpace="normal"
          >
            {data?.WFComment}
          </Typography>
          <Typography variant="caption" paragraph mb={0} sx={{ wordBreak: 'break-word' }} whiteSpace="normal">
            Request by: {data?.FromEmpKnowAs}
          </Typography>
        </Stack>
        <Stack direction="column" justifyContent="flex-end" alignItems={'flex-end'}>
          <Label color={NOTIFY_CONFIG[data?.WFAction]?.color}>{data?.WFAction}</Label>
          <Typography variant="caption" paragraph fontWeight={'bold'} mb={0} mt={1}>
            {data?.SubmitTime}
          </Typography>
        </Stack>
      </Stack>
    </Stack>
  );
};
