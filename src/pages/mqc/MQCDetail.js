import { useLiveQuery } from 'dexie-react-hooks';
import { useSnackbar } from 'notistack';
import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
// @mui
import { Card, Container, Tab, Tabs, Typography } from '@mui/material';
// Redux
import { setAttachmentMinId, setCurrentRootId } from '../../redux/slices/mqc';
import { dispatch, useSelector } from '../../redux/store';
// routes
import { attachmentsDB, mqcDB } from '../../Db';
import { PATH_APP } from '../../routes/paths';
// hooks
import useIsOnline from '../../hooks/useIsOnline';
import useLocales from '../../hooks/useLocales';
import useResponsive from '../../hooks/useResponsive';
import useSettings from '../../hooks/useSettings';
// components
import GoBackButton from '../../components/GoBackButton';
import Page from '../../components/Page';
import FloatButton from '../../components/button/FloatButton';
import FabricInspectionDetails from './FabricInspectionDetails';
// SECTIONS
import Attachments from '../../sections/mqc/MQCDetail/Attachments';
import FabricInfo from '../../sections/mqc/MQCDetail/FabricInfo';
import InspectionDetails from '../../sections/mqc/MQCDetail/InspectionDetails';
// CONFIG
import { HEADER, NOTCH_HEIGHT } from '../../config';
import axios from '../../utils/axios';
import IconName from '../../utils/iconsName';


const BREAKCRUM_HEIGHT = 41;
const SPACING = 24;
const ANDROID_KEYBOARD = 0;
const TAB_HEIGHT = 48;
const BACK_BUTTON_HEIGHT = 42;
const SUBMIT_BUTTON = 52;

