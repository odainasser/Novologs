import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { CONFIG } from 'src/config-global';
import { varAlpha, bgGradient } from 'src/theme/styles';
import Avatar from '@mui/material/Avatar';

// ----------------------------------------------------------------------

export function AppWelcome({ title, titleAr, description, name, action, img, sx, ...other }) {
  const theme = useTheme();
  const storedLang = localStorage.getItem('selectedLang');

  return (
    <Box
      sx={{
        // ...bgGradient({
        //   color: `to right, ${varAlpha(
        //     theme.vars.palette.grey['900Channel'],
        //     0.88
        //   )} 0%, ${theme.vars.palette.grey[900]} 75%`,
        //   imgUrl: `${CONFIG.assetsDir}/assets/background/background-5.webp`,
        // }),
        p: 2,
        // gap: 5,
        borderRadius: 2,
        display: 'flex',
        height: { md: 1 },
        position: 'relative',
        alignItems: 'center',
        // color: 'common.white',
        textAlign: {
          xs: 'center',
          md: storedLang === 'ar' ? 'right' : 'left',
        },
        flexDirection: { xs: 'column', md: 'row' },
        boxShadow: '0 0 2px 0 rgba(145, 158, 171, 0.2), 0 12px 24px -4px rgba(145, 158, 171, 0.12)',
        // backgroundColor: '#000000',
        ...sx,
      }}
      {...other}
    >
      {name && (
        <Box
          sx={{
            position: 'absolute',
            top: theme.spacing(2),
            [storedLang === 'ar' ? 'left' : 'right']: theme.spacing(3),
          }}
        >
          <Typography variant="h4" sx={{ whiteSpace: 'pre-line' }}>
            {name}
          </Typography>
        </Box>
      )}
      <Box
        sx={{
          display: 'flex',
          flex: '1 1 auto',
          flexDirection: 'column',
          alignItems: { xs: 'center', md: 'flex-start' },
          pt: name ? 2 : 0,
        }}
      >
        <Typography variant="body2" sx={{ opacity: 0.64, maxWidth: 360, ...(action && { mb: 3 }) }}>
          {description}
        </Typography>
        <Typography
          variant="h6"
          sx={{
            whiteSpace: 'pre-line',
            mb: 1,
            height: '140px',
            overflowY: 'auto',
            width: '100%',
            pr: 1,
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-thumb': {
              borderRadius: '4px',
              background: '#006A67',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            scrollbarWidth: 'thin', // For Firefox
            scrollbarColor: '#006A67 transparent', // For Firefox
          }}
        >
          {storedLang === 'ar' ? titleAr || title : title}
        </Typography>

        {action && action}
      </Box>
      {(img || name) && (
        <Box sx={{ maxWidth: 260 }}>
          <Avatar src={img || undefined} sx={{ width: 100, height: 100 }}>
            {!img && name ? name.charAt(0).toUpperCase() : null}
          </Avatar>
        </Box>
      )}
    </Box>
  );
}
