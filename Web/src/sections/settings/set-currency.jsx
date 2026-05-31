'use client';
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import ReactCountryFlag from 'react-country-flag';
import { getCurrencies, addCurrency } from 'src/actions/settings/settingActions';
import { Iconify } from 'src/components/iconify';
import { AddCurrency } from './add-currency';
import { toast } from 'src/components/snackbar';
import { useTranslation } from 'react-i18next';
import Tooltip from '@mui/material/Tooltip';
import { useBoolean } from 'src/hooks/use-boolean';

import { CURRENCIES } from 'src/assets/data/currencies';
import {
  addSetting,
  getSettings,
  deleteSetting,
  updateSetting,
} from 'src/actions/settings/settingActions';
import LinearProgress from '@mui/material/LinearProgress';
import { ErrorView } from 'src/sections/error/error-view';
import { ConfirmDialog } from 'src/components/custom-dialog';

export function SetCurrency() {
  const {
    settingsList,
    settingsListLoading,
    settingsListError,
    settingsListValidating,
    settingsListEmpty,
    mutate: mutateSettings,
  } = getSettings();

  const {
    currencyList,
    currencyListLoading,
    currencyListError,
    currencyListValidating,
    currencyListEmpty,
    mutate,
  } = getCurrencies();

  const [selectedCurrency, setSelectedCurrency] = useState('');
  const [defaultCurrencySymbol, setDefaultCurrencySymbol] = useState('');
  const handleCurrencyChange = (event) => {
    setSelectedCurrency(event.target.value);
  };
  const { t, i18n } = useTranslation('dashboard/projects');
  const storedLang = localStorage.getItem('selectedLang');

  const [settingsId, setSettingsId] = useState('');
  const confirmCurrency = useBoolean();

  useEffect(() => {
    if (settingsList?.settings) {
      const defaultCurrencySetting = settingsList.settings.find(
        (setting) => setting.key === 'defaultCurrency'
      );
      console.log('this is the defaultCurrencySetting', defaultCurrencySetting);
      if (defaultCurrencySetting) {
        setDefaultCurrencySymbol(defaultCurrencySetting.value);
        setSettingsId(defaultCurrencySetting.id);
      }
    }
  }, [settingsList]);

  const handleSetAsDefault = async (currencySymbol) => {
    const payload = {
      key: 'defaultCurrency',
      value: currencySymbol,
    };
    if (settingsId) {
      payload.isActive = true;
    }
    let response;
    if (settingsId) {
      response = await updateSetting(payload);
    } else {
      response = await addSetting(payload);
    }
    try {
      if (response.success) {
        toast.success(`${t('settings.default_currency')} ${currencySymbol}`);
        confirmCurrency.onFalse();
        await mutateSettings();
        setDefaultCurrencySymbol(currencySymbol);
        setSelectedCurrency(currencySymbol);
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      console.error('Add currency failed:', error);
    }
  };
  const [openCurrency, setOpenCurrency] = useState(false);

  const handleCurrencyDialogClose = () => {
    setTimeout(() => {
      setOpenCurrency(false);
    }, 100);
  };
  const [selectedCurrencyToAdd, setSelectedCurrencyToAdd] = useState([]);
  const handleToggleCurrency = (currency) => {
    setSelectedCurrencyToAdd([currency]);
  };
  const handleAddCurrency = async () => {
    console.log('this is the currency', selectedCurrencyToAdd);
    const payload = {
      name: {
        value: selectedCurrencyToAdd[0]?.name,
      },
      symbol: selectedCurrencyToAdd[0]?.code,
    };
    try {
      const response = await addCurrency(payload);
      if (response.success) {
        await mutate();
        toast.success(t('settings.toast_currency_success'));
        handleCurrencyDialogClose();
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      console.error('Add Currency failed:', error);
    }
  };
  const availableCurrencySymbols = currencyList?.currency?.map((c) => c.symbol) || [];
  const currenciesNotInList = CURRENCIES.filter(
    (currency) => !availableCurrencySymbols.includes(currency.code)
  );
  if (settingsListLoading)
    return (
      <div>
        <LinearProgress
          sx={{
            '& .MuiLinearProgress-bar': {
              backgroundColor: '#2FBBA8',
            },
            backgroundColor: 'rgba(47, 187, 168, 0.2)', // Lighter version of #2FBBA8 for the background
          }}
        />
      </div>
    );
  if (settingsListError) {
    return <ErrorView errorCode={settingsListError} />;
  }
  return (
    <Box sx={{ p: 2 }}>
      <Box display="flex" justifyContent="end" sx={{ mb: 1 }}>
        <Button
          startIcon={
            <Iconify
              icon="mingcute:add-line"
              sx={{
                ...(storedLang === 'ar' && { ml: 1 }),
              }}
            />
          }
          sx={{ ml: 1 }}
          variant="contained"
          onClick={() => {
            setOpenCurrency(true);
          }}
        >
          {t('settings.add_currency')}
        </Button>
      </Box>
      <FormControl component="fieldset" sx={{ width: '100%' }}>
        <RadioGroup
          aria-label={t('settings.currency')}
          name="currency-selection"
          value={selectedCurrency}
          onChange={handleCurrencyChange}
        >
          <Grid container spacing={2}>
            {currencyList?.currency.map((currency) => {
              const staticCurrencyInfo = CURRENCIES.find((c) => c.code === currency.symbol);
              const flagCountryCode = staticCurrencyInfo ? staticCurrencyInfo.flag : '';
              const nameCountryCode = staticCurrencyInfo ? staticCurrencyInfo.name : '';

              return (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  lg={3}
                  xl={2}
                  key={currency.symbol}
                  sx={{ display: 'flex' }}
                >
                  <FormControlLabel
                    value={currency.symbol}
                    control={<Radio />}
                    label={
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          width: '100%',
                          height: '100%',
                          py: 1,
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor:
                            currency.symbol === defaultCurrencySymbol ? 'primary.main' : 'divider',

                          transition: 'all 0.3s',
                          '&:hover': {
                            bgcolor: 'action.hover',
                          },
                          bgcolor:
                            currency.symbol === defaultCurrencySymbol ? 'background.paper' : 'grey.200',
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setSelectedCurrency(currency.symbol);
                          confirmCurrency.onTrue();
                        }}
                      >
                        <Box
                          sx={{
                            width: 25,
                            height: 25,
                            borderRadius: '50%',
                            bgcolor: (theme) => alpha(theme.palette.grey[200], 0.8),
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            mx: 1,
                          }}
                        >
                          <ReactCountryFlag
                            countryCode={flagCountryCode}
                            svg
                            style={{
                              width: '24px',
                              height: '24px',
                              objectFit: 'contain',
                            }}
                          />
                        </Box>
                        <Box sx={{ flexGrow: 1, overflow: 'hidden', width: '140px' }}>
                          <Typography variant="subtitle1" noWrap>
                            {nameCountryCode || currency.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {currency.symbol}
                          </Typography>
                        </Box>
                        <Tooltip title={t('settings.set_default')} arrow>
                          <IconButton
                            size="small"
                            aria-label={`Set ${nameCountryCode || currency.name} as default`}
                            sx={{ ml: 'auto', mr: 0.5 }}
                          >
                            <Iconify
                              color={currency.symbol === defaultCurrencySymbol ? '#006A67' : ''}
                              icon={
                                currency.symbol === defaultCurrencySymbol
                                  ? 'mdi:star'
                                  : 'mdi:star-outline'
                              }
                              width={currency.symbol === defaultCurrencySymbol ? '20px' : '18px'}
                            />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    }
                    sx={{
                      margin: 0,
                      width: '100%',
                      '& .MuiRadio-root': { display: 'none' },
                    }}
                  />
                </Grid>
              );
            })}
          </Grid>
        </RadioGroup>
      </FormControl>

      <AddCurrency
        open={openCurrency}
        shared={currenciesNotInList}
        onClose={handleCurrencyDialogClose}
        onToggleCurrency={handleToggleCurrency}
        onAddCurrency={handleAddCurrency}
        selectedCurrencyToAdd={selectedCurrencyToAdd}
      />
      <ConfirmDialog
        open={confirmCurrency.value}
        onClose={confirmCurrency.onFalse}
        title={t('settings.set_default_currency')}
        content={t('settings.content_currency')}
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
            onClick={() => {
              handleSetAsDefault(selectedCurrency);
            }}
            sx={{
              ...(storedLang === 'ar' && { ml: 1 }),
              bgcolor: '#006A67',
              '&:hover': {
                bgcolor: '#006A67',
              },
            }}
          >
            {t('settings.yes')}
          </Button>
        }
        sx={{
          direction: storedLang === 'ar' ? 'rtl' : 'ltr',
        }}
      />
    </Box>
  );
}
