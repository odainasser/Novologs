import { useMemo } from 'react';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { useTranslation } from 'react-i18next';

export function KanbanDescription({ open, handleClose, kanbanDescription, taskId, ...other }) {
  const storedLang = localStorage.getItem('selectedLang');
  const { t, i18n } = useTranslation('dashboard/tasks');
  const { descriptionStr } = useMemo(() => {
    let fullDescription = '';

    try {
      const parsedDescription = JSON.parse(kanbanDescription);

      if (parsedDescription?.TranscriptStr) {
        fullDescription = parsedDescription.TranscriptStr;
      }
    } catch (e) {
      fullDescription = kanbanDescription || '';
    }

    const descriptionStr = fullDescription;

    return {
      descriptionStr,
    };
  }, [kanbanDescription]);
  return (
    <Dialog
      fullWidth
      maxWidth="md"
      open={open}
      onClose={handleClose}
      dir={storedLang === 'ar' ? 'rtl' : 'ltr'}
      {...other}
    >
      <DialogTitle> Task Description </DialogTitle>
      <DialogContent>
        <Typography paragraph>
          Task ID :{' '}
          <Box component="span" sx={{ fontWeight: 700 }}>
            {taskId}
          </Box>
        </Typography>

        <Typography variant="subtitle2"> {t('tasks.description')}:</Typography>

        {descriptionStr ? (
          <Typography paragraph>{descriptionStr}</Typography>
        ) : (
          <Typography variant="caption" color="text.secondary">
            {t('tasks.description_not_available')}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          onClick={(event) => {
            handleClose();
          }}
        >
          {t('tasks.close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
