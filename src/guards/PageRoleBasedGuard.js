import { m } from 'framer-motion';
import PropTypes from 'prop-types';
import { useLocation, useNavigate } from 'react-router-dom';
// @mui
import { Button, Container, Typography } from '@mui/material';
// hooks
import useAuth from '../hooks/useAuth';
// import { useAuth } from 'oidc-react';
import useLocales from '../hooks/useLocales';
// components
import { MotionContainer, varBounce } from '../components/animate';
// assets
import { ForbiddenIllustration, MLogo } from '../assets';


// ----------------------------------------------------------------------

PageRoleBasedGuard.propTypes = {
  hasContent: PropTypes.bool,
  roles: PropTypes.arrayOf(PropTypes.string), // Example ['admin', 'leader']
  children: PropTypes.node.isRequired,
};

export default function PageRoleBasedGuard({ hasContent, roles, children }) {
  // Logic here to get current user role
  const { user, userClaim } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { translate } = useLocales();
  const hasPermission = userClaim.find(d => `/${d.ClaimValue}` === location.pathname);

  // useEffect(() => {
  //   const hasPermission = userClaim.find(d => `/${d.ClaimValue}` === location.pathname);
  //   console.log(hasPermission)
  //   if (location.pathname !== '/home' && hasPermission) {
  //     navigate('/permission-denied')
  //   }
  // }, [userClaim, location.pathname])

  // const currentRole = user.currentUser?.roles[0]; // admin;

  // if (typeof roles !== 'undefined' && !roles.includes(currentRole)) {
  //   // return hasContent ? (
  //   //   <Container component={MotionContainer} sx={{ textAlign: 'center' }}>
  //   //     <m.div variants={varBounce().in}>
  //   //       <Typography variant="h3" paragraph>
  //   //         {translate('guard.title')}
  //   //       </Typography>
  //   //     </m.div>

  //   //     <m.div variants={varBounce().in}>
  //   //       <Typography sx={{ color: 'text.secondary' }}> {translate('guard.textDenied')}</Typography>
  //   //     </m.div>

  //   //     <m.div variants={varBounce().in}>
  //   //       <ForbiddenIllustration sx={{ height: 260, my: { xs: 5, sm: 10 } }} />
  //   //     </m.div>
  //   //   </Container>
  //   // ) : null;

  //   return (
  //     <Container component={MotionContainer} sx={{ textAlign: 'center' }}>
  //       <m.div variants={varBounce().in}>
  //         <Typography variant="h3" paragraph>
  //           {translate('guard.title')}
  //         </Typography>
  //       </m.div>

  //       <m.div variants={varBounce().in}>
  //         <Typography sx={{ color: 'text.secondary' }}> {translate('guard.textDenied')}</Typography>
  //       </m.div>

  //       <m.div variants={varBounce().in}>
  //         <ForbiddenIllustration sx={{ height: 260, my: { xs: 5, sm: 10 } }} />
  //       </m.div>
  //     </Container>
  //   );
  // }

  if (location.pathname !== '/home' && !hasPermission) {
    const handleGoBack = () => {
      localStorage.removeItem('lastVisitPage');
      navigate('/home')
    };
    return (
      <Container component={MotionContainer} sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>

        <m.div variants={varBounce().in} style={{ marginBottom: 10 }}>
          <MLogo />
        </m.div>

        <m.div variants={varBounce().in}>
          <Typography variant="h3" paragraph>
            {translate('guard.title')}
          </Typography>
        </m.div>

        <m.div variants={varBounce().in}>
          <Typography sx={{ color: 'text.secondary' }}> {translate('guard.textDenied')}</Typography>
        </m.div>

        <m.div variants={varBounce().in}>
          <ForbiddenIllustration sx={{ height: 260, my: { xs: 5, sm: 10 } }} />
        </m.div>

        <m.div variants={varBounce().in}>
          <Button variant='contained'
            onClick={handleGoBack}
          >Back to home</Button>
        </m.div>

      </Container>
    )
  }


  return <>{children}</>;
}
