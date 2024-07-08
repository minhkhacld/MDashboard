import { useSnackbar } from 'notistack';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
// axios
import axios from 'axios';
// form
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
// @mui
import { LoadingButton } from '@mui/lab';
import { Stack, Alert } from '@mui/material';
// routes
import { PATH_AUTH } from '../../../routes/paths';
// components
import { FormProvider, RHFTextField } from '../../../components/hook-form';

// Hooks
import useLocales from '../../../hooks/useLocales';

// ----------------------------------------------------------------------

export default function ResetPasswordForm() {
  const navigate = useNavigate();
  const { translate } = useLocales();
  const { enqueueSnackbar } = useSnackbar();

  const [error, setError] = useState(null)

  const ResetPasswordSchema = Yup.object().shape({
    email: Yup.string().email('Email must be a valid email address').required('Email is required'),
  });

  const methods = useForm({
    resolver: yupResolver(ResetPasswordSchema),
    defaultValues: { email: 'example@motivesvn.com' },
  });

  const {
    handleSubmit,
    formState: { isSubmitting, },
  } = methods;

  const onSubmit = async (data) => {
    try {
      setError(null)
      await new Promise((resolve) => setTimeout(resolve, 500));
      const formData = new FormData()
      formData.append('Email', data.email)
      formData.append('__RequestVerificationToken', 'CfDJ8OEbfrk2ibpHsVirtIxGi1VUScKEIGPspxN1iM1rZDek1j_kznnxKAmhthEN9DcO82tog_-IwJ9oFaNpHEGr8imr2FzvqrUSzOb8IvEGdXO5Pvor6dFWrqRM_vo6IzkrOinBwHgQlMYtXt7K8zvoMJQ')
      const response = await axios.post(`https://sto.motivesfareast.com:5050/Account/ForgotPassword`,
        // {
        //   Email: data.email,
        //   // appName: 'ReactJS',
        // }
        formData
      );
      if (response) {
        sessionStorage.setItem('email-recovery', data.email);
        navigate(PATH_AUTH.sendRequest, { state: { email: data.email } });
      }
    } catch (error) {
      console.error(error);
      setError('Something went wrong. We Cannot find the given email address');
      // if (error?.error?.message?.includes('Cannot find the given email address')) {
      //   setError('requestError', 'Cannot find the given email address');
      //   enqueueSnackbar('Email không tồn tại!', {
      //     variant: 'error',
      //     anchorOrigin: {
      //       vertical: 'top',
      //       horizontal: 'center',
      //     },
      //   });
      // } else {
      //   setError('requestError', 'Đã xảy ra lỗi');
      //   enqueueSnackbar('Đã xảy ra lỗi', {
      //     variant: 'error',
      //     anchorOrigin: {
      //       vertical: 'top',
      //       horizontal: 'center',
      //     },
      //   });
      // }
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        <RHFTextField name="email" label={translate('emailAddress')}
        />
        {error &&
          <Alert severity='error'>{error}</Alert>
        }
        <LoadingButton fullWidth size="large" type="submit" variant="contained" loading={isSubmitting}>
          {translate('button.sendRequest')}
        </LoadingButton>
      </Stack>
    </FormProvider>
  );
}
