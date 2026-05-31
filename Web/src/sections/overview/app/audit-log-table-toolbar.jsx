import { useCallback, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import Checkbox from '@mui/material/Checkbox';

import { Iconify } from 'src/components/iconify';
import { CustomDateRangePicker } from 'src/components/custom-date-range-picker';
import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import { fDateRangeShortLabel } from 'src/utils/format-time';

// ----------------------------------------------------------------------

export function AuditLogTableToolbar({
  filters,
  sharedUsers,
  onResetPage,
  searchText,
  setSearchText,
  openDateRange,
  onOpenDateRange,
  onCloseDateRange,
  dateError,
}) {
  const storedLang = localStorage.getItem('selectedLang');
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
  const renderFilterName = (
    <Box sx={{ flexGrow: 1, minWidth: 100, maxWidth: 720 }}>
      <TextField
        fullWidth
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        placeholder="Search"
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
          : 'Select Date'}
      </Button>

      <CustomDateRangePicker
        variant="Calendar"
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

  const renderMembers = (
    <>
      <FormControl sx={{ flexShrink: 0, width: { xs: 1, md: 260 } }}>
        <Autocomplete
          sx={{
            width: '100%',
            '& .MuiInputBase-root': {
              minHeight: 40,
              flexWrap: 'wrap',
              alignItems: 'flex-start',
              paddingTop: '4px',
              paddingBottom: '4px',
            },
            '& .MuiChip-root': {
              margin: '2px',
            },
          }}
          popupIcon={null}
          defaultValue={null}
          disableCloseOnSelect={false}
          options={sharedUsers || []}
          value={filters.state.members || null}
          onChange={(event, newValue) => {
            handleMembers(newValue);
          }}
          getOptionLabel={(option) => option?.fullName || ''}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Members"
              placeholder="Members"
              variant="outlined"
              sx={{
                '& .MuiAutocomplete-input': {
                  padding: '4px 8px !important',
                },
                '& .MuiInputBase-input': {
                  padding: '4px 8px !important',
                },
              }}
              InputLabelProps={{
                sx: { top: '-6px' },
              }}
            />
          )}
          renderOption={(props, option) => (
            <li {...props} key={option.id}>
              <Avatar
                alt={option?.fullName}
                src={option?.profileImageFileUrl}
                sx={{
                  width: 24,
                  height: 24,
                  fontSize: 12,
                  mr: 1,
                }}
              >
                {!option?.profileImageFileUrl && option?.fullName?.charAt(0).toUpperCase()}
              </Avatar>
              {option.fullName}
            </li>
          )}
        />
      </FormControl>
    </>
  );
  const handleMembers = useCallback(
    (newValue) => {
      onResetPage();
      filters.setState({ members: newValue || null });
    },
    [filters, onResetPage]
  );
  return (
    <Stack
      spacing={2}
      alignItems={{ xs: 'flex-end', md: 'center' }}
      direction={{ xs: 'column', md: 'row' }}
      sx={{ py: 1, flexWrap: 'wrap', rowGap: 1, pr: 1 }}
    >
      <Box sx={{ flexGrow: 1, minWidth: 300, maxWidth: 720 }}>{renderFilterName}</Box>
      <Box>{renderMembers}</Box>

      <Box>{renderFilterDate}</Box>
    </Stack>
  );
}
