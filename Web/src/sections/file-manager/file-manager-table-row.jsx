import { useState, useEffect, useCallback } from 'react';

import {
  TableRow,
  TableCell,
  Stack,
  Typography,
  IconButton,
  Avatar,
  AvatarGroup,
  Tooltip,
  MenuList,
  MenuItem,
  Divider,
  Checkbox,
} from '@mui/material';

import Box from '@mui/material/Box';
import { useBoolean } from 'src/hooks/use-boolean';
import { FileThumbnail } from 'src/components/file-thumbnail';
import { Iconify } from 'src/components/iconify';
import { usePopover, CustomPopover } from 'src/components/custom-popover';
import { fData } from 'src/utils/format-number';
import { fDateTime, fDate } from 'src/utils/format-time';
import { ConfirmDialog } from 'src/components/custom-dialog';
import Button from '@mui/material/Button';
import { FileManagerShareDialog } from './file-manager-share-dialog';
import { _fmMembers } from './file-manager-mock-data';
import { toast } from 'src/components/snackbar';
import { useTheme, useMediaQuery } from '@mui/material';
import { useTranslation } from 'react-i18next';
import ListItemText from '@mui/material/ListItemText';
import TextField from '@mui/material/TextField';
import { updateFile } from 'src/actions/file/fileActions';
import { FileManagerMembers } from './file-manager-members'; // adjust the path as needed
import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------- -----------------------------------

