import { useState, useMemo, useCallback, useEffect } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

import { useBoolean } from 'src/hooks/use-boolean';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { usePopover, CustomPopover } from 'src/components/custom-popover';
import { fDate, fTime, fDateTimeNew } from 'src/utils/format-time';
import AvatarGroup, { avatarGroupClasses } from '@mui/material/AvatarGroup';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
import { background } from 'src/theme/core';
import { KanbanMembers } from './kanban-members';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh'; // For High priority
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt'; // For Medium priority
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useDoubleClick } from 'src/hooks/use-double-click';
import { KanbanDetails } from './details/kanban-details';
import { useMockedUser } from 'src/auth/hooks';

import TextField from '@mui/material/TextField';
import { toast } from 'src/components/snackbar';
import {
  _status,
  _projects,
  _categories,
  _members,
  priorityOptions,
} from 'src/sections/kanban/kanban-mock-data';
import { Field } from 'src/components/hook-form';
import { useTranslation } from 'react-i18next';
import { useFormContext } from 'react-hook-form';
import { updateTask, changeStatus, addTask, transcribeTask } from 'src/actions/task/taskActions';
import { AddKanbanDetails } from './add-kanban-details';
import { KanbanTranscript } from './kanban-transcript';
import { KanbanDescription } from './kanban-description';

import { ChangeTaskStatus } from './change-task-status';
import { useAuthContext } from 'src/auth/hooks';
import { getDocument } from 'src/actions/document/documentActions';
import { useCopyToClipboard } from 'src/hooks/use-copy-to-clipboard';
import ReactPlayer from 'react-player';
import { AudioRecorder } from 'react-audio-voice-recorder';
import { addFile } from 'src/actions/file/fileActions';
import CircularProgress from '@mui/material/CircularProgress';
import { addMilestoneTasks } from 'src/actions/project/projectActions';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { CONFIG } from 'src/config-global';

// ----------------------------------------------------------------------

