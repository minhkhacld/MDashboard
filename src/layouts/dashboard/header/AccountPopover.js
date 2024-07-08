import { useSnackbar } from 'notistack';
import { useState } from 'react';
// import { useAuth } from 'oidc-react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
// @mui
import { alpha } from '@mui/material/styles';
import { Box, Divider, Typography, Stack, MenuItem } from '@mui/material';
// routes
import { PATH_APP, PATH_AUTH } from '../../../routes/paths';
// hooks
import useAuth from '../../../hooks/useAuth';
import useIsMountedRef from '../../../hooks/useIsMountedRef';
// components
import MyAvatar from '../../../components/MyAvatar';
import MenuPopover from '../../../components/MenuPopover';
import { IconButtonAnimate } from '../../../components/animate';
import useLocales from '../../../hooks/useLocales';
import { dispatch, useSelector } from '../../../redux/store';
import useIsOnline from '../../../hooks/useIsOnline';
import { setOfflineMode } from '../../../redux/slices/setting';
// ----------------------------------------------------------------------

export default function AccountPopover() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { translate } = useLocales();
  const { LoginUser } = useSelector((store) => store.workflow);
  const { online } = useIsOnline()
  // const auth = useAuth();
  const { user, logout, userInfo } = useAuth();

  const isMountedRef = useIsMountedRef();

  const { enqueueSnackbar } = useSnackbar();

  const [open, setOpen] = useState(null);

  const handleOpen = (event) => {
    setOpen(event.currentTarget);
  };

  const handleClose = () => {
    setOpen(null);
  };

  const MENU_OPTIONS = [
    {
      label: translate('home'),
      linkTo: '/',
    },
    {
      label: translate('account'),
      linkTo: PATH_APP.user.account,
    },
  ];

  // const handleLogout = async () => {
  //   try {
  //     // auth.signOutRedirect();
  //     if (isMountedRef.current) {
  //       handleClose();
  //     }
  //   } catch (error) {
  //     console.error(error);
  //     enqueueSnackbar('Unable to logout!', { variant: 'error' });
  //   }
  // };

  const handleSwitchToOffLineMode = () => {
    const showMenuOffline =
      !pathname.includes('/qc') && !pathname.includes('/mqc') && !pathname.includes('/compliance');
    if (online && showMenuOffline) {
      navigate('/offline');
    }
    dispatch(setOfflineMode(!online));
    handleClose();
  }

  const handleLogout = async () => {
    try {
      await logout();
      navigate(PATH_AUTH.login, { replace: true });
      if (isMountedRef.current) {
        handleClose();
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Unable to logout!', { variant: 'error' });
    }
  };

  return (
    <>
      <IconButtonAnimate
        onClick={handleOpen}
        sx={{
          p: 0,
          ...(open && {
            '&:before': {
              zIndex: 1,
              content: "''",
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              position: 'absolute',
              bgcolor: (theme) => alpha(theme.palette.grey[900], 0.8),
            },
          }),
        }}
      >
        <MyAvatar />
      </IconButtonAnimate>

      <MenuPopover
        open={Boolean(open)}
        anchorEl={open}
        onClose={handleClose}
        sx={{
          p: 0,
          mt: 1.5,
          ml: 0.75,
          '& .MuiMenuItem-root': {
            typography: 'body2',
            borderRadius: 0.75,
          },
        }}
      >
        <Box sx={{ my: 1.5, px: 2.5 }}>
          <Typography variant="subtitle2" noWrap>
            {`${LoginUser?.EmpKnowAs}`}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
            {LoginUser?.UserName}
          </Typography>
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Stack sx={{ p: 1 }}>
          {MENU_OPTIONS.map((option) => (
            <MenuItem key={option.label} to={option.linkTo} component={RouterLink} onClick={handleClose}>
              {option.label}
            </MenuItem>
          ))}
          <MenuItem onClick={handleSwitchToOffLineMode}>
            {
              !online ? "Switch to Online mode" : "Switch to offline mode"
            }
          </MenuItem>
        </Stack>

        <Divider sx={{ borderStyle: 'dashed' }} />
        {online &&
          <MenuItem onClick={handleLogout} sx={{ m: 1 }}>
            {translate('logOut')}
          </MenuItem>
        }
      </MenuPopover>
    </>
  );
}
