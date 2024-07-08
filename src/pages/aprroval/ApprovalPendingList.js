import { Capacitor } from '@capacitor/core';
import { LoadPanel, Position } from 'devextreme-react/load-panel';
import _ from 'lodash';
import moment from 'moment';
import { useSnackbar } from 'notistack';
import numeral from 'numeral';
import { memo, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
// @mui
import { Card, Container, Stack, Tab, Tabs, Typography, styled, useTheme } from '@mui/material';
// devextreme
import { List, SearchEditorOptions } from 'devextreme-react/list';
import fx from 'devextreme/animation/fx';

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
import Label from '../../components/Label';
import NoItemsBanner from '../../components/NoItemsBanner';
import axios from '../../utils/axios';

// ENtityList
import { HEADER, LEGALS, NOTCH_HEIGHT } from '../../config';

// ----------------------------------------------------------------------
const PAGE_TAB_KEY = 'APPROVAL_PENDING';
const BREAKCRUM_HEIGHT = 40;
const SPACING = 40;
const ANDROID_KEYBOARD = Capacitor.getPlatform() === 'android' ? 16 : 0;
const TAB_HEIGHT = 48;
const IOS_KEYBOARD = Capacitor.getPlatform() === 'ios' ? 16 : 0;

const RootStyle = styled(List, {
  shouldForwardProp: (prop) => true,
})(({ theme }) => {

  const ANDROID_KEYBOARD = Capacitor.getPlatform() === 'android' ? 16 : 0;
  const IOS_KEYBOARD = Capacitor.getPlatform() === 'ios' ? 16 : 0;

  return {
    height: `calc(100vh - ${HEADER.MOBILE_HEIGHT + BREAKCRUM_HEIGHT + SPACING + ANDROID_KEYBOARD + TAB_HEIGHT + NOTCH_HEIGHT}px)`,
    paddingBottom: 30,
    [theme.breakpoints.up('lg')]: {
      height: `calc(100vh - ${HEADER.DASHBOARD_DESKTOP_HEIGHT + HEADER.DASHBOARD_DESKTOP_OFFSET_HEIGHT + BREAKCRUM_HEIGHT + SPACING + ANDROID_KEYBOARD + IOS_KEYBOARD + NOTCH_HEIGHT + TAB_HEIGHT}px)`,
    },
    [theme.breakpoints.between('sm', 'lg')]: {
      height: `calc(100vh - ${HEADER.MOBILE_HEIGHT + BREAKCRUM_HEIGHT + SPACING + ANDROID_KEYBOARD + TAB_HEIGHT + NOTCH_HEIGHT}px)`
    },
  }
});

function ApprovePendingList() {

  // Hooks
  const { fShortenNumber } = useFormatNumber();
  const { translate } = useLocales();
  const { themeStretch } = useSettings();
  const mdUp = useResponsive('up', 'md');
  const smUp = useResponsive('up', 'sm');
  const lgUp = useResponsive('up', 'lg');
  const xsUp = useResponsive('up', 'xs');
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  // redux
  const { LoginUser } = useSelector((store) => store.workflow);

  // components state
  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [tabValue, setTabValue] = useState(null);

  // Devextreme store;
  const getLegal = () => {
    setLoading(true);
    return axios.get(`/api/FRApprovalPendingApi/Get?CurrentEmplId=${LoginUser?.EmpId}`, {
      params: {
        filter: JSON.stringify([['CurrentEmplId', '=', LoginUser?.EmpId], 'and', ['WFStep', '<>', 'Accountant']]),
        requireTotalCount: true,
        // pageSize: 5,
        group: JSON.stringify([
          {
            selector: 'Legal',
            desc: false,
            //  isExpanded: false
          },
        ]),
        groupSummary: JSON.stringify([{ selector: "Legal", summaryType: "sum" }])
      },
    });
  };

  useEffect(() => {
    getLegal()
      .then((response) => {
        // console.log(response);
        const arrayData = response.data?.data.filter((d) => d.key !== null);
        const groupItem = arrayData.map((d) => {
          const newItems = _.chain(d.items)
            .groupBy((item) => item.Type)
            .map((items, key) => ({
              items, key, groupTotal: _.sumBy(items, o => o.TotalAmount), total: _.chain(items)
                .groupBy((i) => i.Currency).map((arr, prp) => ({ total: _.sumBy(arr, o => o.TotalAmount), key: prp })).value()
            }))
            .value();
          return {
            ...d,
            items: newItems,
          };
        });
        setDataSource(groupItem);
        setTabValue(arrayData[0]?.key);
        setLoading(false);
      })
      .catch((err) => {
        // console.log(err);
        setLoading(false);
        enqueueSnackbar(JSON.stringify(err), {
          variant: 'error',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'center',
          },
        });
      });
  }, []);

  const handleChangeTab = (e, newValue) => {
    // console.log(newValue);
    setTabValue(newValue);
  };

  // RENDER LIST
  const itemTemplate = (data) => {
    return (
      <Link
        to={PATH_APP.accounting.pending.report(data.Id)}
        state={{ Guid: data?.Guid, PaymentMethod: data?.PaymentMethod }}
      >
        <Stack direction="row" justifyContent="space-between" pl={smUp ? 1 : 0}>
          <Stack direction="column" justifyContent="flex-start">
            <Typography variant="caption" paragraph color="black" fontWeight={'bold'} mb={0}>
              {data?.SysNo}
            </Typography>
            <Typography variant="caption" paragraph mb={0}>
              {`${data?.Department}`}
            </Typography>
            <Typography variant="caption" paragraph mb={0}>
              {`${data?.BPDivision === null ? '' : data?.BPDivision}`}
            </Typography>
            <Typography variant="caption" paragraph mb={0}>
              Requested by: {`${data?.Requested}`}
            </Typography>
          </Stack>
          <Stack direction="column" sx={{ width: mdUp ? 200 : 100 }} justifyContent="flex-end" alignItems={'flex-end'}>
            <Typography variant="caption" paragraph mb={0} textAlign="right" color="black" fontWeight={'bold'}>
              ID:{data.Id}
            </Typography>
            <Typography variant="caption" paragraph mb={0} textAlign="right">
              {`${data?.Currency} ${data?.TotalAmount === null ? 0 : numeral(data?.TotalAmount).format('0,0[.]00')}`}
            </Typography>
            <Typography variant="caption" paragraph mb={0} textAlign="right">
              {data.DueDate !== null ? moment(data.DueDate).format('DD MMM YYYY') : ''}
            </Typography>
            <Typography variant="caption" paragraph mb={0} textAlign="right">
              {data.ReferenceNo}
            </Typography>
          </Stack>
        </Stack>
      </Link>
    );
  };

  const generateTabs = () => {
    if (dataSource.length > 0) {
      const tabs =
        dataSource
          .map((legal, index) => ({
            ...legal,
            label: legal?.key === null ? `Others` : legal?.key,
            count: legal?.items.map((d) => d?.items).flatMap((r) => r).length || 0,
          }))
          .sort((a, b) => -b?.label.localeCompare(a?.label)) || [];
      return tabs;
    }
    return [];
  };

  const TABS = generateTabs();
  const ANDROID_KEYBOARD = Capacitor.getPlatform() === 'android' ? 16 : 0;
  const IOS_KEYBOARD = Capacitor.getPlatform() === 'ios' ? 16 : 0;
  const dataFiltered = calculateCurrencyTotal(dataSource, tabValue);

  return (
    <Page title={translate('accounting_approval')}>
      <Container maxWidth={themeStretch ? false : 'lg'} sx={{
        p: 1, pt: 0,
        //  position: mdUp ? 'relative' : 'fixed' 
      }}>
        <HeaderBreadcrumbs
          heading={translate('accounting_approval')}
          links={[{ name: translate('home'), href: PATH_APP.general.app }, { name: translate('accounting_approval') }]}
        />

        <Card sx={{
          height: {
            xs: `calc(100vh - ${HEADER.MOBILE_HEIGHT + BREAKCRUM_HEIGHT + SPACING + ANDROID_KEYBOARD + IOS_KEYBOARD + NOTCH_HEIGHT}px)`,
            sm: `calc(100vh - ${HEADER.MOBILE_HEIGHT + BREAKCRUM_HEIGHT + SPACING + ANDROID_KEYBOARD + IOS_KEYBOARD + NOTCH_HEIGHT}px)`,
            lg: `calc(100vh - ${HEADER.DASHBOARD_DESKTOP_HEIGHT + HEADER.DASHBOARD_DESKTOP_OFFSET_HEIGHT + BREAKCRUM_HEIGHT + SPACING + ANDROID_KEYBOARD + IOS_KEYBOARD + NOTCH_HEIGHT}px)`,
          },
        }}
          id="aprroval-card"
        >

          {tabValue !== null && (
            <Tabs
              allowScrollButtonsMobile
              variant="scrollable"
              scrollButtons="auto"
              id="tab-panel"
              value={tabValue}
              onChange={(e, newValue) => handleChangeTab(e, newValue)}
              sx={{
                px: 0,
                bgcolor: 'background.neutral'
              }}
            >
              {TABS.length > 0 &&
                TABS.map((tab, index) => {
                  return (
                    <Tab
                      // disableRipple
                      key={tab.label}
                      value={tab.label}
                      icon={<Label color={LEGALS[index]?.color}>{tab?.count}</Label>}
                      label={
                        <Typography variant="body1" fontSize={smUp ? 14 : 12} fontWeight={'bold'} noWrap>
                          {tab.label === null ? 'Others' : tab?.label}
                        </Typography>
                      }
                      style={{
                        minWidth: 100,
                      }}
                      sx={{
                        maxWidth: {
                          xs: '90%',
                          md: 'auto'
                        }
                      }}
                    />
                  );
                })}
            </Tabs>
          )}

          {TABS.length > 0 &&
            TABS.map((tab, index) => (
              <div
                key={`${tab.label}-${index}`}
                role="tabpanel"
                hidden={tabValue !== tab.label}
                id={`simple-tabpanel-${tabValue}-${index}`}
                aria-labelledby={`simple-tab-${tabValue}-${index}`}
                style={{ position: 'inherit', height: 'auto' }}
              >
                <RootStyle
                  dataSource={tab.items}
                  itemRender={itemTemplate}
                  searchExpr={['Type', 'SysNo', 'Id', 'Requested']}
                  grouped
                  searchEnabled
                  scrollingEnabled
                  showScrollbar={'onScroll'}
                  searchMode={'contains'}
                  noDataText={translate('noDataText')}
                  focusStateEnabled={false}
                  collapsibleGroups
                  groupRender={GroupRender}
                  onInitialized={(e) => {
                    fx.off = true;
                  }}
                  onContentReady={(e) => {
                    setTimeout(() => {
                      fx.off = false;
                    }, 2000);
                  }}
                  onGroupRendered={(e) => {
                    if (tab.items.length > 1 && !isSearching) {
                      e.component.collapseGroup(e.groupIndex);
                    }
                  }}
                // onItemClick={e => console.log(e)}
                >
                  <SearchEditorOptions
                    placeholder={`${translate('search')}  Type, SysNo, Id`}
                    showClearButton
                    onFocusIn={(e) => setIsSearching(true)}
                    onFocusOut={(e) => setIsSearching(false)}
                  />
                </RootStyle>
              </div>
            ))}

          {dataSource && dataSource.length === 0 && !loading ? <NoItemsBanner title="No pending approval" /> : null}
        </Card>

        {loading && (
          <LoadPanel
            hideOnOutsideClick
            message="Please, wait..."
            visible={loading}
            onHidden={() => setLoading(false)}
            showPane={false}
          >
            <Position my="center" at="center" of="#aprroval-card" />
          </LoadPanel>
        )}

        {dataFiltered && dataFiltered.length >= 0 &&
          <FloatingOverallTotalRender dataFiltered={dataFiltered} />
        }

      </Container>
    </Page >
  );
}

