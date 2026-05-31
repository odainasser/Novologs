import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';

import { Logo } from 'src/components/logo';
import { Scrollbar } from 'src/components/scrollbar';
import { NavSectionMini, NavSectionVertical } from 'src/components/nav-section';
import { NavToggleButton } from '../components/nav-toggle-button';
import { varAlpha, hideScrollY } from 'src/theme/styles';

export function NavVertical({ sx, data, slots, isNavMini, layoutQuery, onToggleNav, ...other }) {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  return (
    <Box
      sx={{
        top: 0,
        height: 1,
        position: 'fixed',
        flexDirection: 'column',
        bgcolor: 'var(--layout-nav-bg)',
        zIndex: 'var(--layout-nav-zIndex)',

        // ✅ hide sidebar on small screens
        display: 'none',

        ...(isRTL ? { right: 0 } : { left: 0 }),
        width: isNavMini ? 'var(--layout-nav-mini-width)' : 'var(--layout-nav-vertical-width)',

        borderLeft: isRTL
          ? `1px solid ${varAlpha(theme.vars.palette.grey['500Channel'], 0.12)}`
          : 'none',
        borderRight: !isRTL
          ? `1px solid ${varAlpha(theme.vars.palette.grey['500Channel'], 0.12)}`
          : 'none',

        transition: theme.transitions.create(['width'], {
          easing: 'var(--layout-transition-easing)',
          duration: 'var(--layout-transition-duration)',
        }),

        // ✅ show sidebar only on desktop
        [theme.breakpoints.up(layoutQuery)]: {
          display: 'flex',
        },

        ...sx,
      }}
    >
      <Box sx={{ pt: 2.5, pb: 1, px: 3.5 }}>
        <Logo />
      </Box>

      {/* Center Toggle Button */}
      {/* <Box sx={{ py: 1.5, display: 'flex', justifyContent: 'center' }}>
        <NavToggleButton isNavMini={isNavMini} onClick={onToggleNav} />
      </Box> */}

      <Scrollbar fillContent>
        {isNavMini ? (
          <NavSectionMini
            data={data}
            sx={{
              pb: 2,
              px: 0.5,
              ...hideScrollY,
              flex: '1 1 auto',
              overflowY: 'auto',
              direction: isRTL ? 'rtl' : 'ltr',
            }}
            {...other}
          />
        ) : (
          <NavSectionVertical
            data={data}
            sx={{
              px: 2,
              flex: '1 1 auto',
              direction: isRTL ? 'rtl' : 'ltr',
              textAlign: isRTL ? 'right' : 'left',
            }}
            {...other}
          />
        )}
      </Scrollbar>
    </Box>
  );
}
