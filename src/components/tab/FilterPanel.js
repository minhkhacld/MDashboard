import { LoadingButton } from '@mui/lab';
import PropTypes from 'prop-types';
import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
// @mui
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Autocomplete,
  Box,
  Grid,
  Stack,
  TextField,
  Typography,
  styled
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useForm } from 'react-hook-form';
import useDetectKeyboardOpen from 'use-detect-keyboard-open';
import * as Yup from 'yup';
// hooks
import useLocales from '../../hooks/useLocales';
// components
import Iconify from '../Iconify';
import { IconButtonAnimate } from '../animate';
import { FormProvider, RHFTextField } from '../hook-form';
// utilities
import axios from '../../utils/axios';
import handleRequestError from '../../utils/handleRequestError';
import IconName from '../../utils/iconsName';
// CONFIGS
import { HEADER, NOTCH_HEIGHT } from '../../config';


const ACCORDINATION = 22;
const SPACING = 32;
const TAB_HEIGHT = 48;

const GridWithoutBreakcrumb = styled(Grid, {
  shouldForwardProp: () => true,
})(({ theme }) => {
  return {
    height: `calc(100vh - ${HEADER.MOBILE_HEIGHT + SPACING + TAB_HEIGHT + NOTCH_HEIGHT}px)`,
    [theme.breakpoints.up('lg')]: {
      height: `calc(100vh - ${HEADER.DASHBOARD_DESKTOP_HEIGHT + SPACING + NOTCH_HEIGHT + TAB_HEIGHT + ACCORDINATION}px)`,
    },
    [theme.breakpoints.between('md', 'lg')]: {
      height: `calc(100vh - ${HEADER.MOBILE_HEIGHT + SPACING + NOTCH_HEIGHT + TAB_HEIGHT + ACCORDINATION}px)`,
    },
    paddingBottom: 24,
  }
});


// ----------------------------------------------------------------------



