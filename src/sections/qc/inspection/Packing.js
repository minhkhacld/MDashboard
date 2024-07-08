import { yupResolver } from '@hookform/resolvers/yup';
import { LoadingButton } from '@mui/lab';
import { Box, Divider, FormHelperText, Grid, MenuItem, Stack } from '@mui/material';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { memo, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import useDetectKeyboardOpen from "use-detect-keyboard-open";
import * as Yup from 'yup';
import Scrollbar from '../../../components/Scrollbar';
import { FormProvider, RHFSelectMenuItem, RHFTextField } from '../../../components/hook-form/index';
import useLocales from '../../../hooks/useLocales';
import useResponsive from '../../../hooks/useResponsive';
import DetailSummary from './DetailSummary';
// COMPONENTS
import { db } from '../../../Db';
import { HEADER, NOTCH_HEIGHT } from '../../../config';


const BREAKCRUM_HEIGHT = 78;
const STEP_HEADER_HEIGHT = 56;
const SPACING = 90;
const DETAIL_SUMARY = 90;


Packing.propTypes = {
  theme: PropTypes.any,
  currentInspection: PropTypes.object,
  Enums: PropTypes.array,
  isViewOnly: PropTypes.bool,
  handleNext: PropTypes.func,
};


function Packing({
  theme,
  currentInspection,
  Enums,
  isViewOnly,
  handleNext,
}) {

  // Hooks
  const { translate } = useLocales();
  const lgUp = useResponsive('up', 'lg');
  const { enqueueSnackbar } = useSnackbar();
  const isKeyboardOpen = useDetectKeyboardOpen()
  // CCOMPONENT STATES

  const defaultValues = useMemo(
    () => ({
      ShippingMarkId: currentInspection?.Packing?.ShippingMarkId || '',
      ShippingMark: currentInspection?.Packing?.ShippingMark || '',
      ShippingMarkComment: currentInspection?.Packing?.ShippingMarkComment || '',
      PackingMethodId: currentInspection?.Packing?.PackingMethodId || '',
      PackingMethod: currentInspection?.Packing?.PackingMethod || '',
      ParentId: currentInspection?.Packing?.ParentId || '',
    }),
    [currentInspection]
  );

  const stepScheme = Yup.object().shape({
    ShippingMarkId: Yup.string().required(`Shipping mark ${translate('formValidate.isRequired')}`),
    PackingMethodId: Yup.string().required(`Packing method ${translate('formValidate.isRequired')}`),
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

  // HANDLE SAVE Packing
  const handleSave = async () => {
    try {
      await db.MqcInspection.where('Id')
        .equals(currentInspection.Id)
        .modify((x, ref) => {
          // console.log('default', x, ref);
          // Set newvalue to Packing
          ref.value.Packing = values;
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

  const ShipingMarkOptions = Enums.find((d) => d.Name === 'ShippingMark')?.Elements || [];
  const PackingMethodOptions = Enums.find((d) => d.Name === 'PackingMethod')?.Elements || [];

  const handleSelectShipingMark = (e, newValue) => {
    if (errors.ShippingMarkId) {
      delete errors.ShippingMarkId
    }
    setValue('ShippingMark', newValue.props.children);
    setValue('ShippingMarkId', newValue.props.value);
  };

  const handleSelectPackingMethod = (e, newValue) => {
    if (errors.PackingMethodId) {
      delete errors.PackingMethodId
    }
    setValue('PackingMethod', newValue.props.children);
    setValue('PackingMethodId', newValue.props.value);
  };

  const handleSelectPackingMethodItem = (item) => {
    // console.log(item)
    if (errors.PackingMethodId) {
      delete errors.PackingMethodId
    }
    setValue('PackingMethod', item.Caption);
    setValue('PackingMethodId', item.Value);
    setValue('ParentId', item.ParentId);
  }

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
      if (!currentInspection.Status.Packing) {
        const newPackingValues = { ...values };
        if (newPackingValues.ParentId === "") {
          newPackingValues.ParentId = PackingMethodOptions.find(d => d.Value === newPackingValues.PackingMethodId).ParentId;
        }
        await db.MqcInspection.where('Id')
          .equals(currentInspection.Id)
          .modify((x, ref) => {
            // console.log('default', x, ref);
            // Set Step complete
            ref.value.Packing = newPackingValues;
            ref.value.Status.Packing = !currentInspection?.Status?.Packing;
          });
        // carouselRef.current?.slickNext();
        handleNext();
      } else {
        await db.MqcInspection.where('Id')
          .equals(currentInspection.Id)
          .modify((x, ref) => {
            // console.log('default', x, ref);
            // Set Step complete
            ref.value.Status.Packing = !currentInspection?.Status?.Packing;
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

      <FormProvider methods={methods} onSubmit={handleSubmit(setCompleteStep)}>
        <Scrollbar >
          <Box sx={{
            height: {
              xs: `calc(100vh - ${HEADER.MOBILE_HEIGHT + BREAKCRUM_HEIGHT + STEP_HEADER_HEIGHT + SPACING + DETAIL_SUMARY + NOTCH_HEIGHT}px)`,
              sm: `calc(100vh - ${HEADER.MOBILE_HEIGHT + BREAKCRUM_HEIGHT + STEP_HEADER_HEIGHT + SPACING + DETAIL_SUMARY + NOTCH_HEIGHT}px)`,
              lg: `calc(100vh - ${HEADER.DASHBOARD_DESKTOP_HEIGHT + BREAKCRUM_HEIGHT + STEP_HEADER_HEIGHT + SPACING + DETAIL_SUMARY + NOTCH_HEIGHT}px)`,
            },
            py: 2,
            ...(isKeyboardOpen && {
              minHeight: {
                xs: `calc(100vh - ${HEADER.MOBILE_HEIGHT + BREAKCRUM_HEIGHT + SPACING + NOTCH_HEIGHT}px)`,
                lg: `calc(100vh - ${HEADER.DASHBOARD_DESKTOP_HEIGHT + BREAKCRUM_HEIGHT + SPACING + NOTCH_HEIGHT}px)`,
              }
            })
          }}
          >

            <Grid container rowSpacing={3} columnSpacing={2} pb={3}>
              <Grid item xs={12} md={6} id="ShippingMarkId">
                <RHFSelectMenuItem
                  size="small"
                  defaultValue=""
                  value={values.ShippingMarkId}
                  // label={translate('Shipping mark')}
                  label={<LableStyle label={translate('Shipping mark')} isRequired />}
                  onChange={(e, newValue) => handleSelectShipingMark(e, newValue)}
                >
                  {ShipingMarkOptions.length > 0 &&
                    ShipingMarkOptions.map((item) => (
                      <MenuItem key={item.Value} value={item.Value}
                        disabled={isViewOnly || currentInspection.IsFinished || currentInspection.Status.Packing}
                      >
                        {item.Caption}
                      </MenuItem>
                    ))}
                </RHFSelectMenuItem>
                {errors.ShippingMarkId?.message && (
                  <FormHelperText sx={{ color: (theme) => theme.palette.error.main }}>
                    {errors?.ShippingMarkId?.message} *
                  </FormHelperText>
                )}
              </Grid>
              <Grid item xs={12} md={6} id="ShippingMarkComment">
                <RHFTextField
                  name="ShippingMarkComment"
                  size="small"
                  label={'Shipping mark comment'}
                  multiline
                  rows={6}
                  InputProps={{ readOnly: isViewOnly || currentInspection.IsFinished || currentInspection.Status.Packing }}
                />
              </Grid>
              <Grid item xs={12} md={6} id="PackingMethodId">
                <RHFSelectMenuItem
                  size="small"
                  defaultValue=""
                  value={values.PackingMethodId}
                  // label={translate('Packing method')}
                  label={<LableStyle label={translate('Packing method')} isRequired />}
                // onChange={(e, newValue) => handleSelectPackingMethod(e, newValue)}
                >
                  {PackingMethodOptions.length > 0 &&
                    PackingMethodOptions.map((item) => (
                      <MenuItem key={item.Value} value={item.Value} onClick={() => handleSelectPackingMethodItem(item)} disabled={isViewOnly || currentInspection.IsFinished || currentInspection.Status.Packing}
                      >
                        {item.Caption}
                      </MenuItem>
                    ))}
                </RHFSelectMenuItem>
                {errors?.PackingMethodId?.message && (
                  <FormHelperText sx={{ color: (theme) => theme.palette.error.main }}>
                    {errors?.PackingMethodId?.message} *
                  </FormHelperText>
                )}
              </Grid>
            </Grid>
          </Box>
        </Scrollbar>


        {/* {!isKeyboardOpen && */}
        <Grid
          container
          spacing={lgUp ? 2 : 1}
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
        >
          <Grid item xs={6} sm={6} md={3} >
            <LoadingButton
              variant="outlined"
              fullWidth
              // type="submit"
              disabled={isViewOnly || currentInspection.IsFinished || currentInspection.Status.Packing}
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
                backgroundColor: currentInspection.Status.Packing
                  ? theme.palette.primary.main
                  : theme.palette.info.main,
                '&:hover': {
                  backgroundColor: currentInspection.Status.Packing
                    ? theme.palette.primary.main
                    : theme.palette.info.main,
                },
              }}
              fullWidth
              type="submit"
              disabled={isViewOnly || currentInspection.IsFinished}
              loading={isSubmitting}
            >
              {!currentInspection.Status.Packing ? 'Complete' : 'Completed'}
            </LoadingButton>

          </Grid>
        </Grid>
        {/* } */}
      </FormProvider>
    </Stack>
  );
};

export default memo(Packing);



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