import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import {useTranslation} from 'react-i18next'

// ----------------------------------------------------------------------

export function ConfirmDialog({ open, title, action, content, onClose, ...other }) {
  const { t, i18n } = useTranslation('dashboard/teams');
  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose} {...other}>
      <DialogTitle sx={{ pb: 2 }}>{title}</DialogTitle>

      {content && <DialogContent sx={{ typography: 'body2' }}> {content} </DialogContent>}

      <DialogActions>
        {action}

        <Button variant="outlined" color="inherit" onClick={onClose}>
        {t("table.actions.cancel")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
