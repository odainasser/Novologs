import { useState, useEffect, useRef } from 'react';
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
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import Card from '@mui/material/Card';
import { Divider } from '@mui/material';
import { useMockedUser } from 'src/auth/hooks';
import { useTranslation } from 'react-i18next';
import Stack from '@mui/material/Stack';
import AddIcon from '@mui/icons-material/Add';
import { IconButton } from '@mui/material';
// ----------------------------------------------------------------------

export function AddProjectWorkflow({
  open,
  onClose,
  handleClose,
  existingWorkflow = null,
  ...other
}) {
  const { t } = useTranslation('dashboard/projects');

  const storedLang = localStorage.getItem('selectedLang');
  const stepRefs = useRef([]);
  const [title, setTitle] = useState('');

  const [titleError, setTitleError] = useState(false);

  const [stepFields, setStepFields] = useState(['']);
  const [stepErrors, setStepErrors] = useState([false]);
  useEffect(() => {
    if (open && existingWorkflow) {
      setTitle(existingWorkflow.title || '');
      setStepFields(existingWorkflow.steps?.length ? existingWorkflow.steps : ['']);
      setStepErrors(existingWorkflow.steps?.map(() => false) || [false]);
    } else if (open && !existingWorkflow) {
      setTitle('');
      setStepFields(['']);
      setStepErrors([false]);
    }
  }, [open, existingWorkflow]);

  const handleTitleChange = (event) => {
    setTitle(event.target.value);
    if (titleError && event.target.value) {
      setTitleError(false);
    }
  };
  const handleStepChange = (index, value) => {
    const updated = [...stepFields];
    updated[index] = value;
    setStepFields(updated);

    // Re-check: if all are empty, only first should be in error
    const allEmpty = updated.every((s) => s.trim() === '');
    if (allEmpty) {
      const errorUpdated = updated.map((_, i) => i === 0);
      setStepErrors(errorUpdated);
    } else {
      setStepErrors(updated.map(() => false));
    }
  };

  const handleAddStepField = () => {
    setStepFields((prev) => [...prev, '']);
    setStepErrors((prev) => [...prev, false]);

    // Focus after next render
    setTimeout(() => {
      const nextIndex = stepFields.length; // new field index
      if (stepRefs.current[nextIndex]) {
        stepRefs.current[nextIndex].focus();
      }
    }, 0);
  };

  const handleCloseWorkflowDialog = () => {
    handleClose();
    setTitle('');
    setStepFields(['']);
    setStepErrors([false]);
  };

  const handleAddWorkflow = async () => {
    let hasError = false;

    if (!title.trim()) {
      setTitleError(true);
      hasError = true;
    }

    // Check if all steps are empty
    const allEmpty = stepFields.every((s) => s.trim() === '');

    if (allEmpty) {
      // Only show error on first one
      const updatedErrors = stepFields.map((_, i) => i === 0);
      setStepErrors(updatedErrors);
      hasError = true;
    } else {
      // Clear errors for filled steps
      const updatedErrors = stepFields.map(() => false);
      setStepErrors(updatedErrors);
    }

    if (hasError) return;

    const newWorkflow = {
      title: title.trim(),
      steps: stepFields.filter((s) => s.trim() !== ''),
    };

    console.log(existingWorkflow ? 'Updated Workflow:' : 'New Workflow:', newWorkflow);

    handleCloseWorkflowDialog();
  };

  return (
    <>
      <Dialog
        fullWidth
        maxWidth="xs"
        open={open}
        onClose={handleCloseWorkflowDialog}
        sx={{
          '& .MuiDialog-paper': {
            height: 'inherit',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
        dir={storedLang === 'ar' ? 'rtl' : 'ltr'}
        {...other}
      >
        <DialogTitle>{existingWorkflow ? t('workflow.edit_workflow') : t('workflow.add_workflow')}</DialogTitle>

        <Box display="flex" gap={2} sx={{ px: 3, pb: 2 }} flexDirection="column">
          <Box display="flex" justifyContent="space-between" alignItems="center" gap={1}>
            <Typography variant="body2" color="text.secondary">
              {t('workflow.title')}
            </Typography>
            <TextField
              value={title}
              onChange={handleTitleChange}
              placeholder={t('workflow.workflow_title')}
              variant="outlined"
              size="small"
              sx={{ width: 200 }}
              error={titleError}
              helperText={titleError ? t('workflow.title_required') : ''}
            />
          </Box>

          <Typography variant="body2" color="text.secondary">
            {t('workflow.steps')}
          </Typography>

          {stepFields.map((step, index) => (
            <TextField
              key={index}
              inputRef={(el) => (stepRefs.current[index] = el)} // store each ref
              value={step}
              onChange={(e) => handleStepChange(index, e.target.value)}
              placeholder={`${t('workflow.step')} ${index + 1}`}
              variant="outlined"
              size="small"
              error={stepErrors[index]}
              helperText={stepErrors[index] ? t('workflow.step_required') : ''}
              fullWidth
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (step.trim() !== '' && index === stepFields.length - 1) {
                    handleAddStepField();
                  }
                }
              }}
            />
          ))}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <IconButton onClick={handleAddStepField} sx={{ color: '#006A67' }}>
              <AddIcon />
            </IconButton>
          </Box>
        </Box>

        <DialogActions>
          <Button
            variant="outlined"
            onClick={handleCloseWorkflowDialog}
            sx={{
              ...(storedLang === 'ar' && { ml: 1 }),
            }}
          >
            {t('projects.cancel')}
          </Button>
          <Button variant="contained" onClick={handleAddWorkflow} sx={{ bgcolor: '#006A67' }}>{t('workflow.update_workflow')}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
