import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import MenuItem from '@mui/material/MenuItem';

import Typography from '@mui/material/Typography';
import { Scrollbar } from 'src/components/scrollbar';

import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import Card from '@mui/material/Card';
import { Divider } from '@mui/material';
import { useMockedUser } from 'src/auth/hooks';
import Switch from '@mui/material/Switch';
import { changeLeadStatus } from 'src/actions/client/clientActions';
import { toast } from 'src/components/snackbar';
import { useBoolean } from 'src/hooks/use-boolean';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useTranslation } from 'react-i18next';

// ----------------------------------------------------------------------

export function AddAwardAmount({
  open,
  onClose,
  handleClose,
  mode,
  awardAmount,
  setAwardAmount,
  currency,
  leadId,
  mutateLead,
  currencyList,
  filters,
  ...other
}) {
  const { t } = useTranslation('dashboard/client');
  const confirmAwardAmount = useBoolean();
  const storedLang = localStorage.getItem('selectedLang');

  const [awardAmountError, setAwardAmountError] = useState(false);

  const [newCurrency, setNewCurrency] = useState(currencyList?.currency?.[0]?.id || '');
  useEffect(() => {
    if (currencyList?.currency?.length && !newCurrency) {
      setNewCurrency(currencyList.currency[0].id);
    }
  }, [currencyList]);

  const handleCloseMemberDialog = () => {
    setAwardAmount('');
    setAwardAmountError(false);
    handleClose();
  };

  const handleAddAmount = async () => {
    setAwardAmountError(false);

    if (!awardAmount) {
      if (!awardAmount) setAwardAmountError(true);
      return;
    }

    const payload = {
      awardedValue: parseFloat(awardAmount),
      leadStatus: 1,
      id: leadId,
      awardedDate: new Date().toISOString(),
      awardedCurrencyId: newCurrency,
    };

    try {
      const response = await changeLeadStatus(payload);
      if (response.success) {
        await mutateLead();
        toast.success(t('leaddetails.toast.lead_awarded'));
        // filters.setState({ type: 1 });

        handleCloseMemberDialog();
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      console.error('update failed:', error);
    }
  };

  const handleAmountChange = (event) => {
    setAwardAmount(event.target.value);
    if (awardAmountError && event.target.value) {
      setAwardAmountError(false);
    }
  };

  return (
    <>
      <Dialog
        fullWidth
        maxWidth={mode === 'add' ? 'xs' : 'md'}
        open={open}
        onClose={handleCloseMemberDialog}
        dir={storedLang === 'ar' ? 'rtl' : 'ltr'}
        {...other}
      >
        <DialogTitle> {mode === 'add' ? `${t('clients.buttons.add_amount')} (${currency})` : ''}</DialogTitle>
        {mode === 'add' && (
          <>
            <Box display="flex" gap={1} sx={{ px: 3 }} flexDirection="column">
              <Box display="flex" justifyContent="space-between" alignItems="center" gap={1}>
                <TextField
                  select
                  fullWidth
                  label={t("leaddetails.form.currencyLabel")}
                  value={newCurrency}
                  onChange={(e) => setNewCurrency(e.target.value)}
                  autoFocus
                  sx={{
                    width: { xs: 100, sm: 110, md: 110, xl: 92 },

                    '& .MuiInputBase-input': {
                      padding: '9px 14px',
                    },
                    '& .MuiInputLabel-root': {
                      top: '-5px',
                      fontSize: '10px',
                    },
                    '& .MuiSelect-icon': {
                      top: 'calc(50% - 9px)',
                      right: '10px',
                    },
                  }}
                >
                  {currencyList?.currency.map((currency) => (
                    <MenuItem key={currency.id} value={currency.id}>
                      {currency.symbol}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  fullWidth
                  type="number"
                  value={awardAmount}
                  onChange={handleAmountChange}
                  placeholder={t('leaddetails.common.enter_amount')}
                  variant="outlined"
                  size="small"
                  error={awardAmountError}
                  helperText={awardAmountError ? t('leaddetails.errors.amount_required') : ''}
                  inputProps={{
                    inputMode: 'numeric',
                    pattern: '[0-9]*',
                    onKeyDown: (e) => {
                      if (['e', 'E', '+', '-'].includes(e.key)) {
                        e.preventDefault();
                      }
                    },
                  }}
                />
              </Box>
            </Box>
          </>
        )}

        <DialogActions>
          <Button
            variant="contained"
            onClick={handleCloseMemberDialog}
            sx={{
              ...(storedLang === 'ar' && { ml: 1 }),
            }}
          >
            {t('clients.buttons.cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              confirmAwardAmount.onTrue();
            }}
            sx={{ bgcolor: mode === 'add' ? '#006A67' : '' }}
          >
            {mode === 'add' ? t('clients.buttons.add') : t('clients.buttons.close')}
          </Button>
        </DialogActions>
        <ConfirmDialog
          open={confirmAwardAmount.value}
          onClose={confirmAwardAmount.onFalse}
          title={t('leaddetails.common.award_amount')}
          content={t('leaddetails.toast.are_you_sure_lead')}
          PaperProps={{
            sx: {
              boxShadow: 'none',
              border: '1px solid #ccc',
              borderRadius: 2,
            },
          }}
          action={
            <Button
              variant="contained"
              color="success"
              onClick={handleAddAmount}
              sx={{
                ...(storedLang === 'ar' && { ml: 1 }),
                bgcolor: '#006A67',
                '&:hover': {
                  bgcolor: '#006A67',
                },
              }}
            >
              {t('leaddetails.buttons.award')}
            </Button>
          }
          sx={{
            direction: storedLang === 'ar' ? 'rtl' : 'ltr',
          }}
        />
      </Dialog>
    </>
  );
}
