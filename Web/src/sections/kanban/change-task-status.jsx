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
import { useTranslation } from 'react-i18next';

// ----------------------------------------------------------------------

export function ChangeTaskStatus({
  open,
  shared = [],
  selectedStatus,
  onClose,
  handleClose,
  onToggleStatus,
  addStatus,
  ...other
}) {
  console.log('this is the selectedStatus', selectedStatus);
  console.log('this is the shared', shared);

  const { t, i18n } = useTranslation('dashboard/client');
  const storedLang = localStorage.getItem('selectedLang');

  const [searchQuery, setSearchQuery] = useState('');

  const filteredShared = shared.filter((status) =>
    status.name?.value.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCloseStatusDialog = () => {
    setSearchQuery('');
    handleClose();
  };

  const handleChangeStatus = () => {
    if (selectedStatus) {
      // Ensure a status is selected
      addStatus(selectedStatus); // Pass the selected status ID to the parent's addStatus
      handleCloseStatusDialog();
    }
  };

  return (
    <>
      <Dialog
        fullWidth
        maxWidth="xs"
        open={open}
        onClose={handleCloseStatusDialog}
        dir={storedLang === 'ar' ? 'rtl' : 'ltr'}
        {...other}
      >
        <DialogTitle>{t('clients.labels.Change_status')}</DialogTitle>

        <Box sx={{ px: 3 }}>
          <TextField
            fullWidth
            placeholder={t('clients.filters.search')}
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
              {filteredShared.map((status) => (
                <SelectStatus
                  key={status?.id}
                  status={status}
                  isSelected={selectedStatus === status?.id}
                  onToggleStatus={() => onToggleStatus(status?.id)}
                />
              ))}
            </Box>
          </Scrollbar>
        ) : (
          <Box sx={{ px: 3, py: 2 }}>
            <Typography variant="body2" color="textSecondary">
              {t('clients.labels.no_status_available')}
            </Typography>
          </Box>
        )}

        <DialogActions>
          <Button
            variant="contained"
            onClick={handleCloseStatusDialog}
            sx={{
              ...(storedLang === 'ar' && { ml: 1 }),
            }}
          >
            {t('clients.buttons.cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={handleChangeStatus}
            disabled={!selectedStatus}
            sx={{ bgcolor: '#006A67' }}
          >
            {t('clients.labels.change')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export function SelectStatus({ status, isSelected, onToggleStatus }) {
  const storedLang = localStorage.getItem('selectedLang');

  return (
    <Box component="li" sx={{ display: 'flex', alignItems: 'center', py: 1 }}>
      <ListItemText
        secondary={
          <div>
            <span style={{ fontSize: '0.875rem' }}>
              {' '}
              {status?.name?.localizedStrings?.find(
                (ls) => ls.language.toLowerCase() === storedLang
              )?.value || status?.name?.value}
            </span>
            <br />
          </div>
        }
        primaryTypographyProps={{ noWrap: true, typography: 'subtitle2' }}
        sx={{ flexGrow: 1, pr: 1 }}
      />
      <Checkbox checked={isSelected} onChange={onToggleStatus} />
    </Box>
  );
}
