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
import { changeLeadStatus } from 'src/actions/client/clientActions';
import { toast } from 'src/components/snackbar';
import { useBoolean } from 'src/hooks/use-boolean';
import { ConfirmDialog } from 'src/components/custom-dialog';

// ----------------------------------------------------------------------

export function AddRejectReason({
  open,
  shared = [],
  selectedReason,
  setSelectedReason,
  onClose,
  handleClose,
  onToggleReason,
  mode,
  leadId,
  mutateLead,
  ...other
}) {
  const { t, i18n } = useTranslation('dashboard/client');
  const storedLang = localStorage.getItem('selectedLang');

  const [searchQuery, setSearchQuery] = useState('');
  const confirmRejectReason = useBoolean();

  const filteredShared = shared.filter((reason) =>
    reason.name?.value?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCloseReasonDialog = () => {
    setSearchQuery('');
    handleClose();
    setSelectedReason([]);
  };

  const handleAddReason = async () => {
    const newReason = {
      reason: selectedReason,
    };
    console.log('this is the new reason', newReason);

    const payload = {
      leadStatus: 2,
      id: leadId,
      rejectedDate: new Date().toISOString(),
      rejectionReasonId: newReason?.reason?.id,
    };

    try {
      const response = await changeLeadStatus(payload);
      if (response.success) {
        await mutateLead();
        toast.success(t('leaddetails.toast.lead_rejected'));
        handleCloseReasonDialog();
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      console.error('update failed:', error);
    }
  };

  return (
    <>
      <Dialog
        fullWidth
        maxWidth={mode === 'add' ? 'xs' : 'md'}
        open={open}
        onClose={handleCloseReasonDialog}
        dir={storedLang === 'ar' ? 'rtl' : 'ltr'}
        {...other}
      >
        <DialogTitle>{mode === 'add' ? t('clients.labels.select_reason') : ''}</DialogTitle>

        {mode === 'add' && (
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
        )}

        {filteredShared.length > 0 ? (
          <Scrollbar sx={{ height: 70 * 5, px: 3 }}>
            {mode === 'add' && (
              <Box component="ul">
                {filteredShared.map((reason) => (
                  <SelectReason
                    key={reason?.id}
                    reason={reason}
                    isSelected={selectedReason?.id === reason?.id}
                    onToggleReason={() => onToggleReason(reason)}
                    mode={mode}
                  />
                ))}
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
            onClick={handleCloseReasonDialog}
            sx={{
              ...(storedLang === 'ar' && { ml: 1 }),
            }}
          >
            {t('clients.buttons.cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              confirmRejectReason.onTrue();
            }}
            disabled={selectedReason?.length === 0}
            sx={{ bgcolor: mode === 'add' ? '#006A67' : '' }}
          >
            {mode === 'add' ? t('clients.buttons.add') : t('clients.buttons.close')}
          </Button>
        </DialogActions>
        <ConfirmDialog
          open={confirmRejectReason.value}
          onClose={confirmRejectReason.onFalse}
          title={t("clients.buttons.reject_lead")}
          content={t('leaddetails.toast.are_you_reject')}
          PaperProps={{
            sx: {
              boxShadow: 'none',
              border: '1px solid #ccc',
              borderRadius: 2,
            },
          }}
          action={
            <Button
              variant="contained"
              color="error"
              onClick={handleAddReason}
              sx={{
                ...(storedLang === 'ar' && { ml: 1 }),
              }}
            >
              {t('clients.buttons.reject')}
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

export function SelectReason({ reason, isSelected, onToggleReason, mode }) {
  return (
    <Box component="li" sx={{ display: 'flex', alignItems: 'center', py: 1 }}>
      <ListItemText
        secondary={
          <div>
            <span style={{ fontSize: '0.875rem' }}>{reason?.name?.value}</span>
            <br />
          </div>
        }
        primaryTypographyProps={{ noWrap: true, typography: 'subtitle2' }}
        sx={{ flexGrow: 1, pr: 1 }}
      />
      {mode === 'add' && <Checkbox checked={isSelected} onChange={onToggleReason} />}
    </Box>
  );
}
