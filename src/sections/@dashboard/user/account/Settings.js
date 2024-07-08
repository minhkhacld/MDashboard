// Capacitor
import { ActionSheet, ActionSheetButtonStyle } from '@capacitor/action-sheet';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { Device } from '@capacitor/device';
import { Dialog as CapDialog } from '@capacitor/dialog';
import { Directory, Encoding, Filesystem } from "@capacitor/filesystem";
import { Share } from '@capacitor/share';
import { Toast } from '@capacitor/toast';
import { FilePicker } from '@capawesome/capacitor-file-picker';
import { Popup, ScrollView } from 'devextreme-react';
import { flatten } from 'flat';
import ReactJson from 'react-json-view';
// Mui
import {
  Box, Button,
  Card,
  Dialog, DialogActions, DialogContent,
  DialogContentText, DialogTitle,
  Divider,
  List, ListItem, ListItemIcon, ListItemText, Stack, Typography
} from '@mui/material';
import moment from 'moment';
import { useSnackbar } from 'notistack';
import { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
// db
import { attachmentsDB, complianceDB, db, mqcDB } from '../../../../Db';
// components
import LoadingBackDrop from '../../../../components/BackDrop';
import Iconify from '../../../../components/Iconify';
import Label from '../../../../components/Label';
import useLocales from '../../../../hooks/useLocales';
import { dispatch, useSelector } from '../../../../redux/store';
import IconName from '../../../../utils/iconsName';
// Utils
import {
  writeToClipboard
} from '../../../../utils/appClipboard';
// redux
import { setMinnId as setMinComplianceId } from '../../../../redux/slices/compliance';
import { resetSubmiting, setMinnId } from '../../../../redux/slices/qc';

function Settings() {

  const { validate, backupData, backupDataStatus } = useSelector(store => store.setting);
  const { LoginUser } = useSelector((store) => store.workflow);
  const { translate, currentLang } = useLocales()
  const [open, setOpen] = useState({ visible: false, type: null });
  const platform = Capacitor.getPlatform();
  const isWebApp = platform === 'web';
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [showJsonViewer, setShowJsonViewer] = useState({ visible: false, data: null });
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const allDbs = [
    { dbName: db.MqcInspection, exportName: 'qc', },
    { dbName: complianceDB.Todo, exportName: 'compliance' },
    { dbName: mqcDB.ToDo, exportName: 'mqc' },
    { dbName: attachmentsDB.compliance, exportName: 'attachments' },
    { dbName: attachmentsDB.qc, exportName: 'attachmentsQc' },
  ];


  const Dropzone = useDropzone({
    // Disable click and keydown behavior
    noClick: true,
    noKeyboard: true,
    multiple: false,
    accept: ['text/*', 'application/json'],
    onDrop: acceptedFiles => handleDropFile(acceptedFiles)
  });


  const hanldleActionConfirm = useCallback(async () => {
    if (open.type === 'BACKUP') {
      handleBackup()
    } else {
      const clearDB = () => {
        return new Promise((resolve, reject) => {
          const DBQC = db.delete().then((res) => console.log(res));
          const DB_COM = complianceDB.delete().then((res) => console.log(res));
          const DB_ATT = attachmentsDB.delete().then((res) => resolve('done'));
          const DB_MQC = mqcDB.delete().then((res) => resolve('done'));
        });
      };
      clearDB().then((res) => {
        window.localStorage.setItem('lastVisitPage', JSON.stringify("/user/account"))
        window.location.reload();
        dispatch(setMinnId(-1));
        dispatch(setMinComplianceId(-1));
        dispatch(resetSubmiting());
      });
    }
  }, []);

  const handleLoadBackup = useCallback(async () => {
    setOpen({ visible: true, type: 'BACKUP' });
  }, []);

  const handleBackup = useCallback(async () => {
    try {
      const { qc, compliance, mqc, attachments, attachmentsQc } = backupData;
      const dbImport = [
        { dbName: db.MqcInspection, exportName: 'qc', data: qc, },
        { dbName: complianceDB.Todo, exportName: 'compliance', data: compliance, },
        { dbName: mqcDB.ToDo, exportName: 'mqc', data: mqc, },
        { dbName: attachmentsDB.compliance, exportName: 'attachments', data: attachments, },
        { dbName: attachmentsDB.qc, exportName: 'attachmentsQc', data: attachmentsQc, },
      ];
      setLoading(true);
      setProgress((pre) => ({ ...pre, total: dbImport.length }));
      const importResult = await processImportArray(dbImport, setProgress);
      setLoading(false);
      setProgress((pre) => ({ current: 0, total: 0 }));
      setOpen({ visible: false, type: null });
      enqueueSnackbar('Backup successfully!');
      setDisabled(true);
    } catch (e) {
      setLoading(false);
      setProgress((pre) => ({ current: 0, total: 0 }));
      console.error('Unable to read file', JSON.stringify(e.message));
      enqueueSnackbar(JSON.stringify(e.message), {
        variant: 'error',
      })

    }
  }, []);

  // EXPORT AND SHARE DATA
  const handleExportData = useCallback(async () => {
    try {
      let appInfo = 'web'
      if (!isWebApp) {
        appInfo = (await App.getInfo()).version;
      }
      setLoading(true);
      setProgress((pre) => ({ ...pre, total: allDbs.length }));
      const dbData = await processArray(allDbs, setProgress);
      const hasData = Object.values(dbData).filter(d => d.length > 0).length > 0;
      if (hasData) {
        if (isWebApp) {
          const blob = new Blob([JSON.stringify(dbData)]);
          const link = document.createElement("a");
          link.download = `mystem_backup_${LoginUser?.EmpKnowAs}_${appInfo}_${moment().format('DDMMYYYY')}.json`;
          link.href = window.URL.createObjectURL(blob);
          link.click();
          link.remove();
        } else {
          const fileText = JSON.stringify(dbData)
          const response = await Filesystem.writeFile({
            // path: `msystem/mystem_backup.json`,
            path: `msystem/mystem_backup_${LoginUser?.EmpKnowAs}_${appInfo}_${moment().format('DDMMYYYY')}.json`,
            data: fileText,
            directory: Directory.Cache,
            encoding: Encoding.UTF8,
            recursive: true,
          });
          const shareResult = await Share.share({
            url: response.uri,
          });
        }
      } else {
        await Toast.show({
          text: translate('noDataText'),
          duration: 'short',
          position: 'bottom'
        })
      }
      setLoading(false)
      setProgress((pre) => ({ current: 0, total: 0 }))
    } catch (error) {
      console.log(error)
      await Toast.show({
        text: `${translate('message.exportFailed')}: ${JSON.stringify(error)}`,
        duration: 'short',
        position: 'bottom'
      })
      setLoading(false);
      setProgress((pre) => ({ current: 0, total: 0 }));
    }
  }, []);

  function readFileUpload(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsText(file[0]);
      reader.onload = async (e) => {
        const content = JSON.parse(reader.result);
        // console.log(content)
        // Here the content has been read successfuly
        if (content) {
          const { qc, compliance, mqc, attachments, attachmentsQc } = content;
          const dbImport = [
            { dbName: db.MqcInspection, exportName: 'qc', data: qc, },
            { dbName: complianceDB.Todo, exportName: 'compliance', data: compliance, },
            { dbName: mqcDB.ToDo, exportName: 'mqc', data: mqc, },
            { dbName: attachmentsDB.compliance, exportName: 'attachments', data: attachments, },
            { dbName: attachmentsDB.qc, exportName: 'attachmentsQc', data: attachmentsQc, },
          ];
          setLoading(true);
          setProgress((pre) => ({ ...pre, total: dbImport.length }));
          const importResult = await processImportArray(dbImport, setProgress);
          enqueueSnackbar(translate('message.importSuccess'))
        }
        setLoading(false)
        setProgress((pre) => ({ current: 0, total: 0 }))
        resolve(reader.result)
      };
      reader.onerror = (error) => {
        setLoading(false)
        setProgress((pre) => ({ current: 0, total: 0 }))
        reject(error)
      };
    });
  }

  const handleDropFile = useCallback(async (files) => {
    try {
      await readFileUpload(files).then(res => {
        // console.log(res)
        handleShowJsonViewer()
      })

    } catch (error) {
      setLoading(false)
      setProgress((pre) => ({ current: 0, total: 0 }))
      console.log(error)
      await Toast.show({
        text: `${translate('message.importFailed')}: ${JSON.stringify(error)}`,
        duration: 'short',
        position: 'bottom'
      })
    }

  }, [])

  const handleImportData = useCallback(async () => {
    try {

      if (isWebApp) {
        Dropzone.open()
        return
      };

      const result = await FilePicker.pickFiles();
      const file = result.files[0];

      const contents = await Filesystem.readFile({
        path: file.path,
        encoding: Encoding.UTF8
      });

      // console.log(JSON.stringify(file), contents.data);

      if (contents.data) {
        const parseContents = JSON.parse(`${contents?.data}`);
        const { qc, compliance, mqc, attachments, attachmentsQc } = parseContents;
        // console.log('qc, compliance, mqc, attachments', qc.length, compliance.length, mqc.length, attachments.length);
        const dbImport = [
          { dbName: db.MqcInspection, exportName: 'qc', data: qc, },
          { dbName: complianceDB.Todo, exportName: 'compliance', data: compliance, },
          { dbName: mqcDB.ToDo, exportName: 'mqc', data: mqc, },
          { dbName: attachmentsDB.compliance, exportName: 'attachments', data: attachments, },
          { dbName: attachmentsDB.qc, exportName: 'attachmentsQc', data: attachmentsQc, },
        ];
        setLoading(true);
        setProgress((pre) => ({ ...pre, total: dbImport.length }));
        const importResult = await processImportArray(dbImport, setProgress);

        enqueueSnackbar(translate('message.importSuccess'))
      }
      setLoading(false);
      setProgress((pre) => ({ current: 0, total: 0 }));
    } catch (error) {
      console.log(error)
      await Toast.show({
        text: `${translate('message.importFailed')}: ${JSON.stringify(error)}`,
        duration: 'short',
        position: 'bottom'
      })
      setLoading(false);
      setProgress((pre) => ({ current: 0, total: 0 }));
    }
  }, []);


  const handleShowJsonViewer = useCallback(async () => {
    try {
      setLoading(true);
      setProgress((pre) => ({ ...pre, total: allDbs.length }));
      const dbData = await processArray(allDbs, setProgress);
      const hasData = Object.values(dbData).filter(d => d.length > 0).length > 0;
      if (hasData) {
        setShowJsonViewer({
          visible: true,
          data: dbData
        });
      } else {
        await Toast.show({
          text: currentLang.value === 'vn' ? "Không có dữ liệu" : "No data to display",
          duration: 'short',
        })
      }
      setLoading(false)
      setProgress((pre) => ({ current: 0, total: 0 }));
    } catch (error) {
      await Toast.show({
        text: JSON.stringify(error),
        duration: 'short',
      })
      setLoading(false)
      setProgress((pre) => ({ current: 0, total: 0 }))
    }
  }, [])

  return (
    <Stack spacing={2}>
      <Card>
        <List
          disablePadding
          sx={{
            width: '100%',
            backgroundColor: 'grey.200',
            borderRadius: 1,
            p: 1,
          }}
          aria-labelledby="nested-list-subheader"
          subheader={
            <Typography id="nested-list-subheader" fontWeight='bold' variant='h5' mb={1}>
              {currentLang.value === 'vn' ? 'Bộ nhớ thiết bị' : "Device storage"}
            </Typography>
          }
        >

          <ListItem onClick={() => setOpen({ visible: true, type: 'CLEAR' })} sx={{
            borderRadius: 5,
            backgroundColor: 'grey.200',
            minHeight: 50, "&:hover": {
              backgroundColor: 'primary.main', color: 'white'
            }
          }} >
            <ListItemIcon>
              <Iconify icon={IconName.delete} />
            </ListItemIcon>
            <ListItemText id="switch-list-label-wifi" primary={translate('accountGroup.setting.clearData')} />
          </ListItem>

          <Divider variant="middle" component="li" sx={{ my: 0.5 }} />
          <ListItem onClick={handleLoadBackup} sx={{
            borderRadius: 5,
            backgroundColor: 'grey.200',
            minHeight: 50,
            "&:hover": {
              backgroundColor: 'primary.main', color: 'white'
            }
          }}>
            <ListItemIcon>
              <Iconify icon={IconName.backUp} />
            </ListItemIcon>
            <ListItemText id="switch-list-label-bluetooth" primary={translate('accountGroup.setting.backupData')} />
          </ListItem>

          <Divider variant="middle" component="li" sx={{ my: 0.5 }} />
          <ListItem onClick={handleExportData} sx={{
            borderRadius: 5,
            backgroundColor: 'grey.200',
            minHeight: 50,
            "&:hover": {
              backgroundColor: 'primary.main',
              color: 'white',
            }
          }}>
            <ListItemIcon>
              <Iconify icon={IconName?.export} />
            </ListItemIcon>
            <ListItemText id="export-data" primary={translate('accountGroup.setting.exportData')} />
          </ListItem>

          <Divider variant="middle" component="li" sx={{ my: 0.5 }} />
          <Box {...(isWebApp && Dropzone.getRootProps())}          >
            <ListItem onClick={handleImportData} sx={{
              borderRadius: 5, backgroundColor: 'grey.200', minHeight: 50, "&:hover": {
                backgroundColor: 'primary.main', color: 'white'
              },
            }}
            >
              <ListItemIcon>
                <Iconify icon={IconName?.import} />
              </ListItemIcon>
              <ListItemText id="import-data" primary={translate('accountGroup.setting.importData')} />
              <input {...Dropzone.getInputProps()} />
            </ListItem>
          </Box>

          <Divider variant="middle" component="li" sx={{ my: 0.5 }} />
          <ListItem onClick={handleShowJsonViewer} sx={{
            borderRadius: 5,
            backgroundColor: 'grey.200',
            minHeight: 50,
            "&:hover": {
              backgroundColor: 'primary.main',
              color: 'white'
            }
          }}>
            <ListItemIcon>
              <Iconify icon={IconName?.view} />
            </ListItemIcon>
            <ListItemText id="import-data" primary={currentLang.value === "vn" ? "Xem dữ liệu" : "Inspect data"} />
          </ListItem>

        </List>
      </Card>

      <DeviceInfoCard isWebApp={isWebApp} />

      <AppInfoCard platform={platform} />

      {open && <DialogConfirm
        setOpen={setOpen}
        open={open}
        hanldleActionConfirm={hanldleActionConfirm}
        backupData={backupData}
        backupDataStatus={backupDataStatus}
      />}
      {loading &&
        <LoadingBackDrop
          loading={loading}
          text="Processing data...Please wait!!!"
          width='100%'
          height='100%'
          position='fixed'
          variant='determinate'
          progress={progress}
          setProgress={setProgress}
        />
      }
      {showJsonViewer.visible &&
        <DxPopupJsonVier
          open={showJsonViewer.visible}
          onClose={() => setShowJsonViewer({ visible: false, data: null })}
          data={showJsonViewer.data}
          enqueueSnackbar={enqueueSnackbar}
          currentLang={currentLang}
        />
      }
    </Stack>
  );
};

