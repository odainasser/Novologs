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

export function UserTableToolbar({
  filters,
  options,
  onResetPage,
  departments,
  branches,
  searchText,
  setSearchText,
  designations,
}) {
  const { t, i18n } = useTranslation('dashboard/teams');
  const storedLang = localStorage.getItem('selectedLang');
  const filter = createFilterOptions();
  const [departmentInput, setDepartmentInput] = useState('');
  const [designationInput, setDesignationInput] = useState('');
  const [branchInput, setBranchInput] = useState('');
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
  useEffect(() => {
    if (!filters.state.designation) {
      setDesignationInput('');
      return;
    }

    const selectedDesignation = designations?.designations?.find(
      (item) => item.id === filters.state.designation
    );

    setDesignationInput(selectedDesignation?.name?.value || '');
  }, [filters.state.designation, designations?.designations]);

  useEffect(() => {
    if (!filters.state.branch) {
      setBranchInput('');
      return;
    }

    const selectedBranch = branches?.branches?.find((item) => item.id === filters.state.branch);

    setBranchInput(selectedBranch?.name || '');
  }, [filters.state.branch, branches?.branches]);
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

  const handleFilterBranch = useCallback(
    (event) => {
      const newValue =
        typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value;

      onResetPage();
      filters.setState({ branch: newValue });
    },
    [filters, onResetPage]
  );

  const handleFilterActive = useCallback(
    (event) => {
      const selectedStatus = event.target.value;
      onResetPage();
      if (selectedStatus === t('table.status.active')) {
        filters.setState({ isActive: true });
      } else if (selectedStatus === t('table.status.disabled')) {
        filters.setState({ isActive: false });
      } else {
        filters.setState({ isActive: null });
      }
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
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder={t('table.search.placeholder')}
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
        <FormControl sx={{ flexShrink: 0, width: { xs: 1, md: 200 } }}>
          <InputLabel htmlFor="user-filter-status-select-label" sx={{ top: '0px' }}>
            {t('table.status.label')}
          </InputLabel>
          <Select
            value={
              filters.state.isActive === true
                ? t('table.status.active')
                : filters.state.isActive === false
                  ? t('table.status.disabled')
                  : ''
            }
            onChange={handleFilterActive}
            input={<OutlinedInput label="Status" />}
            inputProps={{ id: 'user-filter-status-select-label' }}
            MenuProps={{ PaperProps: { sx: { maxHeight: 240 } } }}
            sx={{
              '& .MuiInputBase-input': {
                padding: '3.5px',
              },
              '& .MuiInputLabel-root': {
                top: '-6px',
              },
            }}
          >
            <MenuItem value={t('table.status.active')}>
              <Checkbox disableRipple size="small" checked={filters.state.isActive === true} />
              {t('table.status.active')}
            </MenuItem>

            <MenuItem value={t('table.status.disabled')}>
              <Checkbox disableRipple size="small" checked={filters.state.isActive === false} />
              {t('table.status.disabled')}
            </MenuItem>
          </Select>
        </FormControl>
        {/* <FormControl sx={{ flexShrink: 0, width: { xs: 1, md: 200 } }}>
          <InputLabel htmlFor="user-filter-status-select-label" sx={{ top: '-6px' }}>
          {t("table.status.label")}
          </InputLabel>
          <Select
            multiple
            value={filters.state.status}
            onChange={handleFilterStatus}
            input={<OutlinedInput label={t("table.status.label")} />}
            renderValue={(selected) => selected.map((value) => value).join(', ')}
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
            {options.status.map((option) => (
              <MenuItem key={option} value={option}>
                <Checkbox
                  disableRipple
                  size="small"
                  checked={filters.state.status.includes(option)}
                />
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl> */}
        <FormControl sx={{ flexShrink: 0, width: { xs: 1, md: 200 } }}>
          <Autocomplete
            options={[
              { id: '', name: { value: 'All' }, isAll: true },
              ...(designations?.designations || []),
            ]}
            inputValue={designationInput}
            onInputChange={(event, newInputValue, reason) => {
              if (reason === 'input') setDesignationInput(newInputValue);

              if (reason === 'clear') {
                setDesignationInput('');
                filters.setState({ designation: '' });
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
              filters.state.designation
                ? designations?.designations?.find(
                    (item) => item.id === filters.state.designation
                  ) || null
                : null
            }
            onChange={(event, newValue) => {
              onResetPage();
              filters.setState({ designation: newValue?.isAll ? '' : newValue?.id || '' });
              setDesignationInput(newValue?.isAll || !newValue ? '' : newValue?.name?.value || '');
            }}
            getOptionLabel={(option) => (option?.isAll ? 'All' : option?.name?.value || '')}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) => (
              <TextField
                {...params}
                label={t('table.headings.designation')}
                placeholder={t('table.headings.designation')}
                variant="outlined"
                size="small"
                InputLabelProps={{ sx: { top: '-6px' } }}
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
                label={t('table.headings.departmentId')}
                placeholder={t('table.headings.departmentId')}
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

        <FormControl sx={{ flexShrink: 0, width: { xs: 1, md: 200 } }}>
          <Autocomplete
            options={[{ id: '', name: 'All', isAll: true }, ...(branches?.branches || [])]}
            inputValue={branchInput}
            onInputChange={(event, newInputValue, reason) => {
              if (reason === 'input') setBranchInput(newInputValue);

              if (reason === 'clear') {
                setBranchInput('');
                filters.setState({ branch: '' });
              }
            }}
            filterOptions={(options, params) => {
              const filtered = filter(
                options.filter((option) => !option.isAll),
                params
              );

              return params.inputValue
                ? filtered
                : [{ id: '', name: 'All', isAll: true }, ...filtered];
            }}
            value={
              filters.state.branch
                ? branches?.branches?.find((item) => item.id === filters.state.branch) || null
                : null
            }
            onChange={(event, newValue) => {
              onResetPage();
              filters.setState({ branch: newValue?.isAll ? '' : newValue?.id || '' });
              setBranchInput(newValue?.isAll || !newValue ? '' : newValue?.name || '');
            }}
            getOptionLabel={(option) => (option?.isAll ? 'All' : option?.name || '')}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) => (
              <TextField
                {...params}
                label={t('table.headings.branches')}
                placeholder={t('table.headings.branches')}
                variant="outlined"
                size="small"
                InputLabelProps={{ sx: { top: '-6px' } }}
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
            {t('table.actions.print')}
          </MenuItem>

          <MenuItem
            onClick={() => {
              popover.onClose();
            }}
          >
            <Iconify icon="solar:import-bold" />
            {t('table.actions.import')}
          </MenuItem>

          <MenuItem
            onClick={() => {
              popover.onClose();
            }}
          >
            <Iconify icon="solar:export-bold" />
            {t('table.actions.export')}
          </MenuItem>
        </MenuList>
      </CustomPopover>
    </>
  );
}
