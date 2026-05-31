import { FaWindows } from 'react-icons/fa';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Checkbox from '@mui/material/Checkbox';
import { useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';

import { Label } from 'src/components/label';
import Chip from '@mui/material/Chip';
import { Iconify } from 'src/components/iconify';
import AvatarGroup from '@mui/material/AvatarGroup';
import Tooltip from '@mui/material/Tooltip';
import { CONFIG } from 'src/config-global';
import { useMockedUser } from 'src/auth/hooks';
import { useTranslation } from 'react-i18next';
import { fDate } from 'src/utils/format-time';
import { getItemCost } from 'src/actions/timeSheet/timeSheetActions';
import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

export function ProjectCover({
  name,
  avatarUrl,
  role,
  coverUrl,
  country,
  email,
  phoneNumber,
  projectDetails,
}) {
  const { t, i18n } = useTranslation('dashboard/projects');
  const storedLang = localStorage.getItem('selectedLang');
  const { zetaUser } = useAuthContext();

  const theme = useTheme();
  const { user } = useMockedUser();
  console.log('this is the project details', projectDetails);
  const getTaskCostParams = {
    pagination: {
      pageNumber: 1,
      pageSize: 100,
    },
    creatFilter: 7,
    controlEntity: 2,
    controlEntityId: projectDetails?.id,
  };
  const {
    costList,
    costListLoading,
    costListError,
    costListValidating,
    costListEmpty,
    mutate: mutateCost,
  } = getItemCost(getTaskCostParams);

  const creatorName = projectDetails?.creator?.fullName || 'Not Available';
  const creatorAvatar = creatorName
    ? creatorName.charAt(0).toUpperCase()
    : creatorName.charAt(0).toUpperCase();
  const projectStatusConfig = {
    0: { text: t('projects.projects-status.created'), color: 'success' },
    1: { text: t('projects.projects-status.started'), color: 'info' },
    2: { text: t('projects.projects-status.closed'), color: 'default' },
    3: { text:  t('projects.projects-status.cancelled') ,color: 'error' },
    4: { text:  t('projects.projects-status.inprogress'), color: 'warning' },
    5: { text: t('projects.projects-status.postpone'), color: 'secondary' },
    6: { text:  t('projects.projects-status.amended'), color: 'primary' },
    7: { text: t('projects.projects-status.reopened'), color: 'info' },
    8: { text:  t('projects.projects-status.stopped'), color: 'error' },
  };
  const statusNumber = projectDetails?.status;
  let statusText;
  let statusColor;

  if (
    statusNumber !== undefined &&
    statusNumber !== null &&
    projectStatusConfig.hasOwnProperty(statusNumber)
  ) {
    statusText = projectStatusConfig[statusNumber].text;
    statusColor = projectStatusConfig[statusNumber].color;
  } else {
    statusText = t('projects.fields.created');
    statusColor = 'success';
  }
  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', m: 2, mb: 1 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <Stack spacing={0.3}>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="h4">{projectDetails?.name}</Typography>

              <Box
                sx={{
                  width: 15,
                  height: 15,
                  flexShrink: 0,
                  borderRadius: '50%',
                  backgroundColor: projectDetails?.color || 'grey',
                  cursor: 'pointer',
                  border: '1px solid #ccc',
                  mt: 1.5,
                }}
              />
            </Box>

            <Typography
              variant="body2"
              sx={{
                color: 'inherit',
                opacity: 0.7,
              }}
            >
              {projectDetails?.description || t('projects.employee_card.description_available')}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'inherit',
                opacity: 0.7,
              }}
            >
              {projectDetails?.department?.name?.value || t('projects.employee_card.department_not_available')}
            </Typography>
            <Box display="flex" gap={1} alignItems="center">
              <Box display="flex" gap={1} alignItems="center">
                <Typography
                  variant="body2"
                  sx={{
                    color: 'inherit',
                    opacity: 0.7,
                  }}
                >
                  {t('projects.table.creator')}:
                </Typography>
                <Tooltip title={`${creatorName}`} arrow>
                  <Avatar alt={creatorName} src={creatorAvatar} sx={{ width: 30, height: 30 }} />
                </Tooltip>
              </Box>

              <Box display="flex" gap={1} alignItems="center">
                <Typography
                  variant="body2"
                  sx={{
                    color: 'inherit',
                    opacity: 0.7,
                  }}
                >
                  {t('projects.table.members')}:
                </Typography>

                <AvatarGroup sx={{ cursor: 'pointer' }}>
                  {projectDetails?.projectMembers
                    .filter((member) => member.isOwner)
                    .slice(0, 2)
                    .map((person) => (
                      <Tooltip key={person?.memberId} title={`${person?.member?.fullName}`} arrow>
                        <Avatar
                          key={person.memberId}
                          alt={person?.member?.fullName}
                          src={person?.member?.photoPath}
                          sx={{ width: 30, height: 30 }}
                        >
                          {!person.member.photoPath &&
                            person.member.fullName?.charAt(0).toUpperCase()}
                        </Avatar>
                      </Tooltip>
                    ))}
                  {projectDetails?.projectMembers?.filter((member) => member.isOwner).length >
                    3 && (
                    <Avatar sx={{ width: 30, height: 30 }}>
                      +
                      {projectDetails?.projectMembers?.filter((member) => member.isOwner).length -
                        3}
                    </Avatar>
                  )}
                </AvatarGroup>
              </Box>

              <Box display="flex" gap={1} alignItems="center">
                <Typography
                  variant="body2"
                  sx={{
                    color: 'inherit',
                    opacity: 0.7,
                  }}
                >
                  {t('projects.members')}:
                </Typography>

                <AvatarGroup max={10} sx={{ cursor: 'pointer' }}>
                  {projectDetails?.projectMembers
                    .filter((member) => !member.isOwner)
                    .map((person) => (
                      <Tooltip key={person?.memberId} title={`${person?.member?.fullName}`} arrow>
                        <Avatar
                          key={person.memberId}
                          alt={person?.member?.fullName}
                          src={person?.member?.photoPath}
                          sx={{ width: 30, height: 30 }}
                        >
                          {!person.member.photoPath &&
                            person.member.fullName?.charAt(0).toUpperCase()}
                        </Avatar>
                      </Tooltip>
                    ))}
                </AvatarGroup>
              </Box>
            </Box>
          </Stack>
        </Stack>

        <Box>
          <Typography
            variant="body2"
            sx={{
              color: 'inherit',
              opacity: 0.7,
            }}
          >
            {t('projects.project_settings.tabs.initiative')}: {projectDetails?.initiative?.name?.value || 'Not available'}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'inherit',
              opacity: 0.7,
            }}
          >
            {t('projects.project_settings.tabs.goals')}:
            {projectDetails?.goal?.name?.value || t("projects.not_available")}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'inherit',
              opacity: 0.7,
            }}
          >
            Milestone:{' '}
            {projectDetails?.mileStones?.length > 0
              ? projectDetails?.mileStones?.map((milestone) => milestone.description).join(', ')
              : t("projects.not_available")}
          </Typography>
        </Box>

        <Box>
          {/* <Typography
            variant="body2"
            sx={{
              color: 'inherit',
              opacity: 0.7,
            }}
          >
            Modules: General Module
          </Typography> */}

          {/* <Typography
            variant="body2"
            sx={{
              color: 'inherit',
              opacity: 0.7,
            }}
          >
            Task Types: General Type
          </Typography> */}

          <Typography
            variant="body2"
            sx={{
              color: 'inherit',
              opacity: 0.7,
            }}
          >
          {t('projects.project_details.tabs.client')}: {projectDetails?.client?.name || t('projects.not_available')}
          </Typography>
        </Box>

        <Box>
          {' '}
          <Typography
            variant="body2"
            sx={{
              color: 'inherit',
              opacity: 0.7,
            }}
          >
            {t('projects.missions.startdate')}:{' '}
            {` ${
              !projectDetails?.startDate || projectDetails?.startDate.startsWith('0001-01-01')
                ?  t('projects.not_available')
                : fDate(projectDetails?.startDate)
            }`}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'inherit',
              opacity: 0.7,
            }}
          >
            {t('projects.missions.enddate')}:{' '}
            {` ${
              !projectDetails?.endDate || projectDetails?.endDate.startsWith('0001-01-01')
                ? t('projects.not_available')
                : fDate(projectDetails?.endDate)
            }`}
          </Typography>
        </Box>

        <Stack
          direction={{ xs: 'column', md: 'column' }}
          alignItems="end"
          spacing={2}
          justifyContent="space-between"
        >
          <Stack direction="row" spacing={1}>
            {projectDetails?.creatorId === zetaUser?.id && (
              <Chip
                label={t("projects.table.creator")}
                size="small"
                icon={
                  <Iconify
                    icon="mdi:account-star"
                    width={16}
                    style={{
                      marginRight: storedLang === 'ar' ? 8 : 0,
                    }}
                  />
                }
                sx={{
                  fontWeight: 'bold',
                  borderRadius: '16px',
                  mt: 1,
                  bgcolor: '#006A67',
                }}
              />
            )}
            {projectDetails?.projectMembers?.some(
              (m) => m.memberId === zetaUser?.id && m.isOwner === true
            ) && (
              <Chip
                label={t('projects.owner')}
                size="small"
                icon={
                  <Iconify
                    icon="mdi:account-eye"
                    width={16}
                    style={{
                      marginRight: storedLang === 'ar' ? 8 : 0,
                    }}
                  />
                }
                sx={{
                  fontWeight: 'bold',
                  borderRadius: '16px',
                  mt: 1,
                  ml: 0.5,
                  bgcolor: '#006A67',
                }}
              />
            )}
            {projectDetails?.projectMembers?.some(
              (m) => m.memberId === zetaUser?.id && m.isOwner === false
            ) && (
              <Chip
                label={t('projects.member')}
                size="small"
                icon={
                  <Iconify
                    icon="mdi:account-group"
                    width={16}
                    style={{
                      marginRight: storedLang === 'ar' ? 8 : 0,
                    }}
                  />
                }
                sx={{
                  fontWeight: 'bold',
                  borderRadius: '16px',
                  mt: 1,
                  ml: 0.5,
                  bgcolor: '#006A67',
                }}
              />
            )}
          </Stack>
        </Stack>
      </Box>

      <Box display="flex" alignItems="center" justifyContent="flex-end" sx={{ p: 1 }}>
        {zetaUser?.permissions?.includes('Project.ViewCost') && (
          <>
            <Chip
              icon={<Iconify icon="mdi:cash" />}
              label={`${t('projects.cost', t('projects.total_task'))}: ${costList?.costObject?.totalCost || 0} AED`}
              size="small"
              variant="soft"
              color="default"
              sx={{
                ...(storedLang === 'ar' ? { ml: 1 } : { mr: 1 }),
                '& .MuiChip-icon': {
                  ...(storedLang === 'ar' ? { marginLeft: 0, marginRight: 0.5 } : ''),
                },
              }}
            />

            {costList?.costObject?.totalDuration !== undefined &&
              costList?.costObject?.totalDuration !== null && (
                <Chip
                  icon={<Iconify icon="mdi:timer-outline" />}
                  label={`${t('projects.duration', t('projects.total_duration'))}: ${costList?.costObject?.totalDuration} ${t('tasks.days', 'hrs')}`}
                  size="small"
                  variant="soft"
                  sx={{
                    ...(storedLang === 'ar' ? { ml: 1 } : { mr: 1 }),
                    '& .MuiChip-icon': {
                      ...(storedLang === 'ar' ? { marginLeft: 0, marginRight: 0.5 } : ''),
                    },
                  }}
                />
              )}
          </>
        )}

        <Label variant="soft" color={statusColor} sx={{ cursor: 'pointer', ml: 1 }}>
          <Typography variant="caption" component="span">
            {statusText}
          </Typography>
        </Label>
      </Box>
    </>
  );
}
