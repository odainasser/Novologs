import { useState, useEffect, useMemo } from 'react';
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

import Switch from '@mui/material/Switch';
import { PhoneInput } from 'src/components/phone-input/phone-input';
import { CountrySelect } from 'src/components/country-select/country-select';

import FormControlLabel from '@mui/material/FormControlLabel';

import InputAdornment from '@mui/material/InputAdornment';
import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';
import { getTasks } from 'src/actions/task/taskActions';
import { addMilestoneTasks } from 'src/actions/project/projectActions';
import { toast } from 'src/components/snackbar';
import { fDate, fTime } from 'src/utils/format-time';
import { useTranslation } from 'react-i18next';

// ----------------------------------------------------------------------

export function AddMilestoneTask({
  open,
  shared = [],
  selectedTasks,
  setSelectedTasks,
  onClose,
  handleClose,
  selectedMilestoneId,
  onToggleTasks,
  projectId,
  mutateTasks,
  taskList,
  mutateMilestoneTasks,
  ...other
}) {
  const {t}=useTranslation('dashboard/tasks');

  console.log('this is the selectedMilestoneId', selectedMilestoneId);
  const [searchQuery, setSearchQuery] = useState('');
  const sharedIds = shared.map((item) => item.id);

  const filteredShared = taskList?.tasks?.filter(
    (task) =>
      !sharedIds.includes(task?.id) &&
      (task?.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(task?.serial).padStart(5, '0').toLowerCase().includes(searchQuery.toLowerCase())) &&
      task?.mileStoneName === null
  );

  const handleCloseDialog = () => {
    setSearchQuery('');
    handleClose();
  };

  const handleAddDetail = async () => {
    const selectedIds = selectedTasks.map((task) => task.id);
    console.log('Selected IDs:', selectedIds);
    const payload = {
      milestoneId: selectedMilestoneId,
      taskIds: selectedIds,
    };

    try {
      const response = await addMilestoneTasks(payload);
      if (response.success) {
        toast.success(t('tasks.milestone_added_successfully'));
        handleCloseDialog();
        setSelectedTasks([]);
        setSearchQuery('');
        await mutateTasks();
        await mutateMilestoneTasks();
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      console.error('error added milestone:', error);
    }
  };

  return (
    <>
      <Dialog
        fullWidth
        maxWidth="sm"
        open={open}
        sx={{
          '& .MuiDialog-paper': {
            height: 'inherit',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
        onClose={handleCloseDialog}
        {...other}
      >
        <DialogTitle>{t('tasks.add_task_milestone')}</DialogTitle>

        <Box sx={{ px: 3 }}>
          <TextField
            fullWidth
            placeholder={t('tasks.search')}
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

        {filteredShared.length > 0 ? (
          <Scrollbar sx={{ height: 70 * 5, px: 3 }}>
            <Box component="ul">
              <Box display="flex" justifyContent="space-between" sx={{ my: 1 }}>
                <Typography variant="subtitle1" noWrap>
                  {t('tasks.heading')}
                </Typography>
                <FormControlLabel
                  label={t("tasks.select_all")}
                  control={
                    <Checkbox
                      checked={
                        filteredShared.length > 0 && selectedTasks.length === filteredShared.length
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTasks(filteredShared);
                        } else {
                          setSelectedTasks([]);
                        }
                      }}
                    />
                  }
                />
              </Box>

              {filteredShared.map((task) => (
                <SelectTaskDetails
                  key={task}
                  task={task}
                  isSelected={selectedTasks?.includes(task)}
                  onToggleTasks={() => onToggleTasks(task)}
                />
              ))}
            </Box>
          </Scrollbar>
        ) : (
          <Box sx={{ px: 3, py: 2 }}>
            <Typography variant="body2" color="textSecondary">
              {t('tasks.no_tasks_found')}
            </Typography>
          </Box>
        )}

        <DialogActions>
          <Button variant="contained" onClick={handleCloseDialog}>
            {t('tasks.cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={handleAddDetail}
            sx={{ bgcolor: '#006A67' }}
            disabled={selectedTasks.length === 0}
          >
            {t('tasks.add')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export function SelectTaskDetails({ task, isSelected, onToggleTasks }) {
  const { descriptionStr } = useMemo(() => {
    let fullDescription = task?.description || '';
    try {
      const parsedDescription = JSON.parse(task?.description);
      if (parsedDescription && parsedDescription.TranscriptStr) {
        fullDescription = parsedDescription.TranscriptStr;
      }
    } catch (e) {}
    const descriptionStr = fullDescription;

    return {
      descriptionStr,
    };
  }, [task?.description]);

  return (
    <Box component="li" sx={{ display: 'flex', alignItems: 'center', py: 0.5 }}>
      <ListItemText
        secondary={
          <>
            <div>
              <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{descriptionStr}</span>
              <br />
              <span style={{ fontSize: '0.75rem' }}>
                Id : {String(task?.serial).padStart(5, '0')}
              </span>
              <br />
              <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                Start Date:{' '}
                {task?.startDate
                  ? `${fDate(task.startDate)}, ${fTime(task.startDate)}`
                  : 'Not Available'}
              </span>
              <span style={{ margin: '0 2px' }}> , </span>

              <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                End Date:{' '}
                {task?.endDate ? `${fDate(task.endDate)}, ${fTime(task.endDate)}` : 'Not Available'}
              </span>
              <br />
              <span style={{ fontSize: '0.75rem' }}>
                Actual Start Date:{' '}
                {task?.actualStartDate
                  ? `${fDate(task.actualStartDate)}, ${fTime(task.actualStartDate)}`
                  : 'Not Available'}
              </span>
              <span style={{ margin: '0 2px' }}> , </span>

              <span style={{ fontSize: '0.7rem' }}>
                Actual End Date:{' '}
                {task?.actualEndDate
                  ? `${fDate(task.actualEndDate)}, ${fTime(task.actualEndDate)}`
                  : 'Not Available'}
              </span>
              <br />

              <span style={{ fontSize: '0.7rem' }}>
                Category: {task?.categoryName?.value || 'Not Available'}
              </span>
              <span style={{ margin: '0 2px' }}> , </span>
              <span style={{ fontSize: '0.7rem' }}>
                Priority: {task?.priorityName?.value || 'Low'}
              </span>
            </div>
          </>
        }
        primaryTypographyProps={{ noWrap: true, typography: 'subtitle2' }}
        secondaryTypographyProps={{ noWrap: true, component: 'span', mb: 1 }}
        sx={{ flexGrow: 1, pr: 1 }}
      />
      <Checkbox checked={isSelected} onChange={onToggleTasks} />
    </Box>
  );
}
