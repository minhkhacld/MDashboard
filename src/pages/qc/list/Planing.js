import { Capacitor } from '@capacitor/core';
import { Box, Button, Checkbox, Dialog, DialogContent, DialogContentText, DialogTitle, Divider, FormControl, FormControlLabel, LinearProgress, Stack, Typography, useTheme } from '@mui/material';
import { createStore } from 'devextreme-aspnet-data-nojquery';
import { Popup } from 'devextreme-react';
import { List, SearchEditorOptions } from 'devextreme-react/list';
import DataSource from 'devextreme/data/data_source';
import moment from 'moment';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// hooks
import useAccessToken from '../../../hooks/useAccessToken';
import useLocales from '../../../hooks/useLocales';
import useResponsive from '../../../hooks/useResponsive';
// config
import { FAILED_IMAGE_SRC, HEADER, HOST_API, PASSED_IMAGE_SRC } from '../../../config';
import { db } from '../../../Db';
import { PATH_APP } from '../../../routes/paths';
// axios
import axios from '../../../utils/axios';
// components
import Image from '../../../components/Image';
import MuiDialogCustomRef from '../../../components/MuiDialogCustomRef';
import NoItemsBanner from '../../../components/NoItemsBanner';
import FilterPanel from '../../../sections/qc/FilterPanel';
// util
import Iconify from '../../../components/Iconify';
import IconName from '../../../utils/iconsName';
// redux
import { useSelector } from '../../../redux/store';

// -------------------------------------------

const BREAKCRUM_HEIGHT = 78;
const SPACING = 100;

PlanningList.propTypes = {
  listRef: PropTypes.any,
};

const popupAnimationConfig = {
  show: {
    type: 'fade',
    duration: 400,
    from: 0,
    to: 1
  },
  hide: {
    type: 'fade',
    duration: 400,
    from: 1,
    to: 0
  }
};

const label = { inputProps: { 'aria-label': 'Checkbox Is Improved', } };

// -------------------------------------------

