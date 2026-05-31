'use client';

import { paths } from 'src/routes/paths';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { getUserDetail } from 'src/actions/userManage/userManageActions';
import { RolesView } from '../roles-view';
import { DashboardContent } from 'src/layouts/dashboard';
import Button from '@mui/material/Button';
import { Iconify } from 'src/components/iconify';
import { useRouter } from 'src/routes/hooks';
import Stack from '@mui/material/Stack';
import { useTranslation } from 'react-i18next';

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

export function UserRolesPermissionView({ userId }) {
  const { t, i18n } = useTranslation('dashboard/teams');
  const { userDetails, userDetailsLoading, userDetailsError, mutate } = getUserDetail(userId);
  const storedLang = localStorage.getItem('selectedLang');

  const isUser = true;
  const router = useRouter();
  const userRoles = userDetails?.details?.roles || [];
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading={t('profile.user_permissions')}
        links={[
          { name: t('teams.dashboard'), href: paths.dashboard.root },
          { name: t('user_profile.breadcrumb_users'), href: paths.dashboard.user.list },
          {
            name: (
              <span style={{ fontSize: '18px', fontWeight: 500 }}>
                {userDetails?.details?.fullName}{' '}
                <span style={{ fontSize: '16px', color: '#006A67' }}>
                  (Roles:
                  {userRoles.map((role, index) => (
                    <span key={index} style={{ marginLeft: '6px' }}>
                      • {role.replace(/([a-z])([A-Z])/g, '$1 $2')}
                    </span>
                  ))}
                  )
                </span>
              </span>
            ),
          },
        ]}
        sx={{ mb: 1 }}
      />
      <Stack direction="row" alignItems="center">
        <Button
          onClick={() => {
            router.push(paths.dashboard.user.list);
          }}
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
          {t('departments.buttons.back')}
        </Button>
      </Stack>
      <RolesView
        isUser={isUser}
        userPersonalPermissions={userDetails?.details?.rolePermissions?.Extra}
        userPermissions={userDetails?.details?.permissions}
        userRoles={userDetails?.details?.roles}
        userId={userId}
        mutateUserDetails={mutate}
      />
    </DashboardContent>
  );
}
