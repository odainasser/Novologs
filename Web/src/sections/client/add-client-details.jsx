'use client';
import { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import { Scrollbar } from 'src/components/scrollbar';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import Switch from '@mui/material/Switch';
import { PhoneInput } from 'src/components/phone-input/phone-input';
import FormControlLabel from '@mui/material/FormControlLabel';
import InputAdornment from '@mui/material/InputAdornment';
import { Iconify } from 'src/components/iconify';
import { useTranslation } from 'react-i18next';

import dynamic from 'next/dynamic';

// const ClientLeafletMap = dynamic(() => import('./ClientLeafletMap'), {
//   loading: () => <p>Loading map...</p>,
//   ssr: false,
// });
const ClientGoogleMap = dynamic(() => import('./ClientGoogleMap'), {
  loading: () => <p>Loading map...</p>,
  ssr: false,
});

// ----------------------------------------------------------------------

export function AddClientDetails({
  open,
  onClose,
  handleClose,
  mode,
  address,
  phoneNumber,
  website,
  setWebsite,
  setAddress,
  setPhoneNumber,
  addNewDetails,
  initialLocation,
  latitude,
  longitude,
  isClientView,

  ...other
}) {
  const { t, i18n } = useTranslation('dashboard/client');
  const storedLang = localStorage.getItem('selectedLang');
  const [selectedLocation, setSelectedLocation] = useState(initialLocation || { lat: 0, lng: 0 });

  useEffect(() => {
    setSelectedLocation(initialLocation || { lat: 25.2048, lng: 55.2708 });
  }, [initialLocation]);
  const handleCloseDialog = () => {
    handleClose();
  };

  const handleWebsiteChange = (event) => {
    setWebsite(event.target.value);
  };

  const handleAddressChange = (event) => {
    setAddress(event.target.value);
  };

  const handlePhoneNumberChange = useCallback(
    (val) => {
      setPhoneNumber(val ?? '');
    },
    [setPhoneNumber]
  );

  const handleMapLocationSelect = (location) => {
    console.log('Location selected on map:', location);
    setSelectedLocation(location);
  };
  const defaultCenter =
    latitude && longitude ? { lat: latitude, lng: longitude } : { lat: 25.2048, lng: 55.2708 };
  const handleAddDetail = () => {
    const detail = {
      address: address,
      phonenumber: phoneNumber,
      website: website,
      location: selectedLocation ? { lat: selectedLocation.lat, lng: selectedLocation.lng } : null,
    };
    console.log('Saving client details:', detail);
    addNewDetails(detail);
    handleCloseDialog();
  };

  return (
    <>
      <Dialog
        fullWidth
        maxWidth="sm"
        open={open}
        onClose={handleCloseDialog}
        dir={storedLang === 'ar' ? 'rtl' : 'ltr'}
        {...other}
      >
        <DialogTitle>
          {mode === 'add'
            ? isClientView
              ? t('clients.labels.add_client_details')
              : t('clients.labels.add_vendor_details')
            : isClientView
              ? t('clients.labels.edit_client_details')
              : t('clients.labels.edit_vendor_details')}
        </DialogTitle>

        <>
          <Box sx={{ px: 3, pb: 1 }}>
            <Box display="flex" gap={2} sx={{ mb: 2 }}>
              <TextField
                placeholder={t('clients.columns.website')}
                variant="outlined"
                size="small"
                fullWidth
                value={website || ''}
                onChange={handleWebsiteChange}
              />
            </Box>
            <Box display="flex" gap={2} sx={{ mb: 2 }}>
              <TextField
                placeholder={t('clients.placeholder.enter_address')}
                variant="outlined"
                size="small"
                fullWidth
                multiline
                rows={2}
                value={address || ''}
                onChange={handleAddressChange}
              />
            </Box>
            <Box
              sx={{
                mb: 2,
                ...(storedLang === 'ar' && {
                  '& .MuiFormLabel-root': {
                    right: 30,
                    left: 'auto',
                    transformOrigin: 'top right',
                  },
                  '& .MuiInputBase-input': {
                    paddingRight: '50px',
                    direction: 'rtl',
                  },
                  '& .MuiButtonBase-root': {
                    marginRight: '12px',
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    textAlign: 'right',
                  },
                }),
              }}
            >
              {' '}
              <PhoneInput
                label={t('clients.columns.phone_no')}
                fullWidth
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
              />
            </Box>

            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              {t('clients.columns.select_location')}
            </Typography>
            {selectedLocation ? (
              <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                Latitude: {selectedLocation.lat.toFixed(6)} | Longitude:{' '}
                {selectedLocation.lng.toFixed(6)}
              </Typography>
            ) : (
              <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                Latitude: {defaultCenter.lat.toFixed(6)} | Longitude: {defaultCenter.lng.toFixed(6)}
              </Typography>
            )}
            <Box
              sx={{
                height: 300,
                width: '100%',
                mt: 1,
                borderRadius: 1,
                overflow: 'hidden',
                border: (theme) => `1px solid ${theme.palette.divider}`,
              }}
            >
              {/* <ClientLeafletMap
                position={selectedLocation}
                onLocationSelect={handleMapLocationSelect}
              /> */}
              <ClientGoogleMap
                position={selectedLocation}
                onLocationSelect={handleMapLocationSelect}
                latitude={latitude}
                longitude={longitude}
                defaultCenter={defaultCenter}
              />
            </Box>
          </Box>
        </>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            variant="outlined"
            onClick={handleCloseDialog}
            sx={{
              ...(storedLang === 'ar' && { ml: 1 }),
            }}
          >
            {t('clients.buttons.cancel')}
          </Button>
          <Button variant="contained" onClick={handleAddDetail}>
            {mode === 'add' ? t('clients.buttons.add') : t('clients.buttons.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
