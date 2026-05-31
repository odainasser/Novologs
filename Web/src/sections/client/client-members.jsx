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

// ----------------------------------------------------------------------

export function ClientMembers({
  open,
  shared = [],
  selectedPersons,
  setSelectedPersons,
  onClose,
  handleClose,
  onTogglePerson,
  mode,
  ...other
}) {
  const { t, i18n } = useTranslation('dashboard/client');
  const isRTL = i18n.language === 'ar';
  const [searchQuery, setSearchQuery] = useState('');

  const filteredShared = shared.filter((member) =>
    member.firstName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCloseMemberDialog = () => {
    setSearchQuery('');
    setGroupID('');
    setGroupName('');
    handleClose();
  };

  const { user } = useMockedUser();
  const [groupID, setGroupID] = useState('');
  const [groupName, setGroupName] = useState('');
  return (
    <>
      <Dialog
        fullWidth
        maxWidth={mode === 'add' ? 'xs' : 'md'}
        open={open}
        onClose={handleCloseMemberDialog}
        {...other}
      >
        <DialogTitle>
          {mode === 'add' ? t('clients.buttons.add_members') : t('clients.buttons.members')}
        </DialogTitle>
        {mode === 'add' && (
          <>
            <Box display="flex" gap={1} sx={{ px: 3, pb: 2 }} flexDirection="column">
              <Box display="flex" justifyContent="space-between" alignItems="center" gap={1}>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {t('clients.labels.group_id')}
                </Typography>
                <TextField
                  value={groupID}
                  onChange={(event) => setGroupID(event.target.value)}
                  placeholder={t('clients.placeholder.group_id')}
                  variant="outlined"
                  size="small"
                  sx={{ width: 200 }}
                />
              </Box>

              <Box display="flex" justifyContent="space-between" alignItems="center" gap={1}>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {t('clients.label.group_name')}
                </Typography>
                <TextField
                  value={groupName}
                  onChange={(event) => setGroupName(event.target.value)}
                  placeholder={t('clients.placeholder.group_name')}
                  variant="outlined"
                  size="small"
                  sx={{ width: 200 }}
                />
              </Box>
            </Box>
          </>
        )}
        {mode === 'add' && (
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
        )}

        {filteredShared.length > 0 ? (
          <Scrollbar sx={{ height: 70 * 5, px: 3 }}>
            {mode === 'add' ? (
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
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    py: 2,
                    borderRadius: 1,
                    width: '100%',
                    height: '100%',
                    textAlign: 'center',
                  }}
                >
                  <Avatar
                    alt={user?.displayName}
                    src={user?.photoURL}
                    sx={{ width: 56, height: 56, mb: 1 }}
                  />

                  <Typography variant="subtitle1" fontWeight="bold" noWrap>
                    {user?.displayName}
                  </Typography>

                  <Typography variant="caption" color="text.secondary" noWrap>
                    {user?.email}
                  </Typography>
                </Box>

                <Box
                  component="ul"
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                    gap: 2,
                    listStyle: 'none',
                    p: 0,
                    m: 0,
                  }}
                >
                  {filteredShared.map((member) => (
                    <ViewMember key={member?.id} employee={member} />
                  ))}
                </Box>
              </Box>
            )}
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
            onClick={(event) => {
              handleCloseMemberDialog();
            }}
          >
            {mode === 'add' ? t('clients.buttons.add') : t('clients.buttons.close')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export function SelectMember({ employee, isSelected, onTogglePerson, mode }) {
  return (
    <Box component="li" sx={{ display: 'flex', alignItems: 'center', py: 1 }}>
      <Tooltip title={employee?.firstName} arrow>
        <Avatar alt={employee?.firstName} src={employee?.photoPath} sx={{ mr: 2 }} />
      </Tooltip>

      <ListItemText
        secondary={
          <div>
            <span style={{ fontSize: '0.875rem' }}>{employee?.email}</span>
            <br />
          </div>
        }
        primaryTypographyProps={{ noWrap: true, typography: 'subtitle2' }}
        sx={{ flexGrow: 1, pr: 1 }}
      />
      {mode === 'add' && <Checkbox checked={isSelected} onChange={onTogglePerson} />}
    </Box>
  );
}

export function ViewMember({ employee }) {
  return (
    <Card
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        py: 2,
        borderRadius: 1,
        width: '100%',
        maxWidth: 180,
      }}
    >
      <Avatar
        alt={employee?.firstName}
        src={employee?.photoPath}
        sx={{ width: 56, height: 56, mb: 1 }}
      />

      <Typography variant="subtitle1" fontWeight="bold" noWrap>
        {employee?.firstName}
      </Typography>

      <Typography variant="caption" color="text.secondary" noWrap>
        {employee?.email}
      </Typography>
    </Card>
  );
}
