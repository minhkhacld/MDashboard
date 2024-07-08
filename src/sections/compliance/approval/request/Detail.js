import { yupResolver } from '@hookform/resolvers/yup';
import moment from 'moment';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
// @mui
import { Box, Card, Divider, Grid, Stack, TextField, Typography, useTheme } from '@mui/material';
// yup
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';
// devextreme
import { List } from 'devextreme-react/list';
import fx from 'devextreme/animation/fx';
// React hooks
import { useMemo, useState } from 'react';
import useLocales from '../../../../hooks/useLocales';
import useResponsive from '../../../../hooks/useResponsive';
// sections
import CommandWidget from '../ComandWidget';
import ApproveDrawer from '../Drawer';
// components
import Iconify from '../../../../components/Iconify';
import ProductStepper from '../../../../components/Stepper';
import { FormProvider, RHFTextField } from '../../../../components/hook-form/index';
import { HEADER } from '../../../../config';
import IconName from '../../../../utils/iconsName';
import PopUpContents from './PopUpContents';
// Guard
import useToggle from '../../../../hooks/useToggle';
// redux
import { useSelector } from '../../../../redux/store';

Detail.propTypes = {
  currentRequest: PropTypes.object,
  state: PropTypes.object,
  reduxData: PropTypes.object,
  name: PropTypes.string,
  navigate: PropTypes.func,
  setSubmitted: PropTypes.func,
  WFInstance: PropTypes.object,
};

