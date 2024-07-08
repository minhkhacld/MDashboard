import { yupResolver } from '@hookform/resolvers/yup';
import { useLiveQuery } from 'dexie-react-hooks';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
// devextreme
import { Popup } from 'devextreme-react';
// @mui
import { Box, Card, Grid, Stack, Tab, Tabs, Typography, useTheme } from '@mui/material';
// Redux
import { LoadingButton } from '@mui/lab';
// routes
// hooks
import { FormProvider } from '../../components/hook-form/index';
import useResponsive from '../../hooks/useResponsive';
import useSettings from '../../hooks/useSettings';
// components
import FloatButton from '../../components/button/FloatButton';
import PopupConfirm from '../../components/PopupConfirm';
import DefectDetail from './DefectDetail';
// CONFIG
import Scrollbar from '../../components/Scrollbar';
import { HEADER } from '../../config';
import { attachmentsDB, mqcDB } from '../../Db';
import DefectList from '../../sections/mqc/FabricDetails/DefectList';
import RollInfo from '../../sections/mqc/FabricDetails/RollInfo';
import IconName from '../../utils/iconsName';

FabricInspectionDetails.propTypes = {
  modalContent: PropTypes.object,
  setModalContent: PropTypes.func,
  isViewOnly: PropTypes.bool,
  onSave: PropTypes.func,
  lines: PropTypes.array,
  setIsSavedStatus: PropTypes.func,
  fieldForRules: PropTypes.object,
  AttachmentsData: PropTypes.array,
};

