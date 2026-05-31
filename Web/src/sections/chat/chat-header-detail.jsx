import { useCallback, useState, useEffect } from 'react';

import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import AvatarGroup, { avatarGroupClasses } from '@mui/material/AvatarGroup';
import { TextField, Box } from '@mui/material';
import { useResponsive } from 'src/hooks/use-responsive';

import { fToNow } from 'src/utils/format-time';

import { Iconify } from 'src/components/iconify';
import { usePopover, CustomPopover } from 'src/components/custom-popover';

import { ChatHeaderSkeleton } from './chat-skeleton';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

import { useTranslation } from 'react-i18next';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { toast } from 'src/components/snackbar';

import { deleteChatRoom, updateChatRoom } from 'src/actions/chat/chatActions';
import { useAuthContext } from 'src/auth/hooks';
import CircleIcon from '@mui/icons-material/Circle';

// ----------------------------------------------------------------------

export function ChatHeaderDetail({
  collapseNav,
  conversation,
  participants,
  chatType,
  loading,
  mutateChatRooms,
  firstChatRoomId,
  firstGroupChatRoomId,
  roomCode,
  chatRoomList,
  typingPayload,
  msgSenderId,
  typingChatRoomId,
  onlineUsers,
}) {
  const { t } = useTranslation('dashboard/chat');
  const storedLang = localStorage.getItem('selectedLang');
  const { zetaUser: user } = useAuthContext();

  const router = useRouter();

  const popover = usePopover();

  const lgUp = useResponsive('up', 'lg');

  const group = chatType === 'GROUP';

  const singleParticipant = participants[0];
  const isOnline = onlineUsers?.some((u) => u.id === singleParticipant?.id);

  const isCurrentUser = msgSenderId === `${user?.id}`;

  const { collapseDesktop, onCollapseDesktop, onOpenMobile } = collapseNav;
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const handleCancelDelete = () => {
    setOpenDeleteDialog(false);
  };

  const [isEditing, setIsEditing] = useState(false);
  const [editedGroupName, setEditedGroupName] = useState('Group Chat');

  useEffect(() => {
    if (conversation?.groupName) {
      setEditedGroupName(conversation.groupName);
    }
  }, [conversation?.groupName]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleGroupNameChange = (e) => {
    setEditedGroupName(e.target.value);
  };

  const handleEditComplete = async () => {
    setIsEditing(false);
    const participantIds = participants.map((participant) => participant.id);
    try {
      const payload = {
        id: roomCode,
        name: editedGroupName,
        memberIds: participantIds,
      };
      console.log('this is the payload', payload);
      const result = await updateChatRoom(payload);
      if (result.success) {
        setIsEditing(false);
        toast.success(t('chat.groupname'));
        await mutateChatRooms();
      } else {
        toast.error(result.error || t('chat.failed_to_update'));
      }
    } catch (error) {
      console.error('Error updating group name:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleEditComplete();
    }
  };

  const handleConfirmDelete = async () => {
    if (conversation?.id) {
      try {
        const response = await deleteChatRoom(conversation.id);
        if (response.success) {
          const allRooms = chatRoomList?.chatRooms || [];
          const currentId = conversation.id;
          const wasGroupChat = conversation.type === 'GROUP';

          const roomsOfSameType = allRooms.filter(
            (room) => room.members?.length > 2 === wasGroupChat
          );
          const currentIndexInTypedList = roomsOfSameType.findIndex(
            (room) => room.id === currentId
          );

          const remainingRoomsOfSameType = roomsOfSameType.filter((room) => room.id !== currentId);

          let nextRoomId = '';

          if (remainingRoomsOfSameType.length > 0) {
            const nextIndex = Math.min(
              currentIndexInTypedList,
              remainingRoomsOfSameType.length - 1
            );
            nextRoomId = remainingRoomsOfSameType[nextIndex]?.id;
          } else {
            nextRoomId = wasGroupChat ? firstChatRoomId : firstGroupChatRoomId;
          }

          if (nextRoomId) {
            router.push(`${paths.dashboard.chat}?id=${nextRoomId}`);
          } else {
            router.push(paths.dashboard.chat);
          }
          setOpenDeleteDialog(false);
          await mutateChatRooms();
        } else {
          console.log(response.error || 'Failed to delete chat room.');
          toast.error(response.error || t('novotak_ai.failed_to_delete'));
        }
      } catch (error) {
        console.error('Unexpected error while deleting chat room:', error);
      }
    }
  };

  const handleToggleNav = useCallback(() => {
    if (lgUp) {
      onCollapseDesktop();
    } else {
      onOpenMobile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lgUp]);

  const renderGroup = (
    <>
      {participants.length > 1 ? (
        <AvatarGroup
          max={15}
          sx={{ [`& .${avatarGroupClasses.avatar}`]: { width: 32, height: 32 } }}
        >
          {participants.map((participant) => (
            <Avatar key={participant.id} alt={participant.name} src={participant.avatarUrl} />
          ))}
        </AvatarGroup>
      ) : (
        <Avatar>{conversation?.groupName?.charAt(0).toUpperCase()}</Avatar>
      )}

      {isEditing ? (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            ml: 2,
            ...(storedLang === 'ar' && { mr: 1 }),
          }}
        >
          <TextField
            value={editedGroupName}
            onChange={handleGroupNameChange}
            onKeyPress={handleKeyPress}
            size="small"
            autoFocus
          />
          <IconButton onClick={handleEditComplete} sx={{ ml: 1 }}>
            <Iconify icon="mdi:check-bold" width={14} color="#006A67" />
          </IconButton>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            ml: 2,
            ...(storedLang === 'ar' && { mr: 1 }),
          }}
        >
          <ListItemText
            primary={editedGroupName}
            secondary={`Participants: ${participants.length}`}
            primaryTypographyProps={{ sx: { display: 'inline', mr: 1 } }}
          />
          {chatType === 'GROUP' && (
            <Iconify
              icon="solar:pen-bold"
              width={14}
              onClick={handleEditClick}
              sx={{
                ml: 1,
                color: '#006A67',
                cursor: 'pointer',
                ...(storedLang === 'ar' && { mr: 1 }),
              }}
            />
          )}
        </Box>
      )}
    </>
  );

  const renderSingle = (
    <Stack direction="row" alignItems="center" spacing={2}>
      <Avatar src={singleParticipant?.avatarUrl} alt={singleParticipant?.name} />

      <ListItemText
        primary={singleParticipant?.name}
        secondary={
          isOnline ? (
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <CircleIcon sx={{ fontSize: 10, color: '#00C853' }} />
              {t('chat.status.online')}
            </Stack>
          ) : (
            fToNow(singleParticipant?.lastActivity || new Date())
          )
        }
        secondaryTypographyProps={{
          component: 'span',
          ...(isOnline && { textTransform: 'capitalize' }),
        }}
      />
    </Stack>
  );
  if (loading) {
    return <ChatHeaderSkeleton />;
  }

  return (
    <>
      {group ? renderGroup : renderSingle}
      {typingPayload === 'Typing' && !isCurrentUser && typingChatRoomId === conversation?.id && (
        <Box
          sx={{
            p: 1,
            ml: 1,
            minWidth: 48,
            maxWidth: 120,
            borderRadius: 1,
            typography: 'body2',
            fontStyle: 'italic',
            bgcolor: 'background.neutral',
            color: 'text.secondary',
            fontWeight: 500,
          }}
        >
          {t('novotak_ai.typing')}
        </Box>
      )}
      <Stack direction="row" flexGrow={1} justifyContent="flex-end">
        {/* <IconButton>
          <Iconify icon="solar:phone-bold" />
        </IconButton> */}

        {/*  <IconButton>
          <Iconify icon="solar:videocamera-record-bold" />
        </IconButton>*/}

        <IconButton onClick={handleToggleNav}>
          <Iconify icon={!collapseDesktop ? 'ri:sidebar-unfold-fill' : 'ri:sidebar-fold-fill'} />
        </IconButton>
        {/* <IconButton onClick={popover.onOpen}>
          <Iconify icon="eva:more-vertical-fill" />
        </IconButton> */}
        {conversation?.chatCreatorId === user?.id && (
          <IconButton
            sx={{ color: 'error.main' }}
            onClick={() => {
              setOpenDeleteDialog(true);
            }}
          >
            <Iconify icon="solar:trash-bin-trash-bold" />
          </IconButton>
        )}
      </Stack>

      <CustomPopover open={popover.open} anchorEl={popover.anchorEl} onClose={popover.onClose}>
        <MenuList>
          <MenuItem
            onClick={() => {
              popover.onClose();
            }}
          >
            <Iconify icon="solar:bell-off-bold" />
            {t('chat.hide_notify')}
          </MenuItem>

          <MenuItem
            onClick={() => {
              popover.onClose();
            }}
          >
            <Iconify icon="solar:forbidden-circle-bold" />
            {t('chat.block')}
          </MenuItem>

          <MenuItem
            onClick={() => {
              popover.onClose();
            }}
          >
            <Iconify icon="solar:danger-triangle-bold" />
            {t('chat.report')}
          </MenuItem>

          <Divider sx={{ borderStyle: 'dashed' }} />

          <MenuItem
            onClick={() => {
              popover.onClose();
            }}
            sx={{ color: 'error.main' }}
          >
            <Iconify icon="solar:trash-bin-trash-bold" />
            {t('chat.delete')}
          </MenuItem>
        </MenuList>
      </CustomPopover>

      <Dialog
        open={openDeleteDialog}
        onClose={handleCancelDelete}
        dir={storedLang === 'ar' ? 'rtl' : 'ltr'}
      >
        <DialogTitle>{t('novotak_ai.delete_to_chatroom')}</DialogTitle>
        <DialogContent>
          <Typography>{t('novotak_ai.are_you_want_chat')}</Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCancelDelete}
            variant="contained"
            sx={{
              ...(storedLang === 'ar' && { ml: 1 }),
            }}
          >
            {t('novotak_ai.cancel')}
          </Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus variant="contained">
            {t('novotak_ai.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
