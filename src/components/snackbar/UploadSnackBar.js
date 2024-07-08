import { Network } from '@capacitor/network';
import {
    Alert,
    Box,
    LinearProgress, Stack, Typography, useTheme
} from '@mui/material';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
// components
// hooks
import useLocales from '../../hooks/useLocales';


UploadSnackBar.propTypes = {
    loading: PropTypes.bool,
    text: PropTypes.string,
    width: PropTypes.any,
    height: PropTypes.any,
    position: PropTypes.string,
    progress: PropTypes.number,
    signalR: PropTypes.object,
};

export default function UploadSnackBar({
    loading = false,
    text = 'Loading',
    width = '100%',
    height = 'auto',
    position = 'fixed',
    progress,
    signalR = {},
}) {

    // hooks;
    const theme = useTheme();
    const { translate, currentLang } = useLocales();

    // state;
    const [network, setNetWork] = useState(null);
    const [processingPercentage, setProcessingPercentage] = useState(0);

    useEffect(() => {

        (async () => {
            const status = await Network.getStatus();
            setNetWork(status)
        })()

        const subcribe = () => Network.addListener('networkStatusChange', status => {
            // console.log('Network status changed', status);
            setNetWork(status)
        });
        subcribe();

        return () => {
            subcribe()
        };

    }, []);

    useEffect(() => {
        (async () => {
            await new Promise(resolve => setTimeout(resolve, 500))
            const percentage = Math.round(Number(signalR.message) / 4 * 100);
            setProcessingPercentage(percentage);
        })();
    }, [signalR]);

    const containerStyles = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        flexDirection: 'column',
        borderRadius: 1,
        width,
        height,
        position,
        zIndex: theme.zIndex.snackbar,
        // top: {
        //     xs: HEADER.MOBILE_HEIGHT,
        //     lg: HEADER.MAIN_DESKTOP_HEIGHT,
        // },
        // left: 0,
        // right: 0,
        // p: 1,
    }

    return (
        <Stack
            spacing={.5}
            height="auto"
            sx={containerStyles}
        >

            {
                progress < 100
                    ?
                    <>
                        <LinearProgressWithLabel value={progress || 0} />
                        <Stack justifyContent="center" alignItems={'center'} width='100%' direction={'row'}>
                            <Typography color={'text.black'} textAlign='center' variant='caption'>{currentLang.value === 'en' ? `Uploading data...` : `Đang tải lên dữ liệu...`}</Typography>
                        </Stack>
                    </>
                    :
                    <>
                        <LinearProgressWithLabel value={processingPercentage || 0} />
                        <Stack justifyContent="center" alignItems={'center'} width='100%' direction={'row'}>
                            <Typography color={'text.black'} textAlign='center' variant='caption' >{currentLang.value === 'en' ? `Processing data...` : `Đang xử lý dữ liệu...`}</Typography>
                        </Stack>
                        {signalR?.type === 'Error' &&
                            <Stack justifyContent="flex-start" alignItems={'center'} width='100%' direction={'row'}>
                                <Typography color={signalR.type === 'Error' ? 'red' : 'text.black'} textAlign='left' variant='caption'>Finalize file Error!</Typography>
                            </Stack>
                        }
                    </>
            }

            {!network?.connected && network?.connected !== undefined &&
                <Stack justifyContent="flex-start" alignItems={'center'} width='100%' direction={'row'}>
                    <Alert severity="error" sx={{ width: '100%', fontStyle: 'italic' }}> {currentLang.value === 'en' ? 'No internet connection, retrying...' : 'Không có kết nối mạng, đang thử lại...'}</Alert>
                </Stack>
            }


        </Stack>
    )
}


LinearProgressWithLabel.propTypes = {
    value: PropTypes.number,
};


function LinearProgressWithLabel({ value = 0, ...props }) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <Box sx={{ width: '100%', mr: 1 }}>
                <LinearProgress variant="determinate" {...props} value={value} color='primary' />
            </Box>
            <Box sx={{ minWidth: 35 }}>
                <Typography variant="body2" color="primary.main">{`${value}%`}</Typography>
            </Box>
        </Box>
    );
}