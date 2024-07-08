import { LoadPanel, Position } from 'devextreme-react/load-panel';
import { useLiveQuery } from 'dexie-react-hooks';
import _ from 'lodash';
import moment from 'moment';
import { useSnackbar } from 'notistack';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// @mui
import {
  Box,
  Button,
  ButtonGroup,
  Card,
  Container,
  Divider,
  Stack,
  styled,
  Tab,
  Tabs,
  Typography,
  useTheme,
} from '@mui/material';

// devextreme
import { List, SearchEditorOptions } from 'devextreme-react/list';
// Redux
import Page from '../../components/Page';
import { getEnums, setCurrentTab, setIsViewOnly, setShouldCallApi, setSignalR } from '../../redux/slices/mqc';
import { dispatch, useSelector } from '../../redux/store';
// routes
import { attachmentsDB, mqcDB } from '../../Db';
import { PATH_APP } from '../../routes/paths';
// hooks
import useIsOnline from '../../hooks/useIsOnline';
import useLocales from '../../hooks/useLocales';
import useSettings from '../../hooks/useSettings';

// components
import FloatButton from '../../components/button/FloatButton';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import Iconify from '../../components/Iconify';
import Label from '../../components/Label';
import { handleItemSwipe } from '../../components/SwipeableItemButton';
import IconName from '../../utils/iconsName';
import AllList from './list/AllList';
// CONFIG
import { HEADER, HOST_API, NOTCH_HEIGHT } from '../../config';

// variable to responsive
const BREAKCRUM_HEIGHT = 41;
const SPACING = 24;
const ANDROID_KEYBOARD = 0;
const TAB_HEIGHT = 48;

const RootListStyle = styled(List, {
  shouldForwardProp: (prop) => true,
})(({ theme }) => {
  return {
    height: `calc(100vh - ${
      HEADER.MOBILE_HEIGHT + BREAKCRUM_HEIGHT + SPACING + ANDROID_KEYBOARD + TAB_HEIGHT + SPACING + NOTCH_HEIGHT
    }px)`,
    paddingBottom: 30,
    [theme.breakpoints.up('lg')]: {
      height: `calc(100vh - ${
        HEADER.DASHBOARD_DESKTOP_HEIGHT +
        HEADER.DASHBOARD_DESKTOP_OFFSET_HEIGHT +
        BREAKCRUM_HEIGHT +
        SPACING +
        ANDROID_KEYBOARD +
        TAB_HEIGHT +
        SPACING +
        NOTCH_HEIGHT
      }px)`,
    },
    [theme.breakpoints.between('sm', 'lg')]: {
      height: `calc(100vh - ${
        HEADER.MOBILE_HEIGHT + BREAKCRUM_HEIGHT + SPACING + ANDROID_KEYBOARD + TAB_HEIGHT + SPACING + NOTCH_HEIGHT
      }px)`,
    },
  };
});

const itemType = [
  { title: 'MAIN FABRIC', id: 20411, color: '#005BB7' },
  { title: 'LINING', id: 20414, color: '#922B21' },
];

