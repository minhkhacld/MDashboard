import { Capacitor } from '@capacitor/core';
import { useLiveQuery } from 'dexie-react-hooks';
import { useSnackbar } from 'notistack';
import { useCallback, useEffect } from 'react';
import Hammer from 'react-hammerjs';
import { useNavigate } from 'react-router-dom';
// @mui
import { Card, Container, Divider, Tab, Tabs, Typography } from '@mui/material';
// devextreme
// Redux
import Page from '../../components/Page';
import { setCurrentTab, setShouldCallApi, setSignalR, setUploadQueue, setUploadingItem, startLoading } from '../../redux/slices/qc';
import { dispatch, useSelector } from '../../redux/store';
// routes
import { attachmentsDB, db } from '../../Db';
import { PATH_APP } from '../../routes/paths';
// hooks
import useAccessToken from '../../hooks/useAccessToken';
import useIsOnline from '../../hooks/useIsOnline';
import useLocales from '../../hooks/useLocales';
import useResponsive from '../../hooks/useResponsive';
import useSettings from '../../hooks/useSettings';
// components
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import Label from '../../components/Label';
import TabPanel from '../../components/tab/TabPanel';
import axios from '../../utils/axios';
import AllList from './list/AllList';
import TodoList from './list/TodoList';
// CONFIG
import { useWebWorker } from '../../components/WebWorkerProvider';
import { HEADER, HOST_API, NOTCH_HEIGHT } from '../../config';


// ----------------------------------------------------------------------
const BREAKCRUM_HEIGHT = 40;
const SPACING = 24;


async function updateIndexDb(Id) {
  await attachmentsDB.qc.where('MasterId')
    .equals(Id)
    .delete()
    .then(() => {
    });
  await db.MqcInspection.where('Id')
    .equals(Id)
    .delete()
    .then(() => {
    });
};


