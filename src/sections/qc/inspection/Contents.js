import { yupResolver } from '@hookform/resolvers/yup';
import { LoadingButton } from '@mui/lab';
import { Box, Divider, Grid, Stack, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { Popup, ScrollView } from 'devextreme-react';
import { List, SearchEditorOptions } from 'devextreme-react/list';
import { useLiveQuery } from 'dexie-react-hooks';
import _ from 'lodash';
import moment from 'moment';
import { useSnackbar } from 'notistack';
import { memo, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import useDetectKeyboardOpen from "use-detect-keyboard-open";
import * as Yup from 'yup';
import { db } from '../../../Db';
import { FormProvider, RHFCheckbox, RHFTextField } from '../../../components/hook-form/index';
import { HEADER, NOTCH_HEIGHT } from '../../../config';
import useLocales from '../../../hooks/useLocales';
import useResponsive from '../../../hooks/useResponsive';
import { transformNullToZero } from '../../../utils/tranformNullToZero';
import DetailSummary from './DetailSummary';


const BREAKCRUM_HEIGHT = 78;
const STEP_HEADER_HEIGHT = 56;
const DETAIL_SUMARY = 90;

InspectionContents.propTypes = {
  theme: PropTypes.any,
  currentInspection: PropTypes.object,
  isViewOnly: PropTypes.bool,
  handleNext: PropTypes.func
};

function InspectionContents({ theme, currentInspection, isViewOnly, handleNext }) {
  // Hooks
  const { translate } = useLocales();
  const smUp = useResponsive('up', 'sm');
  const mdUp = useResponsive('up', 'md');
  const { enqueueSnackbar } = useSnackbar();
  const isKeyboardOpen = useDetectKeyboardOpen()
  // Dexie js
  const Enums = useLiveQuery(() => db?.Enums.toArray()) || [];
  const SettingList = useLiveQuery(() => db?.SettingList.toArray()) || [];

  // COMPONENT STATES
  const [modalContent, setModalContent] = useState({
    visible: false,
    item: null,
  });

  const defaultValues = useMemo(
    () => ({
      PO: '',
      StyleNo: '',
      Quantity: 0,
      IsPPApprove: false,
      CuttingQty: 0,
      InputQty: 0,
      OutputQty: 0,
      PressingQty: 0,
      PackingQty: 0,
      ActualQuantity: 0,
      DueDate: '',
      PickSampleQuantity: null,
    }),
    [currentInspection]
  );

  // If Inline;
  // If not inline;

  const stepScheme = Yup.object().shape({
    Quantity: Yup.number().moreThan(0, `Quantity ${translate('formValidate.moreThan')}`),
    CuttingQty: Yup.number().moreThan(0, `Cutting quantity ${translate('formValidate.moreThan')}`),
    InputQty: Yup.number().moreThan(0, `Input quantity ${translate('formValidate.moreThan')}`),
    ...(currentInspection.QCType === `InLine` && {
      OutputQty: Yup.number().min(0, `Output quantity ${translate('formValidate.moreThanOrEqualTo')} 0`),
      PressingQty: Yup.number().min(0, `Pressing quantity ${translate('formValidate.moreThanOrEqualTo')} 0`),
      PackingQty: Yup.number().min(0, `Packing quantity ${translate('formValidate.moreThanOrEqualTo')} 0`),
    }),
    ActualQuantity: Yup.number().moreThan(0, `Actual quantity ${translate('formValidate.moreThan')}`),
    ...(currentInspection.QCType !== "InLine" && {
      OutputQty: Yup.number().moreThan(0, `Output quantity ${translate('formValidate.moreThan')}`),
      PressingQty: Yup.number().moreThan(0, `Pressing quantity ${translate('formValidate.moreThan')}`),
      PackingQty: Yup.number().moreThan(0, `Packing quantity ${translate('formValidate.moreThan')}`),
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

  // const QCLevels = Enums.find((d) => d.Name === 'QCFormulaLevel')?.Elements || [];
  const QCFormulaAQL = Enums.find((d) => d.Name === 'QCFormulaAQL')?.Elements || [];

  const handleSetModalItem = (data) => {
    setModalContent({ visible: true, item: data });
    Object.keys(data).forEach((key) => {
      if (key === 'DueDate') {
        setValue(key, data[key] === null || data[key] === '' ? '' : data[key]);
      } else {
        setValue(key, data[key] === null ? transformNullToZero(data[key]) : data[key]);
      }
    });
  };

  // HANDLE SAVE PREPRODUCTION
  const handleSave = async () => {
    try {
      if (Object.keys(errors).length > 0) {
        return enqueueSnackbar(translate('inspection.content.fieldRequired'), {
          variant: 'error',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'center',
          },
        });
      }
      const contents = [...currentInspection.Contents,];
      const contentWithNumber = contents.map((d) => {
        if (d.Id === values.Id) {
          const newValues = values;
          newValues.CuttingQty = Number(newValues.CuttingQty);
          newValues.InputQty = Number(newValues.InputQty);
          newValues.OutputQty = Number(newValues.OutputQty);
          newValues.PressingQty = Number(newValues.PressingQty);
          newValues.PackingQty = Number(newValues.PackingQty);
          newValues.ActualQuantity = Number(newValues.ActualQuantity);
          newValues.Quantity = Number(newValues.Quantity);
          if (newValues.PickSampleQuantity === "" || newValues.PickSampleQuantity === 0 || newValues.PickSampleQuantity === "0" || newValues.PickSampleQuantity === null) {
            newValues.PickSampleQuantity = 0;
          } else {
            newValues.PickSampleQuantity = Number(newValues.PickSampleQuantity);
          }
          return newValues;
        }
        return d;
      });

      // const itemIndex = contents.findIndex((d) => d);
      await db.MqcInspection.where('Id')
        .equals(currentInspection.Id)
        .modify((x, ref) => {
          // console.log('default', x, ref);
          // Set newvalue to preproduction
          ref.value.Contents = contents.map((d) => {
            if (d.Id === values.Id) {
              const newValues = values;
              newValues.CuttingQty = Number(newValues.CuttingQty);
              newValues.InputQty = Number(newValues.InputQty);
              newValues.OutputQty = Number(newValues.OutputQty);
              newValues.PressingQty = Number(newValues.PressingQty);
              newValues.PackingQty = Number(newValues.PackingQty);
              newValues.ActualQuantity = Number(newValues.ActualQuantity);
              newValues.Quantity = Number(newValues.Quantity);
              if (newValues.PickSampleQuantity === "" || newValues.PickSampleQuantity === 0 || newValues.PickSampleQuantity === "0" || newValues.PickSampleQuantity === null) {
                newValues.PickSampleQuantity = null;
              } else {
                newValues.PickSampleQuantity = Number(newValues.PickSampleQuantity);
              }
              return newValues;
            }
            return d;
          });
          // Assign item property to Edit

          ref.value.IsEditing = true;
          ref.value.Header.PickSampleQuantity = _.sumBy(contentWithNumber, o => o.PickSampleQuantity);

        });
      setModalContent({ visible: false, item: null });

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

  // TH2: Nếu tất cả các dòng ContentLines có PickSampleQuantity == null =>tính theo rule sau:
  const calculateSettingConfig = async () => {
    const totalActualQuantity = _.sum(currentInspection.Contents.map((d) => Number(d.ActualQuantity))) || 0;
    const MajorLevel = QCFormulaAQL.find((d) => d.Value === currentInspection.Header.AQLLevelMajorId);
    const MinorLevel = QCFormulaAQL.find((d) => d.Value === currentInspection.Header.AQLLevelMinorId);
    const findSetting = SettingList.find(
      (d) =>
        totalActualQuantity >= d.QuantityFrom &&
        totalActualQuantity <= d.QuantityTo &&
        d.LevelCodeId === currentInspection.Header?.QCLevelId
    );
    // console.log(findSetting, totalActualQuantity);
    if (findSetting) {
      await db.MqcInspection.where('Id')
        .equals(currentInspection.Id)
        .modify((x, ref) => {
          ref.value.Header.PickSampleQuantity = findSetting.SampleSize;
          ref.value.Status.Contents = !currentInspection.Status.Contents;
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
          ref.value.Header.PickSampleQuantity = null;
          ref.value.Status.Contents = !currentInspection.Status.Contents;
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
  // Tính lại PickSampleQuantity của Header = Sum(Content.PickSampleQuantity)
  // Lấy setting bằng cách select từ SettingList (/api/QCMobileApi/GetSettingList) với điều kiện: SampleSize <= PickSampleQuantity and LevelCodeId = QCLevelId, sau đó order by SampleSize ascending và top 1
  // -Trường hợp setting != null thì set
  // CriticalDefectAllow = 0
  // MinorDefectAllow = setting.{minorCode} //vd minorCode = "A40" thì MinorDefectAllow = setting.A40
  // MajorDefectAllow = setting.{majorCode}
  // -Trường hợp setting == null thì set
  // MinorDefectAllow = null;
  // MajorDefectAllow = null;
  // CriticalDefectAllow = null;

  const calculateSettingBaseOnCustomPickSampleQuantity = async (totalPickSampleQty) => {
    const MajorLevel = QCFormulaAQL.find((d) => d.Value === currentInspection.Header.AQLLevelMajorId);
    const MinorLevel = QCFormulaAQL.find((d) => d.Value === currentInspection.Header.AQLLevelMinorId);
    const findSetting = SettingList.filter(
      (d) =>
        totalPickSampleQty >= d.SampleSize &&
        d.LevelCodeId === currentInspection.Header?.QCLevelId
    );
    if (findSetting.length > 0) {
      const getMaxSampleSize = _.maxBy(findSetting, (o) => o.SampleSize);
      // console.log(getMaxSampleSize);
      await db.MqcInspection.where('Id')
        .equals(currentInspection.Id)
        .modify((x, ref) => {
          // ref.value.Header.PickSampleQuantity = getMaxSampleSize.SampleSize;
          ref.value.Status.Contents = !currentInspection.Status.Contents;
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
          ref.value.Status.Contents = !currentInspection.Status.Contents;
          ref.value.Summary = {
            ...currentInspection.Summary,
            MajorDefectAllow: 0,
            MinorDefectAllow: 0,
            CriticalDefectAllow: 0,
          };
        });
    }
  }



  // SET STEP COMPLETED
  const setCompleteStep = async () => {
    try {
      const contents = [...currentInspection.Contents];
      const fieldToCheck =
        currentInspection.QCType !== 'InLine'
          ? ['InputQty', 'OutputQty', 'PressingQty', 'CuttingQty', 'PackingQty']
          : ['InputQty', 'CuttingQty'];
      const errorRows = [];
      contents.forEach((item) => {
        fieldToCheck.forEach((field) => {
          if (item[field] <= 0) {
            errorRows.push(item.StyleNo);
          }
        });
      });
      if (errorRows.length > 0) {
        return enqueueSnackbar(
          `Item ${[...new Set(errorRows)].join(', ')} ${translate('inspection.content.invalidComplete')}`,
          {
            variant: 'error',
            anchorOrigin: {
              vertical: 'top',
              horizontal: 'center',
            },
          }
        );
      }

      if (!currentInspection.Status.Contents) {
        // carouselRef.current?.slickNext();
        const pickSampleQuantity = contents.filter(d => d.PickSampleQuantity !== null && d.PickSampleQuantity > 0);
        if (pickSampleQuantity.length > 0) {
          console.log('TH1:');
          const totalPickSampleQty = _.sumBy(pickSampleQuantity, o => o.PickSampleQuantity);
          calculateSettingBaseOnCustomPickSampleQuantity(totalPickSampleQty)
        } else {
          console.log('TH2:')
          calculateSettingConfig();
        }
        handleNext();
      }
      else {

        await db.MqcInspection.where('Id')
          .equals(currentInspection.Id)
          .modify((x, ref) => {
            ref.value.Status.Contents = !currentInspection.Status.Contents;
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

  // RENDER LIST
  const itemTemplate = (data) => {
    return (
      <Stack justifyContent={'center'} onClick={() => handleSetModalItem(data)}>
        <Stack direction="row" justifyContent="space-between">
          <Stack direction="column" justifyContent="flex-start">
            <Typography variant="caption" paragraph color={theme.palette.error.dark} fontWeight={'bold'} mb={0}>
              {`PO: ${data?.PO}`}
            </Typography>
            <Typography variant="caption" paragraph mb={0} sx={{ wordBreak: 'break-word' }} whiteSpace="normal">
              {`${data?.StyleNo} - ${data?.Description} - ${data?.Color}`}
            </Typography>
            <Typography variant="caption" paragraph mb={0}>
              {`Qty: ${transformNullToZero(data?.Quantity)} - Pick sample quantity: ${transformNullToZero(data?.PickSampleQuantity)}`}
            </Typography>
            <Typography variant="caption" paragraph mb={0} sx={{ wordBreak: 'break-word' }} whiteSpace="normal">
              {`Cutting: ${transformNullToZero(data?.CuttingQty)} - Input:${transformNullToZero(
                data?.InputQty
              )} - Output:${transformNullToZero(data?.OutputQty)}`}
            </Typography>
            <Typography variant="caption" paragraph mb={0}>
              {`Pressing: ${transformNullToZero(data?.PressingQty)} - Packing: ${transformNullToZero(
                data?.PackingQty
              )}`}
            </Typography>
          </Stack>
        </Stack>
      </Stack>
    );
  };

  const SPACING = isKeyboardOpen ? 0 : 32 + 16 + 8 + 8 + 8;


  return (
    <Stack spacing={2} height="100%" >
      <DetailSummary currentInspection={currentInspection} />
      <Divider />
      <Box pb={3}>
        <List
          dataSource={currentInspection?.Contents}
          itemRender={itemTemplate}
          searchExpr={['PO', 'StyleNo', 'Color', 'Description']}
          {...theme.breakpoints.only('lg') && { height: `calc(100vh - ${HEADER.DASHBOARD_DESKTOP_HEIGHT + BREAKCRUM_HEIGHT + STEP_HEADER_HEIGHT + SPACING + DETAIL_SUMARY + NOTCH_HEIGHT}px)` }}
          {...theme.breakpoints.only('md') && { height: `calc(100vh - ${HEADER.MOBILE_HEIGHT + BREAKCRUM_HEIGHT + STEP_HEADER_HEIGHT + SPACING + DETAIL_SUMARY + NOTCH_HEIGHT}px)` }}
          {...theme.breakpoints.only('xs') && { height: `calc(100vh - ${HEADER.MOBILE_HEIGHT + BREAKCRUM_HEIGHT + STEP_HEADER_HEIGHT + SPACING + DETAIL_SUMARY + NOTCH_HEIGHT}px)` }}
          {...isKeyboardOpen && theme.breakpoints.only('xs') && {
            height: `calc(100vh - ${HEADER.DASHBOARD_DESKTOP_HEIGHT + BREAKCRUM_HEIGHT + SPACING + NOTCH_HEIGHT}px)`
          }}
          searchEnabled
          scrollingEnabled
          searchMode={'contains'}
          noDataText={translate('noDataText')}
          focusStateEnabled={false}
          collapsibleGroups
          pullRefreshEnabled
          refreshingText={translate("refreshing")}
          pageLoadingText={translate("loading")}
          pageLoadMode="scrollBottom"
          pulledDownText={translate('releaseToRefresh')}
          pullingDownText={translate('pullDownToRefresh')}
          selectionMode="multiple"
          selectAllMode="allPages"
          showScrollbar='always'
        >
          <SearchEditorOptions placeholder={`${translate('search')} PO, StyleNo, Color, Description`} showClearButton />
        </List>
      </Box>
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
              mt: 1,
              backgroundColor: currentInspection.Status.Contents ? theme.palette.primary.main : theme.palette.info.main,
              minWidth: 200,
              '&:hover': {
                backgroundColor: currentInspection.Status.Contents ? theme.palette.primary.main : theme.palette.info.main,
              },
            }}
            fullWidth={!smUp}
            onClick={setCompleteStep}
            disabled={currentInspection.IsFinished || isViewOnly}
            loading={isSubmitting}
          >
            {!currentInspection.Status.Contents ? 'Complete' : 'Completed'}
          </LoadingButton>
        </Stack>
      </Stack>
      {/* } */}

      {modalContent.visible ? (
        <PopUpContents
          methods={methods}
          modalContent={modalContent}
          setModalContent={setModalContent}
          translate={translate}
          mdUp={mdUp}
          handleSave={handleSave}
          currentInspection={currentInspection}
          isViewOnly={isViewOnly}
          handleSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          values={values}
          errors={errors}
          isKeyboardOpen={isKeyboardOpen}
        />
      ) : null}
    </Stack>
  );
};

export default memo(InspectionContents);


PopUpContents.propTypes = {
  methods: PropTypes.any,
  modalContent: PropTypes.any,
  setModalContent: PropTypes.func,
  translate: PropTypes.func,
  mdUp: PropTypes.bool,
  handleSave: PropTypes.func,
  currentInspection: PropTypes.object,
  isViewOnly: PropTypes.bool,
  handleSubmit: PropTypes.func,
  isSubmitting: PropTypes.bool,
  values: PropTypes.object,
  errors: PropTypes.any,
  isKeyboardOpen: PropTypes.bool,
};

function PopUpContents({
  methods,
  modalContent,
  setModalContent,
  translate,
  mdUp,
  handleSave,
  currentInspection,
  isViewOnly,
  handleSubmit,
  isSubmitting,
  values,
  errors,
  isKeyboardOpen
}) {

  const onClose = () => {
    setModalContent({ visible: false, item: null });
  };

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      const scrolElement = document.getElementById(Object.keys(errors)[0])
      if (scrolElement) {
        scrolElement.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }, [errors]);

  return (
    <Popup
      visible={modalContent.visible}
      onHiding={onClose}
      dragEnabled={false}
      hideOnOutsideClick
      showCloseButton
      showTitle
      title="2. Contents Detail"
      width={mdUp ? 700 : '100%'}
      height={mdUp ? '90%' : '100%'}
      animation={{
        show: {
          type: 'fade',
          duration: 400,
          from: 0,
          to: 1
        },
        hide: {
          type: 'fade',
          duration: 400,
          from: 1,
          to: 0
        }
      }}
    >
      <ScrollView >
        <FormProvider methods={methods} onSubmit={handleSubmit(handleSave)}>
          <Grid container rowSpacing={2} columnSpacing={2} sx={{ pb: 10, pt: 2 }}>
            <Grid item xs={12} md={6} id="PO">
              <RHFTextField
                name="PO"
                size="small"
                label={'PO'}
                multiline
                InputLabelProps={{
                  shrink: true,
                }}
                InputProps={{
                  readOnly: true,
                }}


              />
            </Grid>
            <Grid item xs={12} md={6} id="StyleNo">
              <RHFTextField
                name="StyleNo"
                size="small"
                label={'Style No'}
                multiline
                InputLabelProps={{
                  shrink: true,
                }}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>

            <Grid item xs={12} md={6} id="Quantity">
              <RHFTextField
                name="Quantity"
                size="small"
                label={translate('Quantity')}
                InputLabelProps={{
                  shrink: true,
                }}
                isRequired
                type="number"
                InputProps={{ inputProps: { min: 0, inputMode: 'decimal', }, readOnly: isViewOnly || currentInspection?.Status?.Contents }}
              />
            </Grid>
            <Grid item xs={12} md={6} id="IsPPApprove">
              <RHFCheckbox name="IsPPApprove" size="small" label={translate('PP metting')}
                disabled={isViewOnly || currentInspection?.Status?.Contents}
              />
            </Grid>

            <Grid item xs={12} md={6} id="CuttingQty">
              <RHFTextField
                name="CuttingQty"
                size="small"
                label={translate('Cutting quantity')}
                InputLabelProps={{
                  shrink: true,
                }}
                isRequired
                type="number"
                InputProps={{ inputProps: { min: 0, inputMode: 'decimal', }, readOnly: isViewOnly || currentInspection?.Status?.Contents }}
              />
            </Grid>

            <Grid item xs={12} md={6} id="InputQty">
              <RHFTextField
                name="InputQty"
                size="small"
                label={translate('Input Qty quantity')}
                InputLabelProps={{
                  shrink: true,
                }}
                isRequired
                type="number"
                InputProps={{ inputProps: { min: 0, inputMode: 'decimal', }, readOnly: isViewOnly || currentInspection?.Status?.Contents }}
              />
            </Grid>

            <Grid item xs={12} md={6} id="OutputQty">
              <RHFTextField
                name="OutputQty"
                size="small"
                label={translate('Output quantity')}
                InputLabelProps={{
                  shrink: true,
                }}
                isRequired
                type="number"
                InputProps={{ inputProps: { min: 0, inputMode: 'decimal', }, readOnly: isViewOnly || currentInspection?.Status?.Contents }}
              />
            </Grid>
            <Grid item xs={12} md={6} id="PressingQty">
              <RHFTextField
                name="PressingQty"
                size="small"
                label={translate('Pressing quantity')}
                InputLabelProps={{
                  shrink: true,
                }}
                isRequired
                // type="number"
                InputProps={{ inputProps: { min: 0, inputMode: 'decimal', }, readOnly: isViewOnly || currentInspection?.Status?.Contents }}
              />
            </Grid>
            <Grid item xs={12} md={6} id="PackingQty">
              <RHFTextField
                name="PackingQty"
                size="small"
                label={translate('Packing quantity')}
                InputLabelProps={{
                  shrink: true,
                }}
                isRequired={currentInspection.QCType !== 'InLine'}
                type="number"
                InputProps={{ inputProps: { min: 0, inputMode: 'decimal', }, readOnly: isViewOnly || currentInspection?.Status?.Contents }}
              />
            </Grid>

            <Grid item xs={12} md={6} id="ActualQuantity">
              {currentInspection.QCType !== 'InLine' ?
                <RHFTextField
                  name="ActualQuantity"
                  size="small"
                  label={translate('Actual quantity')}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  type="number"
                  InputProps={{ inputProps: { min: 0, inputMode: 'decimal', }, readOnly: isViewOnly || currentInspection?.Status?.Contents }}
                />
                :
                <RHFTextField
                  name="PickSampleQuantity"
                  size="small"
                  label={translate('Pick sample quantity')}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  type="number"
                  InputProps={{ inputProps: { min: 0, inputMode: 'decimal', }, readOnly: isViewOnly || currentInspection?.Status?.Contents }}
                />
              }
            </Grid>

            <Grid item xs={12} md={6} id="DueDate">
              <RHFTextField
                name="DueDate"
                size="small"
                label={translate('Due date')}
                value={moment(values.DueDate).format('DD/MM/YYYY')}
                InputLabelProps={{
                  shrink: true,
                }}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>

          </Grid>

          {/* {!isKeyboardOpen && ( */}
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
                lg: 0,
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
                md: '50%',
              }}
            >
              <LoadingButton
                variant="contained"
                fullWidth
                sx={{ mt: 1, backgroundColor: (theme) => theme.palette.info.main, minWidth: 200 }}
                type="submit"
                disabled={isViewOnly || currentInspection.IsFinished || currentInspection.Status.Contents}
                loading={isSubmitting}
              >
                {translate('button.save')}
              </LoadingButton>
            </Stack>
          </Stack>
          {/* )} */}
        </FormProvider>
      </ScrollView>
    </Popup>
  );
};
