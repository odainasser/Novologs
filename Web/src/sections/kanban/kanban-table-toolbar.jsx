import { useCallback, useState, useEffect } from 'react';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

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
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import { CustomDateRangePicker } from 'src/components/custom-date-range-picker';
import { fDateRangeShortLabel } from 'src/utils/format-time';
import dayjs from 'dayjs';
// ----------------------------------------------------------------------

export function KanbanTableToolbar({
  filters,
  options,
  onResetPage,
  view,
  memberOptions,
  memberOptionsAssigned,
  allUsers,
  memberIds,
  isUser,
  taskStatusOptions,
  priorityOptions,
  taskVariantOptions,
  isSubTask,
  isClient,
  isLead,
  isProject,
  isTaskCategory,
  isTicket,
  hierarchyList,
  sharedUsers,
  dateError,
  openDateRange,
  onOpenDateRange,
  onCloseDateRange,
}) {
  const { t, i18n } = useTranslation('dashboard/tasks');
  console.log('this is the memberOptionsAssigned', memberOptionsAssigned);
  const filter = createFilterOptions();
  const [memberInput, setMemberInput] = useState('');
  const popover = usePopover();
  const { zetaUser } = useAuthContext();
  const storedLang = localStorage.getItem('selectedLang');
  const formatDateRange = (start, end) => {
    if (!start || !end) return 'Select end date range';

    return `${dayjs(start).format('DD-MM-YYYY')} - ${dayjs(end).format('DD-MM-YYYY')}`;
  };
  useEffect(() => {
    if (!filters.state.member) {
      setMemberInput('');
      return;
    }

    const selectedMember = memberOptions.members?.find((user) => user.id === filters.state.member);

    setMemberInput(selectedMember?.fullName || '');
  }, [filters.state.member, memberOptions.members]);
  const handleFilterName = useCallback(
    (event) => {
      onResetPage();
      filters.setState({ name: event.target.value });
    },
    [filters, onResetPage]
  );

  const handleFilterRole = useCallback(
    (event) => {
      const newValue =
        typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value;

      onResetPage();

      if (newValue.includes('all')) {
        filters.setState({ role: [] });
        return;
      }

      filters.setState({ role: newValue });
    },
    [filters, onResetPage]
  );

  const handleFilterVariant = useCallback(
    (event) => {
      const newValue =
        typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value;

      onResetPage();

      if (newValue.includes('all')) {
        filters.setState({ taskVariant: [] });
        return;
      }

      filters.setState({ taskVariant: newValue });
    },
    [filters, onResetPage]
  );

  const handleFilterPriority = useCallback(
    (event) => {
      const newValue =
        typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value;

      onResetPage();

      if (newValue.includes('all')) {
        filters.setState({ priority: [] });
        return;
      }

      filters.setState({ priority: newValue });
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

  const handleFilterAssignedFrom = useCallback(
    (newValue) => {
      onResetPage();
      filters.setState({ assignedFrom: newValue || [] });
    },
    [filters, onResetPage]
  );

  const handleFilterAssignedTo = useCallback(
    (newValue) => {
      onResetPage();
      filters.setState({ assignedTo: newValue || [] });
    },
    [filters, onResetPage]
  );

  const handleFilterTaskStatus = useCallback(
    (event) => {
      const newValue =
        typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value;

      onResetPage();
      filters.setState({ taskStatus: newValue });
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
        {formatDateRange(filters.state.startDate, filters.state.endDate)}
      </Button>

      <CustomDateRangePicker
        variant="calendar"
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
        alignItems={{ xs: 'flex-end', md: 'flex-end' }}
        direction={{ xs: 'column', md: 'row' }}
        // sx={{ p: 2.5, pr: { xs: 2.5, md: 1 } }}
        sx={{ my: 0.7 }}
      >
        {' '}
        <TextField
          fullWidth
          value={filters.state.name}
          onChange={handleFilterName}
          placeholder={t('tasks.search')}
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
        {/* <IconButton onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton> */}
        {!isTicket && (
          <FormControl sx={{ flexShrink: 0, width: { xs: 1, md: 200 } }}>
            <InputLabel htmlFor="user-filter-role-select-label" sx={{ top: '-6px' }}>
              {t('tasks.filters.status')}
            </InputLabel>
            <Select
              multiple
              value={filters.state.role}
              onChange={handleFilterRole}
              input={<OutlinedInput label={t('tasks.filters.status')} />}
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
              <MenuItem
                value="all"
                onClick={() => {
                  onResetPage();
                  filters.setState({ role: [] });
                }}
              >
                <Checkbox disableRipple size="small" checked={filters.state.role.length === 0} />
                All
              </MenuItem>
              {taskStatusOptions.taskStatus.map((option) => (
                <MenuItem key={option} value={option}>
                  <Checkbox
                    disableRipple
                    size="small"
                    checked={filters.state.role.includes(option)}
                  />
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
        {isTicket && filters.state.status != 3 && (
          <FormControl sx={{ flexShrink: 0, width: { xs: 1, md: 200 } }}>
            <InputLabel htmlFor="user-filter-role-select-label" sx={{ top: '-6px' }}>
              {t('tasks.filters.status')}
            </InputLabel>
            <Select
              multiple
              value={filters.state.role}
              onChange={handleFilterRole}
              input={<OutlinedInput label={t('tasks.filters.status')} />}
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
              <MenuItem
                value="all"
                onClick={() => {
                  onResetPage();
                  filters.setState({ role: [] });
                }}
              >
                <Checkbox disableRipple size="small" checked={filters.state.role.length === 0} />
                All
              </MenuItem>
              {taskStatusOptions.taskStatus.map((option) => (
                <MenuItem key={option} value={option}>
                  <Checkbox
                    disableRipple
                    size="small"
                    checked={filters.state.role.includes(option)}
                  />
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
        {!isUser && filters.state.status != 3 && !zetaUser?.roles?.includes('External') && (
          <FormControl sx={{ flexShrink: 0, width: { xs: 1, md: 200 } }}>
            <Autocomplete
              options={[{ id: '', fullName: 'All', isAll: true }, ...(memberOptions.members || [])]}
              inputValue={memberInput}
              onInputChange={(event, newInputValue, reason) => {
                if (reason === 'input') {
                  setMemberInput(newInputValue);
                }

                if (reason === 'clear') {
                  setMemberInput('');
                  filters.setState({ member: '' });
                }
              }}
              filterOptions={(options, params) => {
                const filtered = filter(
                  options.filter((option) => !option.isAll),
                  params
                );

                return params.inputValue
                  ? filtered
                  : [{ id: '', fullName: 'All', isAll: true }, ...filtered];
              }}
              value={
                filters.state.member
                  ? memberOptions.members?.find((user) => user.id === filters.state.member) || null
                  : null
              }
              onChange={(event, newValue) => {
                onResetPage();

                filters.setState({
                  member: newValue?.isAll ? '' : newValue?.id || '',
                });

                setMemberInput(newValue?.isAll || !newValue ? '' : newValue?.fullName || '');
              }}
              getOptionLabel={(option) => option?.fullName || ''}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t('tasks.filters.members')}
                  placeholder={t('tasks.filters.members')}
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
        )}
        {!isSubTask && !isClient && !isProject && !isTaskCategory && !isLead && (
          <FormControl sx={{ flexShrink: 0, width: { xs: 1, md: 200 } }}>
            <InputLabel htmlFor="user-filter-variant-select-label" sx={{ top: '-6px' }}>
              {t('tasks.task_type')}
            </InputLabel>
            <Select
              multiple
              value={filters.state.taskVariant}
              onChange={handleFilterVariant}
              input={<OutlinedInput label={t('tasks.task_type')} />}
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
              <MenuItem
                value="all"
                onClick={() => {
                  onResetPage();
                  filters.setState({ taskVariant: [] });
                }}
              >
                <Checkbox
                  disableRipple
                  size="small"
                  checked={filters.state.taskVariant.length === 0}
                />
                All
              </MenuItem>
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
        )}
        {!isUser && (
          <FormControl sx={{ flexShrink: 0, width: { xs: 1, md: 200 } }}>
            <InputLabel htmlFor="user-filter-priority-select-label" sx={{ top: '-6px' }}>
              {t('tasks.priorities')}
            </InputLabel>
            <Select
              multiple
              value={filters.state.priority}
              onChange={handleFilterPriority}
              input={<OutlinedInput label={t('tasks.priorities')} />}
              renderValue={(selected) => selected.map((value) => value).join(', ')}
              inputProps={{ id: 'user-filter-priority-select-label' }}
              sx={{
                '& .MuiInputBase-input': {
                  padding: '10px 14px',
                },
                '& .MuiInputLabel-root': {
                  top: '-6px',
                },
              }}
            >
              <MenuItem
                value="all"
                onClick={() => {
                  onResetPage();
                  filters.setState({ priority: [] });
                }}
              >
                <Checkbox
                  disableRipple
                  size="small"
                  checked={filters.state.priority.length === 0}
                />
                All
              </MenuItem>
              {priorityOptions.priorities.map((option) => (
                <MenuItem key={option} value={option}>
                  <Checkbox
                    disableRipple
                    size="small"
                    checked={filters.state.priority.includes(option)}
                  />
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Stack>
      <Stack
        spacing={2}
        alignItems={{ xs: 'flex-end', md: 'flex-end' }}
        direction={{ xs: 'column', md: 'row' }}
        // sx={{ p: 2.5, pr: { xs: 2.5, md: 1 } }}
        sx={{
          my: 0.7,
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        {' '}
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
            multiple
            limitTags={2}
            popupIcon={null}
            defaultValue={[]}
            disableCloseOnSelect
            options={sharedUsers || []}
            value={filters.state.assignedFrom || []}
            onChange={(event, newValue) => {
              handleFilterAssignedFrom(newValue);
            }}
            getOptionLabel={(option) => option?.fullName || ''}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Created By"
                placeholder="Created By"
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    padding: 0,
                  },
                  '& .MuiAutocomplete-input': {
                    padding: '4px 8px !important',
                  },
                  '& .MuiInputBase-input': {
                    padding: '4px 8px !important',
                  },
                }}
                // size="small"
                InputLabelProps={{
                  sx: { top: '-6px' },
                }}
              />
            )}
            renderTags={(selected, getTagProps) =>
              selected.map((option, index) => (
                <Chip
                  {...getTagProps({ index })}
                  key={option.id}
                  avatar={
                    <Avatar alt={option?.fullName} src={option?.profileImageFileUrl} sx={{ mr: 2 }}>
                      {!option?.profileImageFileUrl && option?.fullName?.charAt(0).toUpperCase()}
                    </Avatar>
                  }
                  label={option.fullName}
                  size="small"
                  variant="soft"
                />
              ))
            }
            renderOption={(props, option, { selected }) => (
              <li {...props} key={option.id}>
                <Checkbox checked={selected} sx={{ mr: 1 }} />
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
            multiple
            limitTags={2}
            popupIcon={null}
            defaultValue={[]}
            disableCloseOnSelect
            options={sharedUsers || []}
            value={filters.state.assignedTo || []}
            onChange={(event, newValue) => {
              handleFilterAssignedTo(newValue);
            }}
            getOptionLabel={(option) => option?.fullName || ''}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Assigned To"
                placeholder="Assigned To"
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    padding: 0,
                  },
                  '& .MuiAutocomplete-input': {
                    padding: '4px 8px !important',
                  },
                  '& .MuiInputBase-input': {
                    padding: '4px 8px !important',
                  },
                }}
                // size="small"
                InputLabelProps={{ sx: { top: '-6px' } }}
              />
            )}
            renderTags={(selected, getTagProps) =>
              selected.map((option, index) => (
                <Chip
                  {...getTagProps({ index })}
                  key={option.id}
                  avatar={
                    <Avatar alt={option?.fullName} src={option?.profileImageFileUrl} sx={{ mr: 2 }}>
                      {!option?.profileImageFileUrl && option?.fullName?.charAt(0).toUpperCase()}
                    </Avatar>
                  }
                  label={option.fullName}
                  size="small"
                  variant="soft"
                />
              ))
            }
            renderOption={(props, option, { selected }) => (
              <li {...props} key={option.id}>
                <Checkbox checked={selected} sx={{ mr: 1 }} />
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
        <Box>{renderFilterDate}</Box>
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
            {t('tasks.filters.print')}
          </MenuItem>

          <MenuItem
            onClick={() => {
              popover.onClose();
            }}
          >
            <Iconify icon="solar:import-bold" />
            {t('tasks.filters.import')}
          </MenuItem>

          <MenuItem
            onClick={() => {
              popover.onClose();
            }}
          >
            <Iconify icon="solar:export-bold" />
            {t('tasks.filters.import')}
          </MenuItem>
        </MenuList>
      </CustomPopover>
    </>
  );
}
