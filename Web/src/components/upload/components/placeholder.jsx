import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

import { UploadIllustration } from 'src/assets/illustrations';
import { useTranslation } from 'react-i18next';


// ----------------------------------------------------------------------

export function UploadPlaceholder({ sx, ...other }) {
   const { t, i18n } = useTranslation('dashboard/upload');
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      flexDirection="column"
      sx={sx}
      {...other}
    >
      <UploadIllustration hideBackground sx={{ width: 200 }} />

      <Stack spacing={1} sx={{ textAlign: 'center' }}>
        <Box sx={{ typography: 'h6' }}>{t("upload.drop_or_select")}</Box>
        <Box sx={{ typography: 'body2', color: 'text.secondary' }}>
        {t("upload.drop_here")}
          <Box
            component="span"
            sx={{ mx: 0.5, color: 'primary.main', textDecoration: 'underline' }}
          >
            {t("upload.browse")}
          </Box>
          {t("upload.browse_suffix")}
        </Box>
      </Stack>
    </Box>
  );
}
