import { Capacitor } from '@capacitor/core';
import { LoadingButton } from '@mui/lab';
import { Box, CircularProgress, Grid, LinearProgress, Stack, styled, Typography, useTheme } from '@mui/material';
import { createStore } from 'devextreme-aspnet-data-nojquery';
import { Popup } from 'devextreme-react';
import { List, SearchEditorOptions } from 'devextreme-react/list';
import DataSource from 'devextreme/data/data_source';
import { useLiveQuery } from 'dexie-react-hooks';
import _ from 'lodash';
import moment from 'moment';
import { useSnackbar } from 'notistack';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Redux
import { setMinnId } from '../../../redux/slices/qc';
import { dispatch, useSelector } from '../../../redux/store';
// Configuration
import { FAILED_IMAGE_SRC, HEADER, HOST_API, NOTCH_HEIGHT, PASSED_IMAGE_SRC, QC_ATTACHEMENTS_HOST_API, QC_STATES } from '../../../config';
import { attachmentsDB, db } from '../../../Db';
import { PATH_APP } from '../../../routes/paths';
// Hooks
import useLocales from '../../../hooks/useLocales';
import useResponsive from '../../../hooks/useResponsive';
import useAccessToken from '../../../hooks/useAccessToken';
import Image from '../../../components/Image';
import Label from '../../../components/Label';
import EmailDialog from '../../../sections/qc/EmailDialog';
import FilterPanel from '../../../sections/qc/FilterPanel';
// Util
import axios from '../../../utils/axios';
import uuidv4 from '../../../utils/uuidv4';


// ----------------------------------------------------------------
const BREAKCRUM_HEIGHT = 78;
const SPACING = 32;
const ANDROID_KEYBOARD = 0
const TAB_HEIGHT = 48;


const RootListStyle = styled(List, {
  shouldForwardProp: () => true,
})(({ theme }) => {

  const IOS_KEYBOARD = Capacitor.getPlatform() === 'ios' ? 16 : 0;
  const ACCORDINATION = 22;

  return {
    height: `calc(100vh - ${HEADER.MOBILE_HEIGHT + BREAKCRUM_HEIGHT + SPACING + ANDROID_KEYBOARD + TAB_HEIGHT + NOTCH_HEIGHT}px)`,
    [theme.breakpoints.up('lg')]: {
      height: `calc(100vh - ${HEADER.DASHBOARD_DESKTOP_HEIGHT + BREAKCRUM_HEIGHT + SPACING + ANDROID_KEYBOARD + IOS_KEYBOARD + NOTCH_HEIGHT + TAB_HEIGHT + ACCORDINATION}px)`,
    },
    [theme.breakpoints.between('md', 'lg')]: {
      height: `calc(100vh - ${HEADER.MOBILE_HEIGHT + BREAKCRUM_HEIGHT + SPACING + ANDROID_KEYBOARD + IOS_KEYBOARD + NOTCH_HEIGHT + TAB_HEIGHT + ACCORDINATION}px)`,
    },
    paddingBottom: 24,
  }
});

