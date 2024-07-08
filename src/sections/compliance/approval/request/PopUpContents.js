import { yupResolver } from '@hookform/resolvers/yup';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
// @mui
import {
  Alert,
  Card,
  Grid,
  InputAdornment,
  Stack,
  TextField,
  useTheme
} from '@mui/material';
// yup
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';
// devextreme
import { Popup } from 'devextreme-react';
import ScrollView from 'devextreme-react/scroll-view';
// React hooks
import { useMemo, useState } from 'react';
// components
import { FormProvider, RHFCheckbox, RHFTextField } from '../../../../components/hook-form/index';
import Iconify from '../../../../components/Iconify';
import IconName from '../../../../utils/iconsName';
// POPUP SET DETAIL INSPECTION
export default function PopUpContents({
  modalContent,
  setModalContent,
  translate,
  smUp,
  mdUp,
  isViewOnly,
  reduxData,
  lines,
  setLines,
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
      AuditType:
        modalContent.item?.AuditTypeId === null || modalContent.item?.AuditTypeId === undefined
          ? ``
          : `${reduxData?.AuditType[0]?.Elements?.filter((item) => item.Value === modalContent.item?.AuditTypeId)[0]
            .Caption
          }`,
      AuditTypeId: '',
      ThirdParty:
        modalContent.item?.ThirdParty === null || modalContent.item?.ThirdParty === undefined
          ? false
          : modalContent.item?.ThirdParty,
      Customer:
        modalContent.item?.CustomerId === null || modalContent.item?.CustomerId === undefined
          ? ``
          : `${reduxData?.CustomerList?.data?.filter((item) => item.Id === modalContent.item?.CustomerId)[0]?.Customer
          }`,
      CustomerId: '',
      Brand:
        modalContent.item?.BrandId === null || modalContent.item?.BrandId === undefined
          ? ``
          : `${reduxData?.Brand[0]?.Elements?.filter((item) => item.Value === modalContent.item?.BrandId)[0]?.Caption}`,
      BrandId: '',
      Factory:
        modalContent.item?.FactoryId === null || modalContent.item?.FactoryId === undefined
          ? ``
          : `${reduxData?.FactoryList?.data.filter((item) => item.Id === modalContent.item?.FactoryId)[0]?.Factory}`,
      FactoryId: '',
      SubFactory:
        modalContent.item?.SubFactoryId === null || modalContent.item?.SubFactoryId === undefined
          ? ``
          : `${reduxData?.SubFactoryList?.data?.filter((item) => item.Id === modalContent.item?.SubFactoryId)[0]
            ?.SubFactory
          }`,
      SubFactoryId: '',
      ProductLine:
        modalContent.item?.ProductLineId === null || modalContent.item?.ProductLineId === undefined
          ? ``
          : `${reduxData?.ProductLine[0].Elements.filter((item) => item.Value === modalContent.item?.ProductLineId)[0]
            .Caption
          }`,
      ProductLineId: '',
      ProductGroup:
        modalContent.item?.ProductGroupId === null || modalContent.item?.ProductGroupId === undefined
          ? ``
          : `${reduxData?.ProductGroup[0].Elements.filter((item) => item.Value === modalContent.item?.ProductGroupId)[0]
            .Caption
          }`,
      ProductGroupId: '',
      Remark:
        modalContent.item?.Remark === null || modalContent.item?.Remark === undefined
          ? ``
          : `${modalContent.item?.Remark}`,
      DivisionName: modalContent.item?.DivisionName === null || modalContent.item?.DivisionName === undefined
        ? ``
        : `${modalContent.item?.DivisionName}`,
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
    ProductLine: Yup.string().required('Product Line is required'),
    ProductGroup: Yup.string().required('Product Group is required'),
    Remark: Yup.string(),
  });

  const methods = useForm({
    resolver: yupResolver(stepScheme),
    defaultValues,
  });

  const {
    watch,
    setValue,
    formState,
    handleSubmit,
    setError,
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

  const error = (errors) => {
    // console.log(errors);
    onClose();
    enqueueSnackbar('Audit Type, Customer, Brand, Factory, Product Line, Product Group are required', {
      variant: 'error',
      anchorOrigin: {
        vertical: 'top',
        horizontal: 'center',
      },
    });
  };

  console.log(values)
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
      contentRender={() => {
        return (
          <ScrollView height={'100%'} width="100%">
            <FormProvider methods={methods}>
              <Stack spacing={3} sx={{ paddingBottom: 20 }}>
                <Card
                  sx={{
                    px: 1,
                    py: 2,
                  }}
                >
                  <Grid container spacing={3}>
                    <Grid item xs={6} md={6}>
                      <RHFTextField
                        name="AuditType"
                        label="Audit Type"
                        size="small"
                        row={4}
                        disabled={isViewOnly}
                        InputLabelProps={{ shrink: true }}
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
                      <RHFTextField
                        name="Customer"
                        label="Customer"
                        size="small"
                        row={4}
                        disabled={isViewOnly}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={6} md={6}>
                      <RHFTextField
                        name="Brand"
                        label="Brand"
                        size="small"
                        row={4}
                        disabled={isViewOnly}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={6} md={6}>
                      <RHFTextField
                        name="Factory"
                        label="Factory"
                        size="small"
                        row={4}
                        disabled={isViewOnly}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={6} md={6}>
                      <RHFTextField
                        name="SubFactory"
                        label="SubFactory"
                        size="small"
                        row={4}
                        disabled={isViewOnly}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <RHFTextField
                        name="DivisionName"
                        label="Division"
                        size="small"
                        row={4}
                        disabled={isViewOnly}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    {/* <Grid item xs={6} md={6}>
                      <RHFTextField
                        name="ProductLine"
                        label="Product Line"
                        size="small"
                        row={4}
                        disabled={isViewOnly}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={6} md={6}>
                      <RHFTextField
                        name="ProductGroup"
                        label="Product Group"
                        size="small"
                        row={4}
                        disabled={isViewOnly}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid> */}
                    <Grid item xs={12} md={12}>
                      <RHFTextField name="Remark" size="small" label={'Remark'} rows={4} multiline disabled />
                    </Grid>
                    <Grid item xs={12} md={12}>
                      {errors?.AQL && errors?.AQL?.message !== undefined && (
                        <Alert severity="error">Error: {errors?.AQL?.message}</Alert>
                      )}
                    </Grid>
                  </Grid>
                </Card>
              </Stack>
            </FormProvider>
          </ScrollView>
        );
      }}
    />
  );
}

// Render Input
const RenderInput = ({ params, label }) => {
  RenderInput.proppTypes = {
    params: PropTypes.object,
    label: PropTypes.node,
  };
  return (
    <TextField
      {...params}
      fullWidth
      onFocus={(event) => {
        event.target.select();
      }}
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
