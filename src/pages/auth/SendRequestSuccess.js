// @mui
import { LoadingButton } from '@mui/lab';
import { Container, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useLocation, useNavigate } from 'react-router-dom';
// layouts
import LogoOnlyLayout from '../../layouts/LogoOnlyLayout';
// components
import Page from '../../components/Page';
// sections

import { PATH_AUTH } from '../../routes/paths';

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

export default function SendRequestSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  const handleGoback = () => {
    navigate(PATH_AUTH.login);
  };

  return (
    <Page title="Verify Code">
      <LogoOnlyLayout />

      <Container>
        <ContentStyle sx={{ textAlign: 'center' }}>
          <Typography variant="h3" paragraph>
            Gửi yêu cầu thành công!
          </Typography>

          <Typography sx={{ color: 'text.secondary' }}>
            Chúng tôi đã gửi đường link cập nhật lại mật khẩu đến email <strong>{email}</strong>. Vui lòng kiểm tra hộp
            thư của bạn!
          </Typography>
          <LoadingButton fullWidth size="large" type="submit" variant="contained" sx={{ mt: 2 }} onClick={handleGoback}>
            Trở về
          </LoadingButton>
        </ContentStyle>
      </Container>
    </Page>
  );
}
