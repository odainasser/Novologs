import { useState, useMemo } from 'react';
import {
  Stack,
  Grid,
  Card,
  Typography,
  TextField,
  Tooltip,
  IconButton,
  Button,
  Box,
} from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';

import { ConfirmDialog } from 'src/components/custom-dialog';
import { useTranslation } from 'react-i18next';
import { Iconify } from 'src/components/iconify';
import { toast } from 'src/components/snackbar';
import {
  getDepartments,
  addDepartment,
  updateDepartment,
  deleteDepartment,
} from 'src/actions/department/departmentActions';
import { departments } from '../user-mock-data';
import LinearProgress from '@mui/material/LinearProgress';

export function DepartmentsView() {
  // --- Hooks and State ---
  const { departmentsList, mutate, departmentsListLoading, departmentsListError } =
    getDepartments();
  const { t } = useTranslation('dashboard/teams');
  const storedLang = localStorage.getItem('selectedLang');

  const [editingItemId, setEditingItemId] = useState(null);
  const [newItemName, setNewItemName] = useState('');
  const [newItemNameAr, setNewItemNameAr] = useState('');

  const [departmentName, setDepartmentName] = useState('');
  const [departmentNameAr, setDepartmentNameAr] = useState('');

  const [divisionName, setDivisionName] = useState('');
  const [divisionNameAr, setDivisionNameAr] = useState('');

  const [sectionName, setSectionName] = useState('');
  const [sectionNameAr, setSectionNameAr] = useState('');

  const [sessionName, setSessionName] = useState('');
  const [sessionNameAr, setSessionNameAr] = useState('');

  // State for selected parents in dropdowns
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(''); // For Division's parent
  const [selectedDivisionId, setSelectedDivisionId] = useState(''); // For Section's parent
  const [selectedSectionId, setSelectedSectionId] = useState(''); // For Session's parent

  // State for delete confirmation
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // --- Derived Data (using useMemo for performance) ---
  const allDepartments = useMemo(() => departmentsList?.departments || [], [departmentsList]);

  const parentDepartments = useMemo(
    () => allDepartments.filter((dept) => dept.parentDepartmentId === null),
    [allDepartments]
  );

  // Memoize child divisions calculation
  const childDivisions = useMemo(
    () =>
      allDepartments.filter((dep) =>
        parentDepartments.some((parent) => parent.id === dep.parentDepartmentId)
      ),
    [allDepartments, parentDepartments] // Depends on allDepartments and parentDepartments
  );

  // Memoize child sections calculation
  const childSections = useMemo(
    () =>
      allDepartments.filter((dep) =>
        childDivisions.some((division) => division.id === dep.parentDepartmentId)
      ),
    [allDepartments, childDivisions] // Depends on allDepartments and childDivisions
  );

  // Memoize child sessions calculation (assuming sessions are children of sections)
  const childSessions = useMemo(
    () =>
      allDepartments.filter((dep) =>
        childSections.some((section) => section.id === dep.parentDepartmentId)
      ),
    [allDepartments, childSections] // Depends on allDepartments and childSections
  );

  // --- Helper Functions ---
  const getParentName = (parentId) => {
    if (!parentId) return '';
    const parent = allDepartments.find((dept) => dept.id === parentId);
    // Recursively find rootParent name if needed for breadcrumbs
    const rootParent = parent?.parentDepartmentId
      ? allDepartments.find((dept) => dept.id === parent.parentDepartmentId)
      : null;
    const mainRootParent = rootParent?.parentDepartmentId
      ? allDepartments.find((dept) => dept.id === rootParent.parentDepartmentId)
      : null;

    let path = '';
    // if (mainRootParent) path += `${mainRootParent.name?.value || '...'} / `;
    if (mainRootParent)
      path += `${
        storedLang === 'ar'
          ? mainRootParent.name?.localizedStrings?.find((ls) => ls.language.toLowerCase() === 'ar')
              ?.value || mainRootParent.name?.value
          : mainRootParent.name?.value || '...'
      } / `;

    if (rootParent)
      path += `${
        storedLang === 'ar'
          ? rootParent.name?.localizedStrings?.find((ls) => ls.language.toLowerCase() === 'ar')
              ?.value || rootParent.name?.value
          : rootParent.name?.value || '...'
      } / `;
    if (parent)
      path += `${
        storedLang === 'ar'
          ? parent.name?.localizedStrings?.find((ls) => ls.language.toLowerCase() === 'ar')
              ?.value || parent.name?.value
          : parent.name?.value || '...'
      }`;

    return path || 'Unknown Parent';
  };

  const resetInputFields = () => {
    setNewItemName('');
    setNewItemNameAr('');
    //     setDepartmentName('');
    // setDepartmentNameAr('');
    // setDivisionName('');
    // setDivisionNameAr('');
    // setSectionName('');
    // setSectionNameAr('');
    // setSessionName('');
    // setSessionNameAr('');
    setSelectedDepartmentId('');
    setSelectedDivisionId('');
    setSelectedSectionId('');
    setEditingItemId(null);
  };

  const resetInputFieldsDept = () => {
    setDepartmentName('');
    setDepartmentNameAr('');
    setSelectedDepartmentId('');
    setSelectedDivisionId('');
    setSelectedSectionId('');
    setEditingItemId(null);
  };
  const resetInputFieldsDivision = () => {
    setDivisionName('');
    setDivisionNameAr('');
    setSelectedDepartmentId('');
    setSelectedDivisionId('');
    setSelectedSectionId('');
    setEditingItemId(null);
  };
  const resetInputFieldsSection = () => {
    setSectionName('');
    setSectionNameAr('');
    setSelectedDepartmentId('');
    setSelectedDivisionId('');
    setSelectedSectionId('');
    setEditingItemId(null);
  };
  const resetInputFieldsSession = () => {
    setSessionName('');
    setSessionNameAr('');
    setSelectedDepartmentId('');
    setSelectedDivisionId('');
    setSelectedSectionId('');
    setEditingItemId(null);
  };
  // --- Event Handlers ---
  const handleOpenDeleteDialog = (item) => {
    setItemToDelete(item);
    setOpenConfirmDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenConfirmDialog(false);
    setItemToDelete(null);
  };

  const handleEditItem = (item) => {
    setEditingItemId(item.id);

    const name = item.name?.value || '';
    const arabicName = item.name?.localizedStrings?.find((ls) => ls.language === 'ar')?.value || '';

    // Find parent
    const parent = allDepartments.find((dep) => dep.id === item.parentDepartmentId);
    const rootParent = parent
      ? allDepartments.find((dep) => dep.id === parent.parentDepartmentId)
      : null;

    if (!item.parentDepartmentId) {
      // ✅ Editing Department
      setDepartmentName(name);
      setDepartmentNameAr(arabicName);

      setDivisionName('');
      setDivisionNameAr('');
      setSectionName('');
      setSectionNameAr('');
      setSessionName('');
      setSessionNameAr('');

      setSelectedDepartmentId('');
      setSelectedDivisionId('');
      setSelectedSectionId('');
    } else if (parent && parent.parentDepartmentId === null) {
      // ✅ Editing Division
      setDivisionName(name);
      setDivisionNameAr(arabicName);

      setDepartmentName('');
      setDepartmentNameAr('');

      setSectionName('');
      setSectionNameAr('');
      setSessionName('');
      setSessionNameAr('');

      setSelectedDepartmentId(item.parentDepartmentId);
      setSelectedDivisionId('');
      setSelectedSectionId('');
    } else if (rootParent && rootParent.parentDepartmentId === null) {
      // ✅ Editing Section
      setSectionName(name);
      setSectionNameAr(arabicName);

      setDivisionName('');
      setDivisionNameAr('');

      setSessionName('');
      setSessionNameAr('');

      setSelectedDivisionId(item.parentDepartmentId);
      setSelectedDepartmentId(parent.parentDepartmentId);
      setSelectedSectionId('');
    } else {
      // ✅ Editing Session
      setSessionName(name);
      setSessionNameAr(arabicName);

      setSelectedSectionId(item.parentDepartmentId);
      setSelectedDivisionId(parent.parentDepartmentId);
      setSelectedDepartmentId(rootParent?.parentDepartmentId || '');
    }
  };
  const isChildLevelFocused = !!selectedDepartmentId || !!selectedDivisionId || !!selectedSectionId;
  const handleCancelEdit = () => {
    setEditingItemId(null);

    setDepartmentName('');
    setDepartmentNameAr('');

    setDivisionName('');
    setDivisionNameAr('');

    setSectionName('');
    setSectionNameAr('');

    setSessionName('');
    setSessionNameAr('');

    setSelectedDepartmentId('');
    setSelectedDivisionId('');
    setSelectedSectionId('');

    setNewItemName('');
    setNewItemNameAr('');
  };
  const handleCancelEditDept = () => {
    resetInputFieldsDept();
  };
  const handleCancelEditDivision = () => {
    resetInputFieldsDivision();
  };
  const handleCancelEditSection = () => {
    resetInputFieldsSection();
  };
  const handleCancelEditSession = () => {
    resetInputFieldsSession();
  };
  // Unified Add Handler
  const handleAddItem = async (parentId = null, name, nameAr) => {
    if (!name.trim()) {
      toast.error(t('departments.toast.name_required'));
      return;
    }

    const payload = {
      parentDepartmentId: parentId, // Use null for top-level, or the selected ID for children
      name: {
        value: name.trim(),

        ...(nameAr.trim() && {
          localizedStrings: [
            {
              // localizableId: null,
              language: 'ar',
              value: nameAr.trim(),
            },
          ],
        }),
      },
    };

    console.log('Adding Item Payload:', payload);

    try {
      const response = await addDepartment(payload);
      if (response.success) {
        await mutate(); // Re-fetch data
        toast.success(t('departments.toast.add_success'));
        // Keep parent selected if adding multiple children under the same parent
        // Parent state is handled separately now, only reset text fields
        setNewItemName('');
        setNewItemNameAr('');
        setDepartmentName('');
        setDepartmentNameAr('');
        setDivisionName('');
        setDivisionNameAr('');
        setSectionName('');
        setSectionNameAr('');
        setSessionName('');
        setSessionNameAr('');
        resetInputFieldsDept();
        resetInputFieldsDivision();
        resetInputFieldsSection();
        resetInputFieldsSession();

        // Don't reset parent selectors here to allow adding multiple children easily
      } else {
        toast.error(response.error || t('departments.toast.add_failed'));
      }
    } catch (error) {
      console.error('Add item failed:', error);
      toast.error(t('departments.toast.unexpected_error'));
    }
  };

  // Unified Update Handler
  const handleUpdateItem = async (parentId = null, name, nameAr) => {
    if (!editingItemId || !name.trim()) {
      toast.error(t('departments.toast.name_required'));
      return;
    }

    // Find the original item to potentially get its parentId if needed for API
    // Note: The current API payload doesn't seem to update parentId
    // const originalItem = allDepartments.find(dep => dep.id === editingItemId);

    // Construct payload for update (assuming updateDepartment needs ID and name object)
    const payload = {
      id: editingItemId,
      parentDepartmentId: parentId,
      name: {
        value: name.trim(),

        ...(nameAr.trim() && {
          localizedStrings: [
            {
              // localizableId: null,
              language: 'ar',
              value: nameAr.trim(),
            },
          ],
        }),
      },
      // Include parentDepartmentId ONLY if your update API allows changing the parent
      // parentDepartmentId: originalItem?.parentDepartmentId, // Or potentially a new parent if UI allows changing it
    };

    console.log('Updating Item Payload:', payload);

    try {
      // *** Assuming you have an updateDepartment action ***
      const response = await updateDepartment(payload); // Replace with your actual update action
      if (response.success) {
        await mutate();
        toast.success(t('departments.toast.update_success')); // Use a specific update success message
        resetInputFieldsDept(); // This now clears parent selections as well
        resetInputFieldsDivision(); // This now clears parent selections as well

        resetInputFieldsSection(); // This now clears parent selections as well

        resetInputFieldsSession(); // This now clears parent selections as well
      } else {
        toast.error(response.error || t('departments.toast.update_failed')); // Use specific update fail message
      }
    } catch (error) {
      console.error('Update item failed:', error);
      toast.error(t('departments.toast.unexpected_error'));
    }
  };

  // Corrected Remove Handler
  const handleRemoveItem = async () => {
    if (!itemToDelete?.id) return;

    try {
      // *** Use deleteDepartment action ***
      const response = await deleteDepartment(itemToDelete.id);
      if (response.success) {
        await mutate();
        toast.success(t('departments.toast.delete_successfully'));
      } else {
        // Provide more specific error if possible (e.g., cannot delete if has children/employees)
        toast.error(response.error || t('departments.toast.delete_failed'));
      }
    } catch (error) {
      console.error('Delete item failed:', error);
      toast.error(t('departments.toast.unexpected_error'));
    } finally {
      handleCloseDeleteDialog(); // Close dialog regardless of outcome
    }
  };

  // --- Render Logic ---
  if (departmentsListLoading) {
    return (
      <div>
        <LinearProgress
          sx={{
            '& .MuiLinearProgress-bar': {
              backgroundColor: '#2FBBA8',
            },
            backgroundColor: 'rgba(47, 187, 168, 0.2)', // Lighter version of #2FBBA8 for the background
          }}
        />
      </div>
    );
  }

  if (departmentsListError) {
    return (
      <Typography sx={{ p: 3 }} color="error">
        {t('departments.labels.failed_to_load')}
      </Typography>
    );
  }

  const isEditing = !!editingItemId;
  // Determine which level is currently being edited (if any)
  const editingItem = isEditing ? allDepartments.find((dep) => dep.id === editingItemId) : null;
  const isEditingDepartment = isEditing && editingItem?.parentDepartmentId === null;
  const isEditingDivision =
    isEditing && parentDepartments.some((parent) => parent.id === editingItem?.parentDepartmentId);
  const isEditingSection =
    isEditing && childDivisions.some((div) => div.id === editingItem?.parentDepartmentId);
  const isEditingSession =
    isEditing && childSections.some((sec) => sec.id === editingItem?.parentDepartmentId);

  return (
    <Stack spacing={3} sx={{ p: 3 }}>
      <Grid container spacing={2}>
        {/* --- Department Column --- */}
        <Grid item xs={12} md={2}>
          <Card variant="outlined" sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Department | قسم
            </Typography>

            <Stack spacing={1.5} sx={{ mb: 3 }}>
              <TextField
                fullWidth
                size="small"
                value={departmentName}
                onChange={(e) => setDepartmentName(e.target.value)}
                placeholder={t('departments.labels.department_name')}
                disabled={isEditing ? !isEditingDepartment : isChildLevelFocused} // Disable if editing a child item (Division, Section, Session)
                InputProps={{ inputProps: { style: { fontSize: '14px' } } }}
                onKeyPress={(e) => {
                  if (
                    e.key === 'Enter' &&
                    !isEditingDivision &&
                    !isEditingSection &&
                    !isEditingSession &&
                    !isChildLevelFocused
                  ) {
                    // Only handle Enter for top-level add/edit here
                    isEditingDepartment
                      ? handleUpdateItem(null, departmentName, departmentNameAr)
                      : handleAddItem(null, departmentName, departmentNameAr);
                  }
                }}
              />
              <TextField
                fullWidth
                size="small"
                value={departmentNameAr}
                onChange={(e) => setDepartmentNameAr(e.target.value)}
                placeholder={t('departments.labels.department_name_arabic')}
                disabled={isEditing ? !isEditingDepartment : isChildLevelFocused} // Disable if editing a child item
                InputProps={{ inputProps: { style: { fontSize: '14px' } } }}
                onKeyPress={(e) => {
                  if (
                    e.key === 'Enter' &&
                    !isEditingDivision &&
                    !isEditingSection &&
                    !isEditingSession &&
                    !isChildLevelFocused
                  ) {
                    // Only handle Enter for top-level add/edit here
                    isEditingDepartment
                      ? handleUpdateItem(null, departmentName, departmentNameAr)
                      : handleAddItem(null, departmentName, departmentNameAr);
                  }
                }}
              />
              <Stack direction="row" justifyContent="flex-end" spacing={1}>
                <Button
                  size="small"
                  onClick={handleCancelEditDept}
                  color="inherit"
                  variant="outlined"
                >
                  {t('departments.buttons.cancel')}
                </Button>
                <Button
                  size="small"
                  onClick={() =>
                    isEditingDepartment
                      ? handleUpdateItem(null, departmentName, departmentNameAr)
                      : handleAddItem(null, departmentName, departmentNameAr)
                  }
                  variant="contained"
                  disabled={
                    (!departmentName.trim() && !isEditingDepartment) ||
                    (isEditing && !isEditingDepartment) ||
                    (!isEditingDepartment && isChildLevelFocused)
                  }
                  sx={{ bgcolor: '#006A67' }}
                >
                  {isEditingDepartment
                    ? t('departments.buttons.save')
                    : t('departments.buttons.add')}
                </Button>
              </Stack>
            </Stack>

            {/* List of Parent Departments */}
            <Stack spacing={1}>
              {parentDepartments.map((department, index, array) => (
                <Box
                  key={department.id}
                  sx={{
                    borderBottom: index !== array.length - 1 ? '1px dashed #ccc' : 'none',
                    pb: 0.5,
                  }}
                >
                  {editingItemId === department.id && isEditingDepartment ? (
                    // Show inputs only if editing THIS item
                    <Typography variant="caption" sx={{ fontStyle: 'italic' }}>
                      {t('departments.labels.editing')}
                    </Typography>
                  ) : (
                    <>
                      <Stack direction={{ xs: 'column', lg: 'row' }} justifyContent="space-between">
                        <Typography variant="body2" sx={{ overflowWrap: 'break-word' }}>
                          {storedLang === 'ar'
                            ? department.name?.localizedStrings?.find(
                                (ls) => ls.language.toLowerCase() === 'ar'
                              )?.value || department.name?.value
                            : department.name?.value || 'Untitled'}
                        </Typography>
                        <Stack
                          direction="row"
                          alignItems="center"
                          justifyContent={{ xs: 'space-between', lg: '' }}
                        >
                          <Tooltip title={t('departments.labels.no_of_employees')} arrow>
                            <Chip
                              label={`${department.employeeCount || 0}`}
                              size="small"
                              sx={{
                                bgcolor: '#006A67',
                                color: '#fff',
                                fontSize: '0.7rem',
                                height: '20px',
                              }}
                            />
                          </Tooltip>

                          <Stack direction="row">
                            <Tooltip title={t('departments.tooltips.edit')}>
                              <IconButton onClick={() => handleEditItem(department)} size="small">
                                <Iconify icon="eva:edit-fill" width={15} height={15} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip
                              title={
                                department.employeeCount > 0
                                  ? t('departments.tooltips.cannot_delete_department')
                                  : t('departments.tooltips.delete')
                              }
                            >
                              <span>
                                {' '}
                                {/* Wrap IconButton in span for Tooltip when disabled */}
                                <IconButton
                                  onClick={() => handleOpenDeleteDialog(department)}
                                  size="small"
                                  color="error"
                                  disabled={department.employeeCount > 0} // Disable delete if employees exist
                                >
                                  <Iconify icon="eva:trash-2-outline" width={15} height={15} />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </Stack>
                        </Stack>
                      </Stack>
                    </>
                  )}
                </Box>
              ))}
              {parentDepartments.length === 0 && !departmentsListLoading && (
                <Typography variant="caption">
                  {t('departments.tooltips.departments_available')}
                </Typography>
              )}
            </Stack>
          </Card>
        </Grid>

        {/* --- Division Column --- */}
        <Grid item xs={12} md={2.5}>
          <Card variant="outlined" sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Division | إدارة
            </Typography>

            {/* Parent Department Selector */}
            <TextField
              select
              fullWidth
              label={t('table.headings.department')}
              value={selectedDepartmentId}
              onChange={(e) => {
                const newDeptId = e.target.value;
                setSelectedDepartmentId(newDeptId);
                setSelectedDivisionId(''); // Reset division selection when department changes
                setSelectedSectionId(''); // Reset section selection
                // Cancel edit if the selected parent differs from the item's actual parent
                if (
                  isEditing &&
                  editingItem?.parentDepartmentId !== newDeptId &&
                  isEditingDivision
                ) {
                  handleCancelEdit();
                }
              }}
              size="small"
              sx={{ mb: 1.5 }}
              SelectProps={{
                displayEmpty: true, // Allows showing the placeholder
              }}
              InputLabelProps={{ shrink: true }}
              disabled={isEditing && !isEditingDivision && !isEditingDepartment} // Disable if editing Section/Session
            >
              <MenuItem value="">{t('departments.labels.all_departments')}</MenuItem>
              {parentDepartments.map((dept) => (
                <MenuItem key={dept.id} value={dept.id}>
                  {storedLang === 'ar'
                    ? dept.name?.localizedStrings?.find((ls) => ls.language.toLowerCase() === 'ar')
                        ?.value || dept.name?.value
                    : dept.name?.value || 'Untitled'}
                </MenuItem>
              ))}
            </TextField>

            {/* Add/Edit Form for Divisions */}
            <Stack spacing={1.5} sx={{ mb: 3 }}>
              <TextField
                fullWidth
                size="small"
                value={divisionName}
                onChange={(e) => setDivisionName(e.target.value)}
                placeholder={t('departments.labels.division_name')}
                disabled={!selectedDepartmentId || (isEditing && !isEditingDivision)} // Disable if no parent selected or not editing a division
                InputProps={{ inputProps: { style: { fontSize: '14px' } } }}
                onKeyPress={(e) => {
                  if (
                    e.key === 'Enter' &&
                    selectedDepartmentId &&
                    !isEditingSection &&
                    !isEditingSession
                  ) {
                    // Only handle Enter for Division add/edit
                    isEditingDivision
                      ? handleUpdateItem(selectedDepartmentId, divisionName, divisionNameAr)
                      : handleAddItem(selectedDepartmentId, divisionName, divisionNameAr);
                  }
                }}
              />
              <TextField
                fullWidth
                size="small"
                value={divisionNameAr}
                onChange={(e) => setDivisionNameAr(e.target.value)}
                placeholder={t('departments.labels.division_name_arabic')} // Arabic placeholder
                disabled={!selectedDepartmentId || (isEditing && !isEditingDivision)} // Disable if no parent selected or not editing a division
                InputProps={{ inputProps: { style: { fontSize: '14px' } } }}
                onKeyPress={(e) => {
                  if (
                    e.key === 'Enter' &&
                    selectedDepartmentId &&
                    !isEditingSection &&
                    !isEditingSession
                  ) {
                    // Only handle Enter for Division add/edit
                    isEditingDivision
                      ? handleUpdateItem(selectedDepartmentId, divisionName, divisionNameAr)
                      : handleAddItem(selectedDepartmentId, divisionName, divisionNameAr);
                  }
                }}
              />
              <Stack direction="row" justifyContent="flex-end" spacing={1}>
                <Button
                  size="small"
                  onClick={handleCancelEditDivision}
                  color="inherit"
                  variant="outlined"
                >
                  {t('departments.buttons.cancel')}
                </Button>
                <Button
                  size="small"
                  onClick={() =>
                    isEditingDivision
                      ? handleUpdateItem(selectedDepartmentId, divisionName, divisionNameAr)
                      : handleAddItem(selectedDepartmentId, divisionName, divisionNameAr)
                  }
                  variant="contained"
                  // Disable add if name or parent is empty, disable if editing item not under selected parent
                  disabled={
                    (!divisionName.trim() && !isEditingDivision) || // Disable add if name empty (unless editing this division)
                    !selectedDepartmentId || // Disable if no department selected
                    (isEditing && !isEditingDivision) // Disable if editing item not a division
                  }
                  sx={{ bgcolor: '#006A67' }}
                >
                  {isEditingDivision ? t('departments.buttons.save') : t('departments.buttons.add')}
                </Button>
              </Stack>
            </Stack>

            {/* List of Child Divisions */}
            <Stack spacing={1}>
              {childDivisions
                .filter(
                  (div) => !selectedDepartmentId || div.parentDepartmentId === selectedDepartmentId
                )
                .map((division, index, array) => (
                  <Box
                    key={division.id}
                    sx={{
                      borderBottom: index !== array.length - 1 ? '1px dashed #ccc' : 'none',
                      pb: 0.5,
                    }}
                  >
                    {editingItemId === division.id && isEditingDivision ? (
                      <Typography variant="caption" sx={{ fontStyle: 'italic' }}>
                        {t('departments.labels.editing')}
                      </Typography>
                    ) : (
                      <>
                        <Stack
                          direction={{ xs: 'column', lg: 'row' }}
                          justifyContent="space-between"
                        >
                          <Typography variant="body2" sx={{ overflowWrap: 'break-word' }}>
                            {storedLang === 'ar'
                              ? division.name?.localizedStrings?.find(
                                  (ls) => ls.language.toLowerCase() === 'ar'
                                )?.value || division.name?.value
                              : division.name?.value || 'Untitled'}
                            {/* {division.name?.value || 'Untitled'} */}
                            {/* {division.name?.localizedStrings?.find((ls) => ls.language === 'ar')
                            ?.value &&
                            ` / ${division.name.localizedStrings.find((ls) => ls.language === 'ar').value}`} */}
                          </Typography>

                          <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent={{ xs: 'space-between', lg: '' }}
                          >
                            <Tooltip title={t('departments.labels.no_of_employees')} arrow>
                              <Chip
                                label={`${division.employeeCount || 0}`}
                                size="small"
                                sx={{
                                  bgcolor: '#006A67',
                                  color: '#fff',
                                  fontSize: '0.7rem',
                                  height: '20px',
                                }}
                              />
                            </Tooltip>
                            <Stack direction="row">
                              <Tooltip title={t('departments.tooltips.edit')}>
                                <IconButton onClick={() => handleEditItem(division)} size="small">
                                  <Iconify icon="eva:edit-fill" width={15} height={15} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip
                                title={
                                  division.employeeCount > 0
                                    ? t('departments.tooltips.cannot_delete_division')
                                    : t('departments.buttons.delete')
                                }
                              >
                                <span>
                                  <IconButton
                                    onClick={() => handleOpenDeleteDialog(division)}
                                    size="small"
                                    color="error"
                                    disabled={division.employeeCount > 0}
                                  >
                                    <Iconify icon="eva:trash-2-outline" width={15} height={15} />
                                  </IconButton>
                                </span>
                              </Tooltip>
                            </Stack>
                          </Stack>
                        </Stack>
                        <Typography
                          variant="caption"
                          sx={{
                            flexGrow: 1,
                            mr: 1,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            color: '#006A67',
                          }}
                        >
                          {getParentName(division.parentDepartmentId)} /{' '}
                          {storedLang === 'ar'
                            ? division.name?.localizedStrings?.find(
                                (ls) => ls.language.toLowerCase() === 'ar'
                              )?.value || division.name?.value
                            : division.name?.value || 'Untitled'}
                        </Typography>
                      </>
                    )}
                  </Box>
                ))}
              {childDivisions.filter(
                (div) => !selectedDepartmentId || div.parentDepartmentId === selectedDepartmentId
              ).length === 0 &&
                selectedDepartmentId && ( // Show message only if a parent is selected but has no children
                  <Typography variant="caption">
                    {t('departments.tooltips.division_available')}
                  </Typography>
                )}
            </Stack>
          </Card>
        </Grid>

        {/* --- Section Column --- */}
        <Grid item xs={12} md={3.5}>
          <Card variant="outlined" sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Section | قسم فرعي
            </Typography>

            <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1}>
              {/* Parent Department Selector (for filtering) */}

              <TextField
                select
                fullWidth
                label={t('table.headings.department')}
                value={selectedDepartmentId} // Use the same state as Division column for filtering
                onChange={(e) => {
                  const newDeptId = e.target.value;
                  setSelectedDepartmentId(newDeptId);
                  setSelectedDivisionId(''); // Reset division selection
                  setSelectedSectionId(''); // Reset section selection
                  if (isEditing && isEditingSection) handleCancelEdit(); // Cancel edit if parent changes while editing section
                }}
                size="small"
                sx={{ mb: 1.5 }}
                SelectProps={{
                  displayEmpty: true,
                }}
                InputLabelProps={{ shrink: true }}
                disabled={isEditing && isEditingSession} // Disable if editing Session
              >
                <MenuItem value="">{t('departments.labels.all_departments')}</MenuItem>
                {parentDepartments.map((dept) => (
                  <MenuItem key={dept.id} value={dept.id}>
                    {storedLang === 'ar'
                      ? dept.name?.localizedStrings?.find(
                          (ls) => ls.language.toLowerCase() === 'ar'
                        )?.value || dept.name?.value
                      : dept.name?.value || 'Untitled'}
                  </MenuItem>
                ))}
              </TextField>

              {/* Parent Division Selector (actual parent for Section) */}
              <TextField
                select
                fullWidth
                label={t('departments.labels.division')} // Use translation
                value={selectedDivisionId}
                onChange={(e) => {
                  const newDivId = e.target.value;
                  setSelectedDivisionId(newDivId);
                  setSelectedSectionId(''); // Reset section selection
                  if (
                    isEditing &&
                    editingItem?.parentDepartmentId !== newDivId &&
                    isEditingSection
                  ) {
                    handleCancelEdit();
                  }
                }}
                size="small"
                sx={{ mb: 1.5 }}
                SelectProps={{
                  displayEmpty: true,
                }}
                InputLabelProps={{ shrink: true }}
                disabled={!selectedDepartmentId || (isEditing && isEditingSession)} // Disable if no dept selected or editing Session
              >
                <MenuItem value="">{t('departments.labels.all_divisions')}</MenuItem>
                {childDivisions
                  .filter((div) => div.parentDepartmentId === selectedDepartmentId) // Filter divisions by selected department
                  .map((dept) => (
                    <MenuItem key={dept.id} value={dept.id}>
                      {storedLang === 'ar'
                        ? dept.name?.localizedStrings?.find(
                            (ls) => ls.language.toLowerCase() === 'ar'
                          )?.value || dept.name?.value
                        : dept.name?.value || 'Untitled'}
                    </MenuItem>
                  ))}
              </TextField>
            </Stack>

            {/* Add/Edit Form for Sections */}
            <Stack spacing={1.5} sx={{ mb: 3 }}>
              <TextField
                fullWidth
                size="small"
                value={sectionName}
                onChange={(e) => setSectionName(e.target.value)}
                placeholder={t('departments.labels.section_name')}
                disabled={!selectedDivisionId || (isEditing && !isEditingSection)} // Disable if no parent selected or not editing a section
                InputProps={{ inputProps: { style: { fontSize: '14px' } } }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && selectedDivisionId && !isEditingSession) {
                    // Only handle Enter for Section add/edit
                    isEditingSection
                      ? handleUpdateItem(selectedDivisionId, sectionName, sectionNameAr)
                      : handleAddItem(selectedDivisionId, sectionName, sectionNameAr);
                  }
                }}
              />
              <TextField
                fullWidth
                size="small"
                value={sectionNameAr}
                onChange={(e) => setSectionNameAr(e.target.value)}
                placeholder={t('departments.labels.section_name_arabic')} // Arabic placeholder
                disabled={!selectedDivisionId || (isEditing && !isEditingSection)} // Disable if no parent selected or not editing a section
                InputProps={{ inputProps: { style: { fontSize: '14px' } } }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && selectedDivisionId && !isEditingSession) {
                    // Only handle Enter for Section add/edit
                    isEditingSection
                      ? handleUpdateItem(selectedDivisionId, sectionName, sectionNameAr)
                      : handleAddItem(selectedDivisionId, sectionName, sectionNameAr);
                  }
                }}
              />
              <Stack direction="row" justifyContent="flex-end" spacing={1}>
                <Button
                  size="small"
                  onClick={handleCancelEditSection}
                  color="inherit"
                  variant="outlined"
                >
                  {t('departments.buttons.cancel')}
                </Button>
                <Button
                  size="small"
                  onClick={() =>
                    isEditingSection
                      ? handleUpdateItem(selectedDivisionId, sectionName, sectionNameAr)
                      : handleAddItem(selectedDivisionId, sectionName, sectionNameAr)
                  }
                  variant="contained"
                  disabled={
                    (!sectionName.trim() && !isEditingSection) || // Disable add if name empty (unless editing this section)
                    !selectedDivisionId || // Disable if no division selected
                    (isEditing && !isEditingSection) // Disable if editing item not a section
                  }
                  sx={{ bgcolor: '#006A67' }}
                >
                  {isEditingSection ? t('departments.buttons.save') : t('departments.buttons.add')}
                </Button>
              </Stack>
            </Stack>

            {/* List of Child Sections */}
            <Stack spacing={1}>
              {childSections
                .filter(
                  (sec) => !selectedDivisionId || sec.parentDepartmentId === selectedDivisionId
                )
                .map((section, index, array) => (
                  <Box
                    key={section.id}
                    sx={{
                      borderBottom: index !== array.length - 1 ? '1px dashed #ccc' : 'none',
                      pb: 0.5,
                    }}
                  >
                    {editingItemId === section.id && isEditingSection ? (
                      <Typography variant="caption" sx={{ fontStyle: 'italic' }}>
                        {t('departments.labels.editing')}
                      </Typography>
                    ) : (
                      <>
                        <Stack
                          direction={{ xs: 'column', lg: 'row' }}
                          justifyContent="space-between"
                        >
                          <Typography variant="body2" sx={{ overflowWrap: 'break-word' }}>
                            {storedLang === 'ar'
                              ? section.name?.localizedStrings?.find(
                                  (ls) => ls.language.toLowerCase() === 'ar'
                                )?.value || section.name?.value
                              : section.name?.value || 'Untitled'}
                            {/* {section.name?.value || 'Untitled'} */}
                            {/* {section.name?.localizedStrings?.find((ls) => ls.language === 'ar')
                              ?.value &&
                              ` / ${section.name.localizedStrings.find((ls) => ls.language === 'ar').value}`} */}
                          </Typography>

                          <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent={{ xs: 'space-between', lg: '' }}
                          >
                            <Chip
                              label={`${section.employeeCount || 0}`}
                              size="small"
                              sx={{
                                bgcolor: '#006A67',
                                color: '#fff',
                                fontSize: '0.7rem',
                                height: '20px',
                              }}
                            />
                            <Stack direction="row">
                              <Tooltip title={t('departments.tooltips.edit')}>
                                <IconButton onClick={() => handleEditItem(section)} size="small">
                                  <Iconify icon="eva:edit-fill" width={15} height={15} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip
                                title={
                                  section.employeeCount > 0
                                    ? t('departments.tooltips.cannot_section')
                                    : t('departments.buttons.delete')
                                }
                              >
                                <span>
                                  <IconButton
                                    onClick={() => handleOpenDeleteDialog(section)}
                                    size="small"
                                    color="error"
                                    disabled={section.employeeCount > 0}
                                  >
                                    <Iconify icon="eva:trash-2-outline" width={15} height={15} />
                                  </IconButton>
                                </span>
                              </Tooltip>
                            </Stack>
                          </Stack>
                        </Stack>

                        <Typography
                          variant="caption"
                          sx={{
                            flexGrow: 1,
                            mr: 1,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            color: '#006A67',
                          }}
                        >
                          {getParentName(section.parentDepartmentId)} /{' '}
                          {storedLang === 'ar'
                            ? section.name?.localizedStrings?.find(
                                (ls) => ls.language.toLowerCase() === 'ar'
                              )?.value || section.name?.value
                            : section.name?.value || 'Untitled'}
                        </Typography>
                      </>
                    )}
                  </Box>
                ))}
              {childSections.filter(
                (sec) => !selectedDivisionId || sec.parentDepartmentId === selectedDivisionId
              ).length === 0 &&
                selectedDivisionId && (
                  <Typography variant="caption">
                    {t('departments.tooltips.section_available')}
                  </Typography>
                )}
            </Stack>
          </Card>
        </Grid>

        {/* --- Session Column --- */}
        <Grid item xs={12} md={4}>
          <Card variant="outlined" sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Session | وحدة
            </Typography>
            <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1}>
              {/* Parent Department Selector (for filtering) */}
              <TextField
                select
                fullWidth
                label={t('table.headings.department')} // Department Selector (for filtering)
                value={selectedDepartmentId}
                onChange={(e) => {
                  setSelectedDepartmentId(e.target.value);
                  setSelectedDivisionId(''); // Reset children
                  setSelectedSectionId('');
                  if (isEditing && isEditingSession) handleCancelEdit();
                }}
                size="small"
                sx={{ mb: 1.5 }}
                SelectProps={{
                  displayEmpty: true,
                }}
                InputLabelProps={{ shrink: true }}
              >
                <MenuItem value="">{t('departments.labels.all_departments')}</MenuItem>
                {parentDepartments.map((dept) => (
                  <MenuItem key={dept.id} value={dept.id}>
                    {storedLang === 'ar'
                      ? dept.name?.localizedStrings?.find(
                          (ls) => ls.language.toLowerCase() === 'ar'
                        )?.value || dept.name?.value
                      : dept.name?.value || 'Untitled'}
                  </MenuItem>
                ))}
              </TextField>

              {/* Parent Division Selector (for filtering) */}
              <TextField
                select
                fullWidth
                label={t('departments.labels.division')} // Division Selector (for filtering)
                value={selectedDivisionId}
                onChange={(e) => {
                  setSelectedDivisionId(e.target.value);
                  setSelectedSectionId(''); // Reset child
                  if (isEditing && isEditingSession) handleCancelEdit();
                }}
                disabled={!selectedDepartmentId} // Requires Department
                size="small"
                sx={{ mb: 1.5 }}
                SelectProps={{
                  displayEmpty: true,
                }}
                InputLabelProps={{ shrink: true }}
              >
                <MenuItem value="">{t('departments.labels.all_divisions')}</MenuItem>
                {childDivisions
                  .filter((div) => div.parentDepartmentId === selectedDepartmentId) // Filter by selected Department
                  .map((dept) => (
                    <MenuItem key={dept.id} value={dept.id}>
                      {storedLang === 'ar'
                        ? dept.name?.localizedStrings?.find(
                            (ls) => ls.language.toLowerCase() === 'ar'
                          )?.value || dept.name?.value
                        : dept.name?.value || 'Untitled'}
                    </MenuItem>
                  ))}
              </TextField>

              {/* Parent Section Selector (actual parent for Session) */}
              <TextField
                select
                fullWidth
                label={t('departments.labels.section')} // Section Selector (actual parent for Session)
                value={selectedSectionId}
                onChange={(e) => {
                  const newSectId = e.target.value;
                  setSelectedSectionId(newSectId);
                  if (
                    isEditing &&
                    editingItem?.parentDepartmentId !== newSectId &&
                    isEditingSession
                  ) {
                    handleCancelEdit();
                  }
                }}
                disabled={!selectedDivisionId} // Requires Division
                size="small"
                sx={{ mb: 1.5 }}
                SelectProps={{
                  displayEmpty: true,
                }}
                InputLabelProps={{ shrink: true }}
              >
                <MenuItem value="">{t('departments.labels.all_sections')}</MenuItem>
                {childSections // Use memoized sections
                  .filter((sec) => sec.parentDepartmentId === selectedDivisionId) // Filter by selected Division
                  .map((dept) => (
                    <MenuItem key={dept.id} value={dept.id}>
                      {storedLang === 'ar'
                        ? dept.name?.localizedStrings?.find(
                            (ls) => ls.language.toLowerCase() === 'ar'
                          )?.value || dept.name?.value
                        : dept.name?.value || 'Untitled'}
                    </MenuItem>
                  ))}
              </TextField>
            </Stack>

            {/* Add/Edit Form for Sessions */}
            <Stack spacing={1.5} sx={{ mb: 3 }}>
              <TextField
                fullWidth
                size="small"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                placeholder={t('departments.labels.session_name')}
                disabled={!selectedSectionId || (isEditing && !isEditingSession)} // Disable if no parent selected or not editing a session
                InputProps={{ inputProps: { style: { fontSize: '14px' } } }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && selectedSectionId) {
                    // Only handle Enter for Session add/edit
                    isEditingSession
                      ? handleUpdateItem(selectedSectionId, sessionName, sessionNameAr)
                      : handleAddItem(selectedSectionId, sessionName, sessionNameAr);
                  }
                }}
              />
              <TextField
                fullWidth
                size="small"
                value={sessionNameAr}
                onChange={(e) => setSessionNameAr(e.target.value)}
                placeholder={t('departments.labels.session_name_arabic')} // Arabic placeholder
                disabled={!selectedSectionId || (isEditing && !isEditingSession)} // Disable if no parent selected or not editing a session
                InputProps={{ inputProps: { style: { fontSize: '14px' } } }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && selectedSectionId) {
                    // Only handle Enter for Session add/edit
                    isEditingSession
                      ? handleUpdateItem(selectedSectionId, sessionName, sessionNameAr)
                      : handleAddItem(selectedSectionId, sessionName, sessionNameAr);
                  }
                }}
              />
              <Stack direction="row" justifyContent="flex-end" spacing={1}>
                <Button
                  size="small"
                  onClick={handleCancelEditSession}
                  color="inherit"
                  variant="outlined"
                >
                  {t('departments.buttons.cancel')}
                </Button>
                <Button
                  size="small"
                  onClick={() =>
                    isEditingSession
                      ? handleUpdateItem(selectedSectionId, sessionName, sessionNameAr)
                      : handleAddItem(selectedSectionId, sessionName, sessionNameAr)
                  }
                  variant="contained"
                  disabled={
                    (!sessionName.trim() && !isEditingSession) || // Disable add if name empty (unless editing this session)
                    !selectedSectionId || // Disable if no section selected
                    (isEditing && !isEditingSession) // Disable if editing item not a session
                  }
                  sx={{ bgcolor: '#006A67' }}
                >
                  {isEditingSession ? t('departments.buttons.save') : t('departments.buttons.add')}
                </Button>
              </Stack>
            </Stack>

            {/* List of Child Sessions */}
            <Stack spacing={1}>
              {childSessions
                .filter(
                  (sess) => !selectedSectionId || sess.parentDepartmentId === selectedSectionId
                )
                .map((session, index, array) => (
                  <Box
                    key={session.id}
                    sx={{
                      borderBottom: index !== array.length - 1 ? '1px dashed #ccc' : 'none',
                      pb: 0.5,
                    }}
                  >
                    {editingItemId === session.id && isEditingSession ? (
                      <Typography variant="caption" sx={{ fontStyle: 'italic' }}>
                        {t('departments.labels.editing')}
                      </Typography>
                    ) : (
                      <>
                        <Stack
                          direction={{ xs: 'column', lg: 'row' }}
                          justifyContent="space-between"
                        >
                          <Typography variant="body2" sx={{ overflowWrap: 'break-word' }}>
                            {storedLang === 'ar'
                              ? session.name?.localizedStrings?.find(
                                  (ls) => ls.language.toLowerCase() === 'ar'
                                )?.value || session.name?.value
                              : session.name?.value || 'Untitled'}
                            {/* {session.name?.value || 'Untitled'} */}
                            {/* {session.name?.localizedStrings?.find((ls) => ls.language === 'ar')
                              ?.value &&
                              ` / ${session.name.localizedStrings.find((ls) => ls.language === 'ar').value}`} */}
                          </Typography>
                          <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent={{ xs: 'space-between', lg: '' }}
                          >
                            <Chip
                              label={`${session.employeeCount || 0}`}
                              size="small"
                              sx={{
                                bgcolor: '#006A67',
                                color: '#fff',
                                fontSize: '0.7rem',
                                height: '20px',
                              }}
                            />
                            <Stack direction="row">
                              <Tooltip title={t('departments.tooltips.edit')}>
                                <IconButton onClick={() => handleEditItem(session)} size="small">
                                  <Iconify icon="eva:edit-fill" width={15} height={15} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip
                                title={
                                  session.employeeCount > 0
                                    ? t('departments.tooltips.cannot_delete_session')
                                    : t('departments.buttons.delete')
                                }
                              >
                                <span>
                                  <IconButton
                                    onClick={() => handleOpenDeleteDialog(session)}
                                    size="small"
                                    color="error"
                                    disabled={session.employeeCount > 0}
                                  >
                                    <Iconify icon="eva:trash-2-outline" width={15} height={15} />
                                  </IconButton>
                                </span>
                              </Tooltip>
                            </Stack>
                          </Stack>
                        </Stack>

                        <Typography
                          variant="caption"
                          sx={{
                            flexGrow: 1,
                            mr: 1,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            color: '#006A67',
                          }}
                        >
                          {getParentName(session.parentDepartmentId)} /{' '}
                          {storedLang === 'ar'
                            ? session.name?.localizedStrings?.find(
                                (ls) => ls.language.toLowerCase() === 'ar'
                              )?.value || session.name?.value
                            : session.name?.value || 'Untitled'}
                        </Typography>
                      </>
                    )}
                  </Box>
                ))}
              {childSessions.filter(
                (sess) => !selectedSectionId || sess.parentDepartmentId === selectedSectionId
              ).length === 0 &&
                selectedSectionId && (
                  <Typography variant="caption">
                    {t('departments.tooltips.session_available')}
                  </Typography>
                )}
            </Stack>
          </Card>
        </Grid>
      </Grid>

      {/* --- Confirmation Dialog --- */}
      <ConfirmDialog
        open={openConfirmDialog}
        onClose={handleCloseDeleteDialog}
        title={t('departments.dialog.delete_title')}
        content={t('departments.dialog.delete_confirm2', { name: itemToDelete?.name?.value || '' })}
        action={
          <Button variant="contained" color="error" onClick={handleRemoveItem}>
            {t('departments.buttons.delete')}
          </Button>
        }
      />
    </Stack>
  );
}