function PlanningList({ listRef, }) {

  // ref


  // hooks
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const { translate } = useLocales()
  const navigate = useNavigate();

  // state
  const [showSelection, setShowSelection] = useState(true);
  const [filter, setFilter] = useState(null);
  const [showIntro, setShowIntro] = useState(false);

  const ANDROID_KEYBOARD = Capacitor.getPlatform() === 'android' ? 16 : 0
  const accessToken = useAccessToken();
  const API_URL = `${HOST_API}/api/QCMobileApi/GetPlanningList`;

  const storeDataSource = useMemo(() =>
    new DataSource({
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
        errorHandler: (err) => {
          enqueueSnackbar(JSON.stringify(err), {
            variant: 'error'
          })
        },
      }),
      requireTotalCount: true,
      skip: 0,
      take: 30,
      sort: [
        { selector: 'CreatedDate', desc: true },
        { selector: 'CustomerName', desc: false },
      ],
    })
    , [accessToken]);

  // ROMOVE SELECTED ITEMS
  const handleDeselectAllItems = () => {
    listRef.current.instance.unselectAll();
    // setShowSelection(false);
  };

  // CREATE INSPECTION BASE ON SELECTED PLANING ID
  const handleCreateInspection = async (setSending) => {
    try {
      const newselected = listRef.current.instance._selection.options.selectedItems;
      if (newselected.length === 0) {
        return enqueueSnackbar(translate('message.notSelectedItemWarning'), {
          variant: 'error',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'center',
          },
        });
      };

      setSending(true);
      let isValid = true;
      // Check if items have the same info: "Customer - QC Type - Style No"
      if (newselected.length > 1) {
        // const checkLastpart = newselected.slice(1, newselected.length - 1);
        const check = newselected.every((item) => {
          return (
            item.CustomerName === newselected[0].CustomerName &&
            item.ItemCode === newselected[0].ItemCode &&
            item.QCType === newselected[0].QCType
          );
        });
        isValid = check;
      }

      if (isValid) {
        const planingSelectedIds = newselected.map((d) => d.Id);
        const formData = new FormData();
        formData.append('values', JSON.stringify(planingSelectedIds));
        await axios.post(`/api/QCMobileApi/CreateQCInspection`, formData).then((response) => {
          console.log('Create QC Inspection result', response.data);
          // ADD TO TODO
          handleAddToPendingList(response.data.Id, setSending);
          // if (response.data) {
          //   handleDeselectAllItems();
          //   setSending(false);
          //   enqueueSnackbar(translate('message.createSuccess'), {
          //     variant: 'success',
          //     anchorOrigin: {
          //       vertical: 'top',
          //       horizontal: 'center',
          //     },
          //   });
          // }
        });
      } else {
        console.log('invalid');
        setSending(false);
        enqueueSnackbar(translate('message.createQCInspectionError'), {
          variant: 'error',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'center',
          },
        });
      }
    } catch (err) {
      setSending(false);
      console.error(err);
      enqueueSnackbar(translate('message.createError'), {
        variant: 'error',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center',
        },
      });
    }
  };

  // ADD TO TODO LIST
  const handleAddToPendingList = async (Id, setSending) => {
    try {

      const getInspection = await axios
        .get(`/api/QCMobileApi/GetInspectionById/${Id}`);
      // console.log(`/api/QCMobileApi/GetInspectionById/${Id}`, getInspection);
      const checkItemExist = await db.MqcInspection.get({ Id: getInspection.data.data[0].Id });
      // console.log('checkItemExist', checkItemExist);
      if (checkItemExist === undefined) {
        await db.MqcInspection.add(getInspection.data.data[0]);
      };
      navigate(PATH_APP.qc.inspection.detail(getInspection.data.data[0].Id));
      enqueueSnackbar(translate(checkItemExist === undefined ? 'message.createSuccess' : 'message.inspectionExist'), {
        variant: 'success',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center',
        },
        autoHideDuration: 5000,
      });

      setSending(false);

    } catch (e) {
      console.error(e);
      setSending(false);
      enqueueSnackbar(translate('message.addError'), {
        variant: 'error',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center',
        },
      });
    }
  };

  // GET DATA SOURCE AND REFRESH LIST
  const callApi = async (values) => {
    try {

      const fieldContainValues = Object.keys(values).filter((key) => values[key] !== '' && values[key] !== null && values[key] !== undefined);

      if (fieldContainValues.length === 0) {
        storeDataSource.filter(null);
        storeDataSource.on('changed', () => {
          document.getElementById('total_count').innerHTML = `${translate('total')}: ${storeDataSource.totalCount() || 0} ${translate('results')}`;
        });
        setFilter(null);
        return;
      };

      let filterObj = [];
      fieldContainValues.forEach((key, index) => {
        /* eslint-disable */
        if (key === 'CustomerPO') {
          const arrayValues = values['CustomerPO'].split(',');
          let result = [];
          arrayValues.forEach((d, index) => {
            if (index < arrayValues.length - 1) {
              result = [...result, [`CustomerPO`, 'contains', d.trim()], 'OR'];
            } else {
              result = [...result, [`CustomerPO`, 'contains', d.trim()]];
            }
          });
          filterObj = [...filterObj, result];
        } else if (key === 'FactoryName' || key === 'CustomerName' || key === 'QcType' || key === 'SubFactoryName') {
          if (index < fieldContainValues.length - 1) {
            filterObj = [...filterObj, [`${key}`, '=', values[key]], 'AND'];
          } else {
            filterObj = [...filterObj, [`${key}`, '=', values[key]]];
          }
        } else {
          if (index < fieldContainValues.length - 1) {
            filterObj = [...filterObj, [`${key}`, 'contains', values[key]], 'AND'];
          } else {
            filterObj = [...filterObj, [`${key}`, 'contains', values[key]]];
          }
        }
      });

      // storeDataSource.load().then((res) => {
      //   // console.log(res);
      //   document.getElementById('total_count').innerHTML = `${translate('total')}: ${storeDataSource.totalCount() || 0} ${translate('results')}`;
      //   // listRef.current.instance.option('dataSource', res);
      //   // if (fieldContainValues.length === 0) {
      //   //   storeDataSource.filter(null);
      //   // }
      //   storeDataSource.filter(null);
      // });

      // if filter value same with previous filter data;
      if (filter !== null && _.isEqual(filter, filterObj)) {
        console.log('same values filter')
        return
      };

      setFilter(filterObj);
      storeDataSource.filter(filterObj);
      storeDataSource.on('changed', (e) => {
        document.getElementById('total_count').innerHTML = `${translate('total')}: ${storeDataSource.totalCount() || 0} ${translate('results')}`;
        // storeDataSource.filter(null);
      })

    } catch (error) {
      console.error(error);
      enqueueSnackbar('Network error! Can not connect to server', {
        variant: 'error',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center',
        },
      });
    }
  };

  const handleCloseSelection = useCallback(() => {
    setShowSelection(!showSelection);
    handleDeselectAllItems();
  }, []);

  const onInitialized = (e) => {
    e.component.option('selectionByClick', false);
  }

  const handleClick = (e) => {
    handleDeselectAllItems();
  };

  const handleExit = () => {
    setShowIntro(false)
  };

  const searchExpr = [
    'SysNo',
    'CustomerName',
    'QCType',
    'ProductName',
    'FactoryName',
    'ItemCode',
    'AssignToEmpKnowAs',
    'SubFactoryName',
    'CustomerPO',
  ];

  return (
    <Box>
      <FilterPanel setDataSource={callApi} storeDataSource={storeDataSource} setShowIntro={setShowIntro} />
      <Stack direction={'row'} justifyContent="flex-start" alignItems={'center'} spacing={2} mb={1}>
        {showSelection && (
          <RenderButton
            handleDeselectAllItems={handleDeselectAllItems}
            handleCreateInspection={handleCreateInspection}
            translate={translate}
          />
        )}
      </Stack>
      <List
        dataSource={storeDataSource}
        itemComponent={ItemTemplate}
        searchExpr={searchExpr}
        {...theme.breakpoints.only('lg') && { height: `calc(100vh - ${HEADER.DASHBOARD_DESKTOP_HEIGHT + BREAKCRUM_HEIGHT + SPACING + ANDROID_KEYBOARD}px)` }}
        {...theme.breakpoints.only('md') && { height: `calc(100vh - ${HEADER.MOBILE_HEIGHT + BREAKCRUM_HEIGHT + SPACING + ANDROID_KEYBOARD}px)` }}
        {...theme.breakpoints.only('xs') && { height: `calc(100vh - ${HEADER.MOBILE_HEIGHT + BREAKCRUM_HEIGHT + SPACING + ANDROID_KEYBOARD}px)` }}
        searchEnabled
        scrollingEnabled
        searchMode={'contains'}
        noDataText={`${translate('noDataText')}. Use filter panel to retrive new data`}
        focusStateEnabled
        activeStateEnabled
        showSelectionControls={showSelection}
        searchTimeout={1000}
        indicateLoading
        refreshingText={translate("refreshing")}
        pageLoadingText={translate("loading")}
        pageLoadMode="scrollBottom"
        selectionMode="multiple"
        selectAllMode="allPages"
        showScrollbar={'onScroll'}
        ref={listRef}
        onInitialized={onInitialized}
      >
        <SearchEditorOptions
          placeholder={`${translate('search')} Sys No, Customer, Factory, StyleNo, Auditor...`}
          showClearButton
        />
      </List>

    </Box>
  );
};



