import { Capacitor } from '@capacitor/core';
import { yupResolver } from '@hookform/resolvers/yup';
import moment from 'moment';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
// @mui
import { LoadingButton } from '@mui/lab';
import {
  Alert,
  Autocomplete,
  Box,
  Card,
  Grid,
  InputAdornment,
  Popper,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
// yup
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';
// devextreme
import { Popup } from 'devextreme-react';
import ScrollView from 'devextreme-react/scroll-view';
// React hooks
import { useEffect, useMemo, useState } from 'react';
// Redux
import { useSelector } from '../../../redux/store';
// components
import { FormProvider, RHFCheckbox, RHFTextField } from '../../../components/hook-form/index';
import Iconify from '../../../components/Iconify';
// utils
import axios from '../../../utils/axios';
import IconName from '../../../utils/iconsName';
// config
import { PATH_APP } from '../../../routes/paths';
import PopupCollaboration from './PopupCollaboration';


// -----------------------------------------------------
PopUpContents.propTypes = {
  modalContent: PropTypes.object,
  setModalContent: PropTypes.func,
  translate: PropTypes.func,
  mdUp: PropTypes.bool,
  setSubmitted: PropTypes.func,
  setIsSave: PropTypes.func,
  setCurrentItem: PropTypes.func,
};

// POPUP SET DETAIL INSPECTION
export default function PopUpContents({
  modalContent,
  setModalContent,
  translate,
  mdUp,
  setSubmitted,
  setIsSave,
  setCurrentItem,
}) {


  const animationsPopup = useMemo(() => ({
    show: {
      type: 'fade'
    },
    hide: {
      type: 'fade'
    }
  }), []);


  const defaultValues = useMemo(
    () => ({
      DocNo: modalContent.item?.SysNo || '',
      DueDate: modalContent.item?.DueDate === null ? '' : moment(modalContent.item?.DueDate).format('yyyy-MM-DD'),
      AuditTime: modalContent.item?.AuditTime || '',
      AuditType: modalContent.item?.AuditType || '',
      AssignToEmpKnowAs: modalContent.item?.AssignToEmpKnowAs || '',
      AssignToEmpId: modalContent.item?.AssignToEmpId,
      ThirdParty: modalContent.item?.ThirdParty,
      CustomerName: modalContent.item?.CustomerName || '',
      Brand: modalContent.item?.Brand || '',
      FactoryName: modalContent.item?.FactoryName || '',
      SubFactoryName: modalContent.item?.SubFactoryName || '',
      ProductLineName: modalContent.item?.ProductLineName || '',
      ProductGroupName: modalContent.item?.ProductGroupName || '',
      AssignDate: moment(modalContent.item?.AssignDate).format('yyyy-MM-DD'),
      Remark: modalContent.item?.Remark || '',
      DivisionName: modalContent.item?.DivisionName || '',
      DivisionId: modalContent.item?.DivisionId || '',
    }),
    [modalContent.item]
  );

  const stepScheme = Yup.object().shape({
    DueDate: Yup.string(),
    AssignToEmpKnowAs: Yup.string().required('Assign To is required'),
    AssignDate: Yup.string(),
    Remark: Yup.string(),
    DivisionName: Yup.string().required('You must choose Division'),
  });

  const methods = useForm({
    resolver: yupResolver(stepScheme),
    defaultValues,
  });

  const {
    watch,
    setValue,
    // formState,
    handleSubmit,
    // setError,
    reset,
    formState: { errors },
  } = methods;

  // HOOKS
  const values = watch();
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const platform = Capacitor.getPlatform();

  const { Auditors, Division } = useSelector((store) => store.compliance);

  // COMPONENTS STATE
  const [isViewOnly, setIsViewOnly] = useState(modalContent.item?.Id < 0);
  const [submitState, setSubmitState] = useState({ isSave: false, isCreate: false });
  const [loading, setLoading] = useState(false);
  const [popUpCollaborate, setPopupCollaborate] = useState({
    visible: false,
    itemId: null,
  });

  useEffect(() => {
    setIsViewOnly(modalContent.item?.Id < 0);
  }, [modalContent]);


  // CLOSE MODAL
  const onClose = (e) => {
    setModalContent({ visible: false, item: null, isAddNew: false });
    if (e === undefined) {
      setSubmitted(true);
    }
    setSubmitState({ isSave: false, isCreate: false });
    setLoading(false);
    reset();
  };


  // SAVE OR ADD DEFECT
  const handleSave = async () => {
    setLoading(true);
    if (submitState.isSave) {
      try {
        const data = {
          AssignToEmpId: values?.AssignToEmpId,
          AssignToEmpKnowAs: values?.AssignToEmpKnowAs,
          AssignDate: values?.AssignDate === '' ? null : values?.AssignDate,
          DueDate: values?.DueDate === '' ? null : values?.DueDate,
          Remark: values?.Remark === '' ? null : values?.Remark,
          DivisionName: values.DivisionName || "",
          DivisionId: values.DivisionId || "",
        };
        await axios
          .put(`/api/ComplianceScheduleMobileApi/Update/${modalContent?.item.Id}`, data)
          .then((response) => {
            console.log(response);
            if (response.data) {
              enqueueSnackbar('Save successfully!', {
                variant: 'success',
                anchorOrigin: {
                  vertical: 'top',
                  horizontal: 'center',
                },
              });
              // setUpdatedValue()
              const updatedContent = modalContent?.item;
              updatedContent.Id = response.data.Id;
              Object.assign(updatedContent, data);
              // console.log(updatedContent);
              setModalContent({ visible: true, item: updatedContent, isAddNew: false });
              setLoading(false);
              setSubmitState({ isSave: false, isCreate: false });
              setIsSave(true);
            }
          })
          .catch((err) => {
            console.log(err);
            enqueueSnackbar('Save fail!', {
              variant: 'error',
              anchorOrigin: {
                vertical: 'top',
                horizontal: 'center',
              },
            });
          });
      } catch (error) {
        console.log(error);
      }
    }
    if (submitState.isCreate) {
      try {
        await axios.post(`/api/ComplianceAuditMobileApi/CreateFromPlanningId/${modalContent?.item.Id}`).then(async response => {
          if (response.data) {
            setPopupCollaborate({ visible: true, itemId: response.data.Id })
          }
        }).catch(error => {
          console.log('Error', error);
          enqueueSnackbar(JSON.stringify(error), {
            variant: 'error',
            anchorOrigin: {
              vertical: 'top',
              horizontal: 'center',
            },
          });
        });
        // close pupup
        setLoading(false);
      } catch (error) {
        console.log(error.response);
        setLoading(false)
        enqueueSnackbar(`Create failed!`, {
          variant: 'error',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'center',
          },
        });
      }
    }
  };

  // errors
  const error = () => {
    setLoading(false);
    setSubmitState({ isSave: false, isCreate: false });
  };

  const auditorOptions = [...Auditors?.data].sort((a, b) => -b?.KnowAs.localeCompare(a?.KnowAs)) || [];
  const divisionOptions = [...Division[0]?.Elements].sort((a, b) => -b?.Caption.localeCompare(a?.Caption)) || [];

  // NAVIGATE TO DETAIL
  const navigateToComplianceDetail = (Id, isViewOnly = false, replace = false) => {
    navigate(PATH_APP.compliance.audit.detail(Id), {
      state: {
        isViewOnly,
      },
      replace,
    });
  }

  // Add to todo
  // const handleAddtoToDoList = async (item) => {
  //   try {
  //     const response = await axios.get(`/api/ComplianceAuditMobileApi/GetByAuditId/${item.Id}`);
  //     // console.log('response getItem', response);
  //     if (response?.data) {
  //       const todoItem = { ...response?.data[0] };
  //       const IsFinished = todoItem?.AuditingResultId !== null;
  //       const newLines = [...todoItem?.Lines];
  //       const attachments = [...todoItem?.Attachments];
  //       const FactoryInfoLines = _.chain(todoItem?.FactoryInfoLines)
  //         .groupBy((data) => data.Section)
  //         .map((Items, Section, index) => ({ Items, Section, IsFinished, Id: uuidv4() }))
  //         .value();

  //       const newSections = _.chain(newLines)
  //         .groupBy((data) => data.SectionName)
  //         .map((Items, Section, index) => {
  //           // append directly to todo list
  //           return { Items, Section, IsFinished, Id: uuidv4() };
  //         })
  //         .value();
  //       todoItem.ReportAttachments = [];
  //       todoItem.id = response.data[0].Id;
  //       todoItem.Sections = newSections;
  //       todoItem.FactoryInfoLines = FactoryInfoLines;
  //       delete todoItem.Id;
  //       delete todoItem.Lines;
  //       delete todoItem.Attachments;
  //       await complianceDB.Todo.add(todoItem)
  //         .then((res) => {
  //           // Add todo;
  //           console.log('add item to do list response', res);
  //           enqueueSnackbar(translate('message.addSuccess'), {
  //             variant: 'success',
  //             anchorOrigin: {
  //               vertical: 'top',
  //               horizontal: 'center',
  //             },
  //           });

  //           navigateToComplianceDetail(item.Id, false, false)
  //         })
  //         .catch((err) => {
  //           console.error(err);
  //           enqueueSnackbar(err, {
  //             variant: 'error',
  //             anchorOrigin: {
  //               vertical: 'top',
  //               horizontal: 'center',
  //             },
  //           });
  //         });
  //     }
  //   } catch (e) {
  //     console.error(e);
  //     enqueueSnackbar(e, {
  //       variant: 'error',
  //       anchorOrigin: {
  //         vertical: 'top',
  //         horizontal: 'center',
  //       },
  //     });
  //   }
  // };


  // Hide all popups
  const hidePopup = () => {
    setPopupCollaborate({ visible: false, itemId: null });
    onClose();
  };

  return (
    <Popup
      visible={modalContent.visible}
      onHiding={onClose}
      dragEnabled={false}
      hideOnOutsideClick={false}
      showCloseButton={!loading}
      showTitle
      animation={animationsPopup}
      closeOnOutsideClick={false}
      title={modalContent.isAddNew ? 'Create Compliance Detail' : ''}
      width={mdUp ? 700 : '100%'}
      height={mdUp ? '100%' : '100%'}
    >
      <ScrollView height={'100%'} width="100%">
        <FormProvider methods={methods} onSubmit={handleSubmit(handleSave, error)}>
          <Stack spacing={3} sx={{ paddingBottom: 20 }}>
            <Card
              sx={{
                px: 0,
                py: 2,
              }}
            >
              <Grid container spacing={3}>
                <Grid item xs={6} md={6}>
                  <RHFTextField
                    name="DocNo"
                    size="small"
                    label={translate('Doc No')}
                    rows={2}
                    disabled
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
                <Grid item xs={6} md={6}>

                  <RenderInput
                    name="DueDate"
                    size="small"
                    label={translate('Due Date')}
                    rows={4}
                    type="date"
                    disabled={submitState.isCreate || submitState.isSave}
                    value={values?.DueDate}
                    onChange={(e) => {
                      setValue('DueDate', moment(e.target.value).format('yyyy-MM-DD'));
                    }}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={12}>
                  <Autocomplete
                    autoComplete
                    disablePortal
                    name="AssignToEmpKnowAs"
                    onChange={(event, newValue) => {
                      setValue('AssignToEmpKnowAs', newValue?.KnowAs || '');
                      setValue('AssignToEmpId', newValue?.Id || '');
                    }}
                    defaultValue={
                      Auditors !== null
                        ? Auditors?.data.find((d) => d?.KnowAs === values?.AssignToEmpKnowAs) || {}
                        : {}
                    }
                    disabled={submitState.isCreate || submitState.isSave}
                    value={
                      Auditors !== null
                        ? Auditors?.data.find((d) => d?.KnowAs === values?.AssignToEmpKnowAs) || {}
                        : {}
                    }
                    getOptionLabel={(option) => {
                      return option?.KnowAs === undefined ? '' : `${option?.KnowAs}` || '';
                    }}
                    options={Auditors === null ? [] : auditorOptions}
                    size="small"
                    autoHighlight
                    sx={{ width: '100%', minWidth: 150 }}
                    renderInput={(params) => <RenderInput params={params} isRequired label="Assign To" />}
                    noOptionsText={<Typography>Search not found</Typography>}
                    renderOption={(props, option) => {
                      return (
                        <Box component="li" {...props}>
                          {option?.KnowAs}
                        </Box>
                      );
                    }}
                    PopperComponent={(params) => {
                      return (
                        <Popper {...params}>
                          <ScrollView height={mdUp ? 400 : 300} width="100%">
                            {params.children}
                          </ScrollView>
                        </Popper>
                      );
                    }}
                    isOptionEqualToValue={(option, value) => {
                      return `${option?.KnowAs}` === `${value?.KnowAs}`;
                    }}
                  />
                </Grid>
                <Grid item xs={6} md={6}>
                  <RHFTextField
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
                            disabled
                          />
                        </InputAdornment>
                      ),
                      readOnly: true,
                    }}
                  />
                </Grid>
                <Grid item xs={6} md={6}>

                  <RenderInput
                    name="AssignDate"
                    size="small"
                    label={translate('Assign Date')}
                    rows={4}
                    disabled={submitState.isCreate || submitState.isSave}
                    value={values?.AssignDate}
                    onChange={(e) => {
                      setValue('AssignDate', e.target.value);
                    }}
                    type="date"
                    InputLabelProps={{
                      shrink: true,
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
                    defaultValue={
                      divisionOptions !== null
                        ? divisionOptions?.find((d) => d?.Caption === values?.DivisionName) || {}
                        : {}
                    }
                    disabled={submitState.isCreate || submitState.isSave}
                    value={
                      divisionOptions !== null
                        ? divisionOptions?.find((d) => d?.Caption === values?.DivisionName) || {}
                        : {}
                    }
                    getOptionLabel={(option) => {
                      return option?.Caption === undefined ? '' : `${option?.Caption}` || '';
                    }}
                    options={divisionOptions === null ? [] : divisionOptions}
                    size="small"
                    autoHighlight
                    sx={{ width: '100%', minWidth: 150 }}
                    renderInput={(params) => <RenderInput params={params} isRequired label="Division" />}
                    noOptionsText={<Typography>Search not found</Typography>}
                    renderOption={(props, option) => {
                      return (
                        <Box component="li" {...props}>
                          {option?.Caption}
                        </Box>
                      );
                    }}
                    PopperComponent={(params) => {
                      return (
                        <Popper {...params}>
                          <ScrollView height={mdUp ? 400 : 300} width="100%">
                            {params.children}
                          </ScrollView>
                        </Popper>
                      );
                    }}
                    isOptionEqualToValue={(option, value) => {
                      return `${option?.Caption}` === `${value?.Caption}`;
                    }}
                  />
                </Grid>
                <Grid item xs={6} md={6}>
                  <RHFTextField
                    name="CustomerName"
                    size="small"
                    label={translate('Customer Name')}
                    rows={4}
                    disabled
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
                <Grid item xs={6} md={6}>
                  <RHFTextField
                    name="Brand"
                    size="small"
                    label={translate('Brand')}
                    rows={4}
                    disabled
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
                <Grid item xs={6} md={6}>
                  <RHFTextField
                    name="FactoryName"
                    size="small"
                    label={translate('Factory Name')}
                    rows={4}
                    disabled
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
                <Grid item xs={6} md={6}>
                  <RHFTextField
                    name="SubFactoryName"
                    size="small"
                    label={translate('Sub Factory Name')}
                    rows={4}
                    disabled
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>

                <Grid item xs={6} md={6}>
                  <RHFTextField
                    name="AuditTime"
                    size="small"
                    label={translate('Audit Time')}
                    rows={4}
                    disabled
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
                <Grid item xs={6} md={6}>
                  <RHFTextField
                    name="AuditType"
                    size="small"
                    label={translate('Audit Type')}
                    rows={4}
                    disabled
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={12}>

                  <RenderInput
                    name="Remark"
                    size="small"
                    label={translate('Remark')}
                    rows={4}
                    multiline
                    value={values?.Remark}
                    onChange={(e) => {
                      setValue('Remark', e.target.value);
                    }}
                    disabled={submitState.isCreate || submitState.isSave}
                    InputLabelProps={{
                      shrink: true,
                    }}
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
                <Grid item xs={6} md={6}>
                  <LoadingButton
                    variant={'contained'}
                    fullWidth
                    type="submit"
                    onClick={() => setSubmitState({ isSave: true, isCreate: false })}
                    disabled={submitState.isCreate}
                    loading={loading}
                  >
                    Save
                  </LoadingButton>
                </Grid>
                <Grid item xs={6} md={6}>
                  <LoadingButton
                    variant={'contained'}
                    sx={{
                      backgroundColor: theme.palette.info.main,
                    }}
                    fullWidth
                    type="submit"
                    disabled={isViewOnly || submitState.isSave}
                    onClick={() => setSubmitState({ isSave: false, isCreate: true })}
                    loading={loading}
                  >
                    Create
                  </LoadingButton>
                </Grid>
              </Grid>
            </Card>
          </Stack>
        </FormProvider>
      </ScrollView>

      {popUpCollaborate.visible &&
        <PopupCollaboration
          visible={popUpCollaborate.visible}
          onClose={hidePopup}
          item={modalContent.item}
          popUpCollaborate={popUpCollaborate}
          handleSave={handleSave}
        />
      }

    </Popup>
  );
}

// Render Input
const RenderInput = ({ params, label, isRequired, ...other }) => {
  RenderInput.propTypes = {
    params: PropTypes.object,
    label: PropTypes.node,
    isRequired: PropTypes.bool,
  };

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
        <Stack component={'span'} direction="row" justifyContent="center" alignItems="center">
          <Iconify icon={IconName.search} />
          <span className="ml-1">{label}</span>
          {isRequired === true && (
            // <Iconify icon={'bi:asterisk'} sx={{ color: 'red', ml: 1, fontSize: 8 }} />
            <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 16 16">
              <path
                fill="red"
                d="M8 0a1 1 0 0 1 1 1v5.268l4.562-2.634a1 1 0 1 1 1 1.732L10 8l4.562 2.634a1 1 0 1 1-1 1.732L9 9.732V15a1 1 0 1 1-2 0V9.732l-4.562 2.634a1 1 0 1 1-1-1.732L6 8L1.438 5.366a1 1 0 0 1 1-1.732L7 6.268V1a1 1 0 0 1 1-1z"
              />
            </svg>
          )}
        </Stack>
      }
      InputLabelProps={{
        style: { color: 'var(--label)' },
        shrink: true,
      }}
    />
  );
};
