import { useState } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import ListItemText from '@mui/material/ListItemText';
import DialogContent from '@mui/material/DialogContent';
import LinearProgress from '@mui/material/LinearProgress';

import { fData } from 'src/utils/format-number';
import { varAlpha } from 'src/theme/styles';
import { FileThumbnail } from 'src/components/file-thumbnail';

import { getRepository } from 'src/actions/file/fileActions';
import { EmptyContent } from 'src/components/empty-content';

// ----------------------------------------------------------------------

export function RepositoryFileDialog({ open, onClose, onSelect }) {
  const [selectedFiles, setSelectedFiles] = useState([]);

  const { allFilesAndFolders, allFilesAndFoldersLoading } = getRepository(open);

  const repositoryUserFiles = allFilesAndFolders?.systemGenerated?.users || [];
  console.log('this is the repositoryUserFiles', repositoryUserFiles);

  const handleToggleFile = (file) => {
    if (!file?.isFile) return;

    setSelectedFiles((prev) => {
      const exists = prev.some((item) => item.id === file.id);

      if (exists) {
        return prev.filter((item) => item.id !== file.id);
      }

      return [...prev, file];
    });
  };

  const handleClose = () => {
    setSelectedFiles([]);
    onClose();
  };

  const handleSelect = () => {
    onSelect(selectedFiles);
    setSelectedFiles([]);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Choose from Repository</DialogTitle>

      <DialogContent>
        {allFilesAndFoldersLoading ? (
          <LinearProgress />
        ) : repositoryUserFiles.filter((item) => item.isFile).length ? (
          <Stack spacing={1}>
            {repositoryUserFiles
              .filter((item) => item.isFile)
              .map((file) => {
                const checked = selectedFiles.some((item) => item.id === file.id);

                return (
                  <Box
                    key={file.id}
                    onClick={() => handleToggleFile(file)}
                    sx={{
                      py: 1,
                      px: 1.5,
                      gap: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      borderRadius: 1,
                      cursor: 'pointer',
                      border: (theme) =>
                        `solid 1px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.16)}`,
                      bgcolor: checked ? 'rgba(0,106,103,0.08)' : 'transparent',
                    }}
                  >
                    <Checkbox checked={checked} />

                    <FileThumbnail file={file} />

                    <ListItemText
                      primary={file.name}
                      secondary={fData(file.size || 0)}
                      secondaryTypographyProps={{
                        component: 'span',
                        typography: 'caption',
                      }}
                    />
                  </Box>
                );
              })}
          </Stack>
        ) : (
          <EmptyContent
            filled
            sx={{ py: 10 }}
            title="No files available."
            description="No files found in repository."
          />
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>

        <Button
          variant="contained"
          onClick={handleSelect}
          disabled={!selectedFiles.length}
          sx={{ bgcolor: '#006A67' }}
        >
          Select
        </Button>
      </DialogActions>
    </Dialog>
  );
}
