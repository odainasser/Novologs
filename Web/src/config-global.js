import { paths } from 'src/routes/paths';

import packageJson from '../package.json';

// ----------------------------------------------------------------------

export const CONFIG = {
  appName: 'Novologs',
  appVersion: packageJson.version,
  serverUrl: process.env.NEXT_PUBLIC_SERVER_URL ?? '',
  zetaApiUrl:
    typeof window !== 'undefined' && window.location.hostname !== 'localhost'
      ? `${window.location.protocol}//${window.location.hostname}`
      : process.env.NEXT_PUBLIC_ZETA_API_URL,
  assetsDir: process.env.NEXT_PUBLIC_ASSETS_DIR ?? '',

  isStaticExport: JSON.parse(`${process.env.BUILD_STATIC_EXPORT}`),
  /**
   * Auth (JWT only)
   */
  auth: {
    method: 'jwt',
    skip: false,
    redirectPath: paths.dashboard.root,
  },
  /**
   * Mapbox
   */
  mapboxApiKey: process.env.NEXT_PUBLIC_MAPBOX_API_KEY ?? '',
  /**
   * Realtime chat (SignalR). Disabled until the backend hub at /chat/chat_hub exists;
   * set NEXT_PUBLIC_ENABLE_CHAT_HUB=true to enable.
   */
  enableChatHub: process.env.NEXT_PUBLIC_ENABLE_CHAT_HUB === 'true',
};
