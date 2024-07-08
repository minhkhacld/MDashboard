import PropTypes from 'prop-types';
// @mui
import { styled, Box } from '@mui/material';

// components
import Iconify from './Iconify';
import IconName from '../utils/iconsName';
import useIsOnline from '../hooks/useIsOnline';

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
  // color: theme.palette.text.primary,
  color: 'white',
  backgroundColor: theme.palette.primary.main,
  borderTopLeftRadius: Number(theme.shape.borderRadius) * 2,
  borderBottomLeftRadius: Number(theme.shape.borderRadius) * 2,
  transition: theme.transitions.create('opacity'),
  '&:hover': { opacity: 0.72 },
}));

// ----------------------------------------------------------------------
CommandWidget.propTypes = {
  onClick: PropTypes.func,
  icon: PropTypes.any,
};

export default function CommandWidget({ onClick, icon = IconName.plusCircle }) {
  const { online } = useIsOnline();

  if (!online) {
    return (
      <Box
        onClick={onClick}
        sx={{
          zIndex: 999,
          right: 0,
          display: 'flex',
          cursor: 'pointer',
          position: 'fixed',
          alignItems: 'center',
          top: '50%',
          height: (theme) => theme.spacing(3),
          paddingLeft: (theme) => theme.spacing(2),
          paddingRight: (theme) => theme.spacing(2),
          paddingTop: (theme) => theme.spacing(0),
          boxShadow: (theme) => theme.customShadows.z20,
          color: (theme) => theme.palette.text.primary,
          backgroundColor: 'transparent',
          borderTopLeftRadius: (theme) => Number(theme.shape.borderRadius) * 2,
          borderBottomLeftRadius: (theme) => Number(theme.shape.borderRadius) * 2,
          transition: (theme) => theme.transitions.create('opacity'),
          '&:hover': { opacity: 0.72 },
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="26"
          height="26"
          preserveAspectRatio="xMidYMid meet"
          viewBox="0 0 24 24"
        >
          <path
            fill="currentColor"
            d="M19.045 7.401c.378-.378.586-.88.586-1.414s-.208-1.036-.586-1.414l-1.586-1.586c-.378-.378-.88-.586-1.414-.586s-1.036.208-1.413.585L4 13.585V18h4.413L19.045 7.401zm-3-3l1.587 1.585l-1.59 1.584l-1.586-1.585l1.589-1.584zM6 16v-1.585l7.04-7.018l1.586 1.586L7.587 16H6zm-2 4h16v2H4z"
          />
        </svg>
      </Box>
    );
  }
  return (
    <RootStyle onClick={onClick}>
      <Iconify
        icon={icon}
        width={24}
        height={24}
      // sx={{ color: 'var(--icon)' }}
      />
    </RootStyle>
  );
}
