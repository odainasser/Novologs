import { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Checkbox, Stack, Avatar, TextField, Typography
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';



export function FileManagerShareDialog({
  open,
  onClose,
  shared = [],
  item,
  selectedPersons = [],
  onTogglePerson,
  onConfirm,
}) {
  const {t,i18n} = useTranslation('dashboard/files');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMembers = shared.filter((member) =>
    member.firstName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const handleClose = () => {
    setSearchTerm('');
    onClose();
  };
  

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>{t('files.dialog.share_file')}</DialogTitle>

      <DialogContent dividers sx={{ px: 3, py: 2 }}>
        <TextField
          fullWidth
          placeholder={t('files.placeholder.search')}
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            mb: 2,
            '& .MuiInputBase-root': {
              height: 44,
            },
          }}
        />

        <Stack spacing={2}>
          {filteredMembers.map((person) => (
            <Stack key={person.id} direction="row" alignItems="center" spacing={2}>
              <Avatar src={person.photoPath} alt={person.firstName} />
              <Stack flex={1}>
                <Typography variant="subtitle2">{person.firstName}</Typography>
                <Typography variant="body2" color="text.secondary">Information Technology</Typography>
              </Stack>
              <Checkbox
                checked={selectedPersons.some((p) => p.id === person.id)}
                onChange={() => onTogglePerson(person)}
              />
            </Stack>
          ))}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
  <Box sx={{ flexGrow: 1 }}>
  <Button variant="outlined" color="inherit" onClick={handleClose}>
  {t('files.buttons.close')}
    </Button>
    </Box>

  <Button variant="contained" onClick={onConfirm}>
  {t('files.buttons.share')}
  </Button>
 
</DialogActions>


    </Dialog>
  );
}
