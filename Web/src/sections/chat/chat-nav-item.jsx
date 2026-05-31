import { useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import AvatarGroup from '@mui/material/AvatarGroup';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useResponsive } from 'src/hooks/use-responsive';

import { fToNow } from 'src/utils/format-time';

import { clickConversation } from 'src/actions/chat';

import { useMockedUser } from 'src/auth/hooks';

import { getNavItem } from './utils/get-nav-item';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

export function ChatNavItem({
  selected,
  collapse,
  conversation,
  onCloseMobile,
  messages,
  chatType,
  onlineUsers,
}) {
  const { t } = useTranslation('dashboard/chat');
  const { zetaUser: user } = useAuthContext();

  const mdUp = useResponsive('up', 'md');

  const router = useRouter();

  console.log('this is the messages', messages);

  const { group, displayName, groupName, displayText, participants, lastActivity } = getNavItem({
    conversation,
    currentUserId: `${user?.id}`,
    messages,
    chatType,
  });
  console.log('this is the onlineUsers from chat nav', onlineUsers);
  const singleParticipant = participants?.[0];

  const { name, avatarUrl, status } = singleParticipant || {};
  const lastMessage = messages[messages.length - 1];

  console.log('this is the last msg', lastMessage);
  const handleClickConversation = useCallback(async () => {
    try {
      if (!mdUp) {
        onCloseMobile();
      }

      await clickConversation(conversation.id);

      router.push(`${paths.dashboard.chat}?id=${conversation.id}`);
    } catch (error) {
      console.error(error);
    }
  }, [conversation.id, mdUp, onCloseMobile, router]);

  const isUserOnline = (userId) => onlineUsers?.some((u) => u.id === userId);

  // ✅ for group
  const hasOnlineInGroup = participants?.some((p) => isUserOnline(p.id));

  // const renderGroup = (
  //   <Badge
  //     variant={hasOnlineInGroup ? 'online' : 'offline'}
  //     anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
  //      sx={{
  //   '& .MuiBadge-badge': {
  //     backgroundColor: isUserOnline(singleParticipant?.id) ? '#006A67' : 'red',
  //     color: isUserOnline(singleParticipant?.id) ? '#006A67' : 'red',
  //     boxShadow: '0 0 0 2px white', // optional border around the dot
  //   },
  // }}
  //   >
  //     <AvatarGroup variant="compact" sx={{ width: 48, height: 48 }}>
  //       {participants.slice(0, 2).map((participant) => (
  //         <Avatar key={participant.id} alt={participant.name} src={participant.avatarUrl} />
  //       ))}
  //     </AvatarGroup>
  //   </Badge>
  // );
  const renderGroup = (
    <Badge
      variant={hasOnlineInGroup ? t('chat.status.online') : t('chat.status.invisible')}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <AvatarGroup variant="compact" sx={{ width: 48, height: 48 }}>
        {participants.slice(0, 2).map((participant) => (
          <Avatar key={participant.id} alt={participant.name} src={participant.avatarUrl} />
        ))}
      </AvatarGroup>
    </Badge>
  );
  const renderSingle = (
    <Badge
      variant={isUserOnline(singleParticipant?.id) ? 'online' : 'offline'}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      sx={{
        '& .MuiBadge-badge': {
          backgroundColor: isUserOnline(singleParticipant?.id) ? '#00C853' : 'red',
          color: isUserOnline(singleParticipant?.id) ? '#00C853' : 'red',
          // boxShadow: '0 0 0 2px white',
        },
      }}
    >
      <Avatar
        alt={singleParticipant?.name}
        src={singleParticipant?.avatarUrl}
        sx={{ width: 35, height: 35 }}
      />
    </Badge>
  );

  return (
    <Box component="li" sx={{ display: 'flex' }}>
      <ListItemButton
        onClick={handleClickConversation}
        sx={{
          py: 1.5,
          px: 2.5,
          gap: 2,
          ...(selected && { bgcolor: 'action.selected' }),
        }}
      >
        <Badge
          overlap="circular"
          badgeContent={conversation.unreadCount}
          sx={{
            '& .MuiBadge-badge': {
              backgroundColor: '#00C853',
              color: '#fff', // text color inside badge
            },
          }}
        >
          {group ? renderGroup : renderSingle}
        </Badge>

        {!collapse && (
          <>
            <ListItemText
              primary={group ? (groupName ?? 'Unnamed Group') : (displayName ?? 'No Name')}
              primaryTypographyProps={{ noWrap: true, component: 'span', variant: 'subtitle2' }}
              secondary={displayText}
              secondaryTypographyProps={{
                noWrap: true,
                component: 'span',
                variant: conversation.unreadCount ? 'subtitle2' : 'body2',
                color: conversation.unreadCount ? 'text.primary' : 'text.secondary',
                sx: { fontSize: '12px' },
              }}
            />

            <Stack alignItems="flex-end" sx={{ alignSelf: 'stretch' }}>
              <Typography
                noWrap
                variant="body2"
                component="span"
                sx={{ mb: 1.5, fontSize: 12, color: 'text.disabled' }}
              >
                {fToNow(lastActivity)} ago
              </Typography>

              {/* {!!conversation.unreadCount && (
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    bgcolor: 'info.main',
                    borderRadius: '50%',
                  }}
                />
              )} */}
            </Stack>
          </>
        )}
      </ListItemButton>
    </Box>
  );
}
