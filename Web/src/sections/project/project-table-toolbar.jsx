import { useCallback, useState, useEffect } from 'react';

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
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';

// ----------------------------------------------------------------------

export function ProjectTableToolbar({
  filters,
  options,
  onResetPage,
  departments,
  isTicket,
  STATUS_OPTIONS,
}) {
  const { t, i18n } = useTranslation('dashboard/projects');
  console.log('this is the filters', filters);
  const storedLang = localStorage.getItem('selectedLang');
  const filter = createFilterOptions();

  const [departmentInput, setDepartmentInput] = useState('');

  const getDeptName = (dept) => {
    if (!dept) return storedLang === 'ar' ? 'غير معروف' : 'Unknown';

    if (storedLang === 'ar') {
      return (
        dept.name?.localizedStrings?.find((ls) => ls.language.toLowerCase() === 'ar')?.value ||
        dept.name?.value
      );
    }

    return dept.name?.value;
  };

  const getDepartmentPath = (department, allDepartments) => {
    const parent = allDepartments.find((d) => d.id === department.parentDepartmentId);

    const currentName = getDeptName(department);

    if (!parent) return currentName;

    return `${getDepartmentPath(parent, allDepartments)} / ${currentName}`;
  };
  useEffect(() => {
    if (!filters.state.department) {
      setDepartmentInput('');
      return;
    }

    const selectedDepartment = departments?.departments?.find(
      (dept) => dept.id === filters.state.department
    );

    setDepartmentInput(
      selectedDepartment
        ? getDepartmentPath(selectedDepartment, departments?.departments || [])
        : ''
    );
  }, [filters.state.department, departments?.departments]);
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

      if (newValue.includes('all')) {
        filters.setState({ status: [] });
        return;
      }

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
          placeholder={t('projects.project_settings.tabs.search')}
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
        {!isTicket && (
          <FormControl sx={{ flexShrink: 0, width: { xs: 1, md: 200 } }}>
            <InputLabel htmlFor="user-filter-status-select-label" sx={{ top: '-6px' }}>
              {t('projects.project_settings.tabs.status')}
            </InputLabel>
            <Select
              multiple
              value={filters.state.status} // array of numbers
              onChange={handleFilterStatus}
              input={<OutlinedInput label={t('projects.project_settings.tabs.status')} />}
              renderValue={(selected) =>
                selected
                  .map(
                    (code) =>
                      STATUS_OPTIONS.find((s) => s.code === code)?.[
                        storedLang === 'ar' ? 'ar' : 'en'
                      ]
                  )
                  .join(', ')
              }
              inputProps={{ id: 'user-filter-status-select-label' }}
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
                  filters.setState({ status: [] });
                }}
              >
                <Checkbox disableRipple size="small" checked={filters.state.status.length === 0} />
                All
              </MenuItem>
              {options.status.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  <Checkbox checked={filters.state.status.includes(option.value)} />
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        <FormControl sx={{ flexShrink: 0, width: { xs: 1, md: 200 } }}>
          <Autocomplete
            options={[
              { id: '', name: { value: 'All' }, isAll: true },
              ...(departments?.departments || []),
            ]}
            inputValue={departmentInput}
            onInputChange={(event, newInputValue, reason) => {
              if (reason === 'input') {
                setDepartmentInput(newInputValue);
              }

              if (reason === 'clear') {
                setDepartmentInput('');
                filters.setState({ department: '' });
              }
            }}
            filterOptions={(options, params) => {
              const filtered = filter(
                options.filter((option) => !option.isAll),
                params
              );

              return params.inputValue
                ? filtered
                : [{ id: '', name: { value: 'All' }, isAll: true }, ...filtered];
            }}
            value={
              filters.state.department
                ? departments?.departments?.find((dept) => dept.id === filters.state.department) ||
                  null
                : null
            }
            onChange={(event, newValue) => {
              onResetPage();

              filters.setState({ department: newValue?.isAll ? '' : newValue?.id || '' });

              setDepartmentInput(
                newValue?.isAll || !newValue
                  ? ''
                  : getDepartmentPath(newValue, departments?.departments || [])
              );
            }}
            getOptionLabel={(option) =>
              option?.isAll ? 'All' : getDepartmentPath(option, departments?.departments || [])
            }
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) => (
              <TextField
                {...params}
                label={t('projects.table.department')}
                placeholder={t('projects.table.department')}
                variant="outlined"
                size="small"
                InputLabelProps={{
                  sx: { top: '-6px' },
                }}
              />
            )}
            sx={{
              '& .MuiOutlinedInput-root.MuiInputBase-sizeSmall': {
                paddingTop: '0px',
                paddingBottom: '0px',
              },
              '& .MuiInputBase-input': {
                padding: '10px 14px !important',
              },
              '& .MuiInputLabel-root': {
                top: '0px',
              },
            }}
          />
        </FormControl>
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
            {t('projects.print')}
          </MenuItem>

          <MenuItem
            onClick={() => {
              popover.onClose();
            }}
          >
            <Iconify icon="solar:import-bold" />
            {t('projects.import')}
          </MenuItem>

          <MenuItem
            onClick={() => {
              popover.onClose();
            }}
          >
            <Iconify icon="solar:export-bold" />
            {t('projects.export')}
          </MenuItem>
        </MenuList>
      </CustomPopover>
    </>
  );
}
