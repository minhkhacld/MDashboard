// import { capitalCase } from 'change-case';
// // @mui
// import { Box, Card, Container, Stack, Tooltip, Typography } from '@mui/material';
// import { styled } from '@mui/material/styles';
// // routes
// // hooks
// import useAuth from '../../hooks/useAuth';
// import useLocales from '../../hooks/useLocales';
// import useResponsive from '../../hooks/useResponsive';
// // components
// import Image from '../../components/Image';
// import Logo from '../../components/Logo';
// import Page from '../../components/Page';
// // sections
// import { LoginForm } from '../../sections/auth/login';
// import Paticaljs from './Particaljs';
// // ----------------------------------------------------------------------

// const RootStyle = styled('div')(({ theme }) => ({
//   [theme.breakpoints.up('md')]: {
//     display: 'flex',
//   },
//   backgroundColor: 'transparent',
// }));

// const HeaderStyle = styled('header')(({ theme }) => ({
//   top: 0,
//   zIndex: 9,
//   lineHeight: 0,
//   width: '100%',
//   display: 'flex',
//   alignItems: 'center',
//   position: 'absolute',
//   padding: theme.spacing(3),
//   justifyContent: 'space-between',
//   [theme.breakpoints.up('md')]: {
//     alignItems: 'flex-start',
//     padding: theme.spacing(7, 5, 0, 7),
//   },
// }));

// const SectionStyle = styled(Card)(({ theme }) => ({
//   width: '100%',
//   maxWidth: 464,
//   display: 'flex',
//   flexDirection: 'column',
//   justifyContent: 'center',
//   margin: theme.spacing(2, 0, 2, 2),
// }));

// const ContentStyle = styled('div')(({ theme }) => ({
//   maxWidth: 480,
//   margin: 'auto',
//   minHeight: '100vh',
//   display: 'flex',
//   justifyContent: 'center',
//   flexDirection: 'column',
//   padding: theme.spacing(12, 0),
// }));

// // ----------------------------------------------------------------------

// export default function Login() {
//   const { method } = useAuth();
//   const { translate } = useLocales();

//   const mdUp = useResponsive('up', 'md');

//   const onRecaptchaSuccess = (e) => {
//     document.getElementById('g-recaptcha-response-manual').value = e;
//     // console.log('capcha Token', e)
//   };

//   return (
//     <Page title="Login">
//       <RootStyle>
//         {/* <Paticaljs /> */}
//         <HeaderStyle>
//           <Logo />
//           {/* {smUp && (
//             <Typography variant="body2" sx={{ mt: { md: -2 } }}>
//               Don’t have an account? {''}
//               <Link variant="subtitle2" component={RouterLink} to={PATH_AUTH.register}>
//                 Get started
//               </Link>
//             </Typography>
//           )} */}
//         </HeaderStyle>

//         {mdUp && (
//           <SectionStyle>
//             <Typography variant="h3" sx={{ px: 5, mt: 5, mb: 5 }}>
//               {translate('auth.login.bigTitle')}
//             </Typography>
//             <Image
//               visibleByDefault
//               disabledEffect
//               src="/assets/illustrations/illustration_login.png"
//               alt="login"
//               className="logo-icon"
//             />
//           </SectionStyle>
//         )}

//         <Container maxWidth="sm">
//           <ContentStyle>
//             <Stack direction="row" alignItems="center" sx={{ mb: 5 }}>
//               <Box sx={{ flexGrow: 1 }}>
//                 <Typography variant="h4" gutterBottom>
//                   {translate('auth.login.title')}
//                 </Typography>
//                 <Typography sx={{ color: 'text.secondary' }}> {translate('auth.login.text')}</Typography>
//               </Box>

//               <Tooltip title={capitalCase(method)} placement="right">
//                 <>
//                   <Image
//                     disabledEffect
//                     src={`https://minimal-assets-api-dev.vercel.app/assets/icons/auth/ic_${method}.png`}
//                     sx={{ width: 32, height: 32 }}
//                     className="feature-icon"
//                   />
//                 </>
//               </Tooltip>
//             </Stack>

//             {/* <Alert severity="info" sx={{ mb: 3 }}>
//               Use email : <strong>gagole</strong> / password :<strong> Lename1987@</strong>
//             </Alert> */}

//             <LoginForm />
//             <div
//               className="g-recaptcha"
//               data-sitekey={'6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'}
//               data-callback="onRecaptchaSuccess"
//               data-expired-callback="onRecaptchaResponseExpiry"
//               data-error-callback="onRecaptchaError"
//             />
//             <textarea id="g-recaptcha-response-manual" name="g-recaptcha-response" />

//             {/* {!smUp && (
//               <Typography variant="body2" align="center" sx={{ mt: 3 }}>
//                 Don’t have an account?{' '}
//                 <Link variant="subtitle2" component={RouterLink} to={PATH_AUTH.register}>
//                   Get started
//                 </Link>
//               </Typography>
//             )} */}
//           </ContentStyle>
//         </Container>
//       </RootStyle>
//     </Page>
//   );
// }
