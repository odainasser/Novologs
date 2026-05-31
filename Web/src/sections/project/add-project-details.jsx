import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';

import Typography from '@mui/material/Typography';
import { Scrollbar } from 'src/components/scrollbar';

import { toast } from 'src/components/snackbar';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import Card from '@mui/material/Card';
import { Divider } from '@mui/material';
import { useMockedUser } from 'src/auth/hooks';
import Switch from '@mui/material/Switch';
import { useTranslation } from 'react-i18next';
import FormControlLabel from '@mui/material/FormControlLabel';
import { Iconify } from 'src/components/iconify';
import { useDateRangePicker, CustomDateRangePicker } from 'src/components/custom-date-range-picker';
import { fDate } from 'src/utils/format-time';
import dayjs from 'dayjs';
import Stack from '@mui/material/Stack';
import DialogContent from '@mui/material/DialogContent';
import { Form, Field, schemaHelper } from 'src/components/hook-form';

import { useForm, Controller } from 'react-hook-form';
import { departments } from 'src/sections/project/project-mock-data';
import { MenuItem } from '@mui/material';
import { Chip, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { getGoals, getInitiatives, getTaskTypes } from 'src/actions/project/projectActions';
import { getClients } from 'src/actions/client/clientActions';
import { Autocomplete } from '@mui/material';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
// ----------------------------------------------------------------------

export function AddProjectDetails({
  open,
  onClose,
  handleClose,
  mode,
  addNewDetails,
  goal,
  setGoal,
  projectInitiative,
  setProjectInitiative,
  clientName,
  setClientName,
  projectDescription,
  setProjectDescription,
  taskModules,
  setTaskModules,
  taskTypes,
  setTaskTypes,
  selectedTaskTypes,
  setSelectedTaskTypes,
  projectMilestone,
  setProjectMilestone,
  projectDepartments,
  isMission,

  ...other
}) {
  const { t, i18n } = useTranslation('dashboard/projects');
  const storedLang = localStorage.getItem('selectedLang');

  const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
  const checkedIcon = <CheckBoxIcon fontSize="small" />;

  const { goalList, goalListEmpty } = getGoals();
  const { initiativeList, initiativeListEmpty } = getInitiatives();
  const { clientList, clientListEmpty } = getClients();
  const { taskTypeList, taskTypeListEmpty } = getTaskTypes();

  const handleCloseDetailsDialog = () => {
    handleClose();
  };

  const methods = useForm({
    mode: 'onSubmit',
  });

  const {
    reset,
    watch,
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;
  const onSubmit = handleSubmit(async (data) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      reset();
      toast.success(
        currentUser ? t('projects.toast.update_success') : t('projects.toast.create_success')
      );
      console.info('DATA', data);
    } catch (error) {
      console.error(error);
    }
  });
  const handleAddDetail = () => {
    const detail = {
      goal: goal,
      projectInitiative: projectInitiative,
      projectMilestone: projectMilestone,
      clientName: clientName,
      projectDescription: projectDescription,
      taskTypes: taskTypes,
      taskModules: taskModules,
    };
    console.log('this is the details', detail);
    addNewDetails(detail);
    handleCloseDetailsDialog();
  };
  const [taskType, setTaskType] = useState('');

  const handleAddTaskType = () => {
    const trimmed = taskType.trim();
    if (trimmed && !taskTypes.includes(trimmed)) {
      setTaskTypes([...taskTypes, trimmed]);
    }
    setTaskType('');
  };

  console.log('this is the tasktypes', taskTypes);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTaskType();
    }
  };

  const handleDelete = (chipToDelete) => {
    setTaskTypes((prev) => prev.filter((t) => t !== chipToDelete));
  };

  const [taskModule, setTaskModule] = useState('');

  const handleAddTaskModule = () => {
    const trimmed = taskModule.trim();
    if (trimmed && !taskModules.includes(trimmed)) {
      setTaskModules([...taskModules, trimmed]);
    }
    setTaskModule('');
  };

  const handleKeyDownModule = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTaskModule();
    }
  };

  const handleDeleteModule = (chipToDelete) => {
    setTaskModules((prev) => prev.filter((t) => t !== chipToDelete));
  };
  const handleGoalChange = (event) => {
    setGoal(event.target.value);
  };

  const handleInitiativeChange = (event) => {
    setProjectInitiative(event.target.value);
  };
  const handleMilestoneChange = (event) => {
    setProjectMilestone(event.target.value);
  };

  const handleClientChange = (event) => {
    setClientName(event.target.value);
  };
  const handleDescriptionChange = (event) => {
    setProjectDescription(event.target.value);
  };
  return (
    <>
      <Form methods={methods} onSubmit={onSubmit}>
        <Dialog
          fullWidth
          maxWidth={mode === 'add' ? 'md' : 'md'}
          open={open}
          onClose={handleCloseDetailsDialog}
          dir={storedLang === 'ar' ? 'rtl' : 'ltr'}
          {...other}
        >
          <DialogTitle>
            {mode === 'add'
              ? isMission
                ? t('projects.add_mission_details')
                : t('projects.add_project_details')
              : isMission
                ? t('projects.edit_mission_details')
                : t('projects.edit_project_details')}
          </DialogTitle>

          <DialogContent>
            {' '}
            {!isMission && (
              <>
                <Box display="flex" justifyContent="center" gap={1}>
                  {' '}
                  <TextField
                    select
                    fullWidth
                    label={t('projects.project_goals')}
                    sx={{ mt: 1 }}
                    value={goal}
                    onChange={handleGoalChange}
                  >
                    {goalListEmpty ? (
                      <MenuItem value="">{t('projects.no_goals_available')}</MenuItem>
                    ) : (
                      goalList?.goals.map((goal) => (
                        <MenuItem key={goal.id} value={goal.id}>
                          {storedLang === 'ar'
                            ? goal.name?.localizedStrings[0]?.value
                            : goal.name.value}
                        </MenuItem>
                      ))
                    )}
                  </TextField>
                  <TextField
                    select
                    fullWidth
                    label={t('projects.project_settings.tabs.initiative')}
                    sx={{ mt: 1 }}
                    value={projectInitiative}
                    onChange={handleInitiativeChange}
                  >
                    {initiativeListEmpty ? (
                      <MenuItem value="">
                        {t('projects.project_details.tabs.no_initiative')}
                      </MenuItem>
                    ) : (
                      initiativeList?.initiatives.map((initiative) => (
                        <MenuItem key={initiative.id} value={initiative.id}>
                          {storedLang === 'ar'
                            ? initiative.name?.localizedStrings[0]?.value
                            : initiative.name.value}
                        </MenuItem>
                      ))
                    )}
                  </TextField>
                </Box>

                <Box display="flex" justifyContent="center" gap={1}>
                  {/* <TextField
                    select
                    fullWidth
                    label="Project Milestone"
                    sx={{ mt: 1 }}
                    value={projectMilestone}
                    onChange={handleMilestoneChange}
                  >
                    <MenuItem value="">No milestones available</MenuItem>
                  </TextField> */}
                  <TextField
                    select
                    fullWidth
                    label={t('projects.project_details.tabs.client')}
                    sx={{ mt: 1 }}
                    value={clientName}
                    onChange={handleClientChange}
                  >
                    {clientListEmpty ? (
                      <MenuItem value="">{t('projects.no_clients_available')}</MenuItem>
                    ) : (
                      clientList?.clients.map((client) => (
                        <MenuItem key={client.id} value={client.id}>
                          {client.name}
                        </MenuItem>
                      ))
                    )}
                  </TextField>
                </Box>
              </>
            )}
            {/* <Box display="flex" justifyContent="center" gap={1}>
              <Autocomplete
                multiple
                fullWidth
                disableCloseOnSelect
                options={taskTypeList?.taskTypes || []}
                getOptionLabel={(option) => option.name.value}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                value={selectedTaskTypes}
                onChange={(event, newValue) => {
                  setSelectedTaskTypes(newValue);
                  setTaskTypes(newValue.map((item) => item.id));
                }}
                renderOption={(props, option, { selected }) => (
                  <li {...props}>
                    <Checkbox
                      icon={icon}
                      checkedIcon={checkedIcon}
                      style={{ marginRight: 8 }}
                      checked={selected}
                      sx={{
                        marginRight: 1,
                        '&.Mui-checked': {
                          color: '#006A67',
                        },
                      }}
                    />
                    {option.name.value}
                  </li>
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="contained"
                      label={option.name.value}
                      {...getTagProps({ index })}
                      key={option.id}
                      sx={{ bgcolor: '#006A67', color: 'white' }}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField {...params} label={t("projects.project_details.tabs.task_types")}  placeholder={t("projects.project_details.tabs.select_task_types")} />
                )}
                sx={{ mt: 1 }}
              />


            </Box> */}
            <TextField
              autoFocus
              margin="dense"
              label={
                isMission ? t('projects.mission_description') : t('projects.project_description')
              }
              type="text"
              fullWidth
              multiline
              rows={3}
              sx={{ mt: 2 }}
              value={projectDescription}
              onChange={handleDescriptionChange}
            />
          </DialogContent>

          <DialogActions>
            <Button
              variant="contained"
              onClick={handleCloseDetailsDialog}
              sx={{
                ...(storedLang === 'ar' && { ml: 1 }),
              }}
            >
              {t('projects.cancel')}
            </Button>
            <Button variant="contained" onClick={handleAddDetail}>
              {mode === 'add' ? t('projects.add') : t('projects.save')}
            </Button>
          </DialogActions>
        </Dialog>
      </Form>
    </>
  );
}
