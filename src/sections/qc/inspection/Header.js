import { yupResolver } from '@hookform/resolvers/yup';
import { LoadingButton } from '@mui/lab';
import PropTypes from 'prop-types';
import { Autocomplete, Box, Divider, Grid, Stack, TextField, Typography } from '@mui/material';
import { useLiveQuery } from 'dexie-react-hooks';
import _ from 'lodash';
import { useSnackbar } from 'notistack';
import { memo, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import useDetectKeyboardOpen from "use-detect-keyboard-open";
import * as Yup from 'yup';
import { db } from '../../../Db';
import LoadingBackDrop from '../../../components/BackDrop';
import Iconify from '../../../components/Iconify';
import Scrollbar from '../../../components/Scrollbar';
import { FormProvider, RHFTextField } from '../../../components/hook-form/index';
import { HEADER, NOTCH_HEIGHT } from '../../../config';
import useLocales from '../../../hooks/useLocales';
import IconName from '../../../utils/iconsName';
import DetailSummary from './DetailSummary';


const BREAKCRUM_HEIGHT = 78;
const STEP_HEADER_HEIGHT = 56;
const SPACING = 100;
const DETAIL_SUMARY = 90;


InspectionHeader.propTypes = {
  theme: PropTypes.any,
  currentInspection: PropTypes.object,
  isViewOnly: PropTypes.bool,
  handleNext: PropTypes.func,
};

function InspectionHeader({
  theme,
  currentInspection,
  isViewOnly,
  handleNext,
}) {

  // Hooks
  const { translate } = useLocales();
  const { enqueueSnackbar } = useSnackbar();
  const isKeyboardOpen = useDetectKeyboardOpen();

  // INDEXED DB
  const Enums = useLiveQuery(() => db?.Enums.toArray()) || [];
  const SettingList = useLiveQuery(() => db?.SettingList.toArray()) || [];
  const FactoryLines = useLiveQuery(() => db?.FactoryLines.toArray()) || [];


  const defaultValues = useMemo(
    () => ({
      AQLLevelMajor:
        currentInspection?.Header?.AQLLevelMajor === null ? '' : currentInspection?.Header?.AQLLevelMajor || '',
      AQLLevelMajorId:
        currentInspection?.Header?.AQLLevelMajorId === null ? '' : currentInspection?.Header?.AQLLevelMajorId || '',
      AQLLevelMinor: currentInspection?.Header?.AQLLevelMinor || '',
      AQLLevelMinorId: currentInspection?.Header?.AQLLevelMinorId || '',
      Comment: currentInspection?.Header?.Comment || '',
      Remark: currentInspection?.Header?.Remark || '',
      QCLevel: currentInspection?.Header?.QCLevel || '',
      QCLevelId: currentInspection?.Header?.QCLevelId || '',
      FactoryLineId: currentInspection?.Header?.FactoryLineId || "",
      FactoryLineName: currentInspection?.Header?.FactoryLineName || "",
    }),
    [currentInspection]
  );

  const stepScheme = Yup.object().shape({
    FactoryLineId: Yup.string().required(`FactoryLine id ${translate('formValidate.isRequired')}`),
    Remark: Yup.string().required(`Remark ${translate('formValidate.isRequired')}`),
  });

  const methods = useForm({
    resolver: yupResolver(stepScheme),
    defaultValues,
  });


  const {
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting, errors, },
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

  const QCLevels = Enums.length > 0 && Enums.find((d) => d.Name === 'QCFormulaLevel')?.Elements || [];
  const QCFormulaAQL = Enums.length > 0 && Enums.find((d) => d.Name === 'QCFormulaAQL')?.Elements || [];

  // Calculate setting for AQL and sample size info
  const calculateSettingConfig = async () => {
    const totalActualQuantity = _.sum(currentInspection.Contents.map((d) => d.ActualQuantity)) || 0;
    const MajorLevel = QCFormulaAQL.find((d) => d.Value === values.AQLLevelMajorId);
    const MinorLevel = QCFormulaAQL.find((d) => d.Value === values.AQLLevelMinorId);
    const findSetting = SettingList.find(
      (d) =>
        totalActualQuantity >= d.QuantityFrom &&
        totalActualQuantity <= d.QuantityTo &&
        d.LevelCodeId === values?.QCLevelId
    );
    // console.log(totalActualQuantity, MajorLevel, MajorLevel, findSetting);
    if (findSetting) {
      await db.MqcInspection.where('Id')
        .equals(currentInspection.Id)
        .modify((x, ref) => {
          ref.value.Header = { ...currentInspection.Header, ...values, PickSampleQuantity: findSetting.SampleSize };
          ref.value.Status.Header = !currentInspection.Status.Header;
          ref.value.Summary = {
            ...currentInspection.Summary,
            MajorDefectAllow: findSetting[MajorLevel?.Code] || 0,
            MinorDefectAllow: findSetting[MinorLevel?.Code] || 0,
            CriticalDefectAllow: 0,
          };
        });
    } else {
      await db.MqcInspection.where('Id')
        .equals(currentInspection.Id)
        .modify((x, ref) => {
          ref.value.Header = { ...currentInspection.Header, ...values, PickSampleQuantity: null };
          ref.value.Status.Header = !currentInspection.Status.Header;
          ref.value.Summary = {
            ...currentInspection.Summary,
            MajorDefectAllow: 0,
            MinorDefectAllow: 0,
            CriticalDefectAllow: 0,
          };
        });
    }
  };

  // TH1: Nếu trong các dòng ContentLines có PickSampleQuantity != null => thực hiện các bước sau
  const calculateSettingBaseOnCustomPickSampleQuantity = async (totalPickSampleQty) => {
    const MajorLevel = QCFormulaAQL.find((d) => d.Value === values.AQLLevelMajorId);
    const MinorLevel = QCFormulaAQL.find((d) => d.Value === values.AQLLevelMinorId);
    const findSetting = SettingList.filter(
      (d) =>
        totalPickSampleQty >= d.SampleSize &&
        d.LevelCodeId === values?.QCLevelId
    );
    // console.log(findSetting)
    if (findSetting.length > 0) {
      const getMaxSampleSize = _.maxBy(findSetting, (o) => o.SampleSize);
      // console.log(getMaxSampleSize);
      await db.MqcInspection.where('Id')
        .equals(currentInspection.Id)
        .modify((x, ref) => {
          ref.value.Header = { ...currentInspection.Header, ...values, PickSampleQuantity: totalPickSampleQty };
          ref.value.Status.Header = !currentInspection.Status.Header;
          ref.value.Summary = {
            ...currentInspection.Summary,
            MajorDefectAllow: getMaxSampleSize[MajorLevel?.Code] || 0,
            MinorDefectAllow: getMaxSampleSize[MinorLevel?.Code] || 0,
            CriticalDefectAllow: 0,
          };
        });
    } else {
      await db.MqcInspection.where('Id')
        .equals(currentInspection.Id)
        .modify((x, ref) => {
          ref.value.Header = { ...currentInspection.Header, ...values, PickSampleQuantity: totalPickSampleQty };
          ref.value.Status.Header = !currentInspection.Status.Header;
          ref.value.Summary = {
            ...currentInspection.Summary,
            MajorDefectAllow: 0,
            MinorDefectAllow: 0,
            CriticalDefectAllow: 0,
          };
        });
    }
  }

  const setCompleteStep = async () => {
    try {
      if (!currentInspection.Status.Header) {
        const pickSampleQuantity = currentInspection.Contents.filter(d => d.PickSampleQuantity !== null && d.PickSampleQuantity > 0);
        if (pickSampleQuantity.length > 0) {
          console.log('TH1:');
          const totalPickSampleQty = _.sumBy(pickSampleQuantity, o => o.PickSampleQuantity);
          calculateSettingBaseOnCustomPickSampleQuantity(totalPickSampleQty)
        } else {
          console.log('TH2:')
          calculateSettingConfig();
        }
        handleNext();
      } else {
        await db.MqcInspection.where('Id')
          .equals(currentInspection.Id)
          .modify((x, ref) => {
            ref.value.Status.Header = !currentInspection.Status.Header;
          });
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar(JSON.stringify(error), {
        variant: 'error',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center',
        },
      });
    }
  };

  // console.log(values);


  const filteredFactory = FactoryLines.filter(d => {
    if (currentInspection?.SubFactoryId !== null && currentInspection?.SubFactoryId !== undefined && currentInspection?.SubFactoryId !== "") {
      return d?.FactoryId === currentInspection?.SubFactoryId
    }
    return d?.FactoryId === currentInspection?.FactoryId
  }
  ) || [];


  // console.log('isKeyboardOpen',
  //   values,
  //   // register('Remark')
  //   // filteredFactory,
  //   // currentInspection,
  //   // FactoryLines,
  //   // errors, 
  //   // Object.keys(errors),
  //   // FactoryLines, Enums, SettingList,
  //   // Enums,
  //   // isKeyboardOpen,
  // );

  return (
    <Stack spacing={2} sx={{ height: '100%' }}>
      <DetailSummary currentInspection={currentInspection} />
      <Divider />
      <FormProvider methods={methods} onSubmit={handleSubmit(setCompleteStep)}>
        <Scrollbar>
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
            <Grid container spacing={3} pb={5}>
              <Grid item xs={12} md={6} id="FactoryLineId">
                <Autocomplete
                  autoComplete
                  blurOnSelect
                  onChange={(event, newValue) => {
                    if (errors.FactoryLineId) {
                      delete errors.FactoryLineId
                    }
                    setValue('FactoryLineId', newValue?.Id || '');
                    setValue('FactoryLineName', newValue?.Name || '');
                  }}
                  defaultValue={filteredFactory.find((d) => d?.Id === values?.FactoryLineId) || null}
                  value={filteredFactory.find((d) => d?.Id === values?.FactoryLineId) || null}
                  getOptionLabel={(option) => {
                    return option?.Name === undefined ? '' : `${option?.Name}` || '';
                  }}
                  options={filteredFactory.sort((a, b) => -b?.Name.localeCompare(a?.Name)) || []}
                  size="small"
                  autoHighlight
                  sx={{ width: '100%', minWidth: 150 }}
                  renderInput={(params) => <TextField
                    {...params}
                    fullWidth
                    onFocus={(event) => {
                      event.target.select();
                    }}
                    size="small"
                    label={
                      <Stack direction="row" justifyContent="center" alignItems="center">
                        <Iconify icon={IconName.search} />
                        <p className="ml-1 mr-1">{'Factory Lines'}</p>
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
                    {...(errors?.FactoryLineId && { error: true, helperText: errors?.FactoryLineId?.message })}
                  />}
                  noOptionsText={<Typography>Search not found</Typography>}
                  renderOption={(props, option) => {
                    return (
                      <Box component="li" {...props}>
                        {option?.Name}
                      </Box>
                    );
                  }}
                  isOptionEqualToValue={(option, value) => {
                    return `${option?.Id}` === `${value?.Id}`;
                  }}
                  readOnly={isViewOnly || currentInspection?.Status?.Header}
                />
              </Grid>

              <Grid item xs={12} md={6} id="QCLevelId">
                <Autocomplete
                  blurOnSelect
                  autoComplete
                  onChange={(event, newValue) => {
                    setValue('QCLevel', newValue?.Caption || '');
                    setValue('QCLevelId', newValue?.Value || '');
                  }}
                  defaultValue={QCLevels.find((d) => d?.Caption === values?.QCLevel) || null}
                  value={QCLevels.find((d) => d?.Caption === values?.QCLevel) || null}
                  getOptionLabel={(option) => {
                    // console.log(option);
                    return option?.Caption === undefined ? '' : `${option?.Caption}` || '';
                  }}
                  options={QCLevels.sort((a, b) => -b?.Caption.localeCompare(a?.Caption)) || []}
                  size="small"
                  autoHighlight
                  sx={{ width: '100%', minWidth: 150 }}
                  renderInput={(params) => <RenderInput params={params} label="QC Level" />}
                  noOptionsText={<Typography>Search not found</Typography>}
                  renderOption={(props, option) => {
                    return (
                      <Box component="li" {...props}>
                        {option?.Caption}
                      </Box>
                    );
                  }}
                  isOptionEqualToValue={(option, value) => {
                    return `${option?.Caption}` === `${value?.Caption}`;
                  }}
                  readOnly={isViewOnly || currentInspection?.Status?.Header}
                />
              </Grid>

              <Grid item xs={12} md={6} id="AQLLevelMajorId">
                <Autocomplete
                  autoComplete
                  onChange={(event, newValue) => {
                    setValue('AQLLevelMajor', newValue?.Caption || '');
                    setValue('AQLLevelMajorId', newValue?.Value || '');
                  }}
                  defaultValue={QCFormulaAQL.find((d) => d?.Caption === values?.AQLLevelMajor) || null}
                  value={QCFormulaAQL.find((d) => d?.Caption === values?.AQLLevelMajor) || null}
                  getOptionLabel={(option) => {
                    // console.log(option);
                    return option?.Caption === undefined ? '' : `${option?.Caption}` || '';
                  }}
                  options={QCFormulaAQL.sort((a, b) => -b?.Caption.localeCompare(a?.Caption)) || []}
                  size="small"
                  autoHighlight
                  sx={{ width: '100%', minWidth: 150 }}
                  renderInput={(params) => <RenderInput params={params} label="AQL Major" />}
                  noOptionsText={<Typography>Search not found</Typography>}
                  renderOption={(props, option) => {
                    return (
                      <Box component="li" {...props}>
                        {option?.Caption}
                      </Box>
                    );
                  }}
                  isOptionEqualToValue={(option, value) => {
                    return `${option?.Caption}` === `${value?.Caption}`;
                  }}
                  readOnly={isViewOnly || currentInspection?.Status?.Header}
                />
              </Grid>

              <Grid item xs={12} md={6} id="AQLLevelMinorId">
                <Autocomplete
                  blurOnSelect
                  autoComplete
                  onChange={(event, newValue) => {
                    setValue('AQLLevelMinor', newValue?.Caption || '');
                    setValue('AQLLevelMinorId', newValue?.Value || '');
                  }}
                  defaultValue={QCFormulaAQL.find((d) => d?.Caption === values?.AQLLevelMinor) || null}
                  value={QCFormulaAQL.find((d) => d?.Caption === values?.AQLLevelMinor) || null}
                  getOptionLabel={(option) => {
                    // console.log(option);
                    return option?.Caption === undefined ? '' : `${option?.Caption}` || '';
                  }}
                  options={QCFormulaAQL.sort((a, b) => -b?.Caption.localeCompare(a?.Caption)) || []}
                  size="small"
                  autoHighlight
                  sx={{ width: '100%', minWidth: 150 }}
                  renderInput={(params) => <RenderInput params={params} label="AQL Minor" />}
                  noOptionsText={<Typography>Search not found</Typography>}
                  renderOption={(props, option) => {
                    // console.log(option);
                    return (
                      <Box component="li" {...props}>
                        {option?.Caption}
                      </Box>
                    );
                  }}
                  isOptionEqualToValue={(option, value) => {
                    // console.log(option, value);
                    return `${option?.Caption}` === `${value?.Caption}`;
                  }}
                  readOnly={isViewOnly || currentInspection?.Status?.Header}
                />
              </Grid>

              <Grid item xs={12} md={6} id="Comment">
                <RHFTextField
                  name="Comment"
                  size="small"
                  label={translate('comment')}
                  multiline
                  rows={8}
                  InputProps={{
                    readOnly: isViewOnly || currentInspection?.Status?.Header,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6} id="Remark">
                <RHFTextField
                  name="Remark"
                  size="small"
                  label={translate('remark')}
                  multiline
                  rows={8}
                  isRequired
                  InputProps={{
                    readOnly: isViewOnly || currentInspection?.Status?.Header,
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        </Scrollbar>


        {/* {!isKeyboardOpen && */}
        <Stack
          justifyContent={'flex-end'}
          width={'100%'}
          alignItems="flex-end"
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
          }}
        >
          <Stack
            width={{
              xs: '100%',
              sm: '100%',
              md: '25%',
            }}
          >
            <LoadingButton
              variant={'contained'}
              sx={{
                backgroundColor: currentInspection.Status.Header
                  ? theme.palette.primary.main
                  : theme.palette.info.main,
                minWidth: 200,
                '&:hover': {
                  backgroundColor: currentInspection.Status.Header
                    ? theme.palette.primary.main
                    : theme.palette.info.main
                },
                width: '100%',
                color: 'white',
              }}
              fullWidth
              type="submit"
              disabled={currentInspection.IsFinished || isViewOnly}
              loading={isSubmitting}
            >
              {!currentInspection.Status.Header ? 'Complete' : 'Completed'}
            </LoadingButton>
          </Stack>
        </Stack>
        {/* } */}
      </FormProvider>

      <LoadingBackDrop loading={FactoryLines.length === 0} text={translate('loading')} />

    </Stack>

  );
};

export default memo(InspectionHeader);


RenderInput.propTypes = {
  params: PropTypes.any,
  label: PropTypes.string,
  other: PropTypes.any,
};

// Render Input
function RenderInput({ params, label, ...other }) {
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
          <p className="ml-1">{label}</p>
        </Stack>
      }
      InputLabelProps={{
        style: { color: 'var(--label)' },
        shrink: true,
      }}
      {...other}
    />
  );
};



