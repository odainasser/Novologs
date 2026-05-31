import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';

import Typography from '@mui/material/Typography';
import { Scrollbar } from 'src/components/scrollbar';

import Checkbox from '@mui/material/Checkbox';
import { useTranslation } from 'react-i18next';

// ----------------------------------------------------------------------

export function EditPermission({
  open,
  shared = [],
  selectedLevel,
  onClose,
  onToggleLevel,
  ...other
}) {
  const { t } = useTranslation('dashboard/teams');

  const handleClose = () => {
    onClose();
  };

  return (
    <>
      <Dialog fullWidth maxWidth="xs" open={open} onClose={handleClose} {...other}>
        <DialogTitle sx={{ p: 2, pb: 0 }}>{t("hierarchy.edit_permission_level")}</DialogTitle>

        {shared.length > 0 ? (
          <Box
            component="ul"
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              listStyle: 'none',
              p: 0,
              m: 0,
            }}
          >
            {shared.map((level) => (
              <SelectLevel
                key={level?.id}
                level={level}
                isSelected={selectedLevel?.id === level?.id}
                onToggleLevel={() => onToggleLevel(level)}
              />
            ))}
          </Box>
        ) : (
          <Box sx={{ px: 3, py: 2 }}>
            <Typography variant="body2" color="textSecondary">
            {t("hierarchy.no_levels_found")}
            </Typography>
          </Box>
        )}
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button variant="contained" onClick={handleClose}>
          {t("hierarchy.edit")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export function SelectLevel({ level, isSelected, onToggleLevel }) {
  return (
    <Box
      component="li"
      sx={{
        display: 'flex',
        alignItems: 'center',
        py: 1,
        px: 2,
        justifyContent: 'center',
      }}
    >
      <Typography variant="caption">{level?.value}</Typography>
      <Checkbox
        checked={isSelected}
        onChange={onToggleLevel}
        sx={{
          '&.Mui-checked': {
            color: '#006A67',
          },
        }}
      />
    </Box>
  );
}