function AllList() {

  // Hooks
  const { translate } = useLocales();
  const { enqueueSnackbar } = useSnackbar();

  // Redux
  const { LoginUser } = useSelector((store) => store.workflow);

  // REF
  const listRefAll = useRef(null);

  // Components state
  const [filter, setFilter] = useState(null);
  const [showIntro, setShowIntro] = useState(false);

  // DxOptions
  const accessToken = useAccessToken();

  const storeDataSource = useMemo(() => {
    const API_URL = `${HOST_API}/api/QCMobileApi/GetInspectionList/${LoginUser?.EmpId}`;
    return new DataSource({
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
        { selector: 'IsFinished', desc: false },
        { selector: 'CreatedDate', desc: true },
        { selector: 'CustomerName', desc: false },
        { selector: 'QCType', desc: false },
        { selector: 'Style', desc: false },
      ],
    });
  }, [accessToken, LoginUser?.EmpId]);

  // Get dataSource
  const getDataSource = async (values) => {
    try {
      const fieldContainValues = Object.keys(values).filter((key) => values[key] !== '' && values[key] !== null && values[key] !== undefined);
      if (fieldContainValues.length === 0) {
        setFilter(null);
        storeDataSource.filter(null);
        storeDataSource.reload();
        // storeDataSource.load();
        storeDataSource.on('loadingChanged', (e) => {
          document.getElementById('total_count').innerHTML = `${translate('total')}: ${storeDataSource.totalCount() || 0} ${translate('results')}`;
          document.getElementById('tab-label-1').innerHTML = storeDataSource.totalCount();
        })
        // document.getElementById('total_count').innerHTML = `${translate('total')}: ${storeDataSource.totalCount() || 0} ${translate('results')}`;
        // document.getElementById('tab-label-1').innerHTML = storeDataSource.totalCount();
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

      // if filter value same with previous filter data
      if (filter !== null && _.isEqual(filter, filterObj)) {
        console.log('same values filter')
        return
      };

      setFilter(filterObj);
      storeDataSource.filter(filterObj);
      storeDataSource.on('changed', (e) => {
        document.getElementById('total_count').innerHTML = `${translate('total')}: ${storeDataSource.totalCount() || 0} ${translate('results')}`;
        document.getElementById('tab-label-1').innerHTML = storeDataSource.totalCount();
      });

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

  // const handleExit = () => {
  //   setShowIntro(false);
  // };

  const IOS_KEYBOARD = Capacitor.getPlatform() === 'ios' ? 16 : 0;

  // console.log('first');

  const filterHeight = {
    xs: `calc(100vh - ${HEADER.MOBILE_HEIGHT + BREAKCRUM_HEIGHT + SPACING + ANDROID_KEYBOARD + IOS_KEYBOARD + NOTCH_HEIGHT + 64 + TAB_HEIGHT}px)`,
    sm: `calc(100vh - ${HEADER.MOBILE_HEIGHT + BREAKCRUM_HEIGHT + SPACING + ANDROID_KEYBOARD + IOS_KEYBOARD + NOTCH_HEIGHT + 64 + TAB_HEIGHT}px)`,
    md: `calc(100vh - ${HEADER.MOBILE_HEIGHT + BREAKCRUM_HEIGHT + SPACING + ANDROID_KEYBOARD + IOS_KEYBOARD + NOTCH_HEIGHT + 64 + TAB_HEIGHT}px)`,
    lg: `calc(100vh - ${HEADER.DASHBOARD_DESKTOP_HEIGHT + BREAKCRUM_HEIGHT + SPACING + ANDROID_KEYBOARD + IOS_KEYBOARD + NOTCH_HEIGHT + 64 + TAB_HEIGHT}px)`,
  };

  return (
    <div>

      <FilterPanel
        setDataSource={getDataSource}
        storeDataSource={storeDataSource}
        height={filterHeight}
        setShowIntro={setShowIntro}
      />

      <RootListStyle
        dataSource={storeDataSource}
        itemComponent={ItemTemplate}
        searchExpr={['CustomerName', 'QCType', 'SysNo', 'Style', 'FactoryName', 'SubFactoryName', 'CustomerPO']}
        searchEnabled
        scrollingEnabled
        searchMode={'contains'}
        noDataText={`${translate('noDataText')}. ${translate('useFilter')}`}
        focusStateEnabled={false}
        searchTimeout={1500}
        pageLoadingText={translate("loading")}
        pageLoadMode="scrollBottom"
        showScrollbar={'onScroll'}
        ref={(ref) => { listRefAll.current = ref }}
      >
        <SearchEditorOptions
          placeholder={`${translate('search')} Customer, QC Type, SysNo, Style, Factory, Sub Factory, CustomerPO`}
          showClearButton
        />
      </RootListStyle>
    </div>

  );
};



export default memo(AllList);
// export default AllList;

// ----------------------------------------------------------------
// RENDER LIST FOR LIST ALL ITEMS
function ItemTemplate({ data }) {

  const MqcInspection = useLiveQuery(() => db?.MqcInspection.toArray());
  const smUp = useResponsive('up', 'sm');
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState({
    visible: false,
    item: null,
  });

  const isFinished =
    data?.IsFinished ? QC_STATES[1] : QC_STATES[0];

  const showModalDetail = useCallback(() => {
    setShowModal({ visible: true, item: data })
  }, [data]);

  const onClose = () => {
    setShowModal({ visible: false, item: null })
  };

  function RenderImage() {
    if (data.Header.AuditingResult === 'Pass') {
      return (
        <Image disabledEffect visibleByDefault alt="Inspection status" src={PASSED_IMAGE_SRC} sx={{ width: 100 }} />
      );
    }
    if (data.Header.AuditingResult === 'Fail') {
      return (
        <Image disabledEffect visibleByDefault alt="Inspection status" src={FAILED_IMAGE_SRC} sx={{ width: 100 }} />
      );
    }
    return null;
  };


  return (
    <Stack onClick={showModalDetail}>
      <Stack direction="row" justifyContent="space-between" zIndex={1}>
        <Stack direction="column" justifyContent="flex-start" >
          <Typography
            variant="caption"
            paragraph
            sx={{ color: (theme) => theme.palette.error.dark }}
            fontWeight={'bold'}
            mb={0}
          >
            {`${data?.SysNo} - ${data?.QCType}`}
          </Typography>
          <Typography variant="caption" paragraph mb={0} sx={{ wordBreak: 'break-word' }} whiteSpace="normal">
            {`${data?.CustomerName} - ${data?.FactoryName} - ${data?.SubFactoryName}`}
          </Typography>
          <Typography variant="caption" paragraph mb={0}>
            {`AQL Major: ${data?.Header?.AQLLevelMajor} - AQL Minor: ${data?.Header?.AQLLevelMinor}`}
          </Typography>
          <Typography variant="caption" paragraph mb={0} sx={{ wordBreak: 'break-word' }} whiteSpace="normal">
            {`${data?.Style} - ${data?.Color} - ${data?.ProductName} `}
          </Typography>
          <Typography variant="caption" paragraph mb={0}>
            {`Auditor: ${data?.AuditorName} - Insp No: ${data?.InspNo}`}
          </Typography>
          <Typography variant="caption" paragraph mb={0} whiteSpace='normal' overflow={'hidden'}>
            {`PO: ${data?.CustomerPO} - QTY: ${data?.Qty}`}
          </Typography>
        </Stack>
        <Stack direction="column" justifyContent="flex-end">
          <Label variant="ghost" color={isFinished === 'OPENED' ? 'warning' : 'success'}>
            {isFinished}
          </Label>
          <Typography variant="caption" paragraph fontWeight={'bold'} mb={0} mt={1}>
            {`Created date: ${moment(data?.CreatedDate).format('DD/MM/YYYY')}`}
          </Typography>
        </Stack>
      </Stack>

      {data?.Header?.AuditingResult !== null ? (
        <Box
          sx={{
            position: 'absolute',
            zIndex: 0,
            right: 0,
          }}
        >
          <RenderImage />
        </Box>
      ) : null}

      {showModal.visible && (
        <ModalAddItemToPendingList
          onClose={onClose}
          showModal={showModal}
          MqcInspection={MqcInspection}
          setShowModal={setShowModal}
        />
      )}

    </Stack>
  );
};


const popUpAnimationStyles = {
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
}



// MODAL ADD ITEM TO PENDING LIST I
function ModalAddItemToPendingList({
  onClose,
  showModal,
  MqcInspection,
  setShowModal,
}) {

  const { enqueueSnackbar } = useSnackbar();
  const smUp = useResponsive('up', 'sm');
  const navigate = useNavigate();
  const theme = useTheme();
  const { translate } = useLocales();
  const platform = Capacitor.getPlatform();

  // MOdal States;
  const [itemData, setItemData] = useState(null);
  const [emailDialog, setEmailDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState({
    progress: 0,
    total: 0,
  });

  const { minId } = useSelector(store => store.qc);
  // const { accessToken } = useSelector(store => store.setting);
  const accessToken = useAccessToken();

  const getData = useCallback(async () => {
    await axios
      .get(`/api/QCMobileApi/GetInspectionById/${showModal.item.Id}`)
      .then((res) => {
        console.log('/api/QCMobileApi/GetInspectionById/', res);
        if (res.data.data.length > 0) {
          setItemData(res.data.data[0] || []);
        }
      })
      .catch((err) => {
        console.error(err);
        enqueueSnackbar(JSON.stringify(err), {
          variant: 'error',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'center',
          },
        });
      });
  }, [])

  useEffect(() => {
    getData()
    return () => {
      setDownloadProgress({
        progress: 0,
        total: 0,
      })
    }
  }, []);

  // CHECK IF ITEM EXIST IN PENDING LIST
  const isItemExist = MqcInspection.find((item) => item.Id === showModal.item.Id) !== undefined;
  const isFinished = itemData?.IsFinished;

  const isRefinal = itemData?.IsFinished && itemData?.QCType === 'Final' && itemData?.Header?.AuditingResult === "Fail";

  // ADD TO PENDING LIST
  const handleAddToPendingList = useCallback(async () => {
    try {
      await db.MqcInspection.add(itemData).then(res => {
        navigate(PATH_APP.qc.inspection.detail(itemData.Id));
        onClose();
      });

      enqueueSnackbar(translate('message.addSuccess'), {
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center',
        },
      });
    } catch (e) {
      console.error(e);
      enqueueSnackbar(JSON.stringify(e), {
        variant: 'error',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center',
        },
      });
    }
  }, [itemData]);

  // HANDLE ADD REFINAL TO TODO LIST
  const handleRefinal = useCallback(async () => {
    try {
      // await genAttachmentBase64String(itemData.Attachments).then(base64StringArray => {
      //   console.log(base64StringArray);
      // });
      const newAttachments = itemData.Attachments.filter(d => d.Remark !== "auto upload report file" && d.Remark !== "report file auto upload");
      setLoading(true);
      setDownloadProgress(pre => ({
        ...pre,
        total: newAttachments.length + itemData.PackingAndLabelings.length
      }));
      const cloneAttachments = newAttachments.length > 0 ? await processArray(newAttachments, setDownloadProgress, platform) : [];
      const clonePackingAndLabelings = itemData.PackingAndLabelings.length > 0 ? await processArrayPackingAndLabelings(itemData.PackingAndLabelings, setDownloadProgress, minId, setMinnId, dispatch, itemData.Id, platform) : [];

      // console.log(cloneAttachments);
      // console.log(clonePackingAndLabelings, cloneAttachments)
      // return

      const refinalItem = {
        ...itemData,
        IsRefinal: true,
        IsFinished: false,
        Header: {
          ...itemData.Header,
          AuditingResult: null,
          AuditingResultId: null,
        },
        Status: {
          "Header": false,
          "Contents": false,
          "Inspections": false,
          "PreProduction": false,
          "Packing": false,
          "Measurement": false,
          "Attachments": false,
          "PackingAndLabeling": false,
          "Summary": false,
        },
        SysNo: "QIP.****.****",
        InspNo: itemData.InspNo + 1,
        Summary: {
          "MinorDefectAllow": 0,
          "MajorDefectAllow": 0,
          "CriticalDefectAllow": 0,
          "MinorDefectNumber": 0,
          "MajorDefectNumber": 0,
          "CriticalDefectNumber": 0
        },
        Guid: uuidv4(),
        Inspections: [],
        Attachments: cloneAttachments,
        PackingAndLabelings: clonePackingAndLabelings,
      };

      await db.MqcInspection.add(refinalItem).then(res => {
        navigate(PATH_APP.qc.inspection.detail(itemData.Id));
        onClose();
      });

      enqueueSnackbar(translate('message.addSuccess'), {
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center',
        },
      });
      setLoading(false)

    } catch (e) {
      console.error(e);
      setLoading(false)
      enqueueSnackbar(JSON.stringify(e), {
        variant: 'error',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center',
        },
      });
    }
  }, [itemData]);


  const handleAddCorrectiveAction = async () => {
    try {

      // setLoading(true);

      const correctiveInspection = {
        ...itemData,
        // IsFinished: true,
        Status: {
          ...itemData.Status,
          "Inspections": false,
        },
        InspNo: itemData.InspNo + 1,
        Guid: uuidv4(),
        IsImproved: true,
      };

      await db.MqcInspection.add(correctiveInspection).then(res => {
        navigate(PATH_APP.qc.inspection.detail(itemData.Id));
        onClose();
      });

      enqueueSnackbar(translate('message.addSuccess'), {
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center',
        },
      });
      // setLoading(false)

    } catch (error) {
      console.error(error);
      // setLoading(false)
      enqueueSnackbar(JSON.stringify(error), {
        variant: 'error',
      })
    }
  }

  // HANDLE VIEW ITEMS ONLY
  const handleViewOnly = useCallback(() => {
    navigate(PATH_APP.qc.inspection.detail(showModal.item.Id), { state: { item: itemData, isViewOnly: true } });
  }, [itemData]);

  // HANDLE REPLACE
  const handleReplace = useCallback(async () => {
    try {
      await db.MqcInspection.where('Id')
        .equals(showModal.item.Id)
        .modify((x, ref) => {
          // ref.value = showModal.item;
          ref.value = itemData;
        }).then(res => {
          navigate(PATH_APP.qc.inspection.detail(itemData.Id));
          onClose();
        });
      enqueueSnackbar(translate('message.replaceSuccess'), {
        variant: 'success',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center',
        },
      });
    } catch (e) {
      console.error(e);
      enqueueSnackbar(JSON.stringify(e), {
        variant: 'error',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center',
        },
      });
    }
  }, [itemData]);

  // RENDER TEXT DESCRIPTION
  function TextDescription() {

    if (itemData === null) {
      return (
        <Box width="100%" height={'100%'} p={2} display={'flex'} justifyContent={'center'} alignItems='center' sx={{
          minHeight: {
            xs: 300, sm: 400
          }
        }}>
          <Stack display={'flex'} justifyContent={'center'} alignItems='center' spacing={2} width="100%" height={'100%'}>
            <CircularProgress sx={{ color: 'primary.main' }} />
            <Typography>{translate('loadingStatus.checkingItem')}</Typography>
          </Stack>
        </Box>
      );
    }

    if (isItemExist && !isFinished) {
      return (
        <Box width="100%" p={2}>
          <Typography component={'span'}>
            Item{' '}
            <strong
              style={{ color: theme.palette.error.main }}
            >{`${showModal.item?.SysNo} - ${showModal.item?.QCType}`}</strong>{' '}
            {/* alread exist in Todo list. Do you want to replace it? */}
            {translate('confirm.itemExist')}
          </Typography>
        </Box>
      );
    }

    if (isFinished) {
      return (
        <Box width="100%" p={2}>
          <Typography component={'span'}>
            {translate('confirm.finishedStep')}
          </Typography>
        </Box>
      );
    }

    return (
      <Box width="100%" p={2}>
        <Typography>
          {translate('confirm.addToTodo')}
        </Typography>
      </Box>
    );
  };

  const handleOpenEmailDialog = useCallback(() => {
    setEmailDialog(true)
  }, []);

  const progressNum = Math.round(downloadProgress.progress / downloadProgress.total * 100)

  // console.log(downloadProgress);

  return (
    <Popup
      visible={showModal.visible}
      onHiding={onClose}
      dragEnabled={false}
      hideOnOutsideClick={false}
      closeOnOutsideClick={false}
      showCloseButton={!loading}
      showTitle
      title={translate('confirm.addToTodoTitile')}
      width={smUp ? 700 : '95%'}
      height={'50%'}
      animation={popUpAnimationStyles}
    >
      <Stack p={0}>

        <TextDescription />

        {loading && <Box width="100%" height={'100%'} p={2} display={'flex'} justifyContent={'center'} alignItems='center'
          flexDirection={'column'}
          sx={{
            backgroundColor: 'white',
            opacity: 0.7,
            zIndex: 1000000,
            minHeight: {
              xs: 300, sm: 450
            },
            overflow: 'hidden',
          }}>

          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <Box sx={{ width: '100%', mr: 1 }}>
              <LinearProgress variant="determinate" value={progressNum} color='primary' />
            </Box>
            <Box sx={{ minWidth: 35 }}>
              <Typography variant="body2" color="primary.main">{`${progressNum}%`}</Typography>
            </Box>
          </Box>
          <Typography>Generating Re-Final inspection...</Typography>
        </Box>}


        {itemData !== null &&
          <>
            <Box sx={{ flexGrow: 1 }} />
            <Stack sx={{ position: 'absolute', bottom: 10, left: 0, width: '100%' }} p={2} justifyContent="flex-end">
              <Grid container spacing={3}>

                {!isItemExist && !isFinished ? (
                  <Grid item xs={12} sm={4}>
                    <LoadingButton
                      fullWidth
                      variant="contained"
                      onClick={handleAddToPendingList}
                      disabled={itemData === null || loading}
                      sx={{ mt: 1, minWidth: 200 }}
                    >
                      {translate('button.addTodo')}
                    </LoadingButton>
                  </Grid>
                ) : null}

                {isItemExist && !isFinished ? (
                  <Grid item xs={12} sm={4}>
                    <LoadingButton
                      fullWidth
                      variant="contained"
                      onClick={handleReplace}
                      sx={{ mt: 1, minWidth: 200 }}
                      disabled={itemData === null || loading}
                    >
                      {translate('button.replace')}
                    </LoadingButton>
                  </Grid>
                ) : null}

                <Grid item xs={12} sm={4}>
                  <LoadingButton
                    fullWidth
                    variant="contained"
                    onClick={handleViewOnly}
                    disabled={itemData === null || loading}
                    sx={{ backgroundColor: (theme) => theme.palette.info.main, mt: 1, minWidth: 200 }}
                  >
                    {translate('button.viewOnly')}
                  </LoadingButton>
                </Grid>

                {isFinished &&
                  <>
                    <Grid item xs={12} sm={4}>
                      <LoadingButton
                        fullWidth
                        variant="contained"
                        onClick={handleAddCorrectiveAction}
                        sx={{ backgroundColor: (theme) => theme.palette.success.main, mt: 1, minWidth: 200 }}
                        disabled={loading}
                      >
                        Add Corrective action
                      </LoadingButton>
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <LoadingButton
                        fullWidth
                        variant="contained"
                        onClick={handleOpenEmailDialog}
                        sx={{ backgroundColor: (theme) => theme.palette.warning.main, mt: 1, minWidth: 200 }}
                        disabled={loading}
                      >
                        {translate('button.sendEmail')}
                      </LoadingButton>
                    </Grid>
                  </>
                }

                {isRefinal &&
                  <Grid item xs={12} sm={4}>
                    <LoadingButton
                      fullWidth
                      variant="contained"
                      onClick={handleRefinal}
                      sx={{ backgroundColor: (theme) => theme.palette.error.main, mt: 1, minWidth: 200 }}
                      disabled={loading}

                    >
                      {translate('button.reFinal')}
                    </LoadingButton>
                  </Grid>
                }

              </Grid>

            </Stack>
          </>
        }
      </Stack>

      {emailDialog &&
        <EmailDialog emailDialog={emailDialog}
          setEmailDialog={setEmailDialog} inspection={itemData}
          setShowModal={setShowModal}
        />
      }

    </Popup>
  );
};


