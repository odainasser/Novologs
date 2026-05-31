import { useMemo } from 'react';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { useTranslation } from 'react-i18next';

export function KanbanTranscript({ open, handleClose, kanbanDescription, isAudioFile, ...other }) {
  const storedLang = localStorage.getItem('selectedLang');
  const { t, i18n } = useTranslation('dashboard/tasks');

  console.log('this is the kanbanDescription', kanbanDescription);
  const { descriptionStr, descriptionEng, descriptionArabic } = useMemo(() => {
    let fullDescription = '';
    let englishDescription = '';
    let arabicDescription = '';

    try {
      const parsedDescription = JSON.parse(kanbanDescription);

      if (parsedDescription?.TranscriptStr) {
        fullDescription = parsedDescription.TranscriptStr;
      }

      if (parsedDescription?.TranscriptEnglishStr) {
        englishDescription = parsedDescription.TranscriptEnglishStr;
      }

      if (parsedDescription?.TranscriptArabicStr) {
        arabicDescription = parsedDescription.TranscriptArabicStr;
      }
    } catch (e) {
      fullDescription = kanbanDescription || '';
    }

    const descriptionStr = fullDescription;
    const descriptionEng = englishDescription;
    const descriptionArabic = arabicDescription;

    return {
      descriptionStr,
      descriptionEng,
      descriptionArabic,
    };
  }, [kanbanDescription]);

  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      open={open}
      onClose={handleClose}
      dir={storedLang === 'ar' ? 'rtl' : 'ltr'}
      {...other}
    >
      <DialogTitle> {isAudioFile ? t('tasks.transcripts') : "Translations"} </DialogTitle>
      <DialogContent>
        <Typography variant="subtitle2"> {t('tasks.description')}:</Typography>
        {descriptionStr ? (
          <Typography paragraph>{descriptionStr}</Typography>
        ) : (
          <Typography variant="caption" color="text.secondary">
            {t('tasks.description_not_available')}
          </Typography>
        )}

        <Typography variant="subtitle2" sx={{ mt: 2 }}>
          {t('tasks.description_english')}
        </Typography>
        {descriptionEng ? (
          <Typography paragraph>{descriptionEng}</Typography>
        ) : (
          <Typography variant="caption" color="text.secondary">
            {t('tasks.description_not_available')}
          </Typography>
        )}
        <Typography variant="subtitle2" sx={{ mt: 2 }}>
          {t('tasks.description_arabic')}
        </Typography>

        {descriptionArabic ? (
          <Typography paragraph>{descriptionArabic}</Typography>
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
