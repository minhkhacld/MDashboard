import { combineReducers } from 'redux';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
// slices
import settingReducer from './slices/setting';
import workflowReducer from './slices/workflow';
// enum slice
import enumReducer from './slices/enum';
import notificationReducer from './slices/notification';
import approvalReducer from './slices/approval';
import shipmentReducer from './slices/shipment';
import bankAccountReducer from './slices/bankAccount';
import complianceReducer from './slices/compliance';
// MQC
import qcReducer from './slices/qc';
import tabsReducer from './slices/tabs';
import imageEditorReducer from './slices/imageEditor';
import calendarReducer from './slices/calendar';
import menuBadeReducer from './slices/menuBagde';
import mqcReducer from './slices/mqc';
import memoReducer from './slices/memo'
import productionActivityReducer from './slices/productionActivity';
// ----------------------------------------------------------------------

const rootPersistConfig = {
  key: 'root',
  storage,
  keyPrefix: 'redux-',
  whitelist: [],
};

const settingPersistConfig = {
  key: 'settings',
  storage,
  keyPrefix: 'redux-',
  whitelist: ['pushNotificationToken', 'isAuthenticated', 'isOfflineMode', 'accessToken'],
};

const notificationPersistConfig = {
  key: 'notification',
  storage,
  keyPrefix: 'redux-',
  whitelist: ['notification', 'pendingList'],
};

const approvalPersistConfig = {
  key: 'approval',
  storage,
  keyPrefix: 'redux-',
  whitelist: [],
};

const workflowPersistConfig = {
  key: 'workflow',
  storage,
  keyPrefix: 'redux-',
  whitelist: ['LoginUser'],
};

const qcPersistConfig = {
  key: 'qc',
  storage,
  keyPrefix: 'redux-',
  whitelist: ['currentTab', 'minId', 'uploadQueue'],
};

const tabsPersistConfig = {
  key: 'tabs',
  storage,
  keyPrefix: 'redux-',
  whitelist: ['complianceListTab', 'complianceDetailTab'],
};

const imageEditorPersistConfig = {
  key: 'imageEditor',
  storage,
  keyPrefix: 'redux-',
  whitelist: ['ARROW', 'TEXT', 'RECT', 'CIRCLE', 'LINE'],
};

const compliancePersistConfig = {
  key: 'compliance',
  storage,
  keyPrefix: 'redux-',
  whitelist: ['minId', 'viewOnlyTodo'],
};

const calendarPersistConfig = {
  key: 'calendar',
  storage,
  keyPrefix: 'redux-',
  whitelist: ['openForm', 'selectedEventId'],
};

const mqcPersistConfig = {
  key: 'mqc',
  storage,
  keyPrefix: 'redux-',
  whitelist: ['currentTab'],
};

const memoPersistConfig = {
  key: 'memo',
  storage,
  keyPrefix: 'redux-',
  whitelist: [],
};

// Reducer
const rootReducer = combineReducers({
  setting: persistReducer(settingPersistConfig, settingReducer),
  enum: enumReducer,
  workflow: persistReducer(workflowPersistConfig, workflowReducer),
  notification: persistReducer(notificationPersistConfig, notificationReducer),
  approval: persistReducer(approvalPersistConfig, approvalReducer),
  shipment: shipmentReducer,
  bankAccount: bankAccountReducer,
  qc: persistReducer(qcPersistConfig, qcReducer),
  compliance: persistReducer(compliancePersistConfig, complianceReducer),
  mqc: persistReducer(mqcPersistConfig, mqcReducer),
  tabs: persistReducer(tabsPersistConfig, tabsReducer),
  imageEditor: persistReducer(imageEditorPersistConfig, imageEditorReducer),
  calendar: persistReducer(calendarPersistConfig, calendarReducer),
  menuBadge: menuBadeReducer,
  memo: persistReducer(memoPersistConfig, memoReducer),
  productionActivity: productionActivityReducer,
});

export { rootPersistConfig, rootReducer };
