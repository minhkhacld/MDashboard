// ----------------------------------------------------------------------

import { dashboard } from "src/redux/slices/dashboard";

function path(root, sublink) {
  return `${root}${sublink}`;
}

const ROOTS_AUTH = '/auth';
// const ROOTS_MAIN = '/app';
const ROOTS_MAIN = '';

// ----------------------------------------------------------------------

export const PATH_AUTH = {
  root: ROOTS_AUTH,
  login: path(ROOTS_AUTH, '/login'),
  register: path(ROOTS_AUTH, '/register'),
  loginUnprotected: path(ROOTS_AUTH, '/login-unprotected'),
  registerUnprotected: path(ROOTS_AUTH, '/register-unprotected'),
  verify: path(ROOTS_AUTH, '/verify'),
  resetPassword: path(ROOTS_AUTH, '/reset-password'),
  newPassword: path(ROOTS_AUTH, '/new-password'),
  sendRequest: path(ROOTS_AUTH, '/send-request'),
};

export const PATH_PAGE = {
  pdfViewer: '/pdfViewer',
  page403: '/403',
  page404: '/404',
  page500: '/500',
};

export const PATH_APP = {
  root: ROOTS_MAIN,
  general: {
    app: path(ROOTS_MAIN, '/home'),
    statement: path(ROOTS_MAIN, '/statement'),
    approve: path(ROOTS_MAIN, '/approve'),
    accounting: path(ROOTS_MAIN, '/accounting'),
    shipment: path(ROOTS_MAIN, '/shipment'),
    bank_account: path(ROOTS_MAIN, '/bank_account'),
    compliance: path(ROOTS_MAIN, '/compliance'),
    notification: path(ROOTS_MAIN, '/notification'),
  },
  calendar: {
    activity: path(ROOTS_MAIN, '/calendar/activity'),
    event: path(ROOTS_MAIN, '/calendar/event'),
  },
  accounting: {
    pending: {
      root: path(ROOTS_MAIN, '/accounting/pending/list'),
      report: (name) => path(ROOTS_MAIN, `/accounting/pending/report/${name}`),
    },
    recall: {
      root: path(ROOTS_MAIN, '/accounting/recall/list'),
      report: (name) => path(ROOTS_MAIN, `/accounting/recall/report/${name}`),
    },
  },
  shipment: {
    pending: {
      root: path(ROOTS_MAIN, '/shipment/pending/list'),
      report: (name) => path(ROOTS_MAIN, `/shipment/pending/report/${name}`),
      doc_detail: (name) => path(ROOTS_MAIN, `/shipment/pending/document_detail/${name}`),
    },
    recall: {
      root: path(ROOTS_MAIN, '/shipment/recall/list'),
      report: (name) => path(ROOTS_MAIN, `/shipment/recall/report/${name}`),
    },
  },
  bank_account: {
    pending: {
      root: path(ROOTS_MAIN, '/bank_account/pending/list'),
      report: (name) => path(ROOTS_MAIN, `/bank_account/pending/report/${name}`),
    },
    recall: {
      root: path(ROOTS_MAIN, '/bank_account/recall/list'),
    },
  },
  qc: {
    planing: {
      root: path(ROOTS_MAIN, '/qc/planing/list'),
    },
    inspection: {
      root: path(ROOTS_MAIN, '/qc/inspection/list'),
      detail: (name) => path(ROOTS_MAIN, `/qc/inspection/detail/${name}`),
    },
    production_activity: {
      root: path(ROOTS_MAIN, '/qc/production_activity/list'),
      detail: (name) => path(ROOTS_MAIN, `/qc/production_activity/detail/${name}`),
    },
  },
  mqc: {
    root: path(ROOTS_MAIN, '/mqc/list'),
    detail: (name) => path(ROOTS_MAIN, `/mqc/detail/${name}`),
    fabric: (name) => path(ROOTS_MAIN, `/mqc/detail/fabric/${name}`),
    defect: (name) => path(ROOTS_MAIN, `/mqc/detail/fabric/defect/${name}`)
  },
  compliance: {
    // Compliance Audit: /compliance/audit/approval/detail/{id}
    // Compliance Request: /compliance/request/approval/detail/{id}
    root: path(ROOTS_MAIN, '/compliance/audit/list'),
    audit: {
      root: path(ROOTS_MAIN, '/compliance/audit/list'),
      detail: (name) => path(ROOTS_MAIN, `/compliance/audit/detail/${name}`),
      section: (name) => path(ROOTS_MAIN, `/compliance/audit/detail/${name}/section`),
      info: (name) => path(ROOTS_MAIN, `/compliance/audit/detail/${name}/section/info`),
      factory_info: (name) => path(ROOTS_MAIN, `/compliance/audit/factory_info/${name}`),
    },
    schedule: {
      root: path(ROOTS_MAIN, '/compliance/schedule/list'),
      detail: (name) => path(ROOTS_MAIN, `/compliance/schedule/detail/${name}`),
    },
    approval: {
      root: path(ROOTS_MAIN, '/compliance/approval/list'),
      detail: (name) => path(ROOTS_MAIN, `/compliance/approval/detail/${name}`),
    },
    factory_certificate: {
      root: path(ROOTS_MAIN, '/compliance/factory_certificate/list'),
      detail: (name) => path(ROOTS_MAIN, `/compliance/factory_certificate/detail/${name}`),
    },
    request: {
      root: path(ROOTS_MAIN, '/compliance/request/list'),
      detail: (name) => path(ROOTS_MAIN, `/compliance/request/detail/${name}`),
    },
  },
  tqa: {
    overall: path(ROOTS_MAIN, '/tqa/map/overall'),
    factory_profile: path(ROOTS_MAIN, '/tqa/map/factory_profile'),
    tqa_dashboard: path(ROOTS_MAIN, '/tqa/tqa_dashboard')
  },
  system: {
    enum: path(ROOTS_MAIN, '/system/enum'),
    sequenceCode: path(ROOTS_MAIN, '/system/sequenceCode'),
    workflow: path(ROOTS_MAIN, '/system/workflow'),
  },
  user: {
    root: path(ROOTS_MAIN, '/user'),
    new: path(ROOTS_MAIN, '/user/new'),
    list: path(ROOTS_MAIN, '/user/list'),
    cards: path(ROOTS_MAIN, '/user/cards'),
    profile: path(ROOTS_MAIN, '/user/profile'),
    account: path(ROOTS_MAIN, '/user/account'),
    edit: (name) => path(ROOTS_MAIN, `/user/${name}/edit`),
    demoEdit: path(ROOTS_MAIN, `/user/reece-chung/edit`),
  },
};
