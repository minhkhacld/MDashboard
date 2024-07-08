import { Capacitor } from '@capacitor/core';
import { Alert, Box, Button, Stack, Typography, useTheme } from '@mui/material';
import { List, SearchEditorOptions } from 'devextreme-react/list';
import { useLiveQuery } from 'dexie-react-hooks';
import moment from 'moment';
import { useSnackbar } from 'notistack';
import { memo, useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Configuration
import { FAILED_IMAGE_SRC, HEADER, HOST_API, NOTCH_HEIGHT, PASSED_IMAGE_SRC, QC_STATES } from '../../../config';
import { attachmentsDB, db } from '../../../Db';
import { setSignalR, setUploadingItem, startLoading, } from '../../../redux/slices/qc';
import { dispatch, useSelector } from '../../../redux/store';
import { PATH_APP } from '../../../routes/paths';
// Hooks
import useAccessToken from '../../../hooks/useAccessToken';
import useLocales from '../../../hooks/useLocales';
// Components
import FloatButton from '../../../components/button/FloatButton';
import Iconify from '../../../components/Iconify';
import Image from '../../../components/Image';
import Label from '../../../components/Label';
// Util
import UploadSnackBar from '../../../components/snackbar/UploadSnackBar';
import { useWebWorker } from '../../../components/WebWorkerProvider';
import IconName from '../../../utils/iconsName';
import { mergeDetailAttachment } from "../QCInspectionList";


// --------------------------------------------------------------

const BREAKCRUM_HEIGHT = 40;
const SPACING = 24;
const ANDROID_KEYBOARD = 0
const TAB_HEIGHT = 48;
const SELECTION_CONTROL = 48;


function TodoList() {

  const platform = Capacitor.getPlatform();

  const MqcInspection = useLiveQuery(() => db?.MqcInspection.toArray()) || [];
  const { currentTab, loading, signalR, uploadProgress, uploadQueue, uploadingItem, disableResubmit } = useSelector((store) => store.qc);
  // worker
  const worker = useWebWorker();

  // REF
  const listRefPending = useRef(null);

  // HOOKS
  const theme = useTheme();
  const { translate } = useLocales();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  // component states
  const [showSelection, setShowSelection] = useState(false);

  // OPEN MENU CONTROL
  const handleOpenSelectMenuControl = () => {
    setShowSelection(!showSelection);
  };

  // SELECT ALL ITEMS
  const handleSelectAll = () => {
    if (listRefPending.current) {
      listRefPending.current.instance.selectAll();
    }
  }

  // ROMOVE SELECTED ITEMS
  const handleDeselectAllItems = () => {
    if (listRefPending.current) {
      listRefPending.current.instance.unselectAll();
      setShowSelection(false);
    }
  };

  // DELETE SELECTED ITEMS
  const handleDeleteSelectAllItems = async () => {
    const newselected = listRefPending.current.instance._selection.options.selectedItems;
    const uploadQueueId = [...uploadQueue].map(d => d.Id);
    if (newselected.length > 0) {
      newselected.filter(v => !uploadQueueId.includes(v.Id)).forEach(async (d) => {
        await attachmentsDB.qc.where('MasterId').equals(d.Id).delete(res => console.log('delete count', res))
        await db.MqcInspection.where('Id')
          .equals(d.Id)
          .delete()
          .then(() => {
            // console.log(deleteCount);
          });
      });
      setShowSelection(false);
    }
  };


  const handleSelectionChange = (e) => {
    if (e.name === "selectedItemKeys" && listRefPending.current) {
      const uploadQueueId = [...uploadQueue].map(d => d.Id);
      const listItems = listRefPending.current.instance.option("items");
      const disabledItems = listItems.filter(v => uploadQueueId.includes(v.Id));
      if (disabledItems.length > 0) {
        disabledItems.forEach(item => {
          const itemIndex = listItems.findIndex(u => u.Id === item.Id)
          listItems[itemIndex].disabled = true;
        })
      }
    }
  }

  const IOS_KEYBOARD = Capacitor.getPlatform() === 'ios' ? 16 : 0;
  const sortItems = MqcInspection.sort((a, b) => (b.id - a.id));

  if (!MqcInspection) return null;

  return (
    <div>
      {showSelection && currentTab === '1' && (
        <Stack
          direction={'row'}
          justifyContent="flex-start"
          alignItems={'center'}
          spacing={{ xs: 1, sm: 2 }}
          p={1}
          id="custom-button-group"
        >
          <Button height={30} startIcon={<Iconify icon={IconName.selectAll} />} onClick={handleSelectAll}>
            <Typography variant="caption">{translate('selectAll')}</Typography>
          </Button>
          <Button height={30} startIcon={<Iconify icon={IconName.close} />} onClick={handleDeselectAllItems}>
            <Typography variant="caption">{translate('unselectAll')}</Typography>
          </Button>
          <Button height={30} onClick={handleDeleteSelectAllItems} startIcon={<Iconify icon={IconName.delete} />}>
            <Typography variant="caption"> {translate('deleteSelectedItem')}</Typography>
          </Button>
        </Stack>
      )}

      <List
        dataSource={sortItems}
        // itemRender={itemTemplate}
        itemComponent={({ data }) => <ItemTemplate
          data={data}
          uploadQueue={uploadQueue}
          uploadingItem={uploadingItem}
          loading={loading}
          signalR={signalR}
          uploadProgress={uploadProgress}
          enqueueSnackbar={enqueueSnackbar}
          worker={worker}
          platform={platform}
          disableResubmit={disableResubmit}
        />}
        searchExpr={['CustomerName', 'QCType', 'SysNo', 'Style', 'FactoryName', 'SubFactoryName']}
        {...theme.breakpoints.only('lg') && { height: `calc(100vh - ${HEADER.DASHBOARD_DESKTOP_HEIGHT + BREAKCRUM_HEIGHT + SPACING + ANDROID_KEYBOARD + IOS_KEYBOARD + NOTCH_HEIGHT + TAB_HEIGHT + (showSelection ? SELECTION_CONTROL : 0)}px)` }}
        {...theme.breakpoints.only('md') && { height: `calc(100vh - ${HEADER.MOBILE_HEIGHT + BREAKCRUM_HEIGHT + SPACING + ANDROID_KEYBOARD + IOS_KEYBOARD + NOTCH_HEIGHT + TAB_HEIGHT + (showSelection ? SELECTION_CONTROL : 0)}px)` }}
        {...theme.breakpoints.only('xs') && { height: `calc(100vh - ${HEADER.MOBILE_HEIGHT + BREAKCRUM_HEIGHT + SPACING + ANDROID_KEYBOARD + IOS_KEYBOARD + NOTCH_HEIGHT + TAB_HEIGHT + (showSelection ? SELECTION_CONTROL : 0)}px)` }}
        searchEnabled
        scrollingEnabled
        searchMode={'contains'}
        noDataText={translate('noDataText')}
        focusStateEnabled={false}
        showSelectionControls={showSelection && currentTab === '1'}
        pullRefreshEnabled
        selectionMode="multiple"
        refreshingText={translate("refreshing")}
        pageLoadingText={translate("loading")}
        pageLoadMode="scrollBottom"
        showScrollbar={'onScroll'}
        ref={listRefPending}
        onOptionChanged={handleSelectionChange}

      >
        <SearchEditorOptions
          placeholder={`${translate('search')} Customer, QC Type, SysNo, Style, Factory, Sub Factory`}
          showClearButton
        />
      </List>

      <FloatButton onClick={handleOpenSelectMenuControl} icon={IconName.edit} />

    </div>

  );
};

function areEqual(prevProps, nextProps) {
  //   console.log(prevProps, nextProps);
  /*
    return true if passing nextProps to render would return
    the same result as passing prevProps to render,
    otherwise return false
    */
  if (prevProps.length === nextProps.length) return false;
  return true;
};

export default memo(TodoList, areEqual);


// RENDER ITEM FOR TODO LIST
const ItemTemplate = ({ data, uploadQueue, uploadingItem, loading, signalR, uploadProgress, enqueueSnackbar, worker, platform, disableResubmit }) => {

  const isFinished = data?.IsFinished ? QC_STATES[1] : QC_STATES[0];
  const IsRefinal = data?.IsRefinal;
  const IsProcessing = data?.IsProcessing || false;
  const uploadItem = [...uploadQueue].find(d => d.Id === data.Id);
  const isUploadingItem = uploadItem !== undefined && uploadingItem === data.Id;
  const isWaitingforSubmitting = uploadItem !== undefined && uploadingItem !== data.Id;
  const navigate = useNavigate();
  const accessToken = useAccessToken();

  const handleResetItem = async () => {
    try {
      const startUpload = uploadQueue.length > 0;
      if (!startUpload) return;
      dispatch(startLoading(true));
      dispatch(setSignalR({ id: null, sysNo: null, qcType: null, message: null, type: null, guid: null }));

      if (window.Worker) {
        (async () => {

          // get all images of this inspection item
          const results = await attachmentsDB.qc.where('MasterId').equals(data.Id).toArray() || [];
          const currentInspection = await db?.MqcInspection.get({ Id: data.Id });
          const refreshToken = localStorage.getItem('refreshToken');

          // merge all images into inspection detail
          await mergeDetailAttachment(currentInspection, results.filter(d => d.Data !== null), enqueueSnackbar, dispatch, startLoading).then(async mergeData => {

            // delete indexdb id;
            delete mergeData.id;

            // change status if Submit or Finish
            if (data.IsFinished) {
              currentInspection.IsFinished = true;
              mergeData.IsFinished = true;
            }

            mergeData.IsMobile = platform !== 'web';
            // set current uploading item;
            dispatch(setUploadingItem(mergeData.Id));

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

    } catch (error) {
      console.error('error', error);
    }
  };

  const handleNavigate = useCallback((data) => {
    if (data?.IsProcessing) {
      return;
    }
    navigate(PATH_APP.qc.inspection.detail(data.Id));
  }, [])

  const RenderImage = () => {
    if (data?.Header?.AuditingResult === 'Pass') {
      return (
        <Image disabledEffect visibleByDefault alt="Inspection status" src={PASSED_IMAGE_SRC} sx={{ width: 100 }} />
      );
    }
    if (data?.Header?.AuditingResult === 'Fail') {
      return (
        <Image disabledEffect visibleByDefault alt="Inspection status" src={FAILED_IMAGE_SRC} sx={{ width: 100 }} />
      );
    }
    return null;
  };

  const RenderTodoStatus = () => {
    if (data?.Status === null || data?.Status === undefined) {
      return <Label variant="ghost" color={'info'} sx={{ marginBottom: 1 }} />;
    }
    const toDoStatus = Object.values(data?.Status).filter((d) => d === true) || [];
    if (toDoStatus.length > 0 && toDoStatus.length <= 6) {
      return (
        <Label variant="ghost" color={'info'} sx={{ marginBottom: 1 }}>
          In-Progress
        </Label>
      );
    }
    if (toDoStatus.length > 6) {
      return (
        <Label variant="ghost" color={'info'} sx={{ marginBottom: 1 }}>
          Waiting for Submit
        </Label>
      );
    }

    return (
      <Label variant="ghost" color={'info'} sx={{ marginBottom: 1 }}>
        New
      </Label>
    );
  };

  return (
    <Stack
      onClick={() => handleNavigate(data)}
      position="relative"
    >
      <Stack
        spacing={1}
        zIndex={1}
        {...IsProcessing && {
          style: {
            // pointerEvents: 'none',
            // opacity: 0.6,
          }
        }}
      >
        <Stack direction="row" justifyContent="space-between" zIndex={1}>
          <Stack direction="column" justifyContent="flex-start">
            <Typography
              variant="caption"
              paragraph
              sx={{ color: (theme) => theme.palette.error.dark }}
              fontWeight={'bold'}
              mb={0}
            >
              {`${data?.SysNo} - ${IsRefinal ? ' Re-Final' : data?.QCType}`}
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
            <Typography variant="caption" paragraph mb={0} whiteSpace='normal'>
              {`Auditor: ${data?.AuditorName} - Insp No: ${data?.InspNo}`}
            </Typography>
            <Typography variant="caption" paragraph mb={0} whiteSpace='normal'>
              {`PO: ${data?.CustomerPO} - QTY: ${data?.Qty}`}
            </Typography>
          </Stack>
          <Stack direction="column" justifyContent="flex-end">
            <RenderTodoStatus />
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

        {
          loading && isUploadingItem && data?.IsProcessing &&
          <Box sx={{ mt: 1, border: theme => `1px solid ${theme.palette.grey[400]}`, p: 1, justifyContent: 'center', alignContent: 'center' }}  >
            <UploadSnackBar
              loading={loading}
              progress={uploadProgress}
              signalR={signalR}
              position='relative'
              width='100%'
            />
          </Box>
        }

        {
          isWaitingforSubmitting && data?.IsProcessing &&
          <Alert severity="info" sx={{ mt: 1 }} icon={<Iconify icon={'eos-icons:hourglass'} />}>
            In queue of uploading {`(${uploadItem?.No})`}
          </Alert>
        }

      </Stack>

      {
        IsProcessing && uploadingItem === data?.Id && <Box sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 'auto',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: theme => theme.palette.background.paper,
          zIndex: 1000000000,
          pointerEvents: "visible",
          opacity: 1,
          p: 2,
        }}>
          <Button onClick={handleResetItem} variant='contained' color="primary" disabled={disableResubmit}>Re-Submit</Button>
        </Box>
      }

    </Stack >
  );
};
