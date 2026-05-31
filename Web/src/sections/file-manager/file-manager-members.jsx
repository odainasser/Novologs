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
import { _fmMembers } from './file-manager-mock-data';
import { useTranslation } from 'react-i18next';
import Switch from '@mui/material/Switch';
import { Iconify } from 'src/components/iconify';
import { shareFile } from 'src/actions/file/fileActions';
import { toast } from 'src/components/snackbar';
import { EmptyContent } from 'src/components/empty-content';

export function FileManagerMembers({
  open,
  shared = [],
  selectedPersons,
  setSelectedPersons,
  onClose,
  handleClose,
  onTogglePerson,
  onToggleSharePermission,
  fileType,
  mode,
  selectedRowId,
  mutateFiles,
  selected,
  setSelected,
  selectedRowMembers,
  ...other
}) {
  console.log('this is the shared', shared);
  const { t, i18n } = useTranslation('dashboard/files');
  const storedLang = localStorage.getItem('selectedLang');

  const [searchQuery, setSearchQuery] = useState('');

  const handleChange = (option) => {
    setSelected(option);
  };
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
          ...(selected === 'select' && {
            height: 'inherit',
          }),
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

      <>
        {mode !== 'share' && (
          <>
            <Box
              display="flex"
              alignItems="center"
              gap={1}
              sx={{ mb: 1, px: 3 }}
              justifyContent="space-between"
            >
              <Typography variant="body2" noWrap>
                {t('files.labels.all_members')}
              </Typography>
              <Checkbox checked={selected === 'all'} onChange={() => handleChange('all')} />
            </Box>

            <Box
              display="flex"
              alignItems="center"
              gap={1}
              sx={{ mb: 1, px: 3 }}
              justifyContent="space-between"
            >
              <Typography variant="body2" noWrap>
                {t('files.labels.share_with_me')}
              </Typography>
              <Checkbox checked={selected === 'share'} onChange={() => handleChange('share')} />
            </Box>
            <Box
              display="flex"
              alignItems="center"
              gap={1}
              sx={{ mb: 1, px: 3 }}
              justifyContent="space-between"
            >
              <Typography variant="body2" noWrap>
                {t('files.labels.select_members')}
              </Typography>
              <Checkbox checked={selected === 'select'} onChange={() => handleChange('select')} />
            </Box>
          </>
        )}
      </>
      {selected === 'select' && (
        <>
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

          {filteredShared.length > 0 ? (
            <Scrollbar sx={{ height: 70 * 5, px: 3 }}>
              <Box component="ul">
                {filteredShared.map((member) => {
                  const isChecked = selectedPersons.some((p) => p.id === member.id);
                  const memberInSelected = selectedPersons.find((p) => p.id === member.id);
                  const alreadyShared =
                    mode === 'share'
                      ? selectedRowMembers?.some((shared) => shared.sharedWithUserId === member.id)
                      : false;
                  return (
                    <>
                      <Box component="li" sx={{ display: 'flex', alignItems: 'center', py: 1 }}>
                        <Tooltip title={member?.email} arrow>
                          <Avatar
                            alt={member?.fullName}
                            src={member?.profileImageFileUrl}
                            sx={{ mr: 2 }}
                          >
                            {!member?.profileImageFileUrl &&
                              member?.fullName?.charAt(0).toUpperCase()}
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
                                  Designation: {member?.designationName?.value || 'Not Available'}
                                </span>
                                <br />
                                <span style={{ fontSize: '0.7rem' }}>
                                  Department: {member?.departmentName?.value || 'Not Available'}
                                </span>
                                <span style={{ margin: '0 2px' }}> , </span>
                                <span
                                  style={{
                                    fontSize: '0.7rem',
                                    color: member?.lastWorkStatus?.workStatus?.color,
                                  }}
                                >
                                  Status :{' '}
                                  {member?.lastWorkStatus?.workStatus?.name?.value ||
                                    'Not Available'}
                                </span>
                              </div>
                            </>
                          }
                          primaryTypographyProps={{ noWrap: true, typography: 'subtitle2' }}
                          secondaryTypographyProps={{ noWrap: true, component: 'span' }}
                          sx={{ flexGrow: 1, pr: 1 }}
                        />

                        <Checkbox
                          checked={isChecked}
                          disabled={alreadyShared}
                          onChange={() => onTogglePerson(member)}
                          sx={{
                            opacity: alreadyShared ? 0.6 : 1,
                          }}
                        />
                        {/* <Tooltip title={t('files.labels.share_permission')} arrow>
                    {' '}
                    <Switch
                      checked={memberInSelected?.sharePermission || false}
                      onChange={(event) => onToggleSharePermission(member.id, event.target.checked)}
                      disabled={!isChecked}
                    />
                  </Tooltip> */}
                        {/* <Tooltip title={t('files.tooltip.tooltip_title')} arrow>
                    <Iconify
                      icon="mdi:information-outline"
                      sx={{
                        ml: 0.5,
                        width: 16,
                        height: 16,
                        color: 'text.secondary',
                        cursor: 'pointer',
                        '&:hover': {
                          color: 'primary.main',
                        },
                      }}
                    />
                  </Tooltip> */}
                      </Box>
                    </>
                  );
                })}
              </Box>
            </Scrollbar>
          ) : (
            <EmptyContent
              filled
              title={t('files.placeholder.no_members_found')}
              description={t('files.placeholder.desc_members')}
            />
          )}
        </>
      )}

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          variant="outlined"
          color="inherit"
          // onClick={handleCloseMemberDialog}
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
          {mode === 'add' && filteredShared.length > 0
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
