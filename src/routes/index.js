import { lazy, Suspense } from 'react';
import { Navigate, useLocation, useRoutes } from 'react-router-dom';
// import { useLastLocation } from 'react-router-dom-last-location';
// layouts
import DashboardLayout from '../layouts/dashboard';
import DashboardNoHeader from '../layouts/dashboard/DashboardNoHeader';
import LogoOnlyLayout from '../layouts/LogoOnlyLayout';
// guards
import AuthGuard from '../guards/AuthGuard';
import GuestGuard from '../guards/GuestGuard';
// config
import { PATH_AFTER_LOGIN } from '../config';
// components
import LoadingScreen from '../components/LoadingScreen';

import MenuOffline from '../pages/MenuOffline';
import Page403 from '../pages/Page403';
import Page404 from '../pages/Page404';
import Page500 from '../pages/Page500';

import ComplianceAuditDetail from '../pages/compliance/audit/ComplianceAuditDetail';
import ComplianceAuditFactoryInfo from '../pages/compliance/audit/ComplianceAuditFactoryInfo';
import ComplianceAuditList from '../pages/compliance/audit/ComplianceAuditList';
import ComplianceAuditSection from '../pages/compliance/audit/ComplianceAuditSection';
import ComplianceAuditSectionDetail from '../pages/compliance/audit/ComplianceAuditSectionDetail';

import PageRoleBasedGuard from '../guards/PageRoleBasedGuard';
import InvalidDevicePage from '../pages/InvalidDevicePage';
import MQCDetail from '../pages/mqc/MQCDetail';
import MQCInspectionList from '../pages/mqc/MQCInspectionList';
import TQADashboard from '../pages/tqa/tqa_dashboard';
import NotificationCenter from '../pages/notification/NotificationCenter';
import QCInspectionDetail from '../pages/qc/QcInspectionDetail';
import QCInspectionList from '../pages/qc/QCInspectionList';
import QCPlaning from '../pages/qc/QCPlaning';
import ErrorHandler from '../pages/RenderError';

// ----------------------------------------------------------------------

const Loadable = (Component) => (props) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { pathname } = useLocation();
  return (
    <Suspense fallback={<LoadingScreen isDashboard={pathname.includes('/dashboard')} />}>
      <Component {...props} />
    </Suspense>
  );
};