// Re assign attachment objects with base64
// const genAttachmentBase64String = (attachments) => {
//   return new Promise((resolve) => {
//     let items = []
//     if (attachments.length === 0) {
//       resolve(items);
//       return items
//     }
//     setTimeout(() => {
//       const result = attachments
//         .map(async (Items) => {
//           const newItem = { ...Items };
//           // const imageUrl = `${QC_ATTACHEMENTS_HOST_API}/${Items.Guid}`;
//           const imageUrl = `${QC_ATTACHEMENTS_HOST_API}/384a7c67-9929-4d6d-9a30-cc116d100aa7`;
//           await getBase64FromUrl(imageUrl, true).then(async (res) => {
//             console.log(res)
//             newItem.Data = res || null;
//             items = [...items, newItem]
//           });
//           return newItem
//         })
//       resolve(result);
//       return result;
//     }, 1000)
//   })
// };


function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      const base64String = reader.result.split(',')[1]; // Extracting the base64 part
      resolve(base64String);
    };

    reader.onerror = reject;

    reader.readAsDataURL(blob);
  });
}

async function fetchImageForObject(url, accessToken) {
  try {
    const response = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const blobImage = await response.blob();

    // Example usage
    // console.log(blobImage);
    const base64ImageData = await blobToBase64(blobImage)
    // console.log(base64ImageData);

    return `data:image/jpeg;base64,${base64ImageData}` || null;
  } catch (error) {
    return null
    console.error('Error fetching image data from the server:', error);
  }
}


