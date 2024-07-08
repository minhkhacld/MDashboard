import { Backdrop, Box, CircularProgress, Stack, Typography, useTheme } from '@mui/material';
import PropTypes from 'prop-types';
import { useEffect } from 'react';

LoadingBackDrop.propTypes = {
  text: PropTypes.string,
  width: PropTypes.string,
  height: PropTypes.string,
  position: PropTypes.string,
  variant: PropTypes.string,
  progress: PropTypes.object,
  setProgress: PropTypes.func,
}

function LoadingBackDrop({ loading = false,
  text = 'Loading',
  width = '100vw',
  height = '100vh',
  position = 'fixed',
  variant = '',
  progress = { current: 0, total: 0 },
  setProgress = () => { },
}) {

  const theme = useTheme();
  const progressValue = Math.round(progress.current / progress.total * 100) || 0;

  useEffect(() => {
    return () => {
      if (setProgress) {
        setProgress({ current: 0, total: 0 })
      }
    }
  }, []);

  const backdropStyles = {
    zIndex: `${1000000000} !important`,
    width,
    height,
    position,
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  };


  return (
    <Backdrop
      sx={backdropStyles}
      open={loading}
    >
      <Box
        width={'100%'}
        height="100%"
        display={'flex'}
        justifyContent={'center'}
        alignItems={'center'}
        bgcolor='transparent'
      >
        <Stack spacing={2} justifyContent="center" alignItems={'center'} width='70%'  >
          <Box position={'relative'} display={'inline-flex'}>
            <CircularProgress
              sx={{ color: theme.palette.primary.main }}
              {
              ...(variant === 'determinate' && {
                variant: 'determinate',
                value: progressValue
              })
              }
            />

            {variant === 'determinate' &&
              <Box
                sx={{
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  position: 'absolute',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'transparent',
                }}
              >
                <Typography
                  variant="caption"
                  component="div"
                  color={theme.palette.primary.main}
                >{progressValue}%</Typography>
              </Box>
            }
          </Box>
          <Typography color={theme.palette.primary.main} textAlign='center'>{text}</Typography>
        </Stack>
      </Box >
    </Backdrop >
  );
};

export default LoadingBackDrop;


