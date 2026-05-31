'use client';

import { useState, useEffect } from 'react';

import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { Iconify } from 'src/components/iconify';
import { AddMilestoneDialog } from '../add-milestone';
import{useTranslation} from 'react-i18next';

export function ProjectMilestoneView({ projectId }) {
  const{t,i18n}=useTranslation('dashboard/projects');

  const [openMilestone, setOpenMilestone] = useState(false);
  const handleOpenMilestone = () => {
    setOpenMilestone(true);
  };
  const handleMilestoneDialogClose = () => {
    setTimeout(() => {
      setOpenMilestone(false);
    }, 100);
  };
  return (
    <Stack spacing={1} sx={{ p: 3, pt: 1 }}>
      {' '}
      <Box display="flex" justifyContent="end">
        <Button
          startIcon={<Iconify icon="mingcute:add-line" />}
          sx={{ ml: 1 }}
          variant="contained"
          onClick={() => {
            setOpenMilestone(true);
          }}
        >
          {t('projects.missions.AddMilestone')}
        </Button>
        <AddMilestoneDialog
          open={openMilestone}
          onClick={handleOpenMilestone}
          handleMilestoneDialogClose={handleMilestoneDialogClose}
          projectId={projectId}
        />
      </Box>
    </Stack>
  );
}