// Mock function to simulate an asynchronous operation
function asyncOperation(url, accessToken, platform) {
  return new Promise(resolve => {
    // Simulating asynchronous operation (e.g., fetching data)
    if (platform !== 'web') {
      setTimeout(() => {
        console.log(`Processed item: ${url}`);
        const dataBase64 = fetchImageForObject(url, accessToken, platform)
        resolve(dataBase64);
      }, 200);
    } else {
      console.log(`Processed item: ${url}`);
      const dataBase64 = fetchImageForObject(url, accessToken, platform)
      resolve(dataBase64);
    }

    // Adjust the timeout as needed
  });
}




export async function processArray(attachements, setDownloadProgress, platform) {
  /* eslint-disable */
  let result = []
  for (const item of attachements) {
    const accessToken = window.localStorage.getItem('accessToken');
    setDownloadProgress(pre => ({
      ...pre,
      progress: pre.progress + 1,
    }))
    const base64 = await asyncOperation(item.URL, accessToken, platform);
    item.Data = base64;
    item.Action = 'Insert';
    item.URL = null;
    result.push(item);
  }

  // Code here will only run after all items have been processed
  console.log('All items processed.');
  return result
};


export async function processArrayPackingAndLabelings(attachements, setDownloadProgress, minId, setMinnIdset, dispatch, inspectionId, platform) {

  /* eslint-disable */
  let result = [];
  let index = 0;
  for (const item of attachements) {
    const accessToken = window.localStorage.getItem('accessToken');
    setDownloadProgress(pre => ({
      ...pre,
      progress: pre.progress + 1,
    }))
    let images = []
    for (const image of item.Images) {
      index += 1
      const imageUrl = `${QC_ATTACHEMENTS_HOST_API}/${image.Guid}`;
      const base64 = await asyncOperation(imageUrl, accessToken, platform);
      // image.Data = base64
      image.Action = 'Insert';
      image.Id = minId - 1 - index;
      images.push(image);
      await attachmentsDB.qc.add({
        ...image,
        Data: base64,
        MasterId: inspectionId,
      })
      dispatch(setMinnId(minId - 1 - index));
    }
    item.Images = images;
    result.push(item);
  }

  // Code here will only run after all items have been processed
  console.log('All items processed.');
  return result
}


