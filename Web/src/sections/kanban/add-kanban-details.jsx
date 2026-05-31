import { useState, useEffect, useMemo } from 'react';
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
import { task_variant, task_type, mission_task_type } from 'src/sections/kanban/kanban-mock-data';
import { MenuItem } from '@mui/material';
import { Chip, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import {
  projects,
  projectTaskTypes,
  projectModules,
  projectMilestones,
  projectMissions,
} from 'src/sections/project/project-mock-data';
import {
  mock_clients,
  clientTaskTypes,
  vendorTaskTypes,
  mock_vendors,
  businessLeads,
  contracts,
} from 'src/sections/client/client-mock-data';
import { getProjects } from 'src/actions/project/projectActions';
import { getClients, getLeads } from 'src/actions/client/clientActions';
import { getVendors, getContracts } from 'src/actions/vendor/vendorActions';
import { getTasks } from 'src/actions/task/taskActions';
import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

export function AddKanbanDetails({
  open,
  onClose,
  handleClose,
  mode,
  addNewDetails,
  variant,
  setVariant,
  projectName,
  setProjectName,
  missionName,
  setMissionsName,
  businessLead,
  setBusinessLead,
  clientName,
  setClientName,
  vendorName,
  setVendorName,
  taskModules,
  setTaskModules,
  taskTypes,
  setTaskTypes,
  projectMilestone,
  setProjectMilestone,
  contract,
  setContract,
  isSubTask,
  isTimeSheetView,
  isProject,
  isClient,
  isLead,
  categoryList,
  categoryListEmpty,
  taskId,
  setTaskId,
  taskName,
  setTaskName,
  isClientView,
  ...other
}) {
  const { t, i18n } = useTranslation('dashboard/tasks');
  const storedLang = localStorage.getItem('selectedLang');
  const { zetaUser } = useAuthContext();

  const handleCloseDetailsDialog = () => {
    handleClose();
  };
  const { projectList } = getProjects();
  const clientVendorPayload = {
    pagination: {
      pageNumber: 1,
      pageSize: 200,
    },
  };
  clientVendorPayload.search = {
    fieldName: 'CreatorId',
    fieldValue: zetaUser?.id,
    operator: 0,
    logicOperator: 0,
  };
  const { clientList, clientListEmpty } = getClients(clientVendorPayload);
  const { leadList, leadListEmpty } = getLeads(clientName || null);
  const { contractList, contractListEmpty } = getContracts(vendorName || null);

  const { vendorList, vendorListEmpty } = getVendors(clientVendorPayload);
  const userProjects =
    projectList?.projects?.filter(
      (p) =>
        p.type === 1 &&
        (p.creatorId === zetaUser?.id || p.projectMembers?.some((m) => m.memberId === zetaUser?.id))
    ) || [];

  const userMissions =
    projectList?.projects?.filter(
      (p) =>
        p.type === 0 &&
        (p.creatorId === zetaUser?.id || p.projectMembers?.some((m) => m.memberId === zetaUser?.id))
    ) || [];
  useEffect(() => {
    if (variant === 'Project') {
      if (!projectName && projectList?.projects && userProjects.length > 0) {
        setProjectName(userProjects[0].id);
      }
    } else if (variant === 'Mission') {
      if (!missionName && projectList?.projects && userMissions.length > 0) {
        setMissionsName(userMissions[0].id);
      }
    } else if (variant === 'Client') {
      if (!clientName && clientList?.clients && clientList.clients.length > 0) {
        const defaultClient = clientList.clients[0];
        if (defaultClient) {
          setClientName(defaultClient.id);
        }
      }
    } else if (variant === 'Vendor') {
      if (!vendorName && vendorList?.vendors && vendorList.vendors.length > 0) {
        const defaultVendor = vendorList.vendors[0];
        if (defaultVendor) {
          setVendorName(defaultVendor.id);
        }
      }
    }
  }, [
    variant,
    projectName,
    projectList,
    setProjectName,
    missionName,
    setMissionsName,
    clientName,
    clientList,
    setClientName,
    vendorName,
    vendorList,
    setVendorName,
    zetaUser,
  ]);

  const payloadForGetTasks = useMemo(() => {
    if (!isTimeSheetView) {
      return undefined;
    }

    const baseParams = {
      creatFilter: 1,
      pagination: {
        pageNumber: 1,
        pageSize: 100,
      },
    };

    if (variant === 'General') {
      return baseParams;
    }

    if (variant === 'Project') {
      if (!projectName) return undefined;
      return { ...baseParams, controlEntity: 2, controlEntityId: projectName };
    }

    if (variant === 'Mission') {
      if (!missionName) return undefined;
      return { ...baseParams, controlEntity: 2, controlEntityId: missionName };
    }

    if (variant === 'Client') {
      if (!clientName) return undefined;
      return { ...baseParams, controlEntity: 4, controlEntityId: clientName };
    }

    if (variant === 'Vendor') {
      if (!vendorName) return undefined;

      return { ...baseParams, controlEntity: 6, controlEntityId: vendorName };
    }

    return undefined;
  }, [
    isTimeSheetView,
    variant,
    projectName,
    missionName,
    clientName,
    businessLead,
    vendorName,
    contract,
    vendorListEmpty,
  ]);

  const {
    taskList,
    taskListLoading,
    taskListError,
    taskListValidating,
    taskListEmpty: rawTaskListEmpty,
    mutate: localListMutate,
  } = getTasks(payloadForGetTasks);

  const displayedTasks = useMemo(() => {
    if (!taskList || !taskList.tasks) {
      return [];
    }
    if (variant === 'General') {
      return taskList.tasks.filter(
        (task) =>
          !task.projectId &&
          !task.vendorContractId &&
          !task.vendorId &&
          !task.clientLeadId &&
          !task.clientId
      );
    }

    return taskList.tasks;
  }, [taskList, variant]);

  const taskListEmpty = displayedTasks.length === 0;

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
      toast.success(currentUser ? t('tasks.toast.delete_sucess') : t('tasks.toast.create_success'));
      console.info('DATA', data);
    } catch (error) {
      console.error(error);
    }
  });
  const handleAddDetail = () => {
    const detail = {
      variant: variant,
      projectName: projectName,
      projectMilestone: projectMilestone,
      clientName: clientName,
      taskTypes: taskTypes,
      taskModules: taskModules,
      vendorName: vendorName,
      businessLead: businessLead,
      missionName: missionName,
      contract: contract,
    };
    console.log('this is the details', detail);
    addNewDetails(detail);
    handleCloseDetailsDialog();
  };

  const handleVariantChange = (event) => {
    setVariant(event.target.value);
    if (taskId) {
      setTaskName('');
    }
  };

  const handleProjectNameChange = (event) => {
    setProjectName(event.target.value);
  };

  const handleMilestoneChange = (event) => {
    setProjectMilestone(event.target.value);
  };

  const handleClientChange = (event) => {
    setClientName(event.target.value);
  };
  const handleVendorNameChange = (event) => {
    setVendorName(event.target.value);
  };
  const handleTaskTypeChange = (event) => {
    setTaskTypes(event.target.value);
  };

  const handleTaskModuleChange = (event) => {
    setTaskModules(event.target.value);
  };
  const handleMissionChange = (event) => {
    setMissionsName(event.target.value);
  };

  const handleBusinessLeadChange = (event) => {
    setBusinessLead(event.target.value);
  };
  const handleContractChange = (event) => {
    setContract(event.target.value);
  };

  const handleTaskChange = (event) => {
    const selectedId = event.target.value;
    setTaskId(selectedId);

    const selectedTask = displayedTasks.find((task) => task.id === selectedId);

    setTaskName(selectedTask ? selectedTask.description : '');
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
          {(isProject || isClient || isLead || isSubTask) && (
            <DialogTitle>{t('tasks.add_task_details')}</DialogTitle>
          )}
          {!isProject && !isClient && !isLead && !isSubTask && (
            <DialogTitle>
              {mode === 'timeSheet'
                ? t('tasks.add_timesheet_details')
                : mode === 'add'
                  ? t('tasks.add_task_details')
                  : t('tasks.edit_task_details')}
            </DialogTitle>
          )}

          <DialogContent>
            {' '}
            <Box display="flex" justifyContent="center" gap={1}>
              {' '}
              {!isClient && !isLead && (
                <TextField
                  select
                  fullWidth
                  label={t('tasks.task_type')}
                  sx={{ mt: 1 }}
                  value={variant}
                  onChange={handleVariantChange}
                  disabled={mode === 'edit' || isSubTask || isProject || isClient || isLead}
                >
                  {task_variant?.map((type) => (
                    <MenuItem key={type.id} value={type.name}>
                      {type.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
              {variant === 'Project' && (
                <TextField
                  select
                  fullWidth
                  label={t('tasks.projects')}
                  sx={{ mt: 1 }}
                  value={projectName}
                  onChange={handleProjectNameChange}
                  disabled={mode === 'edit' || isSubTask || isProject || isClient || isLead}
                >
                  {userProjects.length === 0 ? (
                    <MenuItem value="">{t('tasks.no_projects')}</MenuItem>
                  ) : (
                    userProjects.map((project) => (
                      <MenuItem key={project.id} value={project.id}>
                        {project.name}
                      </MenuItem>
                    ))
                  )}
                </TextField>
              )}
              {variant === 'Mission' && (
                <TextField
                  select
                  fullWidth
                  label={t('tasks.mission')}
                  sx={{ mt: 1 }}
                  value={missionName}
                  onChange={handleMissionChange}
                  disabled={mode === 'edit' || isSubTask || isProject || isClient || isLead}
                >
                  {userMissions.length === 0 ? (
                    <MenuItem value="">{t('tasks.no_missions')}</MenuItem>
                  ) : (
                    userMissions.map((project) => (
                      <MenuItem key={project.id} value={project.id}>
                        {project.name}
                      </MenuItem>
                    ))
                  )}
                </TextField>
              )}
              {variant === 'Client' && (
                <TextField
                  select
                  fullWidth
                  label={t('tasks.client')}
                  sx={{ mt: 1 }}
                  value={clientName}
                  onChange={handleClientChange}
                  disabled={mode === 'edit' || isSubTask || isProject || isClient || isLead}
                >
                  {clientListEmpty ? (
                    <MenuItem value="">{t('tasks.no_clients')}</MenuItem>
                  ) : (
                    clientList?.clients.map((client) => (
                      <MenuItem key={client.id} value={client.id}>
                        {client.name}
                      </MenuItem>
                    ))
                  )}
                </TextField>
              )}
              {variant === 'Vendor' && (
                <TextField
                  select
                  fullWidth
                  label={t('tasks.vendor')}
                  sx={{ mt: 1 }}
                  value={vendorName}
                  onChange={handleVendorNameChange}
                  disabled={mode === 'edit' || isSubTask || isProject || isClient || isLead}
                >
                  {vendorListEmpty ? (
                    <MenuItem value="">{t('tasks.no_vendors')}</MenuItem>
                  ) : (
                    vendorList?.vendors.map((vendor) => (
                      <MenuItem key={vendor.id} value={vendor.id}>
                        {vendor.name}
                      </MenuItem>
                    ))
                  )}
                </TextField>
              )}
            </Box>
            <Box display="flex" justifyContent="center" gap={1} sx={{ mt: 2 }}>
              {' '}
              {mode !== 'timeSheet' && (
                <TextField
                  select
                  fullWidth
                  label={t('tasks.task_category')}
                  sx={{ mt: 1 }}
                  value={taskTypes}
                  onChange={handleTaskTypeChange}
                >
                  {categoryListEmpty ? (
                    <MenuItem value="">{t('tasks.no_category')}</MenuItem>
                  ) : (
                    categoryList?.categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name.value}
                      </MenuItem>
                    ))
                  )}
                </TextField>
              )}
              {mode === 'timeSheet' && (
                <TextField
                  select
                  fullWidth
                  label={t('tasks.heading')}
                  sx={{ mt: 1 }}
                  value={taskId}
                  name={taskName}
                  onChange={handleTaskChange}
                  SelectProps={{
                    MenuProps: {
                      PaperProps: {
                        style: {
                          maxHeight: 300,
                          maxWidth: 100,
                        },
                      },
                    },
                  }}
                >
                  {taskListEmpty ? (
                    <MenuItem value="">No tasks available</MenuItem>
                  ) : (
                    displayedTasks.map(
                      (
                        task // Use displayedTasks
                      ) => (
                        <MenuItem key={task.id} value={task.id} sx={{ alignItems: 'center' }}>
                          {task.description ? (
                            (() => {
                              try {
                                const parsedDescription = JSON.parse(task.description);
                                if (parsedDescription?.TranscriptStr) {
                                  return parsedDescription.TranscriptStr;
                                }
                                return task.description;
                              } catch (e) {
                                return task.description;
                              }
                            })()
                          ) : (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Iconify
                                icon="mdi:play-circle-outline"
                                sx={{ mr: 1, color: 'text.secondary' }}
                              />
                              <Typography variant="body2" component="span">
                                {task.audioFileId}
                              </Typography>
                            </Box>
                          )}
                        </MenuItem>
                      )
                    )
                  )}
                </TextField>
              )}
              {/* {variant === 'Project' && (
                <TextField
                  select
                  fullWidth
                  label="Task Category"
                  sx={{ mt: 1 }}
                  value={taskTypes}
                  onChange={handleTaskTypeChange}
                >
                  {projectTaskTypes?.map((type) => (
                    <MenuItem key={type.id} value={type.name}>
                      {type.name}
                    </MenuItem>
                  ))}
                </TextField>
              )} */}
              {/* {variant === 'Mission' && (
                <TextField
                  select
                  fullWidth
                  label={t("tasks.mission")}
                  sx={{ mt: 1 }}
                  value={taskTypes}
                  onChange={handleTaskTypeChange}
                >
                  {mission_task_type?.map((type) => (
                    <MenuItem key={type.id} value={type.name}>
                      {type.name}
                    </MenuItem>
                  ))}
                </TextField>
              )} */}
              {variant === 'Client' && (
                <TextField
                  select
                  fullWidth
                  label={t('tasks.lead')}
                  sx={{ mt: 1 }}
                  value={businessLead}
                  onChange={handleBusinessLeadChange}
                  disabled={mode === 'edit' || isSubTask || isProject || isClient || isLead}
                >
                  {leadListEmpty ? (
                    <MenuItem value="">{t('tasks.no_leads')}</MenuItem>
                  ) : (
                    [
                      <MenuItem key="none-lead" value="">
                        <em>{t('tasks.none')}</em>
                      </MenuItem>,
                      ...leadList.leads.map((lead) => (
                        <MenuItem key={lead.id} value={lead.id}>
                          {lead.name}
                        </MenuItem>
                      )),
                    ]
                  )}
                </TextField>
              )}
              {variant === 'Vendor' && (
                <TextField
                  select
                  fullWidth
                  label={t('tasks.contract')}
                  sx={{ mt: 1 }}
                  value={contract}
                  onChange={handleContractChange}
                  disabled={mode === 'edit' || isSubTask || isProject || isClient || isLead}
                >
                  {contractListEmpty ? (
                    <MenuItem value="">{t('tasks.no_contracts')}</MenuItem>
                  ) : (
                    [
                      <MenuItem key="none-contract" value="">
                        <em>{t('tasks.none')}</em>
                      </MenuItem>,
                      ...contractList.contracts.map((contract) => (
                        <MenuItem key={contract.id} value={contract.id}>
                          {contract.name}
                        </MenuItem>
                      )),
                    ]
                  )}
                </TextField>
              )}
              {/* {variant === 'Vendor' && (
                <TextField
                  select
                  fullWidth
                  label={t("tasks.contract")}
                  sx={{ mt: 1 }}
                  value={taskTypes}
                  onChange={handleTaskTypeChange}
                >
                  {vendorTaskTypes?.map((type) => (
                    <MenuItem key={type.id} value={type.name}>
                      {type.name}
                    </MenuItem>
                  ))}
                </TextField>
              )} */}
              {/* {variant === 'Project' && (
                <TextField
                  select
                  fullWidth
                  label={t("tasks.project_module")}
                  sx={{ mt: 1 }}
                  value={taskModules}
                  onChange={handleTaskModuleChange}
                >
                  {projectModules?.map((module) => (
                    <MenuItem key={module.id} value={module.name}>
                      {module.name}
                    </MenuItem>
                  ))}
                </TextField>
              )} */}
              {/* {variant === 'Client' && (
                <TextField
                  select
                  fullWidth
                  label={t("tasks.client_task_type")}
                  sx={{ mt: 1 }}
                  value={taskTypes}
                  onChange={handleTaskTypeChange}
                >
                  {clientTaskTypes?.map((type) => (
                    <MenuItem key={type.id} value={type.name}>
                      {type.name}
                    </MenuItem>
                  ))}
                </TextField>
              )} */}
            </Box>
            {/* {variant === 'Project' && (
              <TextField
                select
                fullWidth
                label={t("tasks.project_milestone")}
                sx={{ mt: 2 }}
                value={projectMilestone}
                onChange={handleMilestoneChange}
              >
                {projectMilestones?.map((milestone) => (
                  <MenuItem key={milestone.id} value={milestone.name}>
                    {milestone.name}
                  </MenuItem>
                ))}
              </TextField>
            )} */}
          </DialogContent>

          <DialogActions>
            <Button
              variant="contained"
              onClick={handleCloseDetailsDialog}
              sx={{
                ...(storedLang === 'ar' && { ml: 1 }),
              }}
            >
              {t('tasks.todo.cancel')}
            </Button>
            <Button variant="contained" onClick={handleAddDetail} sx={{ bgcolor: '#006A67' }}>
              {mode === 'add' || mode === 'timeSheet'
                ? t('tasks.members-a.add_button')
                : t('tasks.save')}
            </Button>
          </DialogActions>
        </Dialog>
      </Form>
    </>
  );
}
