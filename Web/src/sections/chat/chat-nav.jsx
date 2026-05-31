import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Drawer from '@mui/material/Drawer';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import ClickAwayListener from '@mui/material/ClickAwayListener';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useResponsive } from 'src/hooks/use-responsive';

import { today } from 'src/utils/format-time';

import { createConversation } from 'src/actions/chat';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import { useMockedUser } from 'src/auth/hooks';
import { ButtonGroup, Button } from '@mui/material';
import { ToggleButton } from './styles';
import { ChatNavItem } from './chat-nav-item';
import { MentionNavItem } from './mention-nav-item';
import { ChatNavAccount } from './chat-nav-account';
import { ChatNavItemSkeleton } from './chat-skeleton';
import { ChatNavSearchResults } from './chat-nav-search-results';
import { initialConversation } from './utils/initial-conversation';
import { useAuthContext } from 'src/auth/hooks';
import { useTranslation } from 'react-i18next';
import Tooltip from '@mui/material/Tooltip';

// ----------------------------------------------------------------------

const NAV_WIDTH = 320;

const NAV_COLLAPSE_WIDTH = 96;

export function ChatNav({
  loading,
  contacts,
  collapseNav,
  conversations,
  selectedConversationId,
  chatGroupName,
  messages,
  chatType,
  onlineUsers,
  mentions = [],
  mentionsLoading,
  onOpenMentions,
}) {
  console.log('this is the online users from chat nav', onlineUsers);

  const { t } = useTranslation('dashboard/chat');
  const storedLang = localStorage.getItem('selectedLang');

  const router = useRouter();
  const [filter, setFilter] = useState('ONE_TO_ONE');
  const handleFilterChange = (type) => {
    setFilter(type);
  };

  const filteredConversations =
    filter === 'MENTIONS'
      ? []
      : (conversations?.allIds || []).filter((conversationId) => {
          const conversation = conversations?.byId?.[conversationId];
          return conversation?.type === filter;
        });

  console.log(' filteredConversations ', filteredConversations);

  const mdUp = useResponsive('up', 'md');

  const { zetaUser: user } = useAuthContext();

  const {
    openMobile,
    onOpenMobile,
    onCloseMobile,
    onCloseDesktop,
    collapseDesktop,
    onCollapseDesktop,
  } = collapseNav;

  const [searchContacts, setSearchContacts] = useState({
    query: '',
    results: [],
  });

  const myContact = useMemo(
    () => ({
      id: user?.id || 0,
      role: user?.designationName?.value || 'user',
      email: user?.email || '',
      address: user?.country || 'N/A',
      name: `${user?.fullName}`.trim(),
      lastActivity: new Date(),
      avatarUrl: user?.profileImageFileUrl || '',
      phoneNumber: user?.phoneNumber || '',
      status: 'online',
    }),
    [user]
  );

  useEffect(() => {
    if (!mdUp) {
      onCloseDesktop();
    }
  }, [onCloseDesktop, mdUp]);

  const handleToggleNav = useCallback(() => {
    if (mdUp) {
      onCollapseDesktop();
    } else {
      onCloseMobile();
    }
  }, [mdUp, onCloseMobile, onCollapseDesktop]);

  const handleClickCompose = useCallback(() => {
    if (!mdUp) {
      onCloseMobile();
    }

    setFilter('ONE_TO_ONE');
    setSearchContacts({ query: '', results: [] });

    router.push(paths.dashboard.chat);
  }, [mdUp, onCloseMobile, router]);

  const handleSearchContacts = useCallback(
    (inputValue) => {
      setSearchContacts((prevState) => ({ ...prevState, query: inputValue }));

      if (inputValue) {
        const allConversations = Object.values(conversations?.byId || {});

        const filteredConversations = allConversations.filter((conversation) => {
          const lowerCaseInput = inputValue.toLowerCase();

          // For GROUP, check groupName and participants
          if (conversation.type === 'GROUP') {
            return (
              conversation.groupName?.toLowerCase().includes(lowerCaseInput) ||
              conversation.participants?.some((participant) =>
                participant.name?.toLowerCase().includes(lowerCaseInput)
              )
            );
          }

          // For ONE_TO_ONE or others, just check participants
          return conversation.participants?.some((participant) =>
            participant.name?.toLowerCase().includes(lowerCaseInput)
          );
        });

        setSearchContacts((prevState) => ({
          ...prevState,
          results: filteredConversations,
        }));
      } else {
        setSearchContacts((prevState) => ({ ...prevState, results: [] }));
      }
    },
    [conversations.byId]
  );

  const handleClickAwaySearch = useCallback(() => {
    setSearchContacts({ query: '', results: [] });
  }, []);

  const handleClickResult = useCallback(
    async (result) => {
      handleClickAwaySearch();

      const linkTo = (id) => router.push(`${paths.dashboard.chat}?id=${id}`);

      try {
        // Check if the conversation already exists
        if (conversations.allIds.includes(result.id)) {
          linkTo(result.id);
          return;
        }

        // Find the recipient in contacts
        const recipient = contacts.find((contact) => contact.id === result.id);
        if (!recipient) {
          console.error('Recipient not found');
          return;
        }

        // Prepare conversation data
        const { conversationData } = initialConversation({
          recipients: [recipient],
          me: myContact,
        });

        // Create a new conversation
        const res = await createConversation(conversationData);

        if (!res || !res.conversation) {
          console.error('Failed to create conversation');
        }

        // Navigate to the new conversation
        linkTo(res.conversation.id);
      } catch (error) {
        console.error('Error handling click result:', error);
      }
    },
    [contacts, conversations.allIds, handleClickAwaySearch, myContact, router]
  );
  const handleClickMention = useCallback(
    (mention) => {
      router.push(`${paths.dashboard.chat}?id=${mention.chatRoomId}`);
    },
    [router]
  );
  const renderMentionsList = (
    <nav>
      <Box component="ul">
        <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
          <Typography variant="body2">
            Your mentions are shown on the right. Select one to view
          </Typography>
        </Box>
      </Box>
    </nav>
  );
  const renderLoading = <ChatNavItemSkeleton />;

  const renderList = (
    <nav>
      <Box component="ul">
        {filteredConversations.map((conversationId) => (
          <ChatNavItem
            key={conversationId}
            collapse={collapseDesktop}
            conversation={conversations.byId[conversationId]}
            selected={conversationId === selectedConversationId}
            onCloseMobile={onCloseMobile}
            messages={messages}
            chatType={chatType}
            onlineUsers={onlineUsers}
          />
        ))}
      </Box>
    </nav>
  );

  const renderListResults = (
    <ChatNavSearchResults
      query={searchContacts.query}
      results={searchContacts.results}
      onClickResult={handleClickResult}
    />
  );

  const renderSearchInput = (
    <ClickAwayListener onClickAway={handleClickAwaySearch}>
      <TextField
        fullWidth
        value={searchContacts.query}
        onChange={(event) => handleSearchContacts(event.target.value)}
        placeholder={t('chat.place_holder')}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
            </InputAdornment>
          ),
        }}
        // sx={{ mt: 2.5 }}
        sx={{
          '& .MuiInputBase-input': {
            padding: '10px 14px',
          },
          mt: 2.5,
        }}
      />
    </ClickAwayListener>
  );
  useEffect(() => {
    if (selectedConversationId === 'mentions') {
      setFilter('MENTIONS');
      return;
    }

    const selectedConversation = conversations?.byId?.[selectedConversationId];

    if (selectedConversation?.type) {
      setFilter(selectedConversation.type);
    }
  }, [selectedConversationId, conversations?.byId]);
  const renderFilter = (
    <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 2, width: '100%' }}>
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          borderBottom: filter === 'ONE_TO_ONE' ? '2px solid' : 'none',
          borderColor: filter === 'ONE_TO_ONE' ? '#006A67' : 'transparent',
          // pb: 1,
          transition: 'border-color 0.3s',
          '&:hover': {
            borderBottom: '2px solid',
            borderColor: 'primary.light',
          },
        }}
      >
        {' '}
        <Tooltip title="Conversations" arrow>
          <IconButton
            onClick={() => {
              setFilter('ONE_TO_ONE');

              const firstOneToOneId = conversations?.allIds?.find(
                (id) => conversations?.byId?.[id]?.type === 'ONE_TO_ONE'
              );

              if (firstOneToOneId) {
                router.push(`${paths.dashboard.chat}?id=${firstOneToOneId}`);
              }
            }}
            color={filter === 'ONE_TO_ONE' ? 'primary' : 'default'}
          >
            <Iconify icon="eva:person-outline" width={24} />
          </IconButton>
        </Tooltip>
      </Box>
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          borderBottom: filter === 'GROUP' ? '2px solid' : 'none',
          borderColor: filter === 'GROUP' ? '#006A67' : 'transparent',
          // pb: 1,
          transition: 'border-color 0.3s',
          '&:hover': {
            borderBottom: '2px solid',
            borderColor: 'primary.light',
          },
        }}
      >
        <Tooltip title="Channels" arrow>
          <IconButton
            onClick={() => {
              setFilter('GROUP');

              const firstGroupId = conversations?.allIds?.find(
                (id) => conversations?.byId?.[id]?.type === 'GROUP'
              );

              if (firstGroupId) {
                router.push(`${paths.dashboard.chat}?id=${firstGroupId}`);
              }
            }}
            color={filter === 'GROUP' ? '#006A67' : 'default'}
          >
            <Iconify icon="eva:people-outline" width={24} />
          </IconButton>
        </Tooltip>
      </Box>
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          borderBottom: filter === 'MENTIONS' ? '2px solid' : 'none',
          borderColor: filter === 'MENTIONS' ? '#006A67' : 'transparent',
          transition: 'border-color 0.3s',
          '&:hover': {
            borderBottom: '2px solid',
            borderColor: 'primary.light',
          },
        }}
      >
        <Tooltip title="Mentions" arrow>
          <IconButton
            onClick={() => {
              setFilter('MENTIONS');
              onOpenMentions?.();
            }}
            color={filter === 'MENTIONS' ? '#006A67' : 'default'}
          >
            <Iconify icon="mdi:at" width={24} />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );

  const renderContent = (
    <>
      <Stack direction="row" alignItems="center" justifyContent="center" sx={{ p: 2.5, pb: 0 }}>
        {!collapseDesktop && (
          <>
            <ChatNavAccount onlineUsers={onlineUsers} />
            <Box sx={{ flexGrow: 1 }} />
          </>
        )}

        <IconButton onClick={handleToggleNav}>
          <Iconify
            icon={collapseDesktop ? 'eva:arrow-ios-forward-fill' : 'eva:arrow-ios-back-fill'}
          />
        </IconButton>

        {!collapseDesktop && (
          <Tooltip title="Add Chat Room" arrow>
            <IconButton onClick={handleClickCompose}>
              <Iconify width={24} icon="solar:user-plus-bold" />
            </IconButton>
          </Tooltip>
        )}
      </Stack>
      <Box sx={{ px: 1 }}>{!collapseDesktop && filter !== 'MENTIONS' && renderSearchInput}</Box>
      <Box sx={{ px: 1 }}>{!collapseDesktop && renderFilter}</Box>

      {loading || mentionsLoading ? (
        renderLoading
      ) : (
        <Scrollbar sx={{ pb: 1 }}>
          {searchContacts.query && !!conversations.allIds.length
            ? renderListResults
            : filter === 'MENTIONS'
              ? renderMentionsList
              : renderList}
        </Scrollbar>
      )}
    </>
  );

  return (
    <>
      <ToggleButton onClick={onOpenMobile} sx={{ display: { md: 'none' } }}>
        <Iconify width={16} icon="solar:users-group-rounded-bold" />
      </ToggleButton>

      <Stack
        sx={{
          minHeight: 0,
          flex: '1 1 auto',
          width: NAV_WIDTH,
          display: { xs: 'none', md: 'flex' },
          ...(storedLang === 'ar'
            ? {
                borderLeft: (theme) => `solid 1px ${theme.vars.palette.divider}`,
              }
            : {
                borderRight: (theme) => `solid 1px ${theme.vars.palette.divider}`,
              }),
          transition: (theme) =>
            theme.transitions.create(['width'], {
              duration: theme.transitions.duration.shorter,
            }),
          ...(collapseDesktop && { width: NAV_COLLAPSE_WIDTH }),
        }}
      >
        {renderContent}
      </Stack>

      <Drawer
        open={openMobile}
        onClose={onCloseMobile}
        slotProps={{ backdrop: { invisible: true } }}
        PaperProps={{ sx: { width: NAV_WIDTH } }}
      >
        {renderContent}
      </Drawer>
    </>
  );
}