export default Settings;

function DialogConfirm({ setOpen, open, hanldleActionConfirm, backupData, backupDataStatus, }) {

  const { translate } = useLocales()
  const handleClose = () => {
    setOpen({ visible: false, type: null });
  };

  const isAllowBackup = (backupData.qc.length > 0 || backupData.compliance.length > 0 || backupData.mqc.length > 0);

  return (
    <Dialog onClose={handleClose} open={open.visible} fullWidth >
      <DialogTitle mb={2}>{open.type === 'BACKUP' ? 'Backup' : 'Clear Offline data'}</DialogTitle>
      <DialogContent sx={{ overflowX: 'hidden', overflowY: 'scroll', minWidth: 300 }}>
        <Stack spacing={1} mb={2}
        >
          {open.type === 'BACKUP' && backupDataStatus !== null &&
            <Typography variant='subtitle'>Status: {!backupDataStatus ? 'Done' : 'Available'}</Typography>
          }
          {open.type === 'BACKUP' && isAllowBackup &&
            <Typography variant='subtitle'>We have founded your backup data on device as below:</Typography>
          }

          {open.type === 'BACKUP' && !isAllowBackup &&
            <Typography variant='subtitle'>There is nothing for backup</Typography>
          }

          {open.type === 'BACKUP' && backupData.qc.length > 0 &&
            <Stack
              justifyContent='flex-start' >
              <Typography variant='subtext' fontWeight={'bold'}>QC: </Typography>
              {
                backupData.qc.map(data => <QCInspection data={data} key={data?.Id} />)
              }

            </Stack>
          }

          {open.type === 'BACKUP' && backupData.compliance.length > 0 &&
            <Stack justifyContent='flex-start'>
              <Typography variant='subtext' fontWeight={'bold'}>Compliance: </Typography>
              {
                backupData.compliance.map(data => <ComplianceIns data={data} key={data?.Id} />)
              }
            </Stack>
          }

          {open.type === 'BACKUP' && backupData.mqc.length > 0 &&
            <Stack justifyContent='flex-start'              >
              <Typography variant='subtext' fontWeight={'bold'}>MQC: </Typography>
              {
                backupData.mqc.map(data => < MQCInspection data={data} key={data?.Id} />)
              }
            </Stack>
          }

        </Stack>

        {open.type === 'BACKUP' && isAllowBackup &&
          <DialogContentText>{translate('message.action')}</DialogContentText>
        }

        {open.type !== 'BACKUP' &&
          <DialogContentText>{translate('message.action')}</DialogContentText>
        }

      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-evenly' }}>
        <Button color="info" variant='contained' onClick={handleClose} sx={{ minWidth: 120 }}>
          {translate('button.cancel')}
        </Button>
        <Button color="success" variant='contained' onClick={hanldleActionConfirm} disabled={!isAllowBackup && open.type === 'BACKUP'} sx={{ minWidth: 120 }}>
          {translate('button.yes')}
        </Button>
      </DialogActions>

    </Dialog>
  );
};


