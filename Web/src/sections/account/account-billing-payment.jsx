import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import CardHeader from '@mui/material/CardHeader';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';

import { PaymentCardItem } from '../payment/payment-card-item';
import { PaymentNewCardForm } from '../payment/payment-new-card-form';
import { useTranslation } from 'react-i18next';


// ----------------------------------------------------------------------

export function AccountBillingPayment({ cards, sx, ...other }) {
  const { t } = useTranslation('dashboard/accounts');
  const openForm = useBoolean();

  return (
    <>
      <Card sx={{ my: 3, ...sx }} {...other}>
        <CardHeader
          title={t('accounts.payment_method')}
          action={
            <Button
              size="small"
              color="primary"
              startIcon={<Iconify icon="mingcute:add-line" />}
              onClick={openForm.onTrue}
            >
              {t('accounts.newcard')}
            </Button>
          }
        />

        <Box
          rowGap={2.5}
          columnGap={2}
          display="grid"
          gridTemplateColumns={{ xs: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' }}
          sx={{ p: 3 }}
        >
          {cards.map((card) => (
            <PaymentCardItem key={card.id} card={card} />
          ))}
        </Box>
      </Card>

      <Dialog fullWidth maxWidth="xs" open={openForm.value} onClose={openForm.onFalse}>
        <DialogTitle> {t('accounts.add_new_card')} </DialogTitle>

        <DialogContent sx={{ overflow: 'unset' }}>
          <PaymentNewCardForm />
        </DialogContent>

        <DialogActions>
          <Button color="inherit" variant="outlined" onClick={openForm.onFalse}>
            {t('accounts.cancel')}
          </Button>

          <Button color="inherit" variant="contained" onClick={openForm.onFalse}>
            {t('accounts.add')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