export default function Router() {

  // const lastLocation = useLastLocation();
  // const lastPage = lastLocation?.lastLocation?.pathname;
  // console.log('lastPage', lastLocation);

  return useRoutes([
    {
      path: 'auth',
      children: [
        {
          path: 'login',
          element: (
            <GuestGuard>
              <EbsLogin />
            </GuestGuard>
          ),
        },
        // {
        //   path: 'register',
        //   element: (
        //     <GuestGuard>
        //       <Register />
        //     </GuestGuard>
        //   ),
        // },
        // { path: 'login-unprotected', element: <Login /> },
        // { path: 'register-unprotected', element: <Register /> },
        { path: 'reset-password', element: <ResetPassword /> },
        // { path: 'new-password', element: <NewPassword /> },
        { path: 'verify', element: <VerifyCode /> },
        { path: 'send-request', element: <SendRequestSuccess /> },
      ],
    },
    {
      path: '/',
      element: (
        <AuthGuard>
          <DashboardLayout />
        </AuthGuard>
      ),
      children: [
        // {
        //   // element: <Navigate to={lastPage && lastPage !== "/auth/login" && lastPage !== '/error' ? lastPage : PATH_AFTER_LOGIN} replace />,
        //   element: <Navigate to={'/calendar/activity'} replace />,
        //   index: true,
        // },

        {
          element: <Navigate to={PATH_AFTER_LOGIN} replace />,
          index: true,
        },

        {
          path: 'calendar',
          children: [
            { element: <Navigate to="/calendar/activity" replace />, index: true },
            { path: 'activity', element: <CalendarPage /> },
            { path: 'event', element: <CalendarEditPage /> },
          ],
        },

        { path: 'home', element: <GeneralApp /> },

        {
          path: 'accounting',
          children: [
            { element: <Navigate to="/accounting/pending/list" replace />, index: true },
            {
              path: 'pending',
              children: [
                { element: <Navigate to="/accounting/pending/list" replace />, index: true },
                {
                  path: 'list', element: <ApprovePendingList />
                },
                { path: 'report/:name', element: <ApprovalReport /> },
              ],
            },
            {
              path: 'recall',
              children: [
                { element: <Navigate to="/accounting/recall/list" replace />, index: true },
                { path: 'list', element: <ApprovalRecall /> },
                { path: 'report/:name', element: <ApprovalReport /> },
              ],
            },
          ],
        },

        {
          path: 'shipment',
          children: [
            { element: <Navigate to="/shipment/pending/list" replace />, index: true },
            {
              path: 'pending',
              children: [
                { element: <Navigate to="/shipment/pending/list" replace />, index: true },
                { path: 'list', element: <ShipmentPendingList /> },
                { path: 'report/:name', element: <ShipmentApproval /> },
                { path: 'document_detail/:name', element: <ShipmentDocDetail /> },
              ],
            },
            {
              path: 'recall',
              children: [
                { element: <Navigate to="/shipment/recall/list" replace />, index: true },
                { path: 'list', element: <ShipmentRecall /> },
              ],
            },
          ],
        },

        {
          path: 'bank_account',
          children: [
            { element: <Navigate to="/bank_account/pending/list" replace />, index: true },
            {
              path: 'pending',
              children: [
                { element: <Navigate to="/bank_account/pending/list" replace />, index: true },
                { path: 'list', element: <BankAccountPending /> },
                { path: 'report/:name', element: <BankAccountReport /> },
              ],
            },
            {
              path: 'recall',
              children: [
                { element: <Navigate to="/bank_account/recall/list" replace />, index: true },
                { path: 'list', element: <BankAccountRecall /> },
              ],
            },
          ],
        },

        {
          path: 'qc',
          children: [
            {
              path: 'planing',
              children: [
                { element: <Navigate to="/qc/planing/list" replace />, index: true },
                {
                  path: 'list',
                  element: <QCPlaning />,
                },
              ],
            },
            {
              path: 'inspection',
              children: [
                { element: <Navigate to="/qc/inspection/list" replace />, index: true },
                {
                  path: 'list',
                  element: <QCInspectionList />
                  ,
                },
                { path: 'detail/:name', element: <QCInspectionDetail /> },
              ],
            },
            {
              path: 'production_activity',
              children: [
                { element: <Navigate to="/qc/production_activity/list" replace />, index: true },
                {
                  path: 'list',
                  element: <QCProductionActivity />,
                },
                { path: 'detail/:name', element: <QCProductionActivityDetail /> },
              ],
            },
          ],
        },

        {
          path: 'compliance',
          children: [
            {
              path: 'audit',
              children: [
                { element: <Navigate to="/compliance/audit/list" replace />, index: true },
                {
                  path: 'list',
                  element: <ComplianceAuditList />,
                },
                {
                  path: 'detail/:name',
                  element: <ComplianceAuditDetail />,
                },
                { path: 'detail/:name/section', element: <ComplianceAuditSection /> },
                { path: 'detail/:name/section/info', element: <ComplianceAuditSectionDetail /> },
                { path: 'factory_info/:name', element: <ComplianceAuditFactoryInfo /> },
              ],
            },
            {
              path: 'schedule',
              children: [
                { element: <Navigate to="/compliance/schedule/list" replace />, index: true },
                { path: 'list', element: <ComplianceSchedule /> },
                { path: 'detail/:name', element: <ComplianceSchedule /> },
              ],
            },
            {
              path: 'approval',
              children: [
                { element: <Navigate to="/compliance/approval/list" replace />, index: true },
                { path: 'list', element: <ComplianceApproval /> },
                { path: 'detail/:name', element: <ApprovalDetail /> },
              ],
            },
            {
              path: 'factory_certificate',
              children: [
                { element: <Navigate to="/compliance/factory_certificate/list" replace />, index: true },
                { path: 'list', element: <FactoryCertificate /> },
                { path: 'detail/:name', element: <FactoryCertificate /> },
              ],
            },
            {
              path: 'request',
              children: [
                { element: <Navigate to="/compliance/request/list" replace />, index: true },
                { path: 'list', element: <ComplianceRequest /> },
                { path: 'detail/:name', element: <ComplianceDetail /> },
              ],
            },
          ],
        },
        { path: 'notification', element: <NotificationCenter /> },
        {
          path: 'user',
          children: [
            { element: <Navigate to="/user/profile" replace />, index: true },
            { path: 'account', element: <UserAccount /> },
          ],
        },
        {
          path: 'mqc',
          children: [
            { element: <Navigate to="/mqc/list" replace />, index: true },
            { path: 'list', element: <MQCInspectionList /> },
            { path: 'detail/:name', element: <MQCDetail /> },
          ],
        },
        {
          path: 'tqa',
          children: [
            { element: <Navigate to="/tqa/tqa_dashboard" replace />, index: true },
            { path: 'tqa_dashboard', element: <TQADashboard /> },
          ],
        },
        // {
        //   path: 'tqa',
        //   children: [
        //     { element: <Navigate to="/tqa/map/overall" replace />, index: true },
        //     { path: 'map/overall', element: <TQAMonthlyPlan /> },
        //   ],
        // },
      ],
    },
    {
      path: '/tqa',
      element: (
        <AuthGuard>
          <DashboardNoHeader />
        </AuthGuard>
      ),
      children: [
        { element: <Navigate to="/tqa/map/overall" replace />, index: true },
        {
          path: 'map/overall', element:
            <PageRoleBasedGuard>
              <TQAMonthlyPlan />
            </PageRoleBasedGuard>
        },
        {
          path: 'map/factory_profile', element:
            // <PageRoleBasedGuard>
            <TQAFactoryProfile />
          // </PageRoleBasedGuard>
        },
      ],
    },

    // Ofline mode;
    {
      path: '/offline',
      element: <MenuOffline />,
      children: [
        { element: <Navigate to="/offline/qc/" replace />, index: true },
        {
          path: 'qc',
          children: [
            { element: <Navigate to="/offline/qc/inspection" replace />, index: true },
            {
              path: 'inspection',
              children: [
                { element: <Navigate to="/offline/qc/inspection/list" replace />, index: true },
                { path: 'list', element: <QCInspectionList /> },
                { path: 'detail/:name', element: <QCInspectionDetail /> },
              ],
            },
          ],
        },
      ],
    },

    // Main Routes
    {
      path: '*',
      element: <LogoOnlyLayout />,
      children: [
        { path: '500', element: <Page500 /> },
        { path: '404', element: <Page404 /> },
        { path: '403', element: <Page403 /> },
        { path: '*', element: <Navigate to="/404" replace /> },
      ],
    },

    // { path: '/', element: <Navigate to={PATH_AFTER_LOGIN} replace /> },
    // { path: '/', element: <Navigate to={lastPage} replace /> },
    { path: '*', element: <Navigate to="/404" replace /> },
    { path: '/error', element: <ErrorHandler /> },
    { path: '/invalid-device', element: <InvalidDevicePage /> },
    { path: '/permission-denied', element: <PermissionDenied /> },
  ]);
}

