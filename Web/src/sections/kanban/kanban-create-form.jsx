'use client';

import { useFormContext } from 'react-hook-form';
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';

import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import { useTranslation } from 'react-i18next';

import { _userList } from 'src/_mock';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

import { KanbanMembers } from './kanban-members';

import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { TextField, MenuItem } from '@mui/material';
import AvatarGroup from '@mui/material/AvatarGroup';
import Avatar from '@mui/material/Avatar';
import { useMockedUser } from 'src/auth/hooks';
import {
  _status,
  _projects,
  _categories,
  _members,
  priorityOptions,
} from 'src/sections/kanban/kanban-mock-data';
import { Field } from 'src/components/hook-form';
import { AddKanbanDetails } from './add-kanban-details';
import { addTask } from 'src/actions/task/taskActions';
import { useAuthContext } from 'src/auth/hooks';
import { AudioRecorder } from 'react-audio-voice-recorder';
import { addFile } from 'src/actions/file/fileActions';
import CircularProgress from '@mui/material/CircularProgress';
import ReactPlayer from 'react-player';
import { Chip } from '@mui/material';

function AudioPlayer({ src, onDelete, height = '30px', width = '150px' }) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <ReactPlayer
        url={src}
        playing={isPlaying}
        controls
        width={width}
        height={height}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      <IconButton onClick={onDelete} color="error" sx={{ ml: 1 }}>
        <Iconify icon="solar:trash-bin-trash-bold" width={15} height={15} />
      </IconButton>
    </Box>
  );
}

