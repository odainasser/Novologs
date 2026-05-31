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
import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

export function LeadTableToolbar({ filters, options, onResetPage, leads, isClientView, allUsers }) {
  const { t, i18n } = useTranslation('dashboard/client');
  const { zetaUser } = useAuthContext();

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
  const handleFilterMyLead = useCallback(
    (event) => {
      const newValue =
        typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value;

      onResetPage();
      filters.setState({ myLead: newValue });
    },
    [filters, onResetPage]
  );
  const handleFilterMembers = useCallback(
    (event) => {
      const newValue =
        typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value;

      onResetPage();
      if (newValue.includes('all')) {
        filters.setState({ members: [] });
        return;
      }

      filters.setState({ members: newValue });
    },
    [filters, onResetPage]
  );

  return (
    <>
      <Stack
        spacing={2}
        alignItems={{ xs: 'flex-end', md: 'center' }}
        direction={{ xs: 'column', md: 'row' }}
        sx={{ my: 1 }}
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

        {isClientView && zetaUser?.permissions?.includes('Lead.ViewAll') && (
          <FormControl sx={{ flexShrink: 0, width: { xs: 1, md: 200 } }}>
            <InputLabel htmlFor="client-filter-myLead-select-label" sx={{ top: '-6px' }}>
              {t('leaddetails.toolbar.all_leads')}
            </InputLabel>
            <Select
              // multiple
              value={filters.state.myLead}
              onChange={handleFilterMyLead}
              input={<OutlinedInput label={t('leaddetails.toolbar.myLead')} />}
              renderValue={(selected) => selected.map((value) => value).join(', ')}
              inputProps={{ id: 'client-filter-myLead-select-label' }}
              sx={{
                '& .MuiInputBase-input': {
                  padding: '10px 14px',
                },
                '& .MuiInputLabel-root': {
                  top: '-6px',
                },
              }}
            >
              {leads.leads.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
        {isClientView && zetaUser?.permissions?.includes('Lead.ViewAll') && (
          <FormControl sx={{ flexShrink: 0, width: { xs: 1, md: 200 } }}>
            <InputLabel htmlFor="user-filter-member-select-label" sx={{ top: '-6px' }}>
              {t('clients.buttons.members')}
            </InputLabel>
            <Select
              // multiple
              value={filters.state.members}
              onChange={handleFilterMembers}
              input={<OutlinedInput label={t('clients.buttons.members')} />}
              renderValue={(selected) => selected.map((value) => value).join(', ')}
              inputProps={{ id: 'user-filter-member-select-label' }}
              sx={{
                '& .MuiInputBase-input': {
                  padding: '10px 14px',
                },
                '& .MuiInputLabel-root': {
                  top: '-6px',
                },
              }}
            >
              {' '}
              <MenuItem
                value="all"
                onClick={() => {
                  onResetPage();
                  filters.setState({ members: [] });
                }}
              >
                <Checkbox disableRipple size="small" checked={filters.state.members.length === 0} />
                All
              </MenuItem>
              {allUsers.allUsers.map((option) => (
                <MenuItem key={option} value={option}>
                  {/* <Checkbox
                    disableRipple
                    size="small"
                    checked={filters.state.members.includes(option)}
                  /> */}
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
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
            {t('leaddetails.toolbar.print')}
          </MenuItem>

          <MenuItem
            onClick={() => {
              popover.onClose();
            }}
          >
            <Iconify icon="solar:import-bold" />
            {t('leaddetails.toolbar.import')}
          </MenuItem>

          <MenuItem
            onClick={() => {
              popover.onClose();
            }}
          >
            <Iconify icon="solar:export-bold" />
            {t('leaddetails.toolbar.export')}
          </MenuItem>
        </MenuList>
      </CustomPopover>
    </>
  );
}
