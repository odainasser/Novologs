import Stack from '@mui/material/Stack';
import Drawer from '@mui/material/Drawer';

import { Scrollbar } from 'src/components/scrollbar';

import { ChatRoomGroup } from './chat-room-group';
import { ChatRoomSkeleton } from './chat-skeleton';
import { ChatRoomSingle } from './chat-room-single';
import { ChatRoomAttachments } from './chat-room-attachments';

// ----------------------------------------------------------------------

const NAV_WIDTH = 280;

const NAV_DRAWER_WIDTH = 320;

export function ChatRoom({
  collapseNav,
  participants,
  messages,
  loading,
  employees,
  roomCode,
  chatType,
  conversations,
  mutateChatRooms,
  onlineUsers,
}) {
  const storedLang = localStorage.getItem('selectedLang');

  const { collapseDesktop, openMobile, onCloseMobile } = collapseNav;

  const isGroup = chatType === 'GROUP';

  const attachments = messages.map((msg) => msg.attachments).flat(1) || [];

  const renderContent = loading ? (
    <ChatRoomSkeleton />
  ) : (
    <Scrollbar>
      <div>
        {isGroup ? (
          <ChatRoomGroup
            participants={participants}
            employees={employees}
            roomCode={roomCode}
            conversations={conversations}
            mutateChatRooms={mutateChatRooms}
            onlineUsers={onlineUsers}
          />
        ) : (
          <ChatRoomSingle participant={participants[0]} onlineUsers={onlineUsers} />
        )}
        {<ChatRoomAttachments attachments={attachments} />}
      </div>
    </Scrollbar>
  );

  return (
    <>
      <Stack
        sx={{
          minHeight: 0,
          flex: '1 1 auto',
          width: NAV_WIDTH,
          display: { xs: 'none', lg: 'flex' },
          ...(storedLang === 'ar'
            ? {
                borderRight: (theme) => `solid 1px ${theme.vars.palette.divider}`,
              }
            : {
                borderLeft: (theme) => `solid 1px ${theme.vars.palette.divider}`,
              }),
          transition: (theme) =>
            theme.transitions.create(['width'], {
              duration: theme.transitions.duration.shorter,
            }),
          ...(collapseDesktop && { width: 0 }),
        }}
      >
        {!collapseDesktop && renderContent}
      </Stack>

      <Drawer
        anchor="right"
        open={openMobile}
        onClose={onCloseMobile}
        slotProps={{ backdrop: { invisible: true } }}
        PaperProps={{ sx: { width: NAV_DRAWER_WIDTH } }}
      >
        {renderContent}
      </Drawer>
    </>
  );
}
