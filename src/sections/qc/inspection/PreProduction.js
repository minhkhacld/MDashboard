import { yupResolver } from '@hookform/resolvers/yup';
import { LoadingButton } from '@mui/lab';
import PropTypes from 'prop-types';
import { Box, Divider, FormHelperText, Grid, MenuItem, Stack } from '@mui/material';
import { useSnackbar } from 'notistack';
import { memo, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import useDetectKeyboardOpen from "use-detect-keyboard-open";
import * as Yup from 'yup';
import { FormProvider, RHFSelectMenuItem, RHFSwitch, RHFTextField } from '../../../components/hook-form/index';
import useLocales from '../../../hooks/useLocales';
import DetailSummary from './DetailSummary';
// COMPONENTS
import Scrollbar from '../../../components/Scrollbar';
import { HEADER, NOTCH_HEIGHT } from '../../../config';
import { db } from '../../../Db';


const BREAKCRUM_HEIGHT = 78;
const STEP_HEADER_HEIGHT = 56;
const SPACING = 90;
const DETAIL_SUMARY = 90;


PreProduction.propTypes = {
  theme: PropTypes.any,
  currentInspection: PropTypes.object,
  isViewOnly: PropTypes.bool,
  handleNext: PropTypes.func,
  Enums: PropTypes.any,
};

function PreProduction({
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
      IsTestReport: currentInspection?.PreProduction?.IsTestReport || false,
      TestReportComment:
        currentInspection?.PreProduction?.TestReportComment !== null
          ? currentInspection?.PreProduction?.TestReportComment
          : '',
      PPMettingStatusId:
        currentInspection?.PreProduction?.PPMettingStatusId !== null
          ? currentInspection?.PreProduction?.PPMettingStatusId
          : '',
      PPMettingStatus: currentInspection?.PreProduction?.PPMettingStatus || false,
      PPMettingComment:
        currentInspection?.PreProduction?.PPMettingComment !== null
          ? currentInspection?.PreProduction?.PPMettingComment
          : '' || '',
      FabricAndLiningStatusId:
        currentInspection?.PreProduction?.FabricAndLiningStatusId !== null
          ? currentInspection?.PreProduction?.FabricAndLiningStatusId
          : '' || '',
      FabricAndLiningStatus: currentInspection?.PreProduction?.FabricAndLiningStatus || false,
      FabricAndLiningComment:
        currentInspection?.PreProduction?.FabricAndLiningComment !== null
          ? currentInspection?.PreProduction?.FabricAndLiningComment
          : '' || '',
      TrimStatusId:
        currentInspection?.PreProduction?.TrimStatusId !== null
          ? currentInspection?.PreProduction?.TrimStatusId
          : '' || '',
      TrimStatus: currentInspection?.PreProduction?.TrimStatus || false,
      TrimComment:
        currentInspection?.PreProduction?.TrimComment !== null
          ? currentInspection?.PreProduction?.TrimComment
          : '' || '',
    }),
    [currentInspection]
  );

  const isFinal = currentInspection.QCType === 'Final';

  const stepScheme = Yup.object().shape({
    IsTestReport: Yup.boolean().oneOf([true], `Test report ${translate('formValidate.isRequired')}`),
    TestReportComment: Yup.string().required(`Test report comment ${translate('formValidate.isRequired')}`),
    TrimStatusId: Yup.string().oneOf([`57555`], `Test report ${translate('formValidate.isRequired')}`),
    TrimComment: Yup.string().required(`Trim comment ${translate('formValidate.isRequired')}`),
    FabricAndLiningStatusId: Yup.string().oneOf([`57554`, `64840`], `Fabric status ${translate('formValidate.isRequired')}`),
    FabricAndLiningComment: Yup.string().required(`Fabric and linning comment ${translate('formValidate.isRequired')}`),
    ...(currentInspection.QCType !== `Final` && {
      PPMettingStatusId: Yup.string().oneOf([`57551`, `58535`], `PP Metting status ${translate('formValidate.isRequired')}`),
      PPMettingComment: Yup.string().required(`PP meeting comment ${translate('formValidate.isRequired')}`),
    }),
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

  // HANDLE SAVE PREPRODUCTION
  const handleSave = async () => {
    try {
      await db.MqcInspection.where('Id')
        .equals(currentInspection.Id)
        .modify((x, ref) => {
          // console.log('default', x, ref);
          // Set newvalue to preproduction
          ref.value.PreProduction = values;
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

  // console.log(values);
  const PPMettingStatusOption = Enums.find((d) => d.Name === 'PPMettingStatus')?.Elements || [];
  const FabricAndLiningStatusOption = Enums.find((d) => d.Name === 'FabricAndLiningStatus')?.Elements || [];
  const TrimStatusStatusOption = Enums.find((d) => d.Name === 'TrimStatus')?.Elements || [];

  const handleSelectPPMeetingStatus = (e, newValue) => {
    if (errors.PPMettingStatusId) {
      delete errors.PPMettingStatusId

    }
    setValue('PPMettingStatus', newValue.props.children);
    setValue('PPMettingStatusId', newValue.props.value);
  };

  const handleSelectFabricAndLiningStatus = (e, newValue) => {
    if (errors.FabricAndLiningStatusId) {
      delete errors.FabricAndLiningStatusId

    }
    setValue('FabricAndLiningStatus', newValue.props.children);
    setValue('FabricAndLiningStatusId', newValue.props.value);
  };

  const handleSelectTrimStatus = (e, newValue) => {
    if (errors.TrimStatusId) {
      delete errors.TrimStatusId

    }
    setValue('TrimStatus', newValue.props.children);
    setValue('TrimStatusId', newValue.props.value);
  };

  const setCompleteStep = async () => {
    try {
      if (!currentInspection.Status.PreProduction) {
        await db.MqcInspection.where('Id')
          .equals(currentInspection.Id)
          .modify((x, ref) => {
            ref.value.PreProduction = values;
            ref.value.Status.PreProduction = !currentInspection.Status.PreProduction;
          });
        // carouselRef.current?.slickNext();
        handleNext();
      } else {
        await db.MqcInspection.where('Id')
          .equals(currentInspection.Id)
          .modify((x, ref) => {
            ref.value.Status.PreProduction = !currentInspection.Status.PreProduction;
          });
        // enqueueSnackbar(
        //   !currentInspection.Status.PreProduction
        //     ? 'Step has been change to Completed status'
        //     : 'Step has been change to Uncompleted status',
        //   {
        //     variant: 'success',
        //     anchorOrigin: {
        //       vertical: 'top',
        //       horizontal: 'center',
        //     },
        //   }
        // );
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
      <Box      >
        <FormProvider
          methods={methods}
          onSubmit={handleSubmit(setCompleteStep)}
        >
          <Scrollbar >
            <Box sx={{
              // height: '100%' 
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
              <Grid container rowSpacing={3} columnSpacing={2} pb={5}>
                <Grid item xs={12} md={6} id="IsTestReport">
                  <RHFSwitch
                    name="IsTestReport"
                    label={<LableStyle label="Test report" isRequired />}
                    // checked={values.IsTestReport === 'YES' || values.IsTestReport === true}
                    disabled={
                      isViewOnly || currentInspection?.Status?.PreProduction
                    }

                  />
                  {errors.IsTestReport?.message && (
                    <FormHelperText sx={{ color: (theme) => theme.palette.error.main }}>
                      {errors?.IsTestReport?.message} *
                    </FormHelperText>
                  )}
                </Grid>
                <Grid item xs={12} md={6} id="TestReportComment">
                  <RHFTextField name="TestReportComment" size="small" label={'Test report comment'} multiline rows={4} isRequired
                    InputProps={{
                      readOnly: isViewOnly || currentInspection?.Status?.PreProduction,
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6} id="PPMettingStatusId">
                  <RHFSelectMenuItem
                    size="small"
                    defaultValue=""
                    name="PPMettingStatusId"
                    value={values.PPMettingStatusId}
                    // label={translate('PP meeting status')}
                    label={<LableStyle label={translate('PP meeting status')} isRequired={currentInspection.QCType !== `Final`} />}
                    onChange={(e, newValue) => handleSelectPPMeetingStatus(e, newValue)}

                  >
                    {PPMettingStatusOption.length > 0 &&
                      PPMettingStatusOption.map((item) => (
                        <MenuItem key={item.Value} value={item.Value} disabled={
                          isViewOnly || currentInspection?.Status?.PreProduction
                        }>
                          {item.Caption}
                        </MenuItem>
                      ))}
                  </RHFSelectMenuItem>

                </Grid>
                <Grid item xs={12} md={6} id="PPMettingComment">
                  <RHFTextField name="PPMettingComment" size="small" label={'PP meeting comment'} multiline rows={4} isRequired={currentInspection.QCType !== `Final`}
                    InputProps={{
                      readOnly: isViewOnly || currentInspection?.Status?.PreProduction,
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6} >
                  <RHFSelectMenuItem
                    size="small"
                    defaultValue=""
                    name="FabricAndLiningStatusId"
                    value={values.FabricAndLiningStatusId}
                    // label={translate('Fabric and Lining status')}
                    label={<LableStyle label={translate('Fabric and Lining status')} isRequired />}
                    onChange={(e, newValue) => handleSelectFabricAndLiningStatus(e, newValue)}
                    id="FabricAndLiningStatusId"
                  >
                    {FabricAndLiningStatusOption.length > 0 &&
                      FabricAndLiningStatusOption.map((item) => (
                        <MenuItem key={item.Value} value={item.Value} disabled={
                          isViewOnly || currentInspection?.Status?.PreProduction
                        }>
                          {item.Caption}
                        </MenuItem>
                      ))}
                  </RHFSelectMenuItem>

                </Grid>
                <Grid item xs={12} md={6}>
                  <RHFTextField
                    name="FabricAndLiningComment"
                    size="small"
                    label={'Fabric and Lining comment'}
                    multiline
                    rows={4}
                    id="FabricAndLiningComment"
                    isRequired
                    InputProps={{
                      readOnly: isViewOnly || currentInspection?.Status?.PreProduction,
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <RHFSelectMenuItem
                    size="small"
                    defaultValue=""
                    name="TrimStatusId"
                    value={values.TrimStatusId}
                    // label={translate('Trim status')}
                    label={<LableStyle label={translate('Trim status')} isRequired />}
                    onChange={(e, newValue) => handleSelectTrimStatus(e, newValue)}
                    id="TrimStatusId"
                  >
                    {TrimStatusStatusOption.length > 0 &&
                      TrimStatusStatusOption.map((item) => (
                        <MenuItem key={item.Value} value={item.Value} disabled={
                          isViewOnly || currentInspection?.Status?.PreProduction
                        }>
                          {item.Caption}
                        </MenuItem>
                      ))}
                  </RHFSelectMenuItem>

                </Grid>
                <Grid item xs={12} md={6}>
                  <RHFTextField name="TrimComment" size="small" label={'Trim status comment'} multiline rows={4} id="TrimComment" isRequired
                    InputProps={{
                      readOnly: isViewOnly || currentInspection?.Status?.PreProduction,
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6} />

              </Grid>
            </Box>
          </Scrollbar>

          {/* {!isKeyboardOpen && */}
          <Grid
            container
            spacing={2}
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
            <Grid item xs={6} sm={6} md={3}>
              <LoadingButton
                variant="outlined"
                fullWidth
                sx={{ minWidth: 150 }}
                loading={isSubmitting}
                disabled={isViewOnly || currentInspection.IsFinished || currentInspection.Status.PreProduction}
                onClick={handleSave}
              >
                {translate('button.save')}
              </LoadingButton>
            </Grid>
            <Grid item xs={6} sm={6} md={3}>
              <LoadingButton
                variant={'contained'}
                sx={{
                  backgroundColor: currentInspection.Status.PreProduction
                    ? theme.palette.primary.main
                    : theme.palette.info.main,
                  minWidth: 150,
                  '&:hover': {
                    backgroundColor: currentInspection.Status.PreProduction
                      ? theme.palette.primary.main
                      : theme.palette.info.main,
                  },
                }}
                type="submit"
                fullWidth
                loading={isSubmitting}
                disabled={isViewOnly || currentInspection.IsFinished}
              >
                {!currentInspection.Status.PreProduction ? 'Complete' : 'Completed'}
              </LoadingButton>
            </Grid>
          </Grid>
          {/* } */}
        </FormProvider>
      </Box>
    </Stack >
  );
};

export default memo(PreProduction);


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