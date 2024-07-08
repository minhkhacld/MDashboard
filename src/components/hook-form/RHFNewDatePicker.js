import DatePicker from '@mui/lab/DatePicker';
import { TextField, Stack } from '@mui/material';
import PropTypes from 'prop-types';
// form
import { Controller, useFormContext } from 'react-hook-form';
// @mui

// ----------------------------------------------------------------------

RHFDatePicker.propTypes = {
  name: PropTypes.string,
};

export default function RHFDatePicker({ name, label, ...other }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <DatePicker
          label={label}
          value={field.value}
          onChange={(newValue) => {
            field.onChange(newValue);
          }}
          {...other}
          renderInput={(params) => (
            <TextField
              {...params}
              fullWidth
              error={!!error}
              helperText={error?.message}
              InputLabelProps={{
                style: { color: 'var(--label)' },
                shrink: true,
              }}
              size="small"
              label={
                <Stack direction="row" justifyContent="center" alignItems="center" sx={{ color: 'var(--label)' }}>
                  <p className="ml-1">{label}</p>
                  {/* {other?.required && <Iconify icon={'bi:asterisk'} sx={{ color: 'red', ml: 1, fontSize: 7 }} />} */}
                </Stack>
              }
            />
          )}
        />
      )}
    />
  );
}
