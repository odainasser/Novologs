'use client';
import Button from '@mui/material/Button';
import { Iconify } from 'src/components/iconify';
import Stack from '@mui/material/Stack';

import { useTheme } from '@mui/material';
import { DashboardContent } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { RouterLink } from 'src/routes/components';
import { paths } from 'src/routes/paths';
import { useSearchParams } from 'src/routes/hooks';
import { MemberProfileView } from 'src/sections/client/view/member-profile-view';
import { useTranslation } from 'react-i18next';

// ----------------------------------------------------------------------
export function MemberDetails({ memberId }) {
  const { t, i18n } = useTranslation('dashboard/client');
  const storedLang = localStorage.getItem('selectedLang');

  const theme = useTheme();

  const searchParams = useSearchParams();

  const groupId = searchParams.get('key');

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading={t('clients.labels.member_sales')}
        links={[
          { name: t('clients.List.dashboard'), href: paths.dashboard.root },
          { name: t('clients.tabs.groups'), href: paths.dashboard.client.list },
          { name: t('clients.labels.member_sales') },
        ]}
        sx={{ mb: 2 }}
      />

      <Stack direction="row" alignItems="center" sx={{ mb: 2 }}>
        <Button
          component={RouterLink}
          href={paths.dashboard.client.list}
          variant="outlined"
          startIcon={
            <Iconify
              icon="eva:arrow-back-fill"
              sx={{
                transform: storedLang === 'ar' ? 'rotate(180deg)' : 'none',
                ...(storedLang === 'ar' && { ml: 1 }),
              }}
            />
          }
        >
          {t('clients.buttons.back')}
        </Button>
      </Stack>

      <MemberProfileView memberId={memberId} />
    </DashboardContent>
  );
}
