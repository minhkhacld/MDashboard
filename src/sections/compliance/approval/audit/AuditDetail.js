import { yupResolver } from '@hookform/resolvers/yup';
import { LoadPanel, Position } from 'devextreme-react/load-panel';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import * as Yup from 'yup';
// @mui

import { Alert, Box, Card, Container, Divider, Tab, Tabs, Typography, useTheme } from '@mui/material';

// Redux
import Page from '../../../../components/Page';
import { setTabComplianceDetail } from '../../../../redux/slices/tabs';
import { dispatch, useSelector } from '../../../../redux/store';
// routes
import { PATH_APP } from '../../../../routes/paths';
// hooks
import { FormProvider } from '../../../../components/hook-form/index';
import useFormatNumber from '../../../../hooks/useFormatNumber';
import useIsOnline from '../../../../hooks/useIsOnline';
import useLocales from '../../../../hooks/useLocales';
import useResponsive from '../../../../hooks/useResponsive';
import useSettings from '../../../../hooks/useSettings';
import useToggle from '../../../../hooks/useToggle';
// components
import LoadingBackDrop from '../../../../components/BackDrop';
import Scrollbar from '../../../../components/Scrollbar';
import ProductStepper from '../../../../components/Stepper';
import { HEADER } from '../../../../config';
import useIsMountedRef from '../../../../hooks/useIsMountedRef';
import AuditFactoryInfo from '../../audit/detail/AuditFactoryInfo';
import CommandWidget from '../ComandWidget';
import ApproveDrawer from '../Drawer';
import AuditLines from './AuditLines';
import AuditResult from './AuditResult';
// CONFIG

// ----------------------------------------------------------------------

