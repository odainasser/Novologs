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
import { useTranslation } from 'react-i18next';
import Stack from '@mui/material/Stack';
import { getUser } from 'src/actions/userManage/userManageActions';
import { shareLeadMembers, getLeadMemberByLeadId } from 'src/actions/client/clientActions';
import { toast } from 'src/components/snackbar';

// ----------------------------------------------------------------------

export function LeadMember({
  open,
  selectedPersons,
  setSelectedPersons,
  onClose,
  handleClose,
  onTogglePerson,
  mode,
  leadId,
  mutateLead,
  leadMembers,
  ...other
}) {
  const { t } = useTranslation('dashboard/projects');
  const storedLang = localStorage.getItem('selectedLang');
  const subFilters = [
    {
      fieldName: 'emailConfirmed',
      fieldValue: true,
      operator: 0,
      logicOperator: 0,
    },
  ];
  const getUsersParams = {
    pagination: {
      pageNumber: 1,
      pageSize: 1000,
    },
    search: {
      fieldName: 'isActive',
      fieldValue: true,
      operator: 0,
      logicOperator: 0,
      subFilters,
    },
  };
  const { usersList, usersListLoading, usersListError, usersListValidating, usersListEmpty } =
    getUser(getUsersParams);
  const {
    leadMembersById,
    leadMembersByIdLoading,
    leadMembersByIdError,
    mutate: mutateLeadMembers,
  } = getLeadMemberByLeadId(leadId, open);

  const [searchQuery, setSearchQuery] = useState('');

  const filteredShared = usersList?.users?.filter(
    (member) =>
      member.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.member?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.member?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  console.log('this is the filteredShared', filteredShared);
  const handleCloseMemberDialog = () => {
    setSearchQuery('');
    setSelectedPersons([]);
    handleClose();
  };
  useEffect(() => {
    if (!open) return;
    if (mode !== 'add' && mode !== 'edit') return;

    const existingMembers = leadMembersById?.details || [];

    if (existingMembers.length > 0) {
      const preSelectedMembers = existingMembers.map((item) => item?.member).filter(Boolean);

      setSelectedPersons(preSelectedMembers);
    } else {
      setSelectedPersons([]);
    }
  }, [open, mode, leadMembersById, setSelectedPersons]);
  const { user } = useMockedUser();
  const handleShare = async () => {
    const selectedPersonIds = selectedPersons?.map((person) => person?.id).filter(Boolean);

    console.log('selectedPerson ids', selectedPersonIds);
    const members = selectedPersons
      ?.map((person) => person?.id)
      .filter(Boolean)
      .map((id) => ({ memberId: id }));
    const payload = {
      leadId,
      members,
    };
    console.log('this is the payload', payload);

    try {
      const response = await shareLeadMembers(payload);
      console.log('this is the response', response);
      if (response.success) {
        toast.success('Lead is shared with the members successfully');

        setSelectedPersons([]);
        handleCloseMemberDialog();

        await mutateLead();
        await mutateLeadMembers();
      } else {
        toast.error(response.error || 'Lead share failed');
      }
    } catch (error) {
      console.error('Add lead member failed:', error);
    }
  };
  return (
    <>
      <Dialog
        fullWidth
        maxWidth={mode === 'add' || mode === 'edit' ? 'xs' : 'md'}
        open={open}
        onClose={handleCloseMemberDialog}
        sx={{
          '& .MuiDialog-paper': {
            height: mode === 'add' || mode === 'edit' ? 'inherit' : '60vh',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
        dir={storedLang === 'ar' ? 'rtl' : 'ltr'}
        {...other}
      >
        <DialogTitle>
          {mode === 'add'
            ? t('projects.add_members')
            : mode === 'edit'
              ? t('projects.edit_members')
              : mode === 'view'
                ? 'Shared Members'
                : 'Members'}
        </DialogTitle>

        {(mode === 'add' || mode === 'edit') && (
          <>
            <Box sx={{ px: 3 }}>
              <TextField
                fullWidth
                placeholder={t('projects.project_settings.tabs.search')}
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

              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  onClick={() => setSelectedPersons([])}
                  color="error"
                  variant="contained"
                  size="small"
                  sx={{ whiteSpace: 'nowrap' }}
                >
                  {t('projects.table.clear_All')}
                </Button>
              </Box>
            </Box>
          </>
        )}

        {(mode === 'view' ? leadMembers?.length : filteredShared?.length) > 0 ? (
          <Scrollbar sx={{ height: 70 * 5, px: 3 }}>
            {mode === 'add' || mode === 'edit' ? (
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
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box
                  component="ul"
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                    gap: 2,
                    listStyle: 'none',
                    p: 0,
                    m: 0,
                    pb: 1,
                  }}
                >
                  {leadMembers?.map((item) => (
                    <ViewMember key={item?.memberId} employee={item?.member} />
                  ))}
                </Box>
              </Box>
            )}
          </Scrollbar>
        ) : (
          <Box sx={{ px: 3, py: 2 }}>
            <Typography variant="body2" color="textSecondary">
              No members found
            </Typography>
          </Box>
        )}

        <DialogActions>
          {(mode === 'add' || mode === 'edit') && (
            <Button
              variant="contained"
              onClick={handleCloseMemberDialog}
              sx={{
                ...(storedLang === 'ar' && { ml: 1 }),
              }}
            >
              {t('projects.cancel')}
            </Button>
          )}
          <Button
            variant="contained"
            onClick={handleShare}
            sx={{
              ...(mode === 'add' || mode === 'edit' ? { bgcolor: '#006A67' } : {}),
            }}
          >
            {mode === 'add' ? 'Share' : mode === 'edit' ? t('projects.table.save') : 'Close'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export function SelectMember({ employee, isSelected, onTogglePerson, mode, assignToMe }) {
  const { t } = useTranslation('dashboard/projects');
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
                Id : {String(employee?.serial).padStart(4, '0') || 'Not available'}
              </span>
              <br />
              <span style={{ fontSize: '0.75rem' }}>
                Code : {employee?.code || 'Not available'}
              </span>
              <span style={{ margin: '0 2px' }}> , </span>
              <span style={{ fontSize: '0.75rem' }}>
                Designation: {employee?.designationName?.value || 'Not available'}
              </span>
              <br />
              <span style={{ fontSize: '0.7rem' }}>
                Department: {employee?.departmentName?.value || 'Not available'}
              </span>
              <span style={{ margin: '0 2px' }}> , </span>
              <span
                style={{ fontSize: '0.7rem', color: employee?.lastWorkStatus?.workStatus?.color }}
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

      {(mode === 'add' || mode === 'edit') && (
        <Checkbox checked={isSelected} onChange={onTogglePerson} />
      )}
    </Box>
  );
}

export function ViewMember({ employee }) {
  const { t } = useTranslation('dashboard/projects');
  return (
    <Card
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        py: 2,
        borderRadius: 1,
        width: '100%',
        maxWidth: 160,
      }}
    >
      <Avatar
        alt={employee?.fullName}
        src={employee?.profileImageFileUrl || undefined}
        sx={{ width: 56, height: 56, mb: 1 }}
      >
        {!employee?.profileImageFileUrl && employee?.fullName?.charAt(0).toUpperCase()}
      </Avatar>

      <Typography
        variant="subtitle1"
        fontWeight="bold"
        noWrap
        sx={{
          display: 'block',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: '100%',
        }}
      >
        {employee?.fullName}
      </Typography>

      <Typography
        variant="caption"
        color="text.secondary"
        noWrap
        sx={{
          display: 'block',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: '100%',
        }}
      >
        {employee?.email}
      </Typography>

      <Typography variant="caption" color="text.secondary" noWrap>
        Designation: {employee?.designationName?.value || t('projects.not_available')}
      </Typography>

      <Typography variant="caption" noWrap>
        Department: {employee?.departmentName?.value || t('projects.not_available')}
      </Typography>
    </Card>
  );
}
