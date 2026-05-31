import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';

import Typography from '@mui/material/Typography';
import { Scrollbar } from 'src/components/scrollbar';
import { toast } from 'src/components/snackbar';

import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import { useMockedUser } from 'src/auth/hooks';
import { useTranslation } from 'react-i18next';
import { updateChatRoom } from 'src/actions/chat/chatActions';

// ----------------------------------------------------------------------

export function AddMemberDialog({
  open,
  shared = [],
  selectedPersons,
  setSelectedPersons,
  onClose,
  handleClose,
  onTogglePerson,
  groupName,
  roomCode,
  participants,
  mutateChatRooms,
  ...other
}) {
const { t, i18n } = useTranslation('dashboard/chat');
  const storedLang = localStorage.getItem('selectedLang');


  const [searchQuery, setSearchQuery] = useState('');

  const filteredShared = shared.filter(
    (member) =>
      member.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.memberName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCloseMemberDialog = () => {
    setSearchQuery('');
    handleClose();
  };

  const handleAddMember = async () => {
    const membersIds = selectedPersons.map((member) => member.id);
    const participantIds = participants.map((participant) => participant.id);
    const finalMemberIds = Array.from(new Set([...membersIds, ...participantIds]));
    try {
      const payload = {
        id: roomCode,
        name: groupName,
        memberIds: finalMemberIds,
      };
      const result = await updateChatRoom(payload);
      if (result.success) {
        setSelectedPersons([]);
        handleCloseMemberDialog();
        toast.success(t('chat.member_added'));
        await mutateChatRooms();
      } else {
        toast.error(result.error || t('chat.failed_addmember'));
        setSelectedPersons([]);
      }
    } catch (error) {
      console.error('Error adding chat member:', error);
    }
  };

  const { user } = useMockedUser();

  return (
    <>
      <Dialog
        fullWidth
        maxWidth="xs"
        open={open}
        onClose={handleCloseMemberDialog}
        sx={{
          '& .MuiDialog-paper': {
            height: 'inherit',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
        dir={storedLang === 'ar' ? 'rtl' : 'ltr'}
        {...other}
      >
        <DialogTitle>{('chat.add_members')}</DialogTitle>

        <Box sx={{ px: 3 }}>
          <TextField
            fullWidth
            placeholder={t('chat.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              mb: 1,
              '& .MuiInputBase-input': {
                padding: '10px 14px',
              },
              '& .MuiInputLabel-root': {
                top: '-7px',
              },
            }}
          />
        </Box>

        {filteredShared.length > 0 ? (
          <Scrollbar sx={{ height: 70 * 5, px: 3 }}>
            <Box component="ul">
              {filteredShared.map((member) => (
                <SelectMember
                  key={member?.id}
                  employee={member}
                  isSelected={selectedPersons?.some((p) => p.id === member?.id)}
                  onTogglePerson={() => onTogglePerson(member)}
                />
              ))}
            </Box>
          </Scrollbar>
        ) : (
          <Box sx={{ px: 3, py: 2 }}>
            <Typography variant="body2" color="textSecondary">
              {t('chat.no_members_available')}
            </Typography>
          </Box>
        )}

        <DialogActions>
          <Button
            variant="contained"
            onClick={handleCloseMemberDialog}
            sx={{
              ...(storedLang === 'ar' && { ml: 1 }),
            }}
          >
               {t('chat.cancel')}
          </Button>
          <Button variant="contained" onClick={handleAddMember} sx={{ bgcolor: '#006A67' }}>
                {t('chat.add')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export function SelectMember({ employee, isSelected, onTogglePerson }) {
  const{t} = useTranslation('dashboard/chat');
  return (
    <Box component="li" sx={{ display: 'flex', alignItems: 'center', py: 1 }}>
      <Tooltip title={employee?.email} arrow>
        <Avatar alt={employee?.fullName} src={employee?.profileImageFileUrl} sx={{ mr: 2 }}>
          {!employee?.profileImageFileUrl && employee?.fullName?.charAt(0).toUpperCase()}
        </Avatar>
      </Tooltip>

      <ListItemText
        secondary={
          <>
             <div>
              <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{employee?.fullName}</span>
              <br />
              <span style={{ fontSize: '0.75rem' }}>
                 {t('chat.id')} : {String(employee?.serial).padStart(4, '0') || 'Not available'}
              </span>
              <br />
              <span style={{ fontSize: '0.75rem' }}>
                Code : {employee?.code || 'Not available'}
              </span>
              <span style={{ margin: '0 2px' }}> , </span>
              <span style={{ fontSize: '0.75rem' }}>
                 {t('chat.designation')}: {employee?.designationName?.value || 'Not available'}
              </span>
              <br />
              <span style={{ fontSize: '0.7rem' }}>
                 {t('chat.department')}: {employee?.departmentName?.value || 'Not available'}
              </span>
              <span style={{ margin: '0 2px' }}> , </span>
              <span
                style={{ fontSize: '0.7rem', color: employee?.lastWorkStatus?.workStatus?.color }}
              >
                 {t('chat.status')}:{' '}
                {employee?.lastWorkStatus?.workStatus?.name?.value || 'Not available'}
              </span>
            </div>
          </>
        }
        primaryTypographyProps={{ noWrap: true, typography: 'subtitle2' }}
        secondaryTypographyProps={{ noWrap: true, component: 'span' }}
        sx={{ flexGrow: 1, pr: 1 }}
      />

      <Checkbox checked={isSelected} onChange={onTogglePerson} />
    </Box>
  );
}
