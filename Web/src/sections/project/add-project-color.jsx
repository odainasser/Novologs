'use client';
import { useEffect } from 'react';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { useForm, Controller } from 'react-hook-form';
import TextField from '@mui/material/TextField';
import DialogContent from '@mui/material/DialogContent';
import { useTranslation } from 'react-i18next';

// ----------------------------------------------------------------------

export function AddProjectColor({
  open,
  onClose,
  handleClose,
  mode,
  setProjectColor,
  projectColor,
  isMission,
  ...other
}) {
  const { t } = useTranslation('dashboard/projects');
  const storedLang = localStorage.getItem('selectedLang');

  const methods = useForm({
    mode: 'all',
    defaultValues: {
      projectColor: projectColor || '',
    },
  });

  const { control, reset, watch } = methods;

  const watchedColor = watch('projectColor');

  useEffect(() => {
    setProjectColor(watchedColor);
  }, [watchedColor, setProjectColor]);

  useEffect(() => {
    if (open) {
      reset({
        projectColor: projectColor,
      });
    }
  }, [open, reset]);

  if (!open) {
    return null;
  }

  const handleCloseDialog = () => {
    if (onClose) {
      onClose();
    }
    handleClose();
  };

  return (
    <Dialog
      fullWidth
      maxWidth="xs"
      open={open}
      onClose={handleCloseDialog}
      dir={storedLang === 'ar' ? 'rtl' : 'ltr'}
      {...other}
    >
      {' '}
      <DialogTitle>
        {mode === 'add'
          ? isMission
            ? t('projects.missions.add_mission_color')
            : t('projects.table.add_project_color')
          : isMission
            ? t('projects.missions.edit_mission_color')
            : t('projects.table.edit_project_color')}
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <Controller
          name="projectColor"
          control={control}
          render={({ field }) => <TextField {...field} type="color" fullWidth sx={{ mt: 1 }} />}
        />
      </DialogContent>
      <DialogActions sx={{ pt: 0, pb: 2, px: 3 }}>
        {' '}
        <Button
          variant="outlined"
          onClick={handleCloseDialog}
          sx={{
            mr: 1,
            ...(storedLang === 'ar' && { ml: 1 }),
          }}
        >
          {t('projects.cancel')}
        </Button>
        <Button variant="contained" onClick={handleCloseDialog}>
          {t('projects.done')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