export function FileManagerTableRow({
  row,
  index,
  onViewMembers,
  onEditRow,
  onDeleteRow,
  onToggleStar,
  onOpenFolder,
  onClickFile,
  onUpdateShare,
  isProjectDisabled,
  isClientDisabled,
  isProject,
  isClient,
  isLead,
  currentFolderId,
  setCurrentFolderName,
  setMembers,
  setMode,
  folderPath,
  sharedFolder,
  deletedFolder,
  setSelectedRowId,
  setSelectedRowMembers,
  allUsers,
  mutateFiles,
  sharedUserIds,
  selectedRowId,
  mode,
  selectedRowMembers,
  selected,
  setSelected,
  isClientView,
  isInsideProtectedFolder,
  selectedPersons,
  setSelectedPersons,
  isInsideMySharesFolder,
}) {
  console.log('this is the row', row);
  const { t, i18n } = useTranslation('dashboard/files');
  const storedLang = localStorage.getItem('selectedLang');
  const [folderMembers, setFolderMembers] = useState(false); // for dialog open
  const { zetaUser } = useAuthContext();

  const confirm = useBoolean();
  const popover = usePopover();
  const [shareOpen, setShareOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  // const [selectedPersons, setSelectedPersons] = useState([]);
  const theme = useTheme();

  const isLargeScreen = useMediaQuery(theme.breakpoints.up('xl'));

  useEffect(() => {
    if (shareOpen && row?.members) {
      setSelectedPersons(row.members);
    }
  }, [shareOpen, row]);

  const handleTogglePerson = (person) => {
    const exists = selectedPersons.some((p) => p.id === person.id);
    setSelectedPersons((prev) =>
      exists ? prev.filter((p) => p.id !== person.id) : [...prev, person]
    );
  };

  const handleToggleMember = (person) => {
    setSelectedMembers((prevSelected) => {
      const exists = prevSelected.some((p) => p.id === person.id);
      if (exists) {
        return prevSelected.filter((p) => p.id !== person.id);
      }

      return [...prevSelected, { ...person, sharePermission: false }];
    });
  };

  const handleShare = () => {
    const updatedFile = {
      ...row,
      members: selectedPersons, // ✅ Overwrite with new selection
    };

    onUpdateShare?.(updatedFile); // ✅ Notify parent to update tableData
    setShareOpen(false);
    toast.success(t('files.toast.shared_member'));
  };
  const [editingFileId, setEditingFileId] = useState(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFile, setNewFile] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const handleMemberDialogClose = () => setFolderMembers(false);
  const handleOpenMembers = () => {
    setFolderMembers(true);
  };
  const handleEditFile = (file) => {
    setMode('edit');
    setSelected('select');

    setEditingFileId(file.id);
    setNewFolderName(file.name);
    setNewFile(file.path);

    const initialMembers = (file?.shares || [])
      .map((share) => allUsers.find((u) => u.id === share.sharedWithUserId))
      .filter(Boolean);

    setSelectedPersons(initialMembers);
    setSelectedMembers(initialMembers);
  };
  const clearField = () => {
    setEditingFileId(null);
    setNewFolderName('');
    setSelectedMembers([]);
    setSelected('select');
  };

  const handleUpdateFile = async () => {
    const payload = {
      id: editingFileId,
      name: newFolderName,
      members: [
        ...selectedMembers.map((member) => ({
          id: member.id,
          folderSharePermissionLevel: 0,
        })),
      ],
    };
    console.log('this is the payload', payload);

    try {
      const response = await updateFile(payload);
      if (response.success) {
        toast.success(t('files.toast.update_success'));
        clearField();
        await mutateFiles();
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      console.error('File update failed:', error);
    }
  };

  return (
    <>
      <TableRow hover tabIndex={-1}>
        {/* Sl No. */}
        <TableCell
          sx={{
            cursor: 'pointer',
            borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
          }}
          onClick={() => {
            if (row.isFile) {
              onClickFile?.(row);
            } else {
              onOpenFolder?.(row);
              setCurrentFolderName(row.name);
            }
          }}
          align="center"
        >
          {index + 1}
        </TableCell>

        <TableCell
          sx={{
            whiteSpace: 'nowrap',
            cursor: 'pointer',
            borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
          }}
          onClick={() => {
            if (row.isFile) {
              onClickFile?.(row);
            } else {
              onOpenFolder?.(row);
              setCurrentFolderName(row.name);
            }
          }}
        >
          <Box display="flex" gap={1} alignItems="center">
            <Avatar sx={{ width: 30, height: 30 }}>
              {row?.creator?.profileImageUrl ? (
                <img
                  src={row?.creator?.profileImageUrl}
                  alt={row?.creator?.fullName}
                  width="30"
                  height="30"
                />
              ) : (
                row?.creator?.fullName?.charAt(0).toUpperCase()
              )}
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
                primary={row?.creator?.fullName || t('files.labels.not_available')}
                secondary={`On: ${fDate(row?.created) || t('files.labels.not_available')}`}
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
            cursor: 'pointer',
            borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
          }}
          align={storedLang === 'ar' ? 'right' : 'left'}
          onClick={() => {
            if (row.isFile) {
              onClickFile?.(row);
            } else {
              onOpenFolder?.(row);
              setCurrentFolderName(row.name);
            }
          }}
        >
          {row?.isFile ? t('files.labels.files') : t('files.labels.folders')}
        </TableCell>
        <TableCell
          sx={{
            cursor: 'pointer',
            // backgroundColor: !row.isFile ? 'rgba(0,106,103,0.04)' : 'inherit',
            // '&:hover': {
            //   backgroundColor: 'rgba(0,106,103,0.08)',
            // },
            borderRight: '1px dotted rgba(200,200,200,0.6)',
            whiteSpace: 'nowrap',
            cursor: 'pointer',
          }}
        >
          {editingFileId === row?.id && !row.isFile ? (
            <TextField
              fullWidth
              size="small"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              autoFocus
            />
          ) : (
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              onClick={() => {
                if (row.isFile) {
                  onClickFile?.(row);
                } else {
                  onOpenFolder?.(row);
                  setCurrentFolderName(row.name);
                }
              }}
            >
              <FileThumbnail
                file={row}
                sx={{
                  width: 18,
                  height: 18,
                }}
              />
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
                  {row.name}
                </Typography>
              </Box>
            </Stack>
          )}
        </TableCell>

        <TableCell
          sx={{ borderRight: '1px dotted rgba(200, 200, 200, 0.6)' }}
          align={storedLang === 'ar' ? 'right' : 'left'}
        >
          {editingFileId === row?.id ? (
            <Tooltip title={t('files.placeholder.edit_members')} arrow>
              <IconButton
                size="small"
                color="primary"
                onClick={() => {
                  setFolderMembers(true);
                  // setMode('edit');
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
              {row?.shares && row?.shares.length > 0 ? (
                <AvatarGroup
                  sx={{ cursor: 'pointer' }}
                  onClick={() => onViewMembers?.(row.shares || [], row?.creator)}
                >
                  {row.shares?.slice(0, 3).map((member) => (
                    <Tooltip key={member.id} title={member.sharedWithUser.fullName} arrow>
                      <Avatar
                        key={member.id}
                        alt={member.sharedWithUser.fullName}
                        src={member?.sharedWithUser.profileImageUrl}
                        sx={{ width: 25, height: 25 }}
                      >
                        {!member?.sharedWithUser.profileImageUrl &&
                          member?.sharedWithUser.fullName?.charAt(0).toUpperCase()}
                      </Avatar>
                    </Tooltip>
                  ))}
                  {row?.shares.length > 3 && (
                    <Avatar sx={{ width: 25, height: 25 }}>+{row?.shares.length - 3}</Avatar>
                  )}
                </AvatarGroup>
              ) : (
                <Typography variant="caption" component="span">
                  {t('files.labels.no_members')}
                </Typography>
              )}
            </>
          )}
        </TableCell>
        {!isProject && !isClient && !isLead && !currentFolderId && (
          <TableCell
            sx={{ borderRight: '1px dotted rgba(200, 200, 200, 0.6)', cursor: 'pointer' }}
            align={storedLang === 'ar' ? 'right' : 'left'}
            onClick={() => {
              if (row.isFile) {
                onClickFile?.(row);
              } else {
                onOpenFolder?.(row);
                setCurrentFolderName(row.name);
              }
            }}
          >
            {t('files.labels.general')}
          </TableCell>
        )}

        <TableCell
          sx={{ borderRight: '1px dotted rgba(200, 200, 200, 0.6)', cursor: 'pointer' }}
          align={storedLang === 'ar' ? 'right' : 'left'}
          onClick={() => {
            if (row.isFile) {
              onClickFile?.(row);
            } else {
              onOpenFolder?.(row);
              setCurrentFolderName(row.name);
            }
          }}
        >
          {fData(row.size)}
        </TableCell>

        <TableCell
          sx={{ borderRight: '1px dotted rgba(200, 200, 200, 0.6)', cursor: 'pointer' }}
          align={storedLang === 'ar' ? 'right' : 'left'}
          onClick={() => {
            if (row.isFile) {
              onClickFile?.(row);
            } else {
              onOpenFolder?.(row);
              setCurrentFolderName(row.name);
            }
          }}
        >
          {fDateTime(row.lastModified) || t('files.labels.not_available')}
        </TableCell>
        {/* Actions */}
        {!isInsideProtectedFolder && (folderPath.length > 0 || isProject || isClient || isLead) && (
          <TableCell
            align="center"
            sx={{
              ...(storedLang === 'ar' && {
                borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
              }),
            }}
          >
            {editingFileId === row?.id ? (
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
                    onClick={handleUpdateFile}
                    size="small"
                    sx={{
                      bgcolor: '#006A67',
                      color: 'primary.contrastText',
                      '&:hover': { bgcolor: 'primary.dark' },
                      textTransform: 'none',
                      padding: '4px 10px',
                    }}
                  >
                    {t('files.buttons.update')}
                  </Button>
                  <Tooltip title={t('files.buttons.cancel')} arrow>
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
                {!['Application', 'BIN', 'Files & Folders'].includes(row.name) && (
                  <Stack direction="row" spacing={1} justifyContent="center">
                    <IconButton
                      color={popover.open ? 'inherit' : 'default'}
                      onClick={popover.onOpen}
                    >
                      <Iconify icon="eva:more-vertical-fill" />
                    </IconButton>
                  </Stack>
                )}
              </>
            )}
          </TableCell>
        )}
      </TableRow>
      <FileManagerMembers
        open={folderMembers}
        shared={
          isInsideMySharesFolder
            ? allUsers || []
            : folderPath.length >= 1
              ? (() => {
                  const lastFolder = folderPath[folderPath.length - 1];

                  if (folderPath?.[0]?.id === 'my-shares' && folderPath.length === 1) {
                    return allUsers || [];
                  }

                  if (
                    (lastFolder?.name === 'General' && folderPath.length === 1) ||
                    (isProject && folderPath.length === 1 && folderPath?.[0].milestoneId) ||
                    (isClient &&
                      !isClientView &&
                      folderPath.length === 1 &&
                      folderPath?.[0].contractId) ||
                    (isClient && isClientView && folderPath.length === 1 && folderPath?.[0].leadId)
                  ) {
                    return allUsers?.filter((user) => user.id !== zetaUser?.id) || [];
                  }

                  return allUsers?.filter((user) => sharedUserIds.includes(user.id)) || [];
                })()
              : mode === 'share'
                ? allUsers?.filter(
                    (user) =>
                      user.id !== zetaUser?.id &&
                      (!selectedRowMembers ||
                        !selectedRowMembers.some((member) => member.sharedWithUserId === user.id))
                  ) || []
                : allUsers?.filter((user) => user.id !== zetaUser?.id) || []
        }
        selectedPersons={selectedMembers}
        setSelectedPersons={setSelectedMembers}
        handleClose={handleMemberDialogClose}
        onTogglePerson={handleToggleMember}
        mode={mode}
        selectedRowId={selectedRowId}
        mutateFiles={mutateFiles}
        selected={selected}
        setSelected={setSelected}
        selectedRowMembers={selectedRowMembers}
      />
      {/* More Menu */}
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
          {!isInsideMySharesFolder && zetaUser?.permissions?.includes('Folders.UpdateFolder') && (
            <MenuItem
              onClick={() => {
                handleEditFile(row);
                popover.onClose();
              }}
            >
              <Iconify icon="solar:pen-bold" sx={{ mr: 1 }} />
              {t('files.buttons.edit')}
            </MenuItem>
          )}
          {zetaUser?.permissions?.includes('Folders.ShareFolder') && (
            <MenuItem
              onClick={() => {
                setMode('share');
                setSelected('select');
                setSelectedRowId(row.id);
                setSelectedRowMembers(row?.shares || []);

                const initialMembers = (row?.shares || [])
                  .map((share) => ({
                    id: share.sharedWithUserId,
                    fullName: share.sharedWithUser?.fullName,
                    serial: share.sharedWithUser?.serial,
                    designationName: share.sharedWithUser?.designation,
                    departmentName: share.sharedWithUser?.department,
                    profileImageFileUrl: share.sharedWithUser?.profileImageUrl,
                    sharePermission: share.folderSharePermissionLevel === 1,
                  }))
                  .filter((member) => member.id);

                setSelectedPersons(initialMembers);
                setSelectedMembers(initialMembers);
                if (isInsideMySharesFolder) {
                  setFolderMembers(true);
                } else {
                  setMembers(true);
                }
                popover.onClose();
              }}
            >
              <Iconify icon="solar:share-bold" sx={{ mr: 1 }} />
              {t('files.buttons.share')}
            </MenuItem>
          )}
          {!isInsideMySharesFolder && zetaUser?.permissions?.includes('Folders.DeleteFolder') && (
            <MenuItem
              onClick={() => {
                confirm.onTrue();
                popover.onClose();
              }}
              sx={{ color: 'error.main' }}
            >
              <Iconify icon="solar:trash-bin-trash-bold" sx={{ mr: 1 }} />
              {t('files.dialog.delete_title')}
            </MenuItem>
          )}

          {/* <MenuItem
            onClick={() => {
              popover.onClose();
            }}
          >
            <Iconify icon="eva:link-2-fill" />
            {row?.isFile ? t('files.labels.copy_file') : t('files.labels.copy_folder')}
          </MenuItem> */}
        </MenuList>
      </CustomPopover>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title={t('files.dialog.delete_title')}
        content={t('files.dialog.delete_content3')}
        action={
          <Button
            variant="contained"
            color="error"
            onClick={onDeleteRow}
            sx={{
              ...(storedLang === 'ar' && { ml: 1 }),
            }}
          >
            {t('files.dialog.delete_title')}
          </Button>
        }
        sx={{
          direction: storedLang === 'ar' ? 'rtl' : 'ltr',
        }}
      />
      {/* Share Dialog */}
      <FileManagerShareDialog
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        shared={_fmMembers}
        item={row}
        selectedPersons={selectedPersons}
        onTogglePerson={handleTogglePerson}
        onConfirm={handleShare}
      />
    </>
  );
}

{
  /* <FileManagerFileDetails
        item={row}
        open={details.value}
        onClose={details.onFalse}
        onDelete={() => onDelete(row)}
      /> */
}
