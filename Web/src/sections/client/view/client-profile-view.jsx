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
import { useTranslation } from 'react-i18next';



// ----------------------------------------------------------------------

export function ClientProfileView() {
  const { t, i18n } = useTranslation('dashboard/client'); 

  const TABS = [
    { value: 'profile', label: t('clients.labels.profile'), icon: <Iconify icon="solar:user-id-bold" width={24} /> },
    // { value: 'followers', label: 'Followers', icon: <Iconify icon="solar:heart-bold" width={24} /> },
    // {
    //   value: 'friends',
    //   label: 'Friends',
    //   icon: <Iconify icon="solar:users-group-rounded-bold" width={24} />,
    // },
    // {
    //   value: 'gallery',
    //   label: 'Gallery',
    //   icon: <Iconify icon="solar:gallery-wide-bold" width={24} />,
    // },
  ];
  
  const { user } = useMockedUser();
  console.log('this is the user about', user);

  const [searchFriends, setSearchFriends] = useState('');

  const tabs = useTabs('profile');

  const handleSearchFriends = useCallback((event) => {
    setSearchFriends(event.target.value);
  }, []);

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading={t('clients.labels.profile')}
        links={[
          { name: t('clients.labels.dashboard'), href: paths.dashboard.root },
          { name: t('clients.labels.users'), href: paths.dashboard.user.list },
          { name: user?.displayName },
        ]}
        sx={{ mb: 1 }}
      />

      <Card sx={{ mb: 3, height: 270 }}>
        <ProfileCover
          role={_userAbout.role}
          name={user?.displayName}
          avatarUrl={user?.photoURL}
          coverUrl={_userAbout.coverUrl}
          country={user?.country}
          email={user?.email}
          phoneNumber={user?.phoneNumber}
        />

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
          {/* <Tabs value={tabs.value} onChange={tabs.onChange}>
            {TABS.map((tab) => (
              <Tab key={tab.value} value={tab.value} icon={tab.icon} label={tab.label} />
            ))}
          </Tabs> */}
        </Box>
      </Card>

      {tabs.value === 'profile' && <ProfileHome info={_userAbout} posts={_userFeeds} />}

      {tabs.value === 'followers' && <ProfileFollowers followers={_userFollowers} />}

      {tabs.value === 'friends' && (
        <ProfileFriends
          friends={_userFriends}
          searchFriends={searchFriends}
          onSearchFriends={handleSearchFriends}
        />
      )}

      {tabs.value === 'gallery' && <ProfileGallery gallery={_userGallery} />}
    </DashboardContent>
  );
}
