import { yupResolver } from '@hookform/resolvers/yup';
import { LoadingButton } from '@mui/lab';
import { Box, Divider, FormHelperText, Grid, MenuItem, Stack } from '@mui/material';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import { memo, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import useDetectKeyboardOpen from "use-detect-keyboard-open";
import * as Yup from 'yup';
import { FormProvider, RHFSelectMenuItem, RHFTextField } from '../../../components/hook-form/index';
import useLocales from '../../../hooks/useLocales';
import DetailSummary from './DetailSummary';
// COMPONENTS
import { db } from '../../../Db';


Measurement.propTypes = {
  theme: PropTypes.any,
  currentInspection: PropTypes.object,
  Enums: PropTypes.array,
  isViewOnly: PropTypes.bool,
  handleNext: PropTypes.func,
};


function Measurement({
  theme,
  currentInspection,
  Enums,
  isViewOnly,
  handleNext,
}) {

  // Hooks
  const { translate } = useLocales();
  const { enqueueSnackbar } = useSnackbar();
  const isKeyboardOpen = useDetectKeyboardOpen()
  // CCOMPONENT STATES

  const defaultValues = useMemo(
    () => ({
      MeasurementStatusId: currentInspection?.Measurement?.MeasurementStatusId || '',
      MeasurementStatus: currentInspection?.Measurement?.MeasurementStatus || '',
      MeasurementNote: currentInspection?.Measurement?.MeasurementNote || '',
    }),
    []
  );

  const stepScheme = Yup.object().shape({
    MeasurementStatusId: Yup.string().required(`Measurement ${translate('formValidate.isRequired')}`),
  });

  const methods = useForm({
    resolver: yupResolver(stepScheme),
    defaultValues,
  });

  const {
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = methods;

  const values = watch();

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      const scrolElement = document.getElementById(Object.keys(errors)[0])
      if (scrolElement) {
        scrolElement.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }, [errors]);

  // HANDLE SAVE Mesurement
  const handleSave = async () => {
    try {
      await db.MqcInspection.where('Id')
        .equals(currentInspection.Id)
        .modify((x, ref) => {
          // console.log('default', x, ref);
          // Set newvalue to Mesurement
          ref.value.Measurement = values;
          // Assign item property to Edit
          ref.value.IsEditing = true;
        });

      enqueueSnackbar(translate('message.saveSuccess'), {
        variant: 'success',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center',
        },
      });
    } catch (error) {
      console.error(error);
      enqueueSnackbar(translate('message.saveError'), {
        variant: 'error',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center',
        },
      });
    }
  };

  const MesurementOptions = Enums.find((d) => d.Name === 'MeasurementStatus')?.Elements || [];

  const handleSelectMeasurement = (e, newValue) => {
    if (errors.MeasurementStatusId) {
      delete errors.MeasurementStatusId
    }
    setValue('MeasurementStatus', newValue.props.children);
    setValue('MeasurementStatusId', newValue.props.value);
  };

  const setCompleteStep = async () => {
    try {
      // if (Object.keys(errors).length > 0) {
      //   return enqueueSnackbar(translate('inspection.content.fieldRequired'), {
      //     variant: 'error',
      //     anchorOrigin: {
      //       vertical: 'top',
      //       horizontal: 'center',
      //     },
      //   });
      // }
      if (!currentInspection.Status.Measurement) {
        await db.MqcInspection.where('Id')
          .equals(currentInspection.Id)
          .modify((x, ref) => {
            ref.value.Measurement = values;
            // Set Step complete
            ref.value.Status.Measurement = !currentInspection?.Status?.Measurement;
          });
        // carouselRef.current?.slickNext();
        handleNext();
      } else {
        await db.MqcInspection.where('Id')
          .equals(currentInspection.Id)
          .modify((x, ref) => {
            ref.value.Status.Measurement = !currentInspection?.Status?.Measurement;
          });

      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar(JSON.stringify(error), {
        variant: 'error',
        autoHideDuration: 8000,
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center',
        },
      });
    }
  };

  return (
    <Stack spacing={1} height="100%">
      <DetailSummary currentInspection={currentInspection} />
      <Divider />
      <Box
        sx={{
          px: 0,
          py: 2,
        }}
      >
        <FormProvider methods={methods} onSubmit={handleSubmit(setCompleteStep)}>
          <Grid container rowSpacing={3} columnSpacing={2} pb={!isKeyboardOpen ? 3 : 1}>
            <Grid item xs={12} md={6} id="MeasurementStatusId">
              <RHFSelectMenuItem
                size="small"
                defaultValue=""
                value={values.MeasurementStatusId}
                // label={translate('Measurement status')}
                label={<LableStyle label={translate('Measurement status')} isRequired />}
                onChange={(e, newValue) => handleSelectMeasurement(e, newValue)}
              >
                {MesurementOptions.length > 0 &&
                  MesurementOptions.map((item) => (
                    <MenuItem key={item.Value} value={item.Value} disabled={
                      isViewOnly || currentInspection?.Status?.Measurement
                    }>
                      {item.Caption}
                    </MenuItem>
                  ))}
              </RHFSelectMenuItem>
              {errors.MeasurementStatusId?.message && (
                <FormHelperText sx={{ color: (theme) => theme.palette.error.main }}>
                  {errors?.MeasurementStatusId?.message} *
                </FormHelperText>
              )}
            </Grid>
            <Grid item xs={12} md={6} id="MeasurementNote">
              <RHFTextField name="MeasurementNote" size="small" label={'Measurement comment'} multiline rows={7} InputProps={{
                readOnly: isViewOnly || currentInspection?.Status?.Measurement,
              }} />
            </Grid>
            <Grid item xs={12} md={6} />

          </Grid>


          {/* {!isKeyboardOpen && */}
          <Grid
            container
            id="button-group"
            sx={{
              position: {
                xs: 'fixed',
                sm: 'fixed',
                md: 'absolute',
                lg: 'absolute',
              },
              bottom: {
                xs: 3,
                sm: 3,
                md: 0,
                lg: 0
              },
              left: 1,
              right: 1,
              p: 1,
              backgroundColor: 'transparent',
              display: {
                xs: !isKeyboardOpen ? 'flex' : 'none',
                sm: 'flex',
              },
              justifyContent: 'flex-end',
            }}
            spacing={2}
          >
            <Grid item xs={6} sm={6} md={3}>
              <LoadingButton
                variant="outlined"
                fullWidth
                disabled={isViewOnly || currentInspection.IsFinished || currentInspection.Status.Measurement}
                loading={isSubmitting}
                onClick={handleSave}
              >
                {translate('button.save')}
              </LoadingButton>
            </Grid>
            <Grid item xs={6} sm={6} md={3}>
              <LoadingButton
                variant={'contained'}
                sx={{
                  backgroundColor: currentInspection.Status.Measurement
                    ? theme.palette.primary.main
                    : theme.palette.info.main,
                  '&:hover': {
                    backgroundColor: currentInspection.Status.Measurement
                      ? theme.palette.primary.main
                      : theme.palette.info.main,
                  },
                }}
                fullWidth
                type="submit"
                disabled={isViewOnly || currentInspection.IsFinished}
                loading={isSubmitting}
              >
                {!currentInspection.Status.Measurement ? 'Complete' : 'Completed'}
              </LoadingButton>
            </Grid>
          </Grid>
          {/* } */}


        </FormProvider>
      </Box>
    </Stack >
  );
};

export default memo(Measurement);

const LableStyle = ({ ...other }) => {
  const { label, isRequired } = other
  return (
    <Stack direction="row" justifyContent="center" alignItems="center">
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