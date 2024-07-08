import PropTypes from 'prop-types';
import { useCallback, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// @mui
import {
  Badge,
  Box,
  Button,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  ListItem,
  ListSubheader,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
// utils
import { fToNow } from '../../../utils/formatTime';
// components
import { IconButtonAnimate } from '../../../components/animate';
import Iconify from '../../../components/Iconify';
import MenuPopover from '../../../components/MenuPopover';
import Scrollbar from '../../../components/Scrollbar';
import useAuth from '../../../hooks/useAuth';
import useLocales from '../../../hooks/useLocales';
import { setMarkAsReadNotification, getPendingNotification } from '../../../redux/slices/notification';
import { dispatch, useSelector } from '../../../redux/store';
import { PATH_APP } from '../../../routes/paths';
import Label from '../../../components/Label';
import { HEADER } from '../../../config'

// ----------------------------------------------------------------------

export default function NotificationsPopover() {

  const [notifications, setNotifications] = useState(null);

  const { pendingList } = useSelector((store) => store.notification);
  const { LoginUser } = useSelector((store) => store.workflow);
  const { translate } = useLocales();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [open, setOpen] = useState(null);

  const handleOpen = (event) => {
    setOpen(event.currentTarget);
    // dispatch(getPendingNotification(user?.currentUser?.id));
  };

  const handleClose = () => {
    setOpen(null);
  };

  const handleMarkAllAsRead = (item) => {
    // setNotifications(
    //   notifications.map((notification) => ({
    //     ...notification,
    //     isUnRead: false,
    //   }))
    // );
    const key = item.Id;
    const values = { isRead: true };
    dispatch(setMarkAsReadNotification(key, values));
  };

  const handleViewAll = () => {
    setOpen(false);
    navigate(PATH_APP.general.notification);
  };

  const handleClickItem = (data) => {
    // dispatch(setMarkAsReadNotification(data.Id, { isRead: true }));
    // dispatch(getPendingNotification(LoginUser?.EmpId));
    handleClose();
  };

  const SPACING = 200;
  const checkNotch = () => {
    const iPhone = /iPhone/.test(navigator.userAgent) && !window.MSStream
    const aspect = window.screen.width / window.screen.height
    if (iPhone && aspect.toFixed(3) === "0.462") {
      // I'm an iPhone X or 11...
      return 55
    }
    return 0
  }
  const NOTCH_HEIGHT = checkNotch();

  // console.log(pendingList);

  return (
    <>
      <IconButtonAnimate
        color={open ? 'primary' : 'default'}
        onClick={handleOpen}
        sx={{ width: 40, height: 40 }}
        id="notification-badge"
      >
        <Badge badgeContent={pendingList.length} color="error">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g id="evaBellFill0">
              <g id="evaBellFill1">
                <path
                  id="evaBellFill2"
                  fill="currentColor"
                  d="m20.52 15.21l-1.8-1.81V8.94a6.86 6.86 0 0 0-5.82-6.88a6.74 6.74 0 0 0-7.62 6.67v4.67l-1.8 1.81A1.64 1.64 0 0 0 4.64 18H8v.34A3.84 3.84 0 0 0 12 22a3.84 3.84 0 0 0 4-3.66V18h3.36a1.64 1.64 0 0 0 1.16-2.79ZM14 18.34A1.88 1.88 0 0 1 12 20a1.88 1.88 0 0 1-2-1.66V18h4Z"
                />
              </g>
            </g>
          </svg>
        </Badge>
      </IconButtonAnimate>

      <MenuPopover
        open={Boolean(open)}
        anchorEl={open}
        onClose={handleClose}
        sx={{ width: 360, p: 0, mt: 1.5, ml: 0.75 }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', py: 2, px: 2.5 }}>

          {/* <Typography variant="subtitle1">This feature is now under development</Typography> */}

          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1">{translate('notify.popOver.notification')}</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {`${translate('You have')} ${pendingList.length} ${translate('new notifiations')}`}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />
        {pendingList.length > 0 ? (
          <Scrollbar sx={{
            height: {
              lg: `calc(100vh - ${HEADER.DASHBOARD_DESKTOP_HEIGHT + SPACING + NOTCH_HEIGHT}px)`,
              sm: `calc(100vh - ${HEADER.MOBILE_HEIGHT + SPACING + NOTCH_HEIGHT}px)`,
              xs: `calc(100vh - ${HEADER.MOBILE_HEIGHT + SPACING + NOTCH_HEIGHT}px)`,
            },
            minHeight: 370
          }}>
            <List
              disablePadding
              subheader={
                <ListSubheader disableSticky sx={{ py: 1, px: 2.5, typography: 'overline' }}>
                  {translate('notify.popOver.new')}
                </ListSubheader>
              }
            >
              {pendingList.map((notification) => (
                <Box
                  key={notification?.Id}
                >
                  <NotificationItem notification={notification} handleClose={handleClose} navigate={navigate} />
                </Box>
              ))}
            </List>
          </Scrollbar>
        ) : null}
        <Divider sx={{ borderStyle: 'dashed' }} />

        <Box sx={{ p: 1 }}>
          <Button fullWidth disableRipple onClick={handleViewAll} disabled={pendingList.length === 0}>
            {translate('notify.popOver.viewAll')}
          </Button>
        </Box>
      </MenuPopover>
    </>
  );
}

// ----------------------------------------------------------------------

NotificationItem.propTypes = {
  notification: PropTypes.any,
};

function NotificationItem({ notification, handleClose, navigate }) {

  const theme = useTheme();
  const { translate } = useLocales();

  const NOTIFY_CONFIG = {
    Recall: {
      color: 'warning',
      primary: `Sorry this request: ${notification?.EntitySysNo} is not right. We would like to recall for adjusting some information.`,
      FinanceRequest: {
        text: 'Finance request',
        path: PATH_APP.accounting.recall.report(notification?.Id),
      },
      ShipmentRequest: {
        text: 'Shipment statement request',
        path: PATH_APP.shipment.recall.report(notification?.Id),
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
      primary: `Sorry this request: ${notification?.EntitySysNo} was rejected by ${notification?.FromEmpKnowAs}`,
      FinanceRequest: {
        text: 'Finance request',
        path: PATH_APP.accounting.pending.report(notification?.Id),
      },
      ShipmentRequest: {
        text: 'Shipment statement request',
        path: PATH_APP.shipment.pending.report(notification?.Id),
      },
      BankAccountRequest: {
        text: 'Bank Account request',
        path: PATH_APP.bank_account.pending.report(notification?.Id),
      },
      ComplianceRequest: {
        text: 'Compliance request',
      },
    },
    Forward: {
      color: 'success',
      primary: `Request No#: ${notification?.EntitySysNo} was submitted by  ${notification?.FromEmpKnowAs}`,
      FinanceRequest: {
        text: 'Finance request',
        path: PATH_APP.accounting.pending.report(notification?.Id),
      },
      ShipmentRequest: {
        text: 'Shipment statement request',
        path: PATH_APP.shipment.pending.report(notification?.Id),
      },
      BankAccountRequest: {
        text: 'Bank Account request',
        path: PATH_APP.bank_account.pending.report(notification?.Id),
      },
      ComplianceRequest: {
        text: 'Compliance request',
      },
    },
    Pending: {
      color: 'warning',
      primary: `Request No#: ${notification?.SysNo} was submitted by ${notification?.FromEmpKnowAs}`,
      FRDebit: {
        navigate: PATH_APP.accounting.pending.report(notification?.Id),
      },
      FRPayment: {
        navigate: PATH_APP.accounting.pending.report(notification?.Id),
      },
      FRCredit: {
        navigate: PATH_APP.accounting.pending.report(notification?.Id),
      },
      QICompliance: {

      },
      BankAccount: {
        navigate: PATH_APP.bank_account.pending.report(notification?.Id),
      },
    },
  };


  const handleNavigate = (data) => {

    // BankAccount
    // FinanceRequest
    // QualityInspection
    // QualityRequest
    // ShipmentStatement

    // Forward
    // Pending
    // Reject
    // console.log(data)

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

      case 'QualityRequest':
        navigate(PATH_APP.compliance.request.detail(notification?.Id), { state: { Guid: notification?.Guid, } })
        // statements
        break;

      case 'ShipmentStatement':
        navigate(PATH_APP.shipment.pending.report(notification?.Id), { state: { Guid: notification?.Guid } })
        // statements
        break;

      default:
      // default statements

    }

    handleClose();
  };


  return (
    <ListItemButton
      sx={{
        py: 1.5,
        px: 2.5,
        mt: '1px',
        ...(notification?.isRead && {
          bgcolor: 'action.selected',
        }),
      }}
    >
      <Stack onClick={handleNavigate} width={'100%'}>

        <Stack direction={'row'} spacing={2} display="flex" justifyContent="space-between" width={'100%'}>
          <Typography variant="title" fontWeight={'bold'}>{notification?.EntityTypeName}</Typography>
          <Label color={NOTIFY_CONFIG[notification?.WFAction]?.color}>{notification?.WFAction}</Label>
        </Stack>

        <Typography variant="caption">{NOTIFY_CONFIG[notification?.WFAction]?.primary}</Typography>

        <Typography
          variant="caption"
          sx={{
            mt: 0.5,
            display: 'flex',
            alignItems: 'center',
            color: 'text.disabled',
          }}
        >
          <Iconify icon="eva:clock-outline" sx={{ mr: 0.5, width: 16, height: 16 }} />
          {fToNow(notification?.SubmitTime)}
        </Typography>

      </Stack>
    </ListItemButton>
  );
}

// ----------------------------------------------------------------------
