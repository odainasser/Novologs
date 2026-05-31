import dayjs from 'dayjs';
import { Controller, useFormContext } from 'react-hook-form';

import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { MobileDateTimePicker } from '@mui/x-date-pickers/MobileDateTimePicker';

import { formatStr } from 'src/utils/format-time';

// ----------------------------------------------------------------------

export function RHFDatePicker({ name, slotProps, onDateChange, ...other }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <DatePicker
          {...field}
          value={field.value && dayjs(field.value).isValid() ? dayjs(field.value) : null}
          onChange={(newValue) => {
            const formattedDate = newValue ? dayjs(newValue).format() : ''; // Handle null newValue if date is cleared
            console.log('startDate:', formattedDate);
            field.onChange(formattedDate);
            if (onDateChange) onDateChange(formattedDate);
          }}
          format={formatStr.split.date}
          slotProps={{
            ...slotProps,
            textField: {
              fullWidth: true,
              error: !!error,
              helperText: error?.message ?? slotProps?.textField?.helperText,
              ...slotProps?.textField,
            },
          }}
          {...other}
        />
      )}
    />
  );
}

// ----------------------------------------------------------------------

export function RHFMobileDateTimePicker({ name, slotProps = {}, onDateChange, ...other }) {
  const { control } = useFormContext();

  if (!control) {
    console.error(
      'useFormContext is undefined. Make sure your component is wrapped in <FormProvider>.'
    );
    return null;
  }

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        const isValidDate = field.value && dayjs(field.value).isValid();

        return (
          <MobileDateTimePicker
            {...field}
            value={isValidDate ? dayjs(field.value) : null}
            onChange={(newValue) => {
              const formattedDate = newValue ? dayjs(newValue).format() : '';
              field.onChange(formattedDate);
              if (onDateChange) onDateChange(formattedDate);
            }}
            format={formatStr.split.dateTime}
            slotProps={{
              textField: {
                fullWidth: true,
                error: !!error,
                helperText: error?.message ?? slotProps?.textField?.helperText,
                ...slotProps?.textField,
              },
              actionBar: {
                actions: isValidDate ? ['cancel', 'accept'] : ['cancel'],
              },
              ...slotProps,
            }}
            {...other}
          />
        );
      }}
    />
  );
}
