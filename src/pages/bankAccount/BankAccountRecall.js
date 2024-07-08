import { Capacitor } from '@capacitor/core';
import { LoadPanel, Position } from 'devextreme-react/load-panel';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
// notistack
// @mui
import {
  Box,
  Button,
  Card,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
// devextreme
import { List, SearchEditorOptions } from 'devextreme-react/list';
// Redux
import Page from '../../components/Page';
import { useSelector } from '../../redux/store';
// routes
import { PATH_APP } from '../../routes/paths';
// hooks
import useLocales from '../../hooks/useLocales';
import useSettings from '../../hooks/useSettings';
// components
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import NoItemsBanner from '../../components/NoItemsBanner';
import { HEADER, NOTCH_HEIGHT } from '../../config';
import useResponsive from '../../hooks/useResponsive';
import axios from '../../utils/axios';
// ENtityList

// ----------------------------------------------------------------------
// const PAGE_TAB_KEY = 'APPROVAL_PENDING';

const BREAKCRUM_HEIGHT = 40;
const SPACING = 32;
const TAB_HEIGHT = 48;


export default function BankAccountRecall() {
  // Hooks
  const { translate } = useLocales();
  const { themeStretch } = useSettings();
  const { enqueueSnackbar } = useSnackbar();
  const smUp = useResponsive('up', 'sm');
  const mdUp = useResponsive('up', 'md');
  const lgUp = useResponsive('up', 'lg');
  const theme = useTheme()
  // redux
  const { LoginUser } = useSelector((store) => store.workflow);

  // components state
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);

  const [recallModal, setRecallModal] = useState({
    visible: null,
    itemData: null,
    itemIndex: null,
  });

  const getDataSource = () => {
    return axios.get('/api/BankAccountApi/GetApprovalAll', {
      params: {
        filter: JSON.stringify([
          ['SubmitterEmplId', '=', LoginUser?.EmpId],
          'and',
          ['Status', '<>', 'Done'],
          'and',
          ['WaitingFor', '<>', LoginUser?.EmpKnowAs],
        ]),
        requireTotalCount: true,
        pageSize: 5,
        // sort: JSON.stringify([{ selector: 'Type', desc: false }]),
        // group: JSON.stringify([{ selector: 'Legal', desc: false, isExpanded: false }]),
      },
    });
  };

  const handleSetDataSource = () => {
    setLoading(true);
    getDataSource()
      .then((result) => {
        setDataSource(result.data);
        // console.log(result.data)
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    handleSetDataSource();
  }, []);

  useEffect(() => {
    const listPlanning = document.getElementById('list-planing');
    const breacrumb = document.getElementById('header-breacrumb');
    if (listPlanning !== null && listPlanning !== undefined) {
      listPlanning.style.height = `${window.screen.height - (lgUp ? 280 : HEADER.MOBILE_HEIGHT) - breacrumb.getBoundingClientRect().height - 80
        }px`;
    }
  }, [dataSource]);

  const handleOpenModal = (row) => {
    // console.log(row);
    setRecallModal({
      visible: true,
      itemData: row.itemData,
      itemIndex: row.itemIndex,
    });
  };

  // RENDER LIST
  const itemTemplate = (data) => {
    // console.log(data);
    return (
      <Stack direction="row" justifyContent="space-between">
        <Grid container spacing={1}>
          <Grid item xs={12} md={12}>
            <Typography variant="caption" paragraph color="black" fontWeight={'bold'} mb={0}>
              {data?.SysNo}
            </Typography>
          </Grid>
          <Grid item xs={4} md={2}>
            <Typography variant="caption" paragraph mb={0}>
              Benificiary Name:
            </Typography>
          </Grid>
          <Grid item xs={8} md={10}>
            <Typography
              variant="caption"
              paragraph
              mb={0}
              sx={{ wordBreak: 'break-word' }}
              whiteSpace={'normal'}
            >{` ${data?.OwnerName}`}</Typography>
          </Grid>
          <Grid item xs={4} md={2}>
            <Typography variant="caption" paragraph mb={0}>
              Suggested by:
            </Typography>
          </Grid>
          <Grid item xs={8} md={10}>
            <Typography variant="caption" paragraph mb={0}>
              {` ${data?.SubmitterKnowAs}`}
            </Typography>
          </Grid>
        </Grid>
      </Stack>
    );
  };

  const ANDROID_KEYBOARD = Capacitor.getPlatform() === 'android' ? 16 : 0;
  const IOS_KEYBOARD = Capacitor.getPlatform() === 'ios' ? 16 : 0;


  return (
    <Page title={translate('bankAccount_recall')}>
      <Container maxWidth={themeStretch ? false : 'lg'} sx={{ position: mdUp ? 'relative' : 'fixed' }}>
        <HeaderBreadcrumbs
          heading={translate('bankAccount_recall')}
          links={[{ name: translate('home'), href: PATH_APP.general.app }, { name: translate('bankAccount_recall') }]}
        />
        <Card sx={{
          minHeight: '70vh',
          height: {
            xs: `calc(100vh - ${HEADER.MOBILE_HEIGHT + BREAKCRUM_HEIGHT + SPACING + ANDROID_KEYBOARD + IOS_KEYBOARD + NOTCH_HEIGHT}px)`,
            sm: `calc(100vh - ${HEADER.MOBILE_HEIGHT + BREAKCRUM_HEIGHT + SPACING + ANDROID_KEYBOARD + IOS_KEYBOARD + NOTCH_HEIGHT}px)`,
            lg: `calc(100vh - ${HEADER.DASHBOARD_DESKTOP_HEIGHT + BREAKCRUM_HEIGHT + SPACING + ANDROID_KEYBOARD + IOS_KEYBOARD + NOTCH_HEIGHT}px)`,
          },
        }} id="aprroval-card">
          {dataSource.data && dataSource.data.length > 0 ? (
            <Box sx={{ p: 1 }}>
              <List
                dataSource={dataSource.data}
                itemRender={itemTemplate}
                searchExpr={['OwnerName', 'SysNo', 'Id', 'Requested']}
                {...theme.breakpoints.only('lg') && { height: `calc(100vh - ${HEADER.DASHBOARD_DESKTOP_HEIGHT + BREAKCRUM_HEIGHT + SPACING + ANDROID_KEYBOARD + TAB_HEIGHT + IOS_KEYBOARD + NOTCH_HEIGHT}px)` }}
                {...theme.breakpoints.only('md') && { height: `calc(100vh - ${HEADER.MOBILE_HEIGHT + BREAKCRUM_HEIGHT + SPACING + ANDROID_KEYBOARD + TAB_HEIGHT + IOS_KEYBOARD + NOTCH_HEIGHT}px)` }}
                {...theme.breakpoints.only('xs') && { height: `calc(100vh - ${HEADER.MOBILE_HEIGHT + BREAKCRUM_HEIGHT + SPACING + ANDROID_KEYBOARD + TAB_HEIGHT + IOS_KEYBOARD + NOTCH_HEIGHT}px)` }}
                height={'inherit'}
                searchEnabled
                searchMode={'contains'}
                noDataText={translate('noDataText')}
                focusStateEnabled={false}
                collapsibleGroups
                pageLoadMode="scrollBottom"
                itemDeleteMode="toggle"
                onItemClick={(e) => handleOpenModal(e)}
              >
                <SearchEditorOptions placeholder={`${translate('search')} Sys No, Benificiary Name, Suggester`} />
              </List>
            </Box>
          ) : null}
          {dataSource.data && dataSource.data.length === 0 && !loading ? (
            <NoItemsBanner title="No pending request for recalling" />
          ) : null}
        </Card>
        {loading && (
          <LoadPanel hideOnOutsideClick message="Please, wait..." visible={loading} onHidden={() => setLoading(false)}
            showPane={false}
          // position='center'
          >
            <Position my="center" at="center" of="#aprroval-card" />
          </LoadPanel>
        )}
        {/* // Recalll modal */}
        {recallModal.visible ? (
          <RecallDialog
            recallModal={recallModal}
            setRecallModal={setRecallModal}
            LoginUser={LoginUser}
            enqueueSnackbar={enqueueSnackbar}
            handleSetDataSource={handleSetDataSource}
            source={dataSource}
            setSource={setDataSource}
          />
        ) : null}
      </Container>
    </Page>
  );
}

const RecallDialog = ({
  recallModal,
  setRecallModal,
  LoginUser,
  enqueueSnackbar,
  handleSetDataSource,
  source,
  // setSource,
  // setCurrentTab,
}) => {
  // Props
  RecallDialog.propTypes = {
    recallModal: PropTypes.object,
    setRecallModal: PropTypes.func,
    LoginUser: PropTypes.object,
    enqueueSnackbar: PropTypes.func,
    handleSetDataSource: PropTypes.func,
    source: PropTypes.object,
  };
  // console.log(source);

  const handleClose = () => {
    setRecallModal({
      ...recallModal,
      visible: false,
      itemData: null,
    });
  };

  const [loading, setLoading] = useState(false);

  const countRemainItems = source.legal?.data.find((d) => d.key === source.currentLegal)?.count || 0;
  const handleRecall = async () => {
    setLoading(true);
    await axios
      .get(`/api/AttachmentApi/${recallModal.itemData.Guid}/attachments`)
      .then(async (res) => {
        // console.log(res);
        if (res.data) {
          const recallData = {
            ActionId: recallModal.itemData.WFStatusActionId,
            LoginUserId: LoginUser.UserId,
            FRReportParams: res.data,
            wfIntanceId: recallModal.itemData.WFId,
          };
          // console.log(recallData);
          await axios
            .get(
              `/api/WorkflowApi/ExecuteAction?wfinstanceid=${recallData.wfIntanceId}&actionid=${recallData.ActionId}`
            )
            .then(() => {
              setLoading(false);
              enqueueSnackbar('Recall sucessfully', {
                variant: 'success',
                anchorOrigin: {
                  vertical: 'top',
                  horizontal: 'center',
                },
              });
              if (countRemainItems === 1) {
                // setCurrentTab(source.legal.data[0].key);
                // setSource({ ...source, currentLegal: source.legal.data[0].key });
              }
              handleSetDataSource();
              setRecallModal({
                ...recallData,
                visible: false,
                itemData: null,
              });
            })
            .catch((err) => {
              setLoading(false);
              console.error(err);
              enqueueSnackbar('Recall error', {
                variant: 'error',
                anchorOrigin: {
                  vertical: 'top',
                  horizontal: 'center',
                },
              });
            });
        }
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
        enqueueSnackbar('Recall error', {
          variant: 'error',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'center',
          },
        });
      });
  };

  return (
    <Dialog open={recallModal.visible} onClose={handleClose} aria-labelledby="responsive-dialog-title">
      <DialogTitle id="responsive-dialog-title">{`Recall payment approval?`}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure that you want to recall {`Sys No : ${recallModal.itemData.SysNo}`}?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={() => handleRecall()} disabled={loading} autoFocus color="error">
          {loading ? 'Recalling' : 'Recall now'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