export default memo(PlanningList);



// RENDER ITEM FORM PLANING LIST
function ItemTemplate({ data, index }) {

  const theme = useTheme()

  const [open, setOpen] = useState({
    visible: false,
    item: null,
  });

  const handleSetItem = (item) => {
    setOpen({
      visible: true,
      item,
    });
  };

  return (
    <Stack id={`planing-list-item-${index}`}>
      <Stack >
        <Stack direction="row" justifyContent="space-between" onClick={() => handleSetItem(data)}>
          <Stack direction="column" justifyContent="flex-start">
            <Typography variant="caption" paragraph color={theme.palette.error.dark} fontWeight={'bold'} mb={0}>
              {data?.SysNo} - {data?.QCType}
            </Typography>
            <Typography variant="caption" paragraph mb={0}>
              {`${data?.CustomerName}`}
            </Typography>
            <Typography variant="caption" paragraph mb={0} sx={{ wordBreak: 'break-word' }} whiteSpace="normal">
              {`${data?.FactoryName}`} - {data?.SubFactoryName}
            </Typography>
            <Typography variant="caption" paragraph mb={0} sx={{ wordBreak: 'break-word' }} whiteSpace="normal">
              {`${data?.ItemCode}`} - {data?.ProductColorChartArtName} - {data?.ProductName}
            </Typography>
            <Typography variant="caption" paragraph mb={0}>
              Auditor: {`${data?.AssignToEmpKnowAs}`}
            </Typography>
            <Typography variant="caption" paragraph mb={0}>
              PO: {`${data?.CustomerPO}`} - QTY: {data?.Quantity}
            </Typography>
          </Stack>
          <Stack direction="column" justifyContent="flex-end">
            <Typography variant="caption" paragraph fontWeight={'bold'} mb={0} mt={1}>
              {`Date: ${moment(data?.CreatedDate).format('DD/MM/YYYY')}`}
            </Typography>
          </Stack>
        </Stack>
      </Stack>

      {open.visible ? (
        <PopupDetail
          popupDetail={open}
          setPopupDetail={setOpen}
        />
      ) : null}
    </Stack>
  );
};