function AudioPlayer({ src, onDelete, audioFile, height = '30px', width = '150px' }) {
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
        config={{
          file: {
            forceAudio: true,
          },
        }}
      />
      {!audioFile && (
        <IconButton onClick={onDelete} color="error" sx={{ ml: 1 }}>
          <Iconify icon="solar:trash-bin-trash-bold" width={15} height={15} />
        </IconButton>
      )}
    </Box>
  );
}
export function KanbanTableRow({
  row,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
  isUser,
  onOpenRow,
  tableData,
  hierarchyList,
  allUsers,
  priorityList,
  priorityListEmpty,
  isSubTask,
  index,
  mutate,
  parentTaskId,
  statusList,
  selectedCategory,
  isProject,
  isClient,
  isLead,
  userId,
  isMilestone,
  mutateMilestone,
  categoryList,
  categoryListEmpty,
  setTotalCounts,
  mutateMilestoneTasks,
  isTicket,
  isProjectMember,
  projectMembers,
  sharedUsers,
  derivedHierarchyInfo,
  matchingChildrenEmployeeIds,
}) {
  console.log('this is the selcted category', selectedCategory);

  console.log('this is the project members', projectMembers);
  const { t, i18n } = useTranslation('dashboard/tasks');
  const storedLang = localStorage.getItem('selectedLang');
  const router = useRouter();

  const { zetaUser } = useAuthContext();
  const rhfMethods = useFormContext();
  const { setValue } = rhfMethods || {};

  const confirm = useBoolean();
  const confirmDeleteMilestoneTask = useBoolean();
  const popover = usePopover();
  const openMembers = useBoolean();
  const taskDetails = useBoolean();

  const quickEdit = useBoolean();
  const { copy } = useCopyToClipboard();

  const [mode, setMode] = useState('');
  const [taskMode, setTaskMode] = useState('');

  const [members, setMembers] = useState(false);
  const [assignToMe, setAssignToMe] = useState(false);
  const [isConfidential, setIsConfidential] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const taskCreator = row?.creatorId === zetaUser?.id;

  const ticketCreatorId = row?.creatorId;
  const projectMemberIds = projectMembers?.map((pm) => pm.memberId) || [];

  const [openStatus, setOpenStatus] = useState(false);
  const handleToggleStatus = (statusId) => {
    setSelectedStatus(statusId);
  };
  const handleOpenStatusDialog = () => {
    setOpenStatus(true);
  };

  const handleStatusDialogClose = () => {
    setTimeout(() => {
      setOpenStatus(false);
    }, 100);
  };

  const [openTranscript, setOpenTranscript] = useState(false);
  const [openDescription, setOpenDescription] = useState(false);

  const [loadingTranscript, setLoadingTranscript] = useState(false);
  const [loadingAction, setLoadingAction] = useState(null);
  const handleOpenTranscriptDialog = async () => {
    setLoadingAction('transcript');
    setLoadingTranscript(true);

    try {
      if (!transcript) {
        await fetchTranscript();
      }
      setOpenTranscript(true);
    } finally {
      setLoadingTranscript(false);
      setLoadingAction(null);
    }
  };

  const handleTranscriptDialogClose = () => {
    setTimeout(() => {
      setOpenTranscript(false);
    }, 100);
  };
  const handleOpenDescription = async () => {
    setOpenDescription(true);
  };

  const handleCloseDescription = () => {
    setTimeout(() => {
      setOpenDescription(false);
    }, 100);
  };

  const [audioDescriptionFile, setAudioDescriptionFile] = useState(null);
  console.log('this is the audioDescriptionFile', audioDescriptionFile);
  const [audioUploading, setAudioUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

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
        toast.success(t('tasks.toast.audio_upload'));

        setAudioDescriptionFile({
          fileId: fileResponse?.id,
          fullPath: fileResponse?.url,
        });
      } else {
        toast.error(t('tasks.toast.audio_upload_failed:') + response.error);
      }
    } catch (error) {
      console.error('Audio upload error:', error);
    } finally {
      setAudioUploading(false);
    }
  };
  const addStatus = async (newStatusId) => {
    if (!newStatusId) return;

    const payload = {
      taskId: row?.id,
      statusId: newStatusId,
    };
    if (audioDescriptionFile) {
      payload.audioFileId = audioDescriptionFile.fileId;
    }
    try {
      const response = await changeStatus(payload);
      if (response.success) {
        toast.success(t('tasks.toast.status_changed'));
        setSelectedStatus([]);
        await mutate();
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      console.error('Change Status failed:', error);
    }
  };

  const { user } = useMockedUser();

  const handleOpenMembers = () => {
    setMembers(true);
  };
  const handleMemberDialogClose = () => {
    setTimeout(() => {
      setMembers(false);
    }, 100);
  };
  const [details, setDetails] = useState(false);

  const handleOpenDetails = () => {
    setDetails(true);
  };
  const handleDetailsDialogClose = () => {
    setTimeout(() => {
      setDetails(false);
    }, 100);
  };

  const [kanbanDetails, setKanbanDetails] = useState(false);

  // const handleOpenKanbanDetails = () => {
  //   setKanbanDetails(true);
  // };
  const handleKanbanDetailsDialogClose = () => {
    setTimeout(() => {
      setKanbanDetails(false);
    }, 100);
  };

  const handleOpenKanbanDetails = useDoubleClick({
    click: () => {
      taskDetails.onTrue();
    },
    doubleClick: () => console.info('DOUBLE CLICK'),
  });

  const [editingTaskId, setEditingTaskId] = useState(null);
  const [newTaskId, setNewTaskId] = useState('');
  const [newTaskName, setNewTaskName] = useState('');
  const [newProject, setNewProject] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newPriority, setNewPriority] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

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
  const assignedForMe = row?.members.length === 1 && row.creatorId === row.members[0]?.memberId;

  const userHierarchyItem = hierarchyList?.hierarchy?.find(
    (item) => item.employeeId === zetaUser?.id
  );

  const sharedUsersRow = isTicket
    ? allUsers?.filter((user) => user.id !== ticketCreatorId)
    : sharedUsers;

  const handleEditTask = (task, taskMode) => {
    if (taskMode === 'editTask') {
      setEditingTaskId(task.id);
      setMode('edit');
      setTaskMode('editTask');
    }
    if (taskMode === 'forwardTask') {
      setEditingTaskId(task.id);
      setMode('forward');
      setTaskMode('forwardTask');
      setSelectedPersons([]);
    }
    setNewTaskId(task.code);
    let descriptionToSet = task.description;
    try {
      const parsedDesc = JSON.parse(task.description);
      if (parsedDesc && parsedDesc.TranscriptStr) {
        descriptionToSet = parsedDesc.TranscriptStr;
      }
    } catch (e) {}
    setNewTaskName(descriptionToSet);
    setNewCategory(task.categoryId);
    setNewPriority(task.priorityId);

    setVariant('General');
    setProjectName('');
    setMissionsName('');
    setClientName('');
    setVendorName('');
    setBusinessLead('');
    setContract('');

    const initialSelectedUsers = (task.members || [])
      .map((taskMember) => allUsers.find((u) => u.id === taskMember.memberId))
      .filter(Boolean);

    const isCategoryAvailable = categoryList?.categories?.some(
      (category) => category.id === task.categoryId
    );

    setTaskTypes(isCategoryAvailable ? task.categoryId : '');

    if (task.projectId && task.type === 1) {
      setVariant('Project');
      setProjectName(task.projectId);
    } else if (task.projectId && task.type === 0) {
      setVariant('Mission');
      setMissionsName(task.projectId);
    } else if (task.clientId) {
      setVariant('Client');
      setClientName(task.clientId);
    } else if (task.clientLeadId) {
      setVariant('Client');
      setBusinessLead(task.clientLeadId);
    } else if (task.vendorId) {
      setVariant('Vendor');
      setVendorName(task.vendorId);
    } else if (task.vendorContractId) {
      setVariant('Vendor');
      setContract(task.vendorContractId);
    }

    const initialStartDate = task?.startDate || '';
    const initialEndDate = task?.endDate || '';

    setStartDate(initialStartDate);
    setEndDate(initialEndDate);

    if (setValue) {
      setValue('startDate', initialStartDate, { shouldValidate: false, shouldDirty: true });
      setValue('endDate', initialEndDate, { shouldValidate: false, shouldDirty: true });
    }
    setIsConfidential(task?.isConfidential);
    setAssignToMe(
      task?.members.length === 1 && task.creatorId === task.members[0]?.memberId ? true : false
    );

    if (taskMode === 'forwardTask') {
      setSelectedPersons([]);
    } else {
      setSelectedPersons(initialSelectedUsers);
    }
  };
  const [selectedPersons, setSelectedPersons] = useState([]);
  const rowMembers = row?.members;

  const handleTogglePerson = (person) => {
    if (editingTaskId === row.id) {
      const isInitialMember = rowMembers.some((member) => member.id === person.id);
      setSelectedPersons((prevSelected) => {
        const isAlreadySelected = prevSelected.some((p) => p.id === person.id);

        if (isAlreadySelected) {
          return prevSelected.filter((p) => p.id !== person.id);
        }

        return [...prevSelected, person];
      });

      if (isInitialMember) {
        console.log(`${person.memberName} is an original member`);
      }
    }
  };
  const handleToggleBacklogPerson = (person) => {
    setSelectedPersons((prevSelected) => {
      const isAlreadySelected = prevSelected.some((p) => p.id === person.id);

      if (isAlreadySelected) {
        return prevSelected.filter((p) => p.id !== person.id);
      }

      return [...prevSelected, person];
    });
  };

  const handleToggleForwardPerson = (person) => {
    setSelectedPersons((prev) =>
      prev.some((p) => p.id === person.id)
        ? prev.filter((p) => p.id !== person.id)
        : [...prev, person]
    );
  };

  console.log(
    'this is the selected person',
    selectedPersons.map((person) => person.id)
  );

  console.log('this is the projectName', projectName);

  const handleUpdateTask = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const payload = {
      code: newTaskId,
      description: newTaskName,
      projectId: projectName || row.projectId,
      categoryId: taskTypes || null,
      priorityId: newPriority,
      startDate: startDate,
      endDate: endDate,
      members: selectedPersons,
      isAssignedToMe: assignToMe,
      membersIds: assignToMe ? [] : selectedPersons.map((person) => person.id),

      isConfidential: isConfidential,
      clientId: clientName,
      clientLeadId: businessLead,
      vendorId: vendorName,
      vendorContractId: contract,
      documentId: row?.documentId,
    };
    if (taskMode === 'editTask') {
      payload.id = row?.id;
    }

    if (isSubTask) {
      payload.parentTaskId = parentTaskId;
    }
    console.log('this is the payload', payload);
    if (isTicket) {
      payload.projectId = row.projectId;
    }
    try {
      let response;

      if (taskMode === 'editTask') {
        response = await updateTask(payload);
      } else {
        response = await addTask(payload);
      }

      console.log('this is the forward task response', response);

      if (response?.success === false) {
        toast.error(response?.error || 'Something went wrong. Please try again.');
        return;
      }

      if (response?.success === true || response?.response?.data?.succeeded === true) {
        toast.success(
          mode === 'forward' ? t('tasks.toast.task_forwarded') : t('tasks.toast.task_update')
        );

        setEditingTaskId(null);
        setNewTaskId('');
        setNewTaskName('');
        setNewProject('');
        setAssignToMe(false);
        setIsConfidential(false);

        if (setValue) {
          setValue('startDate', '', { shouldValidate: false, shouldDirty: false });
          setValue('endDate', '', { shouldValidate: false, shouldDirty: false });
        }

        setAudioDescriptionFile(null);

        if (mode === 'forward') {
          handleMemberDialogClose();
        }

        await mutate();

        setTotalCounts({
          created: null,
          assigned: null,
          backlog: null,
        });

        return;
      }

      toast.error('Something went wrong. Please try again.');
    } catch (error) {
      console.error('Add update failed:', error);
      toast.error(error?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearField = () => {
    setEditingTaskId(null);
    setAssignToMe(false);
    setIsConfidential(false);
    if (setValue) {
      setValue('startDate', '', { shouldValidate: false, shouldDirty: false });
      setValue('endDate', '', { shouldValidate: false, shouldDirty: false });
    }
    setAudioDescriptionFile(null);
  };
  const handleClearMilestoneTasks = async () => {
    const payload = {
      milestoneId: null,
      taskIds: [row.id],
    };

    try {
      const response = await addMilestoneTasks(payload);
      if (response.success) {
        toast.success(t('tasks.toast.task_cleared'));
        confirmDeleteMilestoneTask.onFalse();
        await mutate();
        await mutateMilestone();
        await mutateMilestoneTasks();
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      console.error('error added milestone:', error);
    }
  };
  const handleStartDateChange = (newDate) => {
    setStartDate(newDate);
  };
  const handleEndDateChange = (newDate) => {
    setEndDate(newDate);
  };
  const creatorName = row?.creatorName || t('tasks.not_available');
  const creatorAvatar = row?.creatorProfileImageFileUrl
    ? row?.creatorProfileImageFileUrl
    : creatorName.charAt(0).toUpperCase();
  const creatorDesignation = row?.designation.value || t('tasks.not_available');

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
  const matchedMember = row.members.find((member) => member.memberId === zetaUser?.id);

  const getDocParams = useMemo(() => {
    if (taskDetails.value && row?.documentId) {
      return {
        search: {
          fieldName: 'Id',
          fieldValue: row.documentId,
          operator: 0,
          logicOperator: 0,
        },
        pagination: {
          pageNumber: 1,
          pageSize: 2,
        },
      };
    }
    return null;
  }, [taskDetails.value, row?.documentId]);

  const {
    documentList,
    documentListLoading,
    documentListError,
    mutate: mutateDocument,
  } = getDocument(getDocParams);
  const availableUsers = rowMembers?.map((member) => member.memberId) || [];
  console.log('this is the available users', availableUsers);
  const usersNotInList =
    userHierarchyItem?.parentStructureId === null
      ? allUsers.filter((user) => !availableUsers.includes(user.id))
      : allUsers?.filter(
          (user) =>
            user.id !== zetaUser?.id &&
            (derivedHierarchyInfo?.childEmployeeIds?.includes(user.id) ||
              derivedHierarchyInfo?.sameLevelEmployeeIds?.includes(user.id)) &&
            !matchingChildrenEmployeeIds.includes(user.id) &&
            !availableUsers.includes(user.id)
        );
  console.log('this is the usersNotInList', usersNotInList);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success(t('tasks.toast.link_copied'));
    } catch (err) {
      console.error('Failed to copy: ', err);
      toast.error(t('tasks.toast.failed_link'));
    }
  }, []);

  const {
    primaryDescription,
    secondaryDescription,
    descriptionStr,
    descriptionEng,
    descriptionArabic,
  } = useMemo(() => {
    let fullDescription = '';
    let englishDescription = '';
    let arabicDescription = '';

    try {
      const parsedDescription = JSON.parse(row?.description);

      if (parsedDescription?.TranscriptStr) {
        fullDescription = parsedDescription.TranscriptStr;
      }

      if (parsedDescription?.TranscriptEnglishStr) {
        englishDescription = parsedDescription.TranscriptEnglishStr;
      }

      if (parsedDescription?.TranscriptArabicStr) {
        arabicDescription = parsedDescription.TranscriptArabicStr;
      }
    } catch (e) {
      fullDescription = row?.description || '';
    }

    const descriptionStr = fullDescription;
    const words = fullDescription.split(' ');
    const descriptionEng = englishDescription;
    const descriptionArabic = arabicDescription;

    return {
      primaryDescription: words.slice(0, 5).join(' '),
      secondaryDescription: words.slice(5).join(' '),
      descriptionStr,
      descriptionEng,
      descriptionArabic,
    };
  }, [row?.description]);
  const [transcript, setTranscript] = useState(null);

  const fetchTranscript = useCallback(async () => {
    try {
      const payload = {
        taskId: row?.id,
      };
      const res = await transcribeTask(payload);

      if (res.success) {
        const data = res.response.data?.successStatus;

        const formattedTranscript = JSON.stringify({
          TranscriptStr: data?.transcriptStr || '',
          TranscriptEnglishStr: data?.transcriptEnglishStr || '',
          TranscriptArabicStr: data?.transcriptArabicStr || '',
        });

        setTranscript(formattedTranscript);

        return data?.transcriptStr || '';
      } else {
        setTranscript(null);
        toast.error(res.error || 'Failed to fetch transcript');
        return '';
      }
    } catch (err) {
      setTranscript(null);
      toast.error('Error fetching transcript');
      return '';
    }
  }, [row?.id]);

  const handleProjectClick = (projectId, isTicket) => {
    if (isTicket) {
      router.push(paths.dashboard.ticketing.details(projectId));
    } else {
      router.push(paths.dashboard.project.details(projectId));
    }
  };
  const handleClientClick = (clientId, isClientView) => {
    if (isClientView) {
      router.push(paths.dashboard.clientDetails.details(clientId));
    } else {
      router.push(paths.dashboard.vendorDetails.details(clientId));
    }
  };

  const handleLeadClick = (leadId, isClientView) => {
    if (isClientView) {
      router.push(paths.dashboard.leadDetails.details(leadId));
    } else {
      router.push(paths.dashboard.contractDetails.details(leadId));
    }
  };
  const [publicLink, setPublicLink] = useState('');
  useEffect(() => {
    if (row?.id) {
      setPublicLink(`${CONFIG.zetaApiUrl}/dashboard/kanban/${row?.id}/details`);
      console.log('Public link set to:', `${CONFIG.zetaApiUrl}dashboard/kanban/${row?.id}/details`);
    }
  }, [row?.id]);
  const handleWhatsAppShare = () => {
    const message = `*${descriptionStr || 'Task'}*\n${publicLink}`;
    const encodedMessage = encodeURIComponent(message);

    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');
  };
  return (
    <>
      <TableRow hover selected={selected} aria-checked={selected} tabIndex={-1}>
        <TableCell
          sx={{ cursor: 'pointer', borderRight: '1px dotted rgba(200, 200, 200, 0.6)' }}
          align="center"
          onClick={editingTaskId !== row.id ? handleOpenKanbanDetails : undefined}
        >
          <Box>{index + 1}</Box>
        </TableCell>
        <TableCell
          sx={{
            whiteSpace: 'nowrap',
            cursor: 'pointer',
            borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
          }}
          align={storedLang === 'ar' ? 'right' : 'left'}
          onClick={editingTaskId !== row.id ? handleOpenKanbanDetails : undefined}
        >
          <Box
            sx={{
              display: 'block',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '100%',
            }}
          >
            <Box display="flex" alignItems="center" justifyContent="space-between" gap={1}>
              {row.parentTaskId ? (
                <Stack>
                  <Tooltip title={t('tasks.parent_task')} arrow>
                    <Typography variant="caption" color="textSecondary">
                      {String(row?.parentTaskSerial).padStart(5, '0')}
                    </Typography>
                  </Tooltip>
                  <Typography variant="body2" fontWeight="bold">
                    {String(row?.serial).padStart(5, '0')}
                  </Typography>
                </Stack>
              ) : (
                <Typography variant="body2" fontWeight="bold">
                  {String(row?.serial).padStart(5, '0')}
                </Typography>
              )}
              {row?.isConfidential && (
                <Tooltip title={t('tasks.confidential_task')} arrow>
                  <Iconify icon="mdi:lock" sx={{ width: 13, color: 'grey' }} />
                </Tooltip>
              )}
            </Box>
          </Box>
        </TableCell>
        {!isTicket && (
          <TableCell
            sx={{
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
            }}
            align={editingTaskId ? 'center' : storedLang === 'ar' ? 'right' : 'left'}
            onClick={editingTaskId !== row.id ? handleOpenKanbanDetails : undefined}
          >
            {editingTaskId === row.id && row?.type !== 2 ? (
              <Tooltip title={t('tasks.edit_task_details')} arrow>
                <IconButton
                  onClick={() => {
                    setDetails(true);
                  }}
                >
                  <Iconify icon="mdi:file-document-edit-outline" sx={{ color: '#006A67' }} />
                </IconButton>
              </Tooltip>
            ) : (
              <Box
                sx={{
                  display: 'block',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%',
                }}
              >
                {!isSubTask && (
                  <Typography
                    variant="caption"
                    component="span"
                    sx={{
                      display: 'block',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '100%',
                    }}
                  >
                    {row?.projectId && row?.type === 0 ? (
                      <>
                        {t('tasks.mission')} -{' '}
                        <span
                          style={{
                            // textDecoration: 'underline',
                            // cursor: 'pointer',
                            fontWeight: 'bold',
                          }}
                          // onClick={() => handleProjectClick(row?.projectId, false)}
                        >
                          {row?.projectName?.charAt(0).toUpperCase() + row?.projectName?.slice(1)}
                        </span>
                      </>
                    ) : row?.vendorContractId ? (
                      <>
                        {t('tasks.contract')} -{' '}
                        <span
                          style={{
                            // textDecoration: 'underline',
                            // cursor: 'pointer',
                            fontWeight: 'bold',
                          }}
                          // onClick={() => handleLeadClick(row?.vendorContractId, false)}
                        >
                          {row?.vendorContractName?.charAt(0).toUpperCase() +
                            row?.vendorContractName?.slice(1)}
                        </span>
                      </>
                    ) : row?.vendorId ? (
                      <>
                        {t('tasks.vendor')} -{' '}
                        <span
                          style={{
                            // textDecoration: 'underline',
                            // cursor: 'pointer',
                            fontWeight: 'bold',
                          }}
                          // onClick={() => handleClientClick(row?.vendorId, false)}
                        >
                          {row?.vendorName?.charAt(0).toUpperCase() + row?.vendorName?.slice(1)}
                        </span>
                      </>
                    ) : row?.clientLeadId ? (
                      <>
                        {t('tasks.lead')} -{' '}
                        <span
                          style={{
                            // textDecoration: 'underline',
                            // cursor: 'pointer',
                            fontWeight: 'bold',
                          }}
                          // onClick={() => handleLeadClick(row?.clientLeadId, true)}
                        >
                          {row?.clientLeadName?.charAt(0).toUpperCase() +
                            row?.clientLeadName?.slice(1)}
                        </span>
                      </>
                    ) : row?.clientId ? (
                      <>
                        {t('tasks.client')} -{' '}
                        <span
                          style={{
                            // textDecoration: 'underline',
                            // cursor: 'pointer',
                            fontWeight: 'bold',
                          }}
                          // onClick={() => handleClientClick(row?.clientId, true)}
                        >
                          {row?.clientName?.charAt(0).toUpperCase() + row?.clientName?.slice(1)}
                        </span>
                      </>
                    ) : row?.projectId && row?.type === 1 ? (
                      <>
                        {t('tasks.projects')} -{' '}
                        <span
                          style={{
                            // textDecoration: 'underline',
                            // cursor: 'pointer',
                            fontWeight: 'bold',
                          }}
                          // onClick={() => handleProjectClick(row?.projectId, false)}
                        >
                          {row?.projectName?.charAt(0).toUpperCase() + row?.projectName?.slice(1)}
                        </span>
                      </>
                    ) : row?.projectId && row?.type === 2 ? (
                      <>
                        {t('tasks.ticketing')} -{' '}
                        <span
                          style={{
                            // textDecoration: 'underline',
                            // cursor: 'pointer',
                            fontWeight: 'bold',
                          }}
                          // onClick={() => handleProjectClick(row?.projectId, true)}
                        >
                          {row?.projectName?.charAt(0).toUpperCase() + row?.projectName?.slice(1)}
                        </span>
                      </>
                    ) : (
                      t('tasks.general')
                    )}
                  </Typography>
                )}

                <Typography
                  sx={{
                    display: 'block',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '100%',
                  }}
                  variant="caption"
                >
                  {' '}
                  {`${
                    !row?.created || row?.created.startsWith('0001-01-01')
                      ? t('tasks.not_available')
                      : fDateTimeNew(row.created)
                  }`}
                </Typography>
              </Box>
            )}
          </TableCell>
        )}

        {isTicket && (
          <TableCell
            sx={{ cursor: 'pointer', borderRight: '1px dotted rgba(200, 200, 200, 0.6)' }}
            onClick={editingTaskId !== row.id ? handleOpenKanbanDetails : undefined}
          >
            <Typography
              sx={{
                display: 'block',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%',
              }}
              variant="caption"
            >
              {' '}
              {`${
                !row?.created || row?.created.startsWith('0001-01-01')
                  ? t('tasks.not_available')
                  : fDateTimeNew(row.created)
              }`}
            </Typography>
          </TableCell>
        )}

        <TableCell sx={{ cursor: 'pointer', borderRight: '1px dotted rgba(200, 200, 200, 0.6)' }}>
          {editingTaskId === row.id ? (
            <Box display="flex" flexDirection="column" gap={1}>
              {!isRecording && (
                <>
                  {audioDescriptionFile ? (
                    <Box width="100%">
                      <AudioPlayer src={audioDescriptionFile.fullPath} onDelete={deleteAudio} />
                    </Box>
                  ) : (
                    <Box display="flex" alignItems="center" gap={1} width="100%">
                      <TextField
                        fullWidth
                        size="small"
                        value={newTaskName}
                        onChange={(e) => setNewTaskName(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleUpdateTask();
                          }
                        }}
                        autoFocus
                      />
                      <Box display="flex" alignItems="center" gap={1} sx={{ flexShrink: 0 }}>
                        <AudioRecorder
                          classes={{
                            AudioRecorderClass: 'new-display',
                          }}
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
                              {t('tasks.toast.record_audio')}
                            </Button>
                          )}
                        />
                        {audioUploading && <CircularProgress size={24} />}
                      </Box>
                    </Box>
                  )}
                </>
              )}
              {isRecording && (
                <Box mt={1}>
                  <AudioRecorder
                    onRecordingComplete={(blob) => {
                      addAudioElement(blob);
                      setIsRecording(false);
                    }}
                    downloadFileExtension="mp3"
                    showVisualizer={true}
                  />
                </Box>
              )}
            </Box>
          ) : (
            <>
              {!row?.audioFileId ? (
                <Box
                  sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  // onClick={handleOpenKanbanDetails}
                >
                  <ListItemText
                    primary={primaryDescription}
                    secondary={secondaryDescription}
                    sx={{ textAlign: 'justify' }}
                    onClick={handleOpenKanbanDetails}
                    primaryTypographyProps={{
                      typography: 'subtitle1',
                      sx: {
                        display: 'block',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '100%',
                      },
                    }}
                    secondaryTypographyProps={{
                      component: 'span',
                      typography: 'caption',
                      sx: {
                        display: 'block',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '100%',
                      },
                    }}
                  />
                  {!row?.audioFileId && (
                    <IconButton size="small" onClick={handleOpenDescription}>
                      <Tooltip title="Show full description">
                        <Iconify icon="mdi:information-outline" width={16} />
                      </Tooltip>
                    </IconButton>
                  )}

                  <IconButton
                    size="small"
                    onClick={handleOpenTranscriptDialog}
                    disabled={loadingTranscript}
                  >
                    {loadingAction === 'transcript' ? (
                      <CircularProgress size={16} />
                    ) : (
                      <Tooltip title={row?.audioFileId ? 'Show Transcription' : 'Show Translation'}>
                        <Iconify icon="mdi:script-text-outline" width={16} />
                      </Tooltip>
                    )}
                  </IconButton>
                  <KanbanTranscript
                    open={openTranscript}
                    handleClose={handleTranscriptDialogClose}
                    kanbanDescription={transcript || ''}
                    loading={loadingTranscript}
                  />
                  <KanbanDescription
                    open={openDescription}
                    handleClose={handleCloseDescription}
                    kanbanDescription={row?.description || ''}
                    taskId={String(row?.serial).padStart(5, '0')}
                  />
                </Box>
              ) : (
                <Box
                  width="100%"
                  sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <Box sx={{ width: '-webkit-fill-available' }} onClick={handleOpenKanbanDetails}>
                    <AudioPlayer src={row?.audioFileUrl} audioFile={row?.audioFileId} />
                  </Box>
                  <Box>
                    <IconButton
                      size="small"
                      onClick={handleOpenTranscriptDialog}
                      disabled={loadingTranscript}
                    >
                      {loadingAction === 'transcript' ? (
                        <CircularProgress size={16} />
                      ) : (
                        <Tooltip
                          title={row?.audioFileId ? 'Show Transcription' : 'Show Translation'}
                        >
                          <Iconify icon="mdi:script-text-outline" width={16} />
                        </Tooltip>
                      )}
                    </IconButton>
                  </Box>
                  <KanbanTranscript
                    open={openTranscript}
                    handleClose={handleTranscriptDialogClose}
                    kanbanDescription={transcript || ''}
                    loading={loadingTranscript}
                    isAudioFile={row?.audioFileId}
                  />
                </Box>
              )}
            </>
          )}
        </TableCell>

        {((isTicket && isProjectMember) ||
          (isTicket && !isProjectMember && (selectedCategory === 5 || selectedCategory === 1))) && (
          <TableCell
            sx={{ whiteSpace: 'nowrap', borderRight: '1px dotted rgba(200, 200, 200, 0.6)' }}
            align={editingTaskId ? 'center' : ''}
          >
            {editingTaskId === row.id ? (
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
                          {!person?.profileImageFileUrl &&
                            person?.fullName?.charAt(0).toUpperCase()}
                        </Avatar>
                      </Tooltip>
                    ))}
                    {selectedPersons.length > 1 && (
                      <Avatar sx={{ width: 25, height: 25 }}>+{selectedPersons.length - 1}</Avatar>
                    )}
                  </AvatarGroup>
                )}
                <Tooltip title="Add Members" arrow>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => {
                      setMembers(true);
                      if (taskMode === 'editTask') {
                        setMode('edit');
                      } else {
                        setMode('forward');
                      }
                    }}
                    sx={{
                      width: 20,
                      height: 20,
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
            ) : (
              <>
                <Box
                  sx={{
                    display: 'block',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '100%',
                  }}
                >
                  {row?.members && row?.members.length > 0 ? (
                    <>
                      <Box
                        display="flex"
                        alignItems="center"
                        gap={1}
                        onClick={() => {
                          setMembers(true);
                          setMode('view');
                        }}
                      >
                        <Tooltip title={`${creatorName}`} arrow>
                          <Avatar
                            alt={creatorName}
                            src={creatorAvatar}
                            sx={{ width: 25, height: 25 }}
                          />
                        </Tooltip>
                        {row?.members.length === 1 && row.creatorId === row.members[0]?.memberId ? (
                          <Label variant="soft" color="warning">
                            <Typography
                              variant="caption"
                              component="span"
                              sx={{
                                display: 'block',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                maxWidth: '100%',
                              }}
                            >
                              {t('tasks.assigned_to_me')}
                            </Typography>
                          </Label>
                        ) : (
                          <AvatarGroup sx={{ cursor: 'pointer' }}>
                            {row?.members.slice(0, 1).map((person) => (
                              <Tooltip key={person?.id} title={`${person?.memberName}`} arrow>
                                <Avatar
                                  key={person.id}
                                  alt={person.memberName}
                                  src={person?.profileImageFileUrl}
                                  sx={{ width: 25, height: 25 }}
                                >
                                  {!person?.profileImageFileUrl &&
                                    person?.memberName?.charAt(0).toUpperCase()}
                                </Avatar>
                              </Tooltip>
                            ))}
                            {row?.members.length > 1 && (
                              <Avatar sx={{ width: 25, height: 25 }}>
                                +{row?.members.length - 1}
                              </Avatar>
                            )}
                          </AvatarGroup>
                        )}
                      </Box>
                    </>
                  ) : (
                    <Box display="flex" alignItems="center" gap={1}>
                      {' '}
                      <Tooltip title={`${creatorName}`} arrow>
                        <Avatar
                          alt={creatorName}
                          src={creatorAvatar}
                          sx={{ width: 25, height: 25 }}
                        />
                      </Tooltip>
                      <Tooltip title={t('tasks.reminder.add_members')} arrow>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => {
                            setMembers(true);
                            setMode('backlog');
                          }}
                          sx={{
                            width: 20,
                            height: 20,
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
                  )}
                </Box>
              </>
            )}
          </TableCell>
        )}

        {isTicket && selectedCategory === 0 && (
          <TableCell
            sx={{ whiteSpace: 'nowrap', borderRight: '1px dotted rgba(200, 200, 200, 0.6)' }}
            align={editingTaskId ? 'center' : ''}
          >
            {editingTaskId === row.id ? (
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
                          {!person?.profileImageFileUrl &&
                            person?.fullName?.charAt(0).toUpperCase()}
                        </Avatar>
                      </Tooltip>
                    ))}
                    {selectedPersons.length > 1 && (
                      <Avatar sx={{ width: 25, height: 25 }}>+{selectedPersons.length - 1}</Avatar>
                    )}
                  </AvatarGroup>
                )}
                <Tooltip title="Add Members" arrow>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => {
                      setMembers(true);
                      if (taskMode === 'editTask') {
                        setMode('edit');
                      } else {
                        setMode('forward');
                      }
                    }}
                    sx={{
                      width: 20,
                      height: 20,
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
            ) : (
              <>
                <Box
                  sx={{
                    display: 'block',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '100%',
                  }}
                >
                  {row?.members && row?.members.length > 0 ? (
                    <>
                      <Box
                        display="flex"
                        alignItems="center"
                        gap={1}
                        onClick={() => {
                          setMembers(true);
                          setMode('view');
                        }}
                      >
                        <Tooltip title={`${creatorName}`} arrow>
                          <Avatar
                            alt={creatorName}
                            src={creatorAvatar}
                            sx={{ width: 25, height: 25 }}
                          />
                        </Tooltip>
                        {row?.members.length === 1 && row.creatorId === row.members[0]?.memberId ? (
                          <Label variant="soft" color="warning">
                            <Typography
                              variant="caption"
                              component="span"
                              sx={{
                                display: 'block',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                maxWidth: '100%',
                              }}
                            >
                              {t('tasks.assigned_to_me')}
                            </Typography>
                          </Label>
                        ) : (
                          <AvatarGroup sx={{ cursor: 'pointer' }}>
                            {row?.members.slice(0, 1).map((person) => (
                              <Tooltip key={person?.id} title={`${person?.memberName}`} arrow>
                                <Avatar
                                  key={person.id}
                                  alt={person.memberName}
                                  src={person?.profileImageFileUrl}
                                  sx={{ width: 25, height: 25 }}
                                >
                                  {!person?.profileImageFileUrl &&
                                    person?.memberName?.charAt(0).toUpperCase()}
                                </Avatar>
                              </Tooltip>
                            ))}
                            {row?.members.length > 1 && (
                              <Avatar sx={{ width: 25, height: 25 }}>
                                +{row?.members.length - 1}
                              </Avatar>
                            )}
                          </AvatarGroup>
                        )}
                      </Box>
                    </>
                  ) : (
                    <Box display="flex" alignItems="center" gap={1}>
                      {' '}
                      <Tooltip title={`${creatorName}`} arrow>
                        <Avatar
                          alt={creatorName}
                          src={creatorAvatar}
                          sx={{ width: 25, height: 25 }}
                        />
                      </Tooltip>
                      <Tooltip title={t('tasks.reminder.add_members')} arrow>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => {
                            setMembers(true);
                            setMode('backlog');
                          }}
                          sx={{
                            width: 20,
                            height: 20,
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
                  )}
                </Box>
              </>
            )}
          </TableCell>
        )}
        {!isTicket && (
          <>
            <TableCell
              sx={{ whiteSpace: 'nowrap', borderRight: '1px dotted rgba(200, 200, 200, 0.6)' }}
              align={editingTaskId ? 'center' : ''}
            >
              {editingTaskId === row.id ? (
                <Tooltip title={t('tasks.edit_members')} arrow>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => {
                      setMembers(true);
                      if (taskMode === 'editTask') {
                        setMode('edit');
                      } else {
                        setMode('forward');
                      }
                    }}
                    sx={{
                      width: 20,
                      height: 20,
                      ml: 2,
                      bgcolor: '#006A67',
                      color: 'primary.contrastText',
                      '&:hover': { bgcolor: 'primary.dark' },
                      cursor: 'pointer',
                    }}
                  >
                    <Iconify icon="mdi:account-edit-outline" />
                  </IconButton>
                </Tooltip>
              ) : (
                <>
                  <Box
                    sx={{
                      display: 'block',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '100%',
                    }}
                  >
                    {row?.members && row?.members.length > 0 ? (
                      <>
                        <Box
                          display="flex"
                          alignItems="center"
                          gap={1}
                          onClick={() => {
                            setMembers(true);
                            setMode('view');
                          }}
                        >
                          <Tooltip title={`${creatorName}`} arrow>
                            <Avatar
                              alt={creatorName}
                              src={creatorAvatar}
                              sx={{ width: 25, height: 25 }}
                            />
                          </Tooltip>
                          {row?.members.length === 1 &&
                          row.creatorId === row.members[0]?.memberId ? (
                            <Label variant="soft" color="warning">
                              <Typography
                                variant="caption"
                                component="span"
                                sx={{
                                  display: 'block',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  maxWidth: '100%',
                                }}
                              >
                                {t('tasks.assigned_to_me')}
                              </Typography>
                            </Label>
                          ) : (
                            <AvatarGroup sx={{ cursor: 'pointer' }}>
                              {row?.members.slice(0, 1).map((person) => (
                                <Tooltip key={person?.id} title={`${person?.memberName}`} arrow>
                                  <Avatar
                                    key={person.id}
                                    alt={person.memberName}
                                    src={person?.profileImageFileUrl}
                                    sx={{ width: 25, height: 25 }}
                                  >
                                    {!person?.profileImageFileUrl &&
                                      person?.memberName?.charAt(0).toUpperCase()}
                                  </Avatar>
                                </Tooltip>
                              ))}
                              {row?.members.length > 1 && (
                                <Avatar sx={{ width: 25, height: 25 }}>
                                  +{row?.members.length - 1}
                                </Avatar>
                              )}
                            </AvatarGroup>
                          )}
                        </Box>
                      </>
                    ) : (
                      <Box display="flex" alignItems="center" gap={1}>
                        {' '}
                        <Tooltip title={`${creatorName}`} arrow>
                          <Avatar
                            alt={creatorName}
                            src={creatorAvatar}
                            sx={{ width: 25, height: 25 }}
                          />
                        </Tooltip>
                        <Tooltip title={t('tasks.reminder.add_members')} arrow>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => {
                              setMembers(true);
                              setMode('backlog');
                            }}
                            sx={{
                              width: 20,
                              height: 20,
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
                    )}
                  </Box>
                </>
              )}
            </TableCell>

            <TableCell
              sx={{
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
              }}
              onClick={editingTaskId !== row.id ? handleOpenKanbanDetails : undefined}
              align={storedLang === 'ar' ? 'right' : 'left'}
            >
              <Label variant="soft" color="info">
                {row?.childTaskCount}
              </Label>
            </TableCell>

            <TableCell
              sx={{
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
              }}
              align={storedLang === 'ar' ? 'right' : 'left'}
              onClick={editingTaskId !== row.id ? handleOpenKanbanDetails : undefined}
            >
              {editingTaskId === row.id && row?.type !== 2 ? (
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
              ) : (
                <ListItemText
                  primary={
                    row?.startDate
                      ? `${fDate(row.startDate)}, ${fTime(row.startDate)}`
                      : t('tasks.not_available')
                  }
                  secondary={
                    row?.actualStartDate
                      ? `${fDate(row.actualStartDate)}, ${fTime(row.actualStartDate)}`
                      : t('tasks.not_available')
                  }
                  primaryTypographyProps={{
                    typography: 'body2',
                    sx: {
                      display: 'block',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '100%',
                    },
                  }}
                  secondaryTypographyProps={{
                    mt: 0.5,
                    component: 'span',
                    typography: 'caption',
                    sx: {
                      display: 'block',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '100%',
                    },
                  }}
                />
              )}
            </TableCell>

            <TableCell
              sx={{
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
              }}
              align={storedLang === 'ar' ? 'right' : 'left'}
              onClick={editingTaskId !== row.id ? handleOpenKanbanDetails : undefined}
            >
              {editingTaskId === row.id && row?.type !== 2 ? (
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
              ) : (
                <ListItemText
                  primary={
                    row?.endDate
                      ? `${fDate(row.endDate)}, ${fTime(row.endDate)}`
                      : t('tasks.not_available')
                  }
                  secondary={
                    row?.actualEndDate
                      ? `${fDate(row.actualEndDate)}, ${fTime(row.actualEndDate)}`
                      : t('tasks.not_available')
                  }
                  primaryTypographyProps={{
                    typography: 'body2',
                    sx: {
                      display: 'block',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '100%',
                    },
                  }}
                  secondaryTypographyProps={{
                    mt: 0.5,
                    component: 'span',
                    typography: 'caption',
                    sx: {
                      display: 'block',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '100%',
                    },
                  }}
                />
              )}
            </TableCell>

            <TableCell
              sx={{
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
              }}
              onClick={editingTaskId !== row.id ? handleOpenKanbanDetails : undefined}
              align={storedLang === 'ar' ? 'right' : 'left'}
            >
              <Box
                sx={{
                  display: 'block',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%',
                }}
              >
                <Typography
                  sx={{
                    display: 'block',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '100%',
                  }}
                  variant="caption"
                >
                  {`${
                    row?.members
                      ? row.parentTaskId
                        ? t('tasks.subtask_in')
                        : t('tasks.task_in')
                      : t('tasks.backlog_in')
                  } ${
                    row?.projectId && row?.type === 0
                      ? t('tasks.mission')
                      : row?.vendorContractId
                        ? t('tasks.contract')
                        : row?.vendorId
                          ? t('tasks.vendor')
                          : row?.clientLeadId
                            ? t('tasks.lead')
                            : row?.clientId
                              ? t('tasks.client')
                              : row?.projectId && row?.type === 1
                                ? t('tasks.projects')
                                : row?.projectId && row?.type === 2
                                  ? t('tasks.ticketing')
                                  : t('tasks.general')
                  }`}
                </Typography>
                <Typography variant="caption" component="span" sx={{ color: '#006A67' }}>
                  {row?.categoryName?.value || t('tasks.toast.category_not_available')}
                </Typography>
              </Box>
            </TableCell>
          </>
        )}
        {!isTicket && selectedCategory != 3 && (
          <TableCell
            onClick={
              !isUser
                ? row?.creatorId === zetaUser?.id ||
                  row?.members?.some((member) => member.memberId === zetaUser?.id)
                  ? () => {
                      setSelectedStatus(
                        row?.creatorId === zetaUser?.id ? row?.statusId : matchedMember?.statusId
                      );
                      setOpenStatus(true);
                    }
                  : handleOpenKanbanDetails
                : undefined
            }
            sx={{
              cursor: !isUser ? 'pointer' : 'default',
              borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
            }}
            align={storedLang === 'ar' ? 'right' : 'left'}
          >
            <Box
              sx={{
                display: 'block',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%',
              }}
            >
              {!isUser && (
                <>
                  {row?.creatorId === zetaUser?.id ? (
                    <Label
                      variant="soft"
                      // color={row?.statusColor}
                      sx={{
                        minWidth: {
                          xs: '90px',
                          xl: '120px',
                          background: row?.statusColor,
                          color: '#ffffff',
                        },
                      }}
                    >
                      {' '}
                      <Typography
                        variant="caption"
                        component="span"
                        sx={{
                          display: 'block',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '100%',
                        }}
                      >
                        {row?.statusName?.localizedStrings?.find(
                          (ls) => ls.language.toLowerCase() === storedLang
                        )?.value ||
                          row?.statusName?.value ||
                          t('tasks.kanban_details.statuses.not_started')}
                      </Typography>
                    </Label>
                  ) : (
                    <Label
                      variant="soft"
                      // color={matchedMember?.statusColor}
                      sx={{
                        minWidth: {
                          xs: '90px',
                          xl: '120px',
                          background: matchedMember?.statusColor,
                          color: '#ffffff',
                        },
                      }}
                    >
                      {' '}
                      <Typography
                        variant="caption"
                        component="span"
                        sx={{
                          display: 'block',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '100%',
                        }}
                      >
                        {matchedMember?.statusName?.localizedStrings?.find(
                          (ls) => ls.language.toLowerCase() === storedLang
                        )?.value ||
                          matchedMember?.statusName?.value ||
                          t('tasks.kanban_details.statuses.not_started')}
                      </Typography>
                    </Label>
                  )}
                </>
              )}

              {isUser && (
                <Label
                  variant="soft"
                  sx={{
                    minWidth: { xs: '100px', xl: '120px' },
                    background:
                      selectedCategory === 1
                        ? row?.members?.find((member) => member.memberId === userId)?.statusColor
                        : row?.statusColor,

                    color: '#ffffff',
                  }}
                >
                  <Typography
                    variant="caption"
                    component="span"
                    sx={{
                      display: 'block',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '100%',
                    }}
                  >
                    {selectedCategory === 1
                      ? row?.members
                          ?.find((member) => member.memberId === userId)
                          ?.statusName?.localizedStrings?.find(
                            (ls) => ls.language.toLowerCase() === storedLang
                          )?.value ||
                        row?.members?.find((member) => member.memberId === userId)?.statusName
                          ?.value ||
                        t('tasks.not_available')
                      : row?.statusName?.localizedStrings?.find(
                          (ls) => ls.language.toLowerCase() === storedLang
                        )?.value ||
                        row?.statusName?.value ||
                        t('tasks.not_available')}
                  </Typography>
                </Label>
              )}
            </Box>
          </TableCell>
        )}

        {isTicket && selectedCategory != 3 && (
          <TableCell
            onClick={
              row?.members?.some((member) => member.memberId === zetaUser?.id) ||
              projectMembers?.some((member) => member.memberId === zetaUser?.id)
                ? () => {
                    setSelectedStatus(isProjectMember ? row?.statusId : matchedMember?.statusId);
                    setOpenStatus(true);
                  }
                : handleOpenKanbanDetails
            }
            sx={{
              cursor: !isUser ? 'pointer' : 'default',
              borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
            }}
            align={storedLang === 'ar' ? 'right' : 'left'}
          >
            <Box
              sx={{
                display: 'block',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%',
              }}
            >
              <>
                {projectMembers?.some((member) => member.memberId === zetaUser?.id) ||
                (row?.creatorId === zetaUser?.id && selectedCategory === 0) ? (
                  <Label
                    variant="soft"
                    sx={{
                      minWidth: {
                        xs: '90px',
                        xl: '120px',
                        background: row?.statusColor,
                        color: '#ffffff',
                      },
                    }}
                  >
                    {' '}
                    <Typography
                      variant="caption"
                      component="span"
                      sx={{
                        display: 'block',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '100%',
                      }}
                    >
                      {row?.statusName?.localizedStrings?.find(
                        (ls) => ls.language.toLowerCase() === storedLang
                      )?.value ||
                        row?.statusName?.value ||
                        t('tasks.kanban_details.statuses.not_started')}
                    </Typography>
                  </Label>
                ) : (
                  <Label
                    variant="soft"
                    sx={{
                      minWidth: {
                        xs: '90px',
                        xl: '120px',
                        background: matchedMember?.statusColor,
                        color: '#ffffff',
                      },
                    }}
                  >
                    {' '}
                    <Typography
                      variant="caption"
                      component="span"
                      sx={{
                        display: 'block',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '100%',
                      }}
                    >
                      {matchedMember?.statusName?.localizedStrings?.find(
                        (ls) => ls.language.toLowerCase() === storedLang
                      )?.value ||
                        matchedMember?.statusName?.value ||
                        t('tasks.kanban_details.statuses.not_started')}
                    </Typography>
                  </Label>
                )}
              </>
            </Box>
          </TableCell>
        )}

        <TableCell
          sx={{ cursor: 'pointer', borderRight: '1px dotted rgba(200, 200, 200, 0.6)' }}
          align={storedLang === 'ar' ? 'right' : 'left'}
          onClick={editingTaskId !== row.id ? handleOpenKanbanDetails : undefined}
        >
          {editingTaskId === row.id ? (
            <TextField
              select
              fullWidth
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleUpdateTask();
                }
              }}
              autoFocus
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
          ) : (
            <Box
              sx={{
                display: 'block',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%',
              }}
            >
              <Label
                variant="soft"
                color={
                  row?.priorityName?.value === 'High'
                    ? 'error'
                    : row?.priorityName?.value === 'Low'
                      ? 'info'
                      : row?.priorityName?.value === 'Medium'
                        ? 'warning'
                        : 'info'
                }
                sx={{
                  minWidth: '70px',
                }}
              >
                {storedLang === 'ar'
                  ? row?.priorityName?.localizedStrings?.find(
                      (ls) => ls.language.toLowerCase() === 'ar'
                    )?.value ||
                    row?.priorityName?.value ||
                    'منخفض'
                  : row?.priorityName?.value || 'Low'}
              </Label>
            </Box>
          )}
        </TableCell>
        {/* <TableCell
          sx={{
            whiteSpace: 'nowrap',
            cursor: 'pointer',
            borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
          }}
          onClick={handleOpenKanbanDetails}
        >
          <Box
            sx={{
              display: 'block',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '100%',
            }}
          >
            <Typography
              sx={{
                display: 'block',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%',
                fontWeight: 'bold',
              }}
              variant="caption"
            >
              {`${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(row?.cost ?? 0)} AED`}
            </Typography>
            <Typography variant="caption" component="span" sx={{ color: '#006A67' }}>
              16 hrs
            </Typography>
          </Box>
        </TableCell> */}

        {!isUser && (
          <TableCell
            align="center"
            sx={{
              ...(storedLang === 'ar' && {
                borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
              }),
            }}
          >
            {editingTaskId === row.id ? (
              <>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                      if (!isSubmitting) {
                        handleUpdateTask();
                      }
                    }}
                    disabled={
                      isSubmitting ||
                      (!isTicket &&
                        row?.type === 2 &&
                        row?.creatorId !== zetaUser?.id &&
                        selectedPersons.length === 0)
                    }
                    size="small"
                    sx={{
                      bgcolor: isSubmitting ? 'grey.500' : '#006A67',
                      color: 'primary.contrastText',
                      '&:hover': { bgcolor: 'primary.dark' },
                      textTransform: 'none',
                      padding: '4px 10px',
                    }}
                  >
                    {!isTicket && row?.creatorId === zetaUser?.id && (
                      <>
                        {isSubmitting ? (
                          <CircularProgress size={24} sx={{ color: 'primary.contrastText' }} />
                        ) : mode === 'edit' ? (
                          t('tasks.todo.update')
                        ) : (
                          t('tasks.forward.forward')
                        )}
                      </>
                    )}

                    {!isTicket && row?.creatorId !== zetaUser?.id && (
                      <>
                        {isSubmitting ? (
                          <CircularProgress size={24} sx={{ color: 'primary.contrastText' }} />
                        ) : selectedCategory !== 3 ? (
                          t('tasks.forward.forward')
                        ) : selectedCategory === 3 ? (
                          t('tasks.subtasks.assign')
                        ) : (
                          t('tasks.forward.forward')
                        )}
                      </>
                    )}

                    {isTicket && (
                      <>
                        {isSubmitting ? (
                          <CircularProgress size={24} sx={{ color: 'primary.contrastText' }} />
                        ) : isProjectMember && selectedCategory === 3 ? (
                          t('tasks.subtasks.assign')
                        ) : (
                          t('tasks.edit')
                        )}
                      </>
                    )}
                  </Button>
                  <Tooltip title={t('tasks.todo.cancel')} arrow>
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
              </>
            ) : (
              <>
                {!isTicket && row.type !== 2 && (
                  <>
                    <IconButton
                      color={popover.open ? 'inherit' : 'default'}
                      onClick={popover.onOpen}
                    >
                      <Iconify icon="eva:more-vertical-fill" />
                    </IconButton>
                  </>
                )}
                {!isTicket &&
                  row.type === 2 &&
                  row?.creatorId === zetaUser?.id &&
                  selectedCategory !== 3 && (
                    <>
                      <IconButton
                        color={popover.open ? 'inherit' : 'default'}
                        onClick={popover.onOpen}
                      >
                        <Iconify icon="eva:more-vertical-fill" />
                      </IconButton>
                    </>
                  )}
                {!isTicket &&
                  row.type === 2 &&
                  row?.creatorId !== zetaUser?.id &&
                  selectedCategory === 1 && (
                    <>
                      <IconButton
                        color={popover.open ? 'inherit' : 'default'}
                        onClick={popover.onOpen}
                      >
                        <Iconify icon="eva:more-vertical-fill" />
                      </IconButton>
                    </>
                  )}
                {!isTicket &&
                  row.type === 2 &&
                  row?.creatorId !== zetaUser?.id &&
                  selectedCategory === 3 && (
                    <>
                      <IconButton
                        color={popover.open ? 'inherit' : 'default'}
                        onClick={popover.onOpen}
                      >
                        <Iconify icon="eva:more-vertical-fill" />
                      </IconButton>
                    </>
                  )}
                {isTicket && selectedCategory !== 0 && isProjectMember && (
                  <>
                    <IconButton
                      color={popover.open ? 'inherit' : 'default'}
                      onClick={popover.onOpen}
                    >
                      <Iconify icon="eva:more-vertical-fill" />
                    </IconButton>
                  </>
                )}
                {isTicket &&
                  selectedCategory !== 0 &&
                  selectedCategory !== 5 &&
                  !isProjectMember && (
                    <>
                      <IconButton
                        color={popover.open ? 'inherit' : 'default'}
                        onClick={popover.onOpen}
                      >
                        <Iconify icon="eva:more-vertical-fill" />
                      </IconButton>
                    </>
                  )}
              </>
            )}
          </TableCell>
        )}
      </TableRow>
      <KanbanDetails
        task={row}
        // openDetails={kanbanDetails}
        // onCloseDetails={handleKanbanDetailsDialogClose}
        openDetails={taskDetails.value}
        onCloseDetails={taskDetails.onFalse}
        mainListMutate={mutate}
        documentList={row?.documentId ? documentList : undefined}
        documentListLoading={documentListLoading}
        documentListError={documentListError}
        mutateDocument={mutateDocument}
        onCopyLink={handleCopy}
        taskDescriptionStr={descriptionStr}
        isUser={isUser}
        userId={userId}
        allUsers={allUsers}
        anchor={storedLang === 'ar' ? 'left' : 'right'}
        isTicket={isTicket}
        publicLink={publicLink}
        handleWhatsAppShare={handleWhatsAppShare}
        // Pass other document related states if needed, e.g., documentListValidating, documentListEmpty
        // onUpdateTask={handleUpdateTask}
        // onDeleteTask={handleDeleteTask}
      />

      <CustomPopover
        open={popover.open}
        anchorEl={popover.anchorEl}
        onClose={popover.onClose}
        slotProps={{
          arrow: {
            placement: storedLang === 'ar' ? 'left-top' : 'right-top',
          },
        }}
        sx={{
          ...(storedLang === 'ar' && {
            direction: 'rtl',
            textAlign: 'right',
          }),
        }}
      >
        <MenuList>
          {!isMilestone && (
            <>
              {row?.creatorId === zetaUser?.id && (
                <>
                  {zetaUser?.permissions?.includes('Task.UpdateTask') && !isTicket && (
                    <MenuItem
                      onClick={() => {
                        handleEditTask(row, 'editTask');
                        popover.onClose();
                      }}
                    >
                      <Iconify
                        icon="solar:pen-bold"
                        color="#006A67"
                        sx={{ mr: storedLang === 'ar' ? 0 : 1, ml: storedLang === 'ar' ? 1 : 0 }}
                      />
                      {t('tasks.edit')}
                    </MenuItem>
                  )}

                  {selectedCategory != 3 && !isTicket && row.type !== 2 && (
                    <MenuItem
                      onClick={() => {
                        popover.onClose();

                        setSelectedStatus(row?.statusId);
                        setOpenStatus(true);
                      }}
                    >
                      <Iconify
                        icon="solar:tag-horizontal-bold"
                        color="#006A67"
                        sx={{ mr: storedLang === 'ar' ? 0 : 1, ml: storedLang === 'ar' ? 1 : 0 }}
                      />
                      {t('tasks.change_status')}
                    </MenuItem>
                  )}

                  {/* <MenuItem
                onClick={() => {
                  popover.onClose();
                  handleCopy();
                }}
              >
                <Iconify icon="eva:link-2-fill" />
                Copy Link
              </MenuItem> */}
                  {!isTicket && (
                    <>
                      {zetaUser?.permissions?.includes('Task.DeleteTask') && (
                        <MenuItem
                          onClick={() => {
                            confirm.onTrue();
                            popover.onClose();
                          }}
                          sx={{ color: 'error.main' }}
                        >
                          <Iconify icon="solar:trash-bin-trash-bold" />
                          {t('tasks.delete')}
                        </MenuItem>
                      )}
                    </>
                  )}
                  {isTicket && !isProjectMember && selectedCategory === 3 && (
                    <>
                      <MenuItem
                        onClick={() => {
                          confirm.onTrue();
                          popover.onClose();
                        }}
                        sx={{ color: 'error.main' }}
                      >
                        <Iconify icon="solar:trash-bin-trash-bold" />
                        {t('tasks.delete')}
                      </MenuItem>
                    </>
                  )}
                </>
              )}
              {isTicket &&
                isProjectMember &&
                (selectedCategory === 3 || selectedCategory === 5) && (
                  <MenuItem
                    onClick={() => {
                      handleEditTask(row, 'editTask');
                      popover.onClose();
                    }}
                  >
                    <Iconify
                      icon="solar:pen-bold"
                      color="#006A67"
                      sx={{ mr: storedLang === 'ar' ? 0 : 1, ml: storedLang === 'ar' ? 1 : 0 }}
                    />
                    {selectedCategory === 3 ? t('tasks.subtasks.assign') : t('tasks.edit')}
                  </MenuItem>
                )}

              {!isTicket && row?.creatorId !== zetaUser?.id && selectedCategory === 3 && (
                <MenuItem
                  onClick={() => {
                    handleEditTask(row, 'editTask');
                    popover.onClose();
                  }}
                >
                  <Iconify
                    icon="solar:pen-bold"
                    color="#006A67"
                    sx={{ mr: storedLang === 'ar' ? 0 : 1, ml: storedLang === 'ar' ? 1 : 0 }}
                  />
                  {selectedCategory === 3 ? t('tasks.subtasks.assign') : t('tasks.edit')}
                </MenuItem>
              )}
              {isTicket && !isProjectMember && selectedCategory === 3 && (
                <MenuItem
                  onClick={() => {
                    handleEditTask(row, 'editTask');
                    popover.onClose();
                  }}
                >
                  <Iconify
                    icon="solar:pen-bold"
                    color="#006A67"
                    sx={{ mr: storedLang === 'ar' ? 0 : 1, ml: storedLang === 'ar' ? 1 : 0 }}
                  />
                  {t('tasks.edit')}
                </MenuItem>
              )}
              {!isTicket &&
                row?.members?.some((member) => member.memberId === zetaUser?.id) &&
                row?.creatorId != zetaUser?.id &&
                selectedCategory != 3 && (
                  <MenuItem
                    onClick={() => {
                      popover.onClose();

                      setSelectedStatus(matchedMember?.statusId);
                      setOpenStatus(true);
                    }}
                  >
                    <Iconify icon="solar:tag-horizontal-bold" color="#006A67" />
                    {t('tasks.change_status')}
                  </MenuItem>
                )}

              <MenuItem
                onClick={() => {
                  popover.onClose();

                  handleWhatsAppShare();
                }}
              >
                <Iconify icon="ic:baseline-whatsapp" color="#25D366" />
                Share
              </MenuItem>
              {isTicket &&
                (projectMembers?.some((member) => member.memberId === zetaUser?.id) ||
                  row?.members?.some((member) => member.memberId === zetaUser?.id)) &&
                selectedCategory != 3 && (
                  <MenuItem
                    onClick={() => {
                      popover.onClose();

                      setSelectedStatus(isProjectMember ? row?.statusId : matchedMember?.statusId);
                      setOpenStatus(true);
                    }}
                  >
                    <Iconify icon="solar:tag-horizontal-bold" color="#006A67" />
                    {t('tasks.change_status')}
                  </MenuItem>
                )}

              {selectedCategory === 1 &&
                !zetaUser?.roles?.includes('External') &&
                !isTicket &&
                !assignedForMe && (
                  <MenuItem
                    onClick={() => {
                      handleEditTask(row, 'editTask');
                      popover.onClose();
                    }}
                  >
                    <Iconify icon="ic:round-forward" color="#006A67" />

                    {t('tasks.forward.forward')}
                  </MenuItem>
                )}
            </>
          )}

          {isMilestone && (
            <MenuItem
              onClick={() => {
                confirmDeleteMilestoneTask.onTrue();
                popover.onClose();
              }}
              sx={{ color: 'error.main' }}
            >
              <Iconify icon="solar:trash-bin-trash-bold" />
              {t('tasks.toast.delete_task_milestone')}
            </MenuItem>
          )}
        </MenuList>
      </CustomPopover>
      <ChangeTaskStatus
        open={openStatus}
        shared={statusList}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        onClick={handleOpenStatusDialog}
        handleClose={handleStatusDialogClose}
        onToggleStatus={handleToggleStatus}
        addStatus={addStatus}
      />
      <KanbanMembers
        open={members}
        shared={
          mode === 'edit' || mode === 'backlog'
            ? sharedUsersRow
            : mode === 'forward' && !assignToMe
              ? usersNotInList
              : mode === 'forward' && assignToMe
                ? sharedUsersRow
                : rowMembers
        }
        selectedPersons={selectedPersons}
        setSelectedPersons={setSelectedPersons}
        onTogglePerson={
          mode === 'forward'
            ? handleToggleForwardPerson
            : mode === 'backlog'
              ? handleToggleBacklogPerson
              : handleTogglePerson
        }
        onClick={handleOpenMembers}
        handleClose={handleMemberDialogClose}
        mode={mode}
        creatorName={creatorName}
        creatorAvatar={creatorAvatar}
        creatorDesignation={creatorDesignation}
        assignToMe={mode === 'forward' && assignToMe ? !assignToMe : assignToMe}
        setAssignToMe={setAssignToMe}
        isConfidential={isConfidential}
        setIsConfidential={setIsConfidential}
        handleUpdateTask={handleUpdateTask}
        task={row}
        mutateTasks={mutate}
        reporterStatus={
          row?.statusName?.localizedStrings?.find((ls) => ls.language.toLowerCase() === storedLang)
            ?.value ||
          row?.statusName?.value ||
          t('tasks.not_available')
        }
        isTicket={isTicket}
        statusList={statusList}
        taskCreator={taskCreator}
      />

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
        categoryList={categoryList}
        categoryListEmpty={categoryListEmpty}
        isClient={isClient}
        isLead={isLead}
        isProject={isProject}
      />
      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title={t('tasks.delete')}
        content={t('tasks.confirm_delete')}
        action={
          <Button
            variant="contained"
            color="error"
            onClick={onDeleteRow}
            sx={{
              ...(storedLang === 'ar' && { ml: 1 }),
            }}
          >
            {t('tasks.delete')}
          </Button>
        }
        sx={{
          direction: storedLang === 'ar' ? 'rtl' : 'ltr',
        }}
      />

      <ConfirmDialog
        open={confirmDeleteMilestoneTask.value}
        onClose={confirmDeleteMilestoneTask.onFalse}
        title={t('tasks.delete')}
        content={t('tasks.toast.are_you_sure_want_to_delete_milestone')}
        action={
          <Button
            variant="contained"
            color="error"
            onClick={handleClearMilestoneTasks}
            sx={{
              ...(storedLang === 'ar' && { ml: 1 }),
            }}
          >
            {t('tasks.delete')}
          </Button>
        }
        sx={{
          direction: storedLang === 'ar' ? 'rtl' : 'ltr',
        }}
      />
    </>
  );
}
