import { useState, useCallback, useEffect } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Pagination from '@mui/material/Pagination';
import Avatar from '@mui/material/Avatar';
import Snackbar from '@mui/material/Snackbar';
import LinearProgress from '@mui/material/LinearProgress';
import { Tooltip } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import { Iconify } from 'src/components/iconify';
import { useTheme } from '@mui/material/styles';
import { lighten } from '@mui/system';
import { Label } from 'src/components/label';
import { varAlpha } from 'src/theme/styles';
import { EmptyContent } from 'src/components/empty-content';
import { useTranslation } from 'react-i18next';
import { MemberTaskChart } from './member-task-chart';

export function ProjectMembers({ filteredMembers }) {
  console.log('this is the member tasks', filteredMembers);
  const { t, i18n } = useTranslation('dashboard/projects');
  const storedLang = localStorage.getItem('selectedLang');

  const theme = useTheme();

  const [page, setPage] = useState(1);
  const itemsPerPage = 9;

  const totalPages = Math.ceil(filteredMembers?.length / itemsPerPage);

  const [approved, setApproved] = useState([]);

  const handleClick = useCallback(
    (item) => {
      const selected = approved.includes(item)
        ? approved.filter((value) => value !== item)
        : [...approved, item];
      setApproved(selected);
    },
    [approved]
  );

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const paginatedMembers = filteredMembers?.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <>
      {filteredMembers?.length === 0 ? (
        <EmptyContent
          filled
          sx={{ py: 10, mt: 2 }}
          title={t('projects.status.no_members_found')}
          description={t('projects.status.no_members_desc')}
        />
      ) : (
        <>
          <Box
            gap={3}
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(4, 1fr)',
              xl: 'repeat(4, 1fr)',
            }}
            sx={{ mt: 4 }}
          >
            {paginatedMembers?.map((member) => (
              <BookerItem
                theme={theme}
                member={member}
                selected={approved.includes(member?.id)}
                onSelected={() => handleClick(member?.id)}
              />
            ))}
          </Box>

          <Box display="flex" justifyContent="center" sx={{ mt: { xs: 5, md: 8 } }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              sx={{
                '& .MuiPaginationItem-icon': {
                  transform: storedLang === 'ar' ? 'rotate(180deg)' : 'none',
                },
              }}
            />
          </Box>
        </>
      )}
    </>
  );
}

function BookerItem({ member, theme }) {
  const taskStatistics = member?.taskStatistics || [];
  const allTaskCount = member?.totalTaskCount;

  const taskSummaryMap = new Map();

  taskStatistics.forEach((stat) => {
    const name = stat.status?.name?.value || '';
    const count = stat.taskCount || 0;
    const color = lighten(stat.status?.color || theme.palette.grey[400], 0.3);

    if (taskSummaryMap.has(name)) {
      const existing = taskSummaryMap.get(name);
      taskSummaryMap.set(name, {
        count: existing.count + count,
        color: existing.color,
      });
    } else {
      taskSummaryMap.set(name, { count, color });
    }
  });

  const taskLabels = [];
  const taskCounts = [];
  const taskColors = [];

  taskSummaryMap.forEach((value, key) => {
    taskLabels.push(`${value.count} ${key}`);
    taskCounts.push(value.count);
    taskColors.push(value.color);
  });

  return (
    <Card key={member?.id} sx={{ p: 2, gap: 2, display: 'flex' }}>
      <Stack spacing={2} flexGrow={1}>
        <Box display="flex" alignItems="center" gap={1} justifyContent="center">
          <Avatar
            alt={member?.user?.fullName}
            src={member?.user?.profileImageFileUrl || '/default-avatar.png'}
            sx={{ width: 48, height: 48 }}
          />
          <ListItemText
            primary={member?.user?.fullName}
            secondary={member?.user?.designationName?.value}
            secondaryTypographyProps={{
              mt: 0.5,
              component: 'span',
              typography: 'caption',
              color: 'text.disabled',
            }}
          />
        </Box>

        {taskStatistics.length === 0 ? (
          <EmptyContent
            filled
            title="No tasks found"
            description="No project tasks found for this user"
          />
        ) : (
          <MemberTaskChart
            chart={{
              categories: taskLabels,
              series: taskCounts,
              chartColors: taskColors,
            }}
          />
        )}
      </Stack>
    </Card>
  );
}
