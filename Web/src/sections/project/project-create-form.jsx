'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormContext } from 'react-hook-form';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import { MenuItem, TextField } from '@mui/material';
import AvatarGroup from '@mui/material/AvatarGroup';
import CircularProgress from '@mui/material/CircularProgress';

import { addProject } from 'src/actions/project/projectActions';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Field } from 'src/components/hook-form';

import { AddProjectColor } from './add-project-color';
import { AddMemberDetails } from './add-member-details';
import { AddProjectDetails } from './add-project-details';
import Autocomplete from '@mui/material/Autocomplete';

export function ProjectCreateForm({
  setTableData,
  projectDepartments,
  mutate,
  allUsers,
  isMission,
  isTicket,
}) {
  const { t, i18n } = useTranslation('dashboard/projects');
  const storedLang = localStorage.getItem('selectedLang');

  const [mode, setMode] = useState('add');
  const rhfMethods = useFormContext();

  const getDepartmentPath = (department, allDepartments) => {
    const parent = allDepartments.find((d) => d.id === department.parentDepartmentId);
    if (!parent) return department.name.value;
    return `${getDepartmentPath(parent, allDepartments)} / ${department.name.value}`;
  };

  const setValue = rhfMethods ? rhfMethods.setValue : null;
  const [newProject, setNewProject] = useState({
    code: '',
    name: '',
    projectColor: '',
    departmentId: '',
    startDate: '',
    endDate: '',
  });

  const [taskModules, setTaskModules] = useState([]);
  const [selectedTaskTypes, setSelectedTaskTypes] = useState([]);

  const [taskTypes, setTaskTypes] = useState([]);
  console.log('this is the taskTypes', taskTypes);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addNewProject = async (newProject) => {
    if (isSubmitting) return;

    let hasError = false;

    if (!newProject.name || !newProject.name.trim()) {
      setNameError(t('projects.toast.required'));
      hasError = true;
    } else {
      setNameError('');
    }

    if (!isTicket) {
      if (!newProject.code || !newProject.code.trim()) {
        setIdError(t('projects.toast.required'));
        hasError = true;
      } else {
        setIdError('');
      }
    } else {
      setIdError('');
    }

    if (hasError) {
      return;
    }
    setIsSubmitting(true);

    newProject.color = projectColor;
    newProject.goalId = goal;
    newProject.initiativeId = projectInitiative;
    newProject.projectMilestone = projectMilestone;
    newProject.description = projectDescription;
    newProject.clientId = clientName;
    newProject.taskTypeIds = taskTypes;
    newProject.modules = taskModules;
    newProject.members = selectedPersons;
    newProject.owners = selectedOwners;
    const memberIds = [
      ...selectedOwners.map((owner) => ({
        memberId: owner.id,
        isOwner: true,
      })),
      ...selectedPersons.map((member) => ({
        memberId: member.id,
        isOwner: false,
      })),
    ];

    newProject.memberList = memberIds;
    // newProject.isMission = isMission;
    newProject.type = isMission ? 0 : isTicket ? 2 : 1;

    console.log('this is the new project', newProject);

    try {
      const response = await addProject(newProject);
      if (response.success) {
        if (isMission) {
          toast.success(t('projects.toast.mission_add'));
        }
        if (isTicket) {
          toast.success(t('projects.toast.ticket_added'));
        } else {
          toast.success(t('projects.toast.project_added'));
        }
        setTableData((prevData) => [newProject, ...prevData]);
        setNewProject({
          code: '',
          name: '',
          projectColor: '',
          departmentId: '',

          startDate: '',
          endDate: '',
        });
        if (setValue) {
          setValue('startDate', '', { shouldValidate: false, shouldDirty: false });
          setValue('endDate', '', { shouldValidate: false, shouldDirty: false });
        }

        setGoal('');
        setProjectInitiative('');
        setProjectMilestone('');
        setProjectDescription('');
        setSelectedPersons([]);
        setProjectColor('');
        setSelectedOwners([]);
        setTaskModules([]);
        setTaskTypes([]);
        setSelectedTaskTypes([]);
        setClientName('');
        setNameError('');
        setIdError('');
        await mutate();
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      console.error('Add project failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearField = () => {
    setNewProject({
      code: '',
      name: '',
      projectColor: '',
      departmentId: '',

      startDate: '',
      endDate: '',
    });
    if (setValue) {
      setValue('startDate', '', { shouldValidate: false, shouldDirty: false });
      setValue('endDate', '', { shouldValidate: false, shouldDirty: false });
    }
    setGoal('');
    setProjectInitiative('');
    setProjectMilestone('');
    setProjectDescription('');
    setClientName('');
    setNameError('');
    setIdError('');
    setSelectedPersons([]);
    setSelectedOwners([]);
    setTaskModules([]);
    setTaskTypes([]);
    setSelectedTaskTypes([]);
    setProjectColor('');
  };

  const [details, setDetails] = useState(false);

  const [openColor, setOpenColor] = useState(false);
  const [projectColor, setProjectColor] = useState('');

  const handleOpenDetails = () => {
    setDetails(true);
  };
  const handleDetailsDialogClose = () => {
    setTimeout(() => {
      setDetails(false);
    }, 100);
  };

  const handleOpenColor = () => {
    setOpenColor(true);
  };
  const handleColorDialogClose = () => {
    setTimeout(() => {
      setOpenColor(false);
    }, 100);
  };

  const [goal, setGoal] = useState('');
  const [projectInitiative, setProjectInitiative] = useState('');
  const [clientName, setClientName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectMilestone, setProjectMilestone] = useState('');

  const addNewDetails = (details) => {
    details.goal = goal;
    details.projectInitiative = projectInitiative;
    details.projectMilestone = projectMilestone;
    details.projectDescription = projectDescription;
    details.clientName = clientName;
  };
  const [nameError, setNameError] = useState('');
  const [idError, setIdError] = useState('');

  const handleNameIdChange = (e) => {
    setNewProject({ ...newProject, code: e.target.value });
    setIdError('');
  };

  const handleNameInputChange = (e) => {
    setNewProject({ ...newProject, name: e.target.value });
    setNameError('');
  };
  const handleStartDateChange = (newDate) => {
    setNewProject({ ...newProject, startDate: newDate });
  };
  const handleEndDateChange = (newDate) => {
    setNewProject({ ...newProject, endDate: newDate });
  };

  const [isOwner, setIsOwner] = useState(false);

  const [selectedOwners, setSelectedOwners] = useState([]);

  const [selectedPersons, setSelectedPersons] = useState([]);

  const [members, setMembers] = useState(false);
  const [owners, setOwners] = useState(false);

  const handleTogglePerson = (person) => {
    setSelectedPersons((prevSelected) => {
      const isAlreadySelected = prevSelected.some((p) => p.id === person.id);
      if (isAlreadySelected) {
        return prevSelected.filter((p) => p.id !== person.id);
      }
      return [...prevSelected, person];
    });
  };
  const handleToggleOwner = (person) => {
    setSelectedOwners((prevSelected) => {
      const isAlreadySelected = prevSelected.some((p) => p.id === person.id);
      if (isAlreadySelected) {
        return prevSelected.filter((p) => p.id !== person.id);
      }
      return [...prevSelected, person];
    });
  };

  const handleOpenMembers = () => {
    setMembers(true);
  };
  const handleMemberDialogClose = () => {
    setTimeout(() => {
      setMembers(false);
    }, 100);
  };
  const handleOpenOwners = () => {
    setOwners(true);
  };
  const handleOwnerDialogClose = () => {
    setTimeout(() => {
      setOwners(false);
    }, 100);
  };
  const filteredMembers = allUsers?.filter(
    (member) => !selectedOwners.some((owner) => owner.id === member.id)
  );

  const filteredOwners = allUsers?.filter(
    (member) => !selectedPersons.some((person) => person.id === member.id)
  );

  return (
    <>
      <TableRow>
        <TableCell
          sx={{
            borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
          }}
          align="center"
        />

        <TableCell
          sx={{
            borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
          }}
          align="center"
        />

        <TableCell
          sx={{
            borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
          }}
        >
          <TextField
            fullWidth
            variant="outlined"
            label={
              <span>
                {t('projects.table.code')} <span style={{ color: 'red' }}>*</span>
              </span>
            }
            value={newProject.code || ''}
            onChange={handleNameIdChange}
            sx={{
              '& .MuiInputBase-input': {
                padding: '9px 14px',
              },
              '& .MuiInputLabel-root': {
                top: '-5px',
                fontSize: '10px',
              },
            }}
            error={!!idError}
            helperText={idError}
          />
        </TableCell>

        {/* {isTicket && (
          <TableCell
            sx={{
              borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
            }}
          ></TableCell>
        )} */}

        <TableCell
          sx={{
            borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
          }}
        />

        <TableCell
          sx={{
            borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
          }}
        >
          <Box display="flex" gap={1} alignItems="center">
            {!isTicket && (
              <>
                {!projectColor ? (
                  <Tooltip
                    title={
                      isMission
                        ? t('projects.missions.add_mission_color')
                        : t('projects.tooltip.add_project_color')
                    }
                    arrow
                  >
                    <IconButton
                      onClick={() => {
                        setOpenColor(true);
                      }}
                      sx={{ cursor: 'pointer' }}
                    >
                      <Iconify icon="mdi:palette" sx={{ color: '#006A67' }} />
                    </IconButton>
                  </Tooltip>
                ) : (
                  <Box
                    onClick={() => {
                      setOpenColor(true);
                    }}
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      backgroundColor: projectColor,
                      cursor: 'pointer',
                      border: '1px solid #ccc',
                    }}
                  />
                )}
              </>
            )}

            <TextField
              fullWidth
              variant="outlined"
              label={
                <span>
                  {isTicket
                    ? t('projects.table.name')
                    : isMission
                      ? t('projects.missions.mission_name')
                      : t('projects.table.project_name')}{' '}
                  <span style={{ color: 'red' }}>*</span>
                </span>
              }
              value={newProject.name || ''}
              onChange={handleNameInputChange}
              sx={{
                '& .MuiInputBase-input': {
                  padding: '9px 14px',
                },
                '& .MuiInputLabel-root': {
                  top: '-5px',
                  fontSize: '10px',
                },
              }}
              error={!!nameError}
              helperText={nameError}
            />
          </Box>
        </TableCell>

        <TableCell
          sx={{
            borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
          }}
        >
          <Autocomplete
            fullWidth
            options={projectDepartments || []}
            getOptionLabel={(option) => getDepartmentPath(option, projectDepartments)}
            value={projectDepartments.find((d) => d.id === newProject.departmentId) || null}
            onChange={(event, newValue) => {
              setNewProject({
                ...newProject,
                departmentId: newValue ? newValue.id : '',
              });
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label={t('projects.table.department')}
                size="small"
                variant="outlined"
                sx={{
                  '& .MuiInputBase-input': {
                    padding: '9px 14px',
                  },
                  '& .MuiInputLabel-root': {
                    top: '0px',
                    fontSize: '10px',
                  },
                }}
              />
            )}
          />
        </TableCell>

        {!isTicket && (
          <>
            <TableCell
              sx={{
                borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
              }}
            >
              <Field.DatePicker
                name="startDate"
                label={t('projects.table.startDate')}
                sx={{
                  '& .MuiInputBase-input': {
                    padding: '9px 14px',
                  },
                  '& .MuiInputLabel-root': {
                    top: '-5px',
                    fontSize: '10px',
                  },
                }}
                onDateChange={handleStartDateChange}
              />
            </TableCell>

            <TableCell
              sx={{
                borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
              }}
            >
              <Field.DatePicker
                name="endDate"
                label={t('projects.table.endDate')}
                sx={{
                  '& .MuiInputBase-input': {
                    padding: '9px 14px',
                  },
                  '& .MuiInputLabel-root': {
                    top: '-5px',
                    fontSize: '10px',
                  },
                }}
                onDateChange={handleEndDateChange}
              />
            </TableCell>
          </>
        )}

        <TableCell
          sx={{
            borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
          }}
          align="center"
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {selectedOwners.length > 0 && (
              <AvatarGroup sx={{ cursor: 'pointer' }}>
                {selectedOwners.slice(0, 1).map((person) => (
                  <Tooltip key={person?.id} title={`${person?.fullName}`} arrow>
                    <Avatar
                      key={person.id}
                      alt={person.fullName}
                      src={person?.profileImageFileUrl}
                      sx={{ width: 23, height: 23 }}
                    >
                      {!person?.profileImageFileUrl && person?.fullName?.charAt(0).toUpperCase()}
                    </Avatar>
                  </Tooltip>
                ))}
                {selectedOwners.length > 1 && (
                  <Avatar sx={{ width: 23, height: 23 }}>+{selectedOwners.length - 1}</Avatar>
                )}
              </AvatarGroup>
            )}
            <Tooltip
              title={
                selectedOwners.length > 0
                  ? t('projects.missions.change_owners')
                  : t('projects.table.add_owners')
              }
              arrow
            >
              <IconButton
                size="small"
                color="primary"
                onClick={() => {
                  setOwners(true);
                  setIsOwner(true);
                }}
                sx={{
                  width: 18,
                  height: 18,
                  ml: 2,
                  bgcolor: '#006A67',
                  color: 'primary.contrastText',
                  '&:hover': { bgcolor: 'primary.dark' },
                  cursor: 'pointer',
                }}
              >
                <Iconify
                  icon={
                    selectedOwners.length > 0 ? 'mdi:account-edit-outline' : 'mingcute:add-line'
                  }
                />
              </IconButton>
            </Tooltip>
          </Box>
        </TableCell>
        <TableCell
          sx={{
            borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
          }}
          align="center"
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {selectedPersons.length > 0 && (
              <AvatarGroup sx={{ cursor: 'pointer' }}>
                {selectedPersons.slice(0, 1).map((person) => (
                  <Tooltip key={person?.id} title={`${person?.fullName}`} arrow>
                    <Avatar
                      key={person.id}
                      alt={person.fullName}
                      src={person?.profileImageFileUrl}
                      sx={{ width: 23, height: 23 }}
                    >
                      {!person?.profileImageFileUrl && person?.fullName?.charAt(0).toUpperCase()}
                    </Avatar>
                  </Tooltip>
                ))}
                {selectedPersons.length > 1 && (
                  <Avatar sx={{ width: 23, height: 23 }}>+{selectedPersons.length - 1}</Avatar>
                )}
              </AvatarGroup>
            )}
            <Tooltip
              title={
                selectedPersons.length > 0
                  ? t('projects.missions.change_owners')
                  : t('projects.table.add_members')
              }
              arrow
            >
              <IconButton
                size="small"
                color="primary"
                onClick={() => {
                  setMembers(true);
                }}
                sx={{
                  width: 18,
                  height: 18,
                  ml: 2,
                  bgcolor: '#006A67',
                  color: 'primary.contrastText',
                  '&:hover': { bgcolor: 'primary.dark' },
                  cursor: 'pointer',
                }}
              >
                {' '}
                <Iconify
                  icon={
                    selectedPersons.length > 0 ? 'mdi:account-edit-outline' : 'mingcute:add-line'
                  }
                />
              </IconButton>
            </Tooltip>
          </Box>
        </TableCell>
        {!isTicket && (
          <>
            <TableCell
              sx={{
                borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
              }}
              align="center"
            >
              <Tooltip
                title={
                  isMission
                    ? t('projects.missions.add_mission_details')
                    : t('projects.tooltip.add_project_details')
                }
                arrow
              >
                <IconButton
                  onClick={() => {
                    setDetails(true);
                  }}
                >
                  <Iconify icon="mdi:clipboard-text-outline" sx={{ color: '#006A67' }} />
                </IconButton>
              </Tooltip>
            </TableCell>
            <TableCell
              sx={{
                borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
              }}
              align="center"
            />
          </>
        )}

        <TableCell
          align="center"
          sx={{
            ...(storedLang === 'ar' && {
              borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
            }),
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Tooltip
              title={isMission ? t('projects.missions.add_mission') : t('projects.table.save')}
            >
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  if (!isSubmitting) {
                    addNewProject(newProject);
                  }
                }}
                size="small"
                disabled={isSubmitting}
                sx={{
                  color: 'primary.contrastText',
                  '&:hover': { bgcolor: 'primary.dark' },
                  textTransform: 'none',
                  padding: '6px 12px',
                  bgcolor: isSubmitting
                    ? 'grey.500'
                    : !newProject.name ||
                        (!isTicket && (!newProject.code || !newProject.code.trim()))
                      ? 'grey.400'
                      : isSubmitting
                        ? 'grey.500'
                        : '#006A67',
                }}
              >
                {isSubmitting ? (
                  <CircularProgress size={24} sx={{ color: 'primary.contrastText' }} />
                ) : (
                  t('projects.table.save')
                )}
              </Button>
            </Tooltip>
            <Tooltip title={t('projects.table.clear_all')} arrow>
              <Iconify
                icon="mdi:close-circle"
                onClick={() => clearField()}
                sx={{
                  cursor: 'pointer',
                  height: 13,
                  width: 13,
                  color: 'error.main',
                  ...(storedLang === 'ar' ? { mr: 1 } : { ml: 1 }),
                }}
              />
            </Tooltip>
          </Box>
        </TableCell>
      </TableRow>
      <AddMemberDetails
        open={owners}
        shared={filteredOwners}
        selectedPersons={selectedOwners}
        setSelectedPersons={setSelectedOwners}
        onClick={handleOpenOwners}
        handleClose={handleOwnerDialogClose}
        onTogglePerson={handleToggleOwner}
        mode={mode}
        isOwner={isOwner}
      />

      <AddMemberDetails
        open={members}
        shared={filteredMembers}
        selectedPersons={selectedPersons}
        setSelectedPersons={setSelectedPersons}
        onClick={handleOpenMembers}
        handleClose={handleMemberDialogClose}
        onTogglePerson={handleTogglePerson}
        mode={mode}
      />

      <AddProjectColor
        open={openColor}
        onClick={handleOpenColor}
        handleClose={handleColorDialogClose}
        setProjectColor={setProjectColor}
        mode={mode}
        projectColor={projectColor}
        isMission={isMission}
      />
      <AddProjectDetails
        open={details}
        onClick={handleOpenDetails}
        handleClose={handleDetailsDialogClose}
        mode={mode}
        addNewDetails={addNewDetails}
        goal={goal}
        setGoal={setGoal}
        projectInitiative={projectInitiative}
        setProjectInitiative={setProjectInitiative}
        projectMilestone={projectMilestone}
        setProjectMilestone={setProjectMilestone}
        projectDescription={projectDescription}
        setProjectDescription={setProjectDescription}
        clientName={clientName}
        setClientName={setClientName}
        taskModules={taskModules}
        setTaskModules={setTaskModules}
        taskTypes={taskTypes}
        setTaskTypes={setTaskTypes}
        selectedTaskTypes={selectedTaskTypes}
        setSelectedTaskTypes={setSelectedTaskTypes}
        projectDepartments={projectDepartments}
        isMission={isMission}
      />
    </>
  );
}
