import { Capacitor } from '@capacitor/core';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, LinearProgress, Stack, Typography, useTheme } from '@mui/material';
import { createStore } from 'devextreme-aspnet-data-nojquery';
import { List, SearchEditorOptions } from 'devextreme-react/list';
import DataSource from 'devextreme/data/data_source';
import _ from 'lodash';
import moment from 'moment';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Redux
import { setViewOnlyTodo } from '../../../../redux/slices/compliance';
import { setComplianceFilter, setMemoSearchValue, setMemoSelectedItemIndex } from '../../../../redux/slices/memo';
import { dispatch, useSelector } from '../../../../redux/store';
// configuration
import { HEADER, HOST_API, NOTCH_HEIGHT } from '../../../../config';
import { attachmentsDB, complianceDB } from '../../../../Db';
import { PATH_APP } from '../../../../routes/paths';
// Hooks
import useAccessToken from '../../../../hooks/useAccessToken';
import useLocales from '../../../../hooks/useLocales';
// Componets
import Label from '../../../../components/Label';
import SwipeableItemButton, { handleItemClick, handleItemSwipe } from '../../../../components/SwipeableItemButton';
// Util
import EmailDialog from '../../../../sections/compliance/audit/EmailDialog';
import PopupCollaboration from '../../../../sections/compliance/schedule/PopupCollaboration';
import axios from '../../../../utils/axios';
import { processArrayComplianceFollowUpImages, processArrayComplianceImages, processArrayComplianceReplaceImages, processArrayComplianceReportAttachment } from '../../../../utils/fetchImageToBase64';
import uuidv4 from '../../../../utils/uuidv4';
import { setTabComplianceDetail } from '../../../../redux/slices/tabs';


const API_URL = `${HOST_API}/api/ComplianceAuditMobileApi/GetList`;

const SPACING = 48;
const TAB_HEIGHT = 48;
const BUTTON_GROUP = 48;


// ----------------------------------------------------------


