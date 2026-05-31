import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';

import { SvgColor } from 'src/components/svg-color';
import { useTranslation } from 'react-i18next';

// ----------------------------------------------------------------------

const icon = (name) => <SvgColor src={`${CONFIG.assetsDir}/assets/icons/navbar/${name}.svg`} />;

const ICONS = {
  job: icon('ic-job'),
  // blog: icon('ic-blog'),
  chat: icon('ic-chat'),
  mail: icon('ic-mail'),
  user: icon('ic-user'),
  file: icon('ic-file'),
  lock: icon('ic-lock'),
  tour: icon('ic-tour'),
  order: icon('ic-order'),
  label: icon('ic-label'),
  blank: icon('ic-blank'),
  kanban: icon('ic-kanban'),
  folder: icon('ic-folder'),
  course: icon('ic-course'),
  banking: icon('ic-banking'),
  booking: icon('ic-booking'),
  invoice: icon('ic-invoice'),
  product: icon('ic-product'),
  calendar: icon('ic-calendar'),
  disabled: icon('ic-disabled'),
  external: icon('ic-external'),
  menuItem: icon('ic-menu-item'),
  ecommerce: icon('ic-ecommerce'),
  analytics: icon('ic-analytics'),
  dashboard: icon('ic-dashboard'),
  parameter: icon('ic-parameter'),
  timesheet: icon('ic-timesheet'),
  documents: icon('ic-documents'),
  settings: icon('ic-setting'),
  // support: icon('ic-support'), // Temporarily disabled
};

// ----------------------------------------------------------------------

export const navData = [
  {
    items: [
      { id: 1, title: 'Home', path: paths.dashboard.root, icon: ICONS.dashboard },

      { id: 2, title: 'Team', path: paths.dashboard.user.list, icon: ICONS.user },
      { id: 3, title: 'Tasks', path: paths.dashboard.kanban.list, icon: ICONS.kanban },
      {
        id: 4,
        title: 'Projects',
        path: paths.dashboard.project.list,
        icon: ICONS.tour,
      },
      {
        id: 5,
        title: 'Missions',
        path: paths.dashboard.mission.list,
        icon: ICONS.external,
      },

      // {
      //   id: 16,
      //   title: 'Ticketing',
      //   path: paths.dashboard.ticketing.list,
      //   icon: ICONS.course,
      // },

      { id: 6, title: 'Clients', path: paths.dashboard.client.list, icon: ICONS.analytics },

      { id: 7, title: 'Vendors', path: paths.dashboard.vendor.list, icon: ICONS.menuItem },

      { id: 8, title: 'Repositories', path: paths.dashboard.fileManager, icon: ICONS.folder },

      // { id: 9, title: 'Workflow', path: paths.dashboard.workflow.root, icon: ICONS.menuItem },

      // { id: 10, title: 'Calender', path: paths.dashboard.timesheet.root, icon: ICONS.timesheet },
      // { id: 11, title: 'Activities', path: paths.dashboard.todo.root, icon: ICONS.calendar },

      { id: 12, title: 'Documents', path: paths.dashboard.documents.root, icon: ICONS.documents },
      { id: 13, title: 'Chat', path: paths.dashboard.chat, icon: ICONS.chat },
      // { id: 14, title: 'Settings', path: paths.dashboard.settings.root, icon: ICONS.settings },
      { id: 15, title: 'Accounts', path: paths.dashboard.accounts.root, icon: ICONS.invoice },
      // { id: 17, title: 'admin', path: paths.dashboard.admin.root, icon: ICONS.lock },
    ],
  },
];
