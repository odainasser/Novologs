import { z as zod } from 'zod';
import { useCallback } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogActions from '@mui/material/DialogActions';

import { uuidv4 } from 'src/utils/uuidv4';
import { fIsAfter } from 'src/utils/format-time';

import { createEvent, updateEvent, deleteEvent } from 'src/actions/calendar';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { Form, Field } from 'src/components/hook-form';
import { ColorPicker } from 'src/components/color-utils';
import { useTranslation } from 'react-i18next';



// ----------------------------------------------------------------------

export function CalendarForm({ currentEvent, colorOptions, onClose }) {
   const {t,i18n} = useTranslation('dashboard/calendar');
   const EventSchema = zod.object({
    title: zod
      .string()
      .min(1, { message: t('calendar.validation.title_required') })
      .max(100, { message:  t('calendar.validation.title_max') }),
    description: zod
      .string()
      .min(1, { message: t('calendar.validation.description_required') })
      .min(50, { message: t('calendar.validation.description_min') }),
    // Not required
    color: zod.string(),
    allDay: zod.boolean(),
    start: zod.union([zod.string(), zod.number()]),
    end: zod.union([zod.string(), zod.number()]),
  });
  
  const methods = useForm({
    mode: 'all',
    resolver: zodResolver(EventSchema),
    defaultValues: currentEvent,
  });

  const {
    reset,
    watch,
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const dateError = fIsAfter(values.start, values.end);

  const onSubmit = handleSubmit(async (data) => {
    const eventData = {
      id: currentEvent?.id ? currentEvent?.id : uuidv4(),
      color: data?.color,
      title: data?.title,
      allDay: data?.allDay,
      description: data?.description,
      end: data?.end,
      start: data?.start,
    };

    try {
      if (!dateError) {
        if (currentEvent?.id) {
          await updateEvent(eventData);
          toast.success(t('calendar.form.update_success'));
        } else {
          await createEvent(eventData);
          toast.success(t('calendar.form.create_success'));
        }
        onClose();
        reset();
      }
    } catch (error) {
      console.error(error);
    }
  });

  const onDelete = useCallback(async () => {
    try {
      await deleteEvent(`${currentEvent?.id}`);
      toast.success(t('calendar.form.delete_success'));
      onClose();
    } catch (error) {
      console.error(error);
    }
  }, [currentEvent?.id, onClose]);

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Scrollbar sx={{ p: 3, bgcolor: 'background.neutral' }}>
        <Stack spacing={3}>
          <Field.Text name="title" label={t('calendar.form.title')} />

          <Field.Text name="description" label={t('calendar.form.description')} multiline rows={3} />

          <Field.Switch name="allDay" label={t('calendar.form.all_day')}/>

          <Field.MobileDateTimePicker name="start" label={t('calendar.start_date')} />

          <Field.MobileDateTimePicker
            name="end"
            label={t('calendar.form.end_date')}
            slotProps={{
              textField: {
                error: dateError,
                helperText: dateError ? t('calendar.validation.end_date_error') : null,
              },
            }}
          />

          <Controller
            name="color"
            control={control}
            render={({ field }) => (
              <ColorPicker
                selected={field.value}
                onSelectColor={(color) => field.onChange(color)}
                colors={colorOptions}
              />
            )}
          />
        </Stack>
      </Scrollbar>

      <DialogActions sx={{ flexShrink: 0 }}>
        {!!currentEvent?.id && (
          <Tooltip title={t('calendar.tooltip.delete_event')}>
            <IconButton onClick={onDelete}>
              <Iconify icon="solar:trash-bin-trash-bold" />
            </IconButton>
          </Tooltip>
        )}

        <Box sx={{ flexGrow: 1 }} />

        <Button variant="outlined" color="inherit" onClick={onClose}>
        {t('calendar.form.cancel')}
        </Button>

        <LoadingButton
          type="submit"
          variant="contained"
          loading={isSubmitting}
          disabled={dateError}
        >
         {t('calendar.form.save')}
        </LoadingButton>
      </DialogActions>
    </Form>
  );
}
