import { useRef } from 'react';

import Fab from '@mui/material/Fab';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import { Typography } from '@mui/material';
import Divider from '@mui/material/Divider';
import InputBase from '@mui/material/InputBase';
import Grid from '@mui/material/Unstable_Grid2';
import CardHeader from '@mui/material/CardHeader';
import ListItemText from '@mui/material/ListItemText';

import { varAlpha } from 'src/theme/styles';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

import { AppTaskDetails } from 'src/sections/overview/app/app-task-details';
import { TargetSales } from 'src/sections/client/target-sales';
import { task_stats, project_stat, client_stat } from 'src/sections/user/user-mock-data';
import { UserTaskChart } from '../user/user-task-chart';
import CardContent from '@mui/material/CardContent';
import { lighten } from '@mui/system';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { getUserStatistics, getAdminStatistics } from 'src/actions/userManage/userManageActions';
import LinearProgress from '@mui/material/LinearProgress';
import { ErrorView } from 'src/sections/error/error-view';
import { EmptyContent } from 'src/components/empty-content';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
// ----------------------------------------------------------------------

export function ProfileHome({ userId, currency, isAdmin }) {
  const { t, i18n } = useTranslation('dashboard/teams');
  const storedLang = localStorage.getItem('selectedLang');
  const { userStatistics, userStatisticsLoading, userStatisticsError } = getUserStatistics(userId);
  const { adminStatistics, adminStatisticsLoading, adminStatisticsError } = getAdminStatistics();

  const theme = useTheme();

  const fileRef = useRef(null);
  const router = useRouter();
  if (userStatisticsLoading && !isAdmin)
    return (
      <div>
        <LinearProgress
          sx={{
            '& .MuiLinearProgress-bar': {
              backgroundColor: '#2FBBA8',
            },
            backgroundColor: 'rgba(47, 187, 168, 0.2)', // Lighter version of #2FBBA8 for the background
          }}
        />
      </div>
    );

  if (adminStatisticsLoading && isAdmin)
    return (
      <div>
        <LinearProgress
          sx={{
            '& .MuiLinearProgress-bar': {
              backgroundColor: '#2FBBA8',
            },
            backgroundColor: 'rgba(47, 187, 168, 0.2)', // Lighter version of #2FBBA8 for the background
          }}
        />
      </div>
    );
  if (userStatisticsError && !isAdmin) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          width: '-webkit-fill-available',
        }}
      >
        <ErrorView errorCode={userStatisticsError} />
      </Box>
    );
  }

  if (adminStatisticsError && isAdmin) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          width: '-webkit-fill-available',
        }}
      >
        <ErrorView errorCode={adminStatisticsError} />
      </Box>
    );
  }

  function SalesStatisticItem({ title, value, displayCurrency }) {
    return (
      <Card
        component="li"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderRadius: 1,
          width: '100%',
          pt: 2,
        }}
      >
        <Typography
          variant={displayCurrency ? 'h6' : 'h2'}
          sx={{
            fontWeight: !displayCurrency ? 'normal' : 'bold',
            p: displayCurrency ? '20px' : 0,
          }}
        >
          {value ?? 0}
        </Typography>
        <Divider sx={{ width: '100%', mt: 1 }} />
        <Box
          sx={{
            width: '100%',
            p: 1,
            textAlign: 'center',
          }}
        >
          <Typography variant="body1">
            {title}{' '}
            {displayCurrency && currency && (
              <Typography component="span" variant="caption" sx={{ color: 'text.secondary' }}>
                ({currency})
              </Typography>
            )}
          </Typography>
        </Box>
      </Card>
    );
  }

  const salesStatsData = [
    {
      id: 'totalClients',
      labelKey: 'total_clients',
      defaultValue: t('user_profile.profile_home.total_clients'),
      value: isAdmin
        ? adminStatistics?.statistics?.totalClients
        : userStatistics?.statistics?.totalClients,
    },
    {
      id: 'totalLeads',
      labelKey: 'open_leads',
      defaultValue: t('user_profile.profile_home.total_leads'),
      value: isAdmin
        ? adminStatistics?.statistics?.totalOpenLeads
        : userStatistics?.statistics?.totalOpenLeads,
    },
    {
      id: 'activeClients',
      labelKey: 'active_clients',
      defaultValue: t('user_profile.profile_home.active_clients'),
      value: isAdmin
        ? adminStatistics?.statistics?.activeClientsCount
        : userStatistics?.statistics?.activeClientsCount,
    },

    {
      id: 'thisMonthTarget',
      labelKey: 'this_month_target',
      defaultValue: t('user_profile.profile_home.sales_target'),
      value: isAdmin
        ? adminStatistics?.statistics?.thisMonthTarget
        : userStatistics?.statistics?.thisMonthTarget,
      useCurrency: true,
    },
    {
      id: 'leadAmount',
      labelKey: 'lead_amount',
      defaultValue: t('user_profile.profile_home.leads_amount'),
      value: isAdmin
        ? adminStatistics?.statistics?.totalLeadAmount
        : userStatistics?.statistics?.totalLeadAmount,
      useCurrency: true,
    },
    {
      id: 'awardedAmount',
      labelKey: 'awarded_amount',
      defaultValue: t('user_profile.profile_home.awarded_amount'),
      value: isAdmin
        ? adminStatistics?.statistics?.awardedLeadAmount
        : userStatistics?.statistics?.awardedLeadAmount,
      useCurrency: true,
    },
    {
      id: 'rejectedAmount',
      labelKey: 'rejected_amount',
      defaultValue: t('user_profile.profile_home.rejected_amount'),
      value: isAdmin
        ? adminStatistics?.statistics?.rejectedLeadAmount
        : userStatistics?.statistics?.rejectedLeadAmount,
      useCurrency: true,
    },
  ];

  const vendorStatsData = [
    {
      id: 'totalVendors',
      labelKey: 'total_vendors',
      defaultValue: t('user_profile.profile_home.total_vendors'),
      value: adminStatistics?.statistics?.totalVendors,
    },
    {
      id: 'activeVendors',
      labelKey: 'active_vendors',
      defaultValue: t('user_profile.profile_home.active_vendors'),
      value: adminStatistics?.statistics?.activeVendors,
    },
    {
      id: 'totalContracts',
      labelKey: 'total_contracts',
      defaultValue: t('user_profile.profile_home.total_contracts_year'),
      value: adminStatistics?.statistics?.totalContractsCreatedThisYear,
    },
  ];

  const usersData = [
    {
      id: 'totalUsers',
      labelKey: 'total_users',
      defaultValue: t('user_profile.profile_home.total_users'),
      value: adminStatistics?.statistics?.teamMembersCount,
    },

    {
      id: 'internalUsers',
      labelKey: 'internal_users',
      defaultValue: t('user_profile.profile_home.internal_users'),
      value: adminStatistics?.statistics?.internalUsersCount,
    },
    {
      id: 'externalUsers',
      labelKey: 'external_users',
      defaultValue: t('user_profile.profile_home.external_users'),
      value: adminStatistics?.statistics?.externalUsersCount,
    },
  ];

  const projectTaskData = [
    {
      id: 'totalTasks',
      labelKey: 'total_tasks',
      defaultValue: t('user_profile.profile_home.total_tasks'),
      value: adminStatistics?.statistics?.totalTasks,
    },

    {
      id: 'totalProjects',
      labelKey: 'total_projects',
      defaultValue: t('user_profile.profile_home.total_projects'),
      value: adminStatistics?.statistics?.totalProjects,
    },
  ];
  let filteredStats;
  if (isAdmin) {
    filteredStats =
      adminStatistics?.statistics?.totalTasksByStatus?.filter(
        (stat) =>
          stat?.status?.status !== 5 && stat?.status?.status !== 6 && stat?.status?.status !== 7
      ) || [];
  } else {
    filteredStats =
      userStatistics?.statistics?.totalTasksByStatus?.filter(
        (stat) =>
          stat?.status?.status !== 5 && stat?.status?.status !== 6 && stat?.status?.status !== 7
      ) || [];
  }

  const taskChartCategories = filteredStats.map((stat) => {
    const name = stat?.status?.name;

    if (!name) return storedLang === 'ar' ? 'حالة غير معروفة' : 'Unknown status';

    if (storedLang === 'ar') {
      return (
        name.localizedStrings?.find((ls) => ls.language.toLowerCase() === 'ar')?.value ||
        name.value ||
        'حالة غير معروفة'
      );
    }

    return name.value || 'Unknown status';
  });

  const taskChartSeriesData = filteredStats.map((stat) => stat.count || 0);

  const taskChartColors = filteredStats.map((stat) =>
    lighten(stat.status?.color || theme.palette.grey[500], 0.3)
  );

  const taskChartSeries = [{ data: taskChartSeriesData.length > 0 ? taskChartSeriesData : [] }];

  let monthlyTargets;

  if (isAdmin) {
    monthlyTargets = adminStatistics?.statistics?.monthlyTargets;
  } else {
    monthlyTargets = userStatistics?.statistics?.monthlyTargets;
  }
  let seriesNameForTargetChart = new Date().getFullYear().toString(); // Default year
  let targetSalesSeriesData;

  if (monthlyTargets && monthlyTargets.length > 0) {
    if (monthlyTargets[0].month) {
      try {
        const yearFromData = new Date(monthlyTargets[0].month).getFullYear();
        if (!Number.isNaN(yearFromData)) {
          seriesNameForTargetChart = yearFromData.toString();
        }
      } catch (e) {
        console.error('Error parsing year from monthlyTargets: ', e);
        // seriesNameForTargetChart remains default
      }
    }
    targetSalesSeriesData = [
      {
        name: seriesNameForTargetChart,
        data: [
          {
            name: t('user_profile.profile_home.target'),
            data: monthlyTargets.map((item) => item.target || 0),
          },
          {
            name: t('user_profile.profile_home.chart_labels.achieved'),
            data: monthlyTargets.map((item) => item.achived || 0),
          },
        ],
      },
    ];
  } else {
    targetSalesSeriesData = [
      {
        name: seriesNameForTargetChart,
        data: [
          { name: t('user_profile.profile_home.target'), data: Array(12).fill(0) },
          { name: t('user_profile.profile_home.chart_labels.achieved'), data: Array(12).fill(0) },
        ],
      },
    ];
  }

  let projectStats;
  if (isAdmin) {
    projectStats = adminStatistics?.statistics?.projectStatistics || [];
  } else {
    projectStats = userStatistics?.statistics?.projectStatistics || [];
  }

  const displayedProjectStats = projectStats.slice(0, 5);
  const showViewMoreProjectsButton = projectStats.length > 5;

  let filteredTaskStats;
  if (isAdmin) {
    filteredTaskStats =
      adminStatistics?.statistics?.totalTasksByStatus?.filter(
        (stat) =>
          stat?.status?.status !== 5 && stat?.status?.status !== 6 && stat?.status?.status !== 7
      ) || [];
  } else {
    filteredTaskStats =
      userStatistics?.statistics?.totalTasksByStatus?.filter(
        (stat) =>
          stat?.status?.status !== 5 && stat?.status?.status !== 6 && stat?.status?.status !== 7
      ) || [];
  }
  const getDisplayName = (stat) => {
    const defaultValue = stat?.status?.name?.value;

    if (storedLang !== 'ar') return defaultValue;

    const arabicString = stat?.status?.name?.localizedStrings?.find(
      (item) => item.language?.toLowerCase() === 'ar'
    )?.value;

    return arabicString || defaultValue;
  };
  return (
    <Grid
      container
      spacing={3}
      sx={{
        width: '-webkit-fill-available',
        ...(isAdmin && { mt: 1 }),
        ...(!isAdmin && { m: 0 }),
      }}
    >
      {isAdmin && (
        <Grid xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardHeader
              title="Users"
              sx={{ p: 0, pt: 2, ...(storedLang === 'ar' ? { pr: 2 } : { pl: 2 }) }}
            />
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Box
                component="ul"
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
                  gap: 2,
                  listStyle: 'none',
                  p: 0,
                  m: 0,
                }}
              >
                {usersData.map((stat) => (
                  <SalesStatisticItem
                    key={stat.id}
                    title={t(stat.labelKey, stat.defaultValue)}
                    value={stat.value}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      )}

      {isAdmin && (
        <Grid xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardHeader
              title="Tasks and Projects"
              sx={{ p: 0, pt: 2, ...(storedLang === 'ar' ? { pr: 2 } : { pl: 2 }) }}
            />
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Box
                component="ul"
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
                  gap: 2,
                  listStyle: 'none',
                  p: 0,
                  m: 0,
                }}
              >
                {projectTaskData.map((stat) => (
                  <SalesStatisticItem
                    key={stat.id}
                    title={t(stat.labelKey, stat.defaultValue)}
                    value={stat.value}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      )}
      <Grid xs={12} md={6}>
        <Card sx={{ height: '100%' }}>
          <CardHeader
            title={isAdmin ? 'Assigned Tasks' : t('user_profile.profile_home.tasks_title')}
            sx={{
              p: 0,
              pt: 2,
              ...(storedLang === 'ar' ? { pr: 2 } : { pl: 2 }),
            }}
          />
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Box
              component="ul"
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
                gap: 2,
                listStyle: 'none',
                p: 0,
                m: 0,
              }}
            >
              {filteredTaskStats.slice(0, 3).map((stat, index) => (
                <Card
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    pt: 2,
                    borderRadius: 1,
                    cursor: 'pointer',
                  }}
                  key={stat?.status?.id || index}
                  onClick={() => router.push(paths.dashboard.kanban.list)}
                >
                  <Typography variant="h2" sx={{ fontWeight: 'normal' }}>
                    {stat.count}
                  </Typography>
                  <Divider sx={{ width: '100%', mt: 1 }} />
                  <Box
                    sx={{
                      background: lighten(stat.status?.color || theme.palette.grey[500], 0.3),
                      width: '100%',
                      p: 1,
                      textAlign: 'center',
                      color: '#ffffff',
                    }}
                  >
                    <Typography variant="body1">{getDisplayName(stat)}</Typography>
                  </Box>
                </Card>
              ))}
            </Box>
            {filteredTaskStats.length > 3 && (
              <Box
                component="ul"
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: 'repeat(3, 1fr)', sm: 'repeat(3, 1fr)' },
                  gap: 2,
                  listStyle: 'none',
                  p: 0,
                  m: 0,
                  mt: 2,
                }}
              >
                {filteredTaskStats.slice(3, 5).map((stat, index) => (
                  <Card
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      pt: 2,
                      borderRadius: 1,
                      cursor: 'pointer',
                    }}
                    key={stat?.status?.id || index}
                    onClick={() => router.push(paths.dashboard.kanban.list)}
                  >
                    <Typography variant="h2" sx={{ fontWeight: 'normal' }}>
                      {stat.count}
                    </Typography>
                    <Divider sx={{ width: '100%', mt: 1 }} />
                    <Box
                      sx={{
                        background: lighten(stat.status?.color || theme.palette.grey[500], 0.3),
                        width: '100%',
                        p: 1,
                        textAlign: 'center',
                        color: '#ffffff',
                      }}
                    >
                      <Typography variant="body1"> {getDisplayName(stat)}</Typography>
                    </Box>
                  </Card>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>
      <Grid xs={12} md={6}>
        <UserTaskChart
          sx={{ height: '100%' }}
          title={isAdmin ? 'Assigned Tasks to Date' : t('user_profile.profile_home.tasks_year_to_date')}
          chart={{
            categories: taskChartCategories,
            series: taskChartSeries,
            colors: taskChartColors.length > 0 ? taskChartColors : undefined,
          }}
        />
      </Grid>
      <Grid xs={12} md={12}>
        <Card>
          <CardHeader
            title={t('user_profile.profile_home.projects_title')}
            sx={{ p: 0, pt: 2, ...(storedLang === 'ar' ? { pr: 2 } : { pl: 2 }) }}
          />
          <Stack spacing={3} sx={{ p: 3 }}>
            {displayedProjectStats.length > 0 ? (
              <Grid container spacing={2}>
                {displayedProjectStats?.map((stat) => {
                  const inProgressStatus = stat.totalTasksByStatus?.find(
                    (taskStatus) => taskStatus.status.status === 1
                  );

                  const inProgressCount = inProgressStatus ? inProgressStatus.count : 0;
                  const inProgressLabel = inProgressStatus
                    ? storedLang === 'ar'
                      ? inProgressStatus.status?.name?.localizedStrings?.find(
                          (ls) => ls.language.toLowerCase() === 'ar'
                        )?.value || inProgressStatus.status?.name?.value
                      : inProgressStatus.status?.name?.value
                    : storedLang === 'ar'
                      ? 'قيد التنفيذ'
                      : 'In Progress';

                  return (
                    <Grid item sx={{ width: '20%' }} key={stat.project?.id}>
                      <Card
                        variant="outlined"
                        sx={{
                          py: 1,
                          px: 2,
                          cursor: 'pointer',
                        }}
                        onClick={() =>
                          router.push(paths.dashboard.project.details(stat.project?.id))
                        }
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                          }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                            }}
                          >
                            <Box
                              sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-start',
                                width: '16vw',
                              }}
                            >
                              {/* <Box color="#006A67">{stat?.project?.code || '000'}</Box> */}
                              <Box color="#006A67">
                                {String(stat?.project?.serial).padStart(4, '0')}
                              </Box>

                              <Typography
                                variant="h4"
                                sx={{
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  maxWidth: '100%',
                                  minWidth: 0,
                                }}
                              >
                                {stat?.project?.name}
                              </Typography>

                              <Box display="flex" gap={1} alignItems="center">
                                <Typography variant="body1">{inProgressCount}</Typography>
                                <Typography variant="caption">{t('profile.tabs.tasks')}</Typography>
                                <Typography variant="caption" sx={{ color: '#FFB85A' }}>
                                  {inProgressLabel}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        </Box>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            ) : (
              <EmptyContent
                filled
                sx={{ py: 1 }}
                title={t('profile.no_project')}
                description={t('profile.no_project_details')}
              />
            )}
            {showViewMoreProjectsButton && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  onClick={() => router.push(paths.dashboard.project.list)}
                  variant="contained"
                  size="small"
                  sx={{ background: '#006A67' }}
                >
                  {t('table.actions.view_more')}
                </Button>
              </Box>
            )}
          </Stack>
        </Card>
      </Grid>
      <Grid xs={12} md={6}>
        <Card sx={{ height: '100%' }}>
          <CardHeader
            title={t('user_profile.profile_home.sales_title')}
            sx={{ p: 0, pt: 2, ...(storedLang === 'ar' ? { pr: 2 } : { pl: 2 }) }}
          />
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Box
              component="ul"
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
                gap: 2,
                listStyle: 'none',
                p: 0,
                m: 0,
              }}
            >
              {salesStatsData
                .filter((stat) => !stat.useCurrency)
                .map((stat) => (
                  <SalesStatisticItem
                    key={stat.id}
                    title={t(stat.labelKey, stat.defaultValue)}
                    value={stat.value}
                    displayCurrency={stat.useCurrency}
                  />
                ))}
            </Box>

            <Box
              component="ul"
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                gap: 2,
                listStyle: 'none',
                p: 0,
                m: 0,
                mt: 2,
              }}
            >
              {salesStatsData
                .filter((stat) => stat.useCurrency)
                .map((stat) => (
                  <SalesStatisticItem
                    key={stat.id}
                    title={t(stat.labelKey, stat.defaultValue)}
                    value={new Intl.NumberFormat('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(stat.value ?? 0)}
                    displayCurrency={stat.useCurrency}
                  />
                ))}
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Grid xs={12} md={6}>
        <TargetSales
          sx={{ height: '100%' }}
          title={t('user_profile.profile_home.overall_target')}
          chartHeight={260}
          chart={{
            categories: [
              t('user_profile.profile_home.months.jan', 'Jan'),
              t('user_profile.profile_home.months.feb', 'Feb'),
              t('user_profile.profile_home.months.mar', 'Mar'),
              t('user_profile.profile_home.months.apr', 'Apr'),
              t('user_profile.profile_home.months.may', 'May'),
              t('user_profile.profile_home.months.jun', 'Jun'),
              t('user_profile.profile_home.months.jul', 'Jul'),
              t('user_profile.profile_home.months.aug', 'Aug'),
              t('user_profile.profile_home.months.sep', 'Sep'),
              t('user_profile.profile_home.months.oct', 'Oct'),
              t('user_profile.profile_home.months.nov', 'Nov'),
              t('user_profile.profile_home.months.dec', 'Dec'),
            ],
            series: targetSalesSeriesData,
          }}
          currency={currency}
        />
      </Grid>
      {isAdmin && (
        <Grid xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardHeader
              title="Vendors"
              sx={{ p: 0, pt: 2, ...(storedLang === 'ar' ? { pr: 2 } : { pl: 2 }) }}
            />
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Box
                component="ul"
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
                  gap: 2,
                  listStyle: 'none',
                  p: 0,
                  m: 0,
                }}
              >
                {vendorStatsData.map((stat) => (
                  <SalesStatisticItem
                    key={stat.id}
                    title={t(stat.labelKey, stat.defaultValue)}
                    value={stat.value}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      )}
    </Grid>
  );
}
