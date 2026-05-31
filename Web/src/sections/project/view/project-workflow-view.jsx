'use client';

import { useState, useEffect } from 'react';
import { toast } from 'src/components/snackbar';
import { employees } from 'src/sections/user/user-mock-data';
import { _members } from 'src/sections/kanban/kanban-mock-data';
import { useTheme } from '@mui/material/styles';
import { useAuthContext } from 'src/auth/hooks';
import { DashboardContent } from 'src/layouts/dashboard';
import { IconButton } from '@mui/material';
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
import { AddProjectWorkflow } from '../add-project-workflow';
import { useTranslation } from 'react-i18next';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { KanbanListView } from 'src/sections/kanban/view/kanban-list-view';
import { WorkflowFileView } from './workflow-file-view';
import { WorkflowDetailsView } from './workflow-details-view';

// ----------------------------------------------------------------------

export function ProjectWorkflowView({ projectId, projectRootFolderId }) {
  const { t, i18n } = useTranslation('dashboard/projects');
  const storedLang = localStorage.getItem('selectedLang');

  const theme = useTheme();
  const { zetaUser } = useAuthContext();
  const isMilestone = true;

  const [selectedButton, setSelectedButton] = useState('workflow');

  const [openWorkflow, setOpenWorkflow] = useState(false);

  const handleOpenWorkflow = () => {
    setOpenWorkflow(true);
  };
  const handleWorkflowDialogClose = () => {
    setTimeout(() => {
      setOpenWorkflow(false);
    }, 100);
  };

  const [workflowData, setWorkflowData] = useState({
    title: 'My Project Workflow',
    steps: ['Initiate', 'Review', 'Approve'],
  });

  const handleEditWorkflow = () => {
    setOpenWorkflow(true);
  };
  const isProject = true;

  return (
    <>
      {selectedButton === 'workflow' && (
        <Stack spacing={1} sx={{ pt: 1 }}>
          <Box display="flex" justifyContent="end">
            <Button
              startIcon={
                <Iconify
                  icon={workflowData ? 'solar:pen-bold' : 'mingcute:add-line'}
                  sx={{
                    ...(storedLang === 'ar' && { ml: 1 }),
                  }}
                />
              }
              variant="contained"
              onClick={handleEditWorkflow}
            >
              {workflowData ? 'Edit Project Workflow' : 'Add Project Workflow'}
            </Button>

            <AddProjectWorkflow
              open={openWorkflow}
              onClick={handleOpenWorkflow}
              handleClose={handleWorkflowDialogClose}
              existingWorkflow={workflowData}
            />
          </Box>
          <Grid container spacing={2}>
            {workflowData && (
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined" sx={{ pt: 2, pb: 2, px: 2 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 1,
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        gap: 0.5,
                      }}
                    >
                      {' '}
                      <Typography variant="h6" sx={{ mb: 1 }}>
                        {workflowData.title}
                      </Typography>
                      <Tooltip title="View workflow" arrow>
                        <IconButton
                          color="default"
                          onClick={() => setSelectedButton('viewAll')}
                          sx={{ color: '#006A67' }}
                        >
                          <Iconify icon="mdi:eye" width={16} />
                        </IconButton>
                      </Tooltip>
                    </Box>

                    <Tooltip title={zetaUser?.fullName} arrow>
                      <Avatar
                        alt={zetaUser?.fullName}
                        src={
                          zetaUser?.profileImageFileUrl ||
                          zetaUser?.fullName?.charAt(0).toUpperCase()
                        }
                      />
                    </Tooltip>
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {workflowData.steps.map((stepLabel, stepIndex) => (
                      <Box
                        key={stepIndex}
                        sx={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          position: 'relative',
                        }}
                      >
                        <Box
                          sx={{
                            minWidth: 24,
                            height: 24,
                            borderRadius: '50%',
                            bgcolor: '#006A67',
                            color: 'white',
                            fontSize: 12,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                            zIndex: 1,
                            mt: '2px',
                          }}
                        >
                          {stepIndex + 1}
                        </Box>

                        {stepIndex < workflowData.steps.length - 1 && (
                          <>
                            <Box
                              sx={{
                                position: 'absolute',
                                ...(storedLang === 'ar' ? { right: 11 } : { left: 11 }),
                                top: 24,
                                width: 2,
                                height: 32,
                                backgroundColor: theme.palette.warning.main,
                                zIndex: 0,
                              }}
                            />
                            <Box
                              sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                mt: '46px',
                                mb: '-24px',
                                ...(storedLang === 'ar' ? { mr: '-22px' } : { ml: '-22px' }),
                              }}
                            >
                              <KeyboardArrowDownIcon
                                sx={{
                                  color: theme.palette.warning.main,
                                  fontSize: 20,
                                }}
                              />
                            </Box>
                          </>
                        )}
                        <Box
                          sx={{
                            ...(storedLang === 'ar' ? { mr: 2 } : { ml: 2 }),
                            mt: 1,
                            display: 'flex',
                            justifyContent: 'space-between',
                            width: '100%',
                          }}
                        >
                          <Box>
                            <Typography variant="body2" color="text.primary">
                              {stepLabel}
                            </Typography>
                          </Box>

                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="Tasks" arrow>
                              <Iconify
                                icon="solar:checklist-bold"
                                width={16}
                                color="#006A67"
                                sx={{ cursor: 'pointer' }}
                                onClick={() => setSelectedButton('tasks')}
                              />
                            </Tooltip>

                            <Tooltip title="Files" arrow>
                              <Iconify
                                icon="mdi:folder"
                                width={16}
                                color="#006A67"
                                sx={{ cursor: 'pointer' }}
                                onClick={() => setSelectedButton('files')}
                              />
                            </Tooltip>
                          </Box>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Card>
              </Grid>
            )}
          </Grid>
        </Stack>
      )}
      {selectedButton === 'tasks' && (
        <>
          <Stack direction="row" alignItems="center" sx={{ my: 1 }}>
            <Button
              onClick={() => {
                setSelectedButton('workflow');
              }}
              variant="outlined"
              startIcon={
                <Iconify
                  icon="eva:arrow-back-fill"
                  sx={{
                    transform: storedLang === 'ar' ? 'rotate(180deg)' : 'none',
                    ...(storedLang === 'ar' && { ml: 1 }),
                  }}
                />
              }
            >
              Back
            </Button>
          </Stack>
          <KanbanListView isProject={isProject} projectId={projectId} />
        </>
      )}

      {selectedButton === 'viewAll' && (
        <>
          <Box display="flex" justifyContent="space-between">
            <Stack direction="row" alignItems="center" sx={{ my: 1 }} spacing={1}>
              <Button
                onClick={() => {
                  setSelectedButton('workflow');
                }}
                variant="outlined"
                startIcon={
                  <Iconify
                    icon="eva:arrow-back-fill"
                    sx={{
                      transform: storedLang === 'ar' ? 'rotate(180deg)' : 'none',
                      ...(storedLang === 'ar' && { ml: 1 }),
                    }}
                  />
                }
              >
                Back
              </Button>
              <Typography variant="h6" sx={{ mb: 1 }}>
                {workflowData.title}
              </Typography>
            </Stack>{' '}
            <Box>
              <Button
                startIcon={
                  <Iconify
                    icon="mingcute:add-line"
                    sx={{
                      ...(storedLang === 'ar' && { ml: 1 }),
                    }}
                  />
                }
                sx={{ ml: 1 }}
                variant="contained"
                onClick={handleEditWorkflow}
              >
                Add Workflow steps
              </Button>
              <AddProjectWorkflow
                open={openWorkflow}
                onClick={handleOpenWorkflow}
                handleClose={handleWorkflowDialogClose}
                existingWorkflow={workflowData}
              />
            </Box>
          </Box>
          <WorkflowDetailsView
            isProject={isProject}
            projectId={projectId}
            isMilestone={isMilestone}
          />
        </>
      )}
      {selectedButton === 'files' && (
        <>
          <Stack direction="row" alignItems="center" sx={{ my: 1 }}>
            <Button
              onClick={() => {
                setSelectedButton('workflow');
              }}
              variant="outlined"
              startIcon={
                <Iconify
                  icon="eva:arrow-back-fill"
                  sx={{
                    transform: storedLang === 'ar' ? 'rotate(180deg)' : 'none',
                    ...(storedLang === 'ar' && { ml: 1 }),
                  }}
                />
              }
            >
              Back
            </Button>
          </Stack>
          <WorkflowFileView
          // isProject={isProject}
          // projectId={projectId}
          // projectRootFolderId={projectRootFolderId}
          />
        </>
      )}
    </>
  );
}
