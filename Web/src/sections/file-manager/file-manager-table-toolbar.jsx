import { useState, useCallback } from 'react';
import {
  Stack,
  Button,
  Select,
  MenuItem,
  MenuList,
  TextField,
  InputLabel,
  FormControl,
  OutlinedInput,
  InputAdornment,
  IconButton,
  Box,
} from '@mui/material';

import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { Iconify } from 'src/components/iconify';
import { usePopover, CustomPopover } from 'src/components/custom-popover';
import { CustomDateRangePicker } from 'src/components/custom-date-range-picker';

import { fDateRangeShortLabel } from 'src/utils/format-time';
import { _fmProjects, _fmClients } from './file-manager-mock-data';
import { useTranslation } from 'react-i18next';

export function FileManagerTableToolbar({
  filters,
  view,
  dateError,
  onResetPage,
  openDateRange,
  onOpenDateRange,
  onCloseDateRange,
  statusOptions = [],
  options = {},
}) {
  const { t, i18n } = useTranslation('dashboard/files');
  const storedLang = localStorage.getItem('selectedLang');

  const popover = usePopover();
  const { projects = [], clients = [] } = options;
  const [projectSearch, setProjectSearch] = useState('');
  const [clientSearch, setClientSearch] = useState('');

  const filteredProjects = _fmProjects.filter((proj) =>
    proj.toLowerCase().includes(projectSearch.toLowerCase())
  );
  const filteredClients = _fmClients.filter((client) =>
    client.toLowerCase().includes(clientSearch.toLowerCase())
  );
  const handleFilterName = useCallback(
    (event) => {
      onResetPage();
      filters.setState({ name: event.target.value });
    },
    [filters, onResetPage]
  );

  const handleFilterStartDate = useCallback(
    (newValue) => {
      onResetPage();
      filters.setState({ startDate: newValue });
    },
    [filters, onResetPage]
  );

  const handleFilterEndDate = useCallback(
    (newValue) => {
      filters.setState({ endDate: newValue });
    },
    [filters]
  );

  const handleFilterProject = (event) => {
    filters.setState({ projectName: event.target.value });
    onResetPage();
  };
  const handleFilterClient = (event) => {
    filters.setState({ clientName: event.target.value });
    onResetPage();
  };

  const renderFilterName = (
    <Box sx={{ flexGrow: 1, minWidth: 100, maxWidth: 720 }}>
      <TextField
        fullWidth
        value={filters.state.name}
        onChange={handleFilterName}
        placeholder={t('files.placeholder.search')}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
            </InputAdornment>
          ),
        }}
        sx={{
          '& .MuiInputBase-input': {
            padding: '10px 14px',
          },
        }}
      />
    </Box>
  );

  const renderProjectDropdown = (
    <FormControl size="small" fullWidth>
      <InputLabel>{t('files.labels.project')}</InputLabel>
      <Select
        value={filters.state.projectName}
        onChange={handleFilterProject}
        input={<OutlinedInput label={t('files.labels.project')} />}
        MenuProps={{
          PaperProps: {
            style: {
              maxHeight: 300,
            },
          },
        }}
      >
        <MenuItem disableRipple disableTouchRipple disableGutters>
          <TextField
            size="small"
            placeholder={t('files.placeholder.search_projects')}
            value={projectSearch}
            onChange={(e) => setProjectSearch(e.target.value)}
            fullWidth
            onClick={(e) => e.stopPropagation()}
          />
        </MenuItem>

        {filteredProjects.length > 0 ? (
          filteredProjects.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))
        ) : (
          <MenuItem disabled>{t('files.placeholder.no_results_found')}</MenuItem>
        )}
      </Select>
    </FormControl>
  );
  const renderClientDropdown = (
    <FormControl size="small" fullWidth>
      <InputLabel>{t('files.labels.client')}</InputLabel>
      <Select
        value={filters.state.clientName}
        onChange={handleFilterClient}
        input={<OutlinedInput label={t('files.labels.client')} />}
        MenuProps={{
          PaperProps: {
            style: {
              maxHeight: 300,
            },
          },
        }}
      >
        <MenuItem disableRipple disableTouchRipple disableGutters>
          <TextField
            size="small"
            placeholder={t('files.placeholder.search_clients')}
            value={clientSearch}
            onChange={(e) => setClientSearch(e.target.value)}
            fullWidth
            onClick={(e) => e.stopPropagation()}
          />
        </MenuItem>

        {filteredClients.length > 0 ? (
          filteredClients.map((client) => (
            <MenuItem key={client} value={client}>
              {client}
            </MenuItem>
          ))
        ) : (
          <MenuItem disabled>{t('files.placeholder.no_results_found')}</MenuItem>
        )}
      </Select>
    </FormControl>
  );

  const renderFilterDate = (
    <>
      <Button
        variant="outlined"
        color="inherit"
        onClick={onOpenDateRange}
        endIcon={
          <Iconify
            icon={openDateRange ? 'eva:arrow-ios-upward-fill' : 'eva:arrow-ios-downward-fill'}
            sx={{ ml: -0.5 }}
          />
        }
        sx={{
          height: 40,
          ...(storedLang === 'ar' ? { ml: 1 } : {}),
        }}
      >
        {!!filters.state.startDate && !!filters.state.endDate
          ? fDateRangeShortLabel(filters.state.startDate, filters.state.endDate)
          : t('files.placeholder.select_date')}
      </Button>

      <CustomDateRangePicker
        variant={t('files.placeholder.calendar')}
        startDate={filters.state.startDate}
        endDate={filters.state.endDate}
        onChangeStartDate={handleFilterStartDate}
        onChangeEndDate={handleFilterEndDate}
        open={openDateRange}
        onClose={onCloseDateRange}
        selected={!!filters.state.startDate && !!filters.state.endDate}
        error={dateError}
      />
    </>
  );

  return (
    <>
      <Stack
        spacing={2}
        alignItems={{ xs: 'flex-end', md: 'center' }}
        direction={{ xs: 'column', md: 'row' }}
        sx={{ py: 1, flexWrap: 'wrap', rowGap: 1, pr: 1 }}
      >
        <Box sx={{ flexGrow: 1, minWidth: 300, maxWidth: 720 }}>{renderFilterName}</Box>

        {/* <Box sx={{ minWidth: 200 }}>{renderProjectDropdown}</Box>
  <Box sx={{ minWidth: 200 }}>{renderClientDropdown}</Box> */}
        <Box>{renderFilterDate}</Box>
      </Stack>

      <CustomPopover
        open={popover.open}
        anchorEl={popover.anchorEl}
        onClose={popover.onClose}
        slotProps={{ arrow: { placement: 'right-top' } }}
      >
        <IconButton onClick={popover.onOpen}>
          <Iconify icon="eva:more-vertical-fill" />
        </IconButton>
        <MenuList>
          <MenuItem onClick={popover.onClose}>
            <Iconify icon="solar:printer-minimalistic-bold" />
            {t('files.buttons.print')}
          </MenuItem>
          <MenuItem onClick={popover.onClose}>
            <Iconify icon="solar:import-bold" />
            {t('files.buttons.import')}
          </MenuItem>
          <MenuItem onClick={popover.onClose}>
            <Iconify icon="solar:export-bold" />
            {t('files.buttons.export')}
          </MenuItem>
        </MenuList>
      </CustomPopover>
    </>
  );
}
