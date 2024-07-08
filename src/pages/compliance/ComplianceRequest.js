import { yupResolver } from '@hookform/resolvers/yup';
import { LoadingButton } from '@mui/lab';
import { capitalCase } from 'change-case';
import { LoadPanel, Position } from 'devextreme-react/load-panel';
import moment from 'moment';
import { useSnackbar } from 'notistack';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import * as Yup from 'yup';
// @mui
import {
  Alert,
  Box,
  Button,
  Card,
  Container,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
  colors,
  styled,
  useTheme
} from '@mui/material';
// devextreme
import { Popup } from 'devextreme-react';
import { List, SearchEditorOptions } from 'devextreme-react/list';
import ScrollView from 'devextreme-react/scroll-view';
import fx from 'devextreme/animation/fx';
// import { useAuth } from 'oidc-react';
// Redux
import Page from '../../components/Page';
import { useSelector } from '../../redux/store';
// routes
import { PATH_APP } from '../../routes/paths';
// hooks
import useFormatNumber from '../../hooks/useFormatNumber';
import useLocales from '../../hooks/useLocales';
import useResponsive from '../../hooks/useResponsive';
import useSettings from '../../hooks/useSettings';
// components
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import Iconify from '../../components/Iconify';
import Label from '../../components/Label';
import NoItemsBanner from '../../components/NoItemsBanner';
import PopupConfirm from '../../components/PopupConfirm';
import { FormProvider, RHFTextField } from '../../components/hook-form/index';
import axios from '../../utils/axios';
import IconName from '../../utils/iconsName';
import { transformNullToZero } from '../../utils/tranformNullToZero';

// ENtityList
import { PAYMENT_KEY } from '../../config';
import useTabs from '../../hooks/useTabs';

// ----------------------------------------------------------------------
const PAGE_TAB_KEY = 'APPROVAL_PENDING';

const RootStyle = styled('div')(({ theme }) => ({
  zIndex: 999,
  right: 0,
  display: 'flex',
  cursor: 'pointer',
  position: 'fixed',
  alignItems: 'center',
  top: '50%',
  height: theme.spacing(5),
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  paddingTop: theme.spacing(0),
  boxShadow: theme.customShadows.z20,
  color: theme.palette.success.dark,
  backgroundColor: 'transparent',
  borderTopLeftRadius: Number(theme.shape.borderRadius) * 2,
  borderBottomLeftRadius: Number(theme.shape.borderRadius) * 2,
  transition: theme.transitions.create('opacity'),
  '&:hover': { opacity: 0.72 },
}));

