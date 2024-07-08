import PropTypes from 'prop-types';
// form
import { useFormContext, Controller } from 'react-hook-form';
// @mui
import { Checkbox, FormControl, FormControlLabel, FormGroup, Stack, FormLabel } from '@mui/material';
import Iconify from '../Iconify';
import IconName from '../../utils/iconsName';
// ----------------------------------------------------------------------

RHFCheckbox.propTypes = {
  name: PropTypes.string.isRequired,
};

export function RHFCheckbox({ name, ...other }) {
  const { control } = useFormContext();

  return (
    // <FormControl required={other?.isRequired}>
    //   <FormLabel component="legend">{other?.label}</FormLabel>
    <FormControlLabel
      control={
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <Checkbox {...field} checked={field.value} disabled={other?.disabled ? other?.disabled : false} />
          )}
        />
      }
      {...other}
    />
    // </FormControl>
  );
}

const LableStyle = ({ label, isRequired }) => {
  return (
    <Stack direction="row" justifyContent="center" alignItems="center">
      <p className="ml-1 mr-1">{label}sss</p>
      {isRequired && (
        // <Iconify icon={'bi:asterisk'} sx={{ color: 'red', ml: 1, fontSize: 8 }} />
        <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 16 16">
          <path
            fill="red"
            d="M8 0a1 1 0 0 1 1 1v5.268l4.562-2.634a1 1 0 1 1 1 1.732L10 8l4.562 2.634a1 1 0 1 1-1 1.732L9 9.732V15a1 1 0 1 1-2 0V9.732l-4.562 2.634a1 1 0 1 1-1-1.732L6 8L1.438 5.366a1 1 0 0 1 1-1.732L7 6.268V1a1 1 0 0 1 1-1z"
          />
        </svg>
      )}
    </Stack>
  );
};

// ----------------------------------------------------------------------

RHFMultiCheckbox.propTypes = {
  name: PropTypes.string.isRequired,
  options: PropTypes.array.isRequired,
};

export function RHFMultiCheckbox({ name, options, ...other }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        const onSelected = (option) =>
          field.value.includes(option) ? field.value.filter((value) => value !== option) : [...field.value, option];

        return (
          <FormGroup>
            {options.map((option) => (
              <FormControlLabel
                key={option.value}
                control={
                  <Checkbox
                    checked={field.value.includes(option.value)}
                    onChange={() => field.onChange(onSelected(option.value))}
                  />
                }
                label={option.label}
                {...other}
              />
            ))}
          </FormGroup>
        );
      }}
    />
  );
}
