import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import InputAdornment from '@mui/material/InputAdornment';
import { useTranslation } from 'react-i18next';

import { Iconify } from 'src/components/iconify';
import Typography from '@mui/material/Typography';
import { Scrollbar } from 'src/components/scrollbar';

import { toast } from 'src/components/snackbar';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import ReactCountryFlag from 'react-country-flag';

// ----------------------------------------------------------------------

export function AddCurrency({
  open,
  shared = [],
  onClose,
  selectedCurrencyToAdd,
  onToggleCurrency,
  onAddCurrency,
  ...other
}) {
  const { t, i18 } = useTranslation('dashboard/projects');
  const storedLang = localStorage.getItem('selectedLang');

  const [searchQuery, setSearchQuery] = useState('');

  const filteredShared = shared.filter((currency) =>
    currency.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectCurrency = (currency) => {
    onToggleCurrency(currency);
  };

  const handleClose = () => {
    setSearchQuery('');
    onClose();
  };

  return (
    <>
      <Dialog
        fullWidth
        maxWidth="xs"
        open={open}
        onClose={handleClose}
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
        <DialogTitle>{t('settings.add_currency')}</DialogTitle>

        <Box sx={{ px: 3 }}>
          <TextField
            fullWidth
            placeholder={t('projects.project_settings.tabs.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              mb: 1,
              '& .MuiInputBase-input': {
                padding: '10px 14px',
              },
              '& .MuiInputLabel-root': {
                top: '-7px',
              },
            }}
          />
        </Box>

        {filteredShared.length > 0 ? (
          <Scrollbar sx={{ height: 60 * 5, px: 3 }}>
            <Box component="ul">
              {filteredShared.map((currency) => (
                <SelectCurrency
                  key={currency.code}
                  currency={currency}
                  isSelected={selectedCurrencyToAdd?.[0]?.code === currency.code}
                  onToggleCurrency={() => handleSelectCurrency(currency)}
                />
              ))}
            </Box>
          </Scrollbar>
        ) : (
          <Box sx={{ px: 3, py: 2 }}>
            <Typography variant="body2" color="textSecondary">
              {t('settings.no_currencies')}
            </Typography>
          </Box>
        )}

        <DialogActions>
          <Button
            variant="contained"
            onClick={handleClose}
            sx={{
              ...(storedLang === 'ar' && { ml: 1 }),
            }}
          >
            {t('settings.cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              onAddCurrency();
              setSearchQuery('');
            }}
            disabled={selectedCurrencyToAdd?.length === 0}
            sx={{ bgcolor: '#006A67' }}
          >
            {t('settings.add')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export function SelectCurrency({ currency, isSelected, onToggleCurrency }) {
  return (
    <Box component="li" sx={{ display: 'flex', alignItems: 'center', py: 1 }}>
      <ReactCountryFlag
        countryCode={currency?.flag}
        svg
        style={{
          width: '24px',
          height: '24px',
          objectFit: 'contain',
        }}
      />

      <ListItemText
        secondary={<span>{`${currency?.name} (${currency?.code})`}</span>}
        primaryTypographyProps={{ noWrap: true, typography: 'subtitle2' }}
        secondaryTypographyProps={{
          noWrap: true,
          component: 'span',
          sx: { color: currency?.color },
        }}
        sx={{ flexGrow: 1, pr: 1, ml: 1 }}
      />

      <Checkbox checked={isSelected} onChange={onToggleCurrency} />
    </Box>
  );
}