function ExtremeListAll({ complianceListTab }) {

  // Ref
  const listRefAll = useRef(null);
  const loadRef = useRef(null);
  const searchRef = useRef(null)

  // Hooks
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const { translate } = useLocales();
  const navigate = useNavigate();
  const platform = Capacitor.getPlatform();

  // redux
  const { complianceSearchValue, complianceFilter, complianceItemSelectedIndex } = useSelector(store => store.memo)
  const { LoginUser } = useSelector(store => store.workflow);

  // states
  const [filter, setFilter] = useState(['WFStatusName', '=', 'Open']);

  const API_URL = `${HOST_API}/api/ComplianceAuditMobileApi/GetList`;
  const accessToken = useAccessToken();

  // data Source
  const storeDataSource = useMemo(() => new DataSource({
    store: createStore({
      key: 'Id',
      loadUrl: API_URL,
      insertUrl: API_URL,
      updateUrl: API_URL,
      deleteUrl: API_URL,
      onBeforeSend: (method, ajaxOptions) => {
        const newAccessToken = localStorage.getItem('accessToken');
        ajaxOptions.headers = { Authorization: `Bearer ${newAccessToken}` };
      },
    }),
    requireTotalCount: true,
    skip: 0,
    take: 30,
    filter: complianceFilter,
    sort: [{ selector: 'AuditDateFrom', desc: true }],
    searchValue: complianceSearchValue,
    // onChanged: (e) => console.log(e),
    onLoadError: (e) => console.error(e),
  }), [complianceFilter, complianceSearchValue, accessToken]);

  // side effects
  useEffect(() => {

    if (complianceSearchValue !== "") {
      listRefAll.current.instance.option('searchValue', complianceSearchValue);
    };

    const count = listRefAll.current?.instance?._dataSource?._totalCount
    if (count >= 0) {
      document.getElementById('tab-label-1').innerHTML = count;
    }

    return () => { };

  }, [complianceFilter, complianceSearchValue, complianceItemSelectedIndex, listRefAll.current]);

  // get dataSource
  const handleSetDataSource = async () => {
    const searchValue = listRefAll.current.instance._searchEditor._changedValue;
    // console.log(loadRef.current, searchValue, listRefAll.current);
    if (loadRef.current === null) {
      const filtersArr = [
        ['CustomerName', 'contains', searchValue],
        'or',
        ['SysNo', 'contains', searchValue],
        'or',
        ['FactoryName', 'contains', searchValue],
        'or',
        ['AuditorName', 'contains', searchValue],
        'or',
        ['AuditType', 'contains', searchValue],
      ];
      if (searchValue === '' || searchValue === undefined || searchValue !== null) {
        storeDataSource.filter(null);
      } else {
        storeDataSource.filter(filtersArr);
      }
      storeDataSource?.load().then(() => {
        const count = storeDataSource?.totalCount();
        document.getElementById('tab-label-1').innerHTML = count;
        document.getElementById('compliance-list-count').innerHTML = count;
        // listRefAll.current.instance.option('dataSource', storeDataSource);
      });
      document.getElementById('button-text-mode').innerHTML = loadRef.current === null ? translate('button.viewLess') : translate('button.viewAll');
      document.getElementById('text-mode').innerHTML =
        loadRef.current === null ? 'All Compliance Audit' : 'Open Compliance Audit';
      loadRef.current = 'All';
    } else {
      const filtersArr = [
        [
          ['CustomerName', 'contains', searchValue],
          'or',
          ['SysNo', 'contains', searchValue],
          'or',
          ['FactoryName', 'contains', searchValue],
          'or',
          ['AuditorName', 'contains', searchValue],
          'or',
          ['AuditType', 'contains', searchValue],
        ],
        'AND',
        ['WFStatusName', '=', 'Open'],
      ];
      if (searchValue === '' || searchValue === undefined || searchValue !== null) {
        storeDataSource.filter(['WFStatusName', '=', 'Open']);
      } else {
        storeDataSource.filter(filtersArr);
      }
      storeDataSource.load().then((res) => {
        document.getElementById('tab-label-1').innerHTML = res.length;
        document.getElementById('compliance-list-count').innerHTML = res.length;
        // listRefAll.current.instance.option('dataSource', storeDataSource);
      });
      document.getElementById('button-text-mode').innerHTML = loadRef.current === null ? translate('button.viewLess') : translate('button.viewAll');
      document.getElementById('text-mode').innerHTML =
        loadRef.current === null ? 'All Compliance Audit' : 'Open Compliance Audit';
      loadRef.current = null;
    };
  };

  // SwipItem
  const onItemSwipe = useCallback((e) => {
    handleItemSwipe(e);
  }, []);


  const ANDROID_KEYBOARD = platform === 'android' ? 0 : 0;
  const IOS_KEYBOARD = platform === 'ios' ? 16 : 0;
  const searchExpr = useMemo(() => (['CustomerName', 'SysNo', 'FactoryName', 'AuditorName', 'AuditType', 'SubFactoryName']), []);


  return (
    <Stack>
      <Box width={'100%'} p={1} id="custom-button-group">
        <Stack direction={'row'} justifyContent="space-between" alignItems={'center'}>

          <Stack direction={'row'} spacing={1}>
            <Typography
              sx={{
                color: theme.palette.compliance.success,
              }}
              variant="body2"
              id="text-mode"
            >
              {complianceFilter !== null ? "Open Compliance Audit" : "All Compliance Audit"}
            </Typography>
          </Stack>

          <Button
            variant="none"
            sx={{
              color: theme.palette.compliance.success,
            }}
            onClick={handleSetDataSource}
          >
            <span id="button-text-mode">{complianceFilter !== null ? translate('button.viewAll') : translate('button.viewLess')}</span>
          </Button>

        </Stack>
      </Box>

      <div className="widget-container" style={{ paddingBottom: 20 }}>
        <List
          dataSource={storeDataSource}
          itemComponent={({ data, index }) => <ItemTemplate
            data={data}
            listRefAll={listRefAll}
            loadRef={loadRef}
            itemIndex={index}
            platform={platform}
            // accessToken={accessToken}
            LoginUser={LoginUser}
          />}
          className="compliance-swiable-list"
          searchExpr={searchExpr}
          {...(theme.breakpoints.only('lg') && {
            height: `calc(100vh - ${HEADER.DASHBOARD_DESKTOP_HEIGHT +
              SPACING +
              ANDROID_KEYBOARD +
              TAB_HEIGHT + BUTTON_GROUP
              }px)`,
          })}
          {...(theme.breakpoints.only('md') && {
            height: `calc(100vh - ${HEADER.MOBILE_HEIGHT + SPACING + ANDROID_KEYBOARD + TAB_HEIGHT + BUTTON_GROUP + IOS_KEYBOARD + NOTCH_HEIGHT
              }px)`,
          })}
          {...(theme.breakpoints.only('xs') && {
            height: `calc(100vh - ${HEADER.MOBILE_HEIGHT + SPACING + ANDROID_KEYBOARD + TAB_HEIGHT + BUTTON_GROUP + IOS_KEYBOARD + NOTCH_HEIGHT
              }px)`,
          })}
          searchEnabled
          scrollingEnabled
          searchMode={'contains'}
          noDataText={`${translate('noDataText')}`}
          focusStateEnabled={false}
          activeStateEnabled
          searchTimeout={1500}
          refreshingText={translate("refreshing")}
          pageLoadingText={translate("loading")}
          pageLoadMode="scrollBottom"
          showScrollbar={'onScroll'}
          selectionMode="single"
          repaintChangesOnly
          ref={(ref) => {
            listRefAll.current = ref;
          }}
          onItemSwipe={(e) => {
            onItemSwipe(e);
          }}
        // searchEditorOptions={{
        //   value: complianceSearchValue,
        // }}
        >
          <SearchEditorOptions placeholder={`${translate('search')} Customer, SysNo, Factory, Auditor`} showClearButton />
        </List>
      </div>

    </Stack>

  );
};