export function KanbanCreateForm({
  setTableData,
  isSubTask,
  mutate,
  allUsers,
  priorityList,
  priorityListEmpty,
  parentTaskId,
  parentTask,
  categoryList,
  categoryListEmpty,
  isProject,
  projectId,
  isClient,
  clientId,
  isLead,
  leadId,
  isClientView,
  hierarchyList,
  isTicket,
  selectedCategory,
  isProjectMember,
  sharedUsers,
}) {
  const { t, i18n } = useTranslation('dashboard/tasks');
  const storedLang = localStorage.getItem('selectedLang');
  const { zetaUser } = useAuthContext();
  const rhfMethods = useFormContext();

  const setValue = rhfMethods ? rhfMethods.setValue : null;

  const { user } = useMockedUser();
  const [mode, setMode] = useState('add');

  const [selectedPersons, setSelectedPersons] = useState([]);
  const [variant, setVariant] = useState('General');
  const [projectName, setProjectName] = useState('');
  const [projectMilestone, setProjectMilestone] = useState('');
  const [clientName, setClientName] = useState('');
  const [taskModules, setTaskModules] = useState('');
  const [taskTypes, setTaskTypes] = useState('');

  const [missionName, setMissionsName] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [businessLead, setBusinessLead] = useState('');
  const [contract, setContract] = useState('');

  const [members, setMembers] = useState(false);
  const [assignToMe, setAssignToMe] = useState(false);
  const [isConfidential, setIsConfidential] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  console.log('this is isRecording', isRecording);

  const [details, setDetails] = useState(false);
  const handleOpenDetails = () => {
    setDetails(true);
  };
  const handleDetailsDialogClose = () => {
    setTimeout(() => {
      setDetails(false);
    }, 100);
  };

  const handleTogglePerson = (person) => {
    setSelectedPersons((prevSelected) => {
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
    // setSelectedPersons([]);
    setTimeout(() => {
      setMembers(false);
    }, 100);
  };
  useEffect(() => {
    const stored = sessionStorage.getItem('chatTaskDescription');

    if (stored) {
      const parsed = JSON.parse(stored);

      setNewTask((prev) => ({
        ...prev,
        description: parsed.description,
        IsChatMessage: true,
        ChatMessageId: parsed.messageId,
      }));
      sessionStorage.removeItem('chatTaskDescription');
    }
  }, []);

  useEffect(() => {
    if (isSubTask && parentTask) {
      if (parentTask.projectId && parentTask.type === 1) {
        setVariant('Project');
        setProjectName(parentTask.projectId);
      } else if (parentTask.projectId && parentTask.type === 0) {
        setVariant('Mission');
        setMissionsName(parentTask.projectId);
      } else if (parentTask.clientId) {
        setVariant('Client');
        setClientName(parentTask.clientId);
      } else if (parentTask.clientLeadId) {
        setVariant('Client');
        setBusinessLead(parentTask.clientLeadId);
      } else if (parentTask.vendorId) {
        setVariant('Vendor');
        setVendorName(parentTask.vendorId);
      } else if (parentTask.vendorContractId) {
        setVariant('Vendor');
        setContract(parentTask.vendorContractId);
      }
    }
  }, [isSubTask, parentTask]);

  useEffect(() => {
    if (isProject) {
      setVariant('Project');
      setProjectName(projectId);
    }
    // else if (isClient) {
    //   setVariant('Client');
    //   if (isClientView) {
    //     setClientName(clientId);
    //   } else {
    //     setClientName(clientId);
    //   }
    // } else if (isLead) {
    //   setVariant('Client');
    //   setBusinessLead(leadId);
    // }
  }, [isProject]);

  const [newTask, setNewTask] = useState({
    code: '',
    description: '',
    members: '',
    startDate: '',
    endDate: '',
    status: '',
    priorityId: '',
    category: '',
    projectName: '',
    type: 'created',
  });

  const [nameError, setNameError] = useState('');
  const [idError, setIdError] = useState('');
  const handleIdChange = (e) => {
    setNewTask({ ...newTask, code: e.target.value });
    setIdError('');
  };
  const handleNameChange = (e) => {
    setNewTask({ ...newTask, description: e.target.value });
    setNameError('');
  };

  const addNewDetails = (details) => {
    details.variant = variant;
    details.projectName = projectName;
    details.projectMilestone = projectMilestone;
    details.clientName = clientName;
    details.taskTypes = taskTypes;
    details.taskModules = taskModules;
    details.vendorName = vendorName;
    details.businessLead = businessLead;
    details.missionName = missionName;
    details.contract = contract;
  };
  const [audioDescriptionFile, setAudioDescriptionFile] = useState(null);
  console.log('this is the audioDescriptionFile', audioDescriptionFile);
  const [audioUploading, setAudioUploading] = useState(false);

  const deleteAudio = () => {
    setAudioDescriptionFile(null);
  };
  const addAudioElement = async (blob) => {
    setAudioUploading(true);
    try {
      const file = new File([blob], 'audio-description.mp3', { type: 'audio/mpeg' });
      console.log('this is the file', file);

      const filePayload = {
        name: `AudioFile_${Date.now()}`,
        file: file,
      };
      console.log('this is the file payload', filePayload);

      const result = await addFile(filePayload);
      const fileResponse = result?.response?.data?.successStatus;
      console.log('this is the result', result);
      if (fileResponse) {
        toast.success(t('tasks.toasts.audio_upload'));

        setAudioDescriptionFile({
          fileId: fileResponse?.id,
          fullPath: fileResponse?.url,
        });
      } else {
        toast.error(t('tasks.toasts.audio_upload') + response.error);
      }
    } catch (error) {
      console.error('Audio upload error:', error);
    } finally {
      setAudioUploading(false);
    }
  };

  const addNewTask = async (newTask) => {
    if (isSubmitting) return;

    let hasError = false;

    if (!audioDescriptionFile && (!newTask.description || !newTask.description.trim())) {
      setNameError(t('tasks.required'));
      hasError = true;
    } else {
      setNameError('');
    }

    if (hasError) {
      return;
    }

    setIsSubmitting(true);

    newTask.members = selectedPersons;
    newTask.membersIds = selectedPersons.map((person) => person.id);
    newTask.isAssignedToMe = assignToMe;
    newTask.isConfidential = isConfidential;
    newTask.categoryId = taskTypes;
    if (variant === 'Project') {
      newTask.projectId = projectName;
    } else if (variant === 'Mission') {
      newTask.projectId = missionName;
    }
    if (isSubTask) {
      newTask.parentTaskId = parentTaskId;
    }

    if (audioDescriptionFile) {
      newTask.audioFileId = audioDescriptionFile.fileId;
    }
    if (isProject) {
      newTask.projectId = projectId;
    }

    newTask.clientLeadId = businessLead;
    newTask.clientId = businessLead ? null : clientName;

    newTask.vendorContractId = contract;

    newTask.vendorId = contract ? null : vendorName;
    if (isClient && isClientView) {
      newTask.clientId = clientId;
    }
    if (isClient && !isClientView) {
      newTask.vendorId = clientId;
    }
    if (isLead && isClientView) {
      newTask.clientLeadId = leadId;
    }
    if (isLead && !isClientView) {
      newTask.vendorContractId = leadId;
    }
    if (newTask.IsChatMessage) {
      console.log('Adding chat properties:', {
        IsChatMessage: newTask.IsChatMessage,
        ChatMessageId: newTask.ChatMessageId,
      });
    }

    console.log('this is the new task', newTask);
    try {
      const response = await addTask(newTask);
      console.log('this is the response', response);
      if (response.success) {
        toast.success(t('tasks.toast.task_create'));

        setSelectedPersons([]);
        sessionStorage.removeItem('chatTaskDescription');
        setNewTask({
          code: '',
          description: '',
          members: '',
          startDate: '',
          endDate: '',
          status: '',
          priorityId: '',
          category: '',
          projectName: '',
          type: 'created',
        });

        if (setValue) {
          setValue('startDate', '', { shouldValidate: false, shouldDirty: false });
          setValue('endDate', '', { shouldValidate: false, shouldDirty: false });
        }

        setVariant('General');
        setProjectName('');
        setAssignToMe(false);
        setIsConfidential(false);
        setProjectMilestone('');
        setClientName('');
        setTaskModules('');
        setTaskTypes('');
        setMissionsName('');
        setVendorName('');
        setBusinessLead('');
        setContract('');
        setAudioDescriptionFile(null);
        await mutate();
      } else {
        toast.error(response.error || 'Task creation failed');
      }
    } catch (error) {
      console.error('Add task failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  const clearTask = () => {
    setSelectedPersons([]);
    setNewTask({
      code: '',
      description: '',
      members: '',
      startDate: '',
      endDate: '',
      status: '',
      priorityId: '',
      category: '',
      projectName: '',
      type: 'created',
    });
    sessionStorage.removeItem('chatTaskDescription');
    if (setValue) {
      setValue('startDate', '', { shouldValidate: false, shouldDirty: false });
      setValue('endDate', '', { shouldValidate: false, shouldDirty: false });
    }
    setNameError('');
    setIdError('');
    if (!isSubTask) {
      setVariant('General');
    }
    setProjectName('');
    setProjectMilestone('');
    setClientName('');
    setTaskModules('');
    setTaskTypes('');
    setMissionsName('');
    setVendorName('');
    setBusinessLead('');
    setContract('');
    setAssignToMe(false);
    setIsConfidential(false);
    setAudioDescriptionFile(null);
  };

  const handleStartDateChange = (newDate) => {
    console.log('this is the new date', newDate);
    setNewTask({ ...newTask, startDate: newDate });
  };
  const handleEndDateChange = (newDate) => {
    setNewTask({ ...newTask, endDate: newDate });
  };
  return (
    <TableRow>
      <TableCell
        sx={{
          borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
        }}
        align="center"
      ></TableCell>
      <TableCell
        sx={{
          borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
        }}
      >
        {' '}
      </TableCell>
      {!isTicket && (
        <TableCell
          sx={{
            borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {(variant !== 'General' || taskTypes.length > 0) &&
              !isProject &&
              !isClient &&
              !isLead &&
              !isSubTask && (
                <Chip
                  icon={<Iconify icon="eva:checkmark-circle-2-fill" />}
                  label={t('tasks.source_added')}
                  size="small"
                  color="success"
                  variant="soft"
                  sx={{
                    mb: 0.5,
                    '& .MuiChip-label': {
                      fontSize: 'xx-small',
                    },
                  }}
                />
              )}
            {variant !== 'General' || taskTypes.length > 0 ? (
              <Tooltip
                title={
                  !isProject && !isClient && !isLead && !isSubTask
                    ? t('tasks.edit_task_source')
                    : t('tasks.add_task_category')
                }
                arrow
              >
                <IconButton
                  onClick={() => {
                    setDetails(true);
                  }}
                >
                  <Iconify
                    icon={
                      !isProject && !isClient && !isLead && !isSubTask
                        ? 'mdi:clipboard-edit-outline'
                        : 'mdi:clipboard-text-outline'
                    }
                    sx={{ color: '#006A67' }}
                  />
                </IconButton>
              </Tooltip>
            ) : (
              <Tooltip title={t('tasks.add_task_details')} arrow>
                <IconButton
                  onClick={() => {
                    setDetails(true);
                  }}
                >
                  <Iconify icon="mdi:clipboard-text-outline" sx={{ color: '#006A67' }} />
                </IconButton>
              </Tooltip>
            )}
          </Box>
          <AddKanbanDetails
            open={details}
            onClick={handleOpenDetails}
            handleClose={handleDetailsDialogClose}
            mode={mode}
            addNewDetails={addNewDetails}
            variant={variant}
            setVariant={setVariant}
            projectName={projectName}
            setProjectName={setProjectName}
            projectMilestone={projectMilestone}
            setProjectMilestone={setProjectMilestone}
            clientName={clientName}
            setClientName={setClientName}
            taskModules={taskModules}
            setTaskModules={setTaskModules}
            taskTypes={taskTypes}
            setTaskTypes={setTaskTypes}
            vendorName={vendorName}
            setVendorName={setVendorName}
            missionName={missionName}
            setMissionsName={setMissionsName}
            businessLead={businessLead}
            setBusinessLead={setBusinessLead}
            contract={contract}
            setContract={setContract}
            isSubTask={isSubTask}
            categoryList={categoryList}
            categoryListEmpty={categoryListEmpty}
            isClient={isClient}
            isProject={isProject}
            isLead={isLead}
            isClientView={isClientView}
          />
        </TableCell>
      )}
      {isTicket && (
        <TableCell
          sx={{
            borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
          }}
        ></TableCell>
      )}

      <TableCell
        sx={{
          borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
        }}
      >
        <Box display="flex" flexDirection="column" gap={1}>
          {/* Section for TextField and Record Button OR Audio Player */}
          {!isRecording && (
            <>
              {audioDescriptionFile ? (
                <Box width="100%">
                  <AudioPlayer src={audioDescriptionFile.fullPath} onDelete={deleteAudio} />
                </Box>
              ) : (
                // Row for TextField and RecordButton+Spinner
                <Box display="flex" alignItems="center" gap={1} width="100%">
                  <TextField
                    fullWidth
                    variant="outlined"
                    label={
                      <span>
                        {isTicket ? 'Ticket description' : t('tasks.task_description')}{' '}
                        <span style={{ color: 'red' }}>*</span>
                      </span>
                    }
                    value={newTask.description || ''}
                    onChange={handleNameChange}
                    sx={{
                      flexGrow: 1,
                      '& .MuiInputBase-input': {
                        padding: '8px 12px',
                      },
                      '& .MuiInputLabel-root': {
                        top: '-5px',
                        fontSize: '10px',
                      },
                    }}
                    error={!!nameError}
                    helperText={nameError}
                  />
                  <Box display="flex" alignItems="center" gap={1} sx={{ flexShrink: 0 }}>
                    <AudioRecorder
                      classes={{
                        AudioRecorderClass: 'new-display',
                      }}
                      downloadFileExtension="mp3"
                      onRecordingComplete={(blob) => {
                        addAudioElement(blob);
                        setIsRecording(false);
                      }}
                      showVisualizer={false}
                      render={({ startRecording }) => (
                        <Button
                          variant="outlined"
                          startIcon={<Iconify icon="mdi:microphone" />}
                          onClick={() => {
                            setIsRecording(true);
                            startRecording();
                          }}
                          sx={{
                            textTransform: 'none',
                            borderRadius: 2,
                            fontSize: '0.75rem',
                            minHeight: '36px',
                          }}
                        >
                          {t('tasks.record_audio')}
                        </Button>
                      )}
                    />
                    {audioUploading && <CircularProgress size={24} />}
                  </Box>
                </Box>
              )}
            </>
          )}

          {/* Recorder Component – shown below text field while recording */}
          {isRecording && (
            <Box mt={1}>
              <AudioRecorder
                onRecordingComplete={(blob) => {
                  addAudioElement(blob);
                  setIsRecording(false);
                }}
                showVisualizer={true}
              />
            </Box>
          )}
        </Box>
      </TableCell>
      {!isTicket && (
        <>
          <TableCell
            sx={{
              borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {selectedPersons.length > 0 && (
                <AvatarGroup sx={{ cursor: 'pointer' }}>
                  {selectedPersons.slice(0, 1).map((person) => (
                    <Tooltip key={person?.id} title={`${person?.fullName}`} arrow>
                      <Avatar
                        key={person.id}
                        alt={person.fullName}
                        src={person?.profileImageFileUrl}
                        sx={{ width: 25, height: 25 }}
                      >
                        {!person?.profileImageFileUrl && person?.fullName?.charAt(0).toUpperCase()}
                      </Avatar>
                    </Tooltip>
                  ))}
                  {selectedPersons.length > 1 && (
                    <Avatar sx={{ width: 25, height: 25 }}>+{selectedPersons.length - 1}</Avatar>
                  )}
                </AvatarGroup>
              )}
              <Tooltip title={t('tasks.add_members')}>
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => {
                    setMembers(true);
                  }}
                  sx={{
                    width: 20,
                    height: 20,
                    mt: 1,
                    ml: 2,
                    bgcolor: '#006A67',
                    color: 'primary.contrastText',
                    '&:hover': { bgcolor: 'primary.dark' },
                    cursor: 'pointer',
                  }}
                >
                  <Iconify icon="mingcute:add-line" />
                </IconButton>
              </Tooltip>
            </Box>

            <KanbanMembers
              open={members}
              shared={sharedUsers}
              selectedPersons={selectedPersons}
              setSelectedPersons={setSelectedPersons}
              onClick={handleOpenMembers}
              handleClose={handleMemberDialogClose}
              onTogglePerson={handleTogglePerson}
              user={user}
              mode={mode}
              assignToMe={assignToMe}
              setAssignToMe={setAssignToMe}
              isConfidential={isConfidential}
              setIsConfidential={setIsConfidential}
              isSubTask={isSubTask}
            />
          </TableCell>

          <TableCell
            sx={{
              borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
            }}
          ></TableCell>

          <TableCell
            sx={{
              borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
            }}
          >
            <Field.MobileDateTimePicker
              name="startDate"
              label={t('tasks.start_date')}
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
            <Field.MobileDateTimePicker
              name="endDate"
              label={t('tasks.end_date')}
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

          <TableCell
            sx={{
              borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
            }}
          ></TableCell>
        </>
      )}

      {!isTicket && (
        <TableCell
          sx={{
            borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
          }}
        ></TableCell>
      )}

      {isTicket && isProjectMember && (
        <TableCell
          sx={{
            borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
          }}
        ></TableCell>
      )}

      <TableCell
        sx={{
          borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
        }}
      >
        <TextField
          select
          fullWidth
          label={t('tasks.priority')}
          value={newTask.priorityId || ''}
          onChange={(e) => setNewTask({ ...newTask, priorityId: e.target.value })}
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
          {/* {['Low', 'Medium', 'High'].map((key) => (
            <MenuItem key={key} value={key}>
              {priorityOptions[key]}
            </MenuItem>
          ))} */}
          {priorityListEmpty ? (
            <MenuItem value="">{t('tasks.no_priorities')}</MenuItem>
          ) : (
            priorityList?.priorities.map((priority) => (
              <MenuItem key={priority.id} value={priority.id}>
                {priority?.name?.localizedStrings?.find(
                  (ls) => ls.language.toLowerCase() === storedLang
                )?.value || priority?.name?.value}
              </MenuItem>
            ))
          )}
        </TextField>
      </TableCell>
      {/* <TableCell
        sx={{
          borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
        }}
      ></TableCell> */}

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
          <Tooltip title={t('tasks.add_task')}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                if (!isSubmitting) {
                  addNewTask(newTask);
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
                  : !newTask.description && !audioDescriptionFile
                    ? 'grey.400'
                    : isSubmitting
                      ? 'grey.500'
                      : '#006A67',
              }}
            >
              {isSubmitting ? (
                <CircularProgress size={24} sx={{ color: 'primary.contrastText' }} />
              ) : (
                t('tasks.save')
              )}
            </Button>
          </Tooltip>
          <Tooltip title={t('tasks.clear_all')} arrow>
            <Iconify
              icon="mdi:close-circle"
              onClick={() => clearTask()}
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
  );
}
