import PropTypes from 'prop-types';
import { forwardRef } from 'react';
import { merge } from 'lodash';
// form
import { useFormContext, Controller } from 'react-hook-form';
// @mui
import { TextField, Stack } from '@mui/material';
import Iconify from '../Iconify';
import IconName from '../../utils/iconsName';
// ----------------------------------------------------------------------

RHFTextField.propTypes = {
  name: PropTypes.string,
};

const baseOptions = {
  color: 'var(--label)',
}

export default function RHFTextField({ name, isRequired = false, autoFocus = true, ...other }) {
  const { control } = useFormContext();
  const mergeStyle = other?.InputLabelProps?.style ? merge(other?.InputLabelProps?.style, baseOptions) : baseOptions;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          value={field.value === null ? '' : field.value}
          fullWidth
          error={!!error}
          helperText={error?.message}
          onFocus={(event) => {
            if (autoFocus) {
              event.target.select();
            }
            if (other?.onFocus !== undefined) {
              other?.onFocus();
            }
          }}
          {...other}
          label={<LableStyle label={other?.label} isRequired={isRequired} />}
          InputLabelProps={{
            ...other?.InputLabelProps,
            style: mergeStyle,
            shrink: true,
          }}
        />
      )}
    />
  );
}

// const RHFTextField = forwardRef(({ name, isRequired = null, ...other }, ref) => {
//   const { control } = useFormContext();
//   return (
//     <Controller
//       name={name}
//       control={control}
//       render={({ field, fieldState: { error } }) => (
//         <TextField
//           ref={ref}
//           {...field}
//           value={field.value === null ? '' : field.value}
//           fullWidth
//           error={!!error}
//           helperText={error?.message}
//           InputLabelProps={{
//             style: { color: 'var(--label)', ...(other?.InputLabelProps && { ...other?.InputLabelProps?.style }) },
//             shrink: true,
//           }}
//           onFocus={(event) => {
//             event.target.select();
//             // other?.onFocus();
//           }}
//           label={<LableStyle {...other} isRequired={isRequired} />}
//           {...other}
//         // autoComplete={other?.autoComplete || 'off'}
//         />
//       )}
//     />
//   )
// })

// export default RHFTextField;

const LableStyle = ({ ...other }) => {
  const { label, isRequired } = other
  return (
    <Stack direction="row" justifyContent="center" alignItems="center">
      {/* { <Iconify icon={IconName.search} />} */}
      <p className="ml-1 mr-1">{label}</p>
      {isRequired && (
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
