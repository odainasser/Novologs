import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import { MenuItem } from '@mui/material';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import ListItemText from '@mui/material/ListItemText';
import DialogActions from '@mui/material/DialogActions';
import InputAdornment from '@mui/material/InputAdornment';
import FormControlLabel from '@mui/material/FormControlLabel';

import { getCompanyBranches } from 'src/actions/userManage/userManageActions';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { PhoneInput } from 'src/components/phone-input/phone-input';
import { CountrySelect } from 'src/components/country-select/country-select';
import Switch from '@mui/material/Switch';

// ----------------------------------------------------------------------

export function AddUserDetails({
  open,
  shared = [],
  selectedRights,
  setSelectedRights,
  onClose,
  handleClose,
  onToggleRights,
  mode,
  address,
  hourlyRate,
  setHourlyRate,
  phoneNumber,
  setAddress,
  setPhoneNumber,
  nationality,
  setNationality,
  addNewDetails,
  isExternal,
  setIsExternal,
  branch,
  setBranch,
  isSuperAdmin,
  ...other
}) {
  console.log('this is the isExternal', isExternal);
  const { t, i18n } = useTranslation('dashboard/teams');
  const [searchQuery, setSearchQuery] = useState('');
  const storedLang = localStorage.getItem('selectedLang');

  const getBranchParams = {
    pagination: {
      pageNumber: 1,
      pageSize: 1000,
    },
  };

  const {
    branchList,
    branchListLoading,
    branchListError,
    branchListValidating,
    branchListEmpty,
    mutate,
  } = getCompanyBranches(getBranchParams);

  const filteredShared = shared
    .filter(
      (right) =>
        right?.toLowerCase().includes(searchQuery.toLowerCase()) &&
        right?.toLowerCase() !== 'external'
    )
    .sort((a, b) => {
      if (a === 'Internal') return -1;
      if (b === 'Internal') return 1;
      return a.localeCompare(b);
    });
  useEffect(() => {
    if (open && !isExternal) {
      if (isSuperAdmin) {
        setSelectedRights((prev) => {
          const base = prev?.length ? prev : shared; // fallback to all roles if empty

          const withInternal = base.includes('Internal') ? base : ['Internal', ...base];

          const withSuperAdmin = withInternal.includes('SuperAdmin')
            ? withInternal
            : [...withInternal, 'SuperAdmin'];

          return withSuperAdmin;
        });
      } else if (mode === 'add') {
        setSelectedRights(['Internal']);
      }
    }
  }, [open, mode, isExternal, isSuperAdmin, shared]);
  const handleCloseDialog = () => {
    setSearchQuery('');
    handleClose();
  };

  const handleCancelDialog = () => {
    setSearchQuery('');
    handleClose();
    setAddress('');
    setHourlyRate('');
    setPhoneNumber('');
    setNationality('');
    setIsExternal(false);
    // setSelectedRights([]);
  };

  const handleGroupIDChange = (event) => {
    setAddress(event.target.value);
  };

  const handleRateChange = (event) => {
    setHourlyRate(event.target.value);
  };
  const handlePhoneNumberChange = useCallback(
    (val) => {
      console.log('this is the value,', val);
      setPhoneNumber(val ?? '');
    },
    [setPhoneNumber]
  );
  const handleCountryChange = (event, value) => {
    console.log('this is the value', value);
    setNationality(value);
  };

  const handleBranchChange = (event) => {
    console.log('this is the event', event.target.value);
    setBranch(event.target.value);
  };

  const handleAddDetail = () => {
    const detail = {
      hourlyRate,
      address,
      phoneNumber,
      nationality,
      roles: selectedRights,
      userType: !!isExternal,
      branch,
    };
    console.log('this is the details', detail);
    addNewDetails(detail);
    handleCloseDialog();
  };
  const lockedRights = filteredShared.filter(
    (right) => right === 'Internal' || (isSuperAdmin && right === 'SuperAdmin')
  );

  const selectableRights = filteredShared.filter((right) => !lockedRights.includes(right));

  const isAllSelectableChecked =
    selectableRights.length > 0 &&
    selectableRights.every((right) => selectedRights.includes(right));
  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      open={open}
      onClose={handleCloseDialog}
      dir={storedLang === 'ar' ? 'rtl' : 'ltr'}
      {...other}
    >
      <DialogTitle>
        {mode === 'add' ? t('tooltip.add_user_details') : t('tooltip.edit_user_details')}
      </DialogTitle>

      <>
        <Box sx={{ px: 3, pb: 1 }}>
          <Box
            display="flex"
            alignItems="center"
            gap={1}
            sx={{ mb: 1 }}
            justifyContent="space-between"
          >
            <>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="subtitle2" noWrap sx={{ mb: 0.5 }}>
                    {isExternal ? t('teams.tabs.external') : t('teams.tabs.external')}
                  </Typography>

                  <Switch
                    checked={isExternal}
                    disabled={isSuperAdmin}
                    onChange={(event) => {
                      const isChecked = event.target.checked;
                      setIsExternal(isChecked);

                      if (isChecked) {
                        // If switch is checked, only "External" should be selected
                        setSelectedRights(['External']);
                      } else {
                        setSelectedRights((prev) => {
                          // Remove "External" if it exists
                          const filtered = prev.filter((r) => r !== 'External');
                          // If nothing is left, default to "Internal"
                          return filtered.length === 0 ? ['Internal'] : filtered;
                        });
                      }
                    }}
                    sx={{
                      '& .MuiSwitch-track': {
                        backgroundColor: isExternal ? '#f44336!important' : undefined,
                      },
                    }}
                  />
                </Box>
                {isSuperAdmin && (
                  <Typography variant="caption" sx={{ color: 'warning.main' }}>
                    Super Admin cannot be designated as external
                  </Typography>
                )}
              </Box>
            </>

            <>
              <TextField
                placeholder={t('table.headings.hourly_rate')}
                variant="outlined"
                size="small"
                type="number"
                value={hourlyRate}
                onChange={handleRateChange}

                // error={!!rateError}
                // helperText={rateError}
              />
            </>
          </Box>
          <Box display="flex" gap={2} sx={{ mb: 2 }}>
            <TextField
              placeholder={t('placeholder.enter_address')}
              variant="outlined"
              size="small"
              fullWidth
              multiline
              rows={2}
              value={address}
              onChange={handleGroupIDChange}
            />
          </Box>
          <Box
            sx={{
              mb: 2,
              ...(storedLang === 'ar' && {
                '& .MuiFormLabel-root': {
                  right: 30,
                  left: 'auto',
                  transformOrigin: 'top right',
                },
                '& .MuiInputBase-input': {
                  paddingRight: '50px',
                  direction: 'rtl',
                },
                '& .MuiButtonBase-root': {
                  marginRight: '12px',
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  textAlign: 'right',
                },
              }),
            }}
          >
            <PhoneInput
              label={t('table.headings.phone-number')}
              fullWidth
              onChange={handlePhoneNumberChange}
              value={phoneNumber}
            />
          </Box>
          <Box
            sx={{
              ...(storedLang === 'ar' && {
                '& .MuiOutlinedInput-root': {
                  '&&': {
                    paddingRight: '8px',
                    direction: 'rtl',
                  },
                },
                '& .MuiFormLabel-root': {
                  right: 30,
                  left: 'auto',
                  transformOrigin: 'top right',
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  textAlign: 'right',
                },
                '& .MuiAutocomplete-endAdornment': {
                  left: 0,
                  right: 'auto',
                },
              }),
              '& .MuiOutlinedInput-root .MuiAutocomplete-input': {
                padding: '2px 4px 2px 5px',
              },
            }}
          >
            <CountrySelect
              label={t('table.headings.choose_country')}
              fullWidth
              value={nationality}
              onChange={handleCountryChange}
              sx={{
                '& .MuiOutlinedInput-root .MuiAutocomplete-input': {
                  padding: '2px 4px 2px 5px',
                },
              }}
            />
          </Box>
          <Box display="flex" gap={2} sx={{ mb: 1, mt: 2 }}>
            <TextField
              select
              fullWidth
              label={t('table.headings.branches')}
              value={branch}
              onChange={handleBranchChange}
              sx={{
                '& .MuiInputBase-input': {
                  padding: '9px 14px',
                },
                '& .MuiInputLabel-root': {
                  top: '-5px',
                  fontSize: '10px',
                },
              }}
            >
              {branchListEmpty ? (
                <MenuItem value="">{t('table.no_branches')}</MenuItem>
              ) : (
                branchList?.branches.map((branch) => (
                  <MenuItem key={branch.id} value={branch.id}>
                    {branch?.name}
                  </MenuItem>
                ))
              )}
            </TextField>
          </Box>
        </Box>
      </>

      {!isExternal && (
        <Box sx={{ px: 3 }}>
          <TextField
            fullWidth
            placeholder={t('table.headings.placeholder_search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiInputBase-input': {
                padding: '10px 0',
              },
              '& .MuiInputLabel-root': {
                top: '-7px',
              },
              mb: 1,
            }}
          />
        </Box>
      )}

      {filteredShared.length > 0 ? (
        <Scrollbar sx={{ height: 70 * 5, px: 3 }}>
          {!isExternal && (
            <Box component="ul">
              <Box display="flex" justifyContent="space-between" sx={{ mt: 1 }}>
                <Typography variant="subtitle1" noWrap>
                  {t('hierarchy.select_user_permissions')}
                </Typography>
                <FormControlLabel
                  label={isAllSelectableChecked ? 'Deselect all' : t('hierarchy.select_all')}
                  control={
                    <Checkbox
                      checked={isAllSelectableChecked}
                      // indeterminate={
                      //   selectableRights.some((right) => selectedRights.includes(right)) &&
                      //   !isAllSelectableChecked
                      // }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRights((prev) =>
                            Array.from(new Set([...prev, ...selectableRights]))
                          );
                        } else {
                          setSelectedRights((prev) =>
                            prev.filter((right) => lockedRights.includes(right))
                          );
                        }
                      }}
                    />
                  }
                />
              </Box>
              <Typography variant="caption" noWrap sx={{ color: '#006A67' }}>
                {t('hierarchy.internal_employee')}
              </Typography>

              {filteredShared.map((right) => (
                <SelectUserDetails
                  key={right}
                  right={right}
                  isSelected={selectedRights?.includes(right)}
                  onToggleRights={() => onToggleRights(right)}
                  mode={mode}
                  isExternal={isExternal}
                  isSuperAdmin={isSuperAdmin}
                />
              ))}
            </Box>
          )}
        </Scrollbar>
      ) : (
        <Box sx={{ px: 3, py: 2 }}>
          <Typography variant="body2" color="textSecondary">
            {t('hierarchy.no_user_rights')}
          </Typography>
        </Box>
      )}

      <DialogActions>
        <Button
          variant="contained"
          onClick={handleCancelDialog}
          sx={storedLang === 'ar' ? { ml: 2 } : {}}
        >
          {t('role.cancel')}
        </Button>

        <Button
          variant="contained"
          onClick={handleAddDetail}
          sx={{
            bgcolor: '#006A67',
          }}
        >
          {mode === 'add' ? t('table.actions.add') : t('table.actions.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function SelectUserDetails({
  right,
  isSelected,
  onToggleRights,
  mode,
  isExternal,
  isSuperAdmin,
}) {
  const { t, i18n } = useTranslation('dashboard/teams');
  const formatRoleName = (str) => str.replace(/([a-z])([A-Z])/g, '$1 $2');
  const isDisabled = right === 'Internal' || (isSuperAdmin && right === 'SuperAdmin');
  const rightDisplayNames = {
    Administrator: t('table.headings.admin'),
    HrManagement: t('table.headings.hr_mangement'),
    ProjectManagement: t('table.headings.project_management'),
    TaskManagement: t('table.headings.task_management'),
    ClientManagement: t('table.headings.client_management'),
    VendorManagement: t('table.headings.vendor_management'),
    SettingsManagement: t('table.headings.settings_management'),
  };

  return (
    <Box
      component="li"
      sx={{
        display: 'flex',
        alignItems: 'center',
        py: 0.5,
      }}
    >
      <ListItemText
        primary={formatRoleName(right) || right}
        primaryTypographyProps={{ noWrap: true, typography: 'body2' }}
        sx={{ flexGrow: 1, pr: 1 }}
      />
      <Checkbox checked={isSelected} onChange={onToggleRights} disabled={isDisabled} />
    </Box>
  );
}