export default memo(ExtremeListAll);




const getTodoItem = async (todoId) => {
  const result = await complianceDB?.Todo.get({ id: todoId })
  return result
}

const getTodoImages = async (todoId) => {
  const result = await attachmentsDB?.compliance.where('ParentId').equals(todoId).toArray()
  return result
}


ItemTemplate.propTypes = {
  data: PropTypes.object,
  listRefAll: PropTypes.any,
  loadRef: PropTypes.any,
  itemIndex: PropTypes.number,
  platform: PropTypes.string,
};

// RENDER LIST FOR LIST ALL ITEMS
function ItemTemplate({ data, listRefAll, loadRef, itemIndex, platform, LoginUser }) {

  // Hooks
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const { translate } = useLocales();
  // const { accessToken } = useSelector(store => store.setting);
  const accessToken = useAccessToken();

  // Add item todo list
  const [modalExist, setModalExist] = useState({ visible: false, itemId: null });
  const [loading, setLoading] = useState(false);
  const [emailDialog, setEmailDialog] = useState({ visible: false, itemData: null });
  const [downloadProgress, setDownloadProgress] = useState({
    progress: 0,
    total: 0,
    title: "",
  });
  const [popUpCollaborate, setPopupCollaborate] = useState({
    visible: false,
    itemId: null,
  });

  // NAVIGATE TO DETAIL
  const navigateToComplianceDetail = (Id, isViewOnly = false, replace = false) => {
    navigate(PATH_APP.compliance.audit.detail(Id), {
      state: {
        isViewOnly,
      },
      replace,
    });
  }

  // CLICK TO VIEW ITEM
  const handleClickItem = async (data) => {
    handleItemClick();
    const response = await axios.get(`/api/ComplianceAuditMobileApi/GetByAuditId/${data.Id}`);
    if (response.data) {
      // console.log('/api/ComplianceAuditMobileApi/GetByAuditId', response);
      const todoItem = { ...response.data[0] };
      const IsFinished = todoItem?.AuditingResultId !== null;
      const Sections = _.chain(todoItem?.Lines)
        .groupBy((data) => data.SectionName)
        .map((Items, Section) => ({ Items, Section, IsFinished, Id: uuidv4() }))
        .value();
      const FactoryInfoLines = _.chain(todoItem?.FactoryInfoLines)
        .groupBy((data) => data.Section)
        .map((Items, Section, index) => ({ Items, Section, IsFinished, Id: uuidv4() }))
        .value();
      todoItem.Sections = Sections;
      todoItem.id = response.data[0].Id;
      todoItem.FactoryInfoLines = FactoryInfoLines;
      delete todoItem.Id;
      delete todoItem.Lines;
      dispatch(setViewOnlyTodo(todoItem));
      if (listRefAll.current.instance._searchEditor._changedValue !== "" && listRefAll.current.instance._searchEditor._changedValue !== undefined) {
        dispatch(setMemoSearchValue({ field: 'complianceSearchValue', value: listRefAll.current.instance._searchEditor._changedValue }))
        dispatch(setComplianceFilter(loadRef.current === 'All' ? null : listRefAll.current._instance._userOptions.dataSource._storeLoadOptions.filter))
        dispatch(setMemoSelectedItemIndex({
          field: 'complianceItemSelectedIndex',
          value: itemIndex
          // value: data?.Id
        }))
      };
      navigateToComplianceDetail(data.Id, true, false);
    }
  };

  // add to todo
  const handleAddtoToDoList = async () => {
    try {

      const itemExits = await getTodoItem(data.Id);
      // console.log(itemExits);
      if (itemExits !== undefined) {
        setModalExist({ visible: true, itemId: itemExits?.id });
      } else {
        setLoading(true);
        const response = await axios.get(`/api/ComplianceAuditMobileApi/GetByAuditId/${data.Id}`);
        // console.log('response getItem', response);
        if (response?.data) {

          const todoItem = { ...response?.data[0] };
          const newLines = [...todoItem?.Lines];
          const IsFinished = todoItem?.AuditingResultId !== null;
          const attachments = [...todoItem?.Attachments];
          const FactoryInfoLines = _.chain(todoItem?.FactoryInfoLines)
            .groupBy((data) => data.Section)
            .map((Items, Section, index) => ({ Items, Section, IsFinished, Id: uuidv4() }))
            .value();

          setDownloadProgress(pre => ({
            ...pre,
            total: attachments.length + todoItem.ReportAttachments.length
          }));

          const auditImages = await processArrayComplianceImages(attachments, todoItem.Id, attachmentsDB, platform, accessToken, setDownloadProgress);
          const reportAttachments = await processArrayComplianceReportAttachment(todoItem.ReportAttachments, platform, accessToken, setDownloadProgress);

          // const newSections = _.chain(newLines)
          //   .groupBy((data) => data.SectionName)
          //   .map((Items, Section, index) => {
          //     // append directly to todo list
          //     return { Items, Section, IsFinished, Id: uuidv4() };
          //   })
          //   .value();

          const newSections = _.chain(newLines)
            .groupBy((data) => data.SectionName)
            .map((Items, Section, index) => {
              // append directly to todo list
              if (Items[0]?.AuditorId !== undefined && Items[0]?.AuditorId !== null && Items[0]?.AuditorId !== "") {
                return { Items, Section, IsFinished, Id: uuidv4(), AuditorName: Items[0]?.AuditorName, AuditorId: Items[0]?.AuditorId };
              }
              return { Items, Section, IsFinished, Id: uuidv4(), AuditorName: todoItem?.AuditorName, AuditorId: todoItem?.AuditorId };
            })
            .value().filter(d => d.AuditorId === LoginUser.EmpId);

          if (newSections.length === 0) {
            dispatch(setTabComplianceDetail('3'));
          }

          todoItem.ReportAttachments = reportAttachments;
          todoItem.id = response.data[0].Id;
          todoItem.Sections = newSections;
          todoItem.FactoryInfoLines = FactoryInfoLines;
          delete todoItem.Id;
          delete todoItem.Lines;
          delete todoItem.Attachments;
          await complianceDB.Todo.add(todoItem)
            .then((res) => {
              // Add todo;
              console.log('add item to do list response', res);
              enqueueSnackbar(translate('message.addSuccess'), {
                variant: 'success',
                anchorOrigin: {
                  vertical: 'top',
                  horizontal: 'center',
                },
              });
              setLoading(false);
              navigateToComplianceDetail(data.Id, false, false)
            })
            .catch((err) => {
              console.error(err);
              enqueueSnackbar(err, {
                variant: 'error',
                anchorOrigin: {
                  vertical: 'top',
                  horizontal: 'center',
                },
              });
              setLoading(false)
            });
        }
      }
      setDownloadProgress({
        progress: 0,
        total: 0,
      })
    } catch (e) {
      console.error(e);
      enqueueSnackbar(JSON.stringify(e), {
        variant: 'error',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center',
        },
      });
      setLoading(false);
    }
  };

  // replace exist items in to do list
  const handleReplace = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/ComplianceAuditMobileApi/GetByAuditId/${data.Id}`);
      if (response.data) {
        const todoItem = { ...response.data[0] };
        const IsFinished = todoItem?.AuditingResultId !== null;
        // const Sections = _.chain(todoItem?.Lines)
        //   .groupBy((data) => data.SectionName)
        //   .map((Items, Section, index) => ({ Items, Section, IsFinished, Id: uuidv4() }))
        //   .value();

        const Sections = _.chain(todoItem?.Lines)
          .groupBy((data) => data.SectionName)
          .map((Items, Section, index) => {
            // append directly to todo list
            if (Items[0]?.AuditorId !== undefined && Items[0]?.AuditorId !== null && Items[0]?.AuditorId !== "") {
              return { Items, Section, IsFinished, Id: uuidv4(), AuditorName: Items[0]?.AuditorName, AuditorId: Items[0]?.AuditorId };
            }
            return { Items, Section, IsFinished, Id: uuidv4(), AuditorName: todoItem?.AuditorName, AuditorId: todoItem?.AuditorId };
          })
          .value().filter(d => d.AuditorId === LoginUser.EmpId);

        const FactoryInfoLines = _.chain(todoItem?.FactoryInfoLines)
          .groupBy((data) => data.Section)
          .map((Items, Section, index) => ({ Items, Section, IsFinished, Id: uuidv4() }))
          .value();
        const attachments = [...todoItem?.Attachments];
        const imagesDBList = await getTodoImages(data.Id);

        setDownloadProgress(pre => ({
          ...pre,
          total: attachments.length + todoItem.ReportAttachments.length,
          // title: "",
        }));

        const auditImages = await processArrayComplianceReplaceImages(attachments, todoItem.Id, attachmentsDB, platform, accessToken, setDownloadProgress, imagesDBList);
        const reportAttachments = await processArrayComplianceReportAttachment(todoItem.ReportAttachments, platform, accessToken, setDownloadProgress,);

        todoItem.ReportAttachments = reportAttachments;
        todoItem.Sections = Sections;
        todoItem.FactoryInfoLines = FactoryInfoLines;
        todoItem.id = response.data[0].Id;
        delete todoItem.Id;
        delete todoItem.Lines;
        delete todoItem.Attachments;
        await complianceDB.Todo.where('id')
          .equals(modalExist.itemId)
          .modify((x) => {
            x = todoItem;
          })
          .then((res) => {
            console.log('replace item to do list response', res);
            enqueueSnackbar(translate('message.replaceSuccess'), {
              variant: 'success',
              anchorOrigin: {
                vertical: 'top',
                horizontal: 'center',
              },
            });
            navigateToComplianceDetail(data.Id, false, true)
          });

        setLoading(false);
        setDownloadProgress({
          progress: 0,
          total: 0,
          title: "",
        })
      }
    } catch (e) {
      console.error(e);
      setLoading(false);
      setDownloadProgress({
        progress: 0,
        total: 0,
        title: "",
      })
      enqueueSnackbar(JSON.stringify(e), {
        variant: 'error',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center',
        },
      });
    }
  };

  // CREATE FOLLOW UP REQUEST
  const handleFollowup = async () => {
    try {

      // const itemExits = TodoList.find((d) => d.id === data.Id);
      const itemExits = await getTodoItem(data.Id);
      if (itemExits) {
        return enqueueSnackbar(translate('Item exist!'), {
          variant: 'info',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'center',
          },
        });
      };

      setLoading(true);
      const response = await axios.get(`/api/ComplianceAuditMobileApi/GetByAuditId/${data.Id}`);
      // console.log('/api/ComplianceAuditMobileApi/GetByAuditId/', response.data);

      if (response.data) {
        const todoItem = JSON.parse(JSON.stringify(response.data[0]));
        const newLines = [...todoItem?.Lines].filter(d => d?.DetailedFinding !== null && d?.DetailedFinding !== "") || [];
        if (newLines.length === 0) {
          setLoading(false);
          return enqueueSnackbar(translate('This item has nothing to follow up!'), {
            variant: 'info',
            anchorOrigin: {
              vertical: 'top',
              horizontal: 'center',
            },
          });
        }

        // when clone the item change Line Guid and attachment RecordGuid, Action===Insert to match with parent;
        const newLineGuidList = [...newLines].map(d => d.Guid);
        const attachments = [...todoItem?.Attachments].filter(d => newLineGuidList.includes(d.RecordGuid));
        let changeAttachments = [];
        let changeNewLines = [];

        setDownloadProgress(pre => ({
          ...pre,
          total: attachments.length + todoItem.ReportAttachments.length,
          title: "Generating compliance follow up...",
        }))

        const imagesDBList = await getTodoImages(data.Id);

        newLines.forEach(line => {

          const newGuid = uuidv4();
          changeNewLines = [...changeNewLines, {
            ...line,
            Guid: newGuid
          }];

          if (attachments.length > 0) {
            const lineAttachment = attachments.filter(att => att.RecordGuid === line.Guid);
            if (lineAttachment.length >= 0) {
              const newLineAttachment = lineAttachment.map(v => ({ ...v, RecordGuid: newGuid, Action: 'Insert' }));
              changeAttachments = [...changeAttachments, ...newLineAttachment];
            }
          };
        });

        const IsFinished = todoItem?.AuditingResultId !== null;

        // const Sections = _.chain(changeNewLines)
        //   .groupBy((data) => data.SectionName)
        //   .map((Items, Section,) => ({
        //     Items, Section, IsFinished, Id: uuidv4()
        //   }))
        //   .value();

        const Sections = _.chain(changeNewLines)
          .groupBy((data) => data.SectionName)
          .map((Items, Section, index) => {
            // append directly to todo list
            if (Items[0]?.AuditorId !== undefined && Items[0]?.AuditorId !== null && Items[0]?.AuditorId !== "") {
              return { Items, Section, IsFinished, Id: uuidv4(), AuditorName: Items[0]?.AuditorName, AuditorId: Items[0]?.AuditorId };
            }
            return { Items, Section, IsFinished, Id: uuidv4(), AuditorName: LoginUser?.EmpKnowAs, AuditorId: LoginUser?.EmpId };
          })
          .value()
        // .filter(d => d.AuditorId === LoginUser.EmpId);

        const FactoryInfoLines = _.chain(todoItem?.FactoryInfoLines)
          .groupBy((data) => data.Section)
          .map((Items, Section, index) => ({ Items, Section, IsFinished, Id: uuidv4() }))
          .value();

        const auditImages = await processArrayComplianceFollowUpImages(changeAttachments, todoItem.Id, attachmentsDB, platform, accessToken, setDownloadProgress, imagesDBList);
        const reportAttachments = await processArrayComplianceReportAttachment(todoItem.ReportAttachments, platform, accessToken, setDownloadProgress);

        todoItem.ReportAttachments = reportAttachments;
        todoItem.FactoryInfoLines = FactoryInfoLines;
        todoItem.Sections = [...Sections];
        todoItem.id = response.data[0].Id;
        todoItem.AuditTime = "FOLLOW-UP";
        todoItem.AuditTimeId = 11742;
        todoItem.AuditorId = LoginUser?.EmpId || "";
        todoItem.AuditorName = LoginUser?.EmpKnowAs || "";

        delete todoItem.Id;
        delete todoItem.Lines;
        delete todoItem.Attachments;

        await complianceDB.Todo.add(todoItem)
          .then(async (res) => {
            enqueueSnackbar(translate('message.addSuccess'), {
              variant: 'success',
              anchorOrigin: {
                vertical: 'top',
                horizontal: 'center',
              },
            });
            setLoading(false);
            navigateToComplianceDetail(response.data[0].Id, false, false);
          })
          .catch((err) => {

            console.error(err);

            enqueueSnackbar(err, {
              variant: 'error',
              anchorOrigin: {
                vertical: 'top',
                horizontal: 'center',
              },
            });
            setLoading(false);

          });

        setLoading(false);
        setDownloadProgress({
          progress: 0,
          total: 0,
          title: "",
        })

      }
    } catch (e) {
      console.error(e);
      setLoading(false);
      setDownloadProgress({
        progress: 0,
        total: 0,
        title: "",
      })
      enqueueSnackbar(JSON.stringify(e), {
        variant: 'error',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center',
        },
      });
    }
  };


  const handleOpenEmailDialog = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/ComplianceAuditMobileApi/GetByAuditId/${data.Id}`);
      console.log('handleOpenEmailDialog response getItem by Id', response);
      const itemData = { ...response.data[0] };

      setDownloadProgress(pre => ({
        ...pre,
        total: itemData.ReportAttachments.length,
        title: "Generating compliance send mail...",
      }));
      const reportAttachments = await processArrayComplianceReportAttachment(itemData.ReportAttachments, platform, accessToken, setDownloadProgress);
      const modalItem = {
        ...itemData, ReportAttachments: reportAttachments
      }
      setEmailDialog({
        visible: true, itemData: modalItem
      });

      setLoading(false)
      setDownloadProgress({
        progress: 0,
        total: 0,
        title: "",
      })
    } catch (e) {
      setLoading(false)
      setDownloadProgress({
        progress: 0,
        total: 0,
        title: "",
      })
      console.error(e);
      enqueueSnackbar(JSON.stringify(e), {
        variant: 'error',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center',
        },
      });
    }
  }, []);

  // OPEN COLLABORATOR MODALS
  const handleOpenCollaborator = async () => {
    setPopupCollaborate({ visible: true, itemId: data.Id })
  };


  // HIDE COLLABORATOR MODALS
  const hidePopup = () => {
    setPopupCollaborate({ visible: false, itemId: null })
  }

  // CREATE BUTTON GROUPS
  const buttons = [
    {
      text: 'Add to Todo',
      color: theme.palette.compliance.success,
      action: () => handleAddtoToDoList(),
      disabled: data.WFStatusName !== 'Open' || loading,
      visible: data.WFStatusName === 'Open',
    },
    {
      text: 'Follow up',
      color: theme.palette.compliance.success,
      action: () => handleFollowup(),
      disabled: loading || data.WFStatusName !== 'Approved' || (data?.AuditingResult === 'Pass' && data.WFStatusName === 'Approved'),
      visible: data.WFStatusName !== 'Open',
    },
    {
      text: 'Send Email',
      color: theme.palette.warning.main,
      action: () => handleOpenEmailDialog(),
      disabled: loading || data.WFStatusName !== 'Approved',
      visible: data.WFStatusName === 'Approved',
      // visible: true,
    },
    {
      text: 'Config Collaborator',
      color: theme.palette.warning.main,
      action: () => handleOpenCollaborator(),
      disabled: loading,
      visible: data.WFStatusName === 'Open',
    },
  ].filter(d => d.visible);


  return (
    <Stack
      direction="row"
      justifyContent="center"
      alignItems={'center'}
      id={`list-item-row-${data?.Id}`}
      sx={{ position: 'relative', padding: 0 }}
      key={data.Id}
      position={'relative'}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        width="100%"
        onClick={() => {
          handleClickItem(data);
        }}
        p={1}
      >
        <Stack direction="column" justifyContent="flex-start">
          <Typography
            variant="caption"
            paragraph
            sx={{ color: (theme) => theme.palette.error.dark }}
            fontWeight={'bold'}
            mb={0}
          >
            {`${data?.SysNo} - ${data?.AuditType}`}
          </Typography>
          <Typography variant="caption" paragraph mb={0} sx={{ wordBreak: 'break-word' }} whiteSpace="normal">
            {/* {`Factory: ${data?.FactoryName} - Subfactory: ${data?.SubFactoryName || "N/A"}`} */}
            Factory: {`${data?.SubFactoryName || data?.FactoryName || "N/A"}`}
          </Typography>
          <Typography variant="caption" paragraph mb={0}>
            {`Customer: ${data?.CustomerName || ''}`}
          </Typography>
          <Typography variant="caption" paragraph mb={0} whiteSpace="normal">
            {`Remark: ${data?.Remark || ''}`}
          </Typography>
        </Stack>
        <Stack direction="column" justifyContent="flex-end" alignItems={'flex-end'}>
          <Stack direction={'row'} spacing={1}>
            {data.AuditingResult !== null && (
              <Label
                variant="ghost"
                color={
                  data.AuditingResult === 'Pass' || data.AuditingResult === 'Pass With Condition' ? 'success' : 'error'
                }
              >
                {data.AuditingResult}
              </Label>
            )}
            <Label
              variant="ghost"
              color={getWFStatusColor(data.WFStatusName)}
            >
              {data?.WFStatusName}
            </Label>
          </Stack>
          <Typography variant="caption" paragraph fontWeight={'bold'} mb={0} mt={1}>
            {`Audit From: ${moment(data?.AuditDateFrom).format('DD/MM/YYYY')}`}
          </Typography>
          <Typography variant="caption" paragraph fontWeight={'bold'} mb={0} mt={1}>
            {`Auditor: ${data?.AuditorName}`}
          </Typography>
        </Stack>
      </Stack>

      <SwipeableItemButton
        id={`button-list-button-${data?.Id}`}
        buttons={buttons}
        variant="subtext2"
        textColor="white"
        width={90}
      />

      {modalExist.visible && (
        <ModalExist modalExist={modalExist} setModalExist={setModalExist} handleReplace={handleReplace} />
      )}

      {loading && <DialogProgressing
        loading={loading}
        setDownloadProgress={setDownloadProgress}
        downloadProgress={downloadProgress}
      />}

      {emailDialog.visible &&
        <EmailDialog emailDialog={emailDialog}
          setEmailDialog={setEmailDialog}
        />
      }

      {popUpCollaborate.visible &&
        <PopupCollaboration
          visible={popUpCollaborate.visible}
          onClose={hidePopup}
          popUpCollaborate={popUpCollaborate}
        />
      }

    </Stack>
  );
};

