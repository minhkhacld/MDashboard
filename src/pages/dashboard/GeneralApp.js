import { ThemeDetection, ThemeDetectionResponse } from '@awesome-cordova-plugins/theme-detection';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
// @mui
import { Box, Container, Grid, Stack } from '@mui/material';
// hooks
import useLocales from '../../hooks/useLocales';
import useSettings from '../../hooks/useSettings';
// components
import Page from '../../components/Page';
// Redux
// config
import ApplicationImage from '../../components/ApplicationImage';
import HomeIntro from '../../components/HomeIntro';
import useIsOnline from '../../hooks/useIsOnline';
// ----------------------------------------------------------------------

export const setDarkStatusbar = async () => {
  const isAndroid = Capacitor.getPlatform() === 'android';
  const isWebApp = Capacitor.getPlatform() === 'web';
  if (isWebApp) return;

  await ThemeDetection.isAvailable()
    .then((res: ThemeDetectionResponse) => {
      // console.log('ThemeDetectionResponse', res)
      if (res.value) {
        ThemeDetection.isDarkModeEnabled().then(async (response: ThemeDetectionResponse) => {
          console.log('isDarkMode', response)
          // if darkmode
          if (response.value) {
            document.body.style.backgroundColor = '#FFFFFF';
            // eslint-disable-next-line
            if (isAndroid) {
              // await StatusBar.setBackgroundColor({ color: '#36414B' });
              await StatusBar.setStyle({ style: Style.Dark });
              await StatusBar.setBackgroundColor({ color: "#000000".toString() });
            } else {
              await StatusBar.setStyle({ style: Style.Dark });
            }
          } else {
            // eslint-disable-next-line
            if (isAndroid) {
              await StatusBar.setStyle({ style: Style.Light });
              await StatusBar.setBackgroundColor({ color: "#FFFFFF".toString() });
            } else {
              await StatusBar.setStyle({ style: Style.Light });

            }
          }
        })
          .catch((error) => console.error(error));
      }
    })
    .catch((error) => console.error(error));
};

export default function GeneralApp() {
  // Hooks
  // const theme = useTheme();
  const { translate } = useLocales();
  const { themeStretch } = useSettings();
  const { online } = useIsOnline();

  return (
    <Page title={translate('home')}>
      <Container maxWidth={themeStretch ? false : 'xl'} sx={{ position: 'fixed' }}>
        <WaveAnimation />
        <Stack display="flex" justifyContent="center" alignItems="center" sx={{ height: '100%', }}>
          <Grid container spacing={1}>
            <Grid item xs={12} md={12} lg={5}>
              <HomeIntro />
            </Grid>
            <Grid item xs={12} md={12} lg={7}>
              <ApplicationImage />
            </Grid>
          </Grid>
        </Stack>
      </Container>
    </Page>
  );
}

const WaveAnimation = () => {
  return (
    <Box
      sx={{
        position: 'fixed',
        zIndex: -1,
        left: 0,
        bottom: 0,
        right: 0,
        top: 0,
        opacity: 0.7,
      }}
    >
      <svg
        className="waves"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        viewBox="0 24 150 28"
        preserveAspectRatio="none"
        shapeRendering="auto"
      >
        <defs>
          <path id="gentle-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
        </defs>
        <g className="parallax">
          <use xlinkHref="#gentle-wave" x="48" y="0" fill="#212b3694" />
          <use xlinkHref="#gentle-wave" x="48" y="3" fill="#212b36e0" />
          <use xlinkHref="#gentle-wave" x="48" y="5" fill="#212b36a9" />
          <use xlinkHref="#gentle-wave" x="48" y="7" fill="#212b3642" />
        </g>
      </svg>
    </Box>
  );
};
