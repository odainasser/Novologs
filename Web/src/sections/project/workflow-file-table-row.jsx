import { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from 'src/auth/hooks';
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
  Badge,
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
import { toast } from 'src/components/snackbar';
import { useTheme, useMediaQuery } from '@mui/material';
import { useTranslation } from 'react-i18next';
import ListItemText from '@mui/material/ListItemText';
import { TextField } from '@mui/material';
import { getUser } from 'src/actions/userManage/userManageActions';
import { WorkFlowFileMembers } from './workflow-file-members';
import { Label } from 'src/components/label';
import { AddWorkflowComment } from './workflow-chat';
// ----------------------------------- -----------------------------------

export function WorkFlowFileTableRow({
  row,
  index,
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
  folderPath,
  sharedFolder,
  setSelectedRowId,
  setSelectedRowMembers,
  setTableData,
  allowedFileTypes,
  isMainView,
}) {
  console.log('this is the row', row);
  const { t, i18n } = useTranslation('dashboard/files');
  const storedLang = localStorage.getItem('selectedLang');
  const { usersList, usersListLoading, usersListError, usersListValidating, usersListEmpty } =
    getUser();
  const { zetaUser } = useAuthContext();

  const confirm = useBoolean();
  const popover = usePopover();
  const [shareOpen, setShareOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedPersons, setSelectedPersons] = useState(null);
  const theme = useTheme();
  const [uploading, setUploading] = useState(false);
  const [mode, setMode] = useState('add');

  const [members, setMembers] = useState(false);
  const handleMemberDialogClose = () => setMembers(false);

  const [openChat, setOpenChat] = useState(false);
  const handleChatDialogClose = () => setOpenChat(false);

  const handleTogglePerson = (person) => {
    setSelectedPersons((prev) => (prev?.id === person.id ? null : person));
  };
  console.log('this is the selected person', selectedPersons);

  const isLargeScreen = useMediaQuery(theme.breakpoints.up('xl'));
  const [newItem, setNewItem] = useState({
    name: '',
    type: 'file', // default to folder
    size: 0,
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
    members: '',
    projectName: '',
    clientName: '',
    fileObject: null,
    parentId: null, // new field
  });

  useEffect(() => {
    if (shareOpen && row?.members) {
      setSelectedPersons(row?.members);
    }
  }, [shareOpen, row]);

  const handleShare = () => {
    const updatedFile = {
      ...row,
      members: selectedPersons, // ✅ Overwrite with new selection
    };

    onUpdateShare?.(updatedFile); // ✅ Notify parent to update tableData
    setShareOpen(false);
    toast.success(t('files.toast.shared_member'));
  };

  console.log('this is the new item', newItem);

  // const handleDownload = () => {
  //   const link = document.createElement('a');
  //   link.href = row?.items[0]?.url;
  //   link.download = row?.items[0]?.url;
  //   link.click();
  // };
  // const handleDownload = () => {
  //   const fileUrl = row?.items[0]?.url;
  //   const fileName = fileUrl.split('/').pop();

  //   const link = document.createElement('a');
  //   link.href = fileUrl;
  //   link.setAttribute('download', fileName || 'download');
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);
  // };
  const handleViewFile = () => {
    window.open(row?.items[0]?.url, '_blank');
  };
  const handleApprove = (id) => {
    setTableData((prevData) =>
      prevData.map((item) => (item.id === id ? { ...item, isApproved: true } : item))
    );
    toast.success('Approved Successfully');
  };
  return (
    <>
      <TableRow hover tabIndex={-1} selected={selected} aria-checked={selected}>
        {/* Sl No. */}
        <TableCell
          sx={{
            borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
          }}
          // onClick={() => {
          //   if (row?.items[0]?.isFile) {
          //     onClickFile?.(row?.items[0]);
          //   } else {
          //     onOpenFolder?.(row);
          //     setCurrentFolderName(row?.name);
          //   }
          // }}
          align="center"
        >
          {index + 1}
        </TableCell>

        <TableCell
          sx={{
            whiteSpace: 'nowrap',
            borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
          }}
          // onClick={() => {
          //   if (row?.items[0]?.isFile) {
          //     onClickFile?.(row?.items[0]);
          //   } else {
          //     onOpenFolder?.(row);
          //     setCurrentFolderName(row?.name);
          //   }
          // }}
        >
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
              variant={row?.code ? 'body1' : 'caption'}
              sx={{
                display: 'block',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%',
              }}
            >
              {row?.code || 'Not Available'}
            </Typography>
          </Box>
        </TableCell>
        {isMainView && (
          <TableCell
            sx={{
              borderRight: '1px dotted rgba(200, 200, 200, 0.6)',

              maxWidth: { xl: '100%', lg: 280 },
              minWidth: 180,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
            align="center"
          >
            <Typography
              variant="body2"
              noWrap
              sx={{
                maxWidth: { xl: '100%', lg: 180 },

                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {row?.project}
            </Typography>
          </TableCell>
        )}
        <TableCell sx={{ borderRight: '1px dotted rgba(200,200,200,0.6)' }} align="center">
          <Tooltip title="Chat" arrow>
            <Badge
              badgeContent={row?.chatCount}
              color="warning"
              overlap="circular"
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              sx={{
                '& .MuiBadge-badge': {
                  minWidth: 14,
                  height: 14,
                  fontSize: '0.65rem',
                  padding: '0 4px',
                  top: '8px',
                  color: '#ffffff',
                },
              }}
            >
              <IconButton
                color="default"
                sx={{
                  color: '#006A67',
                }}
                onClick={() => {
                  setOpenChat(true);
                }}
              >
                <Iconify icon="mdi:chat-processing" width={16} />
              </IconButton>
            </Badge>
          </Tooltip>
          <AddWorkflowComment open={openChat} handleClose={handleChatDialogClose} />
        </TableCell>

        <TableCell
          sx={{
            maxWidth: { xl: '100%', lg: 280 },

            minWidth: 180,
            backgroundColor: !row?.items[0]?.isFile ? 'rgba(0,106,103,0.04)' : 'inherit',
            '&:hover': {
              backgroundColor: 'rgba(0,106,103,0.08)',
            },
            borderRight: '1px dotted rgba(200,200,200,0.6)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'space-between' }}>
            <Box
              sx={{
                display: 'flex',
              }}
              gap={1}
            >
              <Avatar
                alt={row?.items[0]?.name}
                src={row?.items[0]?.profileImageFileUrl}
                sx={{ width: 25, height: 25 }}
              >
                {!row?.items[0]?.profileImageFileUrl &&
                  row?.items[0]?.name?.charAt(0).toUpperCase()}
              </Avatar>

              <Typography
                variant="body1"
                noWrap
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%',

                  ...(storedLang === 'ar' && { textAlign: 'right' }),
                }}
              >
                {row?.items[0]?.name}
              </Typography>
            </Box>
            <Label color={row.isApproved ? 'success' : 'warning'}>
              {row.isApproved ? 'Approved' : 'Sent for approval'}
            </Label>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <FileThumbnail file={row?.items[0]} sx={{ width: 18, height: 18 }} />
              <Typography
                variant="body2"
                noWrap
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: { xl: '100%', lg: 200 },
                }}
              >
                {row?.items[0]?.path}
              </Typography>
            </Stack>
            <Tooltip title="View file" arrow>
              <IconButton color="default" onClick={handleViewFile} sx={{ color: '#006A67' }}>
                <Iconify icon="mdi:eye" width={16} />
              </IconButton>
            </Tooltip>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2">Sent to:</Typography>
            <Tooltip key={zetaUser?.id} title={`${zetaUser?.fullName}`} arrow>
              <Avatar
                key={zetaUser?.id}
                alt={zetaUser?.fullName}
                src={zetaUser?.profileImageFileUrl}
                sx={{ width: 25, height: 25 }}
              >
                {!zetaUser?.profileImageFileUrl && zetaUser?.fullName?.charAt(0).toUpperCase()}
              </Avatar>
            </Tooltip>
          </Box>
        </TableCell>

        <TableCell
          sx={{
            maxWidth: { xl: '100%', lg: 280 },
            minWidth: 180,
            backgroundColor: !row?.items[1]?.isFile ? 'rgba(0,106,103,0.04)' : 'inherit',
            '&:hover': {
              backgroundColor: 'rgba(0,106,103,0.08)',
            },
            borderTop: '1px dotted rgba(200,200,200,0.6)',
            borderRight: '1px dotted rgba(200,200,200,0.6)',
            ...(storedLang === 'ar' && {
              borderLeft: '1px dotted rgba(200,200,200,0.6)',
            }),

            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
            }}
            gap={1}
          >
            <Box
              sx={{
                display: 'flex',
              }}
              gap={1}
            >
              <Avatar
                key={zetaUser?.id}
                alt={zetaUser?.fullName}
                src={zetaUser?.profileImageFileUrl}
                sx={{ width: 25, height: 25 }}
              >
                {!zetaUser?.profileImageFileUrl && zetaUser?.fullName?.charAt(0).toUpperCase()}
              </Avatar>
              <Typography
                variant="body1"
                noWrap
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%',
                  ...(storedLang === 'ar' && { textAlign: 'right' }),
                }}
              >
                {zetaUser?.fullName}
              </Typography>
            </Box>
            {/* <Stack direction="row" alignItems="center" spacing={1}>
              <FileThumbnail file={row?.items[1]} sx={{ width: 18, height: 18 }} />

              <Typography
                variant="body2"
                noWrap
                sx={{
                  maxWidth: { xl: '100%', lg: 180 },

                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {row?.items[1]?.path}
              </Typography>
            </Stack> */}

            {!row.isApproved ? (
              <Tooltip title="Approve">
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  sx={{
                    color: 'primary.contrastText',
                    '&:hover': { bgcolor: 'primary.dark' },
                    textTransform: 'none',
                    padding: '6px 12px',
                    bgcolor: '#006A67',
                  }}
                  onClick={() => {
                    handleApprove(row.id);
                  }}
                  disabled={selectedPersons?.id || newItem?.fileObject}
                >
                  Approve
                </Button>
              </Tooltip>
            ) : (
              <Label color={row.isApproved ? 'success' : 'warning'} sx={{ mt: 1 }}>
                {row.isApproved ? 'Approved' : 'Sent for approval'}
              </Label>
            )}
          </Box>
          {!row.isApproved && (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, my: 1 }}>
                {newItem.type === 'file' ? (
                  <>
                    <input
                      id="upload-file2-input"
                      type="file"
                      hidden
                      accept={allowedFileTypes.map((ext) => `.${ext}`).join(',')}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        const extension = file.name.split('.').pop()?.toLowerCase();
                        if (!allowedFileTypes.includes(extension)) {
                          toast.error(t('files.validations.invalid_type'));
                          return;
                        }

                        setUploading(true);

                        setTimeout(() => {
                          setNewItem({
                            ...newItem,
                            name: file.name,
                            type: 'file',
                            size: file.size,
                            fileObject: file,
                            createdAt: new Date().toISOString(),
                            modifiedAt: new Date(file.lastModified).toISOString(),
                          });
                          setUploading(false);
                        }, 800); // simulate loading
                      }}
                    />

                    <Tooltip title={t('files.tooltip.choose_file')}>
                      <IconButton
                        component="label"
                        htmlFor="upload-file2-input"
                        sx={{
                          width: 16,
                          height: 16,
                        }}
                      >
                        <Iconify
                          icon={uploading ? 'line-md:loading-loop' : 'mdi:clipboard-text-outline'}
                          sx={{ color: '#006A67' }}
                        />
                      </IconButton>
                    </Tooltip>

                    <Typography
                      variant="caption"
                      sx={{
                        ml: 1,
                        '& .MuiInputBase-input': {
                          padding: '9px 14px',
                        },
                        '& .MuiInputLabel-root': {
                          top: '-5px',
                          fontSize: '10px',
                        },
                      }}
                    >
                      {newItem.fileObject?.name || t('files.toast.no_file_chosen')}
                    </Typography>
                  </>
                ) : (
                  <TextField
                    fullWidth
                    placeholder={t('files.placeholder.foldername')}
                    size="small"
                    value={newItem.name}
                    onChange={(e) =>
                      setNewItem({
                        ...newItem,
                        name: e.target.value,
                        size: 0,
                        type: 'file',
                      })
                    }
                    sx={{
                      '& .MuiInputBase-input': {
                        padding: '9px 14px',
                      },
                      '& .MuiInputLabel-root': {
                        top: '-5px',
                        fontSize: '10px',
                      },
                    }}
                  />
                )}
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  my: 1,
                }}
                gap={1}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {selectedPersons?.id && (
                    <Tooltip key={selectedPersons?.id} title={`${selectedPersons?.fullName}`} arrow>
                      <Avatar
                        key={selectedPersons.id}
                        alt={selectedPersons.fullName}
                        src={selectedPersons?.profileImageFileUrl}
                        sx={{ width: 25, height: 25 }}
                      >
                        {!selectedPersons?.profileImageFileUrl &&
                          selectedPersons?.fullName?.charAt(0).toUpperCase()}
                      </Avatar>
                    </Tooltip>
                  )}
                  <Tooltip
                    title={
                      selectedPersons?.id ? 'Change Member' : t('files.placeholder.add_members')
                    }
                  >
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => {
                        setMembers(true);
                        setMode('add');
                      }}
                      sx={{
                        width: 16,
                        height: 16,
                        mt: 1,
                        bgcolor: '#006A67',
                        color: 'primary.contrastText',
                        '&:hover': { bgcolor: 'primary.dark' },
                        cursor: 'pointer',
                      }}
                    >
                      <Iconify
                        icon={
                          selectedPersons?.id ? 'mdi:account-edit-outline' : 'mingcute:add-line'
                        }
                        width={16}
                      />
                    </IconButton>
                  </Tooltip>
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Tooltip title="Send for approval">
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      sx={{
                        color: 'primary.contrastText',
                        '&:hover': { bgcolor: 'primary.dark' },
                        textTransform: 'none',
                        padding: '6px 12px',
                        bgcolor: '#006A67',
                      }}
                      disabled={!selectedPersons?.id || !newItem?.fileObject}
                    >
                      Send
                    </Button>
                  </Tooltip>
                  {(selectedPersons?.id || newItem?.fileObject) && (
                    <Tooltip title="Clear Field" arrow>
                      <Iconify
                        icon="solar:trash-bin-trash-bold"
                        onClick={() => {
                          setNewItem({
                            name: '',
                            type: 'file',
                            size: 0,
                            createdAt: new Date().toISOString(),
                            modifiedAt: new Date().toISOString(),
                            members: '',
                            projectName: '',
                            clientName: '',
                            fileObject: null,
                            parentId: currentFolderId || null,
                          });
                          setSelectedPersons(null);
                        }}
                        sx={{
                          cursor: 'pointer',
                          height: 13,
                          width: 13,
                          color: 'error.main',
                          ...(storedLang === 'ar' ? { mr: 1 } : { ml: 1 }),
                        }}
                      />
                    </Tooltip>
                  )}
                </Box>
              </Box>
              <WorkFlowFileMembers
                open={members}
                shared={usersList?.users?.filter((user) => user.id !== zetaUser?.id)}
                selectedPersons={selectedPersons}
                setSelectedPersons={setSelectedPersons}
                handleClose={handleMemberDialogClose}
                onTogglePerson={handleTogglePerson}
                fileType={newItem.type}
                mode={mode}
              />
            </>
          )}
        </TableCell>
      </TableRow>

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
          <MenuItem
            onClick={() => {
              popover.onClose();
            }}
          >
            <Iconify icon="solar:check-circle-bold" color="#006A67" />
            Approve
          </MenuItem>

          <MenuItem
            onClick={() => {
              popover.onClose();
            }}
          >
            <Iconify icon="ic:round-send" color="#006A67" />
            Send for Approval
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
    </>
  );
}
