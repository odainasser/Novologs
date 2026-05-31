'use client';
import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';

import { useTabs } from 'src/hooks/use-tabs';

import { _userAbout, _userFeeds, _userFriends, _userGallery, _userFollowers } from 'src/_mock';

import { Iconify } from 'src/components/iconify';

import { useMockedUser } from 'src/auth/hooks';

import { MemberHome } from '../member-home';
import { MemberCover } from '../member-cover';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { SalesReport } from '../sales-report';
import { useTranslation } from 'react-i18next';
import { getUserDetail } from 'src/actions/user-manage/userManageActions';
import { getSalesTarget } from 'src/actions/client/clientActions';

export function MemberProfileView({ memberId }) {
  const { userDetails, userDetailsLoading, userDetailsError } = getUserDetail(memberId);
  const [year, setYear] = useState('2025');
  const storedLang = localStorage.getItem('selectedLang');

  const {
    salesTarget,
    salesTargetLoading,
    salesTargetError,
    salesTargetValidating,
    salesTargetEmpty,
    mutate,
  } = getSalesTarget({ userId: memberId, year });

  const totalAchieved = salesTarget?.target?.reduce((sum, item) => sum + item.achivedValue, 0) || 0;
  const totalTarget = salesTarget?.target?.reduce((sum, item) => sum + item.value, 0) || 0;
  const remaining = totalTarget - totalAchieved;

  const { t, i18n } = useTranslation('dashboard/client');

  const TABS = [
    {
      value: 'details',
      label: t('clients.tabs.sales_details'),
      icon: (
        <Iconify
          icon="solar:user-id-bold"
          width={24}
          color="#006A67"
          sx={{
            ...(storedLang === 'ar' && { ml: 1 }),
          }}
        />
      ),
    },
    {
      value: 'sales',
      label: t('clients.tabs.sales_report'),
      icon: (
        <Iconify
          icon="mdi:chart-pie"
          width={24}
          color="#006A67"
          sx={{
            ...(storedLang === 'ar' && { ml: 1 }),
          }}
        />
      ),
    },
  ];
  const { user } = useMockedUser();

  const tabs = useTabs('details');

  return (
    <>
      <Card sx={{ mb: 3, pb: 4 }}>
        <MemberCover
          userDetails={userDetails}
          salesTargetLength={salesTarget?.totalTarget}
          mutateSalesTarget={mutate}
          existingTarget={salesTarget?.target || []}
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
          <Tabs value={tabs.value} onChange={tabs.onChange}>
            {TABS.map((tab) => (
              <Tab key={tab.value} value={tab.value} icon={tab.icon} label={tab.label} />
            ))}
          </Tabs>
        </Box>
      </Card>

      {tabs.value === 'details' && <MemberHome memberId={memberId} />}
      {tabs.value === 'sales' && (
        <SalesReport
          memberId={memberId}
          salesTarget={salesTarget}
          salesTargetLoading={salesTargetLoading}
          salesTargetError={salesTargetError}
          salesTargetLength={salesTarget?.totalTarget}
          totalAchieved={totalAchieved}
          totalTarget={totalTarget}
          remaining={remaining}
        />
      )}
    </>
  );
}
