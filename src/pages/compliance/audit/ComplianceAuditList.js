import { Capacitor } from '@capacitor/core';
import { useLiveQuery } from 'dexie-react-hooks';
import { useSnackbar } from 'notistack';
import { useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
// @mui
import {
  Card,
  Container, Divider, Tab,
  Tabs,
  Typography,
  useTheme
} from '@mui/material';

// devextreme
// Redux
import Page from '../../../components/Page';
import { setComplianceSignalR, startLoading } from '../../../redux/slices/compliance';
import { setTabComplianceList } from '../../../redux/slices/tabs';
import { dispatch, useSelector } from '../../../redux/store';
// routes
import { attachmentsDB, complianceDB } from '../../../Db';
// hooks
import useIsOnline from '../../../hooks/useIsOnline';
import useResponsive from '../../../hooks/useResponsive';
import useSettings from '../../../hooks/useSettings';
// components
// import CommandWidget from '../../../components/CommandWidget';
import Label from '../../../components/Label';
import UploadFileBackdrop from '../../../sections/qc/inspection/components/UploadFileBackdrop';
import axios from '../../../utils/axios';
import ExtremeListAll from './child/AllList';
import ExtremeList from './child/ExtremeList';
import TabPanel from '../../../components/tab/TabPanel';
// Configs
import { HEADER, NOTCH_HEIGHT } from '../../../config';

// ----------------------------------------------------------------------

const SPACING = 30;


async function updateIndexDb(Id) {
  await attachmentsDB.compliance.where('ParentId')
    .equals(Id)
    .delete()
    .then(() => {
    });
  await complianceDB.Todo.where('id')
    .equals(Id)
    .delete()
    .then(() => {
    });
}

function ComplianceAuditList() {

  // Hooks
  const { themeStretch } = useSettings();
  const mdUp = useResponsive('up', 'md');
  const smUp = useResponsive('up', 'sm');
  const { online } = useIsOnline();
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const inputRef = useRef(null);
  const { pathname } = useLocation();
  // redux
  const { complianceListTab } = useSelector((store) => store.tabs);
  const { shouldCallApi, signalR, loading } = useSelector((store) => store.compliance);
  // DB
  const TodoList = useLiveQuery(() => complianceDB?.Todo.toArray()) || [];

  // components state
  // const [loading, setLoading] = useState(false);

  // custome function store enum to indexdb
  const setLocalEnumsDataSource = (data) => {
    complianceDB?.Enums.clear()
      .then(async () => {
        await complianceDB.Enums.bulkAdd(data);
      })
      .catch((err) => {
        console.log(err);
        enqueueSnackbar(err, {
          variant: 'error',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'center',
          },
        });
      });
  };

  const setLocalFactories = (data) => {
    complianceDB?.Factories.clear()
      .then(async () => {
        await complianceDB.Factories.bulkAdd(data);
      })
      .catch((err) => {
        console.log(err);
        enqueueSnackbar(err, {
          variant: 'error',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'center',
          },
        });
      });
  };

  const setLocalCustomers = (data) => {
    complianceDB?.Customers.clear()
      .then(async () => {
        await complianceDB.Customers.bulkAdd(data);
      })
      .catch((err) => {
        console.log(err);
        enqueueSnackbar(err, {
          variant: 'error',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'center',
          },
        });
      });
  };

  const setLocalCompanies = (data) => {
    const newComp = data.filter((v, i, a) => a.findIndex((v2) => v2.CompanyName === v.CompanyName) === i);
    // console.log(newComp);
    complianceDB?.Companies.clear()
      .then(async () => {
        await complianceDB.Companies.bulkAdd(newComp);
      })
      .catch((err) => {
        console.log(err);
        enqueueSnackbar(err, {
          variant: 'error',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'center',
          },
        });
      });
  };

  const setLocalEmployee = (data) => {
    complianceDB?.Employee.clear()
      .then(async () => {
        await complianceDB.Employee.bulkAdd(data);
      })
      .catch((err) => {
        console.log(err);
        enqueueSnackbar(err, {
          variant: 'error',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'center',
          },
        });
      });
  };


  // Get SubFactory List
  const setLocalSubFactories = (data) => {
    complianceDB?.SubFactories.clear()
      .then(async () => {
        await complianceDB.SubFactories.bulkAdd(data);
      })
      .catch((err) => {
        console.log(err);
        enqueueSnackbar(err, {
          variant: 'error',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'center',
          },
        });
      });
  };


  const callApi = useCallback(
    () => {
      try {
        // setLoading(true);
        // 2
        const enums = 'ProductGroup,ProductLine,AuditTime,AuditType,Brand,AuditingResult,ComplianceLineEvaluation,MailType,Division';
        const getEnums = axios.get(`/api/ComplianceMobileApi/GetSysEnumElements_ByEnumNames?enumNames=${enums}`);
        const getFactories = axios.get(`api/ComplianceMobileApi/GetFactoryList`);
        const getSubFactories = axios.get(`/api/QCMobileApi/GetSubFactoryList`);
        const getCustomers = axios.get(`api/ComplianceMobileApi/GetCustomerList`);
        const getCompanyList = axios.get(`api/ComplianceMobileApi/GetCompanyList`);
        const getEmployeeList = axios.get(`api/ComplianceMobileApi/GetEmployeeList`);
        Promise.all([getEnums, getFactories, getCustomers, getCompanyList, getEmployeeList, getSubFactories]).then((response) => {
          // console.log('Get all compliance enums', response);
          if (response) {
            setLocalEnumsDataSource(response[0]?.data);
            setLocalFactories(response[1]?.data?.data);
            setLocalCustomers(response[2]?.data?.data);
            setLocalCompanies(response[3]?.data?.data);
            setLocalEmployee(response[4]?.data?.data);
            setLocalSubFactories(response[5]?.data?.data);
            // setLoading(false);
          }
        });

      } catch (error) {
        console.error(error);
        if (error.message.includes('Failed to execute')) {
          complianceDB
            .delete()
            .then(() => {
              console.log('Database successfully deleted');
              window.location.reload();
            })
            .catch(() => {
              console.error('Could not delete database');
            })
            .finally(() => {
              // Do what should be done next...
            });
        }
        // setLoading(false);
        enqueueSnackbar(JSON.stringify(error), {
          variant: 'error',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'center',
          },
        });
      }
    }, []);

  useEffect(() => {
    if (online
      // && shouldCallApi
    ) {
      callApi();
    }
    if (!online) {
      dispatch(setTabComplianceList('1'));
    }
  }, []);

  useEffect(() => {

    (async () => {

      // if nothing happen
      if (signalR.id === null) return;

      // checking for item exist in db;
      const itemExist = await complianceDB.Todo.get({ id: signalR.id })
      if (!itemExist) return;

      // set loading progress
      dispatch(startLoading(true));

      // if server response with status 4 - successfull processing then delete item;
      if (signalR.message === "12" && signalR.type === 'Info' && itemExist.IsProcessing) {
        await updateIndexDb(signalR.id);
        dispatch(setComplianceSignalR({ id: null, sysNo: null, qcType: null, message: null, type: null, guid: null }));
        enqueueSnackbar('Submit sent successfully!', {
          autoHideDuration: 10000,
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'center',
          },
        })
      }

      // if has error, notifi to users;
      if (signalR.type === 'Error') {
        enqueueSnackbar(`Phiếu Audit ${signalR.sysNo} cập nhật lỗi! ${signalR.message}`, {
          variant: 'error',
          autoHideDuration: 10000,
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'center',
          },
        })
      };

      // waiting for 1 section before close popup;
      await new Promise(resolve => setTimeout(resolve, 1000));
      dispatch(startLoading(false));

    })();

  }, [signalR,]);



  const handleChangeTab = (e, newValue) => {
    dispatch(setTabComplianceList(newValue));
  };

  function renderTab() {
    if (online) {
      return [
        {
          label: 'Todo',
          value: '1',
          count: TodoList.length,
          color: 'info'
        },
        {
          label: 'All',
          value: '2',
          count: 0,
          color: 'error',
        },
      ];
    }
    return [{ label: 'Todo', value: '1', count: TodoList.length, color: 'info' }];
  };

  const TABS = renderTab();
  const ANDROID_KEYBOARD = Capacitor.getPlatform() === 'android' ? 0 : 0;
  const IOS_KEYBOARD = Capacitor.getPlatform() === 'ios' ? 16 : 0;


  return (
    <Page title={'Compliance'}>
      <Container
        maxWidth={themeStretch ? false : 'lg'}
        sx={{ paddingLeft: 1, paddingRight: 1, position: mdUp ? 'relative' : 'fixed' }}
      >
        <Card
          id="compliance-audit-card-list"
          sx={{
            height: {
              xs: `calc(100vh - ${HEADER.MOBILE_HEIGHT + SPACING + ANDROID_KEYBOARD + IOS_KEYBOARD + NOTCH_HEIGHT}px)`,
              sm: `calc(100vh - ${HEADER.MOBILE_HEIGHT + SPACING + ANDROID_KEYBOARD + IOS_KEYBOARD + NOTCH_HEIGHT}px)`,
              lg: `calc(100vh - ${HEADER.DASHBOARD_DESKTOP_HEIGHT +
                SPACING +
                ANDROID_KEYBOARD + IOS_KEYBOARD + NOTCH_HEIGHT
                }px)`,
            },
            minHeight: '65vh',
          }}
        >

          <Tabs
            allowScrollButtonsMobile
            variant="scrollable"
            scrollButtons="auto"
            id="tab-panel"
            value={complianceListTab}
            onChange={(e, newValue) => handleChangeTab(e, newValue)}
            sx={{ px: mdUp ? 2 : 0, bgcolor: 'background.neutral' }}
          >
            {TABS.map((tab, index) => (
              <Tab
                // disableRipple
                key={tab?.value}
                value={tab?.value}
                icon={
                  <Label color={tab?.color}>
                    <span id={`tab-label-${index}`}>{tab?.count}</span>
                  </Label>
                }
                label={
                  <Typography variant="body1" fontSize={smUp ? 14 : 12} fontWeight={'bold'}>
                    {tab?.label}
                  </Typography>
                }
                style={{ minWidth: 100 }}
              />
            ))}
          </Tabs>

          <Divider />

          <TabPanel value={'1'} currentTab={complianceListTab}>
            <ExtremeList />
          </TabPanel>

          <TabPanel value={'2'} currentTab={complianceListTab}>
            <ExtremeListAll />
            {/* <AllListCustom /> */}
          </TabPanel>

        </Card>

        {
          loading && <UploadFileBackdrop
            loading={loading}
            progress={100}
            signalR={signalR}
          />
        }

      </Container>
    </Page>
  );
};

export default ComplianceAuditList;



