import { Capacitor } from '@capacitor/core';
import { useSnackbar } from 'notistack';
import { useCallback, useEffect, useRef } from 'react';
// @mui
import { Card, Container } from '@mui/material';
// devextreme
// Redux
import Page from '../../components/Page';
import { setShouldCallApi } from '../../redux/slices/qc';
import { dispatch, useSelector } from '../../redux/store';
// routes
import { HEADER, NOTCH_HEIGHT } from '../../config';
import { PATH_APP } from '../../routes/paths';
// hooks
import { db } from '../../Db';
import useIsOnline from '../../hooks/useIsOnline';
import useLocales from '../../hooks/useLocales';
import useResponsive from '../../hooks/useResponsive';
import useSettings from '../../hooks/useSettings';
// components
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import axios from '../../utils/axios';
import PlanningList from './list/Planing';

// ----------------------------------------------------------------------
const BREAKCRUM_HEIGHT = 40;
const SPACING = 24;


export default function QCPlaning() {

  // Hooks
  const { translate } = useLocales();
  const { themeStretch } = useSettings();
  const mdUp = useResponsive('up', 'md');
  const listRef = useRef(null);
  const { enqueueSnackbar } = useSnackbar();
  const { online } = useIsOnline();

  // redux
  const { shouldCallApi } = useSelector((store) => store.qc);


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
            dispatch(setShouldCallApi(false));
          }
        }
      );
    } catch (error) {
      console.error(error);
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
    if (online && shouldCallApi) {
      callApi();
    }
  }, []);


  const ANDROID_KEYBOARD = Capacitor.getPlatform() === 'android' ? 16 : 0;
  const IOS_KEYBOARD = Capacitor.getPlatform() === 'ios' ? 16 : 0;
  const CARD_HEIGHT = {
    xs: `calc(100vh - ${HEADER.MOBILE_HEIGHT + BREAKCRUM_HEIGHT + SPACING + ANDROID_KEYBOARD + IOS_KEYBOARD + NOTCH_HEIGHT}px)`,
    sm: `calc(100vh - ${HEADER.MOBILE_HEIGHT + BREAKCRUM_HEIGHT + SPACING + ANDROID_KEYBOARD + IOS_KEYBOARD + NOTCH_HEIGHT}px)`,
    md: `calc(100vh - ${HEADER.MOBILE_HEIGHT + BREAKCRUM_HEIGHT + SPACING + ANDROID_KEYBOARD + IOS_KEYBOARD + NOTCH_HEIGHT}px)`,
    lg: `calc(100vh - ${HEADER.DASHBOARD_DESKTOP_HEIGHT + BREAKCRUM_HEIGHT + SPACING + ANDROID_KEYBOARD + IOS_KEYBOARD + NOTCH_HEIGHT}px)`,
  };

  // console.log(shouldCallApi);

  return (
    <Page title={translate('qcs.planning.pageTitle')}>

      <Container maxWidth={themeStretch ? false : 'lg'}
        sx={{
          paddingLeft: 1,
          paddingRight: 1,
          position: mdUp ? 'relative' : 'fixed'
        }}>

        <HeaderBreadcrumbs
          heading={translate('qcs.planning.pageTitle')}
          links={[
            { name: translate('home'), href: PATH_APP.general.app },
            { name: translate('qcs.planning.pageTitle') },
          ]}
        />

        <Card sx={{
          paddingBottom: 1,
          minHeight: '65vh',
          height: CARD_HEIGHT,
        }}
        >

          <div>
            <PlanningList listRef={listRef} />
          </div>

        </Card>
      </Container>
    </Page>
  );
}