export default function ComplianceRequest() {
  // Hooks
  const { fShortenNumber } = useFormatNumber();
  const { translate } = useLocales();
  const { themeStretch } = useSettings();
  const mdUp = useResponsive('up', 'md');
  const smUp = useResponsive('up', 'sm');
  // const auth = useAuth();

  // redux
  // const { currentTab } = useSelector((store) => store.approval);
  const { LoginUser } = useSelector((store) => store.workflow);

  const theme = useTheme();
  const { onChangeTab } = useTabs('');

  // components state
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState();
  const [isSearching, setIsSearching] = useState(false);
  const [modalContent, setModalContent] = useState({
    visible: false,
    item: null,
    isAddNew: false,
  });
  const [isViewAll, setIsViewAll] = useState(false);

  const defaultValues = useMemo(
    () => ({
      StartAuditDate: '',
      Title: '',
      Auditor: '',
      AuditTime: '',
    }),
    []
  );

  const stepScheme = Yup.object().shape({
    StartAuditDate: Yup.date()
      .default(() => {
        return new Date();
      })
      .required('Start Audit Date is required'),
    Title: Yup.string(),
    Auditor: Yup.string(),
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
    setError,
    formState: { isSubmitting, errors },
  } = methods;

  // OPEN MODAL EDIT DEFECT
  const handleSetModalItem = (data) => {
    setModalContent({ ...modalContent.isAddNew, visible: true, item: data });
    Object.keys(data).forEach((key) => {
      if (key === 'DueDate') {
        setValue(key, data[key] === null ? '' : moment(data[key]).format('DD/MM/YYYY'));
      } else if (key === 'Major' || key === 'Minor' || key === 'Critical') {
        setValue(key, transformNullToZero(data[key]));
      } else {
        setValue(key, data[key] === null ? '' : data[key]);
      }
    });
  };

  // OPEN MODAL CREATE NEW DEFECT
  const handleCreateDefect = () => {
    setModalContent({ visible: true, item: null, isAddNew: true });
    if (isViewAll) {
      handleViewLess();
    }
    Object.keys(defaultValues).forEach((key) => {
      if (key === 'StartAuditDate') {
        setValue('StartAuditDate', '');
      } else {
        setValue(key, '');
      }
    });
  };

  // Devextreme store;
  const getDataSource = () => {
    setLoading(true);
    return axios.get('/api/ComplianceRequestMobileApi/GetList', {
      //   params: {
      //   },
    });
  };

  useEffect(() => {
    getDataSource()
      .then((result) => {
        // console.log(result.data.data);
        let newData = [];
        const WFNameList = result.data.data.map((a) => a.WFStatusName);
        // const specificWFName = ['Pending Requests', 'Open Requests', 'Approved Requests'];
        const specificWFName = ['Open Requests'];
        for (let i = 0; i < specificWFName.length; i += 1) {
          const item = result.data.data.filter((a) => a.WFStatusName === specificWFName[i]);
          const obj =
            item.length !== 0 ? { key: specificWFName[i], items: item } : { key: specificWFName[i], items: [{}] };
          newData = [...newData, obj];
        }
        setSource(newData);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      })
      .finally(() => {
        setIsViewAll(false);
        setLoading(false);
      });
  }, []);

  const handleChangeTab = (e, newValue) => {
    console.log(e, newValue);
    onChangeTab(e, newValue, PAGE_TAB_KEY);
  };

  const handleOpenAddForm = () => { };

  const handleViewAll = () => {
    getDataSource()
      .then((result) => {
        // console.log(result.data.data);
        let newData = [];
        const WFNameList = result.data.data.map((a) => a.WFStatusName);
        // const specificWFName = ['Pending Requests', 'Open Requests', 'Approved Requests'];
        const specificWFName = ['All Request'];
        for (let i = 0; i < specificWFName.length; i += 1) {
          // const item = result.data.data.filter((a) => a.WFStatusName === specificWFName[i]);
          // const obj =
          //   item.length !== 0 ? { key: specificWFName[i], items: result.data.data } : { key: specificWFName[i], items: [{}] };
          const obj = { key: specificWFName[i], items: result.data.data };
          newData = [...newData, obj];
        }
        setSource(newData);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      })
      .finally(() => {
        setIsViewAll(true);
        setLoading(false);
      });
  };
  const handleViewLess = () => {
    getDataSource()
      .then((result) => {
        // console.log(result.data.data);
        let newData = [];
        const WFNameList = result.data.data.map((a) => a.WFStatusName);
        // const specificWFName = ['Pending Requests', 'Open Requests', 'Approved Requests'];
        const specificWFName = ['Open Requests'];
        for (let i = 0; i < specificWFName.length; i += 1) {
          const item = result.data.data.filter((a) => a.WFStatusName === specificWFName[i]);
          const obj =
            item.length !== 0 ? { key: specificWFName[i], items: item } : { key: specificWFName[i], items: [{}] };
          newData = [...newData, obj];
        }
        setSource(newData);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      })
      .finally(() => {
        setIsViewAll(false);
        setLoading(false);
      });
  };
  // RENDER LIST
  const itemTemplate = (data) => {
    // console.log(data?.SysNo);
    return (
      <>
        {data?.SysNo !== undefined ? (
          <Link to={PATH_APP.accounting.pending.report(data.Id)} state={{ Guid: data?.Guid }}>
            <Stack direction="row" justifyContent="space-between" pl={smUp ? 1 : 0}>
              <Stack direction="column" justifyContent="flex-start">
                <Typography variant="caption" paragraph color="black" fontWeight={'bold'} mb={0}>
                  {data?.SysNo}
                </Typography>
                <Typography variant="caption" paragraph mb={0}>
                  {`${data?.CustomerName}-${data?.AuditType}-${data?.FactoryName}`}
                </Typography>
                <Typography variant="caption" paragraph mb={0}>
                  Auditor: {`${data?.AuditorName}`}
                </Typography>
                <Typography variant="caption" paragraph mb={0}>
                  Start Audit Date: {`${data?.StartAuditDate}`}
                </Typography>
              </Stack>
              {/* <Stack direction="column" sx={{ width: mdUp ? 200 : 100 }} justifyContent="flex-start">
            <Typography variant="caption" paragraph mb={0} textAlign="right" color="black" fontWeight={'bold'}>
              ID:{data.Id}
            </Typography>
            <Typography variant="caption" paragraph mb={0} textAlign="right">
              {`${data?.Currency} ${data?.TotalAmount}`}
            </Typography>
            <Typography variant="caption" paragraph mb={0} textAlign="right">
              {data.DueDate !== null ? moment(data.DueDate).format('DD MMM YYYY') : ''}
            </Typography>
            <Typography variant="caption" paragraph mb={0} textAlign="right">
              {data.ReferenceNo}
            </Typography>
          </Stack> */}
            </Stack>
          </Link>
        ) : (
          translate('noDataText')
        )}
      </>
    );
  };

  const GroupRender = (data) => {
    return (
      <Box>
        {data.items[0].Id !== undefined ? (
          <Label color={'success'}>{data.items.length}</Label>
        ) : (
          <Label color={'success'}>0</Label>
        )}
        <Typography
          variant="subtext2"
          sx={{
            color: PAYMENT_KEY[PAYMENT_KEY.findIndex((d) => d.label === 'COMPLIANCE')].color || colors.red[500],
            paddingLeft: 1,
          }}
        >
          {`${capitalCase(data?.key)}`}
        </Typography>
      </Box>
    );
  };

  return (
    <Page title={translate('compliance_request')}>
      <Container maxWidth={themeStretch ? false : 'lg'} sx={{ p: 1, pt: 0 }}>
        <HeaderBreadcrumbs
          heading={translate('compliance_request')}
          links={[{ name: translate('home'), href: PATH_APP.general.app }, { name: translate('compliance_request') }]}
        />
        <RootStyle onClick={handleCreateDefect}>
          <Iconify icon={IconName.plusCircle} width={24} height={24} />
        </RootStyle>

        <Box flex={1} id="aprroval-card">
          <Card sx={{ height: '73vh' }}>
            <Divider />
            <Box sx={{ p: 1 }}>
              <Stack direction={'row'} justifyContent="flex-end" alignItems={'center'} spacing={2} mb={1}>
                {!isViewAll ? (
                  <Button height={30} onClick={handleViewAll}>
                    <Typography variant="caption">{translate('button.viewAll')}</Typography>
                  </Button>
                ) : (
                  <Button height={30} onClick={handleViewLess}>
                    <Typography variant="caption">{translate('View Less')}</Typography>
                  </Button>
                )}
              </Stack>
              <List
                dataSource={source}
                itemRender={itemTemplate}
                searchExpr={['FactoryName', 'SysNo', 'CustomerName', 'AuditorName']}
                grouped
                searchEnabled
                height={smUp ? '62vh' : '68vh'}
                scrollingEnabled
                searchMode={'contains'}
                noDataText={translate('noDataText')}
                focusStateEnabled={false}
                // collapsibleGroups
                groupRender={GroupRender}
                onInitialized={(e) => {
                  fx.off = true;
                }}
                onContentReady={(e) => {
                  setTimeout(() => {
                    fx.off = false;
                  }, 2000);
                }}
              // onGroupRendered={(e) => {
              //   if (source?.length > 1 && e.groupIndex !== 0) {
              //     e.component.collapseGroup(e.groupIndex);
              //   }
              // }}
              >
                <SearchEditorOptions
                  placeholder={`${translate('search')}  FactoryName, SysNo, Customer, Auditor`}
                  showClearButton
                // onFocusIn={(e) => setIsSearching(true)}
                // onFocusOut={(e) => setIsSearching(false)}
                />
              </List>
            </Box>
          </Card>

          {source?.data && source?.data.length === 0 && !loading ? <NoItemsBanner title="No pending approval" /> : null}

          {loading && (
            <LoadPanel
              hideOnOutsideClick
              message="Please, wait..."
              visible={loading}
              onHidden={() => setLoading(false)}
              showPane={false}
              position='center'
            >
              <Position my="center" at="center" of="#aprroval-card" />
            </LoadPanel>
          )}
        </Box>
      </Container>
      {modalContent.visible ? (
        <PopUpContents
          methods={methods}
          modalContent={modalContent}
          setModalContent={setModalContent}
          translate={translate}
          smUp={smUp}
          mdUp={mdUp}
        />
      ) : null}
    </Page>
  );
}

// Render Input
const RenderInput = ({ params, label }) => {
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

// POPUP SET DETAIL INSPECTION
const PopUpContents = ({ methods, modalContent, setModalContent, translate, smUp, mdUp, isViewOnly }) => {
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

  // CLOSE MODAL
  const onClose = () => {
    setModalContent({ visible: false, item: null, isAddNew: false });
    setValue('Images', []);
    reset();
  };

  // SAVE OR ADD DEFECT
  const handleSave = async () => {
    console.log(typeof values.StartAuditDate);
    onClose();
    // try {
    //   const inspections = [...currentInspection.Inspections];
    //   if (Number(values.Major) <= 0 && Number(values.Minor) <= 0 && Number(values.Critical <= 0)) {
    //     return setError('AQL', {
    //       type: 'focus',
    //       message: 'Among Major, Minor, Critical must has one field with value grater than 0.',
    //     });
    //   }
    //   const Major = values.Major === '' ? 0 : Number(values.Major);
    //   const Minor = values.Minor === '' ? 0 : Number(values.Minor);
    //   const Critical = values.Critical === '' ? 0 : Number(values.Critical);
    //   if (modalContent.isAddNew) {
    //     const allIds = inspections.map((d) => d.Id);
    //     const minId = Math.min(...allIds);
    //     let insertId;
    //     if (minId >= 0) {
    //       insertId = -1;
    //     } else {
    //       insertId = minId - 1;
    //     }
    //     await db.MqcInspection.where('Id')
    //       .equals(currentInspection.Id)
    //       .modify((x, ref) => {
    //         ref.value.Inspections = [...inspections, { ...values, Id: insertId, Major, Minor, Critical }];
    //       });
    //     enqueueSnackbar('New defect has been added!', {
    //       variant: 'success',
    //       anchorOrigin: {
    //         vertical: 'top',
    //         horizontal: 'center',
    //       },
    //     });
    //   } else {
    //     const itemIndex = inspections.findIndex((d) => String(d.Id) === String(values.Id));
    //     inspections[itemIndex] = { ...values, Major, Minor, Critical };
    //     await db.MqcInspection.where('Id')
    //       .equals(currentInspection.Id)
    //       .modify((x, ref) => {
    //         // console.log('default', x, ref);
    //         ref.value.Inspections = inspections;
    //       });
    //     enqueueSnackbar('Save successfully!', {
    //       variant: 'success',
    //       anchorOrigin: {
    //         vertical: 'top',
    //         horizontal: 'center',
    //       },
    //     });
    //   }
    //   onClose();
    // } catch (error) {
    //   console.error(error);
    //   enqueueSnackbar('An error has been occured', {
    //     variant: 'error',
    //     anchorOrigin: {
    //       vertical: 'top',
    //       horizontal: 'center',
    //     },
    //   });
    // }
  };

  // DELETE DEFECT
  const handleDeleteDefect = async () => {
    // try {
    //   const inspections = currentInspection.Inspections.filter((d) => d.Id !== values.Id);
    //   await db.MqcInspection.where('Id')
    //     .equals(currentInspection.Id)
    //     .modify((x, ref) => {
    //       ref.value.Inspections = inspections;
    //     });
    //   enqueueSnackbar('Delete successfully!', {
    //     variant: 'success',
    //     anchorOrigin: {
    //       vertical: 'top',
    //       horizontal: 'center',
    //     },
    //   });
    //   onClose();
    // } catch (error) {
    //   console.error(error);
    //   enqueueSnackbar('An error has been occured', {
    //     variant: 'error',
    //     anchorOrigin: {
    //       vertical: 'top',
    //       horizontal: 'center',
    //     },
    //   });
    // }
  };

  return (
    <Popup
      visible={modalContent.visible}
      onHiding={onClose}
      dragEnabled={false}
      hideOnOutsideClick
      showCloseButton
      showTitle
      title="3. Inspection Detail"
      // container=".dx-viewport"
      width={mdUp ? 700 : '100%'}
      height={mdUp ? '100%' : '100%'}
      // className="popup_image_editor"
      contentRender={() => {
        return (
          <ScrollView height={'100%'} width="100%">
            <FormProvider methods={methods} onSubmit={handleSubmit(handleSave)}>
              <Stack spacing={3} sx={{ paddingBottom: 20 }}>
                <Card
                  sx={{
                    px: 1,
                    py: 2,
                  }}
                >
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <RHFTextField
                        name="StartAuditDate"
                        size="small"
                        label={'Start Audit Date'}
                        type="date"
                        InputProps={{ inputProps: { min: 0 } }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <RHFTextField name="Title" size="small" label={'Title'} InputProps={{ inputProps: { min: 0 } }} />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <RHFTextField
                        name="Auditor"
                        size="small"
                        label={'Auditor'}
                        InputProps={{ inputProps: { min: 0 } }}
                      />
                    </Grid>
                    <Grid item xs={12} md={12}>
                      <RHFTextField name="AuditTime" size="small" label={'Audit Time'} />
                    </Grid>
                    <Grid item xs={12} md={12}>
                      {errors?.AQL && errors?.AQL?.message !== undefined && (
                        <Alert severity="error">Error: {errors?.AQL?.message}</Alert>
                      )}
                    </Grid>
                    <Grid item xs={12}>
                      <LoadingButton variant="contained" fullWidth type="submit">
                        Create
                      </LoadingButton>
                    </Grid>
                  </Grid>
                </Card>
              </Stack>

              {deleteModal ? (
                <PopupConfirm
                  title={'Delete Defect'}
                  visible={deleteModal}
                  onClose={() => setDeleteModal(!deleteModal)}
                  onProcess={handleDeleteDefect}
                  description={'Are you sure to delete this defect?'}
                />
              ) : null}
            </FormProvider>
          </ScrollView>
        );
      }}
    />
  );
};
