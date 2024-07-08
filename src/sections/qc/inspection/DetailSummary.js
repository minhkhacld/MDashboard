import { yupResolver } from '@hookform/resolvers/yup';
import { LoadingButton } from '@mui/lab';
import PropTypes from 'prop-types';
import { Autocomplete, Box, IconButton, Stack, TextField, Typography, useTheme } from '@mui/material';
import { Popup } from 'devextreme-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useSnackbar } from 'notistack';
import { memo, useCallback, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation } from 'react-router-dom';
import useDetectKeyboardOpen from "use-detect-keyboard-open";
import * as Yup from 'yup';
import Iconify from '../../../components/Iconify';
import { FormProvider, RHFTextField } from '../../../components/hook-form';
import IconName from '../../../utils/iconsName';
// CONFIG
import { db } from '../../../Db';
import Image from '../../../components/Image';
import { FAILED_IMAGE_SRC, PASSED_IMAGE_SRC } from '../../../config';
import useLocales from '../../../hooks/useLocales';
import useResponsive from '../../../hooks/useResponsive';

DetailSummary.propTypes = {
  currentInspection: PropTypes.object,
};

// ------------------------------------------------------------------------
function DetailSummary({ currentInspection }) {

  // hooks
  const theme = useTheme();
  const mdUp = useResponsive('up', 'md');
  const { enqueueSnackbar } = useSnackbar();
  const location = useLocation();
  const isViewOnly = location?.state?.isViewOnly;
  const isKeyboardOpen = useDetectKeyboardOpen();

  const showAuditResultImage = currentInspection?.Header?.AuditingResult !== null;
  const resultImage = currentInspection?.Header?.AuditingResult === 'Pass' ? PASSED_IMAGE_SRC : FAILED_IMAGE_SRC;

  // Dexies js
  const Factories = useLiveQuery(() => db?.Factories.toArray()) || [];
  const SubFactories = useLiveQuery(() => db?.SubFactories.toArray()) || [];

  // components states;
  const [open, setOpen] = useState(false);

  // setOpen
  const handleOpen = useCallback(() => {
    setOpen(true);
  }, []);

  const stackStyles = {
    xs: !isKeyboardOpen ? 'flex' : 'none',
    sm: 'flex',
  };

  return (
    <Stack direction={'row'} justifyContent="space-between" alignItems={'center'} id="DetailSummary"
      sx={{ display: stackStyles }}
    >
      <Stack direction="row" justifyContent="space-between" spacing={6}>
        <Stack direction="column" justifyContent="flex-start" >
          <Typography variant="caption" paragraph color={theme.palette.error.dark} fontWeight={'bold'} mb={0}>
            {`Customer: ${currentInspection?.CustomerName}`}
          </Typography>
          <Typography variant="caption" paragraph mb={0} sx={{ wordBreak: 'break-word' }} whiteSpace="normal">
            {`Fty: ${currentInspection?.FactoryName}`}
          </Typography>
          <Typography variant="caption" paragraph mb={0}>
            {`Sub Fty: ${currentInspection?.SubFactoryName}`}
          </Typography>
          <Stack direction={'row'} alignItems="center">
            <Typography variant="caption" paragraph mb={0} sx={{ wordBreak: 'break-word' }} whiteSpace="normal">
              {`Status: `}
            </Typography>
            <Typography
              variant="caption"
              paragraph
              mb={0}
              ml={1}
              sx={{ wordBreak: 'break-word' }}
              whiteSpace="normal"
              color={currentInspection?.IsFinished ? theme.palette.success.main : theme.palette.warning.main}
            >
              {currentInspection?.IsFinished ? 'FINISHED' : 'OPENED'}
            </Typography>
          </Stack>
          <Typography variant="caption" paragraph mb={0}>
            {`Pick Sample Qty: ${currentInspection?.Header?.PickSampleQuantity === null ? 'N/A' : currentInspection?.Header?.PickSampleQuantity}`}
          </Typography>
        </Stack>
      </Stack>

      {showAuditResultImage ? (
        <Box
          sx={{
            right: 0,
            top: 0,
            width: 100,
          }}
        >
          <Image
            disabledEffect
            visibleByDefault
            alt="Inspection status summary"
            src={resultImage}
          />
        </Box>
      ) : null}

      <Stack>
        <IconButton onClick={handleOpen} disabled={isViewOnly}>
          <Iconify icon={IconName.edit} />
        </IconButton>
      </Stack>

      {open && (
        <ModalSummaryDetail
          mdUp={mdUp}
          open={open}
          setOpen={setOpen}
          currentInspection={currentInspection}
          enqueueSnackbar={enqueueSnackbar}
          Factories={Factories}
          SubFactories={SubFactories}
        />
      )}
    </Stack>
  );
};

export default memo(DetailSummary);

ModalSummaryDetail.propTypes = {
  currentInspection: PropTypes.object,
  mdUp: PropTypes.bool,
  open: PropTypes.bool,
  setOpen: PropTypes.func,
  enqueueSnackbar: PropTypes.func,
  Factories: PropTypes.array,
  SubFactories: PropTypes.array,
};


