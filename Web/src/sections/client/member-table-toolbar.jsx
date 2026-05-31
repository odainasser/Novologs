import { useCallback } from 'react';

import Stack from '@mui/material/Stack';
import Select from '@mui/material/Select';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import { useTranslation } from 'react-i18next';

import { Iconify } from 'src/components/iconify';
import { usePopover, CustomPopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

export function MemberTableToolbar({ filters, onResetPage, memberOptions }) {
  const { t, i18n } = useTranslation('dashboard/client');

  const popover = usePopover();

  const handleFilterName = useCallback(
    (event) => {
      onResetPage();
      filters.setState({ name: event.target.value });
    },
    [filters, onResetPage]
  );

  const handleFilterStatus = useCallback(
    (event) => {
      const newValue =
        typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value;

      onResetPage();
      filters.setState({ status: newValue });
    },
    [filters, onResetPage]
  );
  const handleFilterDepartment = useCallback(
    (event) => {
      const newValue =
        typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value;

      onResetPage();
      filters.setState({ department: newValue });
    },
    [filters, onResetPage]
  );

  const handleFilterMember = useCallback(
    (event) => {
      const newValue =
        typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value;

      onResetPage();
      filters.setState({ member: newValue });
    },
    [filters, onResetPage]
  );

  return (
    <>
      <Stack
        spacing={2}
        alignItems={{ xs: 'flex-end', md: 'center' }}
        direction={{ xs: 'column', md: 'row' }}
        sx={{ my: 1, mr: 1 }}
      >
        <TextField
          fullWidth
          value={filters.state.name}
          onChange={handleFilterName}
          placeholder={t('clients.filters.search')}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            minWidth: { xl: '600px' },
            '& .MuiInputBase-input': {
              padding: '10px 14px',
            },
            '& .MuiInputLabel-root': {
              top: '-7px',
            },
          }}
        />

        {/* <FormControl sx={{ flexShrink: 0, width: { xs: 1, md: 200 } }}>
          <InputLabel htmlFor="user-filter-role-select-label" sx={{ top: '-6px' }}>
            Members
          </InputLabel>
          <Select
            multiple
            value={filters.state.member}
            onChange={handleFilterMember}
            input={<OutlinedInput label="Members" />}
            renderValue={(selected) => selected.map((value) => value).join(', ')}
            inputProps={{ id: 'user-filter-role-select-label' }}
            sx={{
              '& .MuiInputBase-input': {
                padding: '10px 14px',
              },
              '& .MuiInputLabel-root': {
                top: '-6px',
              },
            }}
          >
            {memberOptions.members.map((option) => (
              <MenuItem key={option.id} value={option.firstName}>
                <Checkbox
                  disableRipple
                  size="small"
                  checked={filters.state.member.includes(option.firstName)}
                />
                {option.firstName}
              </MenuItem>
            ))}
          </Select>
        </FormControl> */}
      </Stack>

      <CustomPopover
        open={popover.open}
        anchorEl={popover.anchorEl}
        onClose={popover.onClose}
        slotProps={{ arrow: { placement: 'right-top' } }}
      >
        <MenuList>
          <MenuItem
            onClick={() => {
              popover.onClose();
            }}
          >
            <Iconify icon="solar:printer-minimalistic-bold" />
            {t('clients.buttons.print')}
          </MenuItem>

          <MenuItem
            onClick={() => {
              popover.onClose();
            }}
          >
            <Iconify icon="solar:import-bold" />
            {t('clients.buttons.import')}
          </MenuItem>

          <MenuItem
            onClick={() => {
              popover.onClose();
            }}
          >
            <Iconify icon="solar:export-bold" />
            {t('clients.buttons.export')}
          </MenuItem>
        </MenuList>
      </CustomPopover>
    </>
  );
}
