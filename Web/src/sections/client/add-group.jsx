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
import Card from '@mui/material/Card';
import { Divider } from '@mui/material';
import { useMockedUser } from 'src/auth/hooks';
import Switch from '@mui/material/Switch';
import { useTranslation } from 'react-i18next';
import { addUserGroup, updateUserGroup } from 'src/actions/userManage/userManageActions';
import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

export function AddGroup({
  open,
  shared = [],
  selectedPersons,
  setSelectedPersons,
  onClose,
  handleClose,
  onTogglePerson,
  mode,
  groupID,
  groupName,
  setGroupID,
  setGroupName,
  addNewGroup,
  mutateUsers,
  mutateUserGroups,
  groupIdToEdit,
  ...other
}) {
  const { t, i18n } = useTranslation('dashboard/client');
  const storedLang = localStorage.getItem('selectedLang');
  const { zetaUser } = useAuthContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [groupIDError, setGroupIDError] = useState(false);
  const [groupNameError, setGroupNameError] = useState(false);
  console.log('this is  the mode', mode);

  const filteredShared = shared.filter(
    (member) =>
      member.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.memberName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCloseMemberDialog = () => {
    setSearchQuery('');
    if (mode !== 'edit') {
      setGroupID('');
      setGroupName('');
    }
    setGroupIDError(false);
    setGroupNameError(false);
    handleClose();
  };

  const handleAddGroup = async () => {
    setGroupIDError(false);
    setGroupNameError(false);

    if (!groupID || !groupName) {
      if (!groupID) setGroupIDError(true);
      if (!groupName) setGroupNameError(true);
      return;
    }
    const membersIds = Array.from(
      new Set([...selectedPersons.map((member) => member.id), zetaUser?.id])
    );
    const newGroup = {
      code: groupID,
      name: groupName,
      memberIds: membersIds,
    };

    try {
      let response;
      if (mode === 'edit') {
        newGroup.id = groupIdToEdit;
        console.log('this is the new group', newGroup);
        response = await updateUserGroup(newGroup);
        if (response.success) {
          toast.success(t('clients.labels.sales_group'));
        } else {
          toast.error(response.error);
        }
      } else {
        response = await addUserGroup(newGroup);
        if (response.success) {
          toast.success(t('clients.labels.sales_group_created'));
        } else {
          toast.error(response.error);
        }
      }

      if (response.success) {
        setSelectedPersons([]);
        handleCloseMemberDialog();
        await mutateUserGroups();
        await mutateUsers();
      }
    } catch (error) {
      console.error(
        `${mode === 'edit' ? t('buttons.update') : t('buttons.add')} group failed:`,
        error
      );
    }
  };

  const { user } = useMockedUser();
  const handleGroupIDChange = (event) => {
    setGroupID(event.target.value);
    if (groupIDError && event.target.value) {
      setGroupIDError(false);
    }
  };

  const handleGroupNameChange = (event) => {
    setGroupName(event.target.value);
    if (groupNameError && event.target.value) {
      setGroupNameError(false);
    }
  };
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
        <DialogTitle>
          {mode === 'add' ? t('clients.buttons.add_group') : t('clients.buttons.edit_group')}
        </DialogTitle>

        <>
          <Box display="flex" gap={1} sx={{ px: 3, pb: 2 }} flexDirection="column">
            <Box display="flex" justifyContent="space-between" alignItems="center" gap={1}>
              <Typography variant="body2" color="text.secondary" noWrap>
                {t('clients.labels.group_id')}
              </Typography>
              <TextField
                value={groupID}
                onChange={handleGroupIDChange}
                placeholder={t('clients.placeholder.group_id')}
                variant="outlined"
                size="small"
                sx={{ width: 200 }}
                error={groupIDError}
                helperText={groupIDError ? t('clients.validations.group_id') : ''}
              />
            </Box>

            <Box display="flex" justifyContent="space-between" alignItems="center" gap={1}>
              <Typography variant="body2" color="text.secondary" noWrap>
                {t('clients.labels.group_name')}
              </Typography>
              <TextField
                value={groupName}
                onChange={handleGroupNameChange}
                placeholder={t('clients.placeholder.group_name')}
                variant="outlined"
                size="small"
                sx={{ width: 200 }}
                error={groupNameError}
                helperText={groupNameError ? t('clients.validations.group_name') : ''}
              />
            </Box>
          </Box>
        </>

        <Box sx={{ px: 3 }}>
          <TextField
            fullWidth
            placeholder={t('clients.placeholder.search')}
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
                  mode={mode}
                />
              ))}
            </Box>
          </Scrollbar>
        ) : (
          <Box sx={{ px: 3, py: 2 }}>
            <Typography variant="body2" color="textSecondary">
              {t('clients.labels.no_members')}
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
            {t('clients.buttons.cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={handleAddGroup}
            disabled={selectedPersons?.length === 0}
            sx={{ bgcolor: '#006A67' }}
          >
            {mode === 'add' ? t('clients.buttons.add') : t('clients.buttons.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export function SelectMember({ employee, isSelected, onTogglePerson, mode }) {
  const { t, i18n } = useTranslation('dashboard/client');

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
                Id : {String(employee?.serial).padStart(4, '0') || 'Not available'}
              </span>
              <br />
              <span style={{ fontSize: '0.75rem' }}>
                Code : {employee?.code || 'Not available'}
              </span>
              <span style={{ margin: '0 2px' }}> , </span>
              <span style={{ fontSize: '0.75rem' }}>
                {t('clients.columns.role')}: {employee?.designationName?.value || 'Not available'}
              </span>
              <br />
              <span style={{ fontSize: '0.7rem' }}>
                {t('clients.columns.department')}:{' '}
                {employee?.departmentName?.value || 'Not available'}
              </span>
              <span style={{ margin: '0 2px' }}> , </span>
              <span
                style={{ fontSize: '0.7rem', color: employee?.lastWorkStatus?.workStatus?.color }}
              >
                {t('clients.columns.status')} :{' '}
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
