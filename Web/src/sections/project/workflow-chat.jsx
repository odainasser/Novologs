'use client';

import { useState, useRef, useCallback } from 'react';

import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import { Dialog, DialogTitle, DialogActions } from '@mui/material';
import { Iconify } from 'src/components/iconify';

import { useMockedUser } from 'src/auth/hooks';
import { useTranslation } from 'react-i18next';
import { toast } from 'src/components/snackbar';
import { useAuthContext } from 'src/auth/hooks';
import { addFile } from 'src/actions/file/fileActions';
import { Box } from '@mui/material';
import { Scrollbar } from 'src/components/scrollbar';

// ----------------------------------------------------------------------

export function AddWorkflowComment({ open, onClose, handleClose, ...other }) {
  const { zetaUser } = useAuthContext();
  const storedLang = localStorage.getItem('selectedLang');

  const fileRef = useRef(null);
  const { t, i18n } = useTranslation('dashboard/tasks');
  const [message, setMessage] = useState('');

  const [fileObjects, setFileObjects] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleAttach = useCallback(() => {
    if (fileRef.current) {
      fileRef.current.click();
    }
  }, []);
  const handleFileChange = useCallback(async (event) => {
    const files = event.target.files;
    if (files) {
      setIsUploading(true);
      const newFileObjects = [];
      for (const file of files) {
        try {
          const filePayload = {
            name: `WorkFlowCommentFile_${Date.now()}_${file.name}`,
            file: file,
          };

          const result = await addFile(filePayload);
          if (result.success) {
            const fileResponse = result?.response?.data?.successStatus;
            if (fileResponse && fileResponse.id && fileResponse.url) {
              newFileObjects.push({ id: fileResponse.id, url: fileResponse.url, name: file.name });
            } else {
              toast.error(`Failed to get details for file: ${file.name}`);
            }
          } else {
            toast.error(result.error || `Failed to upload file: ${file.name}`);
          }
        } catch (error) {
          console.error('Error uploading file:', error);
          toast.error(`Error uploading file: ${file.name}`);
        }
      }
      setFileObjects((prevFiles) => [...prevFiles, ...newFileObjects]);
      setIsUploading(false);
      if (fileRef.current) {
        fileRef.current.value = '';
      }
    }
  }, []);

  const handleChatClose = () => {
    handleClose();
    setMessage('');
    setFileObjects([]);
  };

  const handleRemoveFile = (fileIdToRemove) => {
    setFileObjects((prevFiles) => prevFiles.filter((file) => file.id !== fileIdToRemove));
  };

  const handleAddComment = async () => {
    const trimmed = message.trim();
    if (!trimmed && fileObjects.length === 0) {
      toast.info('Please enter a message or attach a file.');
      return;
    }
  };
  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      open={open}
      onClose={handleChatClose}
      sx={{
        '& .MuiDialog-paper': {
          height: 'inherit',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
      dir={storedLang === 'ar' ? 'rtl' : 'ltr'}
      {...other}
    >
      <DialogTitle>Comments</DialogTitle>
      <Scrollbar sx={{ height: 70 * 5, px: 3 }}>
        <Stack direction="row" spacing={2} sx={{ py: 2, px: 0 }}>
          <Avatar src={zetaUser?.profileImageFileUrl} alt={zetaUser?.fullName}>
            {zetaUser?.fullName?.charAt(0).toUpperCase()}
          </Avatar>

          <Paper variant="outlined" sx={{ p: 1, flexGrow: 1, bgcolor: 'transparent' }}>
            {fileObjects.length > 0 && (
              <Stack
                spacing={1}
                sx={{ mb: 1, display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '8px' }}
              >
                {fileObjects.map((file) => (
                  <Box
                    key={file.id}
                    sx={{
                      position: 'relative',
                      border: (theme) => `1px solid ${theme.palette.divider}`,
                      borderRadius: 1,
                      p: 0.5,
                    }}
                  >
                    <img
                      src={file.url}
                      alt={file.name || 'uploaded file'}
                      style={{
                        height: 80,
                        width: 80,
                        objectFit: 'cover',
                        borderRadius: 4,
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveFile(file.id)}
                      sx={{
                        position: 'absolute',
                        top: -5,
                        right: -5,
                        bgcolor: 'rgba(255,255,255,0.7)',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
                      }}
                    >
                      <Iconify icon="mingcute:close-fill" width={14} />
                    </IconButton>
                  </Box>
                ))}
              </Stack>
            )}

            <InputBase
              fullWidth
              multiline
              rows={4}
              placeholder="Type..."
              variant="outlined"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />

            <Stack direction="row" alignItems="center">
              <Stack direction="row" flexGrow={1}>
                <IconButton>
                  <Iconify
                    icon="solar:gallery-add-bold"
                    onClick={handleAttach}
                    disabled={isUploading}
                  />
                </IconButton>

                <IconButton>
                  <Iconify icon="eva:attach-2-fill" onClick={handleAttach} disabled={isUploading} />
                </IconButton>
              </Stack>
              <Button onClick={handleAddComment} variant="contained" disabled={isUploading}>
                {t('tasks.comment_input.comment')}
              </Button>
            </Stack>
          </Paper>
          <input
            type="file"
            ref={fileRef}
            multiple
            style={{ display: 'none' }}
            onChange={handleFileChange}
            // accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx" // Optional: specify accepted file types
          />
        </Stack>
      </Scrollbar>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          variant="outlined"
          color="inherit"
          onClick={handleChatClose}
          sx={{
            ...(storedLang === 'ar' && { ml: 1 }),
          }}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}
