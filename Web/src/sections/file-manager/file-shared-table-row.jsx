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

// ----------------------------------- -----------------------------------

export function FileSharedTableRow({
  row,
  onViewMembers,
  onEditRow,
  onDeleteRow,
  onToggleStar,
  onOpenFolder,
  onClickFile,
  selected,
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
  isInsideProtectedFolder,
  isProtectedFolder,
}) {
  console.log('this is the row', row);
  const { t, i18n } = useTranslation('dashboard/files');
  const storedLang = localStorage.getItem('selectedLang');

  const confirm = useBoolean();
  const popover = usePopover();
  const [shareOpen, setShareOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedPersons, setSelectedPersons] = useState([]);
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

  const handleShare = () => {
    const updatedFile = {
      ...row,
      members: selectedPersons, // ✅ Overwrite with new selection
    };

    onUpdateShare?.(updatedFile); // ✅ Notify parent to update tableData
    setShareOpen(false);
    toast.success(t('files.toast.shared_member'));
  };

  return (
    <>
      <TableRow hover tabIndex={-1} selected={selected} aria-checked={selected}>
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
        ></TableCell>

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
                primary={row?.creator?.fullName || 'Not Available'}
                secondary={`On: ${fDate(row?.created) || 'Not Available'}`}
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
          {row?.isFile ? 'File' : 'Folder'}
        </TableCell>
        <TableCell
          onClick={() => {
            if (row.isFile) {
              onClickFile?.(row);
            } else {
              onOpenFolder?.(row);
              setCurrentFolderName(row.name);
            }
          }}
          sx={{
            cursor: 'pointer',
            backgroundColor: !row.isFile ? 'rgba(0,106,103,0.04)' : 'inherit',
            '&:hover': {
              backgroundColor: 'rgba(0,106,103,0.08)',
            },
            borderRight: '1px dotted rgba(200,200,200,0.6)',
            whiteSpace: 'nowrap',
            cursor: 'pointer',
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
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
                {row.isFile ? row.path : row.name}
              </Typography>
            </Box>
          </Stack>
        </TableCell>

        <TableCell
          sx={{ borderRight: '1px dotted rgba(200, 200, 200, 0.6)' }}
          align={storedLang === 'ar' ? 'right' : 'left'}
        >
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
              No Members
            </Typography>
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
            General
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
          {fDateTime(row.lastModified) || 'Not Available'}
        </TableCell>
        {/* Actions */}
        {!isInsideProtectedFolder && (
          <TableCell align="center">
            {!isProtectedFolder(row.name) && (
              <Stack direction="row" spacing={1} justifyContent="center">
                <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
                  <Iconify icon="eva:more-vertical-fill" />
                </IconButton>
              </Stack>
            )}
          </TableCell>
        )}
      </TableRow>

      {/* More Menu */}
      <CustomPopover
        open={popover.open}
        anchorEl={popover.anchorEl}
        onClose={popover.onClose}
        slotProps={{ arrow: { placement: 'right-top' } }}
      >
        <MenuList>
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
          <MenuItem
            onClick={() => {
              onEditRow?.(row);
              popover.onClose();
            }}
          >
            <Iconify icon="solar:pen-bold" sx={{ mr: 1 }} />
            {t('files.buttons.edit')}
          </MenuItem>
          <MenuItem
            onClick={() => {
              setMembers(true);
              setMode('share');
              // setShareOpen(true);
              popover.onClose();
            }}
          >
            <Iconify icon="solar:share-bold" sx={{ mr: 1 }} />
            {t('files.buttons.share')}
          </MenuItem>
          <MenuItem
            onClick={() => {
              popover.onClose();
            }}
          >
            <Iconify icon="eva:link-2-fill" />
            {row?.isFile ? 'Copy File' : 'Copy Folder'}
          </MenuItem>
        </MenuList>
      </CustomPopover>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title={t('files.dialog.delete_title')}
        content={t('files.dialog.delete_content3')}
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow}>
            {t('files.dialog.delete_title')}
          </Button>
        }
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
