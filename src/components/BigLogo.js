import PropTypes from 'prop-types';
import { memo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
// @mui
import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import LogoBig from '../assets/logo_menu_large.png';

// ----------------------------------------------------------------------

BigLogo.propTypes = {
  disabledLink: PropTypes.bool,
  sx: PropTypes.object,
};

function BigLogo({ disabledLink = false, sx }) {
  const theme = useTheme();
  // OR
  //   const logo = '../assets/logo_menu_small.png';

  const logo = (
    <Box sx={{ width: '100%', height: 40, ...sx }}>
      <img src={LogoBig} alt="logo_big" />
    </Box>
  );

  if (disabledLink) {
    return <>{logo}</>;
  }

  return <RouterLink to="/">{logo}</RouterLink>;
}

export default memo(BigLogo);