function QCInspection({ data }) {
  return (
    <Stack width="100%">
      <Stack direction="row" justifyContent="space-between">
        <Stack direction="column" justifyContent="flex-start">
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
          <Typography variant="caption" paragraph mb={0} whiteSpace='normal'>
            {`PO: ${data?.CustomerPO} - QTY: ${data?.Qty}`}
          </Typography>
        </Stack>
        <Stack direction="column" justifyContent="flex-end">
          <Typography variant="caption" paragraph fontWeight={'bold'} mb={0} mt={1}>
            {`Created date: ${moment(data?.CreatedDate).format('DD/MM/YYYY')}`}
          </Typography>
        </Stack>
      </Stack>
      <Divider sx={{ borderStyle: 'dashed', mt: 0.5, mb: 0.5 }} />
    </Stack>
  )
};


function ComplianceIns({ data }) {
  return (
    <Stack
      width="100%"
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        width="100%"
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
            {`Factory: ${data?.FactoryName}`}
          </Typography>
          <Typography variant="caption" paragraph mb={0}>
            {`Customer: ${data?.CustomerName || ''}`}
          </Typography>
          <Typography variant="caption" paragraph mb={0} whiteSpace="normal">
            {`Remark: ${data?.Remark || ''}`}
          </Typography>
        </Stack>
        <Stack direction="column" justifyContent="flex-end" alignItems={'flex-end'}>
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
          <Typography variant="caption" paragraph fontWeight={'bold'} mb={0} mt={1}>
            {`Audit From: ${moment(data?.AuditDateFrom).format('DD/MM/YYYY')}`}
          </Typography>
          <Typography variant="caption" paragraph fontWeight={'bold'} mb={0} mt={1}>
            {`Auditor: ${data?.AuditorName}`}
          </Typography>
        </Stack>
      </Stack>
      <Divider sx={{ borderStyle: 'dashed', mt: 0.5, mb: 0.5 }} />
    </Stack>
  )
};


