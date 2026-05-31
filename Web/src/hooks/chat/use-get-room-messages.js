import { useState, useEffect } from 'react';
import { getAllChatMessages } from 'src/actions/chat/chatActions';
import { useAuthContext } from 'src/auth/hooks';

const useGetRoomMessages = (roomCode, accessToken, mutateChatRooms) => {
  console.log('this is the room code', roomCode);
  const { zetaUser } = useAuthContext();

  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState(null);

  const getMsgParams = {
    search: {
      fieldName: 'ChatRoomId',
      fieldValue: roomCode,
      operator: 0,
      logicOperator: 0,
    },
    pagination: {
      pageNumber: 1,
      pageSize: 2000,
    },
  };
  const {
    chatMsgList,
    chatMsgListLoading,
    chatMsgListError,
    chatMsgListValidating,
    chatMsgListEmpty,
    mutate,
  } = getAllChatMessages(getMsgParams);

  console.log('this is the chat msg', chatMsgList.chatMessages);
  useEffect(() => {
    if (chatMsgList?.chatMessages?.length) {
      const filteredMessages = chatMsgList.chatMessages.filter((msg) => {
        if (msg.deletedStatus === 2) return false;
        if (msg.deletedStatus === 1 && msg.sender?.id === zetaUser?.id) return false;
        return true;
      });

      setMessages(filteredMessages);

      const hasUnread = chatMsgList.chatMessages.some(
        (m) => m.sender?.id !== zetaUser?.id && m.status !== 2
      );

      if (hasUnread && roomCode) {
        mutateChatRooms?.();
      }
    } else {
      setMessages([]);
    }
  }, [chatMsgList, roomCode]);
  useEffect(() => {
    if (!roomCode) return;

    mutateChatRooms?.((prev) => {
      if (!prev?.items) return prev;

      return {
        ...prev,
        items: prev.items.map((room) => {
          if (room.id !== roomCode) return room;
          if (room.totalUnreadMessages === 0) return room;

          return { ...room, totalUnreadMessages: 0 };
        }),
      };
    }, false);
  }, [roomCode]);

  return { messages, messagesLoading, messagesError, mutateMessages: mutate };
};

export default useGetRoomMessages;
