import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import DocViewer, { DocViewerRenderers } from 'react-doc-viewer';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';

import {
  Box,
  Stack,
  Typography,
  IconButton,
  Divider,
  Avatar,
  Button,
  Tooltip,
  Checkbox,
  Drawer,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
} from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { fData } from 'src/utils/format-number';
import { fDateTime } from 'src/utils/format-time';
import { FileThumbnail, fileFormat } from 'src/components/file-thumbnail';
import { FileManagerShareDialog } from './file-manager-share-dialog';
import { _fmMembers } from './file-manager-mock-data';
import { toast } from 'src/components/snackbar';
import { useTranslation } from 'react-i18next';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useBoolean } from 'src/hooks/use-boolean';

export default function FileDetailsDrawer({
  file,
  open,
  onClose,
  onDelete,
  onUpdateShare,
  setMembers,
  setMode,
}) {
  const { t, i18n } = useTranslation('dashboard/files');
  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  console.log('this is the file', file);

  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedPersons, setSelectedPersons] = useState([]);
  const [openFullscreen, setOpenFullscreen] = useState(false);
  const confirm = useBoolean();
  const [openFile, setOpenFile] = useState([]);
  const [docError, setDocError] = useState('');

  const [permissionChecked, setPermissionChecked] = useState(() => {
    const initialPermissions = {};
    file?.members?.forEach((person) => {
      initialPermissions[person.id] = { share: false }; // Default to no "share" permission
    });

    return initialPermissions;
  });
  const [showMessage, setShowMessage] = useState(false); // To control message visibility

  // Toggle the "Share" permission
  const handlePermissionChange = (personId) => {
    setPermissionChecked((prev) => ({
      ...prev,
      [personId]: {
        ...prev[personId],
        share: !prev[personId]?.share, //
      },
    }));

    // Show the message when permission is granted
    setShowMessage(true);
    setTimeout(() => setShowMessage(false), 2000); // Hide message after 2 seconds
  };

  // ✅ Open share dialog and pre-fill already shared members
  const handleShareDialogOpen = () => {
    setSelectedPersons(file.members || []);
    setShareDialogOpen(true);
  };

  const handleShareDialogClose = () => {
    setShareDialogOpen(false);
  };

  const handleTogglePerson = (person) => {
    const exists = selectedPersons.some((p) => p.id === person.id);
    setSelectedPersons((prev) =>
      exists ? prev.filter((p) => p.id !== person.id) : [...prev, person]
    );
  };

  // ✅ Confirm and update shared members
  const handleShareConfirm = () => {
    const updatedFile = {
      ...file,
      members: selectedPersons,
    };

    onUpdateShare?.(updatedFile);
    setShareDialogOpen(false);
    toast.success(t('files.toast.shared_member'));
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    link.click();
  };

  const handleDelete = () => {
    onDelete(file.id);
    onClose();
  };

  // const toggleFullscreen = () => {
  //   setOpenFullscreen(!openFullscreen);
  // };
  const [isFullscreen, setIsFullscreen] = useState(false); // State to manage fullscreen mode

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen); // Toggle fullscreen mode
  };

  if (!file) return null;

  const handleOpenFile = async (fileUrl, fileName) => {
    try {
      const response = await fetch(fileUrl, { method: 'GET' });
      // if (!response.ok) {
      //   throw new Error(t('FileManagerFileDetails.errors.fetchFailed'));
      // }

      const fileBlob = await response.blob();
      const fileObjectUrl = URL.createObjectURL(fileBlob);
      const fileType = fileUrl.split('.').pop().toLowerCase();

      switch (fileType) {
        case 'jpg':
        case 'jpeg':
        case 'webp':
        case 'png':
        case 'webp':
          setOpenFile([{ uri: fileObjectUrl, fileType: 'image' }]);
          break;
        case 'pdf':
          setOpenFile([{ uri: fileObjectUrl, fileType: 'application/pdf' }]);
          break;
        case 'doc':
        case 'docx':
          const arrayBuffer = await fileBlob.arrayBuffer();
          mammoth
            .convertToHtml({ arrayBuffer: arrayBuffer })
            .then((result) => {
              const docxHtml = result.value;
              setOpenFile([{ uri: docxHtml, fileType: 'docx' }]);
            })
            .catch((err) => {
              setDocError(t('FileManagerFileDetails.errors.docxError'));
            });
          break;
        case 'xls':
        case 'xlsx':
          const arrayBufferExcel = await fileBlob.arrayBuffer();
          const workbook = XLSX.read(arrayBufferExcel, { type: 'array' });

          // Assuming you want to display the first sheet
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];

          // Convert the sheet to JSON format
          const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }); // Use header: 1 to get an array of rows

          // Display the sheet data in a table
          setOpenFile([{ uri: sheetData, fileType: 'excel' }]);
          break;
        case 'zip':
          // Handle ZIP files (prompt to download or show info)
          setDocError(t('FileManagerFileDetails.errors.unsupportedFormat'));
          break;
        case 'txt':
          // For text files, read and display content
          const text = await fileBlob.text();
          setOpenFile([{ uri: text, fileType: 'text' }]);
          break;
        case 'm4v':
        case 'mp4':
        case 'mp4v':
        case 'm4a':
        case 'wav':
        case 'mp3':
        case 'MOV':
        case 'mpeg':
        case 'mpg':
        case 'mpe':
        case 'mpa':
        case 'mpv2':
          setOpenFile([{ uri: fileObjectUrl, fileType: 'audio/video' }]);
          break;
        default:
          setDocError(t('FileManagerFileDetails.errors.unsupportedFormat'));
          break;
      }
    } catch (error) {
      setDocError(error.message);
    }
  };

  const renderExcelTable = (sheetData) => {
    return (
      <table border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {sheetData[0].map((header, idx) => (
              <th key={idx} style={{ padding: '5px', textAlign: 'left' }}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sheetData.slice(1).map((row, rowIdx) => (
            <tr key={rowIdx}>
              {row.map((cell, cellIdx) => (
                <td key={cellIdx} style={{ padding: '5px' }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  // if (docError) {
  //   return <Typography color="error">{docError}</Typography>;
  // }

  const handleDownloadFile = () => {
    // const link = document.createElement('a');
    // link.href = fileUrl;
    // link.setAttribute('download', 'file');
    // document.body.appendChild(link);
    // link.click();
    // link.remove();
    window.open(file?.url, '_blank');
  };
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 480, md: '40%', lg: '40%', xl: '40%' },
          p: 2,
        },
      }}
    >
      <Stack spacing={2}>
        {/* Header */}
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">{t('files.labels.fileinfo')}</Typography>
          <IconButton onClick={onClose}>
            <Iconify icon="mingcute:close-line" />
          </IconButton>
        </Stack>

        <FileThumbnail file={file} sx={{ width: 80, height: 80 }} />
        <Typography variant="subtitle2">
          {file?.path || t('files.labels.no_file_selected')}
        </Typography>

        {/* Actions */}
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 1 }}>
          {openFile.length > 0 && (
            <Dialog
              open={!!openFile.length}
              onClose={() => setOpenFile([])}
              fullScreen={isFullscreen}
              fullWidth
              maxWidth="md"
            >
              <DialogActions
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px',
                }}
              >
                <DialogTitle style={{ margin: 0, padding: 0 }}> {name}</DialogTitle>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <Button onClick={toggleFullscreen} variant="outlined">
                    {isFullscreen ? 'Exit' : 'Fullscreen'}
                  </Button>
                  <Button onClick={() => setOpenFile([])} variant="contained">
                    Close
                  </Button>
                </div>
              </DialogActions>

              <DialogContent style={{ width: '100%' }}>
                {openFile[0]?.fileType === 'application/pdf' ? (
                  <Worker
                    workerUrl={`https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`}
                  >
                    <Viewer fileUrl={openFile[0].uri} plugins={[defaultLayoutPluginInstance]} />
                  </Worker>
                ) : openFile[0]?.fileType === 'image' ? (
                  <img
                    src={openFile[0].uri}
                    alt="Preview"
                    style={{ maxWidth: '100%', height: 'auto' }}
                  />
                ) : openFile[0]?.fileType === 'docx' ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: openFile[0].uri }}
                    style={{ maxWidth: '100%', overflow: 'auto', height: '100%' }}
                  />
                ) : openFile[0]?.fileType === 'text' ? (
                  <pre>{openFile[0].uri}</pre>
                ) : openFile[0]?.fileType === 'excel' ? (
                  renderExcelTable(openFile[0].uri)
                ) : openFile[0]?.fileType === 'audio/video' ? (
                  <video controls style={{ maxWidth: '100%' }}>
                    <source src={openFile[0].uri} />
                    {t('FileManagerFileDetails.errors.noVideoSupport')}
                  </video>
                ) : (
                  <DocViewer
                    documents={openFile || []}
                    pluginRenderers={DocViewerRenderers}
                    style={{ width: '100%', height: '100%' }}
                  />
                )}
              </DialogContent>
            </Dialog>
          )}
        </Stack>

        <Divider sx={{ my: 2 }} />

        {/* Info */}
        <Typography variant="body2">
          <strong>{t('files.labels.size')}:</strong> {fData(file.size)}
        </Typography>
        <Typography variant="body2">
          <strong>{t('files.labels.modified')}:</strong> {fDateTime(file.lastModified)}
        </Typography>
        <Typography variant="body2">
          <strong>{t('files.labels.type')}:</strong> {fileFormat(file.url)}
        </Typography>

        <Divider />

        {/* Shared With */}
        {/* <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ width: '100%' }}
        >
          <Typography variant="subtitle2">{t('files.labels.shared_with')}</Typography>
          <Tooltip title={t('files.tooltip.add_update_members')}>
            <IconButton
              size="small"
              color="primary"
              onClick={() => {
                setMembers(true);
                setMode('share');
              }}
              sx={{
                width: 28,
                height: 28,
                mt: 1,
                ml: 2,
                bgcolor: '#006A67',
                color: 'primary.contrastText',
                '&:hover': { bgcolor: 'primary.dark' },
              }}
            >
              <Iconify icon="mingcute:add-line" />
            </IconButton>
          </Tooltip>
        </Stack> */}

        <Box sx={{ maxHeight: 200, overflowY: 'auto', mb: 2 }}>
          {file.members?.map((person) => (
            <Box key={person.id} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar src={person.photoPath} alt={person.firstName} sx={{ mr: 2 }} />
              <Typography variant="body2" sx={{ flex: 1 }}>
                {person.firstName} - {person.position}
              </Typography>

              {/* Only Show Share Permission */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={permissionChecked[person.id]?.share || false}
                      onChange={() => handlePermissionChange(person.id)} // Share permission checkbox
                    />
                  }
                  label={t('files.labels.share_permission')}
                />
              </Box>
            </Box>
          ))}
        </Box>

        {/* Show Message After Toggling Permission */}
        {showMessage && (
          <Typography variant="body2" color="success.main" sx={{ textAlign: 'center', mt: 2 }}>
            {t('files.toast.permission_success')}
          </Typography>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }} gap={1}>
          {/* <Button
            variant="contained"
            color="error"
            size="small"
            fullWidth
            onClick={() => {
              confirm.onTrue();
            }}
          >
            <Iconify icon="solar:trash-bin-trash-bold" sx={{ mr: 1 }} width={15} />

            {t('files.buttons.delete')}
          </Button> */}
          <Button
            variant="contained"
            sx={{ bgcolor: '#006A67' }}
            size="small"
            onClick={() => handleOpenFile(file?.url)}
          >
            {t('files.buttons.open')}
          </Button>
          <Button
            variant="outlined"
            sx={{ color: '#006A67' }}
            size="small"
            onClick={() => handleDownloadFile(file?.url)}
          >
            {t('files.buttons.download')}
          </Button>
        </Box>

        <FileManagerShareDialog
          open={shareDialogOpen}
          onClose={handleShareDialogClose}
          shared={_fmMembers}
          item={file}
          selectedPersons={selectedPersons}
          onTogglePerson={(person) => handleTogglePerson(person)}
          onConfirm={handleShareConfirm}
        />

        <ConfirmDialog
          open={confirm.value}
          onClose={confirm.onFalse}
          title={t('files.dialog.delete_title')}
          content={t('files.dialog.delete_content3')}
          action={
            <Button variant="contained" color="error" onClick={handleDelete}>
              {t('files.dialog.delete_title')}
            </Button>
          }
        />
      </Stack>

      {/* Fullscreen View */}
      <Dialog open={openFullscreen} fullScreen>
        <DialogActions>
          <Button onClick={toggleFullscreen} color="primary">
            {t('files.labels.exit_fullscreen')}
          </Button>
        </DialogActions>
        <DialogContent>
          <img
            src={file.url}
            alt={file.name}
            style={{
              width: '100%',
              height: 'auto',
              objectFit: 'contain',
              border: '4px solid #ddd',
              borderRadius: '8px',
            }}
          />
        </DialogContent>
      </Dialog>
    </Drawer>
  );
}

FileDetailsDrawer.propTypes = {
  file: PropTypes.object,
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onDelete: PropTypes.func,
  onUpdateShare: PropTypes.func,
};
