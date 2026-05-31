import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
} from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { useTranslation } from 'react-i18next';

export function DeleteMemberDialog({
  participant,
  open,
  onClose,
  handleParticipantDelete,
  DeletingMem,
}) {
  const { t } = useTranslation('dashboard/chat');
  const storedLang = localStorage.getItem('selectedLang');

  return (
    <Dialog
      fullWidth
      maxWidth="xs"
      open={open}
      onClose={onClose}
      dir={storedLang === 'ar' ? 'rtl' : 'ltr'}
    >
      <DialogTitle>Delete Participant</DialogTitle>

      {/* Message */}
      <DialogContent>
        <Typography>
          Are you sure you want to remove <strong>{participant?.name}</strong> from this chat?
        </Typography>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            ...(storedLang === 'ar' && { ml: 1 }),
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={() => handleParticipantDelete(participant)}
          variant="contained"
          color="error"
          disabled={DeletingMem}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}
