import { yupResolver } from '@hookform/resolvers/yup';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
// @mui
import { LoadingButton } from '@mui/lab';
import { Alert, Autocomplete, Box, Card, Grid, InputAdornment, Popper, Stack, Typography, useTheme } from '@mui/material';
// yup
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';
// devextreme
import { Popup } from 'devextreme-react';
import ScrollView from 'devextreme-react/scroll-view';
// React hooks
import { useEffect, useMemo, useState } from 'react';
// components
import { FormProvider, RHFCheckbox, RHFTextField } from '../../../components/hook-form/index';
import Iconify from '../../../components/Iconify';
import PopupConfirm from '../../../components/PopupConfirm';
import IconName from '../../../utils/iconsName';


const PopperComponent = (params) => {
  return (
    <Popper {...params}>
      <ScrollView height={300} width="100%">
        {params.children}
      </ScrollView>
    </Popper>
  );
}


// POPUP SET DETAIL INSPECTION
export default function PopUpContents({
  modalContent,
  setModalContent,
  // translate,
  // smUp,
  mdUp,
  isViewOnly,
  reduxData,
  lines,
  setLines,
  saveRequest,
  parentValues,
}) {
  PopUpContents.propTypes = {
    modalContent: PropTypes.object,
    setModalContent: PropTypes.func,
    translate: PropTypes.func,
    smUp: PropTypes.bool,
    mdUp: PropTypes.bool,
    isViewOnly: PropTypes.bool,
    lines: PropTypes.array,
    reduxData: PropTypes.object,
    setLines: PropTypes.func,
  };
  const defaultValues = useMemo(
    () => ({
      AuditType: '',
      AuditTypeId: '',
      ThirdParty: false,
      Customer: '',
      CustomerId: '',
      Brand: '',
      BrandId: '',
      Factory: '',
      FactoryId: '',
      SubFactory: '',
      SubFactoryId: '',
      ProductLine: '',
      ProductLineId: '',
      ProductGroup: '',
      ProductGroupId: '',
      Remark: '',
      Auditor: parentValues?.Auditor || '',
      DivisionName: '',
      DivisionId: '',
    }),
    [modalContent.item]
  );
  const stepScheme = Yup.object().shape({
    AuditType: Yup.string().required('Audit Type is required'),
    ThirdParty: Yup.boolean(),
    Customer: Yup.string().required('Customer is required'),
    Brand: Yup.string().required('Brand is required'),
    Factory: Yup.string().required('Factory is required'),
    SubFactory: Yup.string(),
    // ProductLine: Yup.string().required('Product Line is required'),
    // ProductGroup: Yup.string().required('Product Group is required'),
    Remark: Yup.string(),
    Auditor: Yup.string().required('You must choose Auditor on the outside form'),
    DivisionName: Yup.string().required('You must choose Division'),
  });

  const methods = useForm({
    resolver: yupResolver(stepScheme),
    defaultValues,
  });

  const {
    watch,
    setValue,
    handleSubmit,
    // setError,
    reset,
    formState: { errors, isSubmitting },
  } = methods;

  // HOOKS
  const values = watch();
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  // COMPONENTS STATE
  const [deleteModal, setDeleteModal] = useState(false);
  const [subFactoryList, setSubFactoryList] = useState([]);
  // CLOSE MODAL
  const onClose = () => {
    setModalContent({ visible: false, item: null, isAddNew: false });
    setDeleteModal(false);
    reset();
  };

  useEffect(() => {
    setSubFactoryList(() => {
      return reduxData?.SubFactoryList !== null
        ? reduxData?.SubFactoryList?.data
        // ?.filter((item) => item.FactoryId === modalContent.item?.FactoryId)
        : [];
    });

    // INITIAL FIELD FOR FORM
    if (!modalContent.isAddNew) {

      Object.keys(defaultValues).forEach((key) => {
        if (key === 'ThirdParty') {
          setValue(key, modalContent.item?.ThirdParty);
        }
        if (key === 'AuditType') {
          setValue(
            key,
            modalContent.item?.AuditTypeId === null
              ? ``
              : `${reduxData?.AuditType[0]?.Elements?.filter((item) => item.Value === modalContent.item?.AuditTypeId)[0]
                .Caption
              }`
          );
          setValue('AuditTypeId', modalContent.item?.AuditTypeId === null ? `` : modalContent.item?.AuditTypeId);
        }
        if (key === 'Customer') {
          setValue(
            key,
            modalContent.item?.CustomerId === null
              ? ``
              : `${reduxData?.CustomerList?.data?.filter((item) => item.Id === modalContent.item?.CustomerId)[0]
                ?.Customer
              }`
          );
          setValue('CustomerId', modalContent.item?.CustomerId === null ? `` : modalContent.item?.CustomerId);
        }
        if (key === 'Brand') {
          setValue(
            key,
            modalContent.item?.BrandId === null
              ? ``
              : `${reduxData?.Brand[0]?.Elements?.filter((item) => item.Value === modalContent.item?.BrandId)[0].Caption
              }`
          );
          setValue('BrandId', modalContent.item?.BrandId === null ? `` : modalContent.item?.BrandId);
        }
        if (key === 'Factory') {
          setValue(
            key,
            modalContent.item?.FactoryId === null
              ? ``
              : `${reduxData?.FactoryList?.data?.filter((item) => item.Id === modalContent.item?.FactoryId)[0]?.Factory
              }`
          );
          setValue('FactoryId', modalContent.item?.FactoryId === null ? `` : modalContent.item?.FactoryId);
        }
        if (key === 'SubFactory') {
          setValue(
            key,
            modalContent.item?.SubFactoryId === null
              ? ``
              : `${reduxData?.SubFactoryList.data
                ?.filter((item) => item.Id === modalContent.item?.SubFactoryId)[0]
                ?.SubFactory
              }`
          );
          setValue('SubFactoryId', modalContent.item?.SubFactoryId === null ? `` : modalContent.item?.SubFactoryId);
        }
        if (key === 'ProductLine') {
          setValue(
            key,
            modalContent.item?.ProductLineId === null
              ? ``
              : `${reduxData?.ProductLine[0]?.Elements?.filter(
                (item) => item.Value === modalContent.item?.ProductLineId
              )[0].Caption
              }`
          );
          setValue('ProductLineId', modalContent.item?.ProductLineId === null ? `` : modalContent.item?.ProductLineId);
        }
        if (key === 'ProductGroup') {
          setValue(
            key,
            modalContent.item?.ProductGroupId === null
              ? ``
              : `${reduxData?.ProductGroup[0]?.Elements?.filter(
                (item) => item.Value === modalContent.item?.ProductGroupId
              )[0].Caption
              }`
          );
          setValue(
            'ProductGroupId',
            modalContent.item?.ProductGroupId === null ? `` : modalContent.item?.ProductGroupId
          );
        }
        if (key === 'Remark') {
          setValue(key, modalContent.item?.Remark === null ? `` : `${modalContent.item?.Remark}`);
        }
        if (key === 'DivisionName') {
          setValue(key, modalContent.item?.DivisionName || "");
          setValue('DivisionId', modalContent.item?.DivisionId || "");
        }
      });
    } else {
      Object.keys(defaultValues).forEach((key) => {
        if (key === 'ThirdParty') {
          setValue(key, false);
        } else {
          setValue(key, '');
        }
      });
    }
  }, [modalContent]);

  useEffect(() => {
    Object.keys(defaultValues).forEach((key) => {
      if (key === 'Auditor') {
        setValue(key, parentValues?.Auditor === null ? `` : `${parentValues?.Auditor}`);
      }
    });
  }, []);

  // console.log(parentValues?.Auditor, values?.Auditor);

  // SAVE OR ADD DEFECT
  const handleSave = () => {
    // console.error(errors);
    try {
      if (modalContent?.isAddNew) {
        const newLine = {
          AuditTypeId: values?.AuditTypeId,
          BrandId: values?.BrandId,
          CustomerName: values?.Customer,
          CustomerId: values?.CustomerId,
          DBAction: 'Insert',
          FactoryId: values?.FactoryId,
          FactoryName: values?.Factory,
          ProductGroupId: values?.ProductGroupId,
          ProductLineId: values?.ProductLineId,
          Remark: values?.Remark === '' ? null : values?.Remark,
          SubFactoryId: values?.SubFactoryId === '' ? null : values?.SubFactoryId,
          SubFactoryName: values?.SubFactory === '' ? null : values?.SubFactory,
          ThirdParty: values?.ThirdParty,
          DivisionName: values.DivisionName,
          DivisionId: values.DivisionId,
        };
        // console.log(newLine);
        setLines([...lines, newLine]);
        saveRequest(parentValues, [...lines, newLine]);
        enqueueSnackbar('New detail has been added!', {
          variant: 'success',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'center',
          },
        });
        onClose();
      } else if (modalContent?.item.Id) {
        const index = lines?.indexOf(modalContent?.item);
        const newLine = {
          ...lines[index],
          AuditTypeId: values?.AuditTypeId,
          BrandId: values?.BrandId,
          CustomerName: values?.Customer,
          CustomerId: values?.CustomerId,
          DBAction: 'Update',
          FactoryId: values?.FactoryId,
          FactoryName: values?.Factory,
          ProductGroupId: values?.ProductGroupId,
          ProductLineId: values?.ProductLineId,
          Remark: values?.Remark === '' ? null : values?.Remark,
          SubFactoryId: values?.SubFactoryId === '' ? null : values?.SubFactoryId,
          SubFactoryName: values?.SubFactory === '' ? null : values?.SubFactory,
          ThirdParty: values?.ThirdParty,
          DivisionName: values.DivisionName,
          DivisionId: values.DivisionId,
        };
        lines[index] = newLine;
        // console.log(lines[index]);
        setLines([...lines]);
        saveRequest(parentValues, [...lines]);
        enqueueSnackbar('Detail has been updated!', {
          variant: 'success',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'center',
          },
        });
        onClose();
      } else {
        const index = lines?.indexOf(modalContent?.item);
        const newLine = {
          ...lines[index],
          AuditTypeId: values?.AuditTypeId,
          BrandId: values?.BrandId,
          CustomerName: values?.Customer,
          CustomerId: values?.CustomerId,
          DBAction: 'Insert',
          FactoryId: values?.FactoryId,
          FactoryName: values?.Factory,
          ProductGroupId: values?.ProductGroupId,
          ProductLineId: values?.ProductLineId,
          Remark: values?.Remark === '' ? null : values?.Remark,
          SubFactoryId: values?.SubFactoryId === '' ? null : values?.SubFactoryId,
          SubFactoryName: values?.SubFactory === '' ? null : values?.SubFactory,
          ThirdParty: values?.ThirdParty,
          DivisionName: values.DivisionName,
          DivisionId: values.DivisionId,
        };
        lines[index] = newLine;
        // console.log(lines[index]);
        setLines([...lines]);
        enqueueSnackbar('Detail has been updated!', {
          variant: 'success',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'center',
          },
        });
        onClose();
      }
    } catch (error) {
      console.log(error);
    }
  };

  // DELETE DEFECT
  const handleDeleteDetail = () => {
    try {
      if (!modalContent?.isAddNew) {
        const index = lines?.indexOf(modalContent?.item);
        const deleteLine = {
          ...lines[index],
          DBAction: 'Delete',
        };
        lines[index] = deleteLine;
        setLines([...lines]);
        onClose();
      } else {
        const index = lines?.indexOf(modalContent?.item);
        lines.splice(index);
        setLines([...lines]);
        onClose();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const error = (errors) => {
    // console.log(errors);
    // onClose();
    // enqueueSnackbar('Audit Type, Customer, Brand, Factory, Product Line, Product Group are required', {
    //   variant: 'error',
    //   anchorOrigin: {
    //     vertical: 'top',
    //     horizontal: 'center',
    //   },
    // });
    // console.log(errors);
  };

  const auditTypeOptions = [...reduxData?.AuditType[0]?.Elements].sort((a, b) => -b?.Caption.localeCompare(a?.Caption));
  const customerOptions = [...reduxData?.CustomerList?.data].sort((a, b) => -b?.Customer.localeCompare(a?.Customer));
  const brandOptions = [...reduxData?.Brand[0]?.Elements].sort((a, b) => -b?.Caption.localeCompare(a?.Caption));
  const factoryOptions = [...reduxData?.FactoryList?.data].sort((a, b) => -b?.Factory.localeCompare(a?.Factory));
  const subFactoryOptions = [...subFactoryList].sort((a, b) => -b?.SubFactory.localeCompare(a?.SubFactory));
  const divisionOptions = [...reduxData?.Division[0].Elements].sort((a, b) => -b?.Caption.localeCompare(a?.Caption));


  const handleChangeSubFactory = (e, newValue) => {
    setValue('SubFactory', newValue?.SubFactory || '');
    setValue('SubFactoryId', newValue?.Id || '');

    const findFactory = factoryOptions.find(f => f.Id === newValue.FactoryId);
    // console.log(newValue, findFactory);
    setValue('Factory', findFactory?.Factory || '');
    setValue('FactoryId', findFactory?.Id || '');
  }

  // console.log(values,);

  return (

    <Popup
      visible={modalContent.visible}
      onHiding={onClose}
      dragEnabled={false}
      hideOnOutsideClick
      showCloseButton
      showTitle
      title={modalContent.isAddNew ? 'Create Compliance Detail' : ''}
      // container=".dx-viewport"
      width={mdUp ? 700 : '100%'}
      height={mdUp ? '100%' : '100%'}
      // className="popup_image_editor"
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
      contentRender={() => {
        return (
          <ScrollView height={'100%'} width="100%">
            <FormProvider methods={methods} onSubmit={handleSubmit(handleSave, error)}>
              <Stack spacing={3} sx={{ paddingBottom: 20 }}>
                <Card
                  sx={{
                    px: 0,
                    py: 2,
                  }}
                >
                  <Grid container spacing={2} rowGap={1}>
                    <Grid item xs={6} md={6}>
                      <Autocomplete
                        autoComplete
                        disablePortal
                        name="AuditType"
                        onChange={(event, newValue) => {
                          setValue('AuditType', newValue?.Caption || '');
                          setValue('AuditTypeId', newValue?.Value || '');
                        }}
                        disabled={isViewOnly}
                        defaultValue={
                          reduxData?.AuditType !== null
                            ? auditTypeOptions?.find((d) => d?.Caption === values?.AuditType) || {}
                            : {}
                        }
                        value={
                          reduxData?.AuditType !== null
                            ? auditTypeOptions?.find((d) => d?.Caption === values?.AuditType) || {}
                            : {}
                        }
                        getOptionLabel={(option) => {
                          // console.log(option);
                          return option?.Caption === undefined ? '' : `${option?.Caption}` || '';
                        }}
                        options={reduxData?.AuditType === null ? [] : auditTypeOptions}
                        size="small"
                        autoHighlight
                        sx={{ width: '100%', minWidth: 150 }}
                        renderInput={(params) => <RenderInput params={params} isRequired label="Audit Type" />}
                        noOptionsText={<Typography>Search not found</Typography>}
                        PopperComponent={PopperComponent}
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
                      />
                    </Grid>
                    <Grid item xs={6} md={6}>
                      <RHFTextField
                        // disabled
                        name=""
                        label={'Third Party'}
                        size="small"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <RHFCheckbox
                                name="ThirdParty"
                                size="small"
                                color="green"
                                disabled={isViewOnly}
                              // InputProps={{ inputProps: { min: 0 } }}
                              />
                            </InputAdornment>
                          ),
                          readOnly: true,
                        }}
                      />
                    </Grid>
                    <Grid item xs={6} md={6}>
                      <Autocomplete
                        autoComplete
                        disablePortal
                        name="DivisionName"
                        onChange={(event, newValue) => {
                          setValue('DivisionName', newValue?.Caption || '');
                          setValue('DivisionId', newValue?.Value || '');
                        }}
                        disabled={isViewOnly}
                        defaultValue={divisionOptions.find((d) => d?.Caption === values?.DivisionName) || {}}
                        value={divisionOptions.find((d) => d?.Caption === values?.DivisionName) || {}}
                        getOptionLabel={(option) => {
                          // console.log(option);
                          return option?.Caption === undefined ? '' : `${option?.Caption}` || '';
                        }}
                        options={divisionOptions === undefined ? [] : divisionOptions}
                        size="small"
                        autoHighlight
                        sx={{ width: '100%', minWidth: 150 }}
                        renderInput={(params) => <RenderInput params={params} isRequired label="Division" />}
                        noOptionsText={<Typography>Search not found</Typography>}
                        PopperComponent={PopperComponent}
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
                      />
                    </Grid>
                    <Grid item xs={6} md={6}>
                      <Autocomplete
                        blurOnSelect
                        autoComplete
                        disablePortal
                        name="Customer"
                        onChange={(event, newValue) => {
                          setValue('Customer', newValue?.Customer || '');
                          setValue('CustomerId', newValue?.Id || '');
                        }}
                        disabled={isViewOnly}
                        defaultValue={reduxData?.CustomerList?.data.find((d) => d?.Customer === values?.Customer) || {}}
                        value={reduxData?.CustomerList?.data.find((d) => d?.Customer === values?.Customer) || {}}
                        getOptionLabel={(option) => {
                          // console.log(option);
                          return option?.Customer === undefined ? '' : `${option?.Customer}` || '';
                        }}
                        options={reduxData?.CustomerList?.data === undefined ? [] : customerOptions}
                        size="small"
                        autoHighlight
                        sx={{ width: '100%', minWidth: 150 }}
                        renderInput={(params) => <RenderInput params={params} isRequired label="Customer" />}
                        noOptionsText={<Typography>Search not found</Typography>}
                        PopperComponent={PopperComponent}
                        renderOption={(props, option) => {
                          // console.log(option);
                          return (
                            <Box component="li" {...props}>
                              {option?.Customer}
                            </Box>
                          );
                        }}
                        isOptionEqualToValue={(option, value) => {
                          // console.log(option, value);
                          return `${option?.Customer}` === `${value?.Customer}`;
                        }}
                      />
                    </Grid>
                    <Grid item xs={6} md={6}>
                      <Autocomplete
                        blurOnSelect
                        autoComplete
                        disablePortal
                        name="Brand"
                        onChange={(event, newValue) => {
                          setValue('Brand', newValue?.Caption || '');
                          setValue('BrandId', newValue?.Value || '');
                        }}
                        disabled={isViewOnly}
                        defaultValue={
                          reduxData?.Brand !== null
                            ? reduxData?.Brand[0]?.Elements?.find((d) => d?.Caption === values?.Brand) || {}
                            : {}
                        }
                        value={
                          reduxData?.Brand !== null
                            ? reduxData?.Brand[0]?.Elements?.find((d) => d?.Caption === values?.Brand) || {}
                            : {}
                        }
                        getOptionLabel={(option) => {
                          // console.log(option);
                          return option?.Caption === undefined ? '' : `${option?.Caption}` || '';
                        }}
                        options={reduxData?.Brand !== null ? brandOptions : []}
                        size="small"
                        autoHighlight
                        sx={{ width: '100%', minWidth: 150 }}
                        renderInput={(params) => <RenderInput params={params} isRequired label="Brand" />}
                        noOptionsText={<Typography>Search not found</Typography>}
                        PopperComponent={PopperComponent}
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
                      />
                    </Grid>
                    <Grid item xs={6} md={6}>
                      <Autocomplete
                        blurOnSelect
                        autoComplete
                        name="SubFactory"
                        disablePortal
                        onChange={(event, newValue) => {
                          // console.log(newValue);
                          // setValue('SubFactory', newValue?.SubFactory || '');
                          // setValue('SubFactoryId', newValue?.Id || '');
                          handleChangeSubFactory(event, newValue)
                        }}
                        disabled={isViewOnly}
                        defaultValue={subFactoryList?.find((d) => d?.SubFactory === values?.SubFactory) || {}}
                        value={subFactoryList?.find((d) => d?.SubFactory === values?.SubFactory) || {}}
                        getOptionLabel={(option) => {
                          // console.log(option);
                          return option?.SubFactory === undefined ? '' : `${option?.SubFactory}` || '';
                        }}
                        options={subFactoryOptions || []}
                        size="small"
                        autoHighlight
                        sx={{ width: '100%', minWidth: 150 }}
                        renderInput={(params) => <RenderInput params={params} label="Sub Factory" />}
                        noOptionsText={<Typography>Search not found</Typography>}
                        PopperComponent={PopperComponent}
                        renderOption={(props, option) => {
                          // console.log(option);
                          return (
                            <Box component="li" {...props}>
                              {option?.SubFactory}
                            </Box>
                          );
                        }}
                        isOptionEqualToValue={(option, value) => {
                          // console.log(option, value);
                          return `${option?.Id}` === `${value?.Id}`;
                        }}
                      />
                    </Grid>
                    <Grid item xs={6} md={6}>
                      <Autocomplete
                        autoComplete
                        disablePortal
                        blurOnSelect
                        name="Factory"
                        onChange={(event, newValue) => {
                          setValue('Factory', newValue?.Factory || '');
                          setValue('FactoryId', newValue?.Id || '');
                          setSubFactoryList(() => {
                            return reduxData?.SubFactoryList?.data.filter(
                              (item) => item.FactoryId === (newValue?.Id || '')
                            );
                          });
                        }}
                        // disabled={isViewOnly}
                        defaultValue={
                          reduxData?.FactoryList !== null
                            ? reduxData?.FactoryList?.data.find((d) => d?.Factory === values?.Factory) || {}
                            : {}
                        }
                        value={
                          reduxData?.FactoryList !== null
                            ? reduxData?.FactoryList?.data.find((d) => d?.Factory === values?.Factory) || {}
                            : {}
                        }
                        getOptionLabel={(option) => {
                          // console.log(option);
                          return option?.Factory === undefined ? '' : `${option?.Factory}` || '';
                        }}
                        options={reduxData?.FactoryList === null ? [] : factoryOptions}
                        size="small"
                        autoHighlight
                        sx={{ width: '100%', minWidth: 150 }}
                        renderInput={(params) => <RenderInput params={params} isRequired label="Factory" />}
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
                        readOnly
                      />
                    </Grid>


                    <Grid item xs={12} md={12}>
                      <RHFTextField
                        name="Remark"
                        size="small"
                        label={'Remark'}
                        rows={4}
                        multiline
                        disabled={isViewOnly}
                      />
                    </Grid>
                    <Grid item xs={12} md={12}>
                      {Object.keys(errors).map((key) => {
                        if (errors[key] !== undefined && errors[key].message !== undefined) {
                          return (
                            <Alert severity="error" key={key}>
                              Error: {errors[key].message}
                            </Alert>
                          );
                        }
                        return null;
                      })}
                    </Grid>
                    {modalContent.isAddNew ? (
                      <>
                        <Grid item xs={12}>
                          <LoadingButton variant="contained" fullWidth type="submit">
                            Create
                          </LoadingButton>
                        </Grid>
                      </>
                    ) : (
                      <>
                        <Grid item xs={6}>
                          <LoadingButton
                            variant="contained"
                            fullWidth
                            sx={{
                              backgroundColor: theme.palette.error.main,
                            }}
                            onClick={() => setDeleteModal(true)}
                            disabled={isViewOnly}
                          >
                            Delete
                          </LoadingButton>
                        </Grid>
                        <Grid item xs={6}>
                          <LoadingButton variant="contained" fullWidth type="submit" disabled={isViewOnly}>
                            Save
                          </LoadingButton>
                        </Grid>
                      </>
                    )}
                  </Grid>
                </Card>
              </Stack>

              {deleteModal ? (
                <PopupConfirm
                  title={'Delete Detail'}
                  visible={deleteModal}
                  onClose={() => setDeleteModal(!deleteModal)}
                  onProcess={handleDeleteDetail}
                  description={'Are you sure to delete this detail?'}
                />
              ) : null}
            </FormProvider>
          </ScrollView>
        );
      }}
    />
  );
}

// Render Input
const RenderInput = ({ params, label, isRequired }) => {
  RenderInput.propTypes = {
    params: PropTypes.object,
    label: PropTypes.node,
    isRequired: PropTypes.bool,
  };
  return (
    <RHFTextField
      {...params}
      fullWidth
      onFocus={(event) => {
        event.target.select();
      }}
      isRequired={isRequired}
      size="small"
      label={
        <Stack component={'span'} direction="row" justifyContent="center" alignItems="center">
          <Iconify icon={IconName.search} />
          <span className="ml-1">{label}</span>
        </Stack>
      }
      InputLabelProps={{
        style: { color: 'var(--label)' },
        shrink: true,
      }}
    />
  );
};
