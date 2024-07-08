import { FileSharer } from '@byteowls/capacitor-filesharer';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { Screenshot } from 'capacitor-screenshot';
import { m } from 'framer-motion';
import { useSnackbar } from 'notistack';
import { useEffect, useRef } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { useLastLocation } from 'react-router-dom-last-location';
import {
    useErrorBoundary
} from "react-use-error-boundary";
// @mui
import { Button, Container, Stack, Typography, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
// redux
import { setAppInfo } from '../redux/slices/setting';
import { dispatch, useSelector } from '../redux/store';
// components
import { MotionContainer, varBounce } from '../components/animate';
import Page from '../components/Page';
// Config
import useResponsive from '../hooks/useResponsive';
import uuidv4 from '../utils/uuidv4';
// assets
import { MLogo } from '../assets';
// import { useSelector } from '../redux/store';

// ----------------------------------------------------------------------

const ContentStyle = styled('div')(({ theme }) => ({
    maxWidth: 480,
    margin: 'auto',
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
    padding: theme.spacing(12, 0),
    maxHeight: 600,
}));

// ----------------------------------------------------------------------

export default function ErrorHandler() {

    const theme = useTheme();
    const navigate = useNavigate();
    const mdUp = useResponsive('up', 'md');
    const { state } = useLocation();
    const { enqueueSnackbar } = useSnackbar();
    const { lastLocation } = useLastLocation();
    const imageRef = useRef(null);
    const isWebApp = Capacitor.getPlatform() === 'web';

    const [error, resetError] = useErrorBoundary();
    const { appInfo } = useSelector(store => store.setting);

    useEffect(() => {
        (async () => {
            if (error === null || error === undefined) {
                navigate(localStorage.getItem("lastVisitPage") || -1);
                resetError();
            }
            if (isWebApp) return;
            const info = await App.getInfo();
            dispatch(setAppInfo(info));
        })();
    }, [error])

    const handleScreenCapture = async () => {

        await Screenshot.take().then(({ base64 }) => {
            // or `data:image/png;base64,${ret.base64}`
            const imageData = base64.toString().split(",");
            // console.log(base64, imageData);
            const filename = `M-system-error-${uuidv4()}.png`;
            FileSharer.share({
                filename,
                contentType: 'application/image',
                // If you want to save base64:
                base64Data: imageData[1] || base64.toString().replace('data:image/png;base64,', ''),
                // base64Data: imageData[1],
                // If you want to save a file from a path:
                // path: "../../file.pdf",
            })
                .then(() => {
                    // do sth
                    console.log('done');
                    enqueueSnackbar('Image has been shared!');
                })
                .catch((error) => {
                    console.error('File sharing failed', error.message);
                });
        });

    }

    // console.log(getImage, image)
    // console.log('appInfo', appInfo?.currentVersion);

    return (
        <Page title="Error handler" >
            <Container component={MotionContainer} sx={{ position: mdUp ? 'relative' : 'fixed' }} >
                <ContentStyle sx={{ textAlign: 'center', alignItems: 'center', }}
                    ref={imageRef}
                >
                    <m.div variants={varBounce().in} style={{ marginBottom: 10 }}>
                        <MLogo />
                    </m.div>

                    <m.div variants={varBounce().in}>
                        <Typography variant="h3" paragraph>
                            Opp! Something went wrong
                        </Typography>
                    </m.div>

                    <m.div variants={varBounce().in} style={{
                        width: '100%', marginBottom: 10, marginTop: 10, overflowY: 'scroll', overflowX: 'hidden', maxHeight: 600, minHeight: 200
                    }} >

                        {!isWebApp &&
                            <Typography variant="body2" paragraph width={'100%'}>
                                Version: {appInfo?.version}.{appInfo?.build}
                            </Typography>
                        }

                        <Typography variant="title" paragraph>
                            Error: {state?.error?.message}
                        </Typography>
                        <Typography variant="subtitle" paragraph>
                            Page error: {lastLocation
                                ?.pathname || state?.error?.pathname}
                        </Typography>
                        {state?.error?.componentStack &&
                            <Typography variant="caption" paragraph>
                                Component: {state?.error?.componentStack}
                            </Typography>
                        }
                        <Typography variant="body" paragraph>
                            Please take this screenshot and send to BIS team
                        </Typography>
                    </m.div>

                    <Stack spacing={2}>
                        <Button size="medium" variant="contained"
                            onClick={handleScreenCapture}
                            color='info'
                        >
                            Take screenshot and Share
                        </Button>
                        <Button size="medium" variant="contained"
                            onClick={() => navigate(-1)}
                            color='secondary'
                        >
                            Go Back
                        </Button>
                        <Button to="/home" size="medium" variant="contained" component={RouterLink} >
                            Go to Home
                        </Button>
                    </Stack>
                </ContentStyle>
            </Container>
        </Page >
    );
}
