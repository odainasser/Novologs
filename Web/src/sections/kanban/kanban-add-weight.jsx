import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';

import Typography from '@mui/material/Typography';
import { Scrollbar } from 'src/components/scrollbar';

import { toast } from 'src/components/snackbar';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import { useTranslation } from 'react-i18next';

// ----------------------------------------------------------------------

export function KanbanAddWeight({
  open,
  shared = [],
  selectedWeight,
  onClose,
  onToggleWeight,
  ...other
}) {
  const {t,i18n}=useTranslation("dashboard/tasks");
  console.log('this is the shared', shared);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredShared = shared.filter((weight) =>
    weight.value.toString().toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleClose = () => {
    setSearchQuery('');
    // onToggleWeight([]);
    onClose();
  };

  return (
    <>
      <Dialog fullWidth maxWidth="lg" open={open} onClose={handleClose} {...other}>
        <DialogTitle> {t("tasks.weight_dialog.title")}</DialogTitle>

        <Box sx={{ px: 3 }}>
          <TextField
            fullWidth
            placeholder={t("tasks.weight_dialog.search")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ mb: 2 }}
          />
        </Box>

        {filteredShared.length > 0 ? (
          <Scrollbar sx={{ height: 60 * 5, px: 3 }}>
            <Box
              component="ul"
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(10, 1fr)',
                listStyle: 'none',
                p: 0,
                m: 0,
              }}
            >
              {filteredShared.map((weight) => (
                <SelectWeight
                  key={weight?.id}
                  weight={weight}
                  isSelected={selectedWeight?.id === weight?.id}
                  onToggleWeight={() => onToggleWeight(weight)}
                />
              ))}
            </Box>
          </Scrollbar>
        ) : (
          <Box sx={{ px: 3, py: 2 }}>
            <Typography variant="body2" color="textSecondary">
            {t("tasks.weight_dialog.no_weights")}
            </Typography>
          </Box>
        )}
        <DialogActions>
          <Button variant="contained" onClick={handleClose}>
          {t("tasks.weight_dialog.close")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export function SelectWeight({ weight, isSelected, onToggleWeight }) {
  return (
    <Box
      component="li"
      sx={{
        display: 'flex',
        alignItems: 'center',
        py: 1,
        justifyContent: 'space-between',
        px: 2,
      }}
    >
      {/* <ListItemText
        secondary={

            <span style={{ fontSize: '0.875rem' }}>{weight?.value}</span>

        }
        primaryTypographyProps={{ noWrap: true, typography: 'subtitle2' }}
      /> */}
      <Typography variant="caption">{weight?.value}</Typography>
      <Checkbox checked={isSelected} onChange={onToggleWeight} />
    </Box>
  );
}