function ModalExist({ modalExist, setModalExist, handleReplace }) {

  ModalExist.propTypes = {
    modalExist: PropTypes.object,
    setModalExist: PropTypes.func,
    handleReplace: PropTypes.func,
  };

  const { translate } = useLocales()

  const handleClose = useCallback(() => {
    setModalExist({ visible: false, itemId: null });
  }, []);

  const handleReplaceAndClose = useCallback(() => {
    handleReplace();
    handleClose();
  }, []);

  return (
    <Dialog open={modalExist.visible} fullWidth onClose={handleClose} aria-labelledby="confirmed-popup">
      <DialogTitle mb={3}>Item exist</DialogTitle>
      <DialogContent>
        <DialogContentText>{translate('confirm.itemExist')}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="info">
          {translate('button.cancel')}
        </Button>
        <Button onClick={handleReplaceAndClose} color="success">
          {translate('button.replace')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};


function getWFStatusColor<T>(status: T): T {
  // console.log(status)
  let color = ''
  switch (status) {
    case 'Open':
      color = 'warning'
      break;
    case 'Approved':
      color = 'success'
      break;
    default:
      color = 'info'
  }
  return color;
};


DialogProgressing.propTypes = {
  loading: PropTypes.bool,
  setDownloadProgress: PropTypes.func,
  downloadProgress: PropTypes.object,
};

function DialogProgressing({ loading, setDownloadProgress, downloadProgress }) {

  const progressNum = Math.round(downloadProgress.progress / downloadProgress.total * 100) || 0;

  useEffect(() => {
    return () => {
      setDownloadProgress({
        progress: 0,
        total: 0,
        title: '',
      });
    };
  }, []);

  const descriptionText = downloadProgress.title !== "" && downloadProgress.title !== undefined && downloadProgress.title !== null ? downloadProgress.title : "Generating compliance audit..."

  return (
    <Dialog open={loading}
      fullWidth
      onClose={() => { }} aria-labelledby="confirmed-popup">
      <DialogTitle mb={3}>Processing data...</DialogTitle>
      <DialogContent sx={{
        width: '100%',
      }}>
        <Stack
          direction={'row'}
          p={2}
          justifyContent={'center'}
          alignItems={'center'}
          width={'100%'}
          height={'100%'}
        >
          <Box sx={{ width: '100%', mr: 1 }}>
            <LinearProgress variant="determinate" value={progressNum} color='primary' />
          </Box>
          <Box sx={{ minWidth: 35 }}>
            <Typography variant="body2" color="primary.main">{`${progressNum}%`}</Typography>
          </Box>
        </Stack>
        <DialogContentText>{descriptionText}</DialogContentText>
      </DialogContent>
    </Dialog>
  );
};