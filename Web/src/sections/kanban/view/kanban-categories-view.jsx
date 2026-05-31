'use client';

import { useState, useEffect } from 'react';
import { toast } from 'src/components/snackbar';
import { TASK_CATEGORIES } from 'src/sections/kanban/kanban-mock-data';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { ConfirmDialog } from 'src/components/custom-dialog';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import { Iconify } from 'src/components/iconify';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import { useTranslation } from 'react-i18next';
import {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
} from 'src/actions/task/taskActions';

export function KanbanCategoriesView() {
  const { t, i18n } = useTranslation('dashboard/tasks');
  const storedLang = localStorage.getItem('selectedLang');

  const { categoryList, categoryListEmpty, mutate } = getCategories();

  const [newCategory, setNewCategory] = useState('');
  const [newCategoryAr, setNewCategoryAr] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [openCategoryConfirmDialog, setOpenCategoryConfirmDialog] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const handleOpenCategoryDialog = (category) => {
    setCategoryToDelete(category);
    setOpenCategoryConfirmDialog(true);
  };

  const handleCloseCategoryDialog = () => {
    setOpenCategoryConfirmDialog(false);
    setCategoryToDelete(null);
  };

  const handleAddCategory = async () => {
    if (newCategory.trim()) {
      const payload = {
        name: {
          value: newCategory,
          localizedStrings: newCategoryAr
            ? [
                {
                  language: 'ar',
                  value: newCategoryAr,
                },
              ]
            : undefined,
        },
      };

      try {
        const response = await addCategory(payload);
        if (response.success) {
          await mutate();
          toast.success("Category Added Successfully");
        } else {
          toast.error(response.error);
        }
      } catch (error) {
        console.error('Add category failed:', error);
        toast.error(t('tasks.category-toast.unexpected_error'));
      }

      setNewCategory('');
      setNewCategoryAr('');
    }
  };

  const handleRemoveCategory = async (categoryToRemove) => {
    if (categoryToRemove?.id) {
      try {
        const response = await deleteCategory(categoryToRemove.id);
        if (response.success) {
          await mutate();
          toast.success(t('tasks.category-toast.task_category_deleted'));
        } else {
          toast.error(response.error || t('tasks.category-toast.failed_to_delete'));
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        toast.error('tasks.category-toast.unexpected_error');
      }
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategoryId(category.id);
    setNewCategory(category.name.value);
    setNewCategoryAr(category?.name.localizedStrings[0]?.value);
  };

  const handleUpdateCategory = async () => {
    if (!editingCategoryId) return;
    const category = categoryList.categories.find((c) => c.id === editingCategoryId);
    if (!category) return;
    if (newCategory.trim() && editingCategoryId) {
      const payload = {
        id: editingCategoryId,
        name: {
          id: category.name.id,
          value: newCategory,
          localizedStrings: newCategoryAr
            ? [
                {
                  id: category?.name?.localizedStrings?.[0]?.id,
                  language: 'ar',
                  value: newCategoryAr,
                },
              ]
            : [],
        },
      };

      try {
        const response = await updateCategory(payload);
        if (response.success) {
          await mutate();
          toast.success(t('tasks.category-toast.task_category_updated'));
          setEditingCategoryId(null);
          setNewCategory('');
          setNewCategoryAr('');
        } else {
          toast.error(response.error || t('toast.category-toast.failed_to_update'));
        }
      } catch (error) {
        console.error('Update category failed:', error);
        toast.error(t('toast.category-toast.unexpected_error'));
      }
    }
  };

  return (
    <>
      <Stack spacing={3} sx={{ p: 3 }}>
        <Grid container spacing={2}>
          {categoryList.categories.map((category) => (
            <Grid item key={category.id} xs={12} sm={6} md={3}>
              <Card variant="outlined" sx={{ p: 2 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  {editingCategoryId === category.id ? (
                    <>
                      <TextField
                        fullWidth
                        size="small"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleUpdateCategory();
                          }
                        }}
                        autoFocus
                      />
                      <TextField
                        fullWidth
                        size="small"
                        value={newCategoryAr}
                        onChange={(e) => setNewCategoryAr(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleUpdateCategory();
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
                      {category.name.value}{' '}
                      {category?.name.localizedStrings[0]?.value
                        ? ` | ${category?.name.localizedStrings[0]?.value}`
                        : ''}
                    </Typography>
                  )}

                  {editingCategoryId === category.id ? (
                    <Tooltip title={t('tasks.save')}>
                      <IconButton onClick={handleUpdateCategory} size="small" color="primary">
                        <Iconify icon="eva:checkmark-fill" width={20} height={20} />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <Tooltip title={t('tasks.category-toast.edit_category')}>
                      <IconButton onClick={() => handleEditCategory(category)} size="small">
                        <Iconify icon="eva:edit-fill" width={20} height={20} />
                      </IconButton>
                    </Tooltip>
                  )}

                  <Tooltip title={t('tasks.category-toast.delete_category')}>
                    <IconButton
                      onClick={() => handleOpenCategoryDialog(category)}
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
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder={t('tasks.new_category')}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  editingCategoryId ? handleUpdateCategory() : handleAddCategory();
                }
              }}
            />
            <TextField
              fullWidth
              size="small"
              value={newCategoryAr}
              onChange={(e) => setNewCategoryAr(e.target.value)}
              placeholder={t('tasks.arabic_category')}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  editingCategoryId ? handleUpdateCategory() : handleAddCategory();
                }
              }}
            />
          </>
          <Button
            startIcon={
              <Iconify
                icon={editingCategoryId ? 'eva:checkmark-fill' : 'eva:plus-fill'}
                sx={{
                  ...(storedLang === 'ar' && { ml: 1 }),
                }}
              />
            }
            onClick={editingCategoryId ? handleUpdateCategory : handleAddCategory}
            variant="contained"
            sx={{ px: 4, bgcolor: '#006A67' }}
          >
            {editingCategoryId ? t('tasks.todo.update') : t('tasks.todo.add')}
          </Button>
        </Stack>
      </Stack>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1 }}>
        <Stack direction="row" spacing={1}>
          <ConfirmDialog
            open={openCategoryConfirmDialog}
            onClose={handleCloseCategoryDialog}
            title={t('tasks.confirm.delete')}
            content={t('tasks.category-toast.are_you_sure')}
            action={
              <Button
                variant="contained"
                color="error"
                onClick={() => {
                  handleRemoveCategory(categoryToDelete);
                  handleCloseCategoryDialog();
                }}
              >
                {t('tasks.confirm.delete')}
              </Button>
            }
          />
        </Stack>
      </Stack>
    </>
  );
}
