import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';

import { fToNow } from 'src/utils/format-time';

import { CONFIG } from 'src/config-global';

import { Label } from 'src/components/label';
import { FileThumbnail } from 'src/components/file-thumbnail';
import { setNotificationAsRead } from 'src/actions/userManage/userManageActions';
import { toast } from 'src/components/snackbar';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function NotificationItem({ notification, mutate, currentTab, onOpen }) {
  console.log('this is the notification', notification);
  const renderAvatar = (
    <ListItemAvatar>
      {notification.avatarUrl ? (
        <Avatar src={notification.avatarUrl} sx={{ bgcolor: 'background.neutral' }} />
      ) : (
        <Stack
          alignItems="center"
          justifyContent="center"
          sx={{ width: 30, height: 30, borderRadius: '50%', bgcolor: 'background.neutral' }}
        >
          <Box
            component="img"
            src={`${CONFIG.assetsDir}/assets/icons/notification/${
              (notification.type === 5 && 'ic-order') ||
              (notification.type === 'chat' && 'ic-chat') ||
              (notification.type === 14 && 'ic-mail') ||
              (notification.type === 3 && 'ic-mail') ||
              (notification.type === 4 && 'ic-mail') ||
              (notification.type === 'delivery' && 'ic-delivery') ||
              'ic-mail'
            }.svg`}
            sx={{ width: 16, height: 16 }}
          />
        </Stack>
      )}
    </ListItemAvatar>
  );

  const renderText = (
    <ListItemText
      disableTypography
      primary={
        <Typography variant="body2" sx={{ fontSize: '0.875rem', color: 'text.primary' }}>
          {reader(notification?.body)}
        </Typography>
      }
      secondary={
        <Stack
          direction="row"
          alignItems="center"
          sx={{ typography: 'caption', color: 'text.disabled' }}
          divider={
            <Box
              sx={{
                width: 2,
                height: 2,
                bgcolor: 'currentColor',
                mx: 0.5,
                borderRadius: '50%',
              }}
            />
          }
        >
          {fToNow(notification.createdAt)}
          {notification.category}
        </Stack>
      }
    />
  );

  const renderUnReadBadge = notification.isUnRead && (
    <Box
      sx={{
        top: 26,
        width: 8,
        height: 8,
        right: 20,
        borderRadius: '50%',
        bgcolor: 'info.main',
        position: 'absolute',
      }}
    />
  );

  const friendAction = (
    <Stack spacing={1} direction="row" sx={{ mt: 1.5 }}>
      <Button size="small" variant="contained">
        Accept
      </Button>
      <Button size="small" variant="outlined">
        Decline
      </Button>
    </Stack>
  );

  const projectAction = (
    <Stack alignItems="flex-start">
      <Box
        sx={{
          p: 1.5,
          my: 1.5,
          borderRadius: 1.5,
          color: 'text.secondary',
          bgcolor: 'background.neutral',
        }}
      >
        {reader(
          `<p><strong>@Jaydon Frankie</strong> feedback by asking questions or just leave a note of appreciation.</p>`
        )}
      </Box>

      <Button size="small" variant="contained">
        Reply
      </Button>
    </Stack>
  );

  const fileAction = (
    <Stack
      spacing={1}
      direction="row"
      sx={{
        pl: 1,
        p: 1.5,
        mt: 1.5,
        borderRadius: 1.5,
        bgcolor: 'background.neutral',
      }}
    >
      <FileThumbnail file="http://localhost:8080/httpsdesign-suriname-2015.mp3" />

      <Stack spacing={1} direction={{ xs: 'column', sm: 'row' }} flexGrow={1} sx={{ minWidth: 0 }}>
        <ListItemText
          disableTypography
          primary={
            <Typography variant="subtitle2" component="div" sx={{ color: 'text.secondary' }} noWrap>
              design-suriname-2015.mp3
            </Typography>
          }
          secondary={
            <Stack
              direction="row"
              alignItems="center"
              sx={{ typography: 'caption', color: 'text.disabled' }}
              divider={
                <Box
                  sx={{
                    mx: 0.5,
                    width: 2,
                    height: 2,
                    borderRadius: '50%',
                    bgcolor: 'currentColor',
                  }}
                />
              }
            >
              <span>2.3 GB</span>
              <span>30 min ago</span>
            </Stack>
          }
        />

        <Button size="small" variant="outlined">
          Download
        </Button>
      </Stack>
    </Stack>
  );

  const tagsAction = (
    <Stack direction="row" spacing={0.75} flexWrap="wrap" sx={{ mt: 1.5 }}>
      <Label variant="outlined" color="info">
        Design
      </Label>
      <Label variant="outlined" color="warning">
        Dashboard
      </Label>
      <Label variant="outlined">Design system</Label>
    </Stack>
  );

  const paymentAction = (
    <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
      <Button size="small" variant="contained">
        Pay
      </Button>
      <Button size="small" variant="outlined">
        Decline
      </Button>
    </Stack>
  );

  const handleNotificationClick = async (notification) => {
    const payload = {
      id: notification?.id,
      isRead: true,
    };

    try {
      const response = await setNotificationAsRead(payload);
      if (response.success) {
        toast.success('Notification marked as read');
        mutate();
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return (
    <ListItemButton
      disableRipple
      sx={{
        p: 1,
        alignItems: 'flex-start',
        borderBottom: (theme) => `dashed 1px ${theme.vars.palette.divider}`,
        cursor: 'pointer',
      }}
      onClick={onOpen}
    >
      {renderUnReadBadge}

      {renderAvatar}

      <Stack sx={{ flexGrow: 1 }}>
        {renderText}
        {notification.type === 'friend' && friendAction}
        {notification.type === 'project' && projectAction}
        {notification.type === 'file' && fileAction}
        {notification.type === 'tags' && tagsAction}
        {notification.type === 'payment' && paymentAction}
      </Stack>
      {currentTab === 'unread' && (
        <Tooltip title="Mark as read">
          <IconButton
            color="primary"
            onClick={(e) => {
              e.stopPropagation();
              handleNotificationClick(notification);
            }}
          >
            <Iconify icon="eva:done-all-fill" />
          </IconButton>
        </Tooltip>
      )}
    </ListItemButton>
  );
}

// ----------------------------------------------------------------------

function reader(data) {
  return (
    <Box
      dangerouslySetInnerHTML={{ __html: data }}
      sx={{
        marginBottom: '4px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        maxWidth: '322px',
        mb: 0.5,
        '& p': { typography: 'body2', m: 0 },
        '& a': { color: 'inherit', textDecoration: 'none' },
        '& strong': { typography: 'subtitle2' },
      }}
    />
  );
}