function MQCInspectionList() {
  const [viewOpen, setViewOpen] = useState(true);
  const { online } = useIsOnline();
  const { currentTab } = useSelector((store) => store.mqc);
  const [showSelection, setShowSelection] = useState(false);
  const listRefPending = useRef(null);
  const [loading, setLoading] = useState(false);
  // hook
  const naviagte = useNavigate();
  const TodoList = useLiveQuery(() => mqcDB?.ToDo.toArray()) || [];
  const theme = useTheme();
  const { themeStretch } = useSettings();
  const { translate } = useLocales();
  const mdUp = useTheme('up', 'md');
  const smUp = useTheme('up', 'sm');
  const { enqueueSnackbar } = useSnackbar();

  // redux
  const { LoginUser } = useSelector((store) => store.workflow);
  const { shouldCallApi, signalR } = useSelector((store) => store.mqc);

  // breadcrumbs config
  const adaptiveBreacrumbs = [
    { name: translate('home'), href: PATH_APP.general.app },
    { name: translate('qcs.inspList.pageTitle') },
  ];

  const handleChangeTab = (e, newValue) => {
    dispatch(setCurrentTab(newValue));
  };

  const API_URL = `${HOST_API}/api/QIMaterialFabricApi/Get`;

  useEffect(() => {
    if (currentTab === '2') dispatch(setCurrentTab(online ? '2' : '1'));
  }, [online]);

  // tabs config
  const renderTab = () => {
    if (online) {
      return [
        { label: 'Todo', value: '1', count: TodoList.length, color: 'info' },
        {
          label: 'All',
          value: '2',
          // count: store?.totalCount() > 0 ? store?.totalCount() : 0,
          color: 'error',
        },
      ];
    }
    return [{ label: 'Todo', value: '1', count: TodoList.length, color: 'info' }];
  };

  const TABS = renderTab();

  const dataFiltered = applyFilter({
    inputData: TodoList,
    openStatus: viewOpen,
  });

  useEffect(() => {
    try {
      mqcDB.ToDo.where('isChanged').equals('false').delete();
      if (online && shouldCallApi) {
        dispatch(getEnums(enqueueSnackbar));
        dispatch(setShouldCallApi(false));
      }
    } catch (e) {
      console.log(e);
    }
  }, []);

  useEffect(() => {
    (async () => {
      const itemExist = TodoList.find((d) => d.id === signalR.id);
      if (signalR.message === '4' && signalR.type === 'Info' && itemExist) {
        setLoading(true);
        // await updateIndexDb(signalR.id);
        await mqcDB.ToDo.where('id').equals(signalR.id).delete();
        await attachmentsDB?.mqc.where('ParentId').equals(signalR.id).delete();
        dispatch(setSignalR({ id: null, sysNo: null, qcType: null, message: null, type: null }));
        enqueueSnackbar(`Phiếu Inspection ${signalR.sysNo} đã cập nhật thành công!`, {
          autoHideDuration: 10000,
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'center',
          },
        });
      }
      if (signalR.type === 'Error') {
        enqueueSnackbar(`Phiếu Inspection ${signalR.sysNo} cập nhật lỗi! ${signalR.message}`, {
          variant: 'error',
          autoHideDuration: 10000,
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'center',
          },
        });
      }
      await new Promise((resolve) => setTimeout(resolve, 3000));
      // dispatch(startLoading(false));
      setLoading(false);
    })();
  }, [signalR, TodoList]);

  const handleClickItemToDo = (data) => {
    dispatch(setIsViewOnly(false));
    naviagte(PATH_APP.mqc.detail(data?.id));
  };

  const handleClickItem = (data) => {
    dispatch(setIsViewOnly(true));
    naviagte(PATH_APP.mqc.detail(data?.Id));
  };

  const onItemSwipe = useCallback((e) => {
    if (!e.itemData.IsFinished) handleItemSwipe(e);
  }, []);

  const handleShowSelection = useCallback(() => {
    setShowSelection(!showSelection);
  }, [showSelection]);

  const itemTemplate = (data) => {
    //
    const type = itemType?.find((i) => i.id === data?.ItemTypeId);
    return (
      <Stack id={`list-item-row-${data?.id}`} sx={{ position: 'relative', padding: 0 }}>
        <Stack
          direction={'row'}
          justifyContent="space-between"
          onClick={() => handleClickItemToDo(data)}
          sx={{ position: 'relative', padding: 0 }}
        >
          <Stack direction={'column'} justifyContent={'flex-start'}>
            <Typography
              variant="caption"
              paragraph
              fontWeight={'bold'}
              mb={0}
              sx={{ wordBreak: 'break-word' }}
              display={'inline'}
              whiteSpace={'normal'}
              color={type?.color}
            >{`${type?.title || 'N/A'} - ${data?.SysNo || 'N/A'} - ${data?.AuditorName || 'N/A'}`}</Typography>
            <Typography
              variant="caption"
              paragraph
              mb={0}
              sx={{ wordBreak: 'break-word' }}
              display={'inline'}
              whiteSpace={'normal'}
            >{`Factory: ${data?.FactoryName || 'N/A'}-${data?.SubFactoryName || 'N/A'}`}</Typography>
            <Typography
              variant="caption"
              paragraph
              mb={0}
              sx={{ wordBreak: 'break-word' }}
              display={'inline'}
              whiteSpace={'normal'}
            >{`Customer: ${data?.CustomerName || 'N/A'}`}</Typography>
            <Typography
              variant="caption"
              paragraph
              mb={0}
              sx={{ wordBreak: 'break-word' }}
              display={'inline'}
              whiteSpace={'normal'}
            >{`Art-Color: ${data?.ItemCode || 'N/A'}-${data?.Color || 'N/A'}`}</Typography>
          </Stack>
          <Stack direction={'column'} justifyContent={'flex-start'}>
            {data?.AuditingResult && (
              <Label
                variant="ghost"
                color={
                  data?.AuditingResult === 'Pass' || data?.AuditingResult === 'Pass With Condition'
                    ? 'success'
                    : 'error'
                }
              >
                {data?.AuditingResult}
              </Label>
            )}
          </Stack>
        </Stack>
      </Stack>
    );
  };

  const GroupRender = (data) => {
    return (
      <Box>
        <Label color={'success'}>{data?.items?.length}</Label>
        <Typography
          variant="subtext2"
          sx={{
            paddingLeft: 1,
          }}
        >
          {data?.key}
        </Typography>
      </Box>
    );
  };

  const handleDeselectAllItems = () => {
    if (listRefPending.current) {
      listRefPending.current.instance.unselectAll();
      setShowSelection(false);
    }
  };

  const handleDeleteSelectAllItems = () => {
    const selectedItems = listRefPending.current.instance._selection.options.selectedItems;
    for (let i = 0; i < selectedItems.length; i += 1) {
      mqcDB.ToDo.where('id').equals(selectedItems[i].id).delete();
      attachmentsDB.mqc.where('ParentId').equals(selectedItems[i].id).delete();
    }
  };

  // console.log(dataFiltered);

  return (
    <Page title="MQC">
      <Container
        maxWidth={themeStretch ? false : 'lg'}
        sx={{
          paddingLeft: 1,
          paddingRight: 1,
          position: mdUp ? 'relative' : 'fixed',
        }}
      >
        <HeaderBreadcrumbs heading={translate('qcs.inspList.pageTitle')} links={adaptiveBreacrumbs} />
        <Card
          id="mqcinspection-list"
          sx={{
            minHeight: '65vh',
            height: {
              xs: `calc(100vh - ${HEADER.MOBILE_HEIGHT + BREAKCRUM_HEIGHT + SPACING + NOTCH_HEIGHT}px)`,
              sm: `calc(100vh - ${HEADER.MOBILE_HEIGHT + BREAKCRUM_HEIGHT + SPACING + NOTCH_HEIGHT}px)`,
              md: `calc(100vh - ${HEADER.DASHBOARD_DESKTOP_HEIGHT + BREAKCRUM_HEIGHT + SPACING + NOTCH_HEIGHT}px)`,
            },
          }}
        >
          <Tabs
            allowScrollButtonsMobile
            variant="scrollable"
            scrollButtons="auto"
            id="tab-panel"
            value={currentTab}
            onChange={(e, newValue) => handleChangeTab(e, newValue)}
            // sx={{ px: mdUp ? 2 : 0, bgcolor: 'background.neutral' }}
            sx={{ px: { xs: 1, md: 2 }, bgcolor: 'background.neutral' }}
          >
            {TABS.map((tab) => (
              <Tab
                // disableRipple
                key={tab.value}
                value={tab.value}
                label={
                  <Typography variant="body1" fontSize={smUp ? 14 : 12} fontWeight={'bold'}>
                    {tab.label}
                  </Typography>
                }
                style={{ minWidth: 140, maxWidth: { xs: '90%', md: 320 } }}
              />
            ))}
          </Tabs>
          <Divider />

          <div
            role="tabpanel"
            hidden={currentTab !== '1'}
            id={`full-width-tabpanel-1`}
            aria-labelledby={`full-width-tab-1`}
          >
            {showSelection ? (
              <Stack direction={'row'} justifyContent="flex-start" alignItems={'center'} spacing={2} p={1}>
                <Button height={30} startIcon={<Iconify icon={IconName.close} />} onClick={handleDeselectAllItems}>
                  <Typography variant="caption">{translate('unselectAll')}</Typography>
                </Button>
                <Button height={30} onClick={handleDeleteSelectAllItems} startIcon={<Iconify icon={IconName.delete} />}>
                  <Typography variant="caption"> {translate('deleteSelectedItem')}</Typography>
                </Button>
              </Stack>
            ) : null}
            <FloatButton
              onClick={async () => {
                dispatch(setIsViewOnly(false));
                const newValue = {
                  // Id: 107,
                  isChanged: 'false',
                  MQCTypeName: 'FABRIC',
                  AuditingResult: null,
                  SysNo: null,
                  AuditorId: LoginUser?.EmpId,
                  AuditorName: LoginUser?.EmpKnowAs,
                  FactoryId: null,
                  FactoryName: null,
                  SubFactoryId: null,
                  SubFactoryName: null,
                  PlanningLineId: null,
                  PlanningLineName: null,
                  MQCInspectionTemplateId: 28,
                  MQCInspectionTemplateSysNo: 'MIT.0819.0003',
                  ItemId: null,
                  Item: null,
                  ItemCode: null,
                  ItemName: null,
                  ItemTypeId: null,
                  UnitId: 10673,
                  SizeWidthLengthId: null,
                  ColorId: null,
                  Quantity: null,
                  ClothContentId: null,
                  CustomerId: null,
                  CustomerName: null,
                  AuditingResultId: null,
                  TotalPenaltyQuantity: null,
                  MaxPenaltyQuantity: 24,
                  RollQuantity: null,
                  Remark: null,
                  SupplierId: null,
                  SupplierName: null,
                  isFinished: false,
                  StartAuditDate: moment(new Date()).format('yyyy-MM-DD'),
                  MaterialInvoiceNo: null,
                  QIMaterialFabricLines: [],
                  Images: [],
                };
                const addId = await mqcDB?.ToDo.add(newValue);
                naviagte(PATH_APP.mqc.detail(addId));
              }}
              icon={IconName.plusCircle}
              svgIcon={
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 1024 1024">
                  <path
                    fill="currentColor"
                    d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448s448-200.6 448-448S759.4 64 512 64zm192 472c0 4.4-3.6 8-8 8H544v152c0 4.4-3.6 8-8 8h-48c-4.4 0-8-3.6-8-8V544H328c-4.4 0-8-3.6-8-8v-48c0-4.4 3.6-8 8-8h152V328c0-4.4 3.6-8 8-8h48c4.4 0 8 3.6 8 8v152h152c4.4 0 8 3.6 8 8v48z"
                  />
                </svg>
              }
            />
            <List
              dataSource={dataFiltered}
              itemRender={itemTemplate}
              // groupRender={GroupRender}
              // grouped
              {...(theme.breakpoints.only('lg') && {
                height: `calc(100vh - ${
                  HEADER.DASHBOARD_DESKTOP_HEIGHT +
                  HEADER.DASHBOARD_DESKTOP_OFFSET_HEIGHT +
                  BREAKCRUM_HEIGHT +
                  SPACING +
                  ANDROID_KEYBOARD +
                  TAB_HEIGHT +
                  SPACING +
                  NOTCH_HEIGHT +
                  (showSelection ? TAB_HEIGHT : 0)
                }px)`,
              })}
              {...(theme.breakpoints.only('md') && {
                height: `calc(100vh - ${
                  HEADER.MOBILE_HEIGHT +
                  BREAKCRUM_HEIGHT +
                  SPACING +
                  ANDROID_KEYBOARD +
                  TAB_HEIGHT +
                  SPACING +
                  NOTCH_HEIGHT +
                  (showSelection ? TAB_HEIGHT : 0)
                }px)`,
              })}
              {...(theme.breakpoints.only('xs') && {
                height: `calc(100vh - ${
                  HEADER.MOBILE_HEIGHT +
                  BREAKCRUM_HEIGHT +
                  SPACING +
                  ANDROID_KEYBOARD +
                  TAB_HEIGHT +
                  SPACING +
                  NOTCH_HEIGHT +
                  (showSelection ? TAB_HEIGHT : 0)
                }px)`,
              })}
              searchExpr={['SysNo', 'AuditorName', 'SupplierName', 'FactoryName', 'CustomerName', 'Color']}
              showSelectionControls={currentTab === '1' && showSelection}
              selectionMode="multiple"
              searchMode="contains"
              pageLoadingText={translate('loading')}
              noDataText={translate('noDataText')}
              searchEnabled
              scrollingEnabled
              collapsibleGroups
              ref={listRefPending}
              onInitialized={(e) => {
                e.component.option('selectionByClick', false);
              }}
              onItemSwipe={handleShowSelection}
            >
              <SearchEditorOptions
                placeholder={`${translate('search')} SysNo, Auditor, Supplier, Factory, Customer, Color`}
                showClearButton
              />
            </List>
          </div>

          <div
            role="tabpanel"
            hidden={currentTab !== '2'}
            id={`full-width-tabpanel-2`}
            aria-labelledby={`full-width-tab-2`}
          >
            <Box sx={{ p: 1 }}>
              <Stack
                direction={'row'}
                justifyContent="flex-end"
                alignItems={'center'}
                spacing={2}
                id="custom-button-group"
              >
                <ButtonGroup variant="contained" size="small" aria-label="outlined primary button group">
                  <Button
                    color={viewOpen ? 'primary' : 'inherit'}
                    onClick={() => {
                      if (!viewOpen) setViewOpen(!viewOpen);
                    }}
                  >
                    Open
                  </Button>
                  <Button
                    color={!viewOpen ? 'primary' : 'inherit'}
                    onClick={() => {
                      if (viewOpen) setViewOpen(!viewOpen);
                    }}
                  >
                    Finished
                  </Button>
                </ButtonGroup>
              </Stack>
            </Box>

            <AllList
              viewOpen={viewOpen}
              theme={theme}
              handleClickItem={handleClickItem}
              enqueueSnackbar={enqueueSnackbar}
              onItemSwipe={onItemSwipe}
              LoginUser={LoginUser}
              translate={translate}
              setLoading={setLoading}
            />
          </div>
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
        </Card>
      </Container>
    </Page>
  );
}

export default MQCInspectionList;

function applyFilter({ inputData, openStatus }) {
  if (inputData.length === 0) {
    return [];
  }

  const listItems = _.chain(inputData)
    .filter((item) => item?.isChanged !== 'false')
    // .groupBy((item) => item.MQCTypeName)
    .map(
      (items, key) => items
      // ({
      //   items,
      //   // key,
      // })
    )
    .value();

  return listItems;
}