export default function QCInspection() {
  // Hooks
  const { translate } = useLocales();
  const { themeStretch } = useSettings();
  const mdUp = useResponsive('up', 'md');
  const smUp = useResponsive('up', 'sm');
  const { online } = useIsOnline();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const platform = Capacitor.getPlatform();

  // worker
  const worker = useWebWorker();

  // redux
  const { currentTab, inspectionList, shouldCallApi, loading, signalR, uploadProgress, uploadQueue, uploadingItem } = useSelector((store) => store.qc);
  // const { accessToken } = useSelector(store => store.setting);
  const accessToken = useAccessToken();


  // DB
  const MqcInspection = useLiveQuery(() => db?.MqcInspection.toArray()) || [];

  // components state
  // const [loading, setLoading] = useState(false);
  // const [uploadProgress, setUploadProgress] = useState(0);

  // custome function store enum to indexdb
  const setLocalEnumsDataSource = (data) => {
    db?.Enums.clear()
      .then(async () => {
        await db.Enums.bulkAdd(data);
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

  const setLocalEnumDefectDataSource = (data) => {
    db?.EnumDefect.clear()
      .then(async () => {
        await db.EnumDefect.bulkAdd(data);
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
    db?.Factories.clear()
      .then(async () => {
        await db.Factories.bulkAdd(data);
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
    db?.Customers.clear()
      .then(async () => {
        await db.Customers.bulkAdd(data);
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

  const setLocalSettingList = (data) => {
    db?.SettingList.clear()
      .then(async () => {
        await db.SettingList.bulkAdd(data);
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

  const setLocalSubFactories = (data) => {
    // set issue
    db?.SubFactories.clear()
      .then(async () => {
        await db.SubFactories.bulkAdd(data);
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

  const setLocalFactoriesLine = (data) => {
    // set issue
    db?.FactoryLines.clear()
      .then(async () => {
        await db.FactoryLines.bulkAdd(data);
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

  // CALL API 1 TIMES Get all Enums data
  const callApi = useCallback(async () => {
    try {
      // setLoading(true);
      // 2
      const enums =
        'ProductGroup,DeliveryStatus,Color,QCFormulaAQL,QCFormulaLevel,AuditingResult,InspectionStatus,MeasurementStatus,PackingMethod,ShippingMark,PPMettingStatus,TrimStatus,FabricAndLiningStatus,InspectionStatus,Content,ProductLine,POType,ImageSide,Category,MailType';
      const getEnums = axios.get(`/api/QCMobileApi/GetSysEnumElements_ByEnumNames?enumNames=${enums}`);
      const getEnumsDefect = axios.get(`/api/QCMobileApi/GetDefectEnums`);
      const getFactories = axios.get(`api/QCMobileApi/GetFactoryList`);
      const getCustomers = axios.get(`api/QCMobileApi/GetCustomerList`);
      const getSettingList = axios.get(`/api/QCMobileApi/GetSettingList`);
      const getSubFactories = axios.get(`/api/QCMobileApi/GetSubFactoryList`);
      const getFactoyLine = axios.get('/api/FactoryLineApi/GetLookup');
      Promise.all([getEnums, getEnumsDefect, getFactories, getCustomers, getSettingList, getSubFactories, getFactoyLine]).then(
        (response) => {
          // console.log('Get all inspections, enums', response);
          if (response) {
            setLocalEnumsDataSource(response[0]?.data);
            setLocalEnumDefectDataSource(response[1]?.data);
            setLocalFactories(response[2]?.data?.data);
            setLocalCustomers(response[3]?.data?.data);
            setLocalSettingList(response[4]?.data?.data);
            setLocalSubFactories(response[5]?.data?.data);
            setLocalFactoriesLine(response[6]?.data?.data);
            // setLoading(false);
            dispatch(setShouldCallApi(false));
          } else {
            // setLoading(false);
          }
        }
      );
    } catch (error) {
      console.error(error);
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
      && shouldCallApi
    ) {
      callApi();
    }
    if (!online) {
      dispatch(setCurrentTab('1'));
    }
  }, []);


  useEffect(() => {
    (async () => {

      // if nothing happen
      if (signalR.id === null) return;

      // checking for item exist in db;
      const itemExist = await db?.MqcInspection.get({ Id: signalR.id })
      if (!itemExist) return;
      // check all complete steps
      const checkAllStep = Object.keys(itemExist.Status).filter(
        (key) => {
          // If PreFinal or inLine
          if (itemExist.QCType !== 'Final') {
            return !itemExist.Status[key] && key !== 'Summary'
              && key !== "PackingAndLabeling"
          };
          return !itemExist.Status[key] && key !== 'Summary';
        }
      );

      if (checkAllStep.length > 0) return;

      // set loading progress
      // dispatch(startLoading(true));
      // if server response with status 4 - successfull processing then delete item;
      if (signalR.message === "4" && signalR.type === 'Info' && itemExist.IsProcessing) {
        await updateIndexDb(signalR.id);
        dispatch(setSignalR({ id: null, sysNo: null, qcType: null, message: null, type: null, guid: null }));
        dispatch(startLoading(false));
        dispatch(setUploadingItem(null));
        dispatch(setUploadQueue(uploadQueue.filter(d => d.Id !== signalR.id)));
        enqueueSnackbar(`Phiếu Inspection ${signalR.sysNo} - ${itemExist?.IsRefinal ? 'Re-Final' : signalR.qcType} đã cập nhật thành công!`, {
          autoHideDuration: 10000,
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'center',
          },
        })
      }

      // if has error, notifi to users;
      if (signalR.type === 'Error') {
        dispatch(startLoading(false));
        dispatch(setUploadQueue(uploadQueue.filter(d => d.Id !== signalR.id)));
        dispatch(setSignalR({ id: null, sysNo: null, qcType: null, message: null, type: null, guid: null }));
        dispatch(setUploadingItem(null));
        enqueueSnackbar(`Phiếu Inspection ${signalR.sysNo} - ${signalR.qcType} cập nhật lỗi! ${signalR.message}`, {
          variant: 'error',
          autoHideDuration: 10000,
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'center',
          },
        })
      }
      // waiting for 1 section before close popup;
      await new Promise(resolve => setTimeout(resolve, 1000));
      // dispatch(startLoading(false));
    })();
  }, [signalR,]);


  // check and run upload inspection items;
  useEffect(() => {

    const startUpload = uploadQueue.length > 0;
    if (!startUpload || loading) return;
    dispatch(startLoading(true));
    const uploadItem = [...uploadQueue].sort((a, b) => Number(a.No) - Number(b.No))[0];
    // console.log('uploadItem', uploadItem);

    if (window.Worker) {
      (async () => {

        // get all images of this inspection item
        const results = await attachmentsDB.qc.where('MasterId').equals(uploadItem.Id).toArray() || [];
        const currentInspection = await db?.MqcInspection.get({ Id: uploadItem.Id });
        const refreshToken = localStorage.getItem('refreshToken');

        // merge all images into inspection detail
        await mergeDetailAttachment(currentInspection, results.filter(d => d.Data !== null), enqueueSnackbar, dispatch, startLoading).then(async mergeData => {

          // delete indexdb id;
          delete mergeData.id;

          // change status if Submit or Finish
          if (uploadItem.IsFinished) {
            currentInspection.IsFinished = true;
            mergeData.IsFinished = true;
          }

          mergeData.IsMobile = platform !== 'web';

          // set current uploading item;
          dispatch(setUploadingItem(mergeData.Id));
          // console.log(mergeData);

          // check if this item is Refinal;
          const IsRefinal = mergeData?.IsRefinal || false;

          // Send data to the web worker
          worker.postMessage(JSON.stringify(
            {
              mergeData,
              accessToken,
              enqueueSnackbar,
              HOST_API,
              Id: currentInspection.Id,
              IsRefinal,
              platform,
              refreshToken,
            })
          );

        })
      })()
    }

  }, [uploadQueue]);


  const handleChangeTab = (e, newValue) => {
    dispatch(setCurrentTab(newValue));
  };

  const handleSwipeTab = () => {
    dispatch(setCurrentTab(currentTab === "1" ? "2" : "1"));
  };

  const adaptiveBreacrumbs = online
    ? [{ name: translate('home'), href: PATH_APP.general.app }, { name: translate('qcs.inspList.pageTitle') }]
    : [{ name: translate('qcs.inspList.pageTitle'), href: PATH_APP.qc.inspection.root }];


  function renderTab() {
    if (online) {
      return [
        {
          label: 'Todo',
          value: '1',
          count: MqcInspection.length,
          color: 'info'
        },
        {
          label: 'All', value: '2',
          count: inspectionList.length,
          color: 'error'
        },
      ];
    }
    return [{ label: 'Todo', value: '1', count: MqcInspection.length, color: 'info' }];
  };

  const TABS = renderTab();


  const ANDROID_KEYBOARD = platform === 'android' ? 16 : 0;
  const IOS_KEYBOARD = platform === 'ios' ? 16 : 0;
  const cardHeight = {
    xs: `calc(100vh - ${HEADER.MOBILE_HEIGHT + BREAKCRUM_HEIGHT + SPACING + ANDROID_KEYBOARD + IOS_KEYBOARD + NOTCH_HEIGHT}px)`,
    sm: `calc(100vh - ${HEADER.MOBILE_HEIGHT + BREAKCRUM_HEIGHT + SPACING + ANDROID_KEYBOARD + IOS_KEYBOARD + NOTCH_HEIGHT}px)`,
    md: `calc(100vh - ${HEADER.MOBILE_HEIGHT + BREAKCRUM_HEIGHT + SPACING + ANDROID_KEYBOARD + IOS_KEYBOARD + NOTCH_HEIGHT}px)`,
    lg: `calc(100vh - ${HEADER.DASHBOARD_DESKTOP_HEIGHT + BREAKCRUM_HEIGHT + SPACING + ANDROID_KEYBOARD + IOS_KEYBOARD + NOTCH_HEIGHT}px)`,
  };


  return (
    <Page title={translate('qcs.inspList.pageTitle')}>
      <Container maxWidth={themeStretch ? false : 'lg'}
        sx={{
          paddingLeft: 1,
          paddingRight: 1,
          position: mdUp ? 'relative' : 'fixed'
        }}
        id="qc_ins_page_container"
      >

        <HeaderBreadcrumbs heading={translate('qcs.inspList.pageTitle')} links={adaptiveBreacrumbs} />

        <Hammer
          onSwipeLeft={handleSwipeTab}
          onSwipeRight={handleSwipeTab}
        >
          <Card id="inspection-list"
            sx={{
              minHeight: '65vh',
              height: cardHeight,
            }}
          >
            <Tabs
              allowScrollButtonsMobile
              variant="scrollable"
              scrollButtons="auto"
              id="tab-panel"
              value={currentTab}
              onChange={(e, newValue) => handleChangeTab(e, newValue)}
              sx={{ px: mdUp ? 2 : 0, bgcolor: 'background.neutral' }}
            >
              {TABS.map((tab, index) => (
                <Tab
                  key={tab.value}
                  value={tab.value}
                  disabled={tab.value === "2" && !online}
                  icon={
                    <Label color={tab.color}>
                      <span id={`tab-label-${index}`}>{tab.count}</span>
                    </Label>
                  }
                  label={
                    <Typography variant="body1" fontSize={smUp ? 14 : 12} fontWeight={'bold'}>
                      {tab.label}
                    </Typography>
                  }
                  style={{
                    minWidth: 100,
                  }}
                  sx={{
                    maxWidth: {
                      xs: '90%',
                      md: 320
                    }
                  }}
                />
              ))}
            </Tabs>

            <Divider />

            <TabPanel value={'1'} currentTab={currentTab}
            >
              <TodoList />
            </TabPanel>

            <TabPanel value={'2'} currentTab={currentTab}
            >
              <AllList />
            </TabPanel>

          </Card>
        </Hammer>

        {/* {
          loading && <UploadFileBackDrop
            loading={loading}
            progress={100}
            signalR={signalR}
            width='100%'
            height='100%'
          />
        } */}

        {/* {
          loading &&
          <UploadSnackBar
            loading={loading}
            progress={uploadProgress}
            signalR={signalR}
          />
        } */}

      </Container>
    </Page>
  );
}

// Merge data before posting to server;
export const mergeDetailAttachment = (inspection, attachements, enqueueSnackbar, dispatch, startLoading) => {
  return new Promise((resolve) => {
    // console.log(attachements);
    try {
      if (attachements.length > 0) {
        const mergeObj = {
          ...inspection,
          Inspections: inspection.Inspections.map(d => {
            return {
              ...d,
              Images: d.Images.map(v => {
                if (v.Id > 0) {
                  return v
                }
                return {
                  ...v,
                  Data: attachements.find(u => Math.abs(u.Id) === Math.abs(v.Id))?.Data || null
                }
              })
            }
          }),
          PackingAndLabelings: inspection.PackingAndLabelings.map(u => {
            return {
              ...u,
              Images: u.Images.map(v => {
                if (v.Id > 0) {
                  return v
                }
                return {
                  ...v,
                  Data: attachements.find(u => Math.abs(u.Id) === Math.abs(v.Id))?.Data || null
                }
              })
            }
          })
        }
        resolve(mergeObj);
      } else {
        resolve(inspection)
      }
    } catch (error) {
      console.error(error);
      dispatch(startLoading(false));
      enqueueSnackbar('Some images have error, please replace it with new image, then try again!',
        {
          variant: 'error',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'center',
          },
        }
      );
    }
  });
}