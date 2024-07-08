import PropTypes from 'prop-types';
import { m } from 'framer-motion';
// import { useLocation, useNavigate } from 'react-router-dom';
// @mui
import { Container, Typography } from '@mui/material';
// hooks
import useAuth from '../hooks/useAuth';
// import { useAuth } from 'oidc-react';
import useLocales from '../hooks/useLocales';
// components
import { MotionContainer, varBounce } from '../components/animate';
// assets
import { ForbiddenIllustration } from '../assets';


// ----------------------------------------------------------------------

RoleBasedGuard.propTypes = {
  hasContent: PropTypes.bool,
  roles: PropTypes.arrayOf(PropTypes.string), // Example ['admin', 'leader']
  children: PropTypes.node.isRequired,
};

export default function RoleBasedGuard({ hasContent, roles, children }) {
  // Logic here to get current user role
  const { user, userClaim } = useAuth();
  // const auth = useAuth();
  // const navigate = useNavigate();
  // const location = useLocation();
  const { translate } = useLocales();
  // const hasPermission = userClaim.find(d => `/${d.ClaimValue}` === location.pathname)
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

  // if (location.pathname !== '/home' && !hasPermission) {



  return <>{children}</>;
}
