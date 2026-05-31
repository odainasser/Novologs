'use client';

import { useState, useCallback, useEffect } from 'react';

import Stack from '@mui/material/Stack';
import {
  TextField,
  CircularProgress,
  Autocomplete,
  Button,
  DialogContent,
  DialogTitle,
  DialogActions,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { toast } from 'src/components/snackbar';
import{ useTranslation } from 'react-i18next';
import { getWorkStatus, changeMyStatus } from 'src/actions/user-manage/userManageActions';

export function ChangeStatus({ handleCloseStatusDialog, zetaUser, checkUserSession }) {
  const { t, i18n } = useTranslation('dashboard/sign');
  const storedLang = localStorage.getItem('selectedLang');

  const { workStatusList } = getWorkStatus();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    workStatusId: '',
    startDate: '',
    endDate: '',
  });
  useEffect(() => {
    if (zetaUser) {
      setFormData((prev) => ({
        ...prev,
        workStatusId: zetaUser.lastWorkStatus?.workStatus?.id,
        startDate: zetaUser.lastWorkStatus?.startDate,
        endDate: zetaUser.lastWorkStatus?.endDate,
      }));
    }
  }, [zetaUser]);

  const [showStatusError, setShowStatusError] = useState(false);

  const handleStartDateChange = (date) => {
    // if (!date) {
    //   setShowStatusError(true);
    //   setFormData((prevData) => ({
    //     ...prevData,
    //     startDate: null,
    //   }));
    //   return;
    // }

    // setShowStatusError(false);

    const formattedDate = dayjs(date).toISOString();

    if (dayjs(formattedDate).isAfter(dayjs(formData.endDate))) {
      toast.error(t('toast.start_date'));
      setFormData((prevData) => ({
        ...prevData,
        startDate: null,
      }));
      // setShowStatusError(true);
    } else {
      setFormData((prevData) => ({
        ...prevData,
        startDate: formattedDate,
      }));
    }
  };

  const handleEndDateChange = (date) => {
    // if (!date) {
    //   setShowStatusError(true);
    //   toast.error('End Date is required');
    //   setFormData((prevData) => ({
    //     ...prevData,
    //     endDate: null,
    //   }));
    //   return;
    // }

    // setShowStatusError(false);
    const formattedDate = dayjs(date).toISOString();

    if (dayjs(formattedDate).isBefore(dayjs(formData.startDate))) {
      toast.error(t('toast.end_date'));
      setFormData((prevData) => ({
        ...prevData,
        endDate: null,
      }));
      // setShowStatusError(true);
    } else {
      setFormData((prevData) => ({
        ...prevData,
        endDate: formattedDate,
      }));
    }
  };

  const handleStatusChange = (event, newValue) => {
    setFormData((prevData) => ({
      ...prevData,
      workStatusId: newValue ? newValue.id : '',
    }));
  };

  const handleChangeStatus = async (isReset = false) => {
    if (!isReset && !formData.workStatusId) {
      setShowStatusError(true);
      return;
    }

    setLoading(true);

    const statusData = {
      ...formData,
      workStatusId: isReset ? null : formData.workStatusId,
      startDate: isReset ? null : formData.startDate,
      endDate: isReset ? null : formData.endDate,
    };

    console.log('Status Data:', statusData);

    try {
      const response = await changeMyStatus(statusData);
      if (response.success) {
        toast.success(t('toast.status_update'));
        handleCloseStatusDialog();
        if (typeof checkUserSession === 'function') {
          await checkUserSession();
        }
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      console.error('error changing status:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DialogTitle>{t('labels.change_status')}</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ pt: 1 }}>
          <Autocomplete
            options={workStatusList?.workStatuses || []}
            getOptionLabel={(option) => option?.name?.value || ''}
            onChange={handleStatusChange}
            value={
              workStatusList?.workStatuses?.find((status) => status.id === formData.workStatusId) ||
              null
            }
            renderInput={(params) => <TextField {...params} label={t("labels.status")} variant="outlined" />}
            isOptionEqualToValue={(option, value) => option.id === value?.id}
            noOptionsText={t('labels.no_status_found')}
          />

          <DateTimePicker
            label={t("labels.start_date")}
            value={formData.startDate ? dayjs(formData.startDate) : null}
            onChange={handleStartDateChange}
            name="startDate"
            renderInput={(params) => (
              <TextField
                {...params}
                error={showStatusError && !formData.startDate}
                helperText={showStatusError && !formData.startDate ? 'Start Date is required' : ''}
              />
            )}
          />

          <DateTimePicker
            label={t('labels.end_date')}
            value={formData.endDate ? dayjs(formData.endDate) : null}
            onChange={handleEndDateChange}
            name="endDate"
            renderInput={(params) => (
              <TextField
                {...params}
                error={showStatusError && !formData.endDate}
                helperText={showStatusError && !formData.endDate ? 'End Date is required' : ''}
              />
            )}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleCloseStatusDialog}
          variant="contained"
          sx={{
            ...(storedLang === 'ar' && { ml: 1 }),
          }}
        >
          {t('labels.Cancel')}
        </Button>
        <Button
          variant="contained"
          onClick={() => handleChangeStatus(true)}
          startIcon={loading ? <CircularProgress size={20} /> : null}
          color="error"
        >
          {t('labels.reset')}
        </Button>

        <Button
          variant="contained"
          onClick={() => handleChangeStatus(false)}
          startIcon={loading ? <CircularProgress size={20} /> : null}
          sx={{ bgcolor: '#006A67' }}
        >
          {t('labels.update')}
        </Button>
      </DialogActions>
    </>
  );
}
