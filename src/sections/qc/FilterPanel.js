import { LoadingButton } from '@mui/lab';
import PropTypes from 'prop-types';
import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
// @mui
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Autocomplete,
  Box,
  Grid, MenuItem, Popover,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { useLiveQuery } from 'dexie-react-hooks';
import { useForm } from 'react-hook-form';
import useDetectKeyboardOpen from 'use-detect-keyboard-open';
import * as Yup from 'yup';
import { useSelector } from '../../redux/store';
// hooks
// components
import { db } from '../../Db';
import Iconify from '../../components/Iconify';
import { IconButtonAnimate } from '../../components/animate';
import { FormProvider, RHFSelectMenuItem, RHFTextField } from '../../components/hook-form';
import useLocales from '../../hooks/useLocales';
import IconName from '../../utils/iconsName';
// Redux

// ----------------------------------------------------------------------


FilterPanel.propTypes = {
  setShowIntro: PropTypes.func,
  props: PropTypes.object,
  setDataSource: PropTypes.func,
};


function FilterPanel({ setShowIntro = () => { }, ...props }) {

  // Hooks
  const { translate } = useLocales();
  const { setDataSource } = props;
  const location = useLocation();
  const isPlanningPage = location.pathname.includes('/qc/planing/list');
  const isKeyboardOpen = useDetectKeyboardOpen()

  const { currentTab } = useSelector((store) => store.qc);
  const isQcPlanning = location.pathname === '/qc/planing/list';

  // Dexies js
  const Factories = useLiveQuery(() => db?.Factories.toArray()) || [];
  const SubFactories = useLiveQuery(() => db?.SubFactories.toArray()) || [];
  const Customers = useLiveQuery(() => db?.Customers.toArray()) || [];

  // Components state
  // const [open, setOpen] = useState(null);

  const [expanded, setExpanded] = useState('panel1');

  const handleChange = (panel) => (event, isExpanded) => {
    // setExpanded(isExpanded ? panel : false);
    setExpanded(expanded ? false : panel)
  };

  const defaultValues = useMemo(
    () => ({
      FactoryName: Factories[0]?.Factory || '',
      SubFactoryName: SubFactories[0]?.SubFactory || "",
      CustomerName: Customers[0]?.Customer || '',
      ItemCode: '',
      CustomerPO: '',
      QcType: '',
      FactoryId: ''
    }),
    []
  );

  const filterScheme = Yup.object().shape({
    // FactoryName: Yup.string().required('Factory is required'),
    // CustomerName: Yup.string().required('Customer is required'),
  });

  const methods = useForm({
    resolver: yupResolver(filterScheme),
    defaultValues,
  });

  const {
    watch,
    setValue,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  const values = watch();
  // const fieldContainValues = Object.keys(values).filter((key) => values[key] !== '' && values[key] !== null);
  const handleFilter = () => {
    try {
      // if (fieldContainValues.length === 0) {
      //   return enqueueSnackbar(
      //     translate('filterPanel.fieldRequired')
      //     , {
      //       variant: "error",
      //       anchorOrigin: {
      //         vertical: 'top',
      //         horizontal: 'center',
      //       },
      //     })
      // }
      if (isPlanningPage) {
        const newValues = values;
        delete newValues.FactoryId;
        setDataSource(values);
        // handleClose();
        setExpanded(null);
      } else {
        const newValues = {
          FactoryName: values.FactoryName,
          SubFactoryName: values.SubFactoryName,
          CustomerName: values.CustomerName,
          Style: values.ItemCode,
          CustomerPO: values.CustomerPO,
          QcType: values.QcType,
        };
        setDataSource(newValues);
        setExpanded(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleReset = () => {
    reset();
  };
  const QC_TYPE_OPTIONS = ['InLine', 'Pre-Final', 'Final'];


  const SubFactoryOptions = values.FactoryName === "" ? SubFactories : SubFactories.filter(d => d.FactoryId === values.FactoryId).sort((a, b) => -b?.SubFactory.localeCompare(a?.SubFactory));

  const handleShowIntro = () => {

    const accordGroup = document.getElementById("accordion-group");
    if (accordGroup.classList.contains("Mui-expanded")) {
      setShowIntro(true)
    } else {
      setExpanded('panel1')
      setShowIntro(true);
    }
  };


  return (
    <Accordion expanded={expanded === 'panel1'}
      //  onChange={handleChange('panel1')}
      sx={{
        width: '100%',
        height: 'auto',
        position: 'relative',
      }} id="accordion-group">

      <AccordionSummary
        expandIcon={<IconButtonAnimate onClick={handleChange('panel1')}>
          <Iconify icon={'ic:outline-expand-circle-down'} sx={{ fontSize: 25, color: 'var(--icon)' }} />
        </IconButtonAnimate>}
        aria-controls="panel1bh-content"
        id="panel1bh-header"
      >
        <Stack direction={'row'} spacing={2} justifyContent={'center'} alignItems={'center'}>
          {/* {
            expanded && <Button
              onClick={handleShowIntro}
              startIcon={<Iconify icon={IconName.questionMark} />}
            >
              <Typography variant="caption">{translate('button.help')}</Typography>
            </Button>} */}
          <Typography id="total_count" />
        </Stack>
      </AccordionSummary>
      <AccordionDetails width="100%">
        <FormProvider methods={methods} onSubmit={handleSubmit(handleFilter)}>
          {/* <ScrollView width={'100%'} height='100%'> */}
          <Grid container spacing={3}
            sx={{
              height: expanded ? {
                xs: 450,
                md: 500,
              } : 'auto',
              paddingBottom: expanded ? 30 : 0,
              pt: expanded ? 0.5 : 0,
              overflowY: 'scroll',
            }}
            id="filter-container"
          >
            <Grid item xs={12} sm={6} >
              <Autocomplete
                blurOnSelect
                autoComplete
                onChange={(event, newValue) => {
                  setValue('FactoryName', newValue?.Factory || '');
                  setValue('FactoryId', newValue?.Id || '');
                }}
                defaultValue={Factories.find((d) => d?.Factory === values?.FactoryName) || null}
                value={Factories.find((d) => d?.Factory === values?.FactoryName) || null}
                getOptionLabel={(option) => {
                  // console.log(option);
                  return option?.Factory === undefined ? '' : `${option?.Factory}` || '';
                }}
                options={Factories.sort((a, b) => -b?.Factory.localeCompare(a?.Factory)) || []}
                size="small"
                autoHighlight
                sx={{ width: '100%', minWidth: 150 }}
                renderInput={(params) => <RenderInput params={params} label="Factory" placeholder={translate('placeholder.selectFty')}
                />}
                noOptionsText={<Typography>Search not found</Typography>}
                renderOption={(props, option) => {
                  // console.log(option);
                  return (
                    <Box component="li" {...props}>
                      {option?.Factory}
                    </Box>
                  );
                }}
                isOptionEqualToValue={(option, value) => {
                  // console.log(option, value);
                  return `${option?.Factory}` === `${value?.Factory}`;
                }}

              />
            </Grid>
            <Grid item xs={12} sm={6} >
              <Autocomplete
                autoComplete
                blurOnSelect
                onChange={(event, newValue) => {
                  setValue('SubFactoryName', newValue?.SubFactory || '');
                }}
                defaultValue={SubFactories.find((d) => d?.SubFactory === values?.SubFactoryName) || null}
                value={SubFactories.find((d) => d?.SubFactory === values?.SubFactoryName) || null}
                getOptionLabel={(option) => {
                  return option?.SubFactory === undefined ? '' : `${option?.SubFactory}` || '';
                }}
                options={SubFactoryOptions || []}
                size="small"
                autoHighlight
                sx={{ width: '100%', minWidth: 150 }}
                renderInput={(params) => <RenderInput params={params} label="Sub Factory" placeholder={translate('placeholder.selectSubFty')} />}
                noOptionsText={<Typography>Search not found</Typography>}
                renderOption={(props, option) => {
                  return (
                    <Box component="li" {...props}>
                      {option?.SubFactory}
                    </Box>
                  );
                }}
                isOptionEqualToValue={(option, value) => {
                  return `${option?.Id}` === `${value?.Id}`;
                }}

              />
            </Grid>
            <Grid item xs={12} sm={6} >
              <Autocomplete
                autoComplete
                blurOnSelect
                onChange={(event, newValue) => {
                  setValue('CustomerName', newValue?.Customer || '');
                }}
                defaultValue={Customers.find((d) => d?.Customer === values?.CustomerName) || null}
                value={Customers.find((d) => d?.Customer === values?.CustomerName) || null}
                getOptionLabel={(option) => (option?.Customer === undefined ? '' : `${option?.Customer}` || '')}
                options={Customers.sort((a, b) => -b?.Customer.localeCompare(a?.Customer)) || []}
                size="small"
                autoHighlight
                sx={{ width: '100%', minWidth: 150 }}
                renderInput={(params) => <RenderInput params={params} label="Customer" placeholder={translate('placeholder.selectCustomer')} />}
                noOptionsText={<Typography>Search not found</Typography>}
                renderOption={(props, option) => {
                  return (
                    <Box component="li" {...props}>
                      {option?.Customer}
                    </Box>
                  );
                }}
                isOptionEqualToValue={(option, value) => {
                  return `${option?.Id}` === `${value?.Id}`;
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} >
              <RHFTextField name="ItemCode" label="Style" size="small" placeholder={translate('placeholder.inputStyle')} />
            </Grid>
            <Grid item xs={12} sm={6} >
              <RHFTextField name="CustomerPO" label="Customer PO" size="small" placeholder={translate('placeholder.inputPO')} />
            </Grid>
            <Grid item xs={12} sm={6} >
              <RHFSelectMenuItem
                size="small"
                name={'QcType'}
                label={'QC Type'}
                placeholder={translate('placeholder.selectQCType')}
              >
                {QC_TYPE_OPTIONS.length > 0 &&
                  QC_TYPE_OPTIONS.map((item) => (
                    <MenuItem key={item} value={item}>
                      {item}
                    </MenuItem>
                  ))}
              </RHFSelectMenuItem>
            </Grid>
          </Grid>

          {expanded && (currentTab === '2' || isQcPlanning) &&
            <Grid container
              sx={{
                position: {
                  xs: 'fixed',
                  sm: 'fixed',
                  md: 'absolute',
                  lg: 'absolute',
                },
                zIndex: theme => theme.zIndex.appBar + 1,
                bottom: {
                  xs: 3,
                  sm: 3,
                  md: 0,
                  lg: 0
                },
                left: 1,
                right: 1,
                p: 1,
                // backgroundColor: 'white',
                backgroundColor: 'transparent',
                display: {
                  xs: !isKeyboardOpen ? 'flex' : 'none',
                  sm: 'flex',
                },
              }}
              spacing={2}
              id="qc-filter-btn-group"
            >
              <Grid item xs={6} sm={6} md={3}>
                <LoadingButton
                  fullWidth
                  variant="contained"
                  type="submit"
                  disabled={isSubmitting}
                  sx={{ backgroundColor: (theme) => theme.palette.info.main }}
                  loading={isSubmitting}
                >
                  {translate('button.apply')}
                </LoadingButton>
              </Grid>
              <Grid item xs={6} sm={6} md={3}>
                <LoadingButton
                  fullWidth
                  variant="contained"
                  sx={{ backgroundColor: (theme) => theme.palette.error.main }}
                  onClick={handleReset}
                  disabled={isSubmitting}
                >
                  {translate('button.reset')}
                </LoadingButton>
              </Grid>
            </Grid>
          }
          {/* </ScrollView> */}
        </FormProvider>
      </AccordionDetails>
    </Accordion>

  );
};

export default FilterPanel;

MenuPopover.propTypes = {
  children: PropTypes.node,
  arrow: PropTypes.string,
  sx: PropTypes.object,
  other: PropTypes.object,
};


function MenuPopover({ children, arrow = 'top-right', sx, ...other }) {
  return (
    <Popover
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      PaperProps={{
        sx: {
          p: 1,
          overflow: 'inherit',
          ...sx,
        },
      }}
      {...other}
    >
      {children}
    </Popover>
  );
}

RenderInput.propTypes = {
  label: PropTypes.string,
  params: PropTypes.object,
};

// Render Input
function RenderInput({ params, label, ...other }) {
  return (
    <TextField
      {...params}
      {...other}
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