export default function Detail({ currentRequest, state, name, navigate, setSubmitted, WFInstance }) {
  // components state
  const [lines, setLines] = useState(currentRequest?.Lines || []);
  const [isViewOnly, setIsViewOnly] = useState(true);
  const [modalContent, setModalContent] = useState({
    visible: false,
    item: null,
    isAddNew: false,
  });
  const { toggle: open, setToggle } = useToggle();
  const [deleteModal, setDeleteModal] = useState(false);
  // console.log(lines);
  const mdUp = useResponsive('up', 'md');
  const smUp = useResponsive('up', 'sm');
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const reduxData = useSelector((store) => store.compliance);
  const { translate } = useLocales();

  const defaultValues = useMemo(
    () => ({
      DocNo: currentRequest?.SysNo || '',
      StartAuditDate: moment(currentRequest?.RequestDate).format('yyyy-MM-DD'),
      Title: currentRequest?.Title || '',
      Auditor: currentRequest?.AuditorName || '',
      AuditorId: currentRequest?.AuditorId || '',
      AuditTime: state?.AuditTime || '',
      AuditTimeId: currentRequest?.AuditTimeId || '',
    }),
    [currentRequest]
  );

  const stepScheme = Yup.object().shape({
    DocNo: Yup.string(),
    StartAuditDate: Yup.string().required('Start Audit Date is required'),
    Title: Yup.string(),
    Auditor: Yup.string(),
    AuditTime: Yup.string(),
  });

  const methods = useForm({
    resolver: yupResolver(stepScheme),
    defaultValues,
  });

  const {
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = methods;

  const values = watch();

  const handleUpdateLine = (data) => {
    setModalContent({ visible: true, isAddNew: false, item: data });
  };


  // RENDER LIST
  const itemTemplate = (data) => {
    // console.log(data);

    return (
      <>
        {data?.ThirdParty !== undefined && reduxData !== undefined ? (
          <Stack
            direction="row"
            justifyContent="space-between"
            pl={smUp ? 1 : 0}
            onClick={() => handleUpdateLine(data)}
          >
            <Stack direction="column" justifyContent="flex-start">
              <Typography variant="caption" paragraph color="black" fontWeight={'bold'} mb={0}>
                {data?.ThirdParty ? 'THIRD PARTY' : 'INTERNAL'}
              </Typography>
              <Typography variant="caption" paragraph mb={0}>
                {`${data?.AuditTypeId !== null
                  ? reduxData?.AuditType[0].Elements.filter((item) => item.Value === data?.AuditTypeId)[0].Caption
                  : null
                  }-${data?.SubFactoryName || data?.FactoryName || "N/A"}`}
              </Typography>
              {/* <Typography variant="caption" paragraph mb={0}>
                Product Line:{' '}
                {`${reduxData?.ProductLine[0].Elements.filter((item) => item.Value === data?.ProductLineId)[0].Caption
                  }`}
              </Typography>
              <Typography variant="caption" paragraph mb={0}>
                Product Group:{' '}
                {`${reduxData?.ProductGroup[0].Elements.filter((item) => item.Value === data?.ProductGroupId)[0].Caption
                  }`}
              </Typography> */}
              <Typography variant="caption" paragraph mb={0}>
                Division: {data?.DivisionName}
              </Typography>
            </Stack>
          </Stack>
        ) : (
          translate('noDataText')
        )}
      </>
    );
  };

  const BREAKCRUM_HEIGHT = 78;
  const STEP_HEADER_HEIGHT = 88;
  const TAB_HEIGHT = 48;
  const BUTTON_GROUP = 34;
  const SPACING = 30;
  const INFO_CARD = 281;

  if (reduxData?.AuditTime !== null) {
    return (
      <Stack spacing={1} sx={{ height: '100%' }}>
        <ProductStepper WFInstance={WFInstance} />
        <CommandWidget open={open} setToggle={setToggle} />
        {open && <ApproveDrawer open={open} setToggle={setToggle} WFInstance={WFInstance} />}
        <FormProvider methods={methods}>
          <Card sx={{ p: 1 }}>
            <Box sx={{ p: 1 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={12}>
                  <Typography variant="caption" color="black" fontWeight={'bold'}>
                    {translate('Compliance Request Info')}
                  </Typography>
                  <Divider sx={{ p: 1 }} />
                </Grid>
                <Grid item xs={6} md={6}>
                  <RHFTextField
                    name="DocNo"
                    size="small"
                    label={translate('Doc No')}
                    rows={2}
                    disabled
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>

                <Grid item xs={!state?.isAddNew ? 6 : 12} md={!state?.isAddNew ? 6 : 12}>
                  <RHFTextField
                    name="StartAuditDate"
                    size="small"
                    label={translate('Start Audit Date')}
                    rows={4}
                    disabled
                    type="date"
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={12}>
                  <RHFTextField
                    name="Title"
                    size="small"
                    label={translate('Title')}
                    rows={4}
                    disabled
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
                <Grid item xs={6} md={6}>
                  <RHFTextField
                    name="Auditor"
                    label="Auditor"
                    rows={4}
                    disabled
                    size="small"
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
                <Grid item xs={6} md={6}>
                  <RHFTextField
                    name="AuditTime"
                    label="Audit Time"
                    rows={4}
                    disabled
                    size="small"
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
          </Card>

          {/* <Box sx={{ height: '100%', p: 1 }}> */}
          <Card
            sx={{
              height: {
                xs: `calc(100vh - ${HEADER.MOBILE_HEIGHT + SPACING + STEP_HEADER_HEIGHT + BUTTON_GROUP + INFO_CARD}px)`,
                md: `calc(100vh - ${HEADER.MOBILE_HEIGHT + SPACING + STEP_HEADER_HEIGHT + BUTTON_GROUP + INFO_CARD}px)`,
                lg: `calc(100vh - ${HEADER.DASHBOARD_DESKTOP_HEIGHT + SPACING + STEP_HEADER_HEIGHT + BUTTON_GROUP + INFO_CARD
                  }px)`,
              },
              minHeight: '35vh',
            }}
          >
            <Box sx={{ p: 1 }}>
              <Stack sx={{ p: 1 }}>
                <Grid container spacing={3}>
                  <Grid item xs={8} md={6}>
                    <Typography variant="caption" color="black" fontWeight={'bold'}>
                      {translate('Compliance Request Details')}
                    </Typography>
                  </Grid>
                </Grid>

                {lines?.length > 0 ? <Divider sx={{ p: 1 }} /> : <></>}
              </Stack>
              <List
                dataSource={lines.filter((item) => item.DBAction !== 'Delete')}
                itemRender={itemTemplate}
                // height={smUp ? '54vh' : '40vh'}
                height={`calc(100vh - ${HEADER.MOBILE_HEIGHT + SPACING + STEP_HEADER_HEIGHT + BUTTON_GROUP + INFO_CARD + TAB_HEIGHT
                  }px)`}
                scrollingEnabled
                searchMode={'contains'}
                noDataText={translate('noDataText')}
                focusStateEnabled={false}
                onInitialized={(e) => {
                  fx.off = true;
                }}
                onContentReady={(e) => {
                  setTimeout(() => {
                    fx.off = false;
                  }, 2000);
                }}
                refreshingText="Refreshing..."
                pageLoadingText="Loading..."
                pageLoadMode="scrollBottom"
                selectionMode="multiple"
                showScrollbar={'onScroll'}
              />
            </Box>
          </Card>
          {/* </Box> */}
        </FormProvider>
        {modalContent.visible ? (
          <PopUpContents
            modalContent={modalContent}
            setModalContent={setModalContent}
            translate={translate}
            reduxData={reduxData}
            smUp={smUp}
            mdUp={mdUp}
            isViewOnly={isViewOnly}
          />
        ) : null}
        {/* {deleteModal ? (
        <PopupConfirm
          title={'Delete Detail'}
          visible={deleteModal}
          onClose={() => setDeleteModal(!deleteModal)}
          onProcess={handleDelete}
          description={'Are you sure to delete this detail?'}
        />
      ) : null} */}
      </Stack>
    );
  }
  return null;
}

// Render Input
const RenderInput = ({ params, label }) => {
  RenderInput.propTypes = {
    params: PropTypes.object,
    label: PropTypes.node,
  };
  return (
    <TextField
      {...params}
      fullWidth
      onFocus={(event) => {
        event.target.select();
      }}
      size="small"
      label={
        <Stack direction="row" justifyContent="center" alignItems="center">
          <Iconify icon={IconName.search} />
          <p className="ml-1">{label}</p>
        </Stack>
      }
      InputLabelProps={{
        style: { color: 'var(--label)' },
        shrink: true,
      }}
    />
  );
};
