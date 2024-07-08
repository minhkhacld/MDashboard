import { Link as RouterLink } from 'react-router-dom';
// @mui
import { Button, Container, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
// layouts
import LogoOnlyLayout from '../../layouts/LogoOnlyLayout';
// routes
import { PATH_AUTH } from '../../routes/paths';
// components
import Page from '../../components/Page';
// sections
import { ResetPasswordForm } from '../../sections/auth/reset-password';
// Hoooks
import useLocales from '../../hooks/useLocales';
// ----------------------------------------------------------------------

const ContentStyle = styled('div')(({ theme }) => ({
  maxWidth: 480,
  margin: 'auto',
  minHeight: '100vh',
  display: 'flex',
  justifyContent: 'center',
  flexDirection: 'column',
  padding: theme.spacing(12, 0),
}));

// ----------------------------------------------------------------------

export default function ResetPassword() {
  const { translate } = useLocales();
  return (
    <Page title="Reset Password">
      <LogoOnlyLayout />

      <Container>
        <ContentStyle sx={{ textAlign: 'center' }}>

          <Typography variant="h3" paragraph>
            {translate('auth.resetPW.title')}
          </Typography>

          <Typography sx={{ color: 'text.secondary', mb: 5 }}>{translate('auth.resetPW.text')}</Typography>

          <ResetPasswordForm />

          {/* <button onClick={() => {
            // window.location.replace("intent://instagram.com/#Intent;scheme=https;package=com.motivesvn.reactjsebs;end" || "M System://" || "https://apps.apple.com/us/app/m-system/id6445936927");
            window.location.href = "mailto:address@evanpham@motivevn.com?body=yourBody"
          }}>Send Mail</button> */}

          <Button fullWidth size="large" component={RouterLink} to={PATH_AUTH.login} sx={{ mt: 1 }}>
            {translate('button.goBack')}
          </Button>
        </ContentStyle>
      </Container>
    </Page>
  );
}
