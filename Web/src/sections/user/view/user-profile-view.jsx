'use client';

import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';

import { paths } from 'src/routes/paths';

import { useTabs } from 'src/hooks/use-tabs';

import { DashboardContent } from 'src/layouts/dashboard';
import { _userAbout, _userFeeds, _userFriends, _userGallery, _userFollowers } from 'src/_mock';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { useMockedUser } from 'src/auth/hooks';

import { ProfileHome } from '../profile-home';
import { ProfileCover } from '../profile-cover';
import { ProfileFriends } from '../profile-friends';
import { ProfileGallery } from '../profile-gallery';
import { ProfileFollowers } from '../profile-followers';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { useTranslation } from 'react-i18next';
import { KanbanListView } from 'src/sections/kanban/view/kanban-list-view';
import { TimesheetListView } from 'src/sections/timesheet/view/timesheet-list-view';
import { getUserDetail } from 'src/actions/userManage/userManageActions';
import { UserPermissionsView } from '../user-permissions-view';
import { RolesView } from '../roles-view';

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

export function UserProfileView({ userId }) {
  const { userDetails, userDetailsLoading, userDetailsError, mutate } = getUserDetail(userId);

  const { t, i18n } = useTranslation('dashboard/teams');
  const TABS = [
    {
      value: 'profile',
      label: t('user_profile.tabs.profile'),
      icon: <Iconify icon="solar:user-id-bold" width={16} />,
    },
    {
      value: 'tasks',
      label: t('user_profile.tabs.tasks'),
      icon: <Iconify icon="solar:checklist-bold" width={16} />,
    },
    {
      value: 'timesheet',
      label: t('user_profile.tabs.timesheet'),
      icon: <Iconify icon="solar:calendar-bold" width={16} />,
    },
    // {
    //   value: 'permissions',
    //   label: 'Permissions',
    //   icon: <Iconify icon="mdi:key" width={16} />,
    // },
  ];
  const { user } = useMockedUser();
  console.log('this is the user about', user);

  const [searchFriends, setSearchFriends] = useState('');

  const tabs = useTabs('profile');

  const handleSearchFriends = useCallback((event) => {
    setSearchFriends(event.target.value);
  }, []);
  const isUser = true;

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading={t('user_profile.heading')}
        links={[
          { name: t('user_profile.breadcrumb_dashboard'), href: paths.dashboard.root },
          { name: t('user_profile.breadcrumb_users'), href: paths.dashboard.user.list },
          { name: userDetails?.details?.fullName },
        ]}
        sx={{ mb: 1 }}
      />

      <Card sx={{ mb: 3 }}>
        <ProfileCover userDetails={userDetails} />

        <Box
          display="flex"
          justifyContent={{ xs: 'center', md: 'flex-end' }}
          sx={{
            width: 1,
            bottom: 0,
            zIndex: 9,
            px: { md: 3 },
            position: 'absolute',
            bgcolor: 'background.paper',
          }}
        >
          <Tabs value={tabs.value} onChange={tabs.onChange}>
            {TABS.map((tab) => (
              <Tab key={tab.value} value={tab.value} icon={tab.icon} label={tab.label} />
            ))}
          </Tabs>
        </Box>
      </Card>

      {tabs.value === 'profile' && (
        <ProfileHome info={_userAbout} posts={_userFeeds} userId={userId} />
      )}

      {tabs.value === 'tasks' && <KanbanListView isUser={isUser} userId={userId} />}

      {tabs.value === 'timesheet' && <TimesheetListView isUser={isUser} userId={userId} />}
      {tabs.value === 'permissions' && (
        // <UserPermissionsView
        //   isUser={isUser}
        //   userId={userId}
        //   userPermissions={userDetails?.details?.permissions}
        // />
        <RolesView
          isUser={isUser}
          userPermissions={userDetails?.details?.rolePermissions?.Extra}
          userId={userId}
          mutateUserDetails={mutate}
        />
      )}
    </DashboardContent>
  );
}
