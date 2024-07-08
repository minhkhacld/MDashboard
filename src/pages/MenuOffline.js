import { Network } from '@capacitor/network';
import { m } from 'framer-motion';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
// @mui
import { Box, Button, Container, Grid, Stack, Typography, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
// components
import Page from '../components/Page';
import { MotionContainer, varBounce } from '../components/animate';
// assets
import { MLogo } from '../assets';
import Iconify from '../components/Iconify';
// import logo from '../assets/images/motive_logo.png';
// Config
import useIsOnline from '../hooks/useIsOnline';
import useResponsive from '../hooks/useResponsive';
import { setOfflineMode } from '../redux/slices/setting';
import { dispatch } from '../redux/store';
import { PATH_APP } from '../routes/paths';

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

export default function MenuOffline() {
  const theme = useTheme();
  const navigate = useNavigate();
  const mdUp = useResponsive('up', 'md')
  const { online } = useIsOnline()
  const { enqueueSnackbar } = useSnackbar()
  const handleNavigate = (route) => {
    navigate(route);
  };


  const handleBackToOnline = async () => {
    const status = await Network.getStatus();
    console.log('Network status:', JSON.stringify(status));
    if (!status.connected) {
      return enqueueSnackbar('No internet connection. Please connect to internet and try again!', {
        variant: 'info',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center'
        }
      })
    }
    dispatch(setOfflineMode(!online))
    navigate(PATH_APP.general.app)
  }

  return (
    <Page title="Offline mode">
      <Container component={MotionContainer} sx={{ position: mdUp ? 'relative' : 'fixed' }}>

        <ContentStyle sx={{ textAlign: 'center', alignItems: 'center' }}>

          <m.div variants={varBounce().in} style={{ marginBottom: 50 }}>
            <MLogo />
          </m.div>

          <m.div variants={varBounce().in}>
            <Typography variant="h3" paragraph>
              M-System Offline Mode
            </Typography>
          </m.div>

          <m.div variants={varBounce().in} style={{ width: '100%', marginBottom: 20, marginTop: 20 }}>
            <Stack
              direction={{
                xs: 'column',
                sm: 'column',
                md: 'row',
              }}
              width="100%"
              justifyContent="center"
              alignItems="center"
            >
              <Grid container spacing={3}>
                <Grid item xs={12} sm={12} md={4}>
                  <Stack width={'100%'} minHeight={100} justifyContent="center" alignItems="center">
                    <Box
                      borderRadius={1}
                      bgcolor={theme.palette.primary.main}
                      width={90}
                      height={90}
                      justifyContent="center"
                      alignItems={'center'}
                      display="flex"
                      flexDirection={'column'}
                      p={2}
                      onClick={() => handleNavigate(PATH_APP.qc.inspection.root)}
                    >
                      <Iconify
                        icon={'icon-park-outline:inspection'}
                        sx={{
                          fontSize: {
                            xs: 45,
                            md: 70,
                          },
                          color: 'white',
                        }}
                      />
                      <Typography variant="subtitle2" color={'white'}>
                        QC
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={12} md={4}>
                  <Stack width={'100%'} minHeight={100} justifyContent="center" alignItems="center">
                    <Box
                      borderRadius={1}
                      bgcolor={theme.palette.primary.main}
                      width={90}
                      height={90}
                      justifyContent="center"
                      alignItems={'center'}
                      display="flex"
                      flexDirection={'column'}
                      p={2}
                      onClick={() => handleNavigate(PATH_APP.compliance.audit.root)}
                    >
                      <Iconify
                        icon={'grommet-icons:compliance'}
                        sx={{
                          fontSize: {
                            xs: 45,
                            md: 70,
                          },
                          color: 'white',
                        }}
                      />
                      <Typography variant="subtitle2" color={'white'}>
                        Compliance
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={12} md={4}>
                  <Stack width={'100%'} minHeight={100} justifyContent="center" alignItems="center">
                    <Box
                      borderRadius={1}
                      bgcolor={theme.palette.primary.main}
                      width={90}
                      height={90}
                      justifyContent="center"
                      alignItems={'center'}
                      display="flex"
                      flexDirection={'column'}
                      p={2}
                      onClick={() => handleNavigate(PATH_APP.mqc.root)}
                    >
                      <Iconify
                        icon={'material-symbols:playlist-add-check-circle-outline'}
                        sx={{
                          fontSize: {
                            xs: 45,
                            md: 70,
                          },
                          color: 'white',
                        }}
                      />
                      <Typography variant="subtitle2" color={'white'}>
                        MQC
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
              </Grid>
            </Stack>
          </m.div>

          <m.div variants={varBounce().in}>
            <Typography sx={{ color: 'text.secondary' }}>
              In offline mode, all data will be stored temporary on your devices. Please upload it when internet
              connection was restored!
            </Typography>
          </m.div>

          <Button onClick={handleBackToOnline} variant='contained' color='info' sx={{ mt: 2 }}>
            <Typography sx={{ color: 'white' }}>
              Switch to online
            </Typography>
          </Button>

        </ContentStyle>
      </Container>
    </Page >
  );
}
