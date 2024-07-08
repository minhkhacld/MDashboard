import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
// @mui
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { Box, Stack, AppBar, Toolbar } from '@mui/material';

// hooks
import useOffSetTop from '../../../hooks/useOffSetTop';
import useResponsive from '../../../hooks/useResponsive';
// utils
import cssStyles from '../../../utils/cssStyles';
// config
import { HEADER, NAVBAR } from '../../../config';
// components
import Logo from '../../../components/Logo';
import Iconify from '../../../components/Iconify';
import { IconButtonAnimate } from '../../../components/animate';
//
// import Searchbar from './Searchbar';
import AccountPopover from './AccountPopover';
import LanguagePopover from './LanguagePopover';
import NotificationsPopover from './NotificationsPopover';
import ToggleSettingButton from './ToggleSettingButton';
import useIsOnline from '../../../hooks/useIsOnline';
import Label from '../../../components/Label';

// ----------------------------------------------------------------------

const RootStyle = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== 'isCollapse' && prop !== 'isOffset' && prop !== 'verticalLayout',
})(({ isCollapse, isOffset, verticalLayout, theme }) => ({
  ...cssStyles(theme).bgBlur(),
  boxShadow: 'none',
  height: HEADER.MOBILE_HEIGHT,
  zIndex: theme.zIndex.appBar + 1,
  transition: theme.transitions.create(['width', 'height'], {
    duration: theme.transitions.duration.shorter,
  }),
  [theme.breakpoints.up('lg')]: {
    height: HEADER.DASHBOARD_DESKTOP_HEIGHT,
    width: `calc(100% - ${NAVBAR.DASHBOARD_WIDTH + 1}px)`,
    ...(isCollapse && {
      width: `calc(100% - ${NAVBAR.DASHBOARD_COLLAPSE_WIDTH}px)`,
    }),
    ...(isOffset && {
      height: HEADER.DASHBOARD_DESKTOP_OFFSET_HEIGHT,
    }),
    ...(verticalLayout && {
      width: '100%',
      height: HEADER.DASHBOARD_DESKTOP_OFFSET_HEIGHT,
      backgroundColor: theme.palette.background.default,
    }),
  },
}));

// ----------------------------------------------------------------------
DashboardHeader.propTypes = {
  onOpenSidebar: PropTypes.func,
  isCollapse: PropTypes.bool,
  verticalLayout: PropTypes.bool,
};

export default function DashboardHeader({ onOpenSidebar, isCollapse = false, verticalLayout = false }) {
  const isOffset = useOffSetTop(HEADER.DASHBOARD_DESKTOP_HEIGHT) && !verticalLayout;
  const { online } = useIsOnline();

  const isDesktop = useResponsive('up', 'lg');
  const navigate = useNavigate();
  const handleGoToOfflineMenu = () => {
    navigate('/offline');
  };

  return (
    <RootStyle isCollapse={isCollapse} isOffset={isOffset} verticalLayout={verticalLayout}>

      <Toolbar
        sx={{
          minHeight: '100% !important',
          px: { lg: 5 },
        }}
      >

        {isDesktop && verticalLayout && <Logo sx={{ mr: 2.5 }} />}

        {!isDesktop && online && (
          <IconButtonAnimate onClick={onOpenSidebar} sx={{ mr: 1, color: 'text.primary' }}>
            <Iconify icon="eva:menu-2-fill" />
          </IconButtonAnimate>
        )}

        {!online && (
          <IconButtonAnimate onClick={handleGoToOfflineMenu} sx={{ mr: 1, color: 'text.primary' }}>
            {/* <Iconify icon="eva:menu-2-fill" /> */}
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <g id="evaMenu2Fill0">
                <g id="evaMenu2Fill1">
                  <g id="evaMenu2Fill2" fill="currentColor">
                    <circle cx="4" cy="12" r="1" />
                    <rect width="14" height="2" x="7" y="11" rx=".94" ry=".94" />
                    <rect width="18" height="2" x="3" y="16" rx=".94" ry=".94" />
                    <rect width="18" height="2" x="3" y="6" rx=".94" ry=".94" />
                  </g>
                </g>
              </g>
            </svg>
          </IconButtonAnimate>
        )}

        {/* <Searchbar /> */}

        {!online && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
            }}
          >
            <Label
              variant="ghost"
              color="error"
              sx={{
                justifyContent: 'center',
                width: 'fit-content',
              }}
            >
              Your are offline
            </Label>
          </Box>
        )}

        <Box sx={{ flexGrow: 1 }} />

        <Stack direction="row" alignItems="center" spacing={{ xs: 1, sm: 1.5 }}>
          <LanguagePopover />
          <NotificationsPopover />
          <ToggleSettingButton />
          <AccountPopover />
        </Stack>
      </Toolbar>
    </RootStyle>
  );
}