const GroupRender = (data) => {
  return (
    <Stack display={'flex'} direction='row' justifyContent={'space-between'} alignItems={'center'}>
      <Typography
        variant="subtext2"
        sx={{
          color: (theme) => theme.palette.info.main,
        }}
      >
        {`${data?.key} (${data.items.length})`}
      </Typography>
      <Typography
        variant="subtext2"
        sx={{
          color: (theme) => theme.palette.info.main,
          mr: 1,
        }}
      >
        {`${numeral(data?.groupTotal).format('0,0[.]00')}`}
      </Typography>
    </Stack>
  );
};

const FloatingOverallTotalRender = ({ dataFiltered }) => {
  const styles = {
    justifyContent: 'center',
    alignItems: 'flex-end',
  }
  const theme = {
    color: (theme) => theme.palette.info.main,
    fontWeight: 'bold',
    mr: 1,
  }
  return (
    <Stack
      sx={styles}
      className='fixed bottom-0 left-0 px-4 w-full z-[1000] bg-white drop-shadow-2xl md:px-6'
    >
      {
        dataFiltered.length > 0 && dataFiltered.map(cur => (
          <Typography
            variant="subtext2"
            key={cur.key}
            sx={theme}
          >
            {`Total ${cur.key}: ${numeral(cur.total).format('0,0[.]00')}`}
          </Typography>
        ))
      }

    </Stack>
  );
};