// --------------------------------------------------------------------------------------------------------
// POPUP SHOW INSPECTION LIST
function PopupDetail({ popupDetail, setPopupDetail, }) {

  // refs
  const dialogRef = useRef(null);

  const [inspectionList, setInspectionList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState({
    present: 0,
    total: 0,
  });
  const [slectedRow, setSelectedRow] = useState({
    Id: null,
    IsImproved: false,
  });

  const theme = useTheme();
  const platform = Capacitor.getPlatform();
  const navigate = useNavigate();
  const mdUp = useResponsive('up', 'md');
  const smUp = useResponsive('up', 'sm');
  const { translate } = useLocales();
  const { enqueueSnackbar } = useSnackbar()
  const { LoginUser } = useSelector((store) => store.workflow);
  const { minId } = useSelector(store => store.qc);

  const onClose = () => {
    setPopupDetail({ visible: false, item: null });
  };

  // get list QC Inspection by Selected QC Planning
  useEffect(() => {
    setIsLoading(true);
    axios
      .get(`/api/QCMobileApi/GetInspectionListByPlanningLineId/${popupDetail?.item?.Id}`, {
        params: {
          group: JSON.stringify([{ selector: 'AuditingResult', desc: true }]),
          sort: JSON.stringify([{ selector: 'AuditingResult', desc: true }]),
        },
      })
      .then((response) => {
        // console.log('getQC Inspection list by inspection planning id', response.data);
        const newData = response?.data?.data;
        if (newData.length > 0) {
          const result = newData.map((d) => {
            return {
              ...d,
              items: d.items.reverse(),
            };
          });
          setInspectionList(result || []);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        setIsLoading(false);
        console.error(err);
        enqueueSnackbar('Create inspection error', {
          variant: 'error',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'center',
          },
        });
      });
  }, [popupDetail.item?.Id]);

  // HANDLE NAVIGATE TO INSPECTION DETAILS
  const handleNavigate = async (row) => {
    await axios
      .get(`/api/QCMobileApi/GetInspectionById/${row.itemData.Id}`)
      .then((res) => {
        // console.log(res);
        if (res.data.data.length > 0) {
          navigate(PATH_APP.qc.inspection.detail(row.itemData.Id), {
            state: { item: res.data.data[0] || {}, isViewOnly: true },
          });
        }
        // window.open(PATH_APP.qc.inspection.detail(row.itemData.Id));
      })
      .catch((err) => {
        console.error(err);
        enqueueSnackbar('Create inspection error', {
          variant: 'error',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'center',
          },
        });
      });
  };


  const handleShowDialog = (data) => {
    try {
      dialogRef.current.show(data);
      setSelectedRow({
        ...data,
        IsImproved: data.IsImproved === null ? true : !data.IsImproved,
      })
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmitDialog = async () => {
    try {
      const response = await axios.post(`/api/QCMobileApi/SetIsImproved/${slectedRow.Id}/${slectedRow.IsImproved}`);
      setInspectionList(inspectionList.map(d => {
        return {
          ...d,
          items: d.items.map(v => {
            if (v.Id === slectedRow.Id) {
              return {
                ...v,
                IsImproved: slectedRow.IsImproved,
              }
            }
            return v
          })
        }
      }));
      dialogRef.current.hide();
    } catch (error) {
      console.error(error);
      enqueueSnackbar(error.message, { variant: 'error' });
    }
  };

  const handleCancelDialog = () => {
    dialogRef.current.hide();
  };


  return (
    <Popup
      visible={popupDetail.visible}
      onHiding={onClose}
      dragEnabled={false}
      hideOnOutsideClick={false}
      closeOnOutsideClick={false}
      showCloseButton
      showTitle
      title="QC Inspection"
      width={mdUp ? 700 : '100%'}
      height={mdUp ? '90%' : '100%'}
      className="popup-qc-planning"
      animation={popupAnimationConfig}
    >
      <Stack p={1} sx={{ minHeight: 700 }}>
        <SummaryItem popupDetail={popupDetail} theme={theme} />
        <Divider sx={{ mt: 1, mb: 1 }} />
        {inspectionList.length > 0 ? (
          <List
            dataSource={inspectionList}
            // itemRender={itemTemplate}
            itemComponent={({ data, index }) => <InspectionListComponent data={data} index={index} theme={theme} handleShowDialog={handleShowDialog} />}
            height={smUp ? '70vh' : '72vh'}
            searchEnabled={false}
            scrollingEnabled
            noDataText={translate('noDataText')}
            grouped
            collapsibleGroups
            pullRefreshEnabled
            refreshingText={translate("refreshing")}
            pageLoadingText={translate("loading")}
            pageLoadMode="scrollBottom"
            pulledDownText={translate('releaseToRefresh')}
            pullingDownText={translate('pullDownToRefresh')}
            showScrollbar={'always'}
            groupRender={GroupRender}
          // onItemClick={(row) => handleNavigate(row)}
          />
        ) : (
          <NoItemsBanner title="No inspection" />
        )}
      </Stack>

      <MuiDialogCustomRef
        ref={dialogRef}
        onClickOk={handleSubmitDialog}
        onCancel={handleCancelDialog}
        contents={<Typography variant='body2'>Please make sure all the defects have corrective actions before checking this box?</Typography>}
      />

    </Popup>
  );
};

function GroupRender(data) {
  const renderTitle = () => {
    let title = 'Pending';
    if (data.key === 'Pass') {
      title = data.key;
    }
    if (data.key === 'Fail') {
      title = data.key;
    }
    return title;
  };
  return (
    <Box>
      <Typography
        variant="subtext2"
        sx={{
          color: (theme) => theme.palette.secondary.main,
        }}
      >
        {`${renderTitle()} (${data.items.length})`}
      </Typography>
    </Box>
  );
};

function RenderButton({ handleDeselectAllItems, handleCreateInspection, translate, }) {
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 100 });

  useEffect(() => {
    if (sending) {
      setTimeout(() => {
        setProgress((pre) => ({ ...pre, current: pre.current === 100 ? 0 : pre.current + 100 }))
      }, 1000)
    }
  }, [sending]);

  const progressNum = Math.round(progress.current / progress.total * 100) || 0;

  return (
    <>
      <Button height={30} startIcon={<Iconify icon={IconName.close} />} onClick={handleDeselectAllItems}>
        <Typography variant="caption">{translate('unselectAll')}</Typography>
      </Button>
      <Button
        height={30}
        onClick={() => handleCreateInspection(setSending)}
        startIcon={<Iconify icon={IconName.plusCircle} />}
        id="qc-planing-btn-create-inspection"
      >
        <Typography variant="caption">{translate('button.create')}</Typography>
      </Button>
      {/* {sending && <LoadingBackDrop loading={sending} text={'Loading data... Please wait!!!'}
        width='100%'
        height='100%'
      />} */}
      {
        sending &&
        <Dialog
          open={sending}
          onClose={() => { }}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          fullWidth
        >
          <DialogTitle sx={{ mb: 1 }}>Create new inspection</DialogTitle>
          <DialogContent>
            <Stack spacing={2}>
              <LinearProgress variant="determinate" value={progressNum} color='primary' />
              <DialogContentText id="alert-dialog-description">
                Generating QC Inspection....Please wait!!!
              </DialogContentText>
            </Stack>
          </DialogContent>
        </Dialog >
      }
    </>
  );
};


