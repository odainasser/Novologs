'use client';

import { m } from 'framer-motion';

import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { RouterLink } from 'src/routes/components';

import { SimpleLayout } from 'src/layouts/simple';
import { ForbiddenIllustration } from 'src/assets/illustrations';

import { varBounce, MotionContainer } from 'src/components/animate';
import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';

// ----------------------------------------------------------------------

export function ErrorView({ errorCode }) {
  const { t } = useTranslation('dashboard/tasks');
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        mt: 2,
      }}
    >
      <m.div variants={varBounce().in}>
        {/* <Typography variant="h3" sx={{ mb: 2 }}>
        {t('tasks.errors.no_permission')}
        </Typography> */}
      </m.div>

      <m.div variants={varBounce().in}>
        <Typography sx={{ color: 'error.main' }}>{errorCode}</Typography>
      </m.div>

      <m.div variants={varBounce().in}>
        <ForbiddenIllustration sx={{ my: { xs: 5, sm: 10 } }} />
      </m.div>
    </Box>
  );
}
