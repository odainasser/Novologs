import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import Stack from '@mui/material/Stack';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';

import { Iconify } from 'src/components/iconify';
import { usePopover, CustomPopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

export function AttendanceRegisterTableToolbar({
  filters,
  options,
  onResetPage,
  view,
  taskVariantOptions,
}) {
  const { t, i18n } = useTranslation('dashboard/timesheet');
  const popover = usePopover();

  const handleFilterName = useCallback(
    (event) => {
      onResetPage();
      filters.setState({ name: event.target.value });
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
