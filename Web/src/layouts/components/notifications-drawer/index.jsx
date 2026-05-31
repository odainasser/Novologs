'use client';

import { m } from 'framer-motion';
import { useState, useCallback, useEffect, useMemo } from 'react';

import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import SvgIcon from '@mui/material/SvgIcon';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { useBoolean } from 'src/hooks/use-boolean';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { varHover } from 'src/components/animate';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomTabs } from 'src/components/custom-tabs';

import { NotificationItem } from './notification-item';
import { getUserNotifications, clearNotification } from 'src/actions/user-manage/userManageActions';
import LinearProgress from '@mui/material/LinearProgress';
import { ErrorView } from 'src/sections/error/error-view';
import { EmptyContent } from 'src/components/empty-content';
import Pagination from '@mui/material/Pagination';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { toast } from 'src/components/snackbar';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { getTaskDetail } from 'src/actions/task/taskActions';
import { KanbanDetails } from 'src/sections/kanban/details/kanban-details';

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

export function NotificationsDrawer({ anchor = 'right', data = [], sx, ...other }) {
  console.log('this is the data', data);
  const storedLang = localStorage.getItem('selectedLang');
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;
  const handlePageChange = (event, newPage) => {
    setPage(newPage - 1);
  };
  const [currentTab, setCurrentTab] = useState('unread');
  const confirm = useBoolean();

  const taskDetailsOpen = useBoolean();
  const [taskId, setTaskId] = useState(null);
  const { taskDetails, taskDetailsLoading, taskDetailsError } = getTaskDetail(taskId, !!taskId);

  const getNotificationParams = useMemo(() => {
    const baseParams = {
      pagination: {
        pageNumber: page + 1,
        pageSize: rowsPerPage,
      },
      sort: {
        fieldName: 'Created',
        sortDirection: 1,
      },
      search: {
        logicOperator: 0,
        fieldName: 'Type',
        operator: 1,
        fieldValue: 21,
      },
    };

    if (currentTab === 'read') {
      return {
        ...baseParams,
        search: {
          fieldName: 'IsRead',
          fieldValue: true,
          logicOperator: 0,
          operator: 0,
          subFilters: [
            {
              logicOperator: 0,
              fieldName: 'Type',
              operator: 1,
              fieldValue: 21,
            },
          ],
        },
      };
    }
    if (currentTab === 'unread') {
      return {
        ...baseParams,
        search: {
          fieldName: 'IsRead',
          fieldValue: false,
          logicOperator: 0,
          operator: 0,
          subFilters: [
            {
              logicOperator: 0,
              fieldName: 'Type',
              operator: 1,
              fieldValue: 21,
            },
          ],
        },
      };
    }

    return baseParams;
  }, [page, rowsPerPage, currentTab]);
  const router = useRouter();

  const {
    userNotificationsList,
    userNotificationsListLoading,
    userNotificationsListError,
    userNotificationsListValidating,
    userNotificationsListEmpty,
    mutate,
  } = getUserNotifications(getNotificationParams);
  const totalItems =
    currentTab === 'unread'
      ? userNotificationsList?.totalUnreadNotifications
      : userNotificationsList?.totalNotifications;


  const handleOpen = useCallback(
    (notification) => {
      const data = notification?.data;

      if (data?.TaskId) {
        setTaskId(data.TaskId);
        taskDetailsOpen.onTrue();
        return;
      }


      if (data?.ProjectId) {
        router.push(paths.dashboard.project.details(data.ProjectId));
        return;
      }


      if (data?.DocumentId) {
        router.push(`/dashboard/documents/view/${data.DocumentId}`);
        return;
      }
    },
    [router, taskDetailsOpen]
  );

  const drawer = useBoolean();

  const [tabs, setTabs] = useState([
    // { value: 'all', label: 'All', count: 0 },
    { value: 'unread', label: 'Unread', count: 0 },
    { value: 'read', label: 'Read', count: 0 },
  ]);

  const handleChangeTab = useCallback((event, newValue) => {
    setCurrentTab(newValue);
  }, []);

  const [notifications, setNotifications] = useState([]);
  useEffect(() => {
    if (userNotificationsList?.userNotifications) {
      const totalCount = userNotificationsList.totalNotifications || 0;
      const unreadCount = userNotificationsList.totalUnreadNotifications || 0;
      const readCount = totalCount - unreadCount;

      setTabs([
        // { value: 'all', label: 'All', count: totalCount },
        { value: 'unread', label: 'Unread', count: unreadCount },
        { value: 'read', label: 'Read', count: readCount },
      ]);

      let countForTab = totalCount;
      if (currentTab === 'unread') countForTab = unreadCount;
      if (currentTab === 'read') countForTab = readCount;
    }
  }, [userNotificationsList, currentTab, rowsPerPage]);

  const totalPages = Math.ceil((totalItems || 0) / rowsPerPage);

  useEffect(() => {
    setPage(0);
  }, [currentTab]);

  const totalUnRead = userNotificationsList.totalUnreadNotifications;

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map((notification) => ({ ...notification, isRead: true })));
  };
  const handleClearNotification = async () => {
    try {
      const response = await clearNotification();
      if (response.success) {
        await mutate();
        toast.success('Cleared all notifications');
      } else {
        toast.error(response.error || 'Error clearing notifications');
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    }
  };

  const renderHead = (
    <Stack direction="row" alignItems="center" sx={{ py: 2, pl: 2.5, pr: 1, minHeight: 68 }}>
      <Typography variant="h6" sx={{ flexGrow: 1 }}>
        Notifications
      </Typography>
      {userNotificationsList?.userNotifications.length > 0 && (
        <Tooltip title="Clear all notifications">
          <Button
            color="error"
            variant="contained"
            size="small"
            sx={{ whiteSpace: 'nowrap' }}
            onClick={() => {
              confirm.onTrue();
            }}
          >
            Clear All
          </Button>
        </Tooltip>
      )}

      <IconButton onClick={drawer.onFalse} sx={{ display: { xs: 'inline-flex', sm: 'none' } }}>
        <Iconify icon="mingcute:close-line" />
      </IconButton>

      {/* <IconButton>
        <Iconify icon="solar:settings-bold-duotone" />
      </IconButton> */}
    </Stack>
  );

  const renderTabs = (
    <CustomTabs variant="fullWidth" value={currentTab} onChange={handleChangeTab}>
      {tabs.map((tab) => (
        <Tab
          key={tab.value}
          iconPosition="end"
          value={tab.value}
          label={tab.label}
          // icon={
          //   <Label
          //     variant={((tab.value === 'all' || tab.value === currentTab) && 'filled') || 'soft'}
          //     color={
          //       (tab.value === 'unread' && 'info') ||
          //       (tab.value === 'read' && 'success') ||
          //       'default'
          //     }
          //     sx={{
          //       ...(storedLang === 'ar' && { mr: 1 }),
          //     }}
          //   >
          //     {tab.count}
          //   </Label>
          // }
        />
      ))}
    </CustomTabs>
  );
  const filteredNotifications = userNotificationsList?.userNotifications || [];

  const hasNotifications = filteredNotifications && filteredNotifications.length > 0;
  console.log('this is the read notifications', filteredNotifications);

  const renderList = (
    <Scrollbar>
      <Box component="ul">
        {hasNotifications ? (
          filteredNotifications.map((notification) => (
            <Box component="li" key={notification.id} sx={{ display: 'flex' }}>
              <NotificationItem
                notification={notification}
                mutate={mutate}
                currentTab={currentTab}
                onOpen={() => handleOpen(notification)}
              />
            </Box>
          ))
        ) : (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              <EmptyContent
                filled
                sx={{ py: 10 }}
                title="No notifications found"
                description="There are no notifications available."
              />
            </Typography>
          </Box>
        )}
      </Box>
      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" sx={{ mt: 3, mb: 2 }}>
          <Pagination
            count={totalPages}
            page={page + 1}
            onChange={handlePageChange}
            sx={{
              '& .MuiPaginationItem-icon': {
                transform: storedLang === 'ar' ? 'rotate(180deg)' : 'none',
              },
            }}
          />
        </Box>
      )}
    </Scrollbar>
  );

  if (userNotificationsListLoading)
    return (
      <div>
        <LinearProgress
          sx={{
            '& .MuiLinearProgress-bar': {
              backgroundColor: '#2FBBA8',
            },
            backgroundColor: 'rgba(47, 187, 168, 0.2)',
          }}
        />
      </div>
    );
  if (userNotificationsListError) {
    return <ErrorView errorCode={userNotificationsListError} />;
  }

  return (
    <>
      <IconButton
        component={m.button}
        whileTap="tap"
        whileHover="hover"
        variants={varHover(1.05)}
        onClick={drawer.onTrue}
        sx={{
          color: 'white',
          ...sx,
        }}
        {...other}
      >
        <Badge badgeContent={totalUnRead} color="error">
          <SvgIcon>
            {/* https://icon-sets.iconify.design/solar/bell-bing-bold-duotone/ */}
            <path
              fill="currentColor"
              d="M18.75 9v.704c0 .845.24 1.671.692 2.374l1.108 1.723c1.011 1.574.239 3.713-1.52 4.21a25.794 25.794 0 0 1-14.06 0c-1.759-.497-2.531-2.636-1.52-4.21l1.108-1.723a4.393 4.393 0 0 0 .693-2.374V9c0-3.866 3.022-7 6.749-7s6.75 3.134 6.75 7"
              opacity="0.5"
            />
            <path
              fill="currentColor"
              d="M12.75 6a.75.75 0 0 0-1.5 0v4a.75.75 0 0 0 1.5 0zM7.243 18.545a5.002 5.002 0 0 0 9.513 0c-3.145.59-6.367.59-9.513 0"
            />
          </SvgIcon>
        </Badge>
      </IconButton>

      <Drawer
        open={drawer.value}
        onClose={drawer.onFalse}
        anchor={anchor}
        slotProps={{ backdrop: { invisible: true } }}
        PaperProps={{ sx: { width: 1, maxWidth: 420 } }}
      >
        {renderHead}

        {renderTabs}

        {renderList}

        {/* <Box sx={{ p: 1 }}>
          <Button fullWidth size="large">
            View all
          </Button>
        </Box> */}

        <KanbanDetails
          task={taskDetails?.details}
          openDetails={taskDetailsOpen.value}
          onCloseDetails={() => {
            taskDetailsOpen.onFalse();
            setTaskId(null);
          }}
        />
      </Drawer>
      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content="Are you sure you want to delete all the notifications? This action cannot be undone."
        action={
          <Button
            variant="contained"
            color="error"
            sx={{
              ...(storedLang === 'ar' && { ml: 1 }),
            }}
            onClick={() => {
              handleClearNotification();
              confirm.onFalse();
            }}
          >
            Clear
          </Button>
        }
        sx={{
          direction: storedLang === 'ar' ? 'rtl' : 'ltr',
        }}
      />
    </>
  );
}
