import { useRef } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';

import { Typography } from '@mui/material';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Unstable_Grid2';
import CardHeader from '@mui/material/CardHeader';

import { TargetSales } from 'src/sections/client/target-sales';
import { task_stats, my_task_stats } from 'src/sections/project/project-mock-data';
import { UserTaskChart } from '../user/user-task-chart';
import CardContent from '@mui/material/CardContent';
import { lighten } from '@mui/system';
import { useTheme } from '@mui/material/styles';
import { ProjectCover } from './project-cover';
import { _userAbout } from 'src/_mock';
import { useMockedUser } from 'src/auth/hooks';
import { ProjectTaskTypeChart } from './project-task-type-chart';
import { ProjectMilestoneChart } from './project-milestone-chart';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

export function ProjectHome({ info, posts, projectDetails, taskStatistics, usersStatistics }) {
  console.log('this is the taskStatistics', taskStatistics);
  const { zetaUser } = useAuthContext();

  const { t, i18n } = useTranslation('dashboard/projects');
  const { user } = useMockedUser();

  const theme = useTheme();

  const chartCategories = [];
  const chartData = [];

  const filteredStats =
    taskStatistics?.filter(
      (stat) =>
        stat?.status?.status !== 5 && stat?.status?.status !== 6 && stat?.status?.status !== 7
    ) || [];

  filteredStats.forEach((stat) => {
    const label = stat?.status?.name?.value;
    const count = stat?.taskCount || 0;

    if (label) {
      chartCategories.push(label);
      chartData.push(count);
    }
  });

  const taskChartCategories =
    filteredStats.map((stat) => stat?.status?.name?.value || 'Unknown status') || [];

  const taskChartSeriesData = filteredStats.map((stat) => stat.taskCount || 0) || [];

  const taskChartColors =
    filteredStats.map((stat) => lighten(stat.status?.color || theme.palette.grey[500], 0.3)) || [];

  const taskChartSeries = [{ data: taskChartSeriesData.length > 0 ? taskChartSeriesData : [] }];

  const userStats = usersStatistics?.find((stat) => stat?.user?.id === zetaUser?.id);
  const combinedTaskStats = Object.values(
    (userStats?.taskStatistics || []).reduce((acc, stat) => {
      const key = stat.status?.status;
      if (!acc[key]) {
        acc[key] = { ...stat, taskCount: stat.taskCount || 0 };
      } else {
        acc[key].taskCount += stat.taskCount || 0;
      }
      return acc;
    }, {})
  );

  const filteredCombinedTaskStats =
    combinedTaskStats.filter(
      (stat) =>
        stat?.status?.status !== 5 && stat?.status?.status !== 6 && stat?.status?.status !== 7
    ) || [];

  const myTaskChartCategories = filteredCombinedTaskStats.map(
    (stat) => stat?.status?.name?.value || 'Unknown status'
  );

  const myTaskChartSeriesData = filteredCombinedTaskStats.map((stat) => stat.taskCount || 0);

  const myTaskChartColors = filteredCombinedTaskStats.map((stat) =>
    lighten(stat.status?.color || theme.palette.grey[500], 0.3)
  );

  const filteredProjectTasks = (taskStatistics || []).filter(
    (stat) => stat?.status?.status !== 5 && stat?.status?.status !== 6 && stat?.status?.status !== 7
  );
  const filteredMyTasks = (userStats?.taskStatistics || []).filter(
    (stat) => stat?.status?.status !== 5
  );
  const combinedMyTasks = Object.values(
    (filteredMyTasks || []).reduce((acc, stat) => {
      const key = stat.status?.status;
      if (!acc[key]) {
        acc[key] = {
          ...stat,
          taskCount: stat.taskCount || 0,
        };
      } else {
        acc[key].taskCount += stat.taskCount || 0;
      }
      return acc;
    }, {})
  );

  return (
    <>
      <Card sx={{ mb: 3, mt: 1 }}>
        <ProjectCover
          role={_userAbout.role}
          name={user?.displayName}
          avatarUrl={user?.photoURL}
          coverUrl={_userAbout.coverUrl}
          country={user?.country}
          email={user?.email}
          phoneNumber={user?.phoneNumber}
          projectDetails={projectDetails}
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
        ></Box>
      </Card>
      <Grid container spacing={3}>
        <Grid xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title={t('projects.table.project_tasks')} />
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
                {filteredProjectTasks.slice(0, 3).map((stat, index) => (
                  <Card
                    key={stat?.status?.id || index}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      pt: 2,
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="h2" sx={{ fontWeight: 'normal' }}>
                      {stat?.taskCount}
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
                      <Typography variant="body1">{stat?.status?.name?.value}</Typography>
                    </Box>
                  </Card>
                ))}
              </Box>
              {filteredProjectTasks.length > 3 && (
                <Box
                  component="ul"
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)' },
                    gap: 2,
                    listStyle: 'none',
                    p: 0,
                    m: 0,
                    mt: 2,
                  }}
                >
                  {filteredProjectTasks.slice(3, 5).map((stat, index) => (
                    <Card
                      key={stat?.status?.id || index}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        pt: 2,
                        borderRadius: 1,
                      }}
                    >
                      <Typography variant="h2" sx={{ fontWeight: 'normal' }}>
                        {stat?.taskCount}
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
                        <Typography variant="body1">{stat?.status?.name?.value}</Typography>
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
            title={t('projects.table.project_tasks')}
            chart={{
              categories: taskChartCategories,
              series: taskChartSeries,
              colors: taskChartColors.length > 0 ? taskChartColors : undefined,
            }}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title="My Project Tasks" />

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
                {combinedMyTasks.slice(0, 3).map((stat, index) => (
                  <Card
                    key={stat?.status?.id || index}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      pt: 2,
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="h2" sx={{ fontWeight: 'normal' }}>
                      {stat?.taskCount}
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
                      <Typography variant="body1">{stat?.status?.name?.value}</Typography>
                    </Box>
                  </Card>
                ))}
              </Box>

              {combinedMyTasks.length > 3 && (
                <Box
                  component="ul"
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)' },
                    gap: 2,
                    listStyle: 'none',
                    p: 0,
                    m: 0,
                    mt: 2,
                  }}
                >
                  {combinedMyTasks.slice(3, 5).map((stat, index) => (
                    <Card
                      key={stat?.status?.id || index}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        pt: 2,
                        borderRadius: 1,
                      }}
                    >
                      <Typography variant="h2" sx={{ fontWeight: 'normal' }}>
                        {stat?.taskCount}
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
                        <Typography variant="body1">{stat?.status?.name?.value}</Typography>
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
            title="My Project Tasks"
            chart={{
              categories: myTaskChartCategories,
              series: [{ data: myTaskChartSeriesData.length > 0 ? myTaskChartSeriesData : [] }],
              colors: myTaskChartColors.length > 0 ? myTaskChartColors : undefined,
            }}
          />
        </Grid>
      </Grid>
    </>
  );
}
