// @mui
import { Box, Container, Link, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
// layouts
import LogoOnlyLayout from '../../layouts/LogoOnlyLayout';
// components
import Page from '../../components/Page';
// sections
import { NewPasswordForm } from '../../sections/auth/new-password';
// assets
import { SentIcon } from '../../assets';
// Hooks
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
ß
export default function NewPassword() {
  const { translate } = useLocales();
  return (
    <Page title="New Password">
      <LogoOnlyLayout />

      <Container>
        <ContentStyle sx={{ textAlign: 'center' }}>
          <SentIcon sx={{ mb: 5, mx: 'auto', height: 120 }} />

          <Typography variant="h3" gutterBottom>
            {translate('auth.newPW.title')}
          </Typography>

          <Typography sx={{ color: 'text.secondary' }}>{translate('auth.newPW.text')}</Typography>

          <Box sx={{ mt: 5, mb: 3 }}>
            <NewPasswordForm />
          </Box>

          <Typography variant="body2">
            {translate('auth.newPW.noCodeText')} &nbsp;
            <Link variant="subtitle2" onClick={() => {}}>
              {translate('auth.newPW.resendCodeText')}
            </Link>
          </Typography>
        </ContentStyle>
      </Container>
    </Page>
  );
}
