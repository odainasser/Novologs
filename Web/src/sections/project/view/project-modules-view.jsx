'use client';

import { useState, useEffect } from 'react';
import { toast } from 'src/components/snackbar';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { ConfirmDialog } from 'src/components/custom-dialog';
import Tooltip from '@mui/material/Tooltip';
import { Iconify } from 'src/components/iconify';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import {
  getProjectModules,
  addProjectModule,
  updateProjectModule,
  deleteProjectModule,
} from 'src/actions/project/projectActions';
import { useTranslation } from 'react-i18next';

export function ProjectModulesView({ projectId }) {


  const {t,i18n}=useTranslation('dashboard/projects');
  const { projectModuleList, projectModuleListEmpty, mutate } = getProjectModules(projectId);

  const [newProjectModule, setNewProjectModule] = useState('');
  const [newProjectModuleAr, setNewProjectModuleAr] = useState('');
  const [editingProjectModuleId, setEditingProjectModuleId] = useState(null);
  const [openProjectModuleConfirmDialog, setOpenProjectModuleConfirmDialog] = useState(false);
  const [projectModuleToDelete, setProjectModuleToDelete] = useState(null);

  const handleOpenProjectModuleDialog = (projectModule) => {
    setProjectModuleToDelete(projectModule);
    setOpenProjectModuleConfirmDialog(true);
  };

  const handleCloseProjectModuleDialog = () => {
    setOpenProjectModuleConfirmDialog(false);
    setProjectModuleToDelete(null);
  };

  const handleAddProjectModule = async () => {
    if (newProjectModule.trim()) {
      const payload = {
        projectId: projectId,
        name: {
          value: newProjectModule,
          localizedStrings: newProjectModuleAr
            ? [
                {
                  language: 'ar',
                  value: newProjectModuleAr,
                },
              ]
            : undefined,
        },
      };

      try {
        const response = await addProjectModule(payload);
        if (response.success) {
          await mutate();
          toast.success(t('projects.Projectmodule.project_module_added'));
        } else {
          toast.error(response.error);
        }
      } catch (error) {
        console.error('Add module failed:', error);
      }

      setNewProjectModule('');
      setNewProjectModuleAr('');
    }
  };

  const handleRemoveProjectModule = async (projectModuleToRemove) => {
    if (projectModuleToRemove?.id) {
      try {
        const response = await deleteProjectModule(projectModuleToRemove.id);
        if (response.success) {
          await mutate();
         
           toast.success(t('projects.Projectmodule.project_module_deleted'));
        } else {
          toast.error(response.error);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      }
    }
  };

  const handleEditProjectModule = (projectModule) => {
    setEditingProjectModuleId(projectModule.id);
    setNewProjectModule(projectModule.name.value);
    setNewProjectModuleAr(projectModule?.name.localizedStrings[0]?.value);
  };

  const handleUpdateProjectModule = async () => {
    if (!editingProjectModuleId) return;
    const projectModule = projectModuleList.projectModules.find(
      (s) => s.id === editingProjectModuleId
    );
    if (!projectModule) return;
    if (newProjectModule.trim() && editingProjectModuleId) {
      const payload = {
        projectId: projectId,
        id: editingProjectModuleId,
        name: {
          id: projectModule.name.id,
          value: newProjectModule,
          localizedStrings: newProjectModuleAr
            ? [
                {
                  id: projectModule?.name?.localizedStrings?.[0]?.id,
                  language: 'ar',
                  value: newProjectModuleAr,
                },
              ]
            : [],
        },
      };

      try {
        const response = await updateProjectModule(payload);
        if (response.success) {
          await mutate();
           toast.success(t('projects.Projectmodule.project_module_updated'));

          setEditingProjectModuleId(null);
          setNewProjectModule('');
          setNewProjectModuleAr('');
        } else {
          toast.error(response.error || '');
        }
      } catch (error) {
        console.error('Update module failed:', error);
      }
    }
  };

  return (
    <>
      <Stack spacing={3} sx={{ p: 3 }}>
        <Grid container spacing={2}>
          {projectModuleList.projectModules.map((projectModule) => (
            <Grid item key={projectModule.id} xs={12} sm={6} md={3}>
              <Card variant="outlined" sx={{ p: 2 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  {editingProjectModuleId === projectModule.id ? (
                    <>
                      <TextField
                        fullWidth
                        size="small"
                        value={newProjectModule}
                        onChange={(e) => setNewProjectModule(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleUpdateProjectModule();
                          }
                        }}
                        autoFocus
                      />
                      <TextField
                        fullWidth
                        size="small"
                        value={newProjectModuleAr}
                        onChange={(e) => setNewProjectModuleAr(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleUpdateProjectModule();
                          }
                        }}
                        sx={{ ml: 1 }}
                        autoFocus
                      />
                    </>
                  ) : (
                    <Typography
                      variant="subtitle1"
                      sx={{
                        flexGrow: 1,
                        mr: 2,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {projectModule.name.value}{' '}
                      {projectModule?.name.localizedStrings[0]?.value
                        ? ` | ${projectModule?.name.localizedStrings[0]?.value}`
                        : ''}
                    </Typography>
                  )}
                  <>
                    {editingProjectModuleId === projectModule.id ? (
                      <Tooltip title={t("projects.Projectmodule.tooltip_save")}>
                        <IconButton
                          onClick={handleUpdateProjectModule}
                          size="small"
                          color="primary"
                        >
                          <Iconify icon="eva:checkmark-fill" width={20} height={20} />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Tooltip title={t("projects.Projectmodule.tooltip_edit")}>
                        <IconButton
                          onClick={() => handleEditProjectModule(projectModule)}
                          size="small"
                        >
                          <Iconify icon="eva:edit-fill" width={20} height={20} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </>
                  <Tooltip title={t("projects.Projectmodule.tooltip_delete")}>
                    <IconButton
                      onClick={() => handleOpenProjectModuleDialog(projectModule)}
                      size="small"
                      color="error"
                    >
                      <Iconify icon="eva:trash-2-outline" width={20} height={20} />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Card>
            </Grid>
          ))}
        </Grid>
        <Stack direction="row" spacing={2}>
          <>
            <TextField
              fullWidth
              size="small"
              value={newProjectModule}
              onChange={(e) => setNewProjectModule(e.target.value)}
              placeholder={t("projects.Projectmodule.project_module")}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  editingProjectModuleId ? handleUpdateProjectModule() : handleAddProjectModule();
                }
              }}
            />
            <TextField
              fullWidth
              size="small"
              value={newProjectModuleAr}
              onChange={(e) => setNewProjectModuleAr(e.target.value)}
              placeholder={t("projects.Projectmodule.project_module_arabic")}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  editingProjectModuleId ? handleUpdateProjectModule() : handleAddProjectModule();
                }
              }}
            />
          </>
          <Button
            startIcon={<Iconify icon="eva:plus-fill" />}
            onClick={editingProjectModuleId ? handleUpdateProjectModule : handleAddProjectModule}
            variant="contained"
            sx={{ px: 4 }}
          >
            {editingProjectModuleId ? t("projects.Projectmodule.tooltip_save") :  t("projects.Projectmodule.add")}
          </Button>
        </Stack>
      </Stack>

      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1 }}>
        <Stack direction="row" spacing={1}>
          <ConfirmDialog
            open={openProjectModuleConfirmDialog}
            onClose={handleCloseProjectModuleDialog}
            title={t("projects.Projectmodule.tooltip_delete")}
            content={t("projects.Projectmodule.confirm_delete")}
            action={
              <Button
                variant="contained"
                color="error"
                onClick={() => {
                  handleRemoveProjectModule(projectModuleToDelete);
                  handleCloseProjectModuleDialog();
                }}
              >
               {t("projects.Projectmodule.tooltip_delete")}
              </Button>
            }
          />
        </Stack>
      </Stack>
    </>
  );
}
