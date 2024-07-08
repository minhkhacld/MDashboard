import { Alert, AlertTitle, Backdrop, Box, LinearProgress, Stack, Typography, useTheme } from '@mui/material';
import PropTypes from 'prop-types';
import Iconify from '../../../../components/Iconify';
import IconName from '../../../../utils/iconsName';


LoadingBackDrop.propTypes = {
    loading: PropTypes.bool,
    text: PropTypes.string,
    width: PropTypes.any,
    height: PropTypes.any,
    position: PropTypes.string,
    displayProgress: PropTypes.bool,
    uploadAttachments: PropTypes.object,
    uploadContent: PropTypes.number,
    retryCount: PropTypes.number,
};

function LoadingBackDrop({
    loading = false,
    text = 'Loading',
    width = '100vw',
    height = '100vh',
    position = 'fixed',
    displayProgress = false,
    uploadAttachments,
    uploadContent,
    retryCount,
}) {

    const theme = useTheme();
    const progressValue = Math.round((uploadAttachments?.progress / uploadAttachments?.total) * 100);

    return (
        <Backdrop
            sx={{
                zIndex: theme.zIndex.appBar + 1000000000000,
                width,
                height,
                position,
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
            }}
            open={loading}
        >
            <Stack
                width={'100%'}
                spacing={2}
                height="100%"
                sx={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent',
                    flexDirection: 'column',
                }}
            >
                <Stack spacing={1} justifyContent="flex-start" alignItems={'center'} width='90%' direction={'row'}>
                    <Typography color={theme.palette.primary.main} textAlign='center' fontWeight={'bold'}>- Upload contents:</Typography>
                    <Iconify icon={uploadContent === 100 ? IconName.checked : 'eos-icons:loading'} sx={{
                        color: theme.palette.primary.main,
                        fontSize: 20,
                    }} />
                </Stack>

                <Stack spacing={1} justifyContent="flex-start" alignItems={'center'} width='90%' direction={'row'}>
                    <Typography color={theme.palette.primary.main} textAlign='center' fontWeight={'bold'}>- Upload attachments:</Typography>
                    <Iconify icon={progressValue === 100 ? IconName.checked : 'eos-icons:loading'} sx={{
                        color: theme.palette.primary.main,
                        fontSize: 20,
                    }} />
                </Stack>
                {
                    uploadContent === 100 &&
                    <LinearProgressWithLabel value={progressValue || 0} />
                }
                {
                    retryCount > 0 &&
                    <Alert severity="error" sx={{ width: '90%' }}>
                        <AlertTitle>Error:</AlertTitle>
                        {`One or many images have errors while uploading to server, we are trying to re upload it to server. Please do not quit M System application (retrying: ${retryCount})`}
                    </Alert>
                }
            </Stack>
        </Backdrop>
    );
};

export default LoadingBackDrop;



function LinearProgressWithLabel({ value = 0, ...props }) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', width: '90%' }}>
            <Box sx={{ width: '100%', mr: 1 }}>
                <LinearProgress variant="determinate" {...props} value={value} />
            </Box>
            <Box sx={{ minWidth: 35 }}>
                <Typography variant="body2" color="primary.main">{`${value}%`}</Typography>
            </Box>
        </Box>
    );
}