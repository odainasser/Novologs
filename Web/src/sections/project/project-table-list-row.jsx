'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormContext } from 'react-hook-form';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import AvatarGroup from '@mui/material/AvatarGroup';
import ListItemText from '@mui/material/ListItemText';
import { useTheme, useMediaQuery } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { fDate } from 'src/utils/format-time';

import { updateProject } from 'src/actions/project/projectActions';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Field } from 'src/components/hook-form';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { usePopover, CustomPopover } from 'src/components/custom-popover';

import { mock_status } from 'src/sections/project/project-mock-data';

import { useMockedUser, useAuthContext } from 'src/auth/hooks';

import { ProjectStatus } from './project-status';
import { AddProjectColor } from './add-project-color';
import { AddMemberDetails } from './add-member-details';
import { AddProjectDetails } from './add-project-details';

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

export function ProjectTableListRow({
  row,
  selected,
  onEditRow,
  onSelectRow,
  onAddMore,
  onDeleteRow,
  index,
  onOpenRow,
  tableData,
  setTableData,
  isArchivedView,
  projectDepartments,
  isMission,
  allUsers,
  mutate,
  isTicket,
}) {
  const { t, i18n } = useTranslation('dashboard/projects');
  const storedLang = localStorage.getItem('selectedLang');
  const { zetaUser } = useAuthContext();

  const confirm = useBoolean();
  const confirmActive = useBoolean();
  const confirmDelete = useBoolean();
  const popover = usePopover();
  const quickEdit = useBoolean();
  const theme = useTheme();

  const isLargeScreen = useMediaQuery(theme.breakpoints.up('xl'));
  const rhfMethods = useFormContext();
  // Safely access setValue, in case this component is ever used outside a FormProvider
  const { setValue } = rhfMethods || {};
  const { user } = useMockedUser();
  const getDepartmentPath = (department, allDepartments) => {
    const parent = allDepartments.find((d) => d.id === department.parentDepartmentId);
    if (!parent) return department.name.value;
    return `${getDepartmentPath(parent, allDepartments)} / ${department.name.value}`;
  };
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [newProjectId, setNewProjectId] = useState('');
  const [newName, setNewName] = useState('');
  const [newDepartment, setNewDepartment] = useState('');
  const [openColor, setOpenColor] = useState(false);
  const [projectColor, setProjectColor] = useState('');
  const [goal, setGoal] = useState('');
  const [projectInitiative, setProjectInitiative] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [clientName, setClientName] = useState('');
  const [projectMilestone, setProjectMilestone] = useState('');

  const [taskModules, setTaskModules] = useState([]);
  const [taskTypes, setTaskTypes] = useState([]);
  const [selectedTaskTypes, setSelectedTaskTypes] = useState([]);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const getDepartmentName = (departmentId) =>
    projectDepartments?.find((dep) => dep.id === departmentId)?.name?.value ||
    t('projects.not_available');

  const creatorName = row?.creator?.fullName || t('projects.not_available');
  const creatorAvatar = row?.creator?.profileImageFileUrl
    ? row?.creator?.profileImageFileUrl
    : creatorName.charAt(0).toUpperCase();

  const handleOpenColor = () => {
    setOpenColor(true);
  };
  const handleColorDialogClose = () => {
    setTimeout(() => {
      setOpenColor(false);
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
  const handleDeleteProject = () => {
    onDeleteRow();
    confirmDelete.onFalse();
  };

  const [openStatus, setOpenStatus] = useState(false);
  const handleOpenStatus = () => {
    setOpenStatus(true);
  };
  const handleStatusDialogClose = () => {
    setTimeout(() => {
      setOpenStatus(false);
    }, 100);
  };
  const projectStatusConfig = {
    0: { text: 'Created', textAr: 'تم الإنشاء', color: 'success' },
    1: { text: 'Started', textAr: 'تم البدء', color: 'info' },
    2: { text: 'Closed', textAr: 'مغلق', color: 'default' },
    3: { text: 'Cancelled', textAr: 'تم الإلغاء', color: 'error' },
    4: { text: 'InProgress', textAr: 'قيد التنفيذ', color: 'warning' },
    5: { text: 'Postpone', textAr: 'مؤجل', color: 'secondary' },
    6: { text: 'Amended', textAr: 'معدَّل', color: 'primary' },
    7: { text: 'Reopened', textAr: 'أُعيد فتحه', color: 'info' },
    8: { text: 'Stopped', textAr: 'متوقف', color: 'error' },
  };

  const addNewDetails = (details) => {
    details.goal = goal;
    details.projectInitiative = projectInitiative;
    details.projectMilestone = projectMilestone;
    details.clientName = clientName;
    details.taskType = taskTypes;
    details.modules = taskModules;
  };

  const handleEditProject = (user) => {
    setEditingProjectId(user.id);
    setNewProjectId(user.code);
    setNewName(user.name);
    setNewDepartment(user.departmentId);
    setProjectColor(user.color);
    setGoal(user.goalId);
    setProjectInitiative(user.initiativeId);
    setProjectDescription(user.description);
    setClientName(user.clientId);

    const initialStartDate = user?.startDate || '';
    const initialEndDate = user?.endDate || '';

    setStartDate(initialStartDate);
    setEndDate(initialEndDate);

    if (setValue) {
      setValue('startDate', initialStartDate, { shouldValidate: false, shouldDirty: true });
      setValue('endDate', initialEndDate, { shouldValidate: false, shouldDirty: true });
    }

    // Always reset and populate from the current row being edited
    const initialOwners = (row?.projectMembers || [])
      .filter((member) => member.isOwner)
      .map((member) => allUsers.find((u) => u.id === member.memberId))
      .filter(Boolean);
    setSelectedOwners(initialOwners);

    const initialMembers = (row?.projectMembers || [])
      .filter((member) => !member.isOwner)
      .map((member) => allUsers.find((u) => u.id === member.memberId))
      .filter(Boolean);
    setSelectedPersons(initialMembers);
  };

  const handleUpdateProject = async () => {
    const payload = {
      id: editingProjectId,
      name: newName,
      isMission,
      code: newProjectId,
      description: projectDescription,
      color: projectColor,
      startDate,
      endDate,
      departmentId: newDepartment,
      goalId: goal,
      initiativeId: projectInitiative,
      clientId: clientName,
      members: selectedPersons,
      owners: selectedOwners,
      type: isMission ? 0 : isTicket ? 2 : 1,
      memberList: [
        ...selectedOwners.map((owner) => ({
          memberId: owner.id,
          isOwner: true,
        })),
        ...selectedPersons.map((member) => ({
          memberId: member.id,
          isOwner: false,
        })),
      ],
    };

    console.log('this is the payload', payload);

    try {
      const response = await updateProject(payload);
      if (response.success) {
        if (isMission) {
          toast.success(t('projects.toast.mission_updated_successfully'));
        }
        if (isTicket) {
          toast.success(t('projects.toast.ticket_category_updated'));
        }
        if (!isMission && !isTicket) {
          toast.success(t('projects.toast.project_updated'));
        }
        // Reset all editing states
        setEditingProjectId(null);
        setNewProjectId('');
        setNewName('');
        setNewDepartment('');
        setProjectColor('');
        setGoal('');
        setProjectInitiative('');
        setProjectDescription('');
        setClientName('');
        setStartDate('');
        setEndDate('');
        if (setValue) {
          setValue('startDate', '', { shouldValidate: false, shouldDirty: false });
          setValue('endDate', '', { shouldValidate: false, shouldDirty: false });
        }
        setSelectedOwners([]);
        setSelectedPersons([]);
        await mutate();
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      console.error('Add update failed:', error);
      toast.error(t('projects.toast.project_error'));
    }
  };

  const handleActivateProject = async () => {
    const payload = {
      ...row,
      lifeCycle: 0,
    };

    console.log('this is the payload', payload);

    try {
      const response = await updateProject(payload);
      if (response.success) {
        toast.success(t('projects.toast.project_activated_successfully'));
        await mutate();
        confirmActive.onFalse();
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      console.error('failed:', error);
    }
  };

  const clearField = () => {
    setEditingProjectId(null);
    setNewProjectId('');
    setNewName('');
    setNewDepartment('');
    setProjectColor('');
    setGoal('');
    setProjectInitiative('');
    setProjectDescription('');
    setClientName('');
    setStartDate('');
    setEndDate('');
    if (setValue) {
      setValue('startDate', '', { shouldValidate: false, shouldDirty: false });
      setValue('endDate', '', { shouldValidate: false, shouldDirty: false });
    }
    setSelectedOwners([]);
    setSelectedPersons([]);
  };
  const [isOwner, setIsOwner] = useState(false);

  const [selectedOwners, setSelectedOwners] = useState([]);
  console.log('this is the selected owners', selectedOwners);

  const [selectedPersons, setSelectedPersons] = useState([]);
  const [members, setMembers] = useState(false);
  const [owners, setOwners] = useState(false);

  const filteredMembers = allUsers.filter(
    (member) => !selectedOwners?.some((owner) => owner.id === member.id)
  );
  const viewMembers = row?.projectMembers?.filter((member) => !member.isOwner);

  const filteredOwners = allUsers.filter(
    (member) => !selectedPersons?.some((person) => person.id === member.id)
  );

  const viewOwners = row?.projectMembers?.filter((member) => member.isOwner);
  console.log('this is the owners', viewOwners);

  const handleTogglePerson = (person) => {
    if (editingProjectId === row?.id) {
      const isInitialMember = viewMembers?.some((member) => member.id === person.id);

      setSelectedPersons((prevSelected) => {
        const isAlreadySelected = prevSelected?.some((p) => p.id === person.id);

        if (isAlreadySelected) {
          return prevSelected.filter((p) => p.id !== person.id);
        }

        return [...prevSelected, person];
      });

      if (isInitialMember) {
        console.log(`${person.member.fullName} is an original member`);
      }
    }
  };
  const handleToggleOwner = (person) => {
    console.log('this is the person', person);

    if (editingProjectId === row?.id) {
      const isInitialOwner = viewOwners?.some((owner) => owner.id === person.id);

      setSelectedOwners((prevSelected) => {
        const isAlreadySelected = prevSelected?.some((p) => p.id === person.id);

        if (isAlreadySelected) {
          return prevSelected.filter((p) => p.id !== person.id);
        }

        return [...prevSelected, person];
      });

      if (isInitialOwner) {
        console.log(`${person.member.fullName} is an original owner`);
      }
    }
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

  const [mode, setMode] = useState('');
  const [selectedStatus, setSelectedStatus] = useState([]);
  const handleToggleStatus = (reason) => {
    setSelectedStatus([reason]);
  };
  console.log('this is the selected status', selectedStatus);
  const handleChangeStatus = async () => {
    if (
      !selectedStatus ||
      selectedStatus.length === 0 ||
      typeof selectedStatus[0]?.id === 'undefined'
    ) {
      toast.error(t('projects.toast.no_status_selected'));
      console.error('No status selected or selectedStatus is invalid:', selectedStatus);
      return;
    }

    const newStatusId = selectedStatus[0].id;

    const payload = {
      ...row,
      status: newStatusId,
    };

    try {
      const response = await updateProject(payload);

      if (response.success) {
        toast.success(t('projects.toast.project_status_updated'));

        if (mutate) {
          await mutate();
        }
        handleStatusDialogClose();
      } else {
        toast.error(response.error || t('projects.toast.failed_to_update_status'));
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(t('projects.toast.failed_to_update_status'));
    }
  };
  const handleStartDateChange = (newDate) => {
    setStartDate(newDate);
  };
  const handleEndDateChange = (newDate) => {
    setEndDate(newDate);
  };

  const statusNumber = row?.status;
  let statusText;
  let statusColor;

  if (
    statusNumber !== undefined &&
    statusNumber !== null &&
    projectStatusConfig.hasOwnProperty(statusNumber)
  ) {
    const statusData = projectStatusConfig[statusNumber];

    statusText = storedLang === 'ar' ? statusData?.textAr || statusData?.text : statusData?.text;
    statusColor = projectStatusConfig[statusNumber].color;
  } else {
    statusText = t('projects.fields.created');
    statusColor = 'success';
  }

  const matchedStatus =
    storedLang === 'ar'
      ? mock_status.find((s) => s.nameAr === statusText)
      : mock_status.find((s) => s.name === statusText);

  const hasAccess =
    row?.projectMembers?.some((member) => member?.memberId === zetaUser?.id) ||
    row?.creator?.id === zetaUser?.id ||
    zetaUser?.permissions?.includes('Project.Read');

  const hasActionAccess =
    row?.projectMembers?.some(
      (member) => member?.memberId === zetaUser?.id && member?.isOwner === true
    ) || row?.creator?.id === zetaUser?.id;

  return (
    <>
      <TableRow
        hover
        selected={selected}
        aria-checked={selected}
        tabIndex={-1}
        sx={{ opacity: hasAccess ? 1 : 0.8, cursor: hasAccess ? 'pointer' : 'not-allowed' }}
      >
        <TableCell
          sx={{
            cursor: hasAccess ? 'pointer' : 'not-allowed',
            opacity: hasAccess ? 1 : 0.8,
            borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
          }}
          align="center"
          onClick={hasAccess && editingProjectId !== row?.id ? onOpenRow : undefined}
        >
          <Box>{index + 1}</Box>
        </TableCell>

        <TableCell
          sx={{
            cursor: hasAccess ? 'pointer' : 'not-allowed',
            opacity: hasAccess ? 1 : 0.8,
            borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
          }}
          onClick={hasAccess && editingProjectId !== row?.id ? onOpenRow : undefined}
        >
          <Typography variant="body2" fontWeight="bold">
            {String(row?.serial).padStart(4, '0')}
          </Typography>
        </TableCell>

        <TableCell
          sx={{
            whiteSpace: 'nowrap',
            cursor: hasAccess ? 'pointer' : 'not-allowed',
            opacity: hasAccess ? 1 : 0.8,
            borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
          }}
          align={storedLang === 'ar' ? 'right' : 'left'}
          onClick={hasAccess && editingProjectId !== row?.id ? onOpenRow : undefined}
        >
          {editingProjectId === row?.id ? (
            <TextField
              fullWidth
              size="small"
              value={newProjectId}
              onChange={(e) => setNewProjectId(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleUpdateProject();
                }
              }}
              autoFocus
            />
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
              <Typography
                variant={row?.code ? 'body1' : 'caption'}
                sx={{
                  display: 'block',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%',
                }}
              >
                {row?.code || 'Not Available'}
              </Typography>
            </Box>
          )}
        </TableCell>
        <TableCell
          sx={{
            whiteSpace: 'nowrap',
            cursor: hasAccess ? 'pointer' : 'not-allowed',
            opacity: hasAccess ? 1 : 0.8,
            borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
          }}
          onClick={hasAccess && editingProjectId !== row?.id ? onOpenRow : undefined}
        >
          <Box display="flex" gap={1} alignItems="center">
            <Avatar
              alt={row?.creator?.fullName}
              src={row?.creator?.profileImageFileUrl}
              sx={{ width: 30, height: 30 }}
            >
              {!row?.creator?.profileImageFileUrl && row?.creator?.fullName?.charAt(0)}
            </Avatar>

            <Box
              sx={{
                display: 'block',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%',
              }}
            >
              <ListItemText
                primary={creatorName}
                secondary={`On: ${fDate(row?.created) || 'Not Available'}`}
                primaryTypographyProps={{
                  typography: 'body1',
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
            </Box>
          </Box>
        </TableCell>
        <TableCell
          sx={{
            cursor: hasAccess ? 'pointer' : 'not-allowed',
            opacity: hasAccess ? 1 : 0.8,
            borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
          }}
          onClick={hasAccess && editingProjectId !== row?.id ? onOpenRow : undefined}
        >
          <Box display="flex" gap={1} alignItems="center">
            {!isTicket && (
              <>
                {editingProjectId === row?.id ? (
                  <Box
                    onClick={() => setOpenColor(true)}
                    sx={{
                      width: 10,
                      height: 10,
                      flexShrink: 0,
                      borderRadius: '50%',
                      backgroundColor: projectColor || row?.color || 'grey',
                      cursor: 'pointer',
                      border: '1px solid #ccc',
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      flexShrink: 0,
                      borderRadius: '50%',
                      backgroundColor: row?.color || 'grey',
                      cursor: hasAccess ? 'pointer' : 'not-allowed',
                      opacity: hasAccess ? 1 : 0.8,
                      border: '1px solid #ccc',
                    }}
                  />
                )}
              </>
            )}
            {editingProjectId === row?.id ? (
              <TextField
                fullWidth
                size="small"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleUpdateProject();
                  }
                }}
                autoFocus
              />
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
                <ListItemText
                  primary={row?.name || t('projects.not_available')}
                  {...(!isMission &&
                    !isTicket && {
                      secondary:
                        row?.description || t('projects.employee_card.description_available'),
                    })}
                  sx={{ textAlign: 'justify' }}
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
              </Box>
            )}
          </Box>
        </TableCell>

        <TableCell
          sx={{
            whiteSpace: 'nowrap',
            cursor: hasAccess ? 'pointer' : 'not-allowed',
            opacity: hasAccess ? 1 : 0.8,
            borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
          }}
          align={storedLang === 'ar' ? 'right' : 'left'}
          onClick={hasAccess && editingProjectId !== row?.id ? onOpenRow : undefined}
        >
          {editingProjectId === row?.id ? (
            <TextField
              select
              fullWidth
              value={newDepartment}
              onChange={(e) => setNewDepartment(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleUpdateProject();
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
              {projectDepartments.map((department) => {
                const displayName = getDepartmentPath(department, projectDepartments);
                return (
                  <MenuItem key={department.id} value={department.id}>
                    {displayName}
                  </MenuItem>
                );
              })}
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
              <Typography
                variant="body1"
                sx={{
                  display: 'block',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%',
                }}
              >
                {getDepartmentName(row?.departmentId) || t('projects.not_available')}
              </Typography>
            </Box>
          )}
        </TableCell>
        {!isTicket && (
          <>
            <TableCell
              sx={{
                whiteSpace: 'nowrap',
                cursor: hasAccess ? 'pointer' : 'not-allowed',
                opacity: hasAccess ? 1 : 0.8,
                borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
              }}
              align={storedLang === 'ar' ? 'right' : 'left'}
              onClick={hasAccess && editingProjectId !== row?.id ? onOpenRow : undefined}
            >
              {editingProjectId === row?.id ? (
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
                  <Typography
                    variant="body1"
                    sx={{
                      display: 'block',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '100%',
                    }}
                  >
                    {` ${
                      !row?.startDate || row?.startDate.startsWith('0001-01-01')
                        ? t('projects.not_available')
                        : fDate(row?.startDate)
                    }`}
                  </Typography>
                </Box>
              )}
            </TableCell>

            <TableCell
              sx={{
                whiteSpace: 'nowrap',
                cursor: hasAccess ? 'pointer' : 'not-allowed',
                opacity: hasAccess ? 1 : 0.8,
                borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
              }}
              align={storedLang === 'ar' ? 'right' : 'left'}
              onClick={hasAccess && editingProjectId !== row?.id ? onOpenRow : undefined}
            >
              {editingProjectId === row?.id ? (
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
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
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
                      variant="body1"
                      sx={{
                        display: 'block',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '100%',
                      }}
                    >
                      {` ${
                        !row?.endDate || row?.endDate.startsWith('0001-01-01')
                          ? t('projects.not_available')
                          : fDate(row?.endDate)
                      }`}
                    </Typography>
                  </Box>
                </Box>
              )}
            </TableCell>
          </>
        )}

        <TableCell
          sx={{
            whiteSpace: 'nowrap',
            cursor: hasAccess ? 'pointer' : 'not-allowed',
            opacity: hasAccess ? 1 : 0.8,
            borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
          }}
          align={editingProjectId ? 'center' : storedLang === 'ar' ? 'right' : 'left'}
        >
          {editingProjectId === row?.id ? (
            <Tooltip title={t('projects.edit_owners')} arrow>
              <IconButton
                size="small"
                color="primary"
                onClick={() => {
                  setOwners(true);
                  setIsOwner(true);
                  setMode('edit');
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
              {row?.projectMembers?.filter((member) => member.isOwner).length > 0 ? (
                <Box
                  display="flex"
                  alignItems="center"
                  gap={1}
                  onClick={() => {
                    setOwners(true);
                    setIsOwner(true);
                    setMode('view');
                  }}
                >
                  <AvatarGroup sx={{ cursor: 'pointer' }}>
                    {row?.projectMembers
                      .filter((member) => member.isOwner)
                      .slice(0, 1)
                      .map((person) => (
                        <Tooltip key={person?.memberId} title={`${person?.member.fullName}`} arrow>
                          <Avatar
                            key={person.id}
                            alt={person.member.fullName}
                            src={person.member.profileImageFileUrl}
                            sx={{ width: 30, height: 30 }}
                          >
                            {!person.member.profileImageFileUrl &&
                              person.member.fullName?.charAt(0).toUpperCase()}
                          </Avatar>
                        </Tooltip>
                      ))}
                    {row?.projectMembers?.filter((member) => member.isOwner).length > 1 && (
                      <Avatar sx={{ width: 30, height: 30 }}>
                        +{row?.projectMembers?.filter((member) => member.isOwner).length - 1}
                      </Avatar>
                    )}
                  </AvatarGroup>
                </Box>
              ) : (
                // <Tooltip title={creatorName} arrow>
                //   <Avatar
                //     alt={row?.creator?.fullName}
                //     src={row?.creator?.profileImageFileUrl}
                //     sx={{ width: 30, height: 30 }}
                //     onClick={() => {
                //       setOwners(true);
                //       setIsOwner(true);
                //       setMode('view');
                //     }}
                //   >
                //     {!row?.creator?.profileImageFileUrl && row?.creator?.fullName?.charAt(0)}
                //   </Avatar>
                // </Tooltip>
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
                  {t('projects.not_available')}
                </Typography>
              )}
            </>
          )}
        </TableCell>
        <TableCell
          sx={{
            whiteSpace: 'nowrap',
            cursor: hasAccess ? 'pointer' : 'not-allowed',
            opacity: hasAccess ? 1 : 0.8,
            borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
          }}
          align={editingProjectId ? 'center' : storedLang === 'ar' ? 'right' : 'left'}
        >
          {editingProjectId === row?.id ? (
            <Tooltip title={t('projects.edit_members')} arrow>
              <IconButton
                size="small"
                color="primary"
                onClick={() => {
                  setMembers(true);
                  setIsOwner(false);
                  setMode('edit');
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
              {row?.projectMembers?.filter((member) => !member.isOwner).length > 0 ? (
                <Box
                  display="flex"
                  alignItems="center"
                  gap={1}
                  onClick={() => {
                    setMembers(true);
                    setMode('view');
                    setIsOwner(false);
                  }}
                >
                  <AvatarGroup sx={{ cursor: 'pointer' }}>
                    {row?.projectMembers
                      .filter((member) => !member.isOwner)
                      .slice(0, 1)
                      .map((person) => (
                        <Tooltip key={person?.id} title={`${person?.member.fullName}`} arrow>
                          <Avatar
                            key={person.id}
                            alt={person.member.fullName}
                            src={person.member.profileImageFileUrl}
                            sx={{ width: 30, height: 30 }}
                          >
                            {!person.member.profileImageFileUrl &&
                              person.member.fullName?.charAt(0).toUpperCase()}
                          </Avatar>
                        </Tooltip>
                      ))}
                    {row?.projectMembers?.filter((member) => !member.isOwner).length > 1 && (
                      <Avatar sx={{ width: 30, height: 30 }}>
                        +{row?.projectMembers?.filter((member) => !member.isOwner).length - 1}
                      </Avatar>
                    )}
                  </AvatarGroup>
                </Box>
              ) : (
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
                  {t('projects.not_available')}
                </Typography>
              )}
            </>
          )}
        </TableCell>

        {!isTicket && (
          <>
            <TableCell
              sx={{
                cursor: hasAccess ? 'pointer' : 'not-allowed',
                opacity: hasAccess ? 1 : 0.8,
                borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
              }}
              align={editingProjectId ? 'center' : storedLang === 'ar' ? 'right' : 'left'}
              onClick={hasAccess && editingProjectId !== row?.id ? onOpenRow : undefined}
            >
              {editingProjectId === row?.id ? (
                <Tooltip title={t('projects.edit_project_details')} arrow>
                  <IconButton onClick={() => setDetails(true)}>
                    <Iconify icon="mdi:file-document-edit-outline" sx={{ color: '#006A67' }} />
                  </IconButton>
                </Tooltip>
              ) : isMission ? (
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '100%',
                  }}
                >
                  {row?.description || t('projects.employee_card.description_available')}
                </Typography>
              ) : (
                <ListItemText
                  primary={
                    row?.initiative?.name?.value || t('projects.employee_card.initiative_available')
                  }
                  secondary={
                    row?.goal?.name?.value || t('projects.employee_card.goal_not_available')
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
                cursor: hasAccess ? 'pointer' : 'not-allowed',
                opacity: hasAccess ? 1 : 0.8,
                borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
              }}
              align={storedLang === 'ar' ? 'right' : 'left'}
              onClick={hasActionAccess ? () => setOpenStatus(true) : undefined}
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
                <Label
                  variant="soft"
                  color={statusColor}
                  sx={{ cursor: hasActionAccess ? 'pointer' : 'not-allowed' }}
                >
                  <Typography variant="caption" component="span">
                    {statusText}
                  </Typography>
                </Label>
              </Box>
            </TableCell>
          </>
        )}

        <TableCell
          align="center"
          sx={{
            ...(storedLang === 'ar' && {
              borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
            }),
            cursor: hasAccess ? 'pointer' : 'not-allowed',
            opacity: hasAccess ? 1 : 0.8,
          }}
        >
          {editingProjectId === row?.id ? (
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
                onClick={handleUpdateProject}
                size="small"
                sx={{
                  bgcolor: '#006A67',
                  color: 'primary.contrastText',
                  '&:hover': { bgcolor: 'primary.dark' },
                  textTransform: 'none',
                  padding: '4px 10px',
                }}
              >
                {t('projects.status.update')}
              </Button>
              <Tooltip title={t('projects.cancel')} arrow>
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
          ) : (
            <IconButton
              color={popover.open ? 'inherit' : 'default'}
              onClick={hasActionAccess ? popover.onOpen : undefined}
              sx={{
                cursor: hasActionAccess ? 'pointer' : 'not-allowed',
              }}
            >
              <Iconify icon="eva:more-vertical-fill" />
            </IconButton>
          )}
        </TableCell>
      </TableRow>

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
          {hasActionAccess &&
            ((!isMission && !isTicket) || (isMission && !isTicket) || (!isMission && isTicket)) && (
              <MenuItem
                onClick={() => {
                  handleEditProject(row);
                  popover.onClose();
                }}
              >
                <Iconify
                  icon="solar:pen-bold"
                  color="#006A67"
                  sx={{ mr: storedLang === 'ar' ? 0 : 1, ml: storedLang === 'ar' ? 1 : 0 }}
                />
                {t('projects.table.edit')}
              </MenuItem>
            )}

          {hasActionAccess &&
            !isTicket &&
            ((!isMission && zetaUser?.permissions?.includes('Project.Delete')) ||
              (isMission && zetaUser?.permissions?.includes('Mission.Delete'))) && (
              <>
                {!isArchivedView ? (
                  <MenuItem
                    onClick={() => {
                      confirm.onTrue();
                      popover.onClose();
                    }}
                  >
                    <Iconify
                      icon="mdi:archive-outline"
                      color="grey"
                      sx={{ mr: storedLang === 'ar' ? 0 : 1, ml: storedLang === 'ar' ? 1 : 0 }}
                    />
                    {t('projects.status.archive')}
                  </MenuItem>
                ) : (
                  <MenuItem
                    onClick={() => {
                      confirmActive.onTrue();
                      popover.onClose();
                    }}
                  >
                    <Iconify icon="mdi:checkbox-marked-circle-outline" color="#006A67" />
                    {t('projects.status.active')}
                  </MenuItem>
                )}
              </>
            )}
          {!isTicket && (
            <MenuItem
              onClick={() => {
                setOpenStatus(true);
                popover.onClose();
              }}
            >
              <Iconify
                icon="solar:tag-horizontal-bold"
                color="#006A67"
                sx={{ mr: storedLang === 'ar' ? 0 : 1, ml: storedLang === 'ar' ? 1 : 0 }}
              />
              {t('projects.status.change_status')}
            </MenuItem>
          )}

          {/* <MenuItem
            onClick={() => {
              confirmDelete.onTrue();
              popover.onClose();
            }}
            sx={{ color: 'error.main' }}
          >
            <Iconify icon="solar:trash-bin-trash-bold" />
            {t('projects.table.actions_delete')}
          </MenuItem> */}
        </MenuList>
      </CustomPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title={t('projects.status.archive')}
        content={t('projects.status.content_archive')}
        action={
          <Button
            variant="contained"
            onClick={handleDeleteProject}
            sx={{
              ...(storedLang === 'ar' && { ml: 1 }),
            }}
          >
            {t('projects.status.archive')}
          </Button>
        }
        sx={{
          direction: storedLang === 'ar' ? 'rtl' : 'ltr',
        }}
      />
      <ConfirmDialog
        open={confirmActive.value}
        onClose={confirmActive.onFalse}
        title={t('projects.status.active')}
        content={t('projects.status.content_active')}
        action={
          <Button
            variant="contained"
            onClick={handleActivateProject}
            sx={{
              ...(storedLang === 'ar' && { ml: 1 }),
            }}
          >
            {' '}
            {t('projects.status.active')}
          </Button>
        }
        sx={{
          direction: storedLang === 'ar' ? 'rtl' : 'ltr',
        }}
      />
      <ConfirmDialog
        open={confirmDelete.value}
        onClose={confirmDelete.onFalse}
        title={t('projects.table.actions_delete')}
        content={t('projects.table.content3')}
        action={
          <Button variant="contained" color="error" onClick={handleDeleteProject}>
            {t('projects.table.actions_delete')}
          </Button>
        }
      />
      <AddProjectColor
        open={openColor}
        onClick={handleOpenColor}
        handleClose={handleColorDialogClose}
        projectColor={projectColor || row?.color}
        setProjectColor={setProjectColor}
      />
      <AddProjectDetails
        open={details}
        onClick={handleOpenDetails}
        handleClose={handleDetailsDialogClose}
        addNewDetails={addNewDetails}
        goal={goal || row?.goal?.name?.value}
        setGoal={setGoal}
        projectInitiative={projectInitiative || row?.initiative?.name?.value}
        projectDescription={projectDescription || row?.description}
        setProjectDescription={setProjectDescription}
        setProjectInitiative={setProjectInitiative}
        clientName={clientName || row?.clientId}
        setClientName={setClientName}
        projectMilestone={projectMilestone}
        setProjectMilestone={setProjectMilestone}
        taskModules={taskModules}
        setTaskModules={setTaskModules}
        taskTypes={taskTypes}
        setTaskTypes={setTaskTypes}
        selectedTaskTypes={selectedTaskTypes}
        setSelectedTaskTypes={setSelectedTaskTypes}
      />
      <ProjectStatus
        open={openStatus}
        shared={mock_status}
        matchedStatus={matchedStatus}
        onClose={handleStatusDialogClose}
        onToggleStatus={handleToggleStatus}
        onChangeStatus={handleChangeStatus}
      />
      <AddMemberDetails
        open={owners}
        shared={mode === 'edit' ? filteredOwners : viewOwners}
        selectedPersons={selectedOwners}
        setSelectedPersons={setSelectedOwners}
        onClick={handleOpenOwners}
        handleClose={handleOwnerDialogClose}
        onTogglePerson={handleToggleOwner}
        isOwner={isOwner}
        mode={mode}
      />
      <AddMemberDetails
        open={members}
        shared={mode === 'edit' ? filteredMembers : viewMembers}
        selectedPersons={selectedPersons}
        setSelectedPersons={setSelectedPersons}
        onClick={handleOpenMembers}
        handleClose={handleMemberDialogClose}
        onTogglePerson={handleTogglePerson}
        mode={mode}
        isOwner={isOwner}
      />
    </>
  );
}