export default function ComplianceAuditDetail({ WFInstance, state }) {
  ComplianceAuditDetail.propTypes = {
    WFInstance: PropTypes.object,
    state: PropTypes.object,
  };

  // Hooks
  const { fShortenNumber } = useFormatNumber();
  const { translate } = useLocales();
  const { themeStretch } = useSettings();
  const mdUp = useResponsive('up', 'md');
  const smUp = useResponsive('up', 'sm');
  const { name } = useParams();
  const naviagte = useNavigate();
  const theme = useTheme();
  const { online } = useIsOnline();
  const isMountedRef = useIsMountedRef();
  const { enqueueSnackbar } = useSnackbar();
  const { toggle: open, setToggle } = useToggle();

  const isViewOnly = state?.isViewOnly;
  const itemData = state?.item || null;

  // INDEXDB
  // const TodoList = useLiveQuery(() => complianceDB?.Todo.toArray()) || [];
  // const Enums = useLiveQuery(() => complianceDB?.Enums.toArray()) || [];
  // const Factories = useLiveQuery(() => complianceDB?.Factories.toArray()) || [];
  // const Customers = useLiveQuery(() => complianceDB?.Customers.toArray()) || [];
  // const Companies = useLiveQuery(() => complianceDB?.Companies.toArray()) || [];

  // const Employees = useLiveQuery(() => complianceDB?.Employee.toArray()) || [];

  // window.onbeforeunload = function () {
  //   return 'Dude, are you sure you want to leave? Think of the kittens!';
  // };

  // Redux
  const { LoginUser } = useSelector((store) => store.workflow);
  const { loading } = useSelector((store) => store.qc);
  const { complianceDetailTab } = useSelector((store) => store.tabs);
  const reduxData = useSelector((store) => store.compliance);

  const currentTodoItem = isViewOnly ? itemData : {};

  // Components state;
  const [sending, setSending] = useState(false);

  // Menu
  const TABS = [
    {
      label: 'Audit Info',
      value: '1',
    },
    {
      label: 'Factory Info',
      value: '2',
    },
    {
      label: 'Audit Checklist',
      value: '3',
    },
  ];

  // components state
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoading, setLoading] = useState(false);

  const defaultValues =
    useMemo(
      () => ({
        AuditDateFrom: currentTodoItem?.AuditDateFrom || '',
        AuditDateTo: currentTodoItem?.AuditDateTo || '',
        Grade: currentTodoItem?.Grade || '',
        TimeEffect: currentTodoItem?.TimeEffect || '',
        AuditingResultId: currentTodoItem?.AuditingResultId || '',
        Remark: currentTodoItem?.Remark || '',
        AuditTypeId: currentTodoItem?.AuditTypeId || '',
        ComplianceInspectionTemplateId: currentTodoItem?.ComplianceInspectionTemplateId || '',
        SysNo: currentTodoItem?.SysNo || '',
        AuditorName: currentTodoItem?.AuditorName || '',
        AuditingResult: currentTodoItem?.AuditingResult || '',
        AuditType: currentTodoItem?.AuditType || '',
        AuditingCompanyName: currentTodoItem?.AuditingCompanyName || '',
        AuditingCompanyId: currentTodoItem?.AuditingCompanyId,
        AuditTime: currentTodoItem?.AuditTime || '',
        AuditTimeId: currentTodoItem?.AuditTimeId || '',
        CustomerName: currentTodoItem?.CustomerName || '',
        CustomerId: currentTodoItem?.CustomerId || '',
        BrandName: currentTodoItem?.BrandName || '',
        BrandId: currentTodoItem?.BrandId || '',
        FactoryName: currentTodoItem?.FactoryName || '',
        FactoryId: currentTodoItem?.FactoryId || '',
        FactoryInfoLines: currentTodoItem?.FactoryInfoLines || []
      })
      ,
      [name, currentTodoItem]
    );

  const TodoInfoScheme = Yup.object().shape({});

  const methods = useForm({
    resolver: yupResolver(TodoInfoScheme),
    defaultValues,
  });

  const {
    watch,
    setValue,
    handleSubmit,
    setError,
    register,
    formState: { isSubmitting, errors },
  } = methods;

  const values = watch();

  const adaptiveBreacrumbs = online
    ? [
      { name: translate('home'), href: PATH_APP.general.app },
      { name: 'Compliance Audit', href: PATH_APP.compliance.audit.list },
      {
        name: isViewOnly ? `Detail (View only)` : 'Detail',
      },
    ]
    : [
      { name: 'Compliance Audit', href: PATH_APP.compliance.audit.list },
      {
        name: isViewOnly ? `Detail (View only)` : 'Detail',
      },
    ];

  const handleChangeTab = (e, newValue) => {
    dispatch(setTabComplianceDetail(newValue));
  };

  // HANDLE SUBMIT INFORMATIONS

  const RenderErrors = () => {
    if (Object.keys(errors).length === 0) {
      return null;
    }
    if (errors?.Unfinished) {
      return (
        <Box mb={1} mt={1}>
          <Alert severity="error" sx={{ py: 0 }}>
            {errors?.Unfinished?.message}
          </Alert>
        </Box>
      );
    }
    if (Object.keys(errors).length > 0) {
      return (
        <Box mb={1} mt={1}>
          <Alert severity="error" sx={{ py: 0 }}>
            {Object.keys(errors).join(', ')} is required!
          </Alert>
        </Box>
      );
    }
  };

  // console.log('default', errors);
  const BREAKCRUM_HEIGHT = 78;
  const STEP_HEADER_HEIGHT = 88;
  const TAB_HEIGHT = 48;
  const BUTTON_GROUP = 34;
  const SPACING = 30;
  // const ANDROID_KEYBOARD = Capacitor.getPlatform() === 'android' ? 32 : 0;
  const checkNotch = () => {
    const iPhone = /iPhone/.test(navigator.userAgent) && !window.MSStream
    const aspect = window.screen.width / window.screen.height
    if (iPhone && aspect.toFixed(3) === "0.462") {
      // I'm an iPhone X or 11...
      return 55
    }
    return 0
  };

  const NOTCH_HEIGHT = checkNotch();

  return (
    <Page>
      <Container maxWidth={themeStretch ? false : 'lg'} sx={{ p: 1, pt: 0 }}>
        <ProductStepper WFInstance={WFInstance} />
        <CommandWidget open={open} setToggle={setToggle} />
        {open && <ApproveDrawer open={open} setToggle={setToggle} WFInstance={WFInstance} />}
        <FormProvider
          methods={methods}
        >
          <Card
            id="compliance-card-detail"
            sx={{
              height: {
                xs: `calc(100vh - ${HEADER.MOBILE_HEIGHT + SPACING + STEP_HEADER_HEIGHT + BUTTON_GROUP}px)`,
                md: `calc(100vh - ${HEADER.MOBILE_HEIGHT + SPACING + STEP_HEADER_HEIGHT + BUTTON_GROUP}px)`,
                lg: `calc(100vh - ${HEADER.DASHBOARD_DESKTOP_HEIGHT + SPACING + STEP_HEADER_HEIGHT + BUTTON_GROUP}px)`,
              },
              minHeight: '50vh',
              paddingBottom: 1,
            }}
          >
            <Tabs
              allowScrollButtonsMobile
              variant="scrollable"
              scrollButtons="auto"
              value={complianceDetailTab}
              onChange={(e, newValue) => handleChangeTab(e, newValue)}
              sx={{ px: mdUp ? 2 : 1, bgcolor: 'background.neutral' }}
            >
              {TABS.map((tab, index) => (
                <Tab
                  // disableRipple
                  key={tab.value}
                  value={tab.value}
                  label={
                    <Typography variant="body1" fontSize={smUp ? 14 : 12} fontWeight={'bold'}>
                      {tab.label}
                    </Typography>
                  }
                  style={{ minWidth: 60 }}
                />
              ))}
            </Tabs>
            <Divider />
            <RenderErrors />
            {/* <Box p={1}> */}
            <div
              role="tabpanel"
              hidden={complianceDetailTab !== '1'}
              id={`simple-tabpanel-${complianceDetailTab}-1`}
              aria-labelledby={`simple-tab-${complianceDetailTab}-1`}
            // style={{ overflow: 'auto', height: 'auto' }}
            >
              <Scrollbar
                id="list-item"
                sx={{
                  p: 1,
                  overflow: 'auto',
                  height: {
                    xs: `calc(100vh - ${HEADER.MOBILE_HEIGHT + SPACING + STEP_HEADER_HEIGHT + TAB_HEIGHT + BUTTON_GROUP + SPACING
                      }px)`,
                    md: `calc(100vh - ${HEADER.MOBILE_HEIGHT + SPACING + STEP_HEADER_HEIGHT + TAB_HEIGHT + BUTTON_GROUP + SPACING
                      }px)`,
                    lg: `calc(100vh - ${HEADER.DASHBOARD_DESKTOP_HEIGHT + SPACING + STEP_HEADER_HEIGHT + TAB_HEIGHT + SPACING
                      }px)`,
                  },
                }}
              >
                {complianceDetailTab === '1' && (
                  <AuditResult
                    isViewOnly={isViewOnly}
                    currentTodoItem={currentTodoItem}
                    methods={methods}
                    reduxData={reduxData}
                  />
                )}
              </Scrollbar>
            </div>

            <div
              role="tabpanel"
              hidden={complianceDetailTab !== '2'}
              id={`simple-tabpanel-${complianceDetailTab}-2`}
              aria-labelledby={`simple-tab-${complianceDetailTab}-2`}
            >
              <AuditFactoryInfo
                dataSource={currentTodoItem?.FactoryInfoLines || []}
                height={{
                  xs: `calc(100vh - ${HEADER.MOBILE_HEIGHT + SPACING + STEP_HEADER_HEIGHT + TAB_HEIGHT + BUTTON_GROUP + SPACING}px)`,
                  sm: `calc(100vh - ${HEADER.MOBILE_HEIGHT + SPACING + STEP_HEADER_HEIGHT + TAB_HEIGHT + BUTTON_GROUP + SPACING}px)`,
                  lg: `calc(100vh - ${HEADER.DASHBOARD_DESKTOP_HEIGHT + SPACING + STEP_HEADER_HEIGHT + TAB_HEIGHT + SPACING
                    }px)`
                }
                }
                isViewOnly={isViewOnly}
                todoId={name}
              />

            </div>

            <div
              role="tabpanel"
              hidden={complianceDetailTab !== '3'}
              id={`simple-tabpanel-${complianceDetailTab}-3`}
              aria-labelledby={`simple-tab-${complianceDetailTab}-3`}
            >
              <AuditLines isViewOnly={isViewOnly} currentTodoItem={currentTodoItem}
                height={{
                  xs: `calc(100vh - ${HEADER.MOBILE_HEIGHT + SPACING + STEP_HEADER_HEIGHT + TAB_HEIGHT + BUTTON_GROUP + SPACING}px)`,
                  sm: `calc(100vh - ${HEADER.MOBILE_HEIGHT + SPACING + STEP_HEADER_HEIGHT + TAB_HEIGHT + BUTTON_GROUP + SPACING}px)`,
                  lg: `calc(100vh - ${HEADER.DASHBOARD_DESKTOP_HEIGHT + SPACING + STEP_HEADER_HEIGHT + TAB_HEIGHT + SPACING
                    }px)`
                }
                }
              />
            </div>

          </Card>
        </FormProvider>

        {loading && (
          <LoadPanel
            hideOnOutsideClick
            message="Please, wait..."
            visible={loading}
            onHidden={() => setLoading(false)}
            showPane={false}
            position="center"
          >
            <Position my="center" at="center" of="#compliance-card-detail" />
          </LoadPanel>
        )}

        {sending ? <LoadingBackDrop loading={sending} text={'Submitting data, please wait...!!!'} /> : null}

      </Container>
    </Page>
  );
}
