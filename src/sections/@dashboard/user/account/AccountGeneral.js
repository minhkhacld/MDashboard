import { useSnackbar } from 'notistack';
import { useCallback, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import * as Yup from 'yup';
// form
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
// @mui
import { Box, Card, Grid } from '@mui/material';
// hooks
import useAuth from '../../../../hooks/useAuth';
import useLocales from '../../../../hooks/useLocales';
// utils
import axios from '../../../../utils/axios';
// config
import { HOST_API } from '../../../../config';
// _mock
// components
import { FormProvider, RHFTextField } from '../../../../components/hook-form';
import { useSelector } from '../../../../redux/store';
// ----------------------------------------------------------------------

export default function AccountGeneral() {
  const { enqueueSnackbar } = useSnackbar();
  const { translate } = useLocales();

  const { user, avatar, setAvartar, userInfo } = useAuth();
  const { LoginUser } = useSelector((store) => store.workflow);

  const UpdateUserSchema = Yup.object().shape({
    email: Yup.string().required('Email is required'),
  });

  const [file, setFile] = useState(avatar?.seal?.length > 0 ? `${HOST_API}${avatar?.seal[0]?.url}` : null);

  const defaultValues = {
    userName: LoginUser?.EmpKnowAs || '',
    email: LoginUser?.UserName || '',
  };

  const methods = useForm({
    resolver: yupResolver(UpdateUserSchema),
    defaultValues,
  });

  const {
    setValue,
    watch,
    getValues,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const onSubmit = async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const formData = new FormData();
      formData.append('key', user.currentUser?.id);
      formData.append(
        'values',
        JSON.stringify({
          name: values?.name,
          surName: values?.surName,
          phoneNumber: values?.phoneNumber,
        })
      );
      const response = await axios.put(`/api/app/app-user`, formData);
      // console.log(response);
      if (response) {
        enqueueSnackbar('Đã cập nhật thông tin!');
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar(translate('products.addEdit.errorMsg'), {
        variant: 'error',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center',
        },
      });
    }
  };

  const handleUploadAvatar = useCallback(
    async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        if (values.photoId !== '') {
          // Delete if more than 1 picture exist
          const responseDelete = await axios.delete(`/api/app/attachment-user-profile-image?key=${avatar.id}`);
          if (responseDelete.data) {
            // Upload
            getBase64(file).then(async (data) => {
              const stringBase64 = data.split(',')[1];
              const fileConfig = {
                recordId: user.currentUser?.id,
                fileName: `${file.name}`,
                data: stringBase64,
              };
              await axios
                .post(`/api/app/attachment-user-profile-image`, fileConfig)
                .then((response) => {
                  // console.log(response);
                  setValue('photoId', response.data?.id);
                  setAvartar(response?.data?.id, `${file?.name}`);
                })
                .catch((error) => console.log(error));
            });
          }
        } else {
          // Upload
          getBase64(file).then(async (data) => {
            const stringBase64 = data.split(',')[1];
            const fileConfig = {
              recordId: user.currentUser?.id,
              fileName: `${file.name}`,
              data: stringBase64,
            };

            await axios
              .post(`/api/app/attachment-user-profile-image`, fileConfig)
              .then((response) => {
                // console.log(response);
                setValue('photoId', response.data?.id);
                setAvartar(response.data?.id, `${file.name}`);
              })
              .catch((error) => console.log(error));
          });
        }
        setValue(
          'photoURL',
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          })
        );
      }
    },
    [setValue, avatar?.id]
  );

  // CONVERT TO BASE 64
  function getBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  }

  const handleUpdateSeal = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setFile(
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      );
      // Delete if more than 1 picture exist
      if (avatar.seal.length > 0) {
        const responseDelete = await axios.delete(`/api/app/attachment-user-seal?key=${avatar.seal[0]?.id}`);
        if (responseDelete.data) {
          getBase64(file).then(async (data) => {
            const stringBase64 = data.split(',')[1];
            const renameFile = file.name.replace(file.name.substring(0, file.name.lastIndexOf('.')), uuidv4());
            const fileConfig = {
              recordId: userInfo.id,
              fileName: renameFile,
              data: stringBase64,
            };

            await axios
              .post('/api/app/attachment-user-seal', fileConfig)
              .then((response) => {
                // console.log('upload-attachement-seal', response);
              })
              .catch((err) => {
                console.error(err);
              });
          });
        }
      } else {
        getBase64(file).then(async (data) => {
          const stringBase64 = data.split(',')[1];
          const renameFile = file.name.replace(file.name.substring(0, file.name.lastIndexOf('.')), uuidv4());
          const fileConfig = {
            recordId: userInfo.id,
            fileName: renameFile,
            data: stringBase64,
          };

          await axios
            .post('/api/app/attachment-user-seal', fileConfig)
            .then((response) => {
              // console.log('upload-attachement-seal', response);
            })
            .catch((err) => {
              console.error(err);
            });
        });
      }
    }
  }, []);

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        {/* <Grid item xs={12} md={4}>
          <Card sx={{ py: 10, px: 3, textAlign: 'center' }}>
            <RHFUploadAvatar
              name="photoURL"
              accept="image/*"
              maxSize={10145728}
              onDrop={handleUploadAvatar}
              helperText={
                <Typography
                  variant="caption"
                  sx={{
                    mt: 2,
                    mx: 'auto',
                    display: 'block',
                    textAlign: 'center',
                    color: 'text.secondary',
                  }}
                >
                  Allowed *.jpeg, *.jpg, *.png, *.gif
                  <br /> max size of {fData(3145728)}
                </Typography>
              }
            />
          </Card>
        </Grid> */}
        <Grid item xs={12} >
          <Card sx={{ py: 3, px: 1 }}>
            <Box
              sx={{
                display: 'grid',
                rowGap: 3,
                columnGap: 2,
                gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
              }}
            >
              <RHFTextField name="userName" label={translate('userName')} inputProps={{ readOnly: true }} />
              <RHFTextField name="email" label={translate('emailAddress')} inputProps={{ readOnly: true }} />
            </Box>

          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