const FilterPanel = forwardRef(({ ...props }, ref) => {

  FilterPanel.propTypes = {
    props: PropTypes.object,
    setDataSource: PropTypes.func,
  };

  // Hooks
  const { translate } = useLocales();
  const { enqueueSnackbar } = useSnackbar();
  const { setDataSource } = props;
  const location = useLocation();
  const isPlanningPage = location.pathname.includes('/qc/planing/list');
  const isKeyboardOpen = useDetectKeyboardOpen();

  const defaultValues = useMemo(
    () => ({
      FactoryName: '',
      StyleNo: '',
      CustomerPO: '',
    }),
    []
  );

  // Components states
  const [expanded, setExpanded] = useState('panel1');
  const [Factories, setFactories] = useState([]);
  const [SubFactories, setSubFactories] = useState([]);


  useImperativeHandle(ref, () => {
    return {
      show: () => {
        setExpanded('panel1');
      },
      hide: () => {
        setExpanded(null);
      },
    }
  })

  useEffect(() => {

    const getFactory = async () => {
      try {
        const getFactories = axios.get(`api/QCMobileApi/GetFactoryList`);
        const getSubFactories = axios.get(`/api/QCMobileApi/GetSubFactoryList`);
        Promise.all([getFactories, getSubFactories]).then(
          (response) => {
            // console.log('Get all', response);
            if (response) {
              const [factory, subFactory] = response;
              const newFactories = subFactory?.data?.data.map(d => ({
                ...d,
                FactoryName: factory?.data?.data.find(v => v.Id === d.FactoryId)?.Factory || ""
              }))
              setFactories(newFactories);
            }
          }
        )
      } catch (error) {
        console.error(error);
        const message = handleRequestError(error);
        enqueueSnackbar(message, {
          variant: 'error',
        })
      }
    };

    getFactory();

  }, []);

  useEffect(() => {

    props.storeDataSource.on('changed', (e) => {
      document.getElementById(`total_count_${props?.id}`).innerHTML = `${translate('total')}: ${props.storeDataSource.totalCount() || 0} ${translate('results')}`;
      // document.getElementById('tab-label-1').innerHTML = props.storeDataSource.totalCount();
    });

  }, [props.storeDataSource])

  const filterScheme = Yup.object().shape({
    // FactoryName: Yup.string().required('Factory is required'),
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
    formState: { errors, isSubmitting, },
  } = methods;

  const values = watch();

  const handleFilter = () => {
    try {
      const newValues = {
        Factory: values.FactoryName,
        StyleNo: values.StyleNo,
        CustomerPO: values.CustomerPO,
      };
      props.setDataSource(newValues);
      setExpanded(null);

    } catch (e) {
      console.error(e);
    }
  };

  const handleReset = () => {
    reset();
  };

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(expanded ? false : panel)
  };

  // console.log(values);


  return (
    <Accordion
      expanded={expanded === 'panel1'}
      sx={{
        width: '100%',
        height: '100%',
        position: 'relative',
      }}
      id="accordion-group"
    >

      <AccordionSummary
        expandIcon={<IconButtonAnimate onClick={handleChange('panel1')}>
          <Iconify icon={'ic:outline-expand-circle-down'} sx={{ fontSize: 25, color: 'var(--icon)' }} />
        </IconButtonAnimate>}
        aria-controls="panel1bh-content"
        id="panel1bh-header"
      >

        <Stack direction={'row'} spacing={2} justifyContent={'center'} alignItems={'center'}>
          <Typography id={`total_count_${props?.id}`} />
        </Stack>

      </AccordionSummary>

      <AccordionDetails width="100%">

        <FormProvider methods={methods} onSubmit={handleSubmit(handleFilter)}>

          <GridWithoutBreakcrumb container spacing={2}
            justifyContent={'center'}
            alignContent={'flex-start'}
            id="filter-container"
          >

            <Grid item xs={12} sm={4} >

              <Autocomplete
                blurOnSelect
                autoComplete
                onChange={(event, newValue) => {
                  // setValue('FactoryName', newValue?.FactoryName || '');
                  setValue('FactoryName', newValue?.SubFactory || '');
                }}
                defaultValue={Factories.find((d) => d?.SubFactory === values?.FactoryName) || null}
                value={Factories.find((d) => d?.SubFactory === values?.FactoryName) || null}
                getOptionLabel={(option) => option?.SubFactory === undefined ? '' : `${option?.SubFactory}` || ''
                }
                options={Factories.sort((a, b) => -b?.SubFactory.localeCompare(a?.SubFactory)) || []}
                size="small"
                autoHighlight
                sx={{ width: '100%', minWidth: 150 }}
                renderInput={(params) => <RenderInput params={params} label="Factory" placeholder={translate('placeholder.selectFty')}
                />}
                noOptionsText={<Typography>Search not found</Typography>}
                renderOption={(props, option) => (
                  <Box component="li" {...props}>
                    {option?.SubFactory}
                  </Box>
                )}
                isOptionEqualToValue={(option, value) => `${option?.Id}` === `${value?.Id}`}
              />
            </Grid>

            <Grid item xs={12} sm={4} >
              <RHFTextField name="CustomerPO" label="Customer PO" size="small" placeholder={translate('placeholder.inputPO')} />
            </Grid>

            <Grid item xs={12} sm={4} >
              <RHFTextField name="StyleNo" label="Style" size="small" placeholder={translate('placeholder.inputStyle')} />
            </Grid>

            <Grid item xs={12}>
              <Grid container justifyContent={'flex-end'} mt={3} spacing={3}>
                <Grid item xs={6} sm={2}>
                  <LoadingButton
                    fullWidth
                    variant="contained"
                    type="submit"
                    disabled={isSubmitting}
                    sx={{ backgroundColor: (theme) => theme.palette.info.main }}
                    loading={isSubmitting}
                  >
                    {translate('search')}
                  </LoadingButton>
                </Grid>

                <Grid item xs={6} sm={2}>
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
            </Grid>

          </GridWithoutBreakcrumb>

        </FormProvider>
      </AccordionDetails>
    </Accordion >

  );
});

export default FilterPanel;

// ----------------------------------------------------------------

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
