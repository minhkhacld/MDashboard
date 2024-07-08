import { FileSharer } from '@byteowls/capacitor-filesharer';
import { Capacitor } from '@capacitor/core';
import { Device } from '@capacitor/device';
import { Toast } from '@capacitor/toast';
import { Screenshot } from 'capacitor-screenshot';
import { m } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import { AppUpdate } from '@capawesome/capacitor-app-update';
import { App } from '@capacitor/app';
// @mui
import { Button, Container, IconButton, Stack, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
// components
import { MotionContainer, varBounce } from '../components/animate';
import Page from '../components/Page';
// assets
// Config
import { MLogo, PageNotFoundIllustration } from '../assets';
import Iconify from '../components/Iconify';
import useResponsive from '../hooks/useResponsive';
import { setAppInfo } from '../redux/slices/setting';
import { dispatch, useSelector } from '../redux/store';
import { PATH_AUTH } from '../routes/paths';
// utils
import useLocales from '../hooks/useLocales';
import {
    writeToClipboard
} from '../utils/appClipboard';
import IconName from '../utils/iconsName';
import uuidv4 from '../utils/uuidv4';

// ----------------------------------------------------------------------

const ContentStyle = styled('div')(({ theme }) => ({
    maxWidth: 480,
    margin: 'auto',
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
    padding: theme.spacing(12, 0),
    maxHeight: 550,
}));

// ----------------------------------------------------------------------

export default function InvalidDevicePage() {

    const imageRef = useRef(null);
    const mdUp = useResponsive('up', 'md');
    const navigate = useNavigate();

    const { LoginUser } = useSelector(store => store.workflow);
    // const { deviceId } = useSelector(store => store.notification);
    const { appInfo } = useSelector(store => store.setting);
    const isWebApp = Capacitor.getPlatform() === 'web';
    const { currentLang } = useLocales();

    // states
    const [deviceId, setDeviceId] = useState(null);

    useEffect(() => {
        (async () => {
            if (isWebApp) return;
            // const result = await AppUpdate.getAppUpdateInfo();
            const info = await App.getInfo();
            const id = await Device.getId();
            setDeviceId(id.identifier)
            dispatch(setAppInfo(info));
        })();
    }, [])

    const handleCopy = async () => {
        if (!isWebApp) {
            const data = await writeToClipboard(deviceId);
            await Toast.show({
                text: 'Device ID copied! Send this to BIS team for device registration',
                duration: 'short',
                position: 'bottom'
            });
        } else {
            navigator.clipboard.writeText(deviceId);
            await Toast.show({
                text: 'Device ID copied! Send this to BIS team for device registration',
                duration: 'short',
                position: 'bottom'
            });
        }
    };

    const handleGoback = () => {
        navigate(PATH_AUTH.login);
    };

    const handleScreenCapture = async () => {

        await Screenshot.take().then(({ base64 }) => {

            // or `data:image/png;base64,${ret.base64}`
            const imageData = base64.toString().split(",");
            // console.log(base64, imageData);
            const filename = `M-system-device-error-${uuidv4()}.png`;
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
                    Toast.show({
                        text: 'Image has been shared!',
                        position: 'bottom',
                        duration: 'short',
                    });
                })
                .catch((error) => {
                    console.error('File sharing failed', error.message);
                });
        });
    };

    // checkClipboard()
    // console.log(
    //     deviceId,
    //     //  JSON.stringify(appInfo);
    // );

    return (
        <Page title="Invalid Device">

            <Container component={MotionContainer} sx={{ position: mdUp ? 'relative' : 'fixed' }}>

                <ContentStyle sx={{ textAlign: 'center', alignItems: 'center' }}
                    ref={ref => { imageRef.current = ref }}
                >

                    <m.div variants={varBounce().in} style={{ marginBottom: 10 }}>
                        <MLogo />
                    </m.div>


                    <m.div variants={varBounce().in}>
                        <PageNotFoundIllustration sx={{ height: 200, my: { xs: 5, sm: 10 } }} />
                    </m.div>


                    <m.div variants={varBounce().in}>
                        <Typography variant="h3" paragraph>
                            {currentLang.value !== 'vn' ? 'Invalid Device ID' : "Không tìm thấy thiết bị"}
                        </Typography>
                    </m.div>


                    <m.div variants={varBounce().in}>

                        {!isWebApp &&
                            <Typography variant="body2" paragraph width={'100%'}>
                                Version: {appInfo?.version}.{appInfo?.build}
                            </Typography>
                        }

                        <Typography variant="body2" paragraph width={'100%'}>
                            User: {LoginUser?.EmpKnowAs} - {LoginUser?.UserId}
                        </Typography>
                        <Stack direction='row' spacing={1}
                            justifyContent='center'
                            alignItems='center'
                            display={'flex'}
                            width={'100%'}
                        >

                            <Typography variant="body2" paragraph sx={{ backgroundColor: theme => theme.palette.grey[300], p: 1, borderRadius: 1 }}>
                                {currentLang.value !== 'vn' ? 'Device ID' : "Số định danh"}: {deviceId}
                            </Typography>

                            <IconButton onClick={handleCopy}>
                                <Iconify icon={IconName.copy} />
                            </IconButton>
                        </Stack>

                    </m.div>

                    <m.div variants={varBounce().in} style={{ width: '100%', marginBottom: 10, marginTop: 10 }}>
                        <Typography variant="body2" paragraph>
                            {currentLang.value !== 'vn' ? 'Your device is not registered in M System mobile, please contact to BIS team for further information!' : "Thiết bị của bạn chưa được đăng ký, vui lòng liên hệ BIS team để biết thêm thông tin!"}
                        </Typography>
                    </m.div>

                    <m.div>
                        <Stack direction={'row'} width='100%' justifyContent={'space-evenly'} alignItems='center' spacing={2}>
                            <Button color='info' variant='outlined' onClick={handleGoback}>Go back</Button>
                            <Button size="medium" variant="outlined"
                                onClick={handleScreenCapture}
                                color='error'
                            >
                                {currentLang.value !== 'vn' ? 'Share Screenshot' : 'Chia sẻ màn hình'}
                            </Button>
                        </Stack>
                    </m.div>

                </ContentStyle>
            </Container>
        </Page >
    );
}