function MQCInspection({ data }) {
  return (
    <Stack
      width="100%"
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        width="100%"
        p={1}
      >
        <Stack direction={'column'} justifyContent={'flex-start'}>
          <Typography
            variant="caption"
            paragraph
            fontWeight={'bold'}
            mb={0}
          >{`${data?.MQCInspectionTemplateSysNo} - ${data?.AuditorName}`}</Typography>
          <Typography
            variant="caption"
            paragraph
            mb={0}
          >{`Factory: ${data?.FactoryName}-${data?.SubFactoryName}`}</Typography>
          <Typography variant="caption" paragraph mb={0}>{`Customer: ${data?.CustomerName}`}</Typography>
          <Typography variant="caption" paragraph mb={0}>{`Art-Color: ${data?.ItemCode}-${data?.Color}`}</Typography>
        </Stack>
        <Stack direction={'column'} justifyContent={'flex-start'}>
          {data?.AuditingResult !== null && (
            <Label
              variant="ghost"
              color={
                data?.AuditingResult === 'Pass' || data?.AuditingResult === 'Pass With Condition' ? 'success' : 'error'
              }
            >
              {data?.AuditingResult}
            </Label>
          )}
        </Stack>
      </Stack>
      <Divider sx={{ borderStyle: 'dashed', mt: 0.5, mb: 0.5 }} />
    </Stack>
  );
};


