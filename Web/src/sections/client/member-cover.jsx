'use client';
import { useState } from 'react';

import { FaWindows } from 'react-icons/fa';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import { useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';

import { Label } from 'src/components/label';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import { Iconify } from 'src/components/iconify';
import { _members } from 'src/sections/client/client-mock-data';
import { AddTarget } from 'src/sections/client/add-target';
import { useTranslation } from 'react-i18next';

// ----------------------------------------------------------------------

export function MemberCover({ userDetails, mutateSalesTarget, salesTargetLength, existingTarget }) {
  const { t, i18n } = useTranslation('dashboard/client');
  const storedLang = localStorage.getItem('selectedLang');

  const theme = useTheme();
  const [mode, setMode] = useState('add');

  const [openTarget, setOpenTarget] = useState(false);
  const handleOpenTarget = () => {
    setOpenTarget(true);
  };
  const handleTargetDialogClose = () => {
    setTimeout(() => {
      setOpenTarget(false);
    }, 100);
  };
  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', m: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} alignItems="center" spacing={2}>
          <Avatar
            alt={userDetails?.details?.fullName}
            src={userDetails?.details?.profileImageFileUrl}
            sx={{
              width: { xs: 64, md: 128 },
              height: { xs: 64, md: 128 },
              border: `solid 2px ${theme.vars.palette.common.white}`,
            }}
          >
            {userDetails?.details?.fullName?.charAt(0).toUpperCase()}
          </Avatar>

          <Stack spacing={0.3}>
            <Typography variant="h4">{userDetails?.details?.fullName}</Typography>
            <Typography variant="body2" sx={{ fontSize: '0.87rem' }}>
              {userDetails?.details?.departmentName?.value} -{' '}
              {userDetails?.details?.designationName?.value}
            </Typography>

            <Typography variant="body2" sx={{ fontSize: '0.87rem' }}>
              {userDetails?.details?.email}
            </Typography>

            <Typography variant="body2" sx={{ fontSize: '0.87rem' }}>
              {userDetails?.details?.phoneNumber}
            </Typography>

            {/* <Box sx={{ display: 'flex' }}>
              <Stack
                spacing={1}
                direction="row"
                sx={{ wordBreak: 'break-all', typography: 'body2' }}
              >
                <Label variant="soft" color="warning">
                  0
                </Label>
                <Typography sx={{ fontSize: '0.87rem' }}>
                  {' '}
                  {t('clients.labels.days_off')}
                </Typography>
              </Stack>
              <Stack
                spacing={1}
                direction="row"
                sx={{
                  wordBreak: 'break-all',
                  typography: 'body2',
                  ...(storedLang === 'ar' ? { mr: 2 } : { ml: 2 }),
                }}
              >
                <Label variant="soft" color="info">
                  0
                </Label>
                <Typography sx={{ fontSize: '0.87rem' }}>
                  {t('clients.labels.days_reported')}
                </Typography>
              </Stack>
              <Stack
                spacing={1}
                direction="row"
                sx={{
                  wordBreak: 'break-all',
                  typography: 'body2',
                  ...(storedLang === 'ar' ? { mr: 2 } : { ml: 2 }),
                }}
              >
                <Label variant="soft" color="success">
                  0
                </Label>
                <Typography sx={{ fontSize: '0.87rem' }}>
                  {t('clients.labels.days_work')}
                </Typography>
              </Stack>
            </Box> */}
          </Stack>
        </Stack>

        <Stack direction={{ xs: 'column', md: 'column' }} alignItems="end" spacing={2}>
          <Label
            variant="soft"
            color={
              !userDetails?.details?.lastWorkStatus?.workStatus?.name?.value
                ? 'success'
                : userDetails?.details?.lastWorkStatus?.workStatus?.color || 'success'
            }
          >
            {userDetails?.details?.lastWorkStatus?.workStatus?.name?.value || 'On Duty'}
          </Label>

          <Stack direction="row" spacing={1}>
            <Typography variant="body2">{t('clients.labels.device')} : </Typography>
            <FaWindows style={{ width: '18px', height: '18px', color: '#00A4EF' }} />
          </Stack>
          <Box sx={{ display: 'flex' }}>
            <Tooltip
              title={
                salesTargetLength === 0
                  ? t('clients.labels.add_target')
                  : t('clients.labels.edit_businesss_target')
              }
              arrow
            >
              <IconButton
                onClick={() => {
                  setOpenTarget(true);
                }}
              >
                <Iconify
                  icon={salesTargetLength === 0 ? 'fa:bullseye' : 'mdi:pencil-circle'}
                  width={20}
                  color="#006A67"
                />
              </IconButton>
            </Tooltip>

            <AddTarget
              open={openTarget}
              onClick={handleOpenTarget}
              handleClose={handleTargetDialogClose}
              mode={mode}
              memberId={userDetails?.details?.id}
              memberName={userDetails?.details?.fullName}
              mutateSalesTarget={mutateSalesTarget}
              salesTargetLength={salesTargetLength}
              existingTarget={existingTarget}
            />
          </Box>
        </Stack>
      </Box>
    </>
  );
}
