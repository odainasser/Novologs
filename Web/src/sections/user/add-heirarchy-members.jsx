import { useState } from 'react';
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
import { useTranslation } from 'react-i18next';

// ----------------------------------------------------------------------

export function AddHierarchyMembers({
  open,
  shared = [],
  selectedPersons,
  setSelectedPersons,
  onClose,
  handleClose,
  onTogglePerson,
  isOwner,
  userDepartments,
  userDesignations,
  setNodeToInsertId,
  addEmployee,
  destinationParentNodeId,
  mode,
  isVacant,
  ...other
}) {
  const { t, i18n } = useTranslation('dashboard/teams');
  const storedLang = localStorage.getItem('selectedLang');
  const [searchQuery, setSearchQuery] = useState('');
  const filteredShared =
    shared
      ?.filter((member) => member?.employee)
      ?.filter((member) => {
        const fullName = member.employee.fullName || '';
        const email = member.employee.email || '';

        return (
          fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          email.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }) || [];
  console.log('this is the shared', filteredShared);

  const handleCloseMemberDialog = () => {
    setSearchQuery('');
    if (!mode) {
      setSelectedPersons([]);
    }
    handleClose();
  };

  const handleAddEmployee = () => {
    const matchedMember = filteredShared.find(
      (member) => member?.employee?.id === selectedPersons?.id
    );

    if (matchedMember) {
      setNodeToInsertId(matchedMember.id);
      console.log('Matched member ID:', matchedMember.id);
      if (isVacant === 'vacant') {
        addEmployee({
          sourceNodeId: matchedMember.id,
          targetNodeId: destinationParentNodeId,
        });
      } else {
        addEmployee({
          nodeToInsertId: matchedMember.id,
          destinationParentNodeId: destinationParentNodeId,
        });
      }
    } else {
      console.log('No matching member found.');
    }

    handleCloseMemberDialog();
  };

  return (
    <>
      <Dialog
        fullWidth
        maxWidth="xs"
        open={open}
        onClose={handleCloseMemberDialog}
        dir={storedLang === 'ar' ? 'rtl' : 'ltr'}
        {...other}
      >
        <DialogTitle>{t('hierarchy.general_members')}</DialogTitle>

        <Box sx={{ px: 3 }}>
          <TextField
            fullWidth
            placeholder={t('hierarchy.search')}
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
                  key={member?.employee?.id || member?.id}
                  employee={member?.employee}
                  isSelected={selectedPersons?.id === member?.employee?.id}
                  onTogglePerson={() => onTogglePerson(member?.employee)}
                  userDepartments={userDepartments}
                  userDesignations={userDesignations}
                  mode={mode}
                />
              ))}
            </Box>
          </Scrollbar>
        ) : (
          <Box sx={{ px: 3, py: 2 }}>
            <Typography variant="body2" color="textSecondary">
              {t('hierarchy.no_members')}
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
            {t('hierarchy.toast.cancel')}
          </Button>
          {!mode && shared.length > 0 && (
            <Button variant="contained" onClick={handleAddEmployee} sx={{ bgcolor: '#006A67' }}>
              {t('hierarchy.add')}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
}

export function SelectMember({
  employee,
  isSelected,
  onTogglePerson,
  userDepartments,
  userDesignations,
  mode,
}) {
  const { t } = useTranslation('dashboard/teams');

  return (
    <Box component="li" sx={{ display: 'flex', alignItems: 'center', py: 1 }}>
      <Tooltip title={employee?.email} arrow>
        <Avatar
          alt={employee?.fullName}
          src={employee?.profileImageFileUrl || undefined}
          sx={{ mr: 2 }}
        >
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
                Id : {employee?.code || t('hierarchy.delete.employee_id_is_not')}
              </span>
              <span style={{ margin: '0 2px' }}> - </span>

              <span style={{ fontSize: '0.75rem' }}>
                Designation:{' '}
                {userDesignations?.find((des) => des.id === employee?.designationId)?.name?.value ||
                  t('hierarchy.delete.desigination_not')}
              </span>
              <br />
              <span style={{ fontSize: '0.7rem' }}>
                Department:{' '}
                {userDepartments?.find((dep) => dep.id === employee?.departmentId)?.name?.value ||
                  t('hierarchy.delete.department_not')}
              </span>
            </div>
          </>
        }
        primaryTypographyProps={{ noWrap: true, typography: 'subtitle2' }}
        secondaryTypographyProps={{ noWrap: true, component: 'span' }}
        sx={{ flexGrow: 1, pr: 1 }}
      />
      {!mode && <Checkbox checked={isSelected} onChange={onTogglePerson} />}
    </Box>
  );
}
