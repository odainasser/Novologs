'use client';

import { useState, useEffect } from 'react';
import { toast } from 'src/components/snackbar';
import { employees, _members } from 'src/sections/user/user-mock-data';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { ConfirmDialog } from 'src/components/custom-dialog';
import Tooltip from '@mui/material/Tooltip';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Box from '@mui/material/Box';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import { Iconify } from 'src/components/iconify';
import { AddMember } from '../add-member';
import { useTranslation } from 'react-i18next';
import { useBoolean } from 'src/hooks/use-boolean';
import { getUser } from 'src/actions/userManage/userManageActions';
import {
  getPermissionList,
  getUsersWithPermission,
  unassignPermissionToUser,
} from 'src/actions/userManage/userManageActions';

export function TaskExemptedView({
  isTaskExempt,
  isAI,
  isProjectViewAll,
  isProjectCreate,
  isViewAllContract,
  isCreateGroup,
  isViewAllClients,
  isViewDashboard,
  isAccountsAccessible,
  mutateAvailableUsers,
}) {
  const { t, i18n } = useTranslation('dashboard/teams');
  const { permissionList } = getPermissionList();
  const subFilters = [
    {
      fieldName: 'emailConfirmed',
      fieldValue: true,
      operator: 0,
      logicOperator: 0,
    },
  ];
  const getUsersParams = {
    pagination: {
      pageNumber: 1,
      pageSize: 1000,
    },
    search: {
      fieldName: 'isActive',
      fieldValue: true,
      operator: 0,
      logicOperator: 0,
      subFilters,
    },
  };
  const {
    usersList,
    usersListLoading,
    usersListError,
    usersListValidating,
    usersListEmpty,
    mutate,
  } = getUser(getUsersParams);

  let targetPermission;
  if (isTaskExempt) {
    targetPermission = permissionList.permissions.find((p) => p.name === 'Task.DontAssigneTasks');
  }
  if (isAI) {
    targetPermission = permissionList.permissions.find((p) => p.name === 'Task.CreateAITask');
  }
  if (isProjectCreate) {
    targetPermission = permissionList.permissions.find((p) => p.name === 'Project.Create');
  }
  if (isProjectViewAll) {
    targetPermission = permissionList.permissions.find((p) => p.name === 'Project.ViewAll');
  }

  if (isViewAllContract) {
    targetPermission = permissionList.permissions.find((p) => p.name === 'Contract.ViewAll');
  }
  if (isCreateGroup) {
    targetPermission = permissionList.permissions.find((p) => p.name === 'UserGroups.AddUserGroup');
  }
  if (isViewAllClients) {
    targetPermission = permissionList.permissions.find((p) => p.name === 'Client.ViewAll');
  }
  if (isViewDashboard) {
    targetPermission = permissionList.permissions.find((p) => p.name === 'General.ViewAll');
  }

  const getUserParams = {
    pagination: {
      pageNumber: 1,
      pageSize: 1000,
    },
    permissionId: targetPermission?.id,
    permissionName: targetPermission?.name,
  };

  const {
    usersPermissionList,
    usersPermissionListLoading,
    usersPermissionListError,
    usersPermissionListValidating,
    usersPermissionListEmpty,
    mutate: usersPermissionListMutate,
  } = getUsersWithPermission(getUserParams);

  console.log('this is the permissionList', permissionList.permissions);

  const [exemptedEmployees, setExemptedEmployees] = useState([]);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [employeesToExempt, setEmployeesToExempt] = useState(null);
  const [selectedPersons, setSelectedPersons] = useState([]);
  const confirmUnassign = useBoolean();

  console.log('this is the target', targetPermission);

  const [permissionToUnassign, setPermissionToUnassign] = useState(null);

  const [members, setMembers] = useState(false);
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
    setTimeout(() => {
      setMembers(false);
    }, 100);
  };

  const handleCloseDialog = () => {
    setOpenConfirmDialog(false);
    setEmployeesToExempt(null);
  };

  useEffect(() => {
    setExemptedEmployees(employees.filter((employee) => employee.isTaskExempted === true));
  }, []);

  const handleExemptEmployee = async (employeesToRemove) => {
    if (employeesToRemove.id) {
      toast.success(t('task_exempted.toast.exempt_success'));
    }
  };

  const addNewGroup = (newGroup) => {
    newGroup.empId = newGroup.selectedPersons[0].empId;
    newGroup.name = newGroup.selectedPersons[0].name;
    newGroup.department = newGroup.selectedPersons[0].department;

    newGroup.role = newGroup.selectedPersons[0].role;
    // const newGroups = newGroup.selectedPersons.map((person) => ({
    //   empId: person.empId,
    //   name: person.name,
    //   department: person.department,
    //   role: person.role,
    // }));
    // console.log('mapped new groups:', newGroups);

    setExemptedEmployees((prevData) => {
      const updatedData = [newGroup, ...prevData];
      return updatedData;
    });

    toast.success(t('task_exempted.toast.exempt_success'));
    setSelectedPersons([]);
  };
  const [mode, setMode] = useState('add');

  const handleUnassignPermission = async () => {
    const payload = {
      userIds: [permissionToUnassign?.id],
      permissionIds: [targetPermission?.id],
    };
    console.log('this is the payload', payload);
    try {
      const response = await unassignPermissionToUser(payload);
      if (response.success) {
        toast.success(
          isTaskExempt
            ? t('task_exempted.toast.task_assign')
            : t('task_exempted.toast.permission_removed')
        );

        setPermissionToUnassign(null);
        if (isTaskExempt) {
          await mutateAvailableUsers();
        }
        await mutate();
        await usersPermissionListMutate();

        confirmUnassign.onFalse();
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      console.error('Unassign Permissions failed:', error);
    }
  };

  return (
    <Stack spacing={1} sx={{ p: 3, pt: 1 }}>
      <Box display="flex" justifyContent="end">
        <Button
          startIcon={<Iconify icon="mingcute:add-line" />}
          sx={{ ml: 1, bgcolor: '#006A67' }}
          variant="contained"
          onClick={() => {
            setMembers(true);
          }}
        >
          {t('task_exempted.buttons.add_employees')}
        </Button>
        <AddMember
          open={members}
          // shared={employees.filter((employee) => employee.isTaskExempted === false)}
          shared={usersList?.users?.filter(
            (user) => !usersPermissionList?.users?.some((u) => u.id === user.id)
          )}
          selectedPersons={selectedPersons}
          setSelectedPersons={setSelectedPersons}
          onClick={handleOpenMembers}
          handleClose={handleMemberDialogClose}
          onTogglePerson={handleTogglePerson}
          mode={mode}
          addNewGroup={addNewGroup}
          targetPermission={targetPermission}
          mutateUserList={mutate}
          usersPermissionListMutate={usersPermissionListMutate}
          isTaskExempt={isTaskExempt}
          mutateAvailableUsers={mutateAvailableUsers}
        />
      </Box>
      <Grid container spacing={2}>
        {usersPermissionList?.users.map((employee) => (
          <Grid item key={employee.fullName} xs={12} sm={6} md={3}>
            <Card
              variant="outlined"
              sx={{
                pt: 1,
                px: 2,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <Avatar
                    alt={employee.fullName}
                    src={
                      employee.profileImageFileUrl || employee?.fullName?.charAt(0).toUpperCase()
                    }
                  />

                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <Typography variant="body2" color="#006A67">
                      {String(employee?.serial).padStart(4, '0')}
                    </Typography>

                    <ListItemText
                      primary={employee?.fullName}
                      primaryTypographyProps={{
                        typography: 'h6',
                        display: 'block',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '100%',
                      }}
                      secondaryTypographyProps={{
                        color: 'inherit',
                        component: 'span',
                        typography: 'body2',
                        sx: { opacity: 0.48 },
                      }}
                    />
                    <Box
                      component="span"
                      sx={{
                        color: 'text.disabled',
                        fontSize: '0.87rem',
                        display: 'block',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '100%',
                      }}
                    >
                      {employee.departmentName?.value} - {employee.designationName?.value}
                    </Box>
                  </Box>
                </Box>

                {/* <Checkbox size="small" /> */}
                <Checkbox
                  defaultChecked
                  onChange={(e) => {
                    if (!e.target.checked) {
                      // user is unchecking → confirm
                      setPermissionToUnassign(employee);
                      confirmUnassign.onTrue();
                    }
                  }}
                />
              </Box>

              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mt: 2 }}
              >
                <Stack direction="row" spacing={1}>
                  <ConfirmDialog
                    open={openConfirmDialog}
                    onClose={handleCloseDialog}
                    title={t('task_exempted.dialog.exempt_title')}
                    content={t('task_exempted.dialog.exempt_confirm')}
                    action={
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => {
                          handleExemptEmployee(employeesToExempt);
                          handleCloseDialog();
                        }}
                      >
                        {t('task_exempted.buttons.confirm_exempt')}
                      </Button>
                    }
                  />
                </Stack>
              </Stack>
            </Card>
          </Grid>
        ))}
      </Grid>
      <ConfirmDialog
        open={confirmUnassign.value}
        onClose={confirmUnassign.onFalse}
        title={
          isTaskExempt
            ? t('task_exempted.labels.assign_tasks')
            : t('task_exempted.labels.remove_permission')
        }
        content={
          isTaskExempt
            ? t('task_exempted.labels.are_you_sure_want_back')
            : t('task_exempted.labels.are_you_sure_want_remove')
        }
        action={
          <Button
            variant="contained"
            onClick={handleUnassignPermission}
            sx={{
              backgroundColor: isTaskExempt ? '#006A67' : 'red',
              '&:hover': {
                backgroundColor: isTaskExempt ? '#00504d' : '#c62828',
              },
            }}
          >
            {t('task_exempted.buttons.confirm_exempt')}
          </Button>
        }
      />
    </Stack>
  );
}
