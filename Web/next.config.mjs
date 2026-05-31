const isStaticExport = 'false';

const nextConfig = {
  env: {
    BUILD_STATIC_EXPORT: isStaticExport,
  },
  compiler: {
    // Strip console.* from production bundles (keep error/warn); dev keeps all logs.
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },
  modularizeImports: {
    '@mui/icons-material': {
      transform: '@mui/icons-material/{{member}}',
    },
    '@mui/material': {
      transform: '@mui/material/{{member}}',
    },
    '@mui/lab': {
      transform: '@mui/lab/{{member}}',
    },
  },
  experimental: {
    // Trim the module graph compiled per route in dev (faster navigation).
    // NOTE: Turbopack (`next dev --turbo`) cannot build this project — `react-audio-voice-recorder`
    // uses `new URL(corePath, import.meta.url)` which Turbopack can't resolve. Stay on webpack.
    optimizePackageImports: ['@iconify/react', '@mui/lab', 'framer-motion'],
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },
  ...(isStaticExport === 'true' && {
    output: 'export',
  }),
};

export default nextConfig;
