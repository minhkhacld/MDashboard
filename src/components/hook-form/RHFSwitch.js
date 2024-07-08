import PropTypes from 'prop-types';
// form
import { useFormContext, Controller } from 'react-hook-form';
// @mui
import { Switch, FormControlLabel } from '@mui/material';
import { forwardRef } from 'react';

// ----------------------------------------------------------------------

RHFSwitch.propTypes = {
  name: PropTypes.string,
};

export default function RHFSwitch({ name, ...other }) {
  const { control } = useFormContext();

  return (
    <FormControlLabel
      control={
        <Controller
          name={name}
          control={control}
          render={({ field }) => <Switch {...field} checked={field.value} disabled={other?.disabled || false} />}
        />
      }
      {...other}
    />
  );
}




// const RHFSwitch = forwardRef(({ name, ...other }, ref) => {
//   const { control } = useFormContext();
//   return (
//     <FormControlLabel
//       control={
//         <Controller
//           name={name}
//           control={control}
//           render={({ field }) => <Switch ref={ref} {...field} checked={field.value} disabled={other?.disabled || false} />}
//         />
//       }
//       {...other}
//     />
//   );
// }
// )

// export default RHFSwitch

RHFSwitch.propTypes = {
  name: PropTypes.string,
};
