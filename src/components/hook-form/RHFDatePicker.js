import PropTypes from 'prop-types';
// form
import { useFormContext, Controller } from 'react-hook-form';
// @mui
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';

// ----------------------------------------------------------------------

RHFTextMobileDatePicker.propTypes = {
  name: PropTypes.string,
};

export default function RHFTextMobileDatePicker({ name, ...other }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <MobileDatePicker
          {...field}
          fullWidth
          error={!!error}
          helperText={error?.message}
          {...other}
          InputLabelProps={{
            style: { color: 'var(--label)', shrink: true },
          }}
        />
      )}
    />
  );
}


