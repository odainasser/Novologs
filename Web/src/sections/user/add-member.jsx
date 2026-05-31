import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';

import Typography from '@mui/material/Typography';
import { Scrollbar } from 'src/components/scrollbar';

import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import Card from '@mui/material/Card';
import { Divider } from '@mui/material';
import { useMockedUser } from 'src/auth/hooks';
import Switch from '@mui/material/Switch';
import { useTranslation } from 'react-i18next';
import { toast } from 'src/components/snackbar';
import { assignPermissionToUser } from 'src/actions/userManage/userManageActions';
// ----------------------------------------------------------------------

export function AddMember({
  open,
  shared = [],
  selectedPersons,
  setSelectedPersons,
  onClose,
  handleClose,
  onTogglePerson,
  mode,
  targetPermission,
  addNewGroup,
  mutateUserList,
  usersPermissionListMutate,
  isTaskExempt,
  mutateAvailableUsers,
  ...other
}) {
  const { t, i18n } = useTranslation('dashboard/teams');
  const [searchQuery, setSearchQuery] = useState('');
  const [groupIDError, setGroupIDError] = useState(false);
  const [groupNameError, setGroupNameError] = useState(false);

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
    const ids = selectedPersons.map((person) => person.id);
    console.log('this is the newGroup', ids);
    const payload = {
      userIds: ids,
      permissionIds: [targetPermission?.id],
    };

    console.log('this is the payload', payload);

    try {
      const response = await assignPermissionToUser(payload);
      if (response.success) {
        toast.success(
          isTaskExempt
            ? t('task_exempted.toast.assigning_tasks')
            : t('task_exempted.toast.permission_granted')
        );

        setSelectedPersons([]);

        await mutateUserList();
        if (isTaskExempt) {
          await mutateAvailableUsers();
        }
        await usersPermissionListMutate();
        handleCloseMemberDialog();
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      console.error('Add Permissions failed:', error);
    }
  };

  return (
    <>
      <Dialog
        fullWidth
        maxWidth={mode === 'add' ? 'xs' : 'md'}
        open={open}
        onClose={handleCloseMemberDialog}
        {...other}
      >
        <DialogTitle>{mode === 'add' ? t('task_exempted.buttons.add_member') : ''}</DialogTitle>

        {mode === 'add' && (
          <Box sx={{ px: 3 }}>
            <TextField
              fullWidth
              placeholder={t('task_exempted.placeholder')}
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
        )}

        {filteredShared.length > 0 ? (
          <Scrollbar sx={{ height: 70 * 5, px: 3 }}>
            <Box component="ul">
              {filteredShared.map((member) => (
                <SelectMember
                  key={member?.id}
                  employee={member}
                  isSelected={selectedPersons?.some((p) => p.id === member?.id)}
                  onTogglePerson={() => onTogglePerson(member)}
                  mode={mode}
                />
              ))}
            </Box>
          </Scrollbar>
        ) : (
          <Box sx={{ px: 3, py: 2 }}>
            <Typography variant="body2" color="textSecondary">
              {t('task_exempted.labels.no_members')}
            </Typography>
          </Box>
        )}

        <DialogActions>
          <Button
            variant="contained"
            onClick={handleAddMember}
            sx={{ bgcolor: mode === 'add' ? '#006A67' : '' }}
          >
            {mode === 'add' ? t('task_exempted.buttons.add') : t('task_exempted.buttons.close')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export function SelectMember({ employee, isSelected, onTogglePerson, mode }) {
  const { t, i18n } = useTranslation('dashboard/teams');

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
                {t('table.headings.id')} :{' '}
                {String(employee?.serial).padStart(4, '0') || 'Not available'}
              </span>
              <br />
              <span style={{ fontSize: '0.75rem' }}>
                Code : {employee?.code || 'Not available'}
              </span>
              <span style={{ margin: '0 2px' }}> , </span>
              <span style={{ fontSize: '0.75rem' }}>
                {t('table.headings.designation')}:{' '}
                {employee?.designationName?.value || 'Not available'}
              </span>
              <br />
              <span style={{ fontSize: '0.7rem' }}>
                {t('table.headings.department')}:{' '}
                {employee?.departmentName?.value || 'Not available'}
              </span>
              <span style={{ margin: '0 2px' }}> , </span>
              <span
                style={{
                  fontSize: '0.7rem',
                  color: employee?.lastWorkStatus?.workStatus?.color,
                }}
              >
                Status : {employee?.lastWorkStatus?.workStatus?.name?.value || 'Not available'}
              </span>
            </div>
          </>
        }
        primaryTypographyProps={{ noWrap: true, typography: 'subtitle2' }}
        secondaryTypographyProps={{ noWrap: true, component: 'span' }}
        sx={{ flexGrow: 1, pr: 1 }}
      />
      {mode === 'add' && <Checkbox checked={isSelected} onChange={onTogglePerson} />}
    </Box>
  );
}