function DxPopupJsonVier({ open = false, onClose = () => { }, data = null, enqueueSnackbar, currentLang }) {

  const [error, setError] = useState([]);
  const [source, setSource] = useState(data);

  useEffect(() => {
    if (data === null) return
    scanForError(data)
  }, [])

  const handleEditSrc = (e) => {
    scanForError(e.updated_src);
    setSource(e.updated_src);
  };

  const scanForError = (dbSource) => {
    const allValues = [];

    if (dbSource.qc.length > 0) {

      dbSource.qc.forEach(item => {
        const data = flatten(item);
        const newObj = Object.keys(data).reduce((acc, curr) => {
          if (data[curr] === undefined) {
            acc[curr] = data[curr];
            return acc;
          };
          if (typeof data[curr] === 'string') {
            // eslint-disable-next-line;
            if (data[curr].toLowerCase().includes('invalid date')) {
              acc[curr] = data[curr];
              return acc;
            }
          };
          return acc;
        }, {});

        if (Object.keys(newObj).length > 0) {
          newObj.type = 'QC'
          allValues.push(newObj);
        };
      })

    };

    if (dbSource.compliance.length > 0) {
      dbSource.compliance.forEach(item => {
        const data = flatten(item);
        const newObj = Object.keys(data).reduce((acc, curr) => {
          if (data[curr] === undefined) {
            acc[curr] = data[curr];
            return acc;
          };
          if (typeof data[curr] === 'string') {
            // eslint-disable-next-line;
            if (data[curr].toLowerCase().includes('invalid date')) {
              acc[curr] = data[curr];
              return acc;
            }
          };
          return acc;
        }, {});

        if (Object.keys(newObj).length > 0) {
          newObj.type = 'Compliance'
          allValues.push(newObj);
        };
      })
    };

    if (dbSource.mqc.length > 0) {
      dbSource.mqc.forEach(item => {
        const data = flatten(item);
        const newObj = Object.keys(data).reduce((acc, curr) => {
          if (data[curr] === undefined) {
            acc[curr] = data[curr];
            return acc;
          };
          if (typeof data[curr] === 'string') {
            // eslint-disable-next-line;
            if (data[curr].toLowerCase().includes('invalid date')) {
              acc[curr] = data[curr];
              return acc;
            }
          };

          return acc;
        }, {});

        if (Object.keys(newObj).length > 0) {
          newObj.type = 'MQC'
          allValues.push(newObj);
        };
      })
    };

    if (dbSource.attachments.length > 0) {
      dbSource.attachments.forEach(item => {
        const data = flatten(item);
        const newObj = Object.keys(data).reduce((acc, curr) => {
          if (data[curr] === undefined) {
            acc[curr] = data[curr];
            return acc;
          };
          if (typeof data[curr] === 'string') {
            // eslint-disable-next-line;
            if (data[curr].toLowerCase().includes('invalid date')) {
              acc[curr] = data[curr];
              return acc;
            }
          };
          return acc;
        }, {});

        if (Object.keys(newObj).length > 0) {
          newObj.type = 'Attachments'
          allValues.push(newObj);
        };
      })
    };

    setError(allValues);
  };

  const handleAddSrc = async (e) => {
    // console.log('add', e);
    setSource(e.updated_src)
  }

  const handleDeleteSrc = async (e) => {
    // console.log('delete', e);
    setSource(e.updated_src)
  }


  const handleSave = async () => {
    if (source.qc.length > 0) {
      source.qc.forEach(async item => {
        await db.MqcInspection.update(item.id, item);
      })
    }
    if (source.compliance.length > 0) {
      source.compliance.forEach(async item => {
        await complianceDB.Todo.update(item.id, item);
      })
    }
    if (source.mqc.length > 0) {
      source.mqc.forEach(async item => {
        await mqcDB.ToDo.update(item.id, item);
      })
    }
    if (source.attachments.length > 0) {
      source.attachments.forEach(async item => {
        await attachmentsDB.compliance.update(item.id, item);
      })
    }

    else {
      await Toast.show({
        text: 'There is no changes to save'
      })
    }
    enqueueSnackbar(currentLang.value === 'vn' ? 'Đã lưu' : "Data Saved")

  };

  const showConfirm = async () => {
    const { value } = await CapDialog.confirm({
      title: 'Confirm',
      message: `Are you sure you'd like to apply changes?`,
    });
    if (value) {
      handleSave()
    }
  };

  // console.log(source);


  return (
    <Popup visible={open}
      onHiding={onClose}
      title='Inspect data'
      width={'100%'}
      showCloseButton
      closeOnOutsideClickz
      height={'100%'}
    >
      <ScrollView
        width={'100%'}
        height={'100%'}
      >

        <Stack spacing={1} sx={{
          flexDirection: {
            xs: 'column',
            md: 'row'
          }
        }}>
          <Box sx={{
            position: 'relative', width: {
              xs: '100%',
              md: '30%'
            },
          }}>
            <Stack spacing={0.5}>
              <Button onClick={showConfirm} variant='contained' sx={{ maxWidth: 100 }}>
                {currentLang.value === 'vn' ? 'Lưu' : "Save"}
              </Button>

              {error.length > 0 &&
                <Box                >
                  <Stack spacing={1}>
                    <Typography variant='caption'>The app have found some fields that contained undefined/Invalid values. These fields may causes update faild when submiting to server. Please double check!</Typography>
                    {
                      error.map(e => <Typography variant='caption' color='red' key={Object.keys(e)[0]}>{e?.type}: {Object.keys(e).filter(d => d !== "type").join(',')}</Typography>)
                    }
                  </Stack>
                </Box>
              }
            </Stack>
          </Box>

          <ReactJson
            src={data}
            displayObjectSize
            displayDataTypes
            shouldCollapse
            collapsed
            collapseStringsAfterLength
            name="ToDo"
            enableClipboard
            // theme={'solarized'}
            onEdit={e => handleEditSrc(e)}
            // onAdd={e => handleAddSrc(e)}
            onDelete={e => handleDeleteSrc(e)}
          // onSelect={e => console.log('select', e)}
          />

        </Stack>
      </ScrollView>
    </Popup >
  )
};


