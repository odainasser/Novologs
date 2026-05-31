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
import Chip from '@mui/material/Chip';
import { EditPermission } from '../edit-permission';
import { _levels } from 'src/sections//user/user-mock-data';
import { useTranslation } from 'react-i18next';



export function SetHierarchyView() {
  const {t}=useTranslation('dashboard/teams');

  const [hierarchyEmployees, setHierarchyEmployees] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState([]);

  const [level, setLevel] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const handleToggleLevel = (level) => {
    setSelectedLevel(level);
  };
  const handleOpenLevelDialog = (employee) => {
    setSelectedEmployee(employee);
    setSelectedLevel({ id: employee.taskPermissionLevel, value: employee.taskPermissionLevel });
    setLevel(true);
  };
  const handleLevelDialogClose = () => {
    setTimeout(() => {
      setLevel(false);
      setSelectedEmployee(null);
    }, 100);
  };

  useEffect(() => {
    setHierarchyEmployees(employees);
  }, []);

  return (
    <>
      <Stack spacing={3} sx={{ p: 3 }}>
        <Grid container spacing={2}>
          {hierarchyEmployees.map((employee) => (
            <Grid item key={employee.name} xs={12} sm={6} md={3}>
              <Card
                variant="outlined"
                sx={{
                  py: 1,
                  px: 2,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
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
                        alignItems: 'flex-start',
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
                        Reporting to : Nowshad RVP
                      </Box>
                      <Box display="flex" gap={1}>
                        <Chip
                          label={`Level : ${employee.level}`}
                          size="small"
                          sx={{ bgcolor: '#006A67', mt: 1 }}
                        />
                        <Chip
                          label={`Permission Level : ${employee.taskPermissionLevel}`}
                          size="small"
                          sx={{ bgcolor: '#006A67', mt: 1 }}
                        />
                      </Box>
                    </Box>
                  </Box>

                  <Tooltip title={t("hierarchy.edit_permission_level")} arrow>
                    <Iconify
                      icon="solar:pen-bold"
                      color="text.secondary"
                      width="13"
                      height="13"
                      sx={{ cursor: 'pointer' }}
                      onClick={() => {
                        setSelectedEmployee(employee);
                        setSelectedLevel({
                          id: employee.taskPermissionLevel,
                          value: employee.taskPermissionLevel,
                        });
                        setLevel(true);
                      }}
                    />
                  </Tooltip>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Stack>
      {selectedEmployee && (
        <EditPermission
          open={level}
          shared={Array.from({ length: selectedEmployee.taskPermissionLevel }, (_, i) => ({
            id: i + 1,
            value: i + 1,
          }))}
          selectedLevel={selectedLevel}
          onClose={handleLevelDialogClose}
          onClick={() => handleOpenLevelDialog(selectedEmployee)}
          onToggleLevel={handleToggleLevel}
        />
      )}
    </>
  );
}
