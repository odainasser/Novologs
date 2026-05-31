import Stack from '@mui/material/Stack';
import LinearProgress from '@mui/material/LinearProgress';
import { styled } from '@mui/material/styles';

import { Scrollbar } from 'src/components/scrollbar';
import { Lightbox, useLightBox } from 'src/components/lightbox';

import { ChatMessageItem } from './chat-message-item';
import { useMessagesScroll } from './hooks/use-messages-scroll';
// ----------------------------------------------------------------------

const MessageContainer = styled('div')(({ theme }) => ({
  transition: theme.transitions.create('background-color', {
    duration: theme.transitions.duration.short,
  }),
  '&.highlight': {
    backgroundColor: theme.palette.action.hover,
    borderRadius: theme.shape.borderRadius,
  },
}));

export function ChatMessageList({
  messages = [],
  participants,
  loading,
  onReplyMessage,
  conversations,
  onForwardMessage,
  onDeleteMessage,
  mutateMessages,
  replyMessage,
  receiverIds,
  messageDeliveryMap,
  toggleReaction,
}) {
  const { messagesEndRef } = useMessagesScroll(messages);
  // Deduplicate messages based on their 'id'
  const deduplicatedMessages = Array.from(
    new Map(messages.map((message) => [message.id, message])).values()
  );

  const slides = messages
    .filter((message) => message.contentType === 'image')
    .map((message) => ({ src: message.attachments.url }));

  const lightbox = useLightBox(slides);

  const handleScrollToMessage = (messageId) => {
    console.log(`[ChatMessageList] Attempting to scroll to message ID: ${messageId}`);

    const messageEl = document.getElementById(`message-${messageId}`);
    if (!messageEl) {
      console.warn(
        `[ChatMessageList] Could not find message element with ID: ${messageId}. The message might not be loaded.`
      );
      return;
    }
    console.log('[ChatMessageList] Found message element:', messageEl);

    const scrollbarInstance = messagesEndRef.current;
    if (!scrollbarInstance) {
      console.warn('[ChatMessageList] Scrollbar ref is not available.');
      // Fallback to standard scrollIntoView, just in case.
      messageEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    console.log('[ChatMessageList] Found scrollbar instance:', scrollbarInstance);

    // The `simplebar-react` library (commonly used for custom scrollbars) exposes `getScrollElement()` on the ref.
    const scrollableNode = scrollbarInstance.getScrollElement?.();

    if (scrollableNode) {
      console.log('[ChatMessageList] Found scrollable node. Calculating position...');
      const containerRect = scrollableNode.getBoundingClientRect();
      const messageRect = messageEl.getBoundingClientRect();
      const scrollTop = messageRect.top - containerRect.top + scrollableNode.scrollTop;
      const centeredScrollTop = scrollTop - containerRect.height / 2 + messageRect.height / 2;

      console.log(`[ChatMessageList] Scrolling to: ${centeredScrollTop}`);
      scrollableNode.scrollTo({ top: centeredScrollTop, behavior: 'smooth' });

      messageEl.classList.add('highlight');
      setTimeout(() => messageEl.classList.remove('highlight'), 1500);
    } else {
      console.warn(
        '[ChatMessageList] getScrollElement() not found on scrollbar ref. Using fallback scrollIntoView(). This might not work with custom scrollbars.'
      );
      messageEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  if (loading) {
    return (
      <Stack sx={{ flex: '1 1 auto', position: 'relative' }}>
        <LinearProgress
          color="inherit"
          sx={{
            top: 0,
            left: 0,
            width: 1,
            height: 2,
            borderRadius: 0,
            position: 'absolute',
          }}
        />
      </Stack>
    );
  }

  return (
    <>
      <Scrollbar ref={messagesEndRef} sx={{ px: 3, pt: 5, pb: 3, flex: '1 1 auto' }}>
        {deduplicatedMessages
          .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
          .map((message) => (
            <MessageContainer key={message.id} id={`message-${message.id}`}>
              <ChatMessageItem
                message={message}
                conversations={conversations}
                participants={participants}
                onDeleteMessage={onDeleteMessage}
                onOpenLightbox={() => lightbox.onOpen(message.attachments[0])}
                onReplyMessage={onReplyMessage}
                onForwardMessage={onForwardMessage}
                mutateMessages={mutateMessages}
                replyMessage={replyMessage}
                onScrollToMessage={handleScrollToMessage}
                receiverIds={receiverIds}
                messageDeliveryMap={messageDeliveryMap}
                toggleReaction={toggleReaction}
              />
            </MessageContainer>
          ))}
      </Scrollbar>

      <Lightbox
        slides={slides}
        open={lightbox.open}
        close={lightbox.onClose}
        index={lightbox.selected}
      />
    </>
  );
}
