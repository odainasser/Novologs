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
import { useTranslation } from 'react-i18next';
import { getGoals, addGoal, updateGoal, deleteGoal } from 'src/actions/project/projectActions';

export function GoalView() {
  const {t,i18n}=useTranslation('dashboard/projects');
  const { goalList, goalListEmpty, mutate } = getGoals();

  const [newGoal, setNewGoal] = useState('');
  const [newGoalAr, setNewGoalAr] = useState('');
  const [editingGoalId, setEditingGoalId] = useState(null);
  const [openGoalConfirmDialog, setOpenGoalConfirmDialog] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState(null);

  const handleOpenGoalDialog = (goal) => {
    setGoalToDelete(goal);
    setOpenGoalConfirmDialog(true);
  };

  const handleCloseGoalDialog = () => {
    setOpenGoalConfirmDialog(false);
    setGoalToDelete(null);
  };

  const handleAddGoal = async () => {
    if (newGoal.trim()) {
      const payload = {
        name: {
          value: newGoal,
          localizedStrings: newGoalAr
            ? [
                {
                  language: 'ar',
                  value: newGoalAr,
                },
              ]
            : undefined,
        },
      };

      try {
        const response = await addGoal(payload);
        if (response.success) {
          await mutate();
          toast.success(t('projects.toast.project_goal_added'));
        } else {
          toast.error(response.error);
        }
      } catch (error) {
        console.error('Add goal failed:', error);
      }

      setNewGoal('');
      setNewGoalAr('');
    }
  };

  const handleRemoveGoal = async (goalToRemove) => {
    if (goalToRemove?.id) {
      try {
        const response = await deleteGoal(goalToRemove.id);
        if (response.success) {
          await mutate();
          toast.success(t('projects.toast.project_goal_deleted'));
        } else {
          toast.error(response.error);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      }
    }
  };

  const handleEditGoal = (goal) => {
    setEditingGoalId(goal.id);
    setNewGoal(goal.name.value);
    setNewGoalAr(goal?.name.localizedStrings[0]?.value);
  };

  const handleUpdateGoal = async () => {
    if (!editingGoalId) return;
    const goal = goalList.goals.find((s) => s.id === editingGoalId);
    if (!goal) return;
    if (newGoal.trim() && editingGoalId) {
      const payload = {
        id: editingGoalId,
        name: {
          id: goal.name.id,
          value: newGoal,
          localizedStrings: newGoalAr
            ? [
                {
                  id: goal?.name?.localizedStrings?.[0]?.id,
                  language: 'ar',
                  value: newGoalAr,
                },
              ]
            : [],
        },
      };

      try {
        const response = await updateGoal(payload);
        if (response.success) {
          await mutate();
       toast.success(t('projects.toast.project_goal_updated'));
          setEditingGoalId(null);
          setNewGoal('');
          setNewGoalAr('');
        } else {
          toast.error(response.error || '');
        }
      } catch (error) {
        console.error('Update goal failed:', error);
      }
    }
  };

  return (
    <>
      <Stack spacing={3} sx={{ p: 3 }}>
        <Grid container spacing={2}>
          {goalList.goals.map((goal) => (
            <Grid item key={goal.id} xs={12} sm={6} md={3}>
              <Card variant="outlined" sx={{ p: 2 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  {editingGoalId === goal.id ? (
                    <>
                      <TextField
                        fullWidth
                        size="small"
                        value={newGoal}
                        onChange={(e) => setNewGoal(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleUpdateGoal();
                          }
                        }}
                        autoFocus
                      />
                      <TextField
                        fullWidth
                        size="small"
                        value={newGoalAr}
                        onChange={(e) => setNewGoalAr(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleUpdateGoal();
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
                      {goal.name.value}{' '}
                      {goal?.name.localizedStrings[0]?.value
                        ? ` | ${goal?.name.localizedStrings[0]?.value}`
                        : ''}
                    </Typography>
                  )}
                  <>
                    {editingGoalId === goal.id ? (
                      <Tooltip title={t("projects.table.save")}>
                        <IconButton onClick={handleUpdateGoal} size="small" color="primary">
                          <Iconify icon="eva:checkmark-fill" width={20} height={20} />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Tooltip title={t("projects.table.edit")}>
                        <IconButton onClick={() => handleEditGoal(goal)} size="small">
                          <Iconify icon="eva:edit-fill" width={20} height={20} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </>
                  <Tooltip title={t("projects.table.actions_delete")}>
                    <IconButton
                      onClick={() => handleOpenGoalDialog(goal)}
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
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              placeholder={t("projects.project_goals")}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  editingGoalId ? handleUpdateGoal() : handleAddGoal();
                }
              }}
            />
            <TextField
              fullWidth
              size="small"
              value={newGoalAr}
              onChange={(e) => setNewGoalAr(e.target.value)}
              placeholder={t("projects.project_goal_arabic")}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  editingGoalId ? handleUpdateGoal() : handleAddGoal();
                }
              }}
            />
          </>
          <Button
            startIcon={<Iconify icon="eva:plus-fill" />}
            onClick={editingGoalId ? handleUpdateGoal : handleAddGoal}
            variant="contained"
            sx={{ px: 4 }}
          >
            {editingGoalId ? t('projects.table.save') :  t('projects.table.add')}
          </Button>
        </Stack>
      </Stack>

      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1 }}>
        <Stack direction="row" spacing={1}>
          <ConfirmDialog
            open={openGoalConfirmDialog}
            onClose={handleCloseGoalDialog}
            title= {t('projects.table.actions_delete')}
            content={t('projects.project_goal_delete')}
            action={
              <Button
                variant="contained"
                color="error"
                onClick={() => {
                  handleRemoveGoal(goalToDelete);
                  handleCloseGoalDialog();
                }}
              >
                {t('projects.table.actions_delete')}
              </Button>
            }
          />
        </Stack>
      </Stack>
    </>
  );
}
