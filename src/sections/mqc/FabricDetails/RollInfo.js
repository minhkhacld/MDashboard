import { Capacitor } from '@capacitor/core';
import { Grid, Stack, TextField } from '@mui/material';
import PropTypes from 'prop-types';
import { useEffect } from 'react';
import Iconify from '../../../components/Iconify';
import { RHFTextField } from '../../../components/hook-form/index';
import IconName from '../../../utils/iconsName';

RollInfo.propTypes = {
  isViewOnly: PropTypes.bool,
  currentTodoItem: PropTypes.object,
  methods: PropTypes.object,
};

function RollInfo({ isViewOnly, currentTodoItem, methods }) {
  const {
    watch,
    setValue,
    formState: { errors },
  } = methods;

  const values = watch();

  const isWebApp = Capacitor.getPlatform() === 'web';

  useEffect(() => {
    setValue('ActQuantity', currentTodoItem?.ActQuantity || values?.ActQuantity || '');
    setValue('ActualWidth', currentTodoItem?.ActualWidth || values?.ActualWidth || '');
    setValue(
      'QIMaterialFabricRatings',
      currentTodoItem?.QIMaterialFabricRatings || values?.QIMaterialFabricRatings || []
    );
    setValue('Remark', currentTodoItem?.Remark || values?.Remark || '');
    setValue('RollNo', currentTodoItem?.RollNo || values?.RollNo || '');
    setValue('RollPenaltyPoint', currentTodoItem?.RollPenaltyPoint || values?.RollPenaltyPoint || '');
    setValue('StickerQuantity', currentTodoItem?.StickerQuantity || values?.StickerQuantity || '');
    setValue('StickerWidth', currentTodoItem?.StickerWidth || values?.StickerWidth || '');
  }, [currentTodoItem]);

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      const scrolElement = document.getElementById(Object.keys(errors)[0]);
      if (scrolElement) {
        scrolElement.scrollIntoView(false, { behavior: 'smooth' });
      }
    }
  }, [errors]);

  const handleChange = () => {};

  const isNaN = (value) => {
    return value === null || value === '' || value === undefined;
  };

  return (
    <Grid container rowSpacing={3} columnSpacing={2} pb={4}>
      <Grid item xs={12} md={12}>
        <TextField
          id="RollNo"
          fullWidth
          onFocus={(event) => {
            event.target.select();
          }}
          size="small"
          label={
            <Stack direction="row" justifyContent="center" alignItems="center">
              <p className="ml-1">{'Roll No'}</p>
              <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 16 16">
                <path
                  fill="red"
                  d="M8 0a1 1 0 0 1 1 1v5.268l4.562-2.634a1 1 0 1 1 1 1.732L10 8l4.562 2.634a1 1 0 1 1-1 1.732L9 9.732V15a1 1 0 1 1-2 0V9.732l-4.562 2.634a1 1 0 1 1-1-1.732L6 8L1.438 5.366a1 1 0 0 1 1-1.732L7 6.268V1a1 1 0 0 1 1-1z"
                />
              </svg>
            </Stack>
          }
          InputLabelProps={{
            style: { color: 'var(--label)' },
            shrink: true,
          }}
          value={values?.RollNo || ''}
          onChange={(e) => {
            setValue('RollNo', e?.target?.value);
          }}
          InputProps={{ readOnly: isViewOnly }}
          error={errors?.RollNo !== undefined}
          maxRows={1}
          multiline
        />
      </Grid>
      <Grid item xs={6} md={6}>
        <TextField
          fullWidth
          onFocus={(event) => {
            event.target.select();
          }}
          InputProps={{ readOnly: isViewOnly, inputProps: { inputMode: 'decimal' } }}
          size="small"
          label={
            <Stack direction="row" justifyContent="center" alignItems="center">
              <p className="ml-1">{'Sticker Quantity (m)'}</p>
            </Stack>
          }
          InputLabelProps={{
            style: { color: 'var(--label)' },
            shrink: true,
          }}
          type="text"
          value={values?.StickerQuantity || ''}
          onChange={(e) => {
            setValue('StickerQuantity', e?.target?.value.replace(',', '.'));
          }}
          onBlur={(e) => {
            if (!isNaN(e?.target?.value)) {
              const value = Number(e?.target?.value.replace(',', '.'));
              setValue('StickerQuantity', value % 1 !== 0 ? Number(value.toFixed(2)) : value);
            }
          }}
          maxRows={1}
        />
      </Grid>
      <Grid item xs={6} md={6}>
        <TextField
          id="ActQuantity"
          fullWidth
          onFocus={(event) => {
            event.target.select();
          }}
          size="small"
          label={
            <Stack direction="row" justifyContent="center" alignItems="center">
              <p className="ml-1">{'Actual Quantity (m)'}</p>
              {/* <Iconify icon={'bi:asterisk'} sx={{ color: 'red', ml: 1, fontSize: 7 }} /> */}
              <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 16 16">
                <path
                  fill="red"
                  d="M8 0a1 1 0 0 1 1 1v5.268l4.562-2.634a1 1 0 1 1 1 1.732L10 8l4.562 2.634a1 1 0 1 1-1 1.732L9 9.732V15a1 1 0 1 1-2 0V9.732l-4.562 2.634a1 1 0 1 1-1-1.732L6 8L1.438 5.366a1 1 0 0 1 1-1.732L7 6.268V1a1 1 0 0 1 1-1z"
                />
              </svg>
            </Stack>
          }
          InputLabelProps={{
            style: { color: 'var(--label)' },
            shrink: true,
          }}
          type="text"
          value={values?.ActQuantity || ''}
          onChange={(e) => {
            setValue('ActQuantity', e?.target?.value.replace(',', '.'));
          }}
          onBlur={(e) => {
            if (!isNaN(e?.target?.value)) {
              const value = Number(e?.target?.value.replace(',', '.'));
              setValue('ActQuantity', value % 1 !== 0 ? Number(value.toFixed(2)) : value);
            }
          }}
          InputProps={{ readOnly: isViewOnly, inputProps: { inputMode: 'decimal' } }}
          error={errors?.ActQuantity !== undefined}
          maxRows={1}
        />
      </Grid>
      <Grid item xs={6} md={6}>
        <TextField
          fullWidth
          onFocus={(event) => {
            event.target.select();
          }}
          size="small"
          label={
            <Stack direction="row" justifyContent="center" alignItems="center">
              <p className="ml-1">{'Sticker Width (cm)'}</p>
            </Stack>
          }
          InputLabelProps={{
            style: { color: 'var(--label)' },
            shrink: true,
          }}
          value={values?.StickerWidth || ''}
          onChange={(e) => {
            setValue('StickerWidth', e?.target?.value.replace(',', '.'));
          }}
          onBlur={(e) => {
            if (!isNaN(e?.target?.value)) {
              const value = Number(e?.target?.value.replace(',', '.'));
              setValue('StickerWidth', value % 1 !== 0 ? Number(value.toFixed(2)) : value);
            }
          }}
          InputProps={{ readOnly: isViewOnly, inputProps: { inputMode: 'decimal' } }}
          maxRows={1}
          type="text"
        />
      </Grid>
      <Grid item xs={6} md={6}>
        <TextField
          id="ActualWidth"
          fullWidth
          onFocus={(event) => {
            event.target.select();
          }}
          size="small"
          label={
            <Stack direction="row" justifyContent="center" alignItems="center">
              <p className="ml-1">{'Actual Width (cm)'}</p>
              {/* <Iconify icon={'bi:asterisk'} sx={{ color: 'red', ml: 1, fontSize: 7 }} /> */}
              <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 16 16">
                <path
                  fill="red"
                  d="M8 0a1 1 0 0 1 1 1v5.268l4.562-2.634a1 1 0 1 1 1 1.732L10 8l4.562 2.634a1 1 0 1 1-1 1.732L9 9.732V15a1 1 0 1 1-2 0V9.732l-4.562 2.634a1 1 0 1 1-1-1.732L6 8L1.438 5.366a1 1 0 0 1 1-1.732L7 6.268V1a1 1 0 0 1 1-1z"
                />
              </svg>
            </Stack>
          }
          InputLabelProps={{
            style: { color: 'var(--label)' },
            shrink: true,
          }}
          value={values?.ActualWidth || ''}
          onChange={(e) => {
            setValue('ActualWidth', e?.target?.value.replace(',', '.'));
          }}
          onBlur={(e) => {
            if (!isNaN(e?.target?.value)) {
              const value = Number(e?.target?.value.replace(',', '.'));
              setValue('ActualWidth', value % 1 !== 0 ? Number(value.toFixed(2)) : value);
            }
          }}
          type="text"
          InputProps={{ readOnly: isViewOnly, inputProps: { inputMode: 'decimal' } }}
          error={errors?.ActualWidth !== undefined}
          maxRows={1}
        />
      </Grid>
      <Grid item xs={12} md={12}>
        <RHFTextField
          size="small"
          label={'Roll Penalty Point'}
          value={values?.RollPenaltyPoint || ''}
          InputProps={{ readOnly: true }}
          maxRows={1}
          multiline
          disabled
        />
      </Grid>
      <Grid item xs={12} md={12}>
        <TextField
          fullWidth
          onFocus={(event) => {
            event.target.select();
          }}
          size="small"
          label={
            <Stack direction="row" justifyContent="center" alignItems="center">
              <p className="ml-1">{'Remark'}</p>
            </Stack>
          }
          InputLabelProps={{
            style: { color: 'var(--label)' },
            shrink: true,
          }}
          value={values?.Remark || ''}
          onChange={(e) => {
            setValue('Remark', e?.target?.value);
          }}
          InputProps={{ readOnly: isViewOnly }}
          multiline
          maxRows={3}
        />
      </Grid>
    </Grid>
  );
}

export default RollInfo;

// Render Input
const RenderInput = ({ params, label, ...other }) => {
  return (
    <TextField
      {...params}
      fullWidth
      onFocus={(event) => {
        event.target.select();
      }}
      size="small"
      label={
        <Stack direction="row" justifyContent="center" alignItems="center">
          <Iconify icon={IconName.search} />
          <p className="ml-1 mr-1">{label}</p>
          {other?.required && (
            <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 16 16">
              <path
                fill="red"
                d="M8 0a1 1 0 0 1 1 1v5.268l4.562-2.634a1 1 0 1 1 1 1.732L10 8l4.562 2.634a1 1 0 1 1-1 1.732L9 9.732V15a1 1 0 1 1-2 0V9.732l-4.562 2.634a1 1 0 1 1-1-1.732L6 8L1.438 5.366a1 1 0 0 1 1-1.732L7 6.268V1a1 1 0 0 1 1-1z"
              />
            </svg>
          )}
        </Stack>
      }
      InputLabelProps={{
        style: { color: 'var(--label)' },
        shrink: true,
      }}
    />
  );
};