const DeviceInfoCard = ({ isWebApp }) => {

  const { translate, currentLang } = useLocales();

  const title = currentLang.value === 'vn' ? "Id thiết bị" : 'Device Id';

  const handleCopy = async (deviceId) => {
    if (!isWebApp) {
      const data = await writeToClipboard(deviceId);
    } else {
      navigator.clipboard.writeText(deviceId);
      await Toast.show({
        text: 'Device ID copied! Send this to BIS team for device registration',
        duration: 'short',
        position: 'bottom'
      });
    }
  };

  const handleShare = async (uuid) => {
    const shareResult = await Share.share({
      dialogTitle: 'Divice Id share',
      title: 'Share you divice Id',
      text: uuid || 'N/A',
    });
  };

  const showActions = async () => {
    const id = await Device.getId();
    const result = await ActionSheet.showActions({
      title: currentLang.value === 'vn' ? `Id thiết bị: ${id.identifier}` : `Device Id: ${id.identifier}`,
      // message: currentLang.value === 'vn' ? "Id thiết bị của bạn là: " : 'Your device Id is: ',
      options: [
        {
          title: currentLang.value === 'vn' ? "Sao chép" : 'Copy',
        },
        {
          title: currentLang.value === 'vn' ? "Chia sẻ" : 'Share',
        },
        {
          title: currentLang.value === 'vn' ? "Đóng" : 'Close',
          style: ActionSheetButtonStyle.Destructive,
        },
      ],
    });

    if (result.index.toString() === '0') {
      handleCopy(id.identifier)
    }
    if (result.index.toString() === '1') {
      handleShare(id.identifier)
    }

  };

  return (
    <Card>
      <List
        disablePadding
        sx={{
          width: '100%',
          backgroundColor: 'grey.200',
          borderRadius: 1,
          p: 1,
        }}
        aria-labelledby="nested-list-subheader"
        subheader={
          <Typography id="nested-list-subheader" fontWeight='bold' variant='h5' mb={1}>
            {currentLang.value === 'vn' ? 'Thông tin thiết bị' : "Device information"}
          </Typography>
        }
      >

        <ListItem sx={{
          borderRadius: 5, backgroundColor: 'grey.200', minHeight: 50, "&:hover": {
            backgroundColor: 'primary.main', color: 'white'
          }
        }}
          onClick={showActions}
        >
          <ListItemIcon>
            <Iconify icon={IconName.id} />
          </ListItemIcon>
          <ListItemText primary={title} />
        </ListItem>

        <Divider variant="middle" component="li" sx={{ my: 0.5 }} />

      </List>
    </Card>
  )
};