export default memo(ApprovePendingList);


function calculateCurrencyTotal(dataSource, tabValue) {
  if (!dataSource || dataSource.length === 0) return []
  const currentTabData = dataSource.find(d => d.key === tabValue);
  const itemsData = currentTabData.items.map(d => d.total).flatMap(r => r);
  const sumPerCurrency = _.chain(itemsData).groupBy(o => o.key).map((items, key) => ({
    key,
    total: _.sumBy(items, o => o.total)
  })).value();
  return sumPerCurrency;
}


// function onOpen() {
//   try {
//     const newData = {
//       data: {
//         columns: [{ title: 'Date time', value: '1' }, { title: 'Sheet Name', value: '2' }, { title: 'Sheet URL', value: '3' }, { title: 'Sheet Id', value: '4' }]
//       }
//     }
//     const doc = SpreadsheetApp.openById('1-6aTeGiYjctJl2vXOLa2Xm9lmYZDBBRRyApWb1JefP4')
//     const sheet = doc.getSheetByName('SheetInfo');
//     const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
//     const columnToCheck = sheet.getRange("A:A").getValues();
//     const nextRow = getLastRowSpecial(columnToCheck) + 1;
//     newData.data.columns.forEach(d => {
//       if (headers.includes(d.title)) {
//         if(d.title==='Date time'){
//           row.push(new Date())
//         }else{
//           row.push(d.value)
//         }
//       }
//     });
//     sheet.insertRows(nextRow + 1, 1);
//     sheet.getRange(nextRow, 1, 1, row.length).setValues([row]);
//     return ContentService.createTextOutput(JSON.stringify({ "status": "Gửi thành công", "content": newData, 'headers': headers, 'code': 1 })).setMimeType(ContentService.MimeType.JSON);
//   } catch (e) {
//     return ContentService.createTextOutput(JSON.stringify({
//       "code": 1, "status": "Gửi thất bại", "NewData": newData, "time": new Date(),
//     })).setMimeType(ContentService.MimeType.JSON);
//   } finally {
//     lock.releaseLock();
//   }
// }


// function getLastRowSpecial(range) {
//   var rowNum = 0;
//   var blank = false;
//   for (var row = 0; row < range.length; row++) {
//     if (range[row][0] === "" && !blank) {
//       rowNum = row;
//       blank = true;
//     } else if (range[row][0] !== "") {
//       blank = false;
//     };
//   };
//   return rowNum;

// }