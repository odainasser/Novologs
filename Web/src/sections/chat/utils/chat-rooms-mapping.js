export function transformChatRoomsToConversations(chatRooms, user, employees) {
  const conversations = {
    byId: {},
    allIds: [],
  };

  console.log('this is the chatRoom', chatRooms);

  chatRooms.forEach((chatRoom) => {
    // Use chatRoom.code as the conversation ID
    const conversationId = chatRoom.id;

    // Determine the type
    const isOneToOne = chatRoom.members.length === 2;
    const type = isOneToOne ? 'ONE_TO_ONE' : 'GROUP';

    // Map members to participants, excluding the current user
    const participants = chatRoom.members
      .filter((member) => member.member.id !== user.id)
      .map((member) => {
        const employee = employees.find((emp) => emp.id === member.member.id);

        const fullName = employee ? employee.fullName : member.member.fullName || '';

        const participant = {
          id: member.member.id.toString(),
          roomMemberId: member.id.toString(),
          name: fullName,
          avatarUrl: employee
            ? employee.profileImageFileUrl || fullName.charAt(0).toUpperCase()
            : member.member.profileImageUrl || member.member.fullName.charAt(0).toUpperCase(),
          status: 'offline',
          role: employee
            ? employee.designationName?.value || 'Employee'
            : member.role || 'Employee',
          email: employee
            ? employee.email || 'Not Available'
            : member.member.email || 'Not Available',
          phoneNumber: employee
            ? employee.phoneNumber || 'Not Available'
            : member.member.phoneNumber || 'Not Available',
          address: employee
            ? employee.country || 'Not Available'
            : member.member.country || 'Not Available',
          lastActivity: employee ? employee.lastActivity || '' : member.member.lastActivity || '',
        };

        return participant;
      });

    // If there are no participants after filtering, skip adding the conversation
    if (participants.length === 0) {
      // Show user's own data if there are no other participants
      const userConversation = {
        id: conversationId,
        participants: [
          {
            id: user.id.toString(),
            name: `${user.fullName}`.trim(),
            avatarUrl: user.profileImageFileUrl || user.fullName.charAt(0).toUpperCase(),
            status: 'offline', // Modify if you have a way to get the real status
            role: '', // If applicable
            email: user.email || '',
            phoneNumber: user.phoneNumber || 'Not Available',
            address: user.country || 'Not Available',
            lastActivity: user.lastActivity || '',
          },
        ],
        type,
        unreadCount: chatRoom?.totalUnreadMessages, // Initialize as 0 or implement your logic
        chatCreatorId: chatRoom?.creator?.id,
        messages: [], // You need to fetch messages separately
        lastMessage: chatRoom?.lastMessage,
      };

      // Add user's own data as a conversation
      conversations.byId[conversationId] = userConversation;
      conversations.allIds.push(conversationId);

      return; // Skip to the next iteration
    }

    // Create the conversation object with participants
    const conversation = {
      id: conversationId,
      participants,
      type,

      unreadCount: chatRoom?.totalUnreadMessages, // Initialize as 0 or implement your logic
      chatCreatorId: chatRoom?.creator?.id,
      messages: [], // You need to fetch messages separately
      lastMessage: chatRoom?.lastMessage,
    };

    // Add GroupName if it's a group
    if (type === 'GROUP' && chatRoom?.name) {
      conversation.groupName = chatRoom?.name;
    }

    // Add to conversations
    conversations.byId[conversationId] = conversation;
    conversations.allIds.push(conversationId);
  });

  return conversations;
}

export function transformMessages(currentMessages, participants) {
  const participantIds = new Set(participants.map((p) => p.id.toString()));

  return currentMessages.map((msg) => {
    let contentType = 'text';
    let attachments = [];
    let body = '';
    let messageId = msg.id || '';
    let msgReceivers = msg.recievers || [];
    let msgSender = msg.sender;

    let payload;
    let mentions = [];
    const reactions = msg.reactions || [];
    const isTask = msg.isTask || false;

    try {
      payload = JSON.parse(msg.payLoad);
      console.log('this is the msg payload', payload);
    } catch (err) {
      if (msg.payLoad === 'Typing') {
        return {
          id: msg.id.toString(),
          senderId: msg.sender?.id?.toString() || '',
          type: 'typing',
          createdAt: msg.created || '',
          messageId,
        };
      }

      body = msg.payLoad;

      return {
        id: msg.id.toString(),
        senderId: msg.sender?.id?.toString() || '',
        body,
        contentType: 'text',
        attachments: [],
        replyParentId: null,
        isForwarded: false,
        createdAt: msg.created || '',
        messageId,
        msgReceivers,
        msgSender,
        mentions,
        reactions: msg.reactions || [],
        isTask: msg.isTask || false,
      };
    }

    if (typeof payload === 'object' && payload !== null) {
      body = payload.body || '';
      contentType = payload.contentType || 'text';
      mentions = payload.mentions || [];

      if (Array.isArray(payload.attachments)) {
        attachments = payload.attachments.map((att, index) => {
          const fileType = att.fileType || att.type || '';
          return {
            id: att.id || `${msg.id}-${index}`,
            name: att.fileName || att.name || '',
            url: att.url || '',
            preview: att.url || '',
            size: att.size || 0,
            createdAt: att.createdAt || msg.createdOn || msg.timeStamp || '',
            modifiedAt: att.modifiedAt || msg.updatedOn || '',
            type: fileType,
          };
        });
      }
    } else {
      body = msg.payLoad || '';
      contentType = 'text';
      attachments = [];
    }

    return {
      id: msg.id.toString(),
      senderId: msg.sender?.id?.toString() || '',
      body,
      contentType,
      attachments,
      replyParentId: payload?.replyParentId || null, // ✅ only store parent ID
      isForwarded: payload?.Forwarded || false,
      createdAt: msg.created || '',
      messageId: messageId,

      chatRoomIds: msg.chatRoomId || [],
      msgReceivers: msg.recievers || [],
      msgSender: msg.sender,

      mentions,
      reactions: msg.reactions || [],
      isTask: msg.isTask || false,
    };
  });
}

export const mapEmployeeToContact = (employee) => {
  const fullName = employee.fullName ? employee.fullName.trim() : '';
  return {
    id: employee.id,
    role: employee.designationName?.value || 'Employee',
    email: employee.email,
    name: fullName || 'Unnamed',
    lastActivity: new Date().toISOString(),
    address: employee.country || 'Not Available',
    avatarUrl: employee.profileImageFileUrl || fullName.charAt(0).toUpperCase() || '',
    phoneNumber: employee.phoneNumber || 'N/A',
    status: 'online',
  };
};

export const mapEmployeesToContacts = (employees) => {
  return employees.map(mapEmployeeToContact);
};
