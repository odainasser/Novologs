import { FaWindows } from 'react-icons/fa';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Checkbox from '@mui/material/Checkbox';
import { useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
import { useTranslation } from 'react-i18next';

import { Label } from 'src/components/label';
import { userRights } from 'src/sections/user/user-mock-data';

// ----------------------------------------------------------------------

export function ProfileCover({ userDetails }) {
  const { t, i18n } = useTranslation('dashboard/teams');
  const storedLang = localStorage.getItem('selectedLang');

  const theme = useTheme();

  const userRoles = userDetails?.details?.roles ? [...new Set(userDetails.details.roles)] : [];
  const rolesPerBox = 4;
  const formatRoleName = (str) => str.replace(/([a-z])([A-Z])/g, '$1 $2');

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', m: 2, mb: 6 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
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
              {t('table.headings.designation')} :{' '}
              {storedLang === 'ar'
                ? userDetails?.details?.designationName?.localizedStrings?.find(
                    (ls) => ls.language.toLowerCase() === 'ar'
                  )?.value || userDetails?.details?.designationName?.value
                : userDetails?.details?.designationName?.value}
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.87rem' }}>
              {t('table.headings.department')} :{' '}
              {storedLang === 'ar'
                ? userDetails?.details?.departmentName?.localizedStrings?.find(
                    (ls) => ls.language.toLowerCase() === 'ar'
                  )?.value || userDetails?.details?.departmentName?.value
                : userDetails?.details?.departmentName?.value}
            </Typography>

            <Typography variant="body2" sx={{ fontSize: '0.87rem' }}>
              {userDetails?.details?.email}
            </Typography>

            <Typography
              variant="body2"
              sx={{
                fontSize: '0.87rem',
                ...(storedLang === 'ar' && {
                  direction: 'ltr',
                  textAlign: 'end',
                }),
              }}
            >
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
                  {t('user_profile.profile_home.days_off')}
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
                  {t('user_profile.profile_home.days_reported')}
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
                  {t('user_profile.profile_home.days_work')}
                </Typography>
              </Stack>
            </Box> */}
          </Stack>
        </Stack>

        <Box>
          {/* <CardHeader title="User Permissions" /> */}
          <Box>
            {userRoles.slice(0, rolesPerBox).map((roleName) => (
              <Grid
                item
                key={roleName}
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                }}
              >
                <Checkbox checked={true} readOnly />
                <Typography style={{ marginLeft: 8 }} sx={{ fontSize: '0.875rem', mt: 1 }}>
                  {formatRoleName(roleName)}
                </Typography>
              </Grid>
            ))}
          </Box>
        </Box>
        <Box>
          {/* <CardHeader title="User Permissions" /> */}
          <Box>
            {userRoles.slice(rolesPerBox, rolesPerBox * 2).map((roleName) => (
              <Grid
                item
                key={roleName}
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                }}
              >
                <Checkbox checked={true} readOnly />
                <Typography style={{ marginLeft: 8 }} sx={{ fontSize: '0.875rem', mt: 1 }}>
                  {formatRoleName(roleName)}
                </Typography>
              </Grid>
            ))}
          </Box>
        </Box>

        <Stack direction={{ xs: 'column', md: 'column' }} alignItems="end" spacing={2}>
          <Label
            variant="soft"
            color={
              !userDetails?.details?.lastWorkStatus?.workStatus?.name?.value
                ? 'success'
                : userDetails?.details?.lastWorkStatus?.workStatus?.name?.value === 'On Duty'
                  ? 'success'
                  : 'warning'
            }
          >
            {
              storedLang === 'ar'
                ? userDetails?.details?.lastWorkStatus?.workStatus?.name?.localizedStrings?.find(
                    (ls) => ls.language.toLowerCase() === 'ar'
                  )?.value ||
                  userDetails?.details?.lastWorkStatus?.workStatus?.name?.value ||
                  'على رأس العمل' // Arabic fallback for "On Duty"
                : userDetails?.details?.lastWorkStatus?.workStatus?.name?.value || 'On Duty' // English fallback
            }
          </Label>

          {/* <Stack direction="row" spacing={1}>
            <Typography variant="body2"> {t('user_profile.profile_home.total_points')}:</Typography>
            <Label variant="soft" color="warning">
              1000
            </Label>
          </Stack> */}
          <Stack direction="row" spacing={1}>
            <Typography variant="body2"> {t('user_profile.profile_home.device')}:</Typography>
            <FaWindows style={{ width: '18px', height: '18px', color: '#00A4EF' }} />
          </Stack>
        </Stack>
      </Box>
    </>
  );
}