function FabricInspectionDetails({
  modalContent,
  setModalContent,
  isViewOnly,
  onSave,
  lines,
  setIsSavedStatus,
  fieldForRules,
  translate,
  AttachmentsData,
}) {
  // hook
  const [currentTab, setCurrentTab] = useState('1');
  const [currentTodoItem, setCurrentTodoItem] = useState();
  const [modalDefect, setModalDefect] = useState({ visible: false, item: null, isAddNew: false });
  const [deleteModal, setDeleteModal] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [formField, setFormField] = useState();
  const { enqueueSnackbar } = useSnackbar();
  // indexedDB
  const AuditingResultFromLocal =
    useLiveQuery(() => mqcDB?.Enums.where('Name').equals('AuditingResult').toArray()) || [];
  const AuditingResult = AuditingResultFromLocal[0]?.Elements;
  // theme
  const theme = useTheme();
  const { themeStretch } = useSettings();
  const mdUp = useResponsive('up', 'md');
  const smUp = useResponsive('up', 'sm');
  // route
  const naviagte = useNavigate();

  // Menu
  const TABS = [
    {
      label: 'Roll Info',
      value: '1',
    },
    {
      label: 'Defect List',
      value: '2',
    },
  ];

  const handleChangeTab = (e, newValue) => {
    setCurrentTab(newValue);
  };

  // form
  const isAddNew = modalContent?.isAddNew && currentTodoItem?.id === undefined && currentTodoItem?.Id === undefined;

  const defaultValues = useMemo(
    () => ({
      ActQuantity: '',
      ActualWidth: '',
      QIMaterialFabricRatings: [],
      Remark: '',
      RollNo: '',
      RollPenaltyPoint: '',
      StickerQuantity: '',
      StickerWidth: '',
    }),
    []
  );

  const TodoInfoScheme = Yup.object().shape({
    ActQuantity: Yup.string().required('ActQuantity is required'),
    ActualWidth: Yup.string().required('ActualWidth is required'),
    StickerQuantity: Yup.string(),
    StickerWidth: Yup.string(),
    RollNo: Yup.string()
      .required('RollNo is required')
      .transform((curr, orig) => (orig === null ? '' : curr)),
  });

  const methods = useForm({
    resolver: yupResolver(TodoInfoScheme),
    defaultValues,
  });

  const calculateRollPenaltyPoint = (QIMaterialFabricRatings) => {
    const P1P2P3P4 = [0, 0, 0, 0];
    const lines = QIMaterialFabricRatings;
    lines?.map((value) => {
      if (!value?.IsDeleted) {
        P1P2P3P4[0] += Number(value?.P1 || 0);
        P1P2P3P4[1] += Number(value?.P2 || 0);
        P1P2P3P4[2] += Number(value?.P3 || 0);
        P1P2P3P4[3] += Number(value?.P4 || 0);
      }
      return value;
    });
    return P1P2P3P4[0] * 1 + P1P2P3P4[1] * 2 + P1P2P3P4[2] * 3 + P1P2P3P4[3] * 4;
  };

  const calculateTotalPenaltyQuantity = (QIMaterialFabricLines) => {
    const TotalRollPenaltyPoint = QIMaterialFabricLines?.map((value) =>
      value?.RollPenaltyPoint !== '' && value?.RollPenaltyPoint !== null && !value?.IsDeleted
        ? Number(value?.RollPenaltyPoint)
        : 0
    ).reduce((a, b) => a + b, 0);
    let TotalActQuantity = QIMaterialFabricLines?.map((value) =>
      value?.ActQuantity !== '' && value?.ActQuantity !== null && !value?.IsDeleted ? Number(value?.ActQuantity) : 0
    ).reduce((a, b) => a + b, 0);
    let TotalActualWidth = QIMaterialFabricLines?.map((value) =>
      value?.ActualWidth !== '' && value?.ActualWidth !== null && !value?.IsDeleted ? Number(value?.ActualWidth) : 0
    ).reduce((a, b) => a + b, 0);
    TotalActQuantity = TotalActQuantity === 0 ? 1 : Number(TotalActQuantity);
    TotalActualWidth = TotalActualWidth === 0 ? 1 : Number(TotalActualWidth);
    return Number(((TotalRollPenaltyPoint / TotalActQuantity) * ((100 * 100) / TotalActualWidth)).toFixed(0));
  };

  const {
    handleSubmit,
    setError,
    formState: { isSubmitting, errors },
    watch,
  } = methods;

  const values = watch();

  const onClose = () => {
    setModalContent({ visible: false, item: null, isAddNew: false });
  };

  // Call api here
  useEffect(() => {
    setCurrentTodoItem(modalContent?.item || values);
  }, [modalContent]);

  useEffect(() => {
    setIsSaved(false);
  }, [isSaved]);

  // Variable for responsive
  const BREAKCRUM_HEIGHT = 41;
  const SPACING = 24;
  const ANDROID_KEYBOARD = 0;
  const TAB_HEIGHT = 48;
  const BACK_BUTTON_HEIGHT = 42;
  const SUBMIT_BUTTON = 52;

  const handleSave = async () => {
    if (isAddNew) {
      const newLines = [...lines];
      const idList = newLines?.map((value) => {
        if (value?.id) {
          return value?.id;
        }
        return value?.Id;
      });
      const minId = idList ? Math.min(...idList) : 1;
      const currentId = minId >= 0 ? -1 : minId - 1;
      const RollPenaltyPoint = calculateRollPenaltyPoint(currentTodoItem?.QIMaterialFabricRatings || []);
      const newValue = {
        ...values,
        id: currentId,
        QIMaterialFabricRatings: currentTodoItem?.QIMaterialFabricRatings || [],
        RollPenaltyPoint,
      };
      newLines?.push(newValue);
      const TotalPenaltyQuantity = calculateTotalPenaltyQuantity(newLines);
      const checkRulesForAuditResult = TotalPenaltyQuantity <= fieldForRules?.MaxPenaltyQuantity;
      await onSave({
        QIMaterialFabricLines: newLines,
        TotalPenaltyQuantity,
        AuditingResult: checkRulesForAuditResult ? 'Pass' : 'Fail',
        AuditingResultId: checkRulesForAuditResult
          ? AuditingResult?.find((result) => result?.Caption === 'Pass')?.Value
          : AuditingResult?.find((result) => result?.Caption === 'Fail')?.Value,
      })
        .then(() => {
          setCurrentTodoItem(newValue);
          enqueueSnackbar(translate('mqc.saveSuccess'), {
            variant: 'success',
            anchorOrigin: {
              vertical: 'top',
              horizontal: 'center',
            },
          });
        })
        .catch((e) => {
          console.log(e);
          enqueueSnackbar(translate('mqc.error.saveError'), {
            variant: 'error',
            anchorOrigin: {
              vertical: 'top',
              horizontal: 'center',
            },
          });
        });
    } else {
      const newValue = lines?.map((value) => {
        if (
          (value?.Id === currentTodoItem?.Id && currentTodoItem?.Id !== undefined) ||
          (value?.id === currentTodoItem?.id && currentTodoItem?.id !== undefined)
        ) {
          const RollPenaltyPoint = calculateRollPenaltyPoint(currentTodoItem?.QIMaterialFabricRatings);
          return {
            ...value,
            ...values,
            RollPenaltyPoint,
            QIMaterialFabricRatings: currentTodoItem?.QIMaterialFabricRatings,
          };
        }
        return value;
      });
      const TotalPenaltyQuantity = calculateTotalPenaltyQuantity(newValue);

      const checkRulesForAuditResult = TotalPenaltyQuantity <= fieldForRules?.MaxPenaltyQuantity;

      await onSave({
        QIMaterialFabricLines: newValue,
        TotalPenaltyQuantity,
        AuditingResult: checkRulesForAuditResult ? 'Pass' : 'Fail',
        AuditingResultId: checkRulesForAuditResult
          ? AuditingResult?.find((result) => result?.Caption === 'Pass')?.Value
          : AuditingResult?.find((result) => result?.Caption === 'Fail')?.Value,
      })
        .then(() => {
          setCurrentTodoItem(
            newValue?.find(
              (value) =>
                (value?.Id === currentTodoItem?.Id && currentTodoItem?.Id !== undefined) ||
                (value?.id === currentTodoItem?.id && currentTodoItem?.id !== undefined)
            )
          );
          enqueueSnackbar(translate('mqc.saveSuccess'), {
            variant: 'success',
            anchorOrigin: {
              vertical: 'top',
              horizontal: 'center',
            },
          });
        })
        .catch((e) => {
          console.log(e);
          enqueueSnackbar(translate('mqc.error.saveError'), {
            variant: 'error',
            anchorOrigin: {
              vertical: 'top',
              horizontal: 'center',
            },
          });
        });
    }
  };

  const handleDelete = async () => {
    try {
      const newValue = [...lines];
      const index = newValue.indexOf(
        lines?.find(
          (value) =>
            (value?.Id === currentTodoItem?.Id && currentTodoItem?.Id !== undefined) ||
            (value?.id === currentTodoItem?.id && currentTodoItem?.id !== undefined)
        )
      );
      if (newValue[index]?.id) {
        newValue?.splice(index, 1);
      } else {
        newValue[index] = { ...newValue[index], IsDeleted: true };
      }
      // delete attachments
      lines[index]?.QIMaterialFabricRatings?.map((rating) => {
        rating?.Images?.map((img) => {
          attachmentsDB?.mqc.where('id').equals(img?.id).delete();
          return img;
        });
        return rating;
      });
      const TotalPenaltyQuantity = calculateTotalPenaltyQuantity(newValue.filter((value) => value?.IsDeleted !== true));
      await onSave({ QIMaterialFabricLines: newValue, TotalPenaltyQuantity })
        .then(() => {
          setIsSavedStatus(true);
          onClose();
          enqueueSnackbar(translate('mqc.deleteSuccess'), {
            variant: 'success',
            anchorOrigin: {
              vertical: 'top',
              horizontal: 'center',
            },
          });
        })
        .catch((e) => {
          console.log(e);
          enqueueSnackbar(translate('mqc.error.deleteError'), {
            variant: 'error',
            anchorOrigin: {
              vertical: 'top',
              horizontal: 'center',
            },
          });
        });
    } catch (e) {
      console.log(e);
      enqueueSnackbar(translate('mqc.error.deleteError'), {
        variant: 'error',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center',
        },
      });
    }
  };

  const onError = (e) => {
    Object.keys(e).map((key) => {
      if (e[key] !== undefined && e[key].message !== undefined) {
        enqueueSnackbar(translate('mqc.error.required'), {
          variant: 'error',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'center',
          },
        });
        return;
      }
      return null;
    });
  };

  return (
    <Popup
      visible={modalContent.visible}
      onHiding={onClose}
      dragEnabled={false}
      hideOnOutsideClick={false}
      showCloseButton
      showTitle
      title={'Fabric Inspection Details'}
      // container=".dx-viewport"
      width={mdUp ? 700 : '100%'}
      height={mdUp ? '100%' : '100%'}
      animation={{
        show: {
          type: 'fade',
          duration: 400,
          from: 0,
          to: 1,
        },
        hide: {
          type: 'fade',
          duration: 400,
          from: 1,
          to: 0,
        },
      }}
    >
      <Stack spacing={3} sx={{ paddingBottom: 20 }}>
        <Card
          id="compliance-card-detail"
          sx={{
            minHeight: '50vh',
            height: {
              xs: `calc(100vh - ${HEADER.MOBILE_HEIGHT + SPACING + ANDROID_KEYBOARD + TAB_HEIGHT}px)`,
              sm: `calc(100vh - ${HEADER.MOBILE_HEIGHT + SPACING + ANDROID_KEYBOARD + TAB_HEIGHT}px)`,
              lg: `calc(100vh - ${HEADER.DASHBOARD_DESKTOP_HEIGHT + SPACING + ANDROID_KEYBOARD + TAB_HEIGHT}px)`,
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
            sx={{
              px: mdUp ? 2 : 1,
              bgcolor: 'background.neutral',
              borderTopLeftRadius: 8,
              borderTopRightRadius: 8,
            }}
          >
            {TABS.map((tab) => {
              const disabled = isAddNew && tab.value === '2';
              return (
                <Tab
                  // disableRipple
                  key={tab.value}
                  value={tab.value}
                  label={
                    <Typography variant="body1" fontSize={smUp ? 14 : 12} fontWeight={'bold'}>
                      {tab.label}
                    </Typography>
                  }
                  style={{ minWidth: '40%' }}
                  disabled={disabled}
                />
              );
            })}
          </Tabs>
          <div
            role="tabpanel"
            hidden={currentTab !== '1'}
            id={`full-width-tabpanel-1`}
            aria-labelledby={`full-width-tab-1`}
          >
            <FormProvider methods={methods} onSubmit={handleSubmit(handleSave, onError)}>
              <Scrollbar>
                <Box
                  sx={{
                    height: {
                      xs: `calc(100vh - ${HEADER.MOBILE_HEIGHT + SPACING + ANDROID_KEYBOARD + TAB_HEIGHT}px)`,
                      sm: `calc(100vh - ${HEADER.MOBILE_HEIGHT + SPACING + ANDROID_KEYBOARD + TAB_HEIGHT}px)`,
                      lg: `calc(100vh - ${
                        HEADER.DASHBOARD_DESKTOP_HEIGHT + SPACING + ANDROID_KEYBOARD + TAB_HEIGHT
                      }px)`,
                    },
                    py: 2,
                    px: 1,
                  }}
                >
                  <RollInfo
                    isViewOnly={isViewOnly}
                    methods={methods}
                    currentTodoItem={currentTodoItem}
                    onChange={handleSave}
                  />
                </Box>
              </Scrollbar>
              <Box
                sx={{
                  width: '100%',
                  position: 'fixed',
                  overflow: 'hidden',
                  bottom: 3,
                  py: 1,
                  pr: 2,
                  zIndex: 10000000000000000000,
                }}
              >
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={4} md={3}>
                    <LoadingButton
                      variant={'contained'}
                      sx={{
                        backgroundColor: theme.palette.error.main,
                      }}
                      fullWidth
                      onClick={() => setDeleteModal(true)}
                      disabled={isViewOnly || isAddNew}
                    >
                      {translate('button.delete')}
                    </LoadingButton>
                  </Grid>
                  <Grid item xs={6} sm={4} md={3}>
                    <LoadingButton variant={'contained'} fullWidth type="submit" disabled={isViewOnly}>
                      {translate('button.save')}
                    </LoadingButton>
                  </Grid>
                </Grid>
              </Box>
              {deleteModal ? (
                <PopupConfirm
                  title={translate('mqc.deleteConfirm.title')}
                  visible={deleteModal}
                  onClose={() => setDeleteModal(!deleteModal)}
                  onProcess={handleDelete}
                  description={translate('mqc.deleteConfirm.message')}
                />
              ) : null}
            </FormProvider>
          </div>

          <div
            role="tabpanel"
            hidden={currentTab !== '2'}
            id={`full-width-tabpanel-2`}
            aria-labelledby={`full-width-tab-2`}
          >
            {isViewOnly || currentTab !== '2' ? null : (
              <FloatButton
                onClick={() => {
                  setModalDefect({ visible: true, item: null, isViewOnly, isAddNew: true });
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
            )}

            {!isSaved ? (
              <DefectList
                data={currentTodoItem?.QIMaterialFabricRatings?.filter((rating) => rating?.IsDeleted !== true) || []}
                setModalContent={setModalDefect}
                translate={translate}
                AttachmentsData={AttachmentsData}
                isViewOnly={isViewOnly}
              />
            ) : null}

            {modalDefect?.visible ? (
              <DefectDetail
                modalContent={modalDefect}
                setModalContent={setModalDefect}
                currentParentItem={currentTodoItem}
                setCurrentParentItem={setCurrentTodoItem}
                ratings={currentTodoItem?.QIMaterialFabricRatings || []}
                parentItems={lines}
                onSave={onSave}
                isViewOnly={isViewOnly}
                calculateRollPenaltyPoint={calculateRollPenaltyPoint}
                calculateTotalPenaltyQuantity={calculateTotalPenaltyQuantity}
                setIsSaved={setIsSaved}
                formField={values}
                fieldForRules={fieldForRules}
                AttachmentsData={AttachmentsData}
              />
            ) : null}
          </div>
        </Card>
      </Stack>
    </Popup>
  );
}

export default FabricInspectionDetails;
