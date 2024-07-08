import PropTypes from 'prop-types';
// form
import { Controller, useFormContext } from 'react-hook-form';
// @mui
import { FormHelperText } from '@mui/material';
// type
import { UploadAvatar, UploadMultiFile, UploadMultiFileCapacitor, UploadSingleFile } from '../upload';

// ----------------------------------------------------------------------

RHFUploadAvatar.propTypes = {
  name: PropTypes.string,
};

export function RHFUploadAvatar({ name, ...other }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        const checkError = !!error && !field.value;
        return (
          <div>
            <UploadAvatar error={checkError} {...other} file={field.value} />
            {checkError && (
              <FormHelperText error sx={{ px: 2, textAlign: 'center' }}>
                {error.message}
              </FormHelperText>
            )}
          </div>
        );
      }}
    />
  );
}

// ----------------------------------------------------------------------

RHFUploadSingleFile.propTypes = {
  name: PropTypes.string,
};

export function RHFUploadSingleFile({ name, ...other }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        const checkError = !!error && !field.value;

        return (
          <UploadSingleFile
            accept="image/*"
            file={field.value}
            error={checkError}
            helperText={
              checkError && (
                <FormHelperText error sx={{ px: 2 }}>
                  {error.message}
                </FormHelperText>
              )
            }
            {...other}
          />
        );
      }}
    />
  );
}

// ----------------------------------------------------------------------
// USE FOR COMPLIANCE AUDIT DETAIL PAGE
RHFUploadMultiFile.propTypes = {
  name: PropTypes.string,
};

export function RHFUploadMultiFile({ name, ...other }) {
  const { control } = useFormContext();
  // console.log(other.accept);
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        // console.log(field)
        const checkError = !!error && field.value?.length === 0;
        return (
          <UploadMultiFile
            accept={other.accept ? other.accept : 'image/*'}
            files={field.value.filter((d) => d?.Action !== 'Delete')}
            error={checkError}
            helperText={
              checkError && (
                <FormHelperText error sx={{ px: 2 }}>
                  {error?.message}
                </FormHelperText>
              )
            }
            {...other}
          />
        );
      }}
    />
  );
}

// USE FOR COMPLIANCE AUDIT DETAIL PAGE
RHFUploadMultiFileCapacitor.propTypes = {
  name: PropTypes.string,
};

export function RHFUploadMultiFileCapacitor({ name, ...other }) {
  const { control } = useFormContext();
  // console.log(other.accept);
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        // console.log(field)
        const checkError = !!error && field.value?.length === 0;
        return (
          <UploadMultiFileCapacitor
            accept={other.accept ? other.accept : 'image/*'}
            files={field.value.filter((d) => d?.Action !== 'Delete')}
            error={checkError}
            helperText={
              checkError && (
                <FormHelperText error sx={{ px: 2 }}>
                  {error?.message}
                </FormHelperText>
              )
            }
            {...other}
          />
        );
      }}
    />
  );
}
