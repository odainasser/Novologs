import { useCallback, useState } from 'react';

import Stack from '@mui/material/Stack';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import { DatePicker, DateTimePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import { usePopover, CustomPopover } from 'src/components/custom-popover';
import { useTranslation } from 'react-i18next';
import Checkbox from '@mui/material/Checkbox';

// ----------------------------------------------------------------------

export function TimesheetTableToolbar({ filters, options, onResetPage, view, taskVariantOptions }) {
  const { t, i18n } = useTranslation('dashboard/timesheet');
  const popover = usePopover();

  const [projectSearch, setProjectSearch] = useState('');
  const [taskSearch, setTaskSearch] = useState('');

  const filteredProjects = options.projects.filter((project) =>
    project.toLowerCase().includes(projectSearch.toLowerCase())
  );

  const filteredTasks = options.tasks.filter((task) =>
    task.toLowerCase().includes(taskSearch.toLowerCase())
  );

  const handleFilterName = useCallback(
    (event) => {
      onResetPage();
      filters.setState({ name: event.target.value });
    },
    [filters, onResetPage]
  );

  const handleFilterProject = useCallback(
    (event) => {
      onResetPage();
      filters.setState({ project: event.target.value });
    },
    [filters, onResetPage]
  );

  const handleFilterTask = useCallback(
    (event) => {
      onResetPage();
      filters.setState({ task: event.target.value });
    },
    [filters, onResetPage]
  );
  const handleFilterVariant = useCallback(
    (event) => {
      const newValue =
        typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value;

      onResetPage();
      filters.setState({ taskVariant: newValue });
    },
    [filters, onResetPage]
  );

  return (
    <>
      <Stack
        spacing={2}
        alignItems={{ xs: 'flex-end', md: 'flex-end' }}
        direction={{ xs: 'column', md: 'row' }}
        sx={{ my: 0.7 }}
      >
        {/* 🔍 Search */}
        <TextField
          label={t('form.search')}
          size="small"
          value={filters.state.name}
          onChange={handleFilterName}
          placeholder={t('form.search_placeholder')}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            width: { xs: '100%', md: 750 },
          }}
        />

        <FormControl sx={{ flexShrink: 0, width: { xs: 1, md: 200 } }}>
          <InputLabel htmlFor="user-filter-variant-select-label" sx={{ top: '-6px' }}>
            {t('tabs.task_type')}
          </InputLabel>
          <Select
            multiple
            value={filters.state.taskVariant}
            onChange={handleFilterVariant}
            input={<OutlinedInput label={t('tabs.task_type')} />}
            renderValue={(selected) => selected.map((value) => value).join(', ')}
            inputProps={{ id: 'user-filter-variant-select-label' }}
            sx={{
              '& .MuiInputBase-input': {
                padding: '10px 14px',
              },
              '& .MuiInputLabel-root': {
                top: '-6px',
              },
            }}
          >
            {taskVariantOptions?.taskVariant.map((option) => (
              <MenuItem key={option} value={option}>
                <Checkbox
                  disableRipple
                  size="small"
                  checked={filters.state.taskVariant.includes(option)}
                />
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Start Date */}
        {/* <DatePicker
          label={t('form.start_date')}
          value={filters.state.startDate}
          onChange={(newValue) => {
            onResetPage();
            filters.setState({ startDate: newValue });
          }}
          slotProps={{
            textField: {
              size: 'small',
              fullWidth: true,
            },
          }}
          sx={{ width: { xs: '100%', md: 200 } }}
        /> */}
      </Stack>

      {/* Optional: Export / Print actions */}
      <CustomPopover
        open={popover.open}
        anchorEl={popover.anchorEl}
        onClose={popover.onClose}
        slotProps={{ arrow: { placement: 'right-top' } }}
      >
        <MenuItem onClick={popover.onClose}>
          <Iconify icon="solar:printer-minimalistic-bold" />
          {t('actions.print')}
        </MenuItem>
        <MenuItem onClick={popover.onClose}>
          <Iconify icon="solar:import-bold" />
          {t('actions.import')}
        </MenuItem>
        <MenuItem onClick={popover.onClose}>
          <Iconify icon="solar:export-bold" />
          {t('actions.export')}
        </MenuItem>
      </CustomPopover>
    </>
  );
}
