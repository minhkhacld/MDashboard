import PropTypes from 'prop-types';
// form
import { useFormContext, Controller } from 'react-hook-form';
// @mui
import { Select, FormControl, InputLabel, FormHelperText } from '@mui/material';
import Iconify from '../Iconify';
// ----------------------------------------------------------------------

RHFSelect.propTypes = {
  children: PropTypes.node,
  name: PropTypes.string,
};

export default function RHFSelect({ name, children, ...other }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        return (
          <FormControl fullWidth>
            <InputLabel
              shrink
              sx={{
                color: 'var(--label)',
                '&.MuiInputLabel-shrink': {
                  shrink: true,
                },
                display: 'flex',
                justifyContent: 'flex-start',
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'white',
              }}
              {...(other.size && { size: other.size })}
            >
              {other.label}
              {/* <Iconify icon={'bi:asterisk'} sx={{ color: 'red', ml: 1, fontSize: 8 }} /> */}
              {other?.required && (
                // <Iconify icon={'bi:asterisk'} sx={{ color: 'red', ml: 1, fontSize: 7 }} />
                <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 16 16">
                  <path
                    fill="red"
                    d="M8 0a1 1 0 0 1 1 1v5.268l4.562-2.634a1 1 0 1 1 1 1.732L10 8l4.562 2.634a1 1 0 1 1-1 1.732L9 9.732V15a1 1 0 1 1-2 0V9.732l-4.562 2.634a1 1 0 1 1-1-1.732L6 8L1.438 5.366a1 1 0 0 1 1-1.732L7 6.268V1a1 1 0 0 1 1-1z"
                  />
                </svg>
              )}
            </InputLabel>
            <Select {...field} fullWidth error={!!error} {...other} notched>
              {children}
            </Select>
            {error && <FormHelperText sx={{ color: 'red' }}>{error?.message}</FormHelperText>}
          </FormControl>
        );
      }}
    />
  );
}
