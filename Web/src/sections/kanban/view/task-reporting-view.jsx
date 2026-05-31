'use client';

import { useState, useCallback } from 'react';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { useBoolean } from 'src/hooks/use-boolean';
import { useSetState } from 'src/hooks/use-set-state';

import { fIsAfter, fIsBetween } from 'src/utils/format-time';

import { DashboardContent } from 'src/layouts/dashboard';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { fileFormat } from 'src/components/file-thumbnail';
import { EmptyContent } from 'src/components/empty-content';

import { TaskReporting } from '../task-reporting';
// import { ProjectReportingFilters } from 'src/sections/project-reporting/project-reporting-filters';
// import { ProjectReportingFiltersResult } from 'src/sections/project-reporting/project-reporting-filters-result';

import LinearProgress from '@mui/material/LinearProgress';
import dayjs from 'dayjs';

// ----------------------------------------------------------------------

export function TaskReportingView({ projectId, projectMembers, employeeId, isProfileData }) {
  return (
    <>
      <DashboardContent>
        <TaskReporting />
      </DashboardContent>
    </>
  );
}
