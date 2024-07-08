import { useSnackbar } from 'notistack';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import * as Yup from 'yup';
// form
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
// @mui
import { LoadingButton } from '@mui/lab';
import { IconButton, InputAdornment, Stack } from '@mui/material';
// routes
import { PATH_AUTH } from '../../../routes/paths';
// components
import { FormProvider, RHFTextField } from '../../../components/hook-form';
import Iconify from '../../../components/Iconify';
// Hooks
import useLocales from '../../../hooks/useLocales';
// axios
import axios from '../../../utils/axios';

// ----------------------------------------------------------------------

export default function NewPasswordForm() {
  const navigate = useNavigate();
  const { translate } = useLocales();
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId');
  const resetToken = searchParams.get('resetToken');

  const { enqueueSnackbar } = useSnackbar();

  const [showPassword, setShowPassword] = useState(false);

  // const emailRecovery = sessionStorage.getItem('email-recovery');

  const VerifyCodeSchema = Yup.object().shape({
    // code1: Yup.string().required('Code is required'),
    // code2: Yup.string().required('Code is required'),
    // code3: Yup.string().required('Code is required'),
    // code4: Yup.string().required('Code is required'),
    // code5: Yup.string().required('Code is required'),
    // code6: Yup.string().required('Code is required'),
    // email: Yup.string().email('Email must be a valid email address').required('Email is required'),
    password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    confirmPassword: Yup.string()
      .required('Confirm password is required')
      .oneOf([Yup.ref('password'), null], 'Passwords must match'),
  });

  const defaultValues = {
    password: '',
    confirmPassword: '',
  };

  const methods = useForm({
    mode: 'all',
    resolver: yupResolver(VerifyCodeSchema),
    defaultValues,
  });

  const {
    // control,
    // setValue,
    handleSubmit,
    formState: {
      isSubmitting,
      // errors
    },
  } = methods;

  const onSubmit = async (data) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const response = await axios.post(`/api/account/reset-password`, {
        userId,
        resetToken,
        password: data.password,
      });
      if (response) {
        sessionStorage.removeItem('email-recovery');
        enqueueSnackbar('Đổi mật khẩu thành công!');
        navigate(PATH_AUTH.login);
      }
    } catch (error) {
      console.error(error);
      if (error.error.message.includes('Passwords must have at least one non alphanumeric character')) {
        enqueueSnackbar('Mật khẩu phải bao gồm số, ký tự đặt biệt và ký tự in hoa', {
          variant: 'error',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'center',
          },
        });
      } else {
        enqueueSnackbar('Đã xảy ra lỗi', {
          variant: 'error',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'center',
          },
        });
      }
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        <RHFTextField
          name="password"
          label={translate('password')}
          type={showPassword ? 'text' : 'password'}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <RHFTextField
          name="confirmPassword"
          label={translate('confirmNewPW')}
          type={showPassword ? 'text' : 'password'}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <LoadingButton fullWidth size="large" type="submit" variant="contained" loading={isSubmitting} sx={{ mt: 3 }}>
          {translate('button.changePW')}
        </LoadingButton>
      </Stack>
    </FormProvider>
  );
}
