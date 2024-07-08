import { yupResolver } from '@hookform/resolvers/yup';
import ScrollView from 'devextreme-react/scroll-view';
import moment from 'moment';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
// @mui
import { LoadingButton } from '@mui/lab';
import {
  Autocomplete,
  Box,
  Card,
  Divider,
  Grid,
  Popper,
  Stack,
  styled,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
// yup
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';
// devextreme
import { List } from 'devextreme-react/list';
import fx from 'devextreme/animation/fx';
// React hooks
import { useEffect, useMemo, useState } from 'react';
// routes
import { useNavigate } from 'react-router-dom';
import useLocales from '../../../hooks/useLocales';
import useResponsive from '../../../hooks/useResponsive';
import { PATH_APP } from '../../../routes/paths';
// components
import { FormProvider, RHFTextField } from '../../../components/hook-form/index';
import Iconify from '../../../components/Iconify';
import PopupConfirm from '../../../components/PopupConfirm';
import Scrollbar from '../../../components/Scrollbar';
import axios from '../../../utils/axios';
import IconName from '../../../utils/iconsName';
import PopUpContents from './PopUpContents';
// redux
// import { setCurrentRequestDetail } from '../../../redux/slices/compliance';
import { HEADER } from '../../../config';
import { useSelector } from '../../../redux/store';

const RootStyle = styled('div')(({ theme }) => ({
  zIndex: 999,
  right: 0,
  display: 'flex',
  cursor: 'pointer',
  position: 'absolute',
  alignItems: 'center',
  height: theme.spacing(5),
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  paddingTop: theme.spacing(0),
  paddingBottom: theme.spacing(2),
  boxShadow: theme.customShadows.z20,
  color: theme.palette.success.dark,
  backgroundColor: 'transparent',
  borderTopLeftRadius: Number(theme.shape.borderRadius) * 2,
  borderBottomLeftRadius: Number(theme.shape.borderRadius) * 2,
  transition: theme.transitions.create('opacity'),
  '&:hover': { opacity: 0.72 },
}));

const PopperComponent = (params) => {
  return (
    <Popper {...params}>
      <ScrollView height={300} width="100%">
        {params.children}
      </ScrollView>
    </Popper>
  );
}


const BREAKCRUM_HEIGHT = 78;
const STEP_HEADER_HEIGHT = 88;
const TAB_HEIGHT = 48;
const BUTTON_GROUP = 34;
const SPACING = 30;
const INFO_CARD = 273;
const BOTTOM_BUTTON = 76;

Detail.propTypes = {
  state: PropTypes.object,
  name: PropTypes.string,
};

export default function Detail({ state, name }) {
  // components state
  const [source, setSource] = useState();
  const [lines, setLines] = useState();
  const [submitted, setSubmitted] = useState(false);
  // const [isViewOnly, setIsViewOnly] = useState(state?.WFStatusName !== 'Open' && !state?.isAddNew);
  const [modalContent, setModalContent] = useState({
    visible: false,
    item: null,
    isAddNew: false,
  });
  // redux
  const reduxData = useSelector((store) => store.compliance);
  const isViewOnly = state?.WFStatusName !== 'Open' && name !== 'add';
  const [deleteModal, setDeleteModal] = useState(false);
  // console.log(lines);
  const mdUp = useResponsive('up', 'md');
  const smUp = useResponsive('up', 'sm');
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const { translate } = useLocales();
  const navigate = useNavigate();
  const defaultValues = useMemo(
    () => ({
      DocNo: source?.SysNo || '',
      StartAuditDate: moment(source?.RequestDate).format('yyyy-MM-DD'),
      Title: source?.Title || '',
      Auditor: source?.AuditorName || '',
      AuditorId: source?.AuditorId || '',
      AuditTime:
        reduxData?.AuditTime !== null
          ? reduxData?.AuditTime[0]?.Elements?.find((d) => d?.Value === source?.AuditTimeId)?.Caption
          : state?.AuditTime || '',
      AuditTimeId: source?.AuditTimeId || '',
    }),
    [source]
  );
  // console.log(source);

  const stepScheme = Yup.object().shape({
    DocNo: Yup.string(),
    StartAuditDate: Yup.string().required('Start Audit Date is required'),
    Title: Yup.string(),
    Auditor: Yup.string().required('Auditor is required'),
    AuditTime: Yup.string(),
  });

  const methods = useForm({
    resolver: yupResolver(stepScheme),
    defaultValues,
  });

  const {
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = methods;

  const values = watch();

  const handleAddLine = () => {
    setModalContent({ visible: true, isAddNew: true, item: null });
  };

  const handleUpdateLine = (data) => {
    setModalContent({ visible: true, isAddNew: false, item: data });
  };

  const getDataSource = () => {
    setSubmitted(false);
    return axios.get(`/api/ComplianceRequestMobileApi/GetByKey/${name}`, {
      //   params: {
      //   },
    });
  };

  useEffect(() => {
    setValue('DocNo', source?.SysNo || '');
    setValue('StartAuditDate', moment(source?.RequestDate).format('yyyy-MM-DD'));
    setValue('Title', source?.Title || '');
    setValue('Auditor', source?.AuditorName || '');
    setValue('AuditorId', source?.AuditorId || '');
    setValue(
      'AuditTime',
      reduxData?.AuditTime !== null
        ? reduxData?.AuditTime[0]?.Elements?.find((d) => d?.Value === source?.AuditTimeId)?.Caption
        : state?.AuditTime || ''
    );
    setValue('AuditTimeId', source?.AuditTimeId || '');
    setLines(source?.Lines || []);
  }, [source]);

  // console.log(state)

  useEffect(() => {
    if (name !== 'add') {
      getDataSource()
        .then((result) => {
          // console.log(result.data);
          setLines(result.data.Lines);
          setSource(result.data);
        })
        .catch((err) => {
          console.log(err);
          setSubmitted(false);
        })
        .finally(() => {
          setSubmitted(false);
        });
    }
  }, [submitted, state]);

  // console.log(submitted);

  // RENDER LIST
  const itemTemplate = (data) => {
    // console.log(data);

    return (
      <>
        {data?.ThirdParty !== undefined && reduxData !== undefined ? (
          //   <Link
          //     to={PATH_APP.compliance.request.detail(data?.Id)}
          //     state={{ WFStatusName: data?.WFStatusName, AuditTime: data?.AuditTime }}
          //   >
          <Stack
            direction="row"
            justifyContent="space-between"
            pl={smUp ? 1 : 0}
            onClick={() => handleUpdateLine(data)}
          >
            <Stack direction="column" justifyContent="flex-start">
              <Typography variant="caption" paragraph color="black" fontWeight={'bold'} mb={0}>
                {data?.ThirdParty ? 'THIRD PARTY' : 'INTERNAL'}
              </Typography>
              <Typography variant="caption" paragraph mb={0}>
                {`${data?.AuditTypeId !== null && reduxData?.AuditType !== null
                  ? reduxData?.AuditType[0].Elements.filter((item) => item.Value === data?.AuditTypeId)[0].Caption
                  : null
                  }-${data?.SubFactoryName || data?.FactoryName || 'N/A'}-${data?.CustomerName}`}
              </Typography>
              {/* <Typography variant="caption" paragraph mb={0}>
                Product Line:{' '}
                {`${reduxData?.ProductLine !== null && data?.ProductLineId !== null
                  ? reduxData?.ProductLine[0].Elements.filter((item) => item.Value === data?.ProductLineId)[0].Caption
                  : ``
                  }`}
              </Typography>
              <Typography variant="caption" paragraph mb={0}>
                Product Group:{' '}
                {`${reduxData?.ProductGroup !== null && data?.ProductGroupId !== null
                  ? reduxData?.ProductGroup[0].Elements.filter((item) => item.Value === data?.ProductGroupId)[0]
                    .Caption
                  : ``
                  }`}
              </Typography> */}
              <Typography variant="caption" paragraph mb={0}>
                Division: {data?.DivisionName}
              </Typography>
            </Stack>
          </Stack>
        ) : (
          //   </Link>
          translate('noDataText')
        )}
      </>
    );
  };

  const handleSave = async (values, lines) => {
    try {
      // console.log(values);
      if (name === 'add') {
        const postData = {
          RequestDate: values?.StartAuditDate,
          Title: values?.Title === '' ? null : values?.Title,
          AuditorId: values?.AuditorId === '' ? null : values?.AuditorId,
          AuditorName: values?.Auditor === '' ? null : values?.Auditor,
          AuditTimeId: values?.AuditTimeId === '' ? null : values?.AuditTimeId,
          Remark: null,
          Lines: lines,
        };
        // console.log(postData);
        await axios
          .post(`/api/ComplianceRequestMobileApi/Add`, postData)
          .then((response) => {
            // console.log(response);
            if (response.data) {
              enqueueSnackbar('Saving successfully!', {
                variant: 'success',
                anchorOrigin: {
                  vertical: 'top',
                  horizontal: 'center',
                },
              });
              setSubmitted(true);
              // dispatch(setCurrentRequestDetail({ WFStatusName: 'Open', AuditTime: values?.AuditTime }));
              navigate(PATH_APP.compliance.request.detail(response.data.Id));
            }
          })
          .catch((err) => {
            console.log(err);
            enqueueSnackbar('Saving fail!', {
              variant: 'error',
              anchorOrigin: {
                vertical: 'top',
                horizontal: 'center',
              },
            });
            setSubmitted(true);
          });
      } else {
        // console.log(values);
        const postData = {
          RequestDate: values?.StartAuditDate,
          Title: values?.Title === '' ? null : values?.Title,
          AuditorId: values?.AuditorId === '' ? null : values?.AuditorId,
          AuditorName: values?.Auditor === '' ? null : values?.Auditor,
          AuditTimeId: values?.AuditTimeId === '' ? null : values?.AuditTimeId,
          Remark: null,
          Lines: lines,
        };
        // console.log(postData);
        await axios
          .put(`/api/ComplianceRequestMobileApi/Update/${name}`, postData)
          .then((response) => {
            // console.log(response);
            if (response.data) {
              enqueueSnackbar('Save successfully!', {
                variant: 'success',
                anchorOrigin: {
                  vertical: 'top',
                  horizontal: 'center',
                },
              });
              setSubmitted(true);
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
            setSubmitted(true);
          });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleDelete = async () => {
    try {
      // console.log(values);
      if (name !== 'add') {
        await axios
          .delete(`/api/ComplianceRequestMobileApi/DeleteByKey/${name}`)
          .then((response) => {
            // console.log(response);
            if (response.data) {
              enqueueSnackbar('Delete successful!', {
                variant: 'success',
                anchorOrigin: {
                  vertical: 'top',
                  horizontal: 'center',
                },
              });
              navigate(PATH_APP.compliance.request.root);
            }
          })
          .catch((err) => {
            console.log(err);
            enqueueSnackbar('Delete fail!', {
              variant: 'error',
              anchorOrigin: {
                vertical: 'top',
                horizontal: 'center',
              },
            });
          });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const auditorOptions = [...reduxData?.Auditors?.data].sort((a, b) => -b?.KnowAs.localeCompare(a?.KnowAs))

  return (
    <Stack spacing={2} sx={{ height: '100%' }}>
      <FormProvider methods={methods} onSubmit={handleSubmit(() => handleSave(values, lines))}>
        {/* <Box sx={{ height: '100%', p: 1 }}> */}
        <Card sx={{ p: 0 }}>
          <Box sx={{ p: 1 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={12}>
                <Typography variant="caption" color="black" fontWeight={'bold'}>
                  {translate('Compliance Request Info')}
                </Typography>
                <Divider sx={{ p: 1 }} />
              </Grid>
              {name === 'add' ? null : (
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
              )}

              <Grid item xs={name !== 'add' ? 6 : 12} md={name !== 'add' ? 6 : 12}>

                <RenderInput
                  name="StartAuditDate"
                  size="small"
                  label={translate('Start Audit Date')}
                  rows={4}
                  isRequired
                  // defaultValue={values?.StartAuditDate}
                  value={values?.StartAuditDate}
                  disabled={isViewOnly}
                  type="date"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  onChange={(event, newValue) => {
                    setValue('StartAuditDate', moment(event.target.value).format('yyyy-MM-DD') || '');
                  }}
                />
              </Grid>
              <Grid item xs={12} md={12}>

                <RenderInput
                  name="Title"
                  size="small"
                  label={translate('Title')}
                  rows={4}
                  // defaultValue={values?.Title}
                  value={values?.Title}
                  disabled={isViewOnly}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  onChange={(event, newValue) => {
                    setValue('Title', event.target.value || '');
                  }}
                />
              </Grid>
              <Grid item xs={6} md={6}>
                <Autocomplete
                  autoComplete
                  name="Auditor"
                  onChange={(event, newValue) => {
                    setValue('Auditor', newValue?.KnowAs || '');
                    setValue('AuditorId', newValue?.Id || '');
                  }}
                  disabled={isViewOnly}
                  defaultValue={reduxData?.Auditors?.data?.find((d) => d?.KnowAs === values?.Auditor) || {}}
                  value={reduxData?.Auditors?.data?.find((d) => d?.KnowAs === values?.Auditor) || {}}
                  getOptionLabel={(option) => {
                    // console.log(option);
                    return option?.KnowAs === undefined ? '' : `${option?.KnowAs}` || '';
                  }}
                  options={auditorOptions || []}
                  size="small"
                  autoHighlight
                  sx={{ width: '100%', minWidth: 150 }}
                  renderInput={(params) => <RenderInput params={params} isRequired label="Auditor" />}
                  noOptionsText={<Typography>Search not found</Typography>}
                  PopperComponent={PopperComponent}
                  renderOption={(props, option) => {
                    // console.log(option);
                    return (
                      <Box component="li" {...props}>
                        {option?.KnowAs}
                      </Box>
                    );
                  }}
                  isOptionEqualToValue={(option, value) => {
                    // console.log(option, value);
                    return `${option?.KnowAs}` === `${value?.KnowAs}`;
                  }}
                />
              </Grid>
              <Grid item xs={6} md={6}>
                <Autocomplete
                  autoComplete
                  name="AuditTime"
                  onChange={(event, newValue) => {
                    setValue('AuditTime', newValue?.Caption || '');
                    setValue('AuditTimeId', newValue?.Value || '');
                  }}
                  disabled={isViewOnly}
                  defaultValue={
                    reduxData?.AuditTime !== null
                      ? reduxData?.AuditTime[0]?.Elements?.find((d) => d?.Caption === values?.AuditTime) || {}
                      : {}
                  }
                  value={
                    reduxData?.AuditTime !== null
                      ? reduxData?.AuditTime[0]?.Elements?.find((d) => d?.Caption === values?.AuditTime) || {}
                      : {}
                  }
                  getOptionLabel={(option) => {
                    // console.log(option);
                    return option?.Caption === undefined ? '' : `${option?.Caption}` || '';
                  }}
                  options={reduxData?.AuditTime !== null ? reduxData?.AuditTime[0]?.Elements : []}
                  size="small"
                  autoHighlight
                  sx={{ width: '100%', minWidth: 150 }}
                  renderInput={(params) => <RenderInput params={params} label="Audit Time" />}
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
            </Grid>
          </Box>
        </Card>
        {/* </Box> */}
        {/* <Box sx={{ height: '100%', p: 1 }}> */}
        <Card
          sx={{
            height: {
              xs: `calc(100vh - ${HEADER.MOBILE_HEIGHT + BUTTON_GROUP + INFO_CARD + BOTTOM_BUTTON}px)`,
              md: `calc(100vh - ${HEADER.MOBILE_HEIGHT + BUTTON_GROUP + INFO_CARD + BOTTOM_BUTTON}px)`,
              lg: `calc(100vh - ${HEADER.DASHBOARD_DESKTOP_HEIGHT + BUTTON_GROUP + INFO_CARD + BOTTOM_BUTTON}px)`,
            },
            minHeight: '35vh',
          }}
        >
          <Box sx={{ p: 1 }}>
            <Stack sx={{ p: 1 }}>
              <Grid container spacing={3}>
                <Grid item xs={8} md={6}>
                  <Typography variant="caption" color="black" fontWeight={'bold'}>
                    {translate('Compliance Request Details')}
                  </Typography>
                </Grid>
                {isViewOnly ? (
                  <></>
                ) : (
                  <Grid item xs={4} md={6}>
                    <RootStyle onClick={handleAddLine}>
                      <Iconify icon={IconName.plusCircle} width={24} height={24} />
                    </RootStyle>
                  </Grid>
                )}
              </Grid>
              {lines?.length > 0 ? <Divider sx={{ p: 1 }} /> : <></>}
            </Stack>
            <Scrollbar sx={{ height: 700 }}>
              <List
                dataSource={lines?.filter((item) => item.DBAction !== 'Delete')}
                itemRender={itemTemplate}
                // height={smUp ? '54vh' : '25vh'}
                height={`calc(100vh - ${HEADER.MOBILE_HEIGHT + SPACING + BUTTON_GROUP + INFO_CARD + BOTTOM_BUTTON + TAB_HEIGHT
                  }px)`}
                scrollingEnabled
                searchMode={'contains'}
                noDataText={translate('noDataText')}
                focusStateEnabled={false}
                onInitialized={() => {
                  fx.off = true;
                }}
                onContentReady={() => {
                  setTimeout(() => {
                    fx.off = false;
                  }, 2000);
                }}
                refreshingText="Refreshing..."
                pageLoadingText="Loading..."
                pageLoadMode="scrollBottom"
                selectionMode="multiple"
                showScrollbar={'onScroll'}
              />
            </Scrollbar>
          </Box>
        </Card>
        {/* </Box> */}
        <Grid
          container
          spacing={2}
          sx={{
            position: { xs: 'fixed', md: 'static', lg: 'static' },
            overflow: 'hidden',
            bottom: 3,
            left: 1,
            pl: 1,
            pr: 1,
            pb: 1,
          }}
        >
          <Grid item xs={12} md={12}>
            {Object.keys(errors).map((key) => {
              if (errors[key] !== undefined && errors[key].message !== undefined) {
                // return (
                //   <Alert severity="error" key={key}>
                //     Error: {errors[key].message}
                //   </Alert>
                // );
                enqueueSnackbar(`Error: ${errors[key].message}`, {
                  variant: 'error',
                  anchorOrigin: {
                    vertical: 'top',
                    horizontal: 'center',
                  },
                });
              }
              return null;
            })}
          </Grid>
          <Grid item xs={name === 'add' ? 12 : 6} md={name === 'add' ? 12 : 6}>
            <LoadingButton variant={'contained'} fullWidth type="submit" disabled={isViewOnly}>
              Save
            </LoadingButton>
          </Grid>
          {name === 'add' ? null : (
            <Grid item xs={6} md={6}>
              <LoadingButton
                variant={'contained'}
                sx={{
                  backgroundColor: theme.palette.error.main,
                }}
                fullWidth
                onClick={() => setDeleteModal(true)}
                disabled={isViewOnly}
              >
                Delete
              </LoadingButton>
            </Grid>
          )}
        </Grid>
      </FormProvider>
      {modalContent.visible ? (
        <PopUpContents
          modalContent={modalContent}
          setModalContent={setModalContent}
          translate={translate}
          reduxData={reduxData}
          smUp={smUp}
          mdUp={mdUp}
          isViewOnly={isViewOnly}
          lines={lines}
          setLines={setLines}
          saveRequest={handleSave}
          parentValues={values}
        />
      ) : null}
      {deleteModal ? (
        <PopupConfirm
          title={'Delete Detail'}
          visible={deleteModal}
          onClose={() => setDeleteModal(!deleteModal)}
          onProcess={handleDelete}
          description={'Are you sure to delete this detail?'}
        />
      ) : null}
    </Stack>
  );
}

// Render Input
const RenderInput = ({ params, label, isRequired = false, ...other }) => {
  RenderInput.propTypes = {
    params: PropTypes.object,
    label: PropTypes.node,
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
        <Stack direction="row" justifyContent="center" alignItems="center">
          <Iconify icon={IconName.search} />
          <p className="ml-1">{label}</p>
          {isRequired && (
            // <Iconify icon={'bi:asterisk'} sx={{ color: 'red', ml: 1, fontSize: 7 }} />
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
