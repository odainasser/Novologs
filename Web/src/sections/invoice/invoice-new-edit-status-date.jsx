import { useFormContext } from 'react-hook-form';

import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';

import { Field } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export function InvoiceNewEditStatusDate() {
  const { watch } = useFormContext();

  const values = watch();

  return (
    <Stack
      spacing={2}
      direction={{ xs: 'column', sm: 'row' }}
      sx={{ p: 3, bgcolor: 'background.neutral' }}
    >
      <Field.Text
        disabled
        name="invoiceNumber"
        label="Invoice number"
        value={values.invoiceNumber}
        sx={{
          '& .MuiInputBase-input': {
            padding: '9px 14px',
          },
          '& .MuiInputLabel-root': {
            top: '-5px',
            fontSize: '10px',
          },
        }}
      />

      <Field.Select
        fullWidth
        name="status"
        label="Status"
        InputLabelProps={{ shrink: true }}
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
        {['paid', 'pending', 'overdue', 'draft'].map((option) => (
          <MenuItem key={option} value={option} sx={{ textTransform: 'capitalize' }}>
            {option}
          </MenuItem>
        ))}
      </Field.Select>

      <Field.DatePicker
        name="createDate"
        label="Date create"
        sx={{
          '& .MuiInputBase-input': {
            padding: '9px 14px',
          },
          '& .MuiInputLabel-root': {
            top: '-5px',
            fontSize: '10px',
          },
        }}
      />
      <Field.DatePicker
        name="dueDate"
        label="Due date"
        sx={{
          '& .MuiInputBase-input': {
            padding: '9px 14px',
          },
          '& .MuiInputLabel-root': {
            top: '-5px',
            fontSize: '10px',
          },
        }}
      />
    </Stack>
  );
}
