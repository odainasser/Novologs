import SvgIcon from '@mui/material/SvgIcon';
import IconButton from '@mui/material/IconButton';
import { varAlpha } from 'src/theme/styles';
import { useTranslation } from 'react-i18next';

export function NavToggleButton({ isNavMini, sx, ...other }) {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  return (
    <IconButton
      size="small"
      sx={{
        p: 0.5,
        top: 24,
        position: 'fixed',
        color: 'action.active',
        bgcolor: 'background.default',
        transform: isRTL ? 'translateX(50%)' : 'translateX(-50%)', // ✅ fix here
        zIndex: 'var(--layout-nav-zIndex)',
        ...(isRTL
          ? { right: isNavMini ? 'var(--layout-nav-mini-width)' : 'var(--layout-nav-vertical-width)' }
          : { left: isNavMini ? 'var(--layout-nav-mini-width)' : 'var(--layout-nav-vertical-width)' }),
        border: (theme) => `1px solid ${varAlpha(theme.vars.palette.grey['500Channel'], 0.12)}`,
        transition: (theme) =>
          theme.transitions.create(['left', 'right'], {
            easing: 'var(--layout-transition-easing)',
            duration: 'var(--layout-transition-duration)',
          }),
        '&:hover': {
          color: 'text.primary',
          bgcolor: 'background.neutral',
        },
        ...sx,
      }}
      {...other}
    >
      <SvgIcon
        sx={{
          width: 16,
          height: 16,
          ...(isNavMini && {
            transform: 'scaleX(-1)',
          }),
        }}
      >
        <path
          fill="currentColor"
          d="M13.83 19a1 1 0 0 1-.78-.37l-4.83-6a1 1 0 0 1 0-1.27l5-6a1 1 0 0 1 1.54 1.28L10.29 12l4.32 5.36a1 1 0 0 1-.78 1.64"
        />
      </SvgIcon>
    </IconButton>
  );
}
