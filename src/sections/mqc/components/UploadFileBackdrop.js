import { Network } from '@capacitor/network';
import {
  Alert,
  //  Backdrop,
  Box,
  Dialog,
  DialogContent,
  LinearProgress,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
// components
import Iconify from '../../../components/Iconify';
import IconName from '../../../utils/iconsName';
// hooks
import useLocales from '../../../hooks/useLocales';

UploadFileBackDrop.propTypes = {
  loading: PropTypes.bool,
  // text: PropTypes.string,
  // width: PropTypes.any,
  // height: PropTypes.any,
  // position: PropTypes.string,
  progress: PropTypes.number,
  signalR: PropTypes.object,
};

function UploadFileBackDrop({
  loading = false,
  // text = 'Loading',
  // width = '100vw',
  // height = '100vh',
  // position = 'fixed',
  progress,
  signalR = {},
}) {
  // hooks;
  const theme = useTheme();
  const { currentLang } = useLocales();

  // state;
  const [network, setNetWork] = useState(null);
  // const [processingPercentage, setProcessingPercentage] = useState(0)

  useEffect(() => {
    (async () => {
      const status = await Network.getStatus();
      setNetWork(status);
    })();

    const subcribe = () =>
      Network.addListener('networkStatusChange', (status) => {
        // console.log('Network status changed', status);
        setNetWork(status);
      });
    subcribe();

    return () => {
      subcribe();
    };
  }, []);

  // useEffect(() => {
  //     const percentage = Math.round(Number(signalR.message) / 4 * 100);
  //     setProcessingPercentage(percentage);
  // }, [signalR])

  const processingPercentage = Math.round((Number(signalR.message) / 4) * 100);

  return (
    <Dialog open={loading}>
      <DialogContent sx={{ minWidth: 280 }}>
        {/* <Backdrop
                sx={{
                    zIndex: theme.zIndex.drawer + 10,
                    width,
                    height,
                    position,
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: 0,
                }}
                open={loading}
            > */}
        <Stack
          spacing={2}
          height="auto"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'white',
            flexDirection: 'column',
            borderRadius: 1,
            width: {
              xs: '100%',
            },
          }}
        >
          <Stack spacing={1} justifyContent="flex-start" alignItems={'center'} width="100%" direction={'row'}>
            <Typography color={'text.black'} textAlign="center" fontWeight={'bold'}>
              {currentLang.value === 'en' ? 'Uploading data' : 'Đang tải lên dữ liệu'} :
            </Typography>
            <Iconify
              icon={progress === 100 ? IconName.checked : 'eos-icons:loading'}
              sx={{
                color: progress === 100 ? theme.palette.success.dark : theme.palette.warning.main,
                fontSize: 20,
              }}
            />
          </Stack>
          <LinearProgressWithLabel value={progress || 0} />

          {progress === 100 && (
            <>
              <Stack spacing={1} justifyContent="flex-start" alignItems={'center'} width="100%" direction={'row'}>
                <Typography color={'text.black'} textAlign="center" fontWeight={'bold'}>
                  {currentLang.value === 'en' ? 'Processing data' : 'Đang xử lý dữ liệu'} :
                </Typography>
                <Iconify
                  icon={signalR.message === '4' ? IconName.checked : 'eos-icons:loading'}
                  sx={{
                    color: signalR.message === '4' ? theme.palette.success.dark : theme.palette.warning.main,
                    fontSize: 20,
                  }}
                />
              </Stack>
              <LinearProgressWithLabel value={processingPercentage || 0} />
              {signalR?.type === 'Error' && (
                <Stack spacing={1} justifyContent="flex-start" alignItems={'center'} width="100%" direction={'row'}>
                  <Typography
                    color={signalR.type === 'Error' ? 'red' : 'text.black'}
                    textAlign="left"
                    variant="caption"
                  >
                    Finalize file Error!
                  </Typography>
                </Stack>
              )}
            </>
          )}

          {!network?.connected && network?.connected !== undefined && (
            <Stack spacing={1} justifyContent="flex-start" alignItems={'center'} width="100%" direction={'row'}>
              <Alert severity="error" sx={{ width: '100%', fontStyle: 'italic' }}>
                {' '}
                {currentLang.value === 'en'
                  ? 'No internet connection, retrying...'
                  : 'Không có kết nối mạng, đang thử lại...'}
              </Alert>
            </Stack>
          )}

          <Stack spacing={1} justifyContent="flex-start" alignItems={'center'} width="100%" direction={'row'}>
            <Typography color={'text.black'} textAlign="left" variant="caption">
              {' '}
              {currentLang.value === 'en'
                ? 'Please keep your internet connection stable...'
                : 'Vui lòng không chuyển mạng khi đang tải lên dữ liệu'}{' '}
            </Typography>
          </Stack>

          {/* {network?.connected && network?.connected !== undefined &&
                    <Stack spacing={1} justifyContent="flex-start" alignItems={'center'} width='100%' direction={'row'}>
                        <Typography color={theme.palette.warning.main} textAlign='left' variant='caption'> {currentLang.value === 'en' ? `You are using ${network.connectionType}` : `Bạn đang sử dụng mạng ${network.connectionType === 'cellular' ? 'di động' : 'wifi'}`}</Typography>
                    </Stack>
                } */}
        </Stack>
        {/* </Backdrop> */}
      </DialogContent>
    </Dialog>
  );
}

export default UploadFileBackDrop;

LinearProgressWithLabel.propTypes = {
  value: PropTypes.number,
};

function LinearProgressWithLabel({ value = 0, ...props }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
      <Box sx={{ width: '100%', mr: 1 }}>
        <LinearProgress variant="determinate" {...props} value={value} color="primary" />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant="body2" color="primary.main">{`${value}%`}</Typography>
      </Box>
    </Box>
  );
}
