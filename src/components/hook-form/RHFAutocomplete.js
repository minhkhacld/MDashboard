import PropTypes from 'prop-types';
// form
import { useFormContext, Controller } from 'react-hook-form';
// @mui
import { Autocomplete, TextField } from '@mui/material';

// ----------------------------------------------------------------------

RHFAutocomplete.propTypes = {
  name: PropTypes.string,
  options: PropTypes.array,
};

export default function RHFAutocomplete({ name, options, ...other }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Autocomplete
          {...field}
          fullWidth
          options={options}
          autoHighlight
          getOptionLabel={other?.getOptionLabel}
          isOptionEqualToValue={other?.isOptionEqualToValue}
          // getOptionLabel={(option) => option.label}
          // renderOption={(props, option) => <Box component="li" {...props}></Box>}
          renderInput={(params) => (
            <TextField
              {...params}
              label={other?.label || ''}
              inputProps={{
                ...params.inputProps,
              }}
              InputLabelProps={{
                style: { color: 'var(--label)' },
              }}
              {...other}
              error={!!error}
              helperText={error?.message}
            />
          )}
        />
      )}
    />
  );
}