// AUTHENTICATION
// const Login = Loadable(lazy(() => import('../pages/auth/Login')));
const EbsLogin = Loadable(lazy(() => import('../pages/auth/EbsLogin')));

// const Register = Loadable(lazy(() => import('../pages/auth/Register')));
const ResetPassword = Loadable(lazy(() => import('../pages/auth/ResetPassword')));
// const NewPassword = Loadable(lazy(() => import('../pages/auth/NewPassword')));
const VerifyCode = Loadable(lazy(() => import('../pages/auth/VerifyCode')));
const SendRequestSuccess = Loadable(lazy(() => import('../pages/auth/SendRequestSuccess')));

// GENERAL
const GeneralApp = Loadable(lazy(() => import('../pages/dashboard/GeneralApp')));

// CALENDER
const CalendarPage = Loadable(lazy(() => import('../pages/celendar/CalendarPage')));
const CalendarEditPage = Loadable(lazy(() => import('../pages/celendar/CalendarEditPage')));

// APPROVAL
const ApprovePendingList = Loadable(lazy(() => import('../pages/aprroval/ApprovalPendingList')));
const ApprovalRecall = Loadable(lazy(() => import('../pages/aprroval/ApprovalRecall')));
const ApprovalReport = Loadable(lazy(() => import('../pages/aprroval/ApprovalReport')));

// SHIPMENT
const ShipmentPendingList = Loadable(lazy(() => import('../pages/shipment/ShipmentPendingList')));
const ShipmentRecall = Loadable(lazy(() => import('../pages/shipment/ShipmentRecall')));
const ShipmentApproval = Loadable(lazy(() => import('../pages/shipment/ShipmentApproval')));
const ShipmentDocDetail = Loadable(lazy(() => import('../pages/shipment/ShipmentDocDetail')));

// BANKACCOUNT
const BankAccountPending = Loadable(lazy(() => import('../pages/bankAccount/BankAccountPending')));
const BankAccountRecall = Loadable(lazy(() => import('../pages/bankAccount/BankAccountRecall')));
const BankAccountReport = Loadable(lazy(() => import('../pages/bankAccount/BankAccountReport')));

// COMPLIANCE
const ComplianceRequest = Loadable(lazy(() => import('../pages/compliance/request/ComplianceRequest')));
const ComplianceDetail = Loadable(lazy(() => import('../pages/compliance/request/ComplianceDetail')));
const FactoryCertificate = Loadable(lazy(() => import('../pages/compliance/certificate/FactoryCertificate')));
const ComplianceSchedule = Loadable(lazy(() => import('../pages/compliance/schedule/ComplianceSchedule')));
const ComplianceApproval = Loadable(lazy(() => import('../pages/compliance/approval/ComplianceApproval')));
const ApprovalDetail = Loadable(lazy(() => import('../pages/compliance/approval/ApprovalDetail')));

// QC 
const QCProductionActivity = Loadable(lazy(() => import('../pages/qc/QCProductionActivity')));
const QCProductionActivityDetail = Loadable(lazy(() => import('../pages/qc/QCProductionActivityDetail')));
const TQAMonthlyPlan = Loadable(lazy(() => import('../pages/tqa/TQAMonthlyPlan')));
const TQAFactoryProfile = Loadable(lazy(() => import('../pages/tqa/TQAFactoryProfile')));

// MQC
// const MQCInspectionList = Loadable(lazy(() => import('../pages/mqc/MQCInspectionList')));

// const Maintenance = Loadable(lazy(() => import('../pages/Maintenance')));
// const Page500 = Loadable(lazy(() => import('../pages/Page500')));
// const Page403 = Loadable(lazy(() => import('../pages/Page403')));
// const Page404 = Loadable(lazy(() => import('../pages/Page404')));

// user
const UserAccount = Loadable(lazy(() => import('../pages/dashboard/UserAccount')));
const PermissionDenied = Loadable(lazy(() => import('../pages/dashboard/PermissionDenied')))
