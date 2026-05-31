'use client';

import { useState, useCallback, useEffect } from 'react';

import Stack from '@mui/material/Stack';
import {
  TextField,
  CircularProgress,
  Autocomplete,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { toast } from 'src/components/snackbar'
import{useTranslation} from 'react-i18next';
import { addMilestone } from 'src/actions/project/projectActions';

export function AddMilestoneDialog({
  open,
  handleMilestoneDialogClose,
  projectId,
  mutateMilestone,
}) {
  const{t,i18n}=useTranslation('dashboard/projects');
  const storedLang = localStorage.getItem('selectedLang');

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    dueDate: '',
  });

  const [showStatusError, setShowStatusError] = useState(false);

  const [nameError, setNameError] = useState('');

  const handleNameInputChange = (e) => {
    const newName = e.target.value;
    setFormData((prev) => ({ ...prev, name: newName }));
    if (nameError && newName.trim()) {
      setNameError('');
    }
  };

  const handleDescriptionChange = (event) => {
    setFormData((prevData) => ({
      ...prevData,
      description: event.target.value,
    }));
  };

  const handleStartDateChange = (date) => {
    const formattedDate = dayjs(date).toISOString();

    if (dayjs(formattedDate).isAfter(dayjs(formData.dueDate))) {
      toast.error(t('projects.missions.startdate_enddate'));
      setFormData((prevData) => ({
        ...prevData,
        startDate: null,
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        startDate: formattedDate,
      }));
    }
  };

  const handleEndDateChange = (date) => {
    const formattedDate = dayjs(date).toISOString();

    if (dayjs(formattedDate).isBefore(dayjs(formData.startDate))) {
      toast.error(t('projects.missions.enddate_startdate'));
      setFormData((prevData) => ({
        ...prevData,
        dueDate: null,
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        dueDate: formattedDate,
      }));
    }
  };
  const handleCloseDialog = () => {
    handleMilestoneDialogClose();
    setFormData({
      name: '',
      description: '',
      startDate: '',
      dueDate: '',
    });
  };

  const handleAddMilestone = async () => {
    let hasError = false;
    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      setNameError(t('projects.missions.namerequired'));
      hasError = true;
    } else {
      setNameError('');
    }
    if (hasError) return;

    setLoading(true);
    const payload = {
      ...formData,
    };
    payload.projectId = projectId;
    console.log('Milestone Data:', payload);
    try {
      const response = await addMilestone(payload);
      if (response.success) {
        toast.success(t('projects.missions.milestone_added'));
        handleCloseDialog();
        await mutateMilestone();
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      console.error('error added milestone:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog
        fullWidth
        maxWidth="sm"
        open={open}
        onClose={handleCloseDialog}
        dir={storedLang === 'ar' ? 'rtl' : 'ltr'}
      >
        <DialogTitle>{t('projects.missions.add_milestone')}</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 1 }}>
            <TextField
              fullWidth
              variant="outlined"
              label={t('projects.missions.name')}
              value={formData.name} // Make TextField controlled
              onChange={handleNameInputChange}
              error={!!nameError}
              helperText={nameError}
            />
            <TextField
              fullWidth
              variant="outlined"
              label={t('projects.missions.decription')}
              multiline
              rows={4}
              onChange={handleDescriptionChange}
            />

            <DateTimePicker
              label={t('projects.missions.startdate')}
              value={formData.startDate ? dayjs(formData.startDate) : null}
              onChange={handleStartDateChange}
              name="startDate"
              renderInput={(params) => <TextField {...params} />}
            />

            <DateTimePicker
              label={t('projects.missions.enddate')}
              value={formData.dueDate ? dayjs(formData.dueDate) : null}
              onChange={handleEndDateChange}
              name="dueDate"
              renderInput={(params) => <TextField {...params} />}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseDialog}
            variant="contained"
            sx={{
              ...(storedLang === 'ar' && { ml: 1 }),
            }}
          >
            {t('projects.missions.cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={handleAddMilestone}
            disabled={!formData.name.trim()} // Disable button if name is empty or just whitespace
            startIcon={loading ? <CircularProgress size={20} /> : null}
            sx={{ bgcolor: '#006A67' }}
          >
            {t('projects.missions.add')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