const AppInfoCard = ({ platform }) => {

  const { translate, currentLang } = useLocales();
  const { updateInfo } = useSelector(store => store.setting);
  const title = currentLang.value === 'vn' ? "Phiên bản" : 'Version';

  const setShowAppInfo = async () => {
    let appVersion = '';
    if (platform !== 'web') {
      appVersion = (await App.getInfo()).version;
    }
    await CapDialog.alert({
      title: 'M System',
      message: `\nApplication name: M System\nPlatform: ${platform}\nVersion: ${appVersion}\nApp center version: ${updateInfo?.label || "Not found"}\nChange logs: ${updateInfo?.description || "No change logs"}`,
      buttonTitle: 'Ok',
    })
  };

  return (
    <Card>
      <List
        disablePadding
        sx={{
          width: '100%',
          backgroundColor: 'grey.200',
          borderRadius: 1,
          p: 1,
        }}
        aria-labelledby="nested-list-subheader"
        subheader={
          <Typography id="nested-list-subheader" fontWeight='bold' variant='h5' mb={1}>
            {currentLang.value === 'vn' ? 'Thông tin Ứng dụng' : "App information"}
          </Typography>
        }
      >

        <ListItem sx={{
          borderRadius: 5, backgroundColor: 'grey.200', minHeight: 50, "&:hover": {
            backgroundColor: 'primary.main', color: 'white'
          }
        }}
          onClick={setShowAppInfo}
        >
          <ListItemIcon>
            <Iconify icon={IconName.version} />
          </ListItemIcon>
          <ListItemText primary={title} />
        </ListItem>


        <Divider variant="middle" component="li" sx={{ my: 0.5 }} />

      </List>
    </Card>
  )
};




