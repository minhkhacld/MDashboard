// routes
import { PATH_APP } from '../../../routes/paths';
// components
import SvgIconStyle from '../../../components/SvgIconStyle';

// ----------------------------------------------------------------------
const getIcon = (name) => <SvgIconStyle src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />;

const ICONS = {
  blog: getIcon('ic_blog'),
  cart: getIcon('ic_cart'),
  chat: getIcon('ic_chat'),
  mail: getIcon('ic_mail'),
  user: getIcon('ic_user'),
  kanban: getIcon('ic_kanban'),
  banking: getIcon('ic_banking'),
  booking: getIcon('ic_booking'),
  invoice: getIcon('ic_invoice'),
  calendar: getIcon('ic_calendar'),
  ecommerce: getIcon('ic_ecommerce'),
  analytics: getIcon('ic_analytics'),
  dashboard: getIcon('ic_dashboard'),
  menuItem: getIcon('ic_menu_item'),
  approve: getIcon('ic_approve'),
  // recall: <Iconify icon={'entypo:back-in-time'} sx={{ width: 1, height: 1 }} />,
  // inspection: <Iconify icon={'icon-park-outline:inspection'} sx={{ width: 1, height: 1 }} />,
  // shipment: <Iconify icon={'carbon:delivery'} sx={{ width: 1, height: 1 }} />,
  // bank_account: <Iconify icon={'bi:bank'} sx={{ width: 1, height: 1 }} />,
  // compliance: <Iconify icon={'grommet-icons:compliance'} sx={{ width: 1, height: 1 }} />,
  // mqc: <Iconify icon={'icon-park-outline:audit'} sx={{ width: 1, height: 1 }} />,
  recall: getIcon('ic_recall'),
  inspection: getIcon('ic_inspection'),
  shipment: getIcon('ic_shipment'),
  bank_account: getIcon('ic_bank'),
  compliance: getIcon('ic_compliance'),
  mqc: getIcon('ic_mqc'),
  tqa: getIcon('ic_map'),
};

const navConfig = [
  // GENERAL
  // ----------------------------------------------------------------------
  {
    items: [
      { title: 'home', path: PATH_APP.general.app, icon: ICONS.dashboard, id: 'home' },
      {
        title: 'calendar',
        path: PATH_APP.calendar.activity,
        icon: ICONS.calendar,
        id: 'calendar',
      },
      {
        title: 'accounting',
        path: PATH_APP.general.accounting,
        icon: ICONS.approve,
        children: [
          { title: 'accounting_approval', path: PATH_APP.accounting.pending.root, id: 'accounting' },
          { title: 'accounting_recall', path: PATH_APP.accounting.recall.root, id: 'accounting' },
        ],
        id: 'accounting',
      },
      {
        title: 'shipment',
        path: PATH_APP.general.shipment,
        icon: ICONS.shipment,
        children: [
          { title: 'shipment_approval', path: PATH_APP.shipment.pending.root, id: 'shipment' },
          { title: 'shipment_recall', path: PATH_APP.shipment.recall.root, id: 'shipment' },
        ],
        id: 'shipment',
      },
      {
        title: 'bankAccount',
        path: PATH_APP.general.bank_account,
        icon: ICONS.bank_account,
        children: [
          { title: 'bankAccount_approval', path: PATH_APP.bank_account.pending.root, id: 'bank_account' },
          { title: 'bankAccount_recall', path: PATH_APP.bank_account.recall.root, id: 'bank_account' },
        ],
        id: 'bank_account',
      },
      {
        // title: 'qc.pageTitle',
        title: 'qc',
        path: PATH_APP.qc.planing.root,
        icon: ICONS.inspection,
        children: [
          { title: 'qc_planing', path: PATH_APP.qc.planing.root, id: 'qc' },
          { title: 'qc_inspection', path: PATH_APP.qc.inspection.root, id: 'qc' },
          { title: 'qc_production_activity', path: PATH_APP.qc.production_activity.root, id: 'qc' },
        ],
        id: 'qc',
      },
      {
        title: 'compliance',
        path: PATH_APP.compliance.root,
        icon: ICONS.compliance,
        children: [
          { title: 'compliance_request', path: PATH_APP.compliance.request.root, id: 'compliance' },
          { title: 'compliance_schedule', path: PATH_APP.compliance.schedule.root, id: 'compliance' },
          { title: 'compliance_audit', path: PATH_APP.compliance.audit.root, id: 'compliance' },
          { title: 'compliance_approval', path: PATH_APP.compliance.approval.root, id: 'compliance' },
          {
            title: 'compliance_factory_crtificate',
            path: PATH_APP.compliance.factory_certificate.root,
            id: 'compliance',
          },
        ],
        id: 'compliance',
      },
      {
        title: 'MQC',
        path: PATH_APP.mqc.root,
        icon: ICONS.mqc,
        id: 'mqc',
        children: [{ title: 'MQC Inspection', path: PATH_APP.mqc.root, id: 'mqc' }],
      },
      {
        title: 'TQA',
        path: PATH_APP.tqa.overall,
        icon: ICONS.tqa,
        id: 'tqa',
        children: [
          { title: 'Monthly Production', path: PATH_APP.tqa.overall, id: 'tqa' },
          { title: 'Factory Map', path: PATH_APP.tqa.factory_profile, id: 'tqa' },
          { title: 'Dashboard', path: PATH_APP.tqa.tqa_dashboard, id: 'tqa' },
        ],
      },
    ],
  },
  // {
  //   subheader: 'QA',
  //   items: [
  //     {
  //       title: 'qc',
  //       path: PATH_APP.shipment.recall.root,
  //       icon: ICONS.inspection,
  //       children: [
  //         { title: 'bankAccount_approval', path: PATH_APP.bank_account.pending.root },
  //         { title: 'bankAccount_recall', path: PATH_APP.bank_account.recall.root },
  //       ],
  //     },
  //     { title: 'mqc', path: PATH_APP.shipment.recall.root, icon: ICONS.ecommerce },
  //     { title: 'compliance', path: PATH_APP.shipment.recall.root, icon: ICONS.analytics },
  //   ],
  // },
];

export default navConfig;
