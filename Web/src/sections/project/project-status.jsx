import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import InputAdornment from '@mui/material/InputAdornment';
import { useTranslation } from 'react-i18next';

import { Iconify } from 'src/components/iconify';
import Typography from '@mui/material/Typography';
import { Scrollbar } from 'src/components/scrollbar';

import { toast } from 'src/components/snackbar';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import { ConfirmDialog } from 'src/components/custom-dialog';

// ----------------------------------------------------------------------

export function ProjectStatus({
  open,
  shared = [],
  onClose,
  onToggleStatus,
  onChangeStatus,
  matchedStatus,
  ...other
}) {
  const { t, i18 } = useTranslation('dashboard/projects');
  const storedLang = localStorage.getItem('selectedLang');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState(matchedStatus);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const filteredShared = shared.filter((status) =>
    status.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectStatus = (status) => {
    setSelectedStatus(status);
    onToggleStatus(status);
  };

  const handleClose = () => {
    setSearchQuery('');
    onClose();
  };

  const handleOpenConfirmDialog = () => {
    setConfirmDialogOpen(true);
  };

  const handleCloseConfirmDialog = () => {
    setConfirmDialogOpen(false);
  };

  useEffect(() => {
    if (open) {
      if (matchedStatus) {
        setSelectedStatus(matchedStatus);
      } else {
        setSelectedStatus(null);
      }
    }
  }, [open, matchedStatus]);

  const confirmMessage = (
    <span>
      {t('projects.status.confirm_change_status')}{' '}
      <span style={{ color: selectedStatus?.color }}>
        {storedLang === 'ar' ? selectedStatus?.nameAr : selectedStatus?.name}
      </span>
      ?
    </span>
  );

  return (
    <>
      <Dialog
        fullWidth
        maxWidth="xs"
        open={open}
        onClose={handleClose}
        dir={storedLang === 'ar' ? 'rtl' : 'ltr'}
        {...other}
      >
        <DialogTitle>{t('projects.status.change_status')}</DialogTitle>

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
        </Box>

        {filteredShared.length > 0 ? (
          <Scrollbar sx={{ height: 60 * 5, px: 3 }}>
            <Box component="ul">
              {filteredShared.map((status) => (
                <SelectReason
                  key={status.id}
                  reason={status}
                  isSelected={selectedStatus?.id === status.id}
                  onToggleStatus={() => handleSelectStatus(status)}
                />
              ))}
            </Box>
          </Scrollbar>
        ) : (
          <Box sx={{ px: 3, py: 2 }}>
            <Typography variant="body2" color="textSecondary">
              {t('projects.status.no_status_found')}
            </Typography>
          </Box>
        )}

        <DialogActions>
          <Button
            variant="contained"
            onClick={handleClose}
            sx={{
              ...(storedLang === 'ar' && { ml: 1 }),
            }}
          >
            {t('projects.cancel')}
          </Button>
          <Button variant="contained" onClick={handleOpenConfirmDialog} sx={{ bgcolor: '#006A67' }}>
            {t('projects.status.change')}
          </Button>
        </DialogActions>

        <ConfirmDialog
          open={confirmDialogOpen}
          onClose={handleCloseConfirmDialog}
          title={t('projects.status.change_status')}
          content={confirmMessage}
          action={
            <Button
              variant="contained"
              onClick={() => {
                onChangeStatus();
                handleCloseConfirmDialog();
              }}
              sx={{
                ...(storedLang === 'ar' && { ml: 1 }),
              }}
            >
              {t('projects.status.change_status')}
            </Button>
          }
          sx={{
            direction: storedLang === 'ar' ? 'rtl' : 'ltr',
          }}
        />
      </Dialog>
    </>
  );
}

export function SelectReason({ reason, isSelected, onToggleStatus }) {
  const storedLang = localStorage.getItem('selectedLang');

  return (
    <Box component="li" sx={{ display: 'flex', alignItems: 'center', py: 1 }}>
      <ListItemText
        secondary={<span>{storedLang === 'ar' ? reason?.nameAr : reason?.name}</span>}
        primaryTypographyProps={{ noWrap: true, typography: 'subtitle2' }}
        secondaryTypographyProps={{ noWrap: true, component: 'span', sx: { color: reason?.color } }}
        sx={{ flexGrow: 1, pr: 1 }}
      />

      <Checkbox checked={isSelected} onChange={onToggleStatus} />
    </Box>
  );
}
