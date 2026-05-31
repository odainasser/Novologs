'use client';

import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import Container from '@mui/material/Container';

import { layoutClasses } from 'src/layouts/classes';

import { useSettingsContext } from 'src/components/settings';
import { useTranslation } from 'react-i18next';

// ----------------------------------------------------------------------

export function Main({ children, isNavHorizontal, sx, ...other }) {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  return (
    
      <Box
        component="main"
        dir={isRTL ? 'rtl' : 'ltr'}
        className={layoutClasses.main}
        sx={{
          display: 'flex',
          flex: '1 1 auto',
          flexDirection: 'column',
          ...(isNavHorizontal && {
            '--layout-dashboard-content-pt': '40px',
          }),
          ...sx,
        }}
        {...other}
      >
        {children}
      </Box>
    );
  }

// ----------------------------------------------------------------------

export function DashboardContent({ sx, children, disablePadding, maxWidth = 'lg', ...other }) {
  const theme = useTheme();
  const { i18n } = useTranslation();
const isRTL = i18n.language === 'ar';

  const settings = useSettingsContext();

  const layoutQuery = 'lg';

  return (
    <Container
    dir={isRTL ? 'rtl' : 'ltr'}
      className={layoutClasses.content}
      maxWidth={settings.compactLayout ? maxWidth : false}
      sx={{
        display: 'flex',
        flex: '1 1 auto',
        flexDirection: 'column',
        pt: 0,
        pb: 'var(--layout-dashboard-content-pb)',
        [theme.breakpoints.up(layoutQuery)]: {
          px: 'var(--layout-dashboard-content-px)',
        },
        ...(disablePadding && {
          p: {
            xs: 0,
            sm: 0,
            md: 0,
            lg: 0,
            xl: 0,
          },
        }),
        ...sx,
      }}
      {...other}
    >
      {children}
    </Container>
  );
}
