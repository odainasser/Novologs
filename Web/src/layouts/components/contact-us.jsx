'use client';

import { useState, useCallback } from 'react';

import IconButton from '@mui/material/IconButton';

import { varHover } from 'src/components/animate';

import { Iconify } from 'src/components/iconify';
import { Dialog, Tooltip } from '@mui/material';
import { useAuthContext } from 'src/auth/hooks';
import { ContactUsDetails } from './contact-us-details';

// ----------------------------------------------------------------------

export function ContactUs({ sx, ...other }) {
  const { zetaUser } = useAuthContext();
  const storedLang = localStorage.getItem('selectedLang');

  const [contactDialogOpen, setContactDialogOpen] = useState(false);

  const handleOpenContactDialog = useCallback(() => {
    setContactDialogOpen(true);
  });

  const handleCloseContactDialog = useCallback(() => {
    setContactDialogOpen(false);
  });

  return (
    <>
      <Tooltip title="Contact us" arrow>
        <a href="mailto:help@novologs.com">
          <IconButton
            whileTap="tap"
            whileHover="hover"
            variants={varHover(1.05)}
            sx={{
              color: 'white',
              ...sx,
            }}
            {...other}
          >
            <Iconify icon="fluent:mail-24-filled" />
          </IconButton>
        </a>
      </Tooltip>

      <Dialog
        open={contactDialogOpen}
        onClose={handleCloseContactDialog}
        fullWidth
        maxWidth="sm"
        dir={storedLang === 'ar' ? 'rtl' : 'ltr'}
      >
        <ContactUsDetails handleCloseContactDialog={handleCloseContactDialog} zetaUser={zetaUser} />
      </Dialog>
    </>
  );
}
