import { useState } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogActions,
  Button,
  TextField,
  Checkbox,
  Avatar,
  Typography,
  ListItemText,
  Tooltip,
} from '@mui/material';
import { Scrollbar } from 'src/components/scrollbar';
import { useTranslation } from 'react-i18next';
import Switch from '@mui/material/Switch';
import { Iconify } from 'src/components/iconify';
import { shareFile } from 'src/actions/file/fileActions';
import { toast } from 'src/components/snackbar';

export function WorkFlowFileMembers({
  open,
  shared = [],
  selectedPersons,
  setSelectedPersons,
  onClose,
  handleClose,
  onTogglePerson,
  fileType,
  mode,
  selectedRowId,
  mutateFiles,
  ...other
}) {
  const { t, i18n } = useTranslation('dashboard/files');
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

  const handleAddMembers = () => {
    handleCloseMemberDialog();
  };

  const handleShareDetail = async () => {
    const detail = {
      id: selectedRowId,
      members: [
        ...selectedPersons.map((person) => ({
          id: person.id,
          folderSharePermissionLevel: person.sharePermission ? 1 : 0,
        })),
      ],
    };
    console.log('this is the details', detail);
    try {
      const response = await shareFile(detail);
      if (response.success) {
        toast.success(t('files.toast.shared_success'));
        handleCloseMemberDialog();
        await mutateFiles();
      } else {
        toast.error(response.error);
        console.error('Upload error:', response.error);
      }
    } catch (error) {
      console.error('Add file failed:', error);
    }
  };
  return (
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
      <DialogTitle>
        {' '}
        {mode === 'add'
          ? t('files.placeholder.add_members')
          : mode === 'edit'
            ? t('files.placeholder.edit_members')
            : mode === 'share'
              ? t('files.labels.share')
              : t('files.labels.members')}
      </DialogTitle>

      <Box sx={{ px: 3 }}>
        <TextField
          fullWidth
          placeholder={t('files.placeholder.search')}
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

      <Scrollbar sx={{ height: 70 * 5, px: 3 }}>
        <Box component="ul">
          {filteredShared.map((member) => {
            const isChecked = selectedPersons?.id === member.id;

            return (
              <>
                <Box component="li" sx={{ display: 'flex', alignItems: 'center', py: 1 }}>
                  <Tooltip title={member?.email} arrow>
                    <Avatar alt={member?.fullName} src={member?.profileImageFileUrl} sx={{ mr: 2 }}>
                      {!member?.profileImageFileUrl && member?.fullName?.charAt(0).toUpperCase()}
                    </Avatar>
                  </Tooltip>

                  <ListItemText
                    secondary={
                      <>
                        <div>
                          <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                            {member?.fullName}
                          </span>

                          <br />
                          <span style={{ fontSize: '0.75rem' }}>
                            Id : {String(member?.serial).padStart(4, '0') || 'Not available'}
                          </span>
                          <br />
                          <span style={{ fontSize: '0.75rem' }}>
                            Code : {member?.code || 'Not available'}
                          </span>
                          <span style={{ margin: '0 2px' }}> , </span>
                          <span style={{ fontSize: '0.75rem' }}>
                            Designation: {member?.designationName?.value || 'Not available'}
                          </span>
                          <br />
                          <span style={{ fontSize: '0.7rem' }}>
                            Department: {member?.departmentName?.value || 'Not available'}
                          </span>
                          <span style={{ margin: '0 2px' }}> , </span>
                          <span
                            style={{
                              fontSize: '0.7rem',
                              color: member?.lastWorkStatus?.workStatus?.color,
                            }}
                          >
                            Status :{' '}
                            {member?.lastWorkStatus?.workStatus?.name?.value || 'Not available'}
                          </span>
                        </div>
                      </>
                    }
                    primaryTypographyProps={{ noWrap: true, typography: 'subtitle2' }}
                    secondaryTypographyProps={{ noWrap: true, component: 'span' }}
                    sx={{ flexGrow: 1, pr: 1 }}
                  />

                  <Checkbox checked={isChecked} onChange={() => onTogglePerson(member)} />
                </Box>
              </>
            );
          })}
        </Box>
      </Scrollbar>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          variant="outlined"
          color="inherit"
          onClick={handleClose}
          sx={{
            ...(storedLang === 'ar' && { ml: 1 }),
          }}
        >
          {t('files.buttons.cancel')}
        </Button>
        <Button
          variant="contained"
          onClick={mode === 'share' ? handleShareDetail : handleAddMembers}
        >
          {mode === 'add'
            ? t('files.buttons.add')
            : mode === 'edit'
              ? t('files.buttons.save')
              : mode === 'share'
                ? t('files.buttons.share')
                : t('files.buttons.close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
