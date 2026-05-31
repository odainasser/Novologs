'use client';

import { useState, useEffect } from 'react';
import Stack from '@mui/material/Stack';
import {
  TextField,
  CircularProgress,
  Autocomplete,
  Button,
  DialogContent,
  DialogTitle,
  DialogActions,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

export function ContactUsDetails({ handleCloseContactDialog }) {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    subject: '',
    priority: '',
    description: '',
  });

  const subjectOptions = [
    'Task',
    'Project',
    'Mission',
    'Client',
    'Vendor',
    'General Inquiry',
    'Other',
  ];
  const priorityOptions = ['High', 'Medium', 'Low'];

  const handleSubjectChange = (event, newValue) => {
    setFormData((prevData) => ({
      ...prevData,
      subject: newValue || '',
    }));
  };

  const handlePriorityChange = (event, newValue) => {
    setFormData((prevData) => ({
      ...prevData,
      priority: newValue || '',
    }));
  };

  const handleDescriptionChange = (event) => {
    setFormData((prevData) => ({
      ...prevData,
      description: event.target.value,
    }));
  };

  return (
    <>
      <DialogTitle>Send us a message</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ pt: 1 }}>
          <Autocomplete
            options={subjectOptions}
            onChange={handleSubjectChange}
            value={formData.subject}
            renderInput={(params) => <TextField {...params} label="Subject" variant="outlined" />}
            noOptionsText="Not found"
          />
          <Autocomplete
            options={priorityOptions}
            onChange={handlePriorityChange}
            value={formData.priority}
            renderInput={(params) => <TextField {...params} label="Priority" variant="outlined" />}
            noOptionsText="Not found"
          />
          <TextField
            label="Description"
            variant="outlined"
            multiline
            rows={4}
            value={formData.description}
            onChange={handleDescriptionChange}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseContactDialog} variant="contained">
          Cancel
        </Button>
        <Button
          variant="contained"
          startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
          sx={{ bgcolor: '#006A67' }}
        >
          Send
        </Button>
      </DialogActions>
    </>
  );
}