// MODAL ADD ITEM TO PENDING LIST I
function ModalSummaryDetail({
  mdUp,
  open,
  setOpen,
  currentInspection,
  enqueueSnackbar,
  Factories,
  SubFactories,
}) {

  const { translate } = useLocales();
  const defaultValues = useMemo(
    () => ({
      FactoryName: currentInspection?.FactoryName || '',
      FactoryId: currentInspection?.FactoryId || '',
      SubFactoryName: currentInspection?.SubFactoryName || null,
      SubFactoryId: currentInspection?.SubFactoryId || null,
      InspNo: currentInspection?.InspNo || null,
    }),
    []
  );

  const animation = useMemo(() => ({
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
  }));

  const summarySchema = Yup.object().shape({
    FactoryName: Yup.string().required('Factory is required'),
    InspNo: Yup.number().required('Inspection No is required'),
  });

  const methods = useForm({
    resolver: yupResolver(summarySchema),
    defaultValues,
  });

  const {
    watch,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = methods;

  const values = watch();

  // Close modal
  const onClose = () => {
    setOpen(false);
  };

  // HANDLE REPLACE
  const handleSave = async () => {
    try {
      await db.MqcInspection.where('Id')
        .equals(currentInspection?.Id)
        .modify((x, ref) => {
          ref.value = { ...currentInspection, ...values };
        });

      onClose();
      enqueueSnackbar(translate('message.saveSuccess'), {
        variant: 'success',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center',
        },
      });
    } catch (e) {
      console.error(e);
      enqueueSnackbar(translate('message.saveError'), {
        variant: 'error',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center',
        },
      });
    }
  };

  const optionSubFactories = SubFactories.filter((d) => d.FactoryId === values.FactoryId) || [];

  const handleChangeText = (e) => {
    setValue('InspNo', Number(e.target.value));
  };

  return (
    <Popup
      visible={open}
      onHiding={onClose}
      dragEnabled={false}
      hideOnOutsideClick
      showCloseButton
      showTitle
      title={translate('inspection.factoryDetai')}
      width={mdUp ? 700 : '95%'}
      height={mdUp ? '50%' : '80%'}
      animation={animation}
    >
      <FormProvider methods={methods} onSubmit={handleSubmit(handleSave)}>
        <Stack p={1} spacing={3}>
          <Autocomplete
            autoComplete
            blurOnSelect
            onChange={(event, newValue) => {
              setValue('FactoryName', newValue?.Factory || '');
              setValue('FactoryId', newValue?.Id || '');
              if (optionSubFactories.length === 0) {
                setValue('SubFactoryName', null);
                setValue('SubFactoryId', null);
              }
            }}
            defaultValue={Factories.find((d) => d?.Factory === values?.FactoryName) || null}
            value={Factories.find((d) => d?.Factory === values?.FactoryName) || null}
            getOptionLabel={(option) => {
              return option?.Factory === undefined ? '' : `${option?.Factory}` || '';
            }}
            options={Factories.sort((a, b) => -b?.Factory.localeCompare(a?.Factory)) || []}
            size="small"
            autoHighlight
            sx={{ width: '100%', minWidth: 150 }}
            renderInput={(params) => <RenderInput params={params} label="Factory" />}
            noOptionsText={<Typography>Search not found</Typography>}
            renderOption={(props, option) => {
              return (
                <Box component="li" {...props}>
                  {option?.Factory}
                </Box>
              );
            }}
            isOptionEqualToValue={(option, value) => {
              return `${option?.Factory}` === `${value?.Factory}`;
            }}
          />

          <Autocomplete
            autoComplete
            blurOnSelect
            onChange={(event, newValue) => {
              setValue('SubFactoryName', newValue?.SubFactory || '');
              setValue('SubFactoryId', newValue?.Id || '');
            }}
            defaultValue={optionSubFactories.find((d) => d?.SubFactory === values?.SubFactoryName) || null}
            value={optionSubFactories.find((d) => d?.SubFactory === values?.SubFactoryName) || null}
            getOptionLabel={(option) => {
              return option?.SubFactory === undefined ? '' : `${option?.SubFactory}` || '';
            }}
            options={optionSubFactories.sort((a, b) => -b?.SubFactory.localeCompare(a?.SubFactory)) || []}
            size="small"
            autoHighlight
            sx={{ width: '100%', minWidth: 150 }}
            renderInput={(params) => <RenderInput params={params} label="Sub Factory" />}
            noOptionsText={<Typography>Search not found</Typography>}
            renderOption={(props, option) => {
              return (
                <Box component="li" {...props}>
                  {option?.SubFactory}
                </Box>
              );
            }}
            isOptionEqualToValue={(option, value) => {
              return `${option?.SubFactory}` === `${value?.SubFactory}`;
            }}
          />

          <RHFTextField
            value={values?.InspNo}
            onChange={e => handleChangeText(e)}
            label="Inspection No"
            placeholder="Inspection No"
            type='number'
            size='small'
            InputProps={{ inputProps: { min: 0, inputMode: 'decimal', } }}
          />

          <Stack justifyContent={'flex-end'} width={'100%'} alignItems="flex-end">
            <Stack
              width={{
                xs: '100%',
                sm: '50%',
              }}
            >
              <LoadingButton
                variant="outlined"
                fullWidth
                sx={{ mt: 1, minWidth: 200 }}
                type="submit"
                disabled={currentInspection.IsFinished}
                loading={isSubmitting}
              >
                {translate('button.save')}
              </LoadingButton>
            </Stack>
          </Stack>
        </Stack>
      </FormProvider>
    </Popup>
  );
};


RenderInput.propTypes = {
  params: PropTypes.object,
  label: PropTypes.string
};

// Render Input
function RenderInput({ params, label }) {
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
    />
  );
};