// FUNCTI0N FOR EXPORT DATA FROM DB
function asyncOperation(db) {
  return new Promise(resolve => {
    // Simulating asynchronous operation (e.g., fetching data)
    setTimeout(async () => {
      console.log(`Processed db: ${db?.exportName}`);
      const dbData = await db.dbName.toArray((array) => array);
      resolve(dbData);
    }, 200);
    // Adjust the timeout as needed
  });
}




async function processArray(allDb = [], setProgress = () => { }) {
  /* eslint-disable */
  let postData = {
    qc: [],
    compliance: [],
    mqc: [],
    attachments: [],
    attachmentsQc: [],
  };

  for (const db of allDb) {
    const dbArray = await asyncOperation(db);
    // db.data = dbArray;
    postData[db.exportName] = dbArray
    if (setProgress) {
      setProgress(pre => {
        return { ...pre, current: pre.current + 1 }
      })
    }
  }

  // Code here will only run after all items have been processed
  console.log('All items processed.');
  return postData
};



// FUNCTI0N FOR IMPORT DATA INTO DB
function asyncImport(db) {
  return new Promise(resolve => {
    // Simulating asynchronous operation (e.g., fetching data)
    setTimeout(async () => {
      console.log(`Processed import db: ${db?.exportName}`);
      const dbData = await db.dbName.bulkAdd(db.data);
      resolve(dbData);
    }, 200);
    // Adjust the timeout as needed
  });
}




async function processImportArray(allDb = [], setProgress = () => { }) {
  /* eslint-disable */
  for (const db of allDb) {
    if (db.data.length > 0) {
      const dbArray = await asyncImport(db);
    }
    // db.data = dbArray;
    if (setProgress) {
      setProgress(pre => {
        return { ...pre, current: pre.current + 1 }
      })
    }
  };
  // Code here will only run after all items have been processed
  console.log('All items processed.');
  return 'Import Done';
};
