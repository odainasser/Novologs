'use client';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { UserNewEditForm } from '../user-new-edit-form';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { Iconify } from 'src/components/iconify';
import { useRouter } from 'src/routes/hooks';

// ----------------------------------------------------------------------

export function UserAddMoreView({ user: currentUser }) {
  const { t, i18n } = useTranslation('dashboard/teams');
  const router = useRouter();

  return (
    <DashboardContent>
      <Box display="flex" gap={1}>
        <Stack direction="row" alignItems="center">
          <Button
            onClick={() => {
              router.push(paths.dashboard.user.list);
            }}
            variant="outlined"
            startIcon={<Iconify icon="eva:arrow-back-fill" />}
          >
            {t('table.headings.back')}
          </Button>
        </Stack>

        <CustomBreadcrumbs
          heading={t('teams.add_more_details')}
          links={[
            { name: t('teams.dashboard'), href: paths.dashboard.root },
            { name: t('teams.user'), href: paths.dashboard.user.list },
            { name: currentUser?.name },
          ]}
          sx={{ mb: { xs: 3, md: 2 }, ml: 1 }}
        />
      </Box>

      <UserNewEditForm currentUser={currentUser} />
    </DashboardContent>
  );
}
