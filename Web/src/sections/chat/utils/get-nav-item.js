export function getNavItem({ currentUserId, conversation, chatType }) {
  const { messages, participants, groupName, lastMessage } = conversation;
  console.log('this is the nav lastMessage', lastMessage);

  const participantsInConversation = participants.filter(
    (participant) => participant.id !== currentUserId
  );

  const group = participantsInConversation.length > 1;

  const displayName = participantsInConversation.map((participant) => participant.name).join(', ');

  const hasOnlineInGroup = group
    ? participantsInConversation.map((item) => item.status).includes('online')
    : false;

  let displayText = '';

  if (lastMessage) {
    let parsedPayload = {};

    try {
      parsedPayload =
        typeof lastMessage.payLoad === 'string'
          ? JSON.parse(lastMessage.payLoad)
          : lastMessage.payLoad || {};
    } catch (error) {
      parsedPayload = {};
    }

    const sender =
      lastMessage.sender?.id === currentUserId
        ? 'You: '
        : `${lastMessage.sender?.fullName || 'Unknown'}: `;

    const rawContentType =
      parsedPayload.contentType || lastMessage.contentType || lastMessage.messageType || 'text';

    const contentType = String(rawContentType).toLowerCase();

    let message = '';

    switch (contentType) {
      case 'typing':
        message = 'Typing...';
        break;

      case 'image':
        message = parsedPayload.body ? parsedPayload.body : 'Sent a photo';
        break;

      case 'file':
        message = parsedPayload.body ? parsedPayload.body : 'Sent a file';
        break;

      case 'audio':
        message = parsedPayload.body ? parsedPayload.body : 'Sent an audio message';
        break;

      case 'video':
        message = parsedPayload.body ? parsedPayload.body : 'Sent a video';
        break;

      case 'text':
      default:
        message = parsedPayload.body || lastMessage.body || '';
        break;
    }

    displayText = `${sender}${message}`;
  }

  return {
    group,
    displayName,
    displayText,
    participants: participantsInConversation,
    lastActivity: lastMessage?.lastModified,
    hasOnlineInGroup,
    groupName,
  };
}
