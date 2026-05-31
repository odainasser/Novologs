import { paramCase } from 'src/utils/change-case';

import { _id, _postTitles } from 'src/_mock/assets';

// ----------------------------------------------------------------------

const MOCK_ID = _id[1];

const MOCK_TITLE = _postTitles[2];

const ROOTS = {
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
};

// ----------------------------------------------------------------------

export const paths = {
  comingSoon: '/coming-soon',
  maintenance: '/maintenance',
  pricing: '/pricing',
  payment: '/payment',
  about: '/about-us',
  contact: '/contact-us',
  faqs: '/faqs',
  page403: '/error/403',
  page404: '/error/404',
  page500: '/error/500',
  docs: 'https://docs.minimals.cc',
  changelog: 'https://docs.minimals.cc/changelog',
  zoneStore: 'https://mui.com/store/items/zone-landing-page/',
  minimalStore: 'https://mui.com/store/items/minimal-dashboard/',
  freeUI: 'https://mui.com/store/items/minimal-dashboard-free/',
  figmaUrl: 'https://www.figma.com/design/cAPz4pYPtQEXivqe11EcDE/%5BPreview%5D-Minimal-Web.v6.0.0',
  product: {
    root: `/product`,
    checkout: `/product/checkout`,
    details: (id) => `/product/${id}`,
    demo: { details: `/product/${MOCK_ID}` },
  },
  post: {
    root: `/post`,
    details: (title) => `/post/${paramCase(title)}`,
    demo: { details: `/post/${paramCase(MOCK_TITLE)}` },
  },
  // AUTH
  auth: {
    jwt: {
      signIn: `${ROOTS.AUTH}/jwt/sign-in`,
      signUp: `${ROOTS.AUTH}/jwt/sign-up`,
    },
  },
  // DASHBOARD

  dashboard: {
    root: ROOTS.DASHBOARD,
    admin: {
      root: `${ROOTS.DASHBOARD}/admin`,
    },
    mail: `${ROOTS.DASHBOARD}/mail`,
    chat: `${ROOTS.DASHBOARD}/chat`,
    blank: `${ROOTS.DASHBOARD}/blank`,
    kanban: {
      root: `${ROOTS.DASHBOARD}/kanban`,
      list: `${ROOTS.DASHBOARD}/kanban/list`,
      report: `${ROOTS.DASHBOARD}/kanban/report`,
      details: (id) => `${ROOTS.DASHBOARD}/kanban/${id}/details`,
    },
    timesheet: {
      root: `${ROOTS.DASHBOARD}/timesheet`,
    },
    notes: {
      new: `${ROOTS.DASHBOARD}/notes/new`,
      view: (id) => `${ROOTS.DASHBOARD}/notes/view/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/notes/edit/${id}`,
    },

    todo: {
      root: `${ROOTS.DASHBOARD}/todo`,
    },
    calendar: `${ROOTS.DASHBOARD}/calendar`,

    documents: {
      root: `${ROOTS.DASHBOARD}/documents`,
      new: `${ROOTS.DASHBOARD}/documents/new`,
      view: (id) => `${ROOTS.DASHBOARD}/documents/view/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/documents/edit/${id}`,
    },

    fileManager: `${ROOTS.DASHBOARD}/file-manager`,
    permission: `${ROOTS.DASHBOARD}/permission`,
    general: {
      app: `${ROOTS.DASHBOARD}/app`,
      ecommerce: `${ROOTS.DASHBOARD}/ecommerce`,
      analytics: `${ROOTS.DASHBOARD}/analytics`,
      banking: `${ROOTS.DASHBOARD}/banking`,
      booking: `${ROOTS.DASHBOARD}/booking`,
      file: `${ROOTS.DASHBOARD}/file`,
      course: `${ROOTS.DASHBOARD}/course`,
    },
    user: {
      root: `${ROOTS.DASHBOARD}/user`,
      new: `${ROOTS.DASHBOARD}/user/new`,
      list: `${ROOTS.DASHBOARD}/user/list`,
      cards: `${ROOTS.DASHBOARD}/user/cards`,
      profile: `${ROOTS.DASHBOARD}/user/profile`,
      account: `${ROOTS.DASHBOARD}/user/account`,
      edit: (id) => `${ROOTS.DASHBOARD}/user/${id}/edit`,
      more: (id) => `${ROOTS.DASHBOARD}/user/${id}/add-more`,
      details: (id) => `${ROOTS.DASHBOARD}/user/${id}/details`,
      permissions: (id) => `${ROOTS.DASHBOARD}/user/${id}/permissions`,
      showHideMenu: (id) => `${ROOTS.DASHBOARD}/user/${id}/show-hide-menu`,

      demo: {
        edit: `${ROOTS.DASHBOARD}/user/${MOCK_ID}/edit`,
      },
    },

    project: {
      root: `${ROOTS.DASHBOARD}/project`,
      list: `${ROOTS.DASHBOARD}/project/list`,
      profile: `${ROOTS.DASHBOARD}/project/profile`,
      edit: (id) => `${ROOTS.DASHBOARD}/project/${id}/edit`,
      details: (id) => `${ROOTS.DASHBOARD}/project/${id}/details`,
    },
    mission: {
      list: `${ROOTS.DASHBOARD}/mission/list`,
    },
    ticketing: {
      list: `${ROOTS.DASHBOARD}/ticketing/list`,
      details: (id) => `${ROOTS.DASHBOARD}/ticketing/${id}/details`,
    },

    client: {
      root: `${ROOTS.DASHBOARD}/client`,
      list: `${ROOTS.DASHBOARD}/client/list`,
    },

    vendor: {
      list: `${ROOTS.DASHBOARD}/vendor/list`,
    },

    clientGroup: {
      details: (id) => `${ROOTS.DASHBOARD}/client-group/${id}/details`,
    },
    clientMember: {
      details: (id) => `${ROOTS.DASHBOARD}/client-member/${id}/details`,
    },
    leadDetails: {
      details: (id) => `${ROOTS.DASHBOARD}/lead-details/${id}/details`,
    },

    contractDetails: {
      details: (id) => `${ROOTS.DASHBOARD}/contract-details/${id}/details`,
    },

    clientDetails: {
      details: (id) => `${ROOTS.DASHBOARD}/client-details/${id}/details`,
    },

    vendorDetails: {
      details: (id) => `${ROOTS.DASHBOARD}/vendor-details/${id}/details`,
    },

    settings: {
      root: `${ROOTS.DASHBOARD}/settings`,
    },
    accounts: {
      root: `${ROOTS.DASHBOARD}/accounts`,
    },

    workflow: {
      root: `${ROOTS.DASHBOARD}/workflow`,
    },

    product: {
      root: `${ROOTS.DASHBOARD}/product`,
      new: `${ROOTS.DASHBOARD}/product/new`,
      details: (id) => `${ROOTS.DASHBOARD}/product/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/product/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/product/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/product/${MOCK_ID}/edit`,
      },
    },
    invoice: {
      root: `${ROOTS.DASHBOARD}/invoice`,
      new: `${ROOTS.DASHBOARD}/invoice/new`,
      details: (id) => `${ROOTS.DASHBOARD}/invoice/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/invoice/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/invoice/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/invoice/${MOCK_ID}/edit`,
      },
    },
    post: {
      root: `${ROOTS.DASHBOARD}/post`,
      new: `${ROOTS.DASHBOARD}/post/new`,
      details: (title) => `${ROOTS.DASHBOARD}/post/${paramCase(title)}`,
      edit: (title) => `${ROOTS.DASHBOARD}/post/${paramCase(title)}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/post/${paramCase(MOCK_TITLE)}`,
        edit: `${ROOTS.DASHBOARD}/post/${paramCase(MOCK_TITLE)}/edit`,
      },
    },
    order: {
      root: `${ROOTS.DASHBOARD}/order`,
      details: (id) => `${ROOTS.DASHBOARD}/order/${id}`,
      demo: {
        details: `${ROOTS.DASHBOARD}/order/${MOCK_ID}`,
      },
    },
    job: {
      root: `${ROOTS.DASHBOARD}/job`,
      new: `${ROOTS.DASHBOARD}/job/new`,
      details: (id) => `${ROOTS.DASHBOARD}/job/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/job/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/job/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/job/${MOCK_ID}/edit`,
      },
    },
    tour: {
      root: `${ROOTS.DASHBOARD}/tour`,
      new: `${ROOTS.DASHBOARD}/tour/new`,
      details: (id) => `${ROOTS.DASHBOARD}/tour/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/tour/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/tour/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/tour/${MOCK_ID}/edit`,
      },
    },
  },
};
