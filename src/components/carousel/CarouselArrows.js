import PropTypes from 'prop-types';
// @mui
import { useTheme, styled } from '@mui/material/styles';
import { Box, Stack } from '@mui/material';
//
import Iconify from '../Iconify';
import { IconButtonAnimate } from '../animate';
import useIsOnline from '../../hooks/useIsOnline';

// ----------------------------------------------------------------------

const BUTTON_SIZE = 40;

const ArrowStyle = styled(IconButtonAnimate, {
  shouldForwardProp: (prop) => prop !== 'filled',
})(({ filled, theme }) => ({
  width: BUTTON_SIZE,
  height: BUTTON_SIZE,
  cursor: 'pointer',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '&:hover': {
    color: theme.palette.text.primary,
  },
  ...(filled && {
    opacity: 0.48,
    borderRadius: Number(theme.shape.borderRadius) * 1.5,
    color: theme.palette.common.white,
    backgroundColor: theme.palette.grey[900],
    '&:hover': {
      opacity: 1,
      color: theme.palette.common.white,
      backgroundColor: theme.palette.grey[900],
    },
  }),
}));

// ----------------------------------------------------------------------

CarouselArrows.propTypes = {
  children: PropTypes.node,
  customIcon: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
  filled: PropTypes.bool,
  onNext: PropTypes.func,
  onPrevious: PropTypes.func,
};

export default function CarouselArrows({
  filled = false,
  customIcon, // Set icon right
  onNext,
  onPrevious,
  children,
  ...other
}) {
  const theme = useTheme();
  const isRTL = theme.direction === 'rtl';
  const { online } = useIsOnline();

  const style = {
    position: 'absolute',
    mt: -2.5,
    top: '50%',
    zIndex: 9,
  };

  if (children) {
    return (
      <Box {...other}>
        <Box className="arrow left" sx={{ ...style, left: 0 }}>
          <ArrowStyle filled={filled} onClick={onPrevious}>
            {leftIcon(customIcon, isRTL, online)}
          </ArrowStyle>
        </Box>

        {children}

        <Box className="arrow right" sx={{ ...style, right: 0 }}>
          <ArrowStyle filled={filled} onClick={onNext}>
            {rightIcon(customIcon, isRTL, online)}
          </ArrowStyle>
        </Box>
      </Box>
    );
  }

  return (
    <Stack direction="row" spacing={1} {...other}>
      <ArrowStyle className="arrow left" filled={filled} onClick={onPrevious}>
        {leftIcon(customIcon, isRTL, online)}
      </ArrowStyle>
      <ArrowStyle className="arrow right" filled={filled} onClick={onNext}>
        {rightIcon(customIcon, isRTL, online)}
      </ArrowStyle>
    </Stack>
  );
}

// ----------------------------------------------------------------------

const leftIcon = (customIcon, isRTL, online) => {
  if (!online) {
    return (
      <Box
        sx={{
          width: 20,
          height: 20,
          transform: ' scaleX(-1)',
          ...(isRTL && { transform: ' scaleX(1)' }),
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="1em"
          height="1em"
          preserveAspectRatio="xMidYMid meet"
          viewBox="0 0 24 24"
        >
          <path
            fill="currentColor"
            d="M10.46 18a2.23 2.23 0 0 1-.91-.2a1.76 1.76 0 0 1-1.05-1.59V7.79A1.76 1.76 0 0 1 9.55 6.2a2.1 2.1 0 0 1 2.21.26l5.1 4.21a1.7 1.7 0 0 1 0 2.66l-5.1 4.21a2.06 2.06 0 0 1-1.3.46Z"
          />
        </svg>
      </Box>
    );
  }
  return (
    <Iconify
      icon={customIcon || 'eva:arrow-right-fill'}
      sx={{
        width: 20,
        height: 20,
        transform: ' scaleX(-1)',
        ...(isRTL && { transform: ' scaleX(1)' }),
      }}
    />
  );
};

const rightIcon = (customIcon, isRTL, online) => {
  if (!online) {
    return (
      <Box
        sx={{
          width: 20,
          height: 20,
          ...(isRTL && { transform: ' scaleX(-1)' }),
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="1em"
          height="1em"
          preserveAspectRatio="xMidYMid meet"
          viewBox="0 0 24 24"
        >
          <path
            fill="currentColor"
            d="M10.46 18a2.23 2.23 0 0 1-.91-.2a1.76 1.76 0 0 1-1.05-1.59V7.79A1.76 1.76 0 0 1 9.55 6.2a2.1 2.1 0 0 1 2.21.26l5.1 4.21a1.7 1.7 0 0 1 0 2.66l-5.1 4.21a2.06 2.06 0 0 1-1.3.46Z"
          />
        </svg>
      </Box>
    );
  }
  return (
    <Iconify
      icon={customIcon || 'eva:arrow-right-fill'}
      sx={{
        width: 20,
        height: 20,
        ...(isRTL && { transform: ' scaleX(-1)' }),
      }}
    />
  );
};
