'use client';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';

import { allLangs } from 'src/locales';
import { Logo } from 'src/components/logo';
import { useTranslation } from 'react-i18next';

import { Main } from 'src/layouts/simple/main';
import { LayoutSection } from 'src/layouts/core/layout-section';
import { HeaderSection } from 'src/layouts/core/header-section';
import { LanguagePopover } from 'src/layouts/components/language-popover';
import { SettingsButton } from 'src/layouts/components/settings-button';
import { SupportSearchBar } from './support-search-bar';

// ----------------------------------------------------------------------

export function SupportLayout({ sx, children, header }) {
  const { i18n } = useTranslation();
  const layoutQuery = 'md';



  return (
    <LayoutSection
      dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
      /** **************************************
       * Header
       *************************************** */
      headerSection={
        <HeaderSection
          layoutQuery={layoutQuery}
          slotProps={{ container: { maxWidth: false } }}
          sx={header?.sx}
          slots={{
            topArea: (
              <Alert severity="info" sx={{ display: 'none', borderRadius: 0 }}>
                This is an info Alert.
              </Alert>
            ),
            leftArea: <Logo />,
            centerArea: <SupportSearchBar />,
            rightArea: (
              <Box display="flex" alignItems="center" gap={{ xs: 1, sm: 1.5 }}>
                {/* -- Language popover -- */}
                <LanguagePopover
                  data={allLangs}
                  sx={{
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.1)'
                    }
                  }}
                />
                {/* -- Settings button -- */}
                <SettingsButton />
              </Box>
            ),
          }}
        />
      }
      /** **************************************
       * Footer
       *************************************** */
      footerSection={null}
      /** **************************************
       * Style
       *************************************** */
      cssVars={{
        '--layout-simple-content-compact-width': '448px',
      }}
      sx={sx}
    >
      <Main>{children}</Main>
    </LayoutSection>
  );
}

