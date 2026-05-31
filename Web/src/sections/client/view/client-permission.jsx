'use client';

import { useState, useEffect } from 'react';
import { toast } from 'src/components/snackbar';
import { employees } from 'src/sections/user/user-mock-data';
import { _members } from 'src/sections/kanban/kanban-mock-data';

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
import { AddMemberDetails } from 'src/sections/project/add-member-details';
import { useTranslation } from 'react-i18next';

export function ClientPermission() {
  const { t, i18n } = useTranslation('dashboard/client');
  const [exemptedEmployees, setExemptedEmployees] = useState([]);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [employeesToExempt, setEmployeesToExempt] = useState(null);
  const [selectedPersons, setSelectedPersons] = useState([]);


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

      toast.success(t('clients.toast.employee_exempted'));
    }
  };

  const addNewGroup = (newGroup) => {
    newGroup.empId = newGroup.selectedPersons[0].empId;
    newGroup.name = newGroup.selectedPersons[0].name;
    newGroup.department = newGroup.selectedPersons[0].department;

    newGroup.role = newGroup.selectedPersons[0].role;

    setExemptedEmployees((prevData) => {
      const updatedData = [newGroup, ...prevData];
      return updatedData;
    });

     toast.success(t('clients.toast.permission_added'));
    setSelectedPersons([]);
  };
  const [mode, setMode] = useState('add');

  return (
    <Stack spacing={1} sx={{ p: 3, pt: 1 }}>
      <Box display="flex" justifyContent="end">
        <Button
          startIcon={<Iconify icon="mingcute:add-line" />}
          sx={{ ml: 1 }}
          variant="contained"
          onClick={() => {
            setMembers(true);
          }}
        >
          {t("clients.buttons.add_employees")}
        </Button>
        <AddMemberDetails
          open={members}
          shared={_members}
          selectedPersons={selectedPersons}
          setSelectedPersons={setSelectedPersons}
          onClick={handleOpenMembers}
          handleClose={handleMemberDialogClose}
          onTogglePerson={handleTogglePerson}
          mode={mode}
          addNewGroup={addNewGroup}
        />
      </Box>
      <Grid container spacing={2}>
        {exemptedEmployees.map((employee) => (
          <Grid item key={employee.name} xs={12} sm={6} md={3}>
            <Card
              variant="outlined"
              sx={{
                pt: 1,
                pb: 2,
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
                  <Avatar alt={employee.name} src={employee.avatarUrl} />

                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <Box color="#006A67">{employee.empId}</Box>

                    <ListItemText
                      primary={employee?.name}
                      primaryTypographyProps={{
                        typography: 'h6',
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
                      {employee.department} - {employee.role}
                    </Box>
                    <Box component="span" sx={{ color: 'text.disabled', fontSize: '0.87rem' }}>
                     {("clients.labels.report_to")} : Nowshad RVP
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}