// RENDER SUMMARY HEADER
function SummaryItem({ popupDetail, theme }) {
  const sumarryData = popupDetail?.item;
  return (
    <Stack>
      <Stack direction="row" justifyContent="space-between" pl={1}>
        <Stack direction="column" justifyContent="flex-start">
          <Typography variant="caption" paragraph color={theme.palette.error.dark} fontWeight={'bold'} mb={0}>
            {sumarryData?.SysNo} - {sumarryData?.QCType}
          </Typography>
          <Typography variant="caption" paragraph mb={0}>
            {`${sumarryData?.CustomerName}`}
          </Typography>
          <Typography variant="caption" paragraph mb={0} sx={{ wordBreak: 'break-word' }} whiteSpace="normal">
            {`${sumarryData?.FactoryName}`} - {sumarryData?.SubFactoryName}
          </Typography>
          <Typography variant="caption" paragraph mb={0} sx={{ wordBreak: 'break-word' }} whiteSpace="normal">
            {`${sumarryData?.ItemCode}`} - {sumarryData?.ProductName} - {sumarryData?.ProductColorChartArtName}
          </Typography>
          <Typography variant="caption" paragraph mb={0}>
            Auditor: {`${sumarryData?.AssignToEmpKnowAs}`}
          </Typography>
          <Typography variant="caption" paragraph mb={0}>
            PO: {`${sumarryData?.CustomerPO}`} - QTY: {sumarryData?.Quantity}
          </Typography>
        </Stack>
      </Stack>
    </Stack>
  );
};


