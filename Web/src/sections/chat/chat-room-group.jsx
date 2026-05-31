import { useState, useCallback } from 'react';
import { useAuthContext } from 'src/auth/hooks';

import Badge from '@mui/material/Badge';
import Avatar from '@mui/material/Avatar';
import Collapse from '@mui/material/Collapse';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import MenuList from '@mui/material/MenuList';
import Stack from '@mui/material/Stack';

import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import { Iconify } from 'src/components/iconify';

import { useBoolean } from 'src/hooks/use-boolean';
import { CustomPopover } from 'src/components/custom-popover';
import { CollapseButton } from './styles';
import { ChatRoomParticipantDialog } from './chat-room-participant-dialog';

import { useTranslation } from 'react-i18next';

import { toast } from 'src/components/snackbar';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import { DeleteMemberDialog } from './delete-member-dialog';
import { AddMemberDialog } from './add-member-dialog';
import { updateChatRoom } from 'src/actions/chat/chatActions';

// ----------------------------------------------------------------------

export function ChatRoomGroup({
  participants,
  employees,
  roomCode,
  conversations,
  mutateChatRooms,
  onlineUsers,
}) {
  const conversation = conversations?.byId?.[roomCode];
  const groupName = conversation?.groupName || '';
  const { zetaUser } = useAuthContext();
  // const isOnline = onlineUsers?.some((u) => u.id === participant?.id);
  console.log('this is the onlineUsers', onlineUsers);
  const collapse = useBoolean(true);
  const { t } = useTranslation('dashboard/chat');
  const storedLang = localStorage.getItem('selectedLang');
  const [members, setMembers] = useState(false);
  const [selectedPersons, setSelectedPersons] = useState([]);

  const [selected, setSelected] = useState(null);
  const [deleteSelected, setDeleteSelected] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [DeletingMem, setDeletingMem] = useState(false);

  const handleOpen = useCallback((participant) => {
    setSelected(participant);
  }, []);

  const handleClose = useCallback(() => {
    setSelected(null);
  }, []);

  const handleDelete = (participant) => {
    console.log('this is the participant to delete', participant);
    setDeleteSelected({ participant, open: true });
  };

  const handleMenuOpen = (event, participant) => {
    setAnchorEl(event.currentTarget);
    setSelectedParticipant(participant);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedParticipant(null);
  };
  const handleCloseDelete = useCallback(() => {
    setDeleteSelected({});
  }, []);
  const handleDeleteChatMem = async () => {
    const selectedMemberIds = participants.map((participant) => participant.id);

    // Check if deleting this member will leave fewer than 2 members
    if (selectedMemberIds.length <= 2) {
      toast.error('Group should contain at least 2 members');
      return;
    }

    const updatedMemberIds = selectedMemberIds.filter((id) => id !== deleteSelected.participant.id);

    try {
      setDeletingMem(true);
      const payload = {
        id: roomCode,
        name: groupName,
        memberIds: updatedMemberIds,
      };
      const result = await updateChatRoom(payload);
      if (result.success) {
        toast.success('Member deleted successfully');
        await mutateChatRooms();
        handleCloseDelete();
      } else {
        toast.error(result.error || 'Failed to delete member');
      }
    } catch (error) {
      console.error('Error deleting chat member:', error);
    } finally {
      setDeletingMem(false);
    }
  };

  const handleOpenMembers = () => {
    setMembers(true);
  };
  const handleMemberDialogClose = () => {
    setTimeout(() => {
      setMembers(false);
    }, 100);
  };
  const handleTogglePerson = (person) => {
    setSelectedPersons((prevSelected) => {
      const isAlreadySelected = prevSelected.some((p) => p.id === person.id);
      if (isAlreadySelected) {
        return prevSelected.filter((p) => p.id !== person.id);
      }
      return [...prevSelected, person];
    });
  };

  const totalParticipants = participants.length;
  console.log('this is the total participants', totalParticipants);

  const renderList = (
    <>
      {conversation?.chatCreatorId === zetaUser?.id && (
        <Box display="flex" alignItems="center" justifyContent="flex-end">
          <Tooltip title="Add Members" arrow>
            <IconButton
              size="small"
              color="primary"
              onClick={() => {
                setMembers(true);
              }}
              sx={{
                width: 20,
                height: 20,
                mt: 2,
                mr: 3,
                ...(storedLang === 'ar' && { ml: 3 }),
                bgcolor: '#006A67',
                color: 'primary.contrastText',
                '&:hover': { bgcolor: 'primary.dark' },
                cursor: 'pointer',
              }}
            >
              <Iconify icon="mingcute:add-line" />
            </IconButton>
          </Tooltip>
        </Box>
      )}

      <AddMemberDialog
        open={members}
        onClick={handleOpenMembers}
        shared={employees.filter(
          (emp) => !participants.some((p) => p.id === emp.id) && emp.id !== zetaUser?.id
        )}
        participants={participants}
        selectedPersons={selectedPersons}
        setSelectedPersons={setSelectedPersons}
        handleClose={handleMemberDialogClose}
        onTogglePerson={handleTogglePerson}
        mutateChatRooms={mutateChatRooms}
        roomCode={roomCode}
        groupName={groupName}
      />

      {participants?.map((participant) => {
        const isOnline = onlineUsers?.some((u) => u.id === participant.id);

        return (
          <Stack key={participant.id} direction="row" flexGrow={1} justifyContent="space-between">
            <ListItemButton disableRipple sx={{ '&:hover': { backgroundColor: 'transparent' } }}>
              <ListItemButton onClick={() => handleOpen(participant)}>
                <Box sx={{ position: 'relative', display: 'inline-block' }}>
                  <Avatar alt={participant.name} src={participant.avatarUrl} />
                  {isOnline && (
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: '#00C853',
                        border: '2px solid white',
                      }}
                    />
                  )}
                </Box>

                <ListItemText
                  sx={{ ml: 2 }}
                  primary={participant.name}
                  secondary={participant.role}
                  primaryTypographyProps={{ noWrap: true, typography: 'subtitle2' }}
                  secondaryTypographyProps={{
                    noWrap: true,
                    component: 'span',
                    typography: 'caption',
                  }}
                />
              </ListItemButton>

              {participants?.length > 1 && conversation?.chatCreatorId === zetaUser?.id && (
                <IconButton onClick={() => handleDelete(participant)} sx={{ color: 'error.main' }}>
                  <Iconify icon="solar:trash-bin-trash-bold" width={15} />
                </IconButton>
              )}
            </ListItemButton>
          </Stack>
        );
      })}

      <CustomPopover open={Boolean(anchorEl)} anchorEl={anchorEl} onClose={handleMenuClose}>
        <MenuList>
          <MenuItem
            onClick={() => {
              handleMenuClose();
              // handleDelete(selectedParticipant);
            }}
            sx={{ color: 'error.main' }}
          >
            <Iconify icon="solar:trash-bin-trash-bold" />
            Delete
          </MenuItem>
        </MenuList>
      </CustomPopover>
    </>
  );

  return (
    <>
      <CollapseButton
        selected={collapse.value}
        disabled={!totalParticipants}
        onClick={collapse.onToggle}
      >
        {`In room (${totalParticipants})`}
      </CollapseButton>

      <Collapse in={collapse.value}>{renderList}</Collapse>

      {selected && (
        <ChatRoomParticipantDialog participant={selected} open={!!selected} onClose={handleClose} />
      )}
      {deleteSelected?.open && (
        <DeleteMemberDialog
          participant={deleteSelected?.participant}
          open={deleteSelected?.open}
          handleParticipantDelete={handleDeleteChatMem}
          onClose={handleCloseDelete}
          DeletingMem={DeletingMem}
        />
      )}
    </>
  );
}
