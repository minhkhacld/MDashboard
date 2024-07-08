import { Capacitor } from '@capacitor/core';
import { Toast } from '@capacitor/toast';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import * as Yup from 'yup';
// form
import { yupResolver } from '@hookform/resolvers/yup';
import { NativeBiometric } from 'capacitor-native-biometric';
import { useForm } from 'react-hook-form';
// @mui
import { Browser } from '@capacitor/browser';
import { LoadingButton } from '@mui/lab';
import {
  Alert,
  Box, Button,
  CircularProgress, Container,
  IconButton,
  InputAdornment,
  Stack,
  styled,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import Iconify from '../../components/Iconify';
import useAuth from '../../hooks/useAuth';
import useIsMountedRef from '../../hooks/useIsMountedRef';
import useLocales from '../../hooks/useLocales';
// components
import { FormProvider, RHFTextField } from '../../components/hook-form';
import CenterLogo from './Logo';
import Paticaljs from './Particaljs';


const OverLay = styled('div')(({ theme }) => ({
  zIndex: -1,
  position: 'absolute',
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
  height: '100vh',
  width: '100vw',
  // background: `linear-gradient(150deg, rgba(255,255,255,0.9192051820728291) 0%, rgba(20,20,19,0.17130602240896353) 25%, rgba(20,20,19,0.258140756302521) 100%)`,
}));

const EbsLogin = () => {
  const { login, message, isLoading } = useAuth();
  const theme = useTheme();
  const onlyXs = useMediaQuery(theme.breakpoints.only('xs'));
  const isMountedRef = useIsMountedRef();
  const location = useLocation();
  const { translate } = useLocales();
  const isWebApp = Capacitor.getPlatform() === 'web';

  const [showPassword, setShowPassword] = useState(false);
  const [sending, setSending] = useState('');
  const [hasCredential, setHasCredential] = useState(false);
  const [disableLoggin, setDisableLogin] = useState(false);

  const fullWindowHeight = window.innerHeight;

  const getCredentials = async () => {
    try {
      const storeBiometric = window.localStorage.getItem('isGrantBiometric');
      // console.log('storeBiometric', storeBiometric);
      if (storeBiometric !== null && storeBiometric !== undefined) {
        setHasCredential(true);
      }
      const credentials = await NativeBiometric.getCredentials({
        server: process.env.REACT_APP_STS_AUTHORITY,
      });

      if (credentials?.username && credentials?.password) {
        setValue('username', credentials?.username);
      }
    } catch (error) {
      console.error(error);
      setHasCredential(false);
    }
  };

  useEffect(() => {
    if (!isWebApp) {
      getCredentials();
    }
    if (isWebApp) {
      const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
      const isSamsungBrowser = navigator.userAgent.indexOf('SamsungBrowser') > -1;
      const isOpera = window.navigator.userAgent.indexOf('OPR') > -1 || window.navigator.userAgent.indexOf('Opera') > -1;
      // const isEdge = window.navigator.userAgent.indexOf('Edg') > -1;
      if (isSamsungBrowser || isFirefox || isOpera
        // || isEdge
      ) {
        alert('This brower does not work well with some app features. Please download Chrome or Safari and use it instead!');
        setDisableLogin(true);
      }
    }
  }, []);

  const isEmailValidator = (value) => {
    const re =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(value).toLowerCase());
  };

  const LoginSchema = Yup.object().shape({
    username: Yup.string()
      .email(translate('formValidate.invalidMailFormat'))
      .required(translate('formValidate.mailIsRequired'))
      .test(
        'is-valid',
        (message) => `${message.path} is invalid`,
        (value) => (value ? isEmailValidator(value) : new Yup.ValidationError('Invalid value'))
      ),
    password: Yup.string().required(translate('formValidate.passwordIsRequired')),
    // ...(isWebApp && { reCaptcha: Yup.string().required('Captcha is required') }),
  });

  const defaultValues = {
    username: '',
    password: '',
    remember: true,
    reCaptcha: '',
  };

  const methods = useForm({
    resolver: yupResolver(LoginSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    setError,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting, },
  } = methods;

  const values = watch();

  const setCredentials = async (username, password) => {
    if (Capacitor.getPlatform() === 'web') return;
    const storeBiometric = window.localStorage.getItem('isGrantBiometric');
    if (storeBiometric !== null && storeBiometric !== undefined) {
      await NativeBiometric.deleteCredentials({
        server: process.env.REACT_APP_STS_AUTHORITY,
      }).then((res) => {
        NativeBiometric.setCredentials({
          username,
          password,
          server: process.env.REACT_APP_STS_AUTHORITY,
        }).then((res) => console.log('replace result', res));
      });
    } else {
      await NativeBiometric.setCredentials({
        username,
        password,
        server: process.env.REACT_APP_STS_AUTHORITY,
      }).then((res) => console.log('add new result', res));
    }
  };

  const onSubmit = async (data) => {
    try {
      await login(data.username, data.password, location?.pathname).then(() => {
        if (Capacitor.getPlatform() !== 'web') {
          setCredentials(data.username, data.password);
        }
      });
    } catch (error) {
      console.error(error);
      reset();
      if (isMountedRef.current) {
        setError('afterSubmit', { ...error, message: error?.message || error?.error_description });
      }
    }
  };

  const onChange = (value) => {
    setValue('reCaptcha', value);
  };

  const hadleUseBiometric = async () => {

    const result = await NativeBiometric.isAvailable();

    if (!result.isAvailable) {
      return Toast.show({
        text: 'Login via biometric method was not setup',
      });
    }

    const verified = await NativeBiometric.verifyIdentity({
      reason: 'For easy log in',
      title: 'Log in',
      subtitle: 'Login via biometric method',
      description: 'M System will use your credential for user identification',
    })
      .then(() => true)
      .catch(() => false);

    if (!verified) return;

    try {
      const credentials = await NativeBiometric.getCredentials({
        server: process.env.REACT_APP_STS_AUTHORITY,
      });

      if (credentials?.username && credentials?.password) {
        setValue('username', credentials?.username);
        setValue('password', credentials?.password);
        // await login(credentials?.username, credentials?.password, location?.pathname);
        handleSubmit(onSubmit(credentials));
      } else {
        await Toast.show({
          text: 'Credential not found!',
        });
      };
    } catch (error) {
      console.error(error)
      await Toast.show({
        text: JSON.stringify(error),
      });
    }
  };

  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        overFlow: 'hidden',
        height: '100%',
        position: 'fixed',
      }}
    >
      <Container maxWidth="xs">
        <Paticaljs />
        <OverLay />
        <Box sx={{ borderRadius: 1, boxShadow: '1px 1px 20px 1px black, -1px -1px 20px 1px black' }}>

          <Box
            spacing={4}
            sx={{
              px: 2,
              py: 5,
              backgroundColor: 'rgb(44,52,57,0.8)',
              borderRadius: 1,
            }}
          >

            <Stack direction="column" display={'flex'} alignItems="center" mb={4} justifyContent="center" spacing={2}>
              <Box
                sx={{
                  flexGrow: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  display: 'flex',
                  width: '100%',
                }}
              >
                <CenterLogo />
              </Box>
              <Typography variant="h4" color="white">
                M System
              </Typography>
            </Stack>

            <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
              <Stack spacing={4}>
                {message !== null && message !== undefined && <Alert severity="error">{message}</Alert>}
                {disableLoggin && (
                  <Alert severity="error">
                    {'The app does not support on this browser, please use Chrome or Safari instead!'}
                  </Alert>
                )}
                <RHFTextField
                  name="username"
                  label={translate('userName')}
                  size={onlyXs ? 'medium' : 'large'}
                  type="email"
                  fontWeight="bold"
                  fontSize={14}
                  autoFocus={false}
                  InputLabelProps={{
                    style: {
                      fontWeight: 'bold',
                      fontSize: 18,
                      transform: 'translate(12px, 5px) scale(0.75)',
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconButton edge="start">
                          <Iconify icon={'mdi:user'} sx={{ fontSize: 22 }} />
                        </IconButton>
                      </InputAdornment>
                    ),
                    autoComplete: 'email',
                  }}
                  sx={{
                    '& .MuiFilledInput-root': {
                      backgroundColor: 'white',
                      borderRadius: 1,
                    },
                    '& .MuiFilledInput-root:hover': {
                      backgroundColor: 'white',
                      // Reset on touch devices, it doesn't add specificity
                      '@media (hover: none)': {
                        backgroundColor: 'white',
                      },
                    },
                    '& .MuiFilledInput-root.Mui-focused': {
                      backgroundColor: 'white',
                    },
                  }}
                  variant="filled"
                />

                <RHFTextField
                  name="password"
                  label={translate('password')}
                  type={showPassword ? 'text' : 'password'}
                  size={onlyXs ? 'medium' : 'large'}
                  autoFocus={false}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconButton edge="start">
                          <Iconify icon={'mdi:password'} sx={{ fontSize: 22 }} />
                        </IconButton>
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                          <Iconify
                            icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'}
                            sx={{
                              color: showPassword ? theme.palette.primary.main : 'var(--icon)',
                            }}
                          />
                        </IconButton>
                      </InputAdornment>
                    ),
                    autoComplete: 'current-password',
                  }}
                  InputLabelProps={{
                    style: {
                      fontWeight: 'bold',
                      fontSize: 18,
                      transform: 'translate(12px, 5px) scale(0.75)',
                    },
                  }}
                  sx={{
                    '& .MuiFilledInput-root': {
                      backgroundColor: 'white',
                      borderRadius: 1,
                    },
                    '& .MuiFilledInput-root:hover': {
                      backgroundColor: 'white',
                      // Reset on touch evices, it doesn't add specificity
                      '@media (hover: none)': {
                        backgroundColor: 'white',
                      },
                    },
                    '& .MuiFilledInput-root.Mui-focused': {
                      backgroundColor: 'white',
                    },
                  }}
                  variant="filled"
                />
              </Stack>

              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ my: 2 }}>
                <Button
                  component='div'
                  onClick={() => {
                    Browser.open({ url: `${process.env.REACT_APP_STS_AUTHORITY}/Account/ForgotPassword` })
                  }}
                > {translate('auth.login.forgotPW')}</Button>

              </Stack>

              <Box mt={4}>
                <Stack direction="row" width={'100%'} justifyContent="center" alignItems={'center'} p={0} m={0}>
                  {isWebApp ? (
                    <LoadingButton
                      fullWidth
                      size="large"
                      type="submit"
                      variant="contained"
                      loading={isSubmitting}
                      disabled={
                        // values.reCaptcha === '' ||
                        values.username === '' || values.password === '' || isSubmitting || disableLoggin
                      }
                      sx={{
                        '&.Mui-disabled': {
                          background: theme.palette.info.main,
                          color: 'white',
                        },
                        borderRadius: 50,
                        flex: 1,
                        height: 50,
                      }}
                      startIcon={isSubmitting ? <CircularProgress color="warning" size={16} /> : null}
                    >
                      {translate('button.login')}
                    </LoadingButton>
                  ) : (
                    <Stack
                      direction={'row'}
                      justifyContent="center"
                      alignItems={'center'}
                      sx={{
                        borderRadius: 50,
                        background: theme.palette.info.dark,
                      }}
                      width="100%"
                      height={50}
                    >

                      <LoadingButton
                        fullWidth={!hasCredential}
                        size="large"
                        type="submit"
                        variant="contained"
                        loading={isSubmitting}
                        disabled={values.username === '' || values.password === '' || isSubmitting}
                        sx={{
                          '&.Mui-disabled': {
                            background: theme.palette.info.main,
                            color: 'white',
                          },
                          ...(hasCredential
                            ? {
                              borderTopLeftRadius: 50,
                              borderBottomLeftRadius: 50,
                              borderTopRightRadius: 0,
                              borderBottomRightRadius: 0,
                            }
                            : { borderRadius: 50 }),
                          flex: 1,
                          height: 50,
                        }}
                        loadingIndicator={<CircularProgress color="warning" size={16} />}
                        loadingPosition="start"
                      >
                        {translate('button.login')}
                      </LoadingButton>

                      {hasCredential && (
                        <Box
                          sx={{
                            backgroundColor: 'white',
                            height: '100%',
                            width: 60,
                            justifyContent: 'center',
                            alignItems: 'center',
                            display: 'flex',
                            borderTopLeftRadius: 0,
                            borderBottomLeftRadius: 0,
                            borderTopRightRadius: 50,
                            borderBottomRightRadius: 50,
                          }}
                        >
                          <IconButton
                            sx={{
                              width: 40,
                              height: 40,
                              backgroundColor: theme.palette.grey[300],
                            }}
                            onClick={hadleUseBiometric}
                          >
                            <Iconify icon={'ion:finger-print'} sx={{ color: theme.palette.primary.main }} />
                          </IconButton>
                        </Box>
                      )}
                    </Stack>
                  )}
                </Stack>
              </Box>

            </FormProvider>
          </Box>
        </Box>
      </Container>
    </div>
  );
};

export default EbsLogin;