// RENDER LIST BOTTOM
function InspectionListComponent({ data, index, theme, handleShowDialog }) {

  const showAuditResultImage = data?.AuditingResult !== null;
  const resultImage = data.IsFinished ? PASSED_IMAGE_SRC : FAILED_IMAGE_SRC;

  return (
    <Stack direction={'row'} justifyContent="flex-start" alignItems={'center'} spacing={1}>
      <Stack direction={'row'} justifyContent="center" alignItems={'center'}>
        <Box
          sx={{
            width: 30,
            height: 30,
            backgroundColor: theme.palette.info.light,
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 15,
          }}
        >
          <Typography variant="caption" color="white">
            {index + 1}
          </Typography>
        </Box>
      </Stack>
      <Stack direction="row" justifyContent="space-between" alignItems={'flex-start'} spacing={1} flex={1}>
        <Stack direction="column" justifyContent="flex-start" width={'60%'}>
          <Typography variant="caption" paragraph color={theme.palette.error.dark} fontWeight={'bold'} mb={0}>
            {data?.SysNo} - {data?.QCType}
          </Typography>
          <Typography variant="caption" paragraph mb={0} sx={{ wordBreak: 'break-word' }} whiteSpace="normal">
            {`${data?.FactoryName}`} - {data?.SubFactoryName}
          </Typography>
          <Typography variant="caption" paragraph mb={0}>
            Auditor: {`${data?.AuditorName}`}
          </Typography>
          <Typography variant="caption" paragraph mb={0}>
            AQL Level Major: {`${data?.AQLLevelMajor}`}
          </Typography>
          <Typography variant="caption" paragraph mb={0}>
            AQL Level Minor: {`${data?.AQLLevelMinor}`}
          </Typography>
          <Typography variant="caption" paragraph mb={0}>
            Pick Sample Qty: {data?.PickSampleQuantity}
          </Typography>
        </Stack>
        <Stack
          direction="column"
          alignItems="flex-end"
          justifyContent="flex-end"
          width={'40%'}
          height={'100%'}
          spacing={3}
        >

          <Typography variant="caption" paragraph mb={0} textAlign="right" sx={{ width: '100%' }}>
            Remarks: {data?.Remark}
          </Typography>

          {showAuditResultImage && (
            <Image
              disabledEffect
              visibleByDefault
              alt="Inspection status"
              src={resultImage}
              sx={{ width: 100 }} />
          )}

          <FormControl>
            <FormControlLabel control={<Checkbox {...label} checked={data?.IsImproved} onChange={() => handleShowDialog(data)} />} label="Is Improved?" />
          </FormControl>

        </Stack>
      </Stack>
    </Stack>
  );
};

