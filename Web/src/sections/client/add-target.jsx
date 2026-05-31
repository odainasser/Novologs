import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';

import Typography from '@mui/material/Typography';
import { Scrollbar } from 'src/components/scrollbar';

import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import Card from '@mui/material/Card';
import { Divider } from '@mui/material';
import { useMockedUser } from 'src/auth/hooks';
import Switch from '@mui/material/Switch';
import Stack from '@mui/material/Stack';
import { MenuItem } from '@mui/material';
import { years, months } from 'src/sections/client/client-mock-data';
import { useTranslation } from 'react-i18next';
import { addUserTarget } from 'src/actions/client/clientActions';
import { toast } from 'src/components/snackbar';

// ----------------------------------------------------------------------

export function AddTarget({
  open,
  selectedPersons,
  setSelectedPersons,
  onClose,
  handleClose,
  onTogglePerson,
  mode,
  groupID,
  groupName,
  setGroupID,
  setGroupName,
  addNewTarget,
  memberId,
  memberName,
  mutateSalesTarget,
  salesTargetLength,
  existingTarget,
  ...other
}) {
  const storedLang = localStorage.getItem('selectedLang');
  const [rawValues, setRawValues] = useState(Array(12).fill(''));
  const [formattedValues, setFormattedValues] = useState(Array(12).fill(''));

  const formatNumber = (value) => {
    if (!value) return '';
    const parts = value.toString().replace(/,/g, '').split('.');
    const integerPart = parts[0];
    const decimalPart = parts[1] || '';

    const lastThree = integerPart.slice(-3);
    const rest = integerPart.slice(0, -3);
    const formatted = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + (rest ? ',' : '') + lastThree;

    return decimalPart.length > 0 ? `${formatted}.${decimalPart}` : formatted;
  };

  // Add .00 if needed after user stops typing
  const applyTrailingDecimals = (value) => {
    if (!value) return '';
    const parts = value.split('.');
    if (parts.length === 1) return `${value}.00`;
    if (parts[1].length === 1) return `${value}0`;
    return value;
  };
  const handleValueChange = (index, input) => {
    const cleaned = input.replace(/[^0-9.]/g, '');

    const updatedRaw = [...rawValues];
    updatedRaw[index] = cleaned;
    setRawValues(updatedRaw);

    const updatedFormatted = [...formattedValues];
    updatedFormatted[index] = formatNumber(cleaned);
    setFormattedValues(updatedFormatted);

    // optional: store in your `newTarget.monthlyValue` here too if needed
  };
  useEffect(() => {
    const timeout = setTimeout(() => {
      const updated = formattedValues.map((val) => applyTrailingDecimals(val));
      setFormattedValues(updated);
    }, 1000); // 1 second after typing stops

    return () => clearTimeout(timeout);
  }, [formattedValues]);

  useEffect(() => {
    if (open && existingTarget?.length) {
      const sortedTargets = [...existingTarget].sort((a, b) => new Date(a.date) - new Date(b.date));

      const monthValues = sortedTargets.map((item) => item.value || '');
      const formatted = monthValues.map((val) => formatNumber(val));

      setNewTarget({
        year: new Date(sortedTargets[0].date).getFullYear(),
        monthlyValue: monthValues,
      });
      setRawValues(monthValues);
      setFormattedValues(formatted);
    }
  }, [open, existingTarget]);

  const handleCloseTargetDialog = () => {
    handleClose();

    setNewTarget({
      year: new Date().getFullYear(),
      monthlyValue: Array(12).fill(''),
    });

    setRawValues(Array(12).fill(''));
    setFormattedValues(Array(12).fill(''));
  };

  const [newTarget, setNewTarget] = useState({
    year: new Date().getFullYear(),
    monthlyValue: Array(12).fill(''),
  });
  const { t, i18n } = useTranslation('dashboard/client');

  const handleMonthChange = (index, value) => {
    const updatedMonthlyValue = [...newTarget.monthlyValue];
    updatedMonthlyValue[index] = value;
    setNewTarget({ ...newTarget, monthlyValue: updatedMonthlyValue });
  };
  const handleAddTarget = async () => {
    const targets = [];
    const currentYear = parseInt(newTarget.year) || new Date().getFullYear();

    for (let index = 0; index < 12; index++) {
      const rawValue = rawValues[index];

      // Ensure it's a string before trimming
      const stringValue = rawValue != null ? String(rawValue) : '';

      const value = stringValue.trim() !== '' ? parseFloat(stringValue.replace(/,/g, '')) : 0;

      const date = new Date(Date.UTC(currentYear, index, 1));

      targets.push({
        date: date.toISOString(),
        value: value,
      });
    }

    const payload = {
      targets: targets,
      userId: memberId,
    };

    console.log('Target payload:', payload);

    try {
      const response = await addUserTarget(payload);
      if (response.success) {
        toast.success(
          salesTargetLength === 0 ? t('addTarget.toast.target_add') : t('addTarget.toast.target_update')
        );
        await mutateSalesTarget();
        handleCloseTargetDialog();
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      console.error('Add target failed:', error);
    }
  };

  return (
    <>
      <Dialog
        fullWidth
        maxWidth="sm"
        open={open}
        onClose={handleCloseTargetDialog}
        dir={storedLang === 'ar' ? 'rtl' : 'ltr'}
        {...other}
      >
        <DialogTitle>
          {salesTargetLength === 0
            ? `${t('addTarget.dialogTitle.add')} ${memberName}`
            : `${t('addTarget.dialogTitle.edit')} ${memberName}`}
        </DialogTitle>
        <Stack spacing={3} sx={{ p: 3 }}>
          <TextField
            select
            label={t('addTarget.form.yearLabel')}
            value={newTarget.year || ''}
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
            onChange={(e) => setNewTarget({ ...newTarget, year: e.target.value })}
          >
            {' '}
            {years.map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </TextField>
          <Stack direction="row" spacing={2} flexWrap="wrap">
            {months.map((month, index) => (
              <TextField
                key={month}
                label={month}
                value={formattedValues[index]}
                fullWidth
                onChange={(e) => handleValueChange(index, e.target.value)}
                sx={{
                  width: '48%',
                  marginBottom: 2,
                }}
                inputProps={{
                  inputMode: 'decimal',
                  pattern: '[0-9]*([,.][0-9]*)?',
                  style: { textAlign: 'right' },
                }}
              />
            ))}
          </Stack>
        </Stack>

        <DialogActions>
          <Button
            variant="contained"
            onClick={handleCloseTargetDialog}
            sx={{
              ...(storedLang === 'ar' && { ml: 1 }),
            }}
          >
            {t('clients.buttons.cancel')}
          </Button>
          <Button variant="contained" onClick={handleAddTarget} sx={{ bgcolor: '#006A67' }}>
            {salesTargetLength === 0 ? t('addTarget.form.addButton') : t('addTarget.form.saveButton')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
