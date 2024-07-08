import PropTypes from 'prop-types';
// @mui
import { Box } from '@mui/material';
// COMPONENTS
import Iconify from '../../../components/Iconify';
// HOOK
import useIsOnline from '../../../hooks/useIsOnline';
// utils
import IconName from '../../../utils/iconsName';

// Custom icon for offline mode
export default function CustomIcon({ icon }) {
  CustomIcon.propTypes = {
    icon: PropTypes.string,
  };
  const { online } = useIsOnline();
  // const theme = useTheme();
  if (online) {
    return <Iconify icon={icon} sx={{ fontSize: 20, color: 'var(--icon)', marginRight: 1 }} />;
  }
  if (icon === IconName.view) {
    return (
      <Box
        sx={{
          width: 20,
          height: 20,
          marginRight: 1,
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path
            fill="var(--icon)"
            d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5s5 2.24 5 5s-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3s3-1.34 3-3s-1.34-3-3-3z"
          />
        </svg>
      </Box>
    );
  }
  if (icon === IconName.edit) {
    return (
      <Box
        sx={{
          width: 20,
          height: 20,
          marginRight: 1,
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path
            fill="var(--icon)"
            d="M19.045 7.401c.378-.378.586-.88.586-1.414s-.208-1.036-.586-1.414l-1.586-1.586c-.378-.378-.88-.586-1.414-.586s-1.036.208-1.413.585L4 13.585V18h4.413L19.045 7.401zm-3-3l1.587 1.585l-1.59 1.584l-1.586-1.585l1.589-1.584zM6 16v-1.585l7.04-7.018l1.586 1.586L7.587 16H6zm-2 4h16v2H4z"
          />
        </svg>
      </Box>
    );
  }
  if (icon === IconName.delete) {
    return (
      <Box
        sx={{
          width: 20,
          height: 20,
          marginRight: 1,
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
          <path
            fill="var(--icon)"
            d="M360 184h-8c4.4 0 8-3.6 8-8v8h304v-8c0 4.4 3.6 8 8 8h-8v72h72v-80c0-35.3-28.7-64-64-64H352c-35.3 0-64 28.7-64 64v80h72v-72zm504 72H160c-17.7 0-32 14.3-32 32v32c0 4.4 3.6 8 8 8h60.4l24.7 523c1.6 34.1 29.8 61 63.9 61h454c34.2 0 62.3-26.8 63.9-61l24.7-523H888c4.4 0 8-3.6 8-8v-32c0-17.7-14.3-32-32-32zM731.3 840H292.7l-24.2-512h487l-24.2 512z"
          />
        </svg>
      </Box>
    );
  }
  return null;
}