function MQCDetail() {
  // hook
  const [currentTab, setCurrentTab] = useState('1');
  const [currentTodoItem, setCurrentTodoItem] = useState();
  const [lines, setLines] = useState([]);
  const [modalContent, setModalContent] = useState({ visible: false, item: null, isAddNew: false });
  const [isSaved, setIsSaved] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const { translate } = useLocales();
  const { online } = useIsOnline();
  // theme
  const { themeStretch } = useSettings();
  const mdUp = useResponsive('up', 'md');
  const smUp = useResponsive('up', 'sm');
  // route
  const naviagte = useNavigate();
  const { state } = useLocation();
  const { name } = useParams();
  // get data from indexDB
  const id = name !== 'add' ? parseInt(name, 10) : name;
  const Enums = useLiveQuery(() => mqcDB?.Enums.toArray()) || [];
  const TodoList = useLiveQuery(() => mqcDB?.ToDo.toArray()) || [];
  const CurrentTodo = TodoList ? TodoList?.find((todo) => todo?.id === id) : {};
  const AttachmentsData = useLiveQuery(() => attachmentsDB?.mqc.toArray()) || [];
  // form
  const isAddNew = name === 'add';
  // redux
  const { LoginUser } = useSelector((store) => store?.workflow);
  const { isViewOnly, attachmentMinId } = useSelector((store) => store?.mqc);

  const handleSave = useCallback(
    async (changedFields) => {
      if (!isViewOnly) {
        mqcDB?.ToDo.where('id')
          .equals(CurrentTodo?.id)
          .and((value) => value?.isChanged === 'false')
          .modify((value) => {
            delete value.isChanged;
            // console.log(value);
          });
        await mqcDB?.ToDo.where('id').equals(CurrentTodo?.id).modify(changedFields);
      }
    },
    [CurrentTodo]
  );

  // Menu
  const TABS = [
    {
      label: 'Header',
      value: '1',
    },
    {
      label: 'Images',
      value: '2',
    },
    {
      label: 'Inspection',
      value: '3',
    },
  ];

  const handleChangeTab = (e, newValue) => {
    setCurrentTab(newValue);
  };

  // Call Api
  useEffect(() => {
    try {
      if (isViewOnly) {
        axios.get(`/api/MQCMobileApi/GetInspectionById/${name}`).then((response) => {
          setCurrentTodoItem(response.data);
          dispatch(setCurrentRootId(response?.data?.Id));
          setLines(response?.data?.QIMaterialFabricLines);
        });
      }
    } catch (e) {
      console.log(e);
    }
  }, []);

  useEffect(() => {
    if (!isViewOnly) {
      setLines(CurrentTodo?.QIMaterialFabricLines);
      dispatch(setCurrentRootId(CurrentTodo?.id));
    }
    const minId = Math.min(...AttachmentsData?.map((att) => att?.id));
    if (attachmentMinId > minId) dispatch(setAttachmentMinId(minId));
  }, [CurrentTodo]);

  useEffect(() => {
    setIsSaved(false);
  }, [isSaved]);

  const fieldForRules = {
    MQCInspectionTemplateId: CurrentTodo?.MQCInspectionTemplateId || currentTodoItem?.MQCInspectionTemplateId,
    MaxPenaltyQuantity: CurrentTodo?.MaxPenaltyQuantity || currentTodoItem?.MaxPenaltyQuantity,
  };

  return (
    <Page title={'MQC Detail'}>
      <Container
        maxWidth={themeStretch ? false : 'lg'}
        sx={{
          paddingLeft: 1,
          paddingRight: 1,
          position: {
            xs: 'fixed',
            lg: 'relative',
          },
        }}
      >
        <GoBackButton onClick={() => naviagte(PATH_APP.mqc.root)} sx={{ mb: 1 }} />
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
            minHeight: 48,
          }}
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
              style={{ minWidth: 60 }}
            />
          ))}
        </Tabs>
        <Card
          id="compliance-card-detail"
          sx={{
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            minHeight: '50vh',
            height: {
              xs: `calc(100vh - ${HEADER.MOBILE_HEIGHT + SPACING + ANDROID_KEYBOARD + TAB_HEIGHT + NOTCH_HEIGHT + BACK_BUTTON_HEIGHT
                }px)`,
              sm: `calc(100vh - ${HEADER.MOBILE_HEIGHT + SPACING + ANDROID_KEYBOARD + TAB_HEIGHT + NOTCH_HEIGHT + BACK_BUTTON_HEIGHT
                }px)`,
              lg: `calc(100vh - ${HEADER.DASHBOARD_DESKTOP_HEIGHT +
                SPACING +
                ANDROID_KEYBOARD +
                TAB_HEIGHT +
                NOTCH_HEIGHT +
                BACK_BUTTON_HEIGHT
                }px)`,
            },
          }}
        >
          <div
            role="tabpanel"
            hidden={currentTab !== '1'}
            id={`full-width-tabpanel-1`}
            aria-labelledby={`full-width-tab-1`}
          >
            <FabricInfo
              // methods={methods}
              isViewOnly={isViewOnly}
              currentTodoItem={CurrentTodo && !isViewOnly ? CurrentTodo : currentTodoItem}
              Enums={Enums}
              onChange={handleSave}
              online={online}
              naviagte={naviagte}
              AttachmentsData={AttachmentsData}
            />
          </div>

          <div
            role="tabpanel"
            hidden={currentTab !== '2'}
            id={`full-width-tabpanel-2`}
            aria-labelledby={`full-width-tab-2`}
          >
            <Attachments
              currentInspection={CurrentTodo && !isViewOnly ? CurrentTodo : currentTodoItem}
              Enums={Enums}
              isViewOnly={isViewOnly}
              onChange={handleSave}
              AttachmentsData={AttachmentsData}
            />
          </div>

          <div
            role="tabpanel"
            hidden={currentTab !== '3'}
            id={`full-width-tabpanel-3`}
            aria-labelledby={`full-width-tab-3`}
          >
            {isViewOnly || currentTab !== '3' ? null : (
              <FloatButton
                onClick={() => {
                  setModalContent({ visible: true, item: null, isAddNew: true });
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
              <InspectionDetails
                setModalContent={setModalContent}
                data={lines?.filter((line) => line?.IsDeleted !== true)}
                translate={translate}
              />
            ) : null}
            {modalContent?.visible ? (
              <FabricInspectionDetails
                modalContent={modalContent}
                setModalContent={setModalContent}
                lines={lines}
                setIsSavedStatus={setIsSaved}
                isViewOnly={isViewOnly}
                onSave={handleSave}
                fieldForRules={fieldForRules}
                translate={translate}
                AttachmentsData={AttachmentsData}
              />
            ) : null}
          </div>
        </Card>
      </Container>
    </Page>
  );
}

export default MQCDetail;
