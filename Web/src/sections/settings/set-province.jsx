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
import Typography from '@mui/material/Typography';
import { Iconify } from 'src/components/iconify';
import { AddProvince } from './add-province';
import { toast } from 'src/components/snackbar';
import { useTranslation } from 'react-i18next';
import Tooltip from '@mui/material/Tooltip';
import { countries } from 'src/assets/data/countries';
import * as regionData from 'country-region-data';
import {
  addSetting,
  getSettings,
  deleteSetting,
  updateSetting,
} from 'src/actions/settings/settingActions';
import { Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import Button from '@mui/material/Button';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useBoolean } from 'src/hooks/use-boolean';
import { ConfirmDialog } from 'src/components/custom-dialog';

export function SetProvince() {
  const { t, i18n } = useTranslation('dashboard/projects');
  const storedLang = localStorage.getItem('selectedLang');
  const [selectedButton, setSelectedButton] = useState('addedProvince');

  const {
    settingsList,
    settingsListLoading,
    settingsListError,
    settingsListValidating,
    settingsListEmpty,
    mutate,
  } = getSettings();
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCountryName, setSelectedCountryName] = useState('');

  const handleCountryChange = (event) => {
    setSelectedCountry(event.target.value);
  };
  const [regions, setRegions] = useState([]);
  const confirmProvince = useBoolean();
  const [selectedProvince, setSelectedProvince] = useState('');
  const [settingsId, setSettingsId] = useState('');
  const [defaultProvince, setDefaultProvince] = useState('');

  console.log('this is the settingsList', settingsList?.settings);
  useEffect(() => {
    if (settingsList?.settings) {
      const defaultProvinceSetting = settingsList.settings.find(
        (setting) => setting.key === 'defaultProvince'
      );
      console.log('this is the defaultProvinceSetting', defaultProvinceSetting);
      if (defaultProvinceSetting) {
        setDefaultProvince(defaultProvinceSetting.value);
        setSettingsId(defaultProvinceSetting.id);
      }
    }
  }, [settingsList]);

  console.log('this is the default province', defaultProvince);

  const provinceSettings = settingsList?.settings?.filter((setting) =>
    setting.key.startsWith('province')
  );

  const countryProvinces = settingsList?.settings?.filter((setting) =>
    setting.key.endsWith(`${selectedCountry}`)
  );

  const countryWithRegions = provinceSettings.map((setting) => {
    const countryCode = setting.key.replace('province', '');
    const country = countries.find((c) => c.code === countryCode);
    const regions = [];

    try {
      regions.push(...JSON.parse(setting.value));
    } catch (e) {
      console.error(`Invalid JSON for key ${setting.key}:`, e);
    }

    return {
      countryCode,
      countryLabel: country?.label || countryCode,
      regions,
    };
  });

  useEffect(() => {
    if (!selectedCountry) {
      setRegions([]);
      return;
    }

    const countryData = regionData[selectedCountry];

    if (countryData && Array.isArray(countryData) && countryData[2]) {
      const regionList = countryData[2].map(([name, shortCode]) => ({ name, shortCode }));
      setRegions(regionList);
    } else {
      setRegions([]);
    }
  }, [selectedCountry]);

  const [openRegion, setOpenRegion] = useState(false);

  const handleRegionDialogClose = () => {
    setTimeout(() => {
      setOpenRegion(false);
    }, 100);
  };
  const [selectedRegionToAdd, setSelectedRegionToAdd] = useState([]);
  const handleToggleRegion = (region) => {
    setSelectedRegionToAdd((prev) => {
      const exists = prev.some((r) => r.shortCode === region.shortCode);
      if (exists) {
        return prev.filter((r) => r.shortCode !== region.shortCode);
      } else {
        return [...prev, region];
      }
    });
  };

  const handleAddRegion = async () => {
    const payloadArray = selectedRegionToAdd.map((region) => ({
      name: { value: region.name },
      symbol: region.shortCode,
    }));

    const payload = {
      key: `province${selectedCountry}`,
      value: JSON.stringify(payloadArray),
    };
    if (provinceSettings.length > 0 && countryProvinces.length > 0) {
      payload.isActive = true;
    }

    console.log('this is the final payload', payload);

    let response;
    if (provinceSettings.length > 0 && countryProvinces.length > 0) {
      response = await updateSetting(payload);
    } else {
      response = await addSetting(payload);
    }
    try {
      if (response.success) {
        toast.success(
          provinceSettings.length > 0 && countryProvinces.length > 0
            ? t('settings.province_updated')
            : t('settings.province_added')
        );
        handleRegionDialogClose();
        await mutate();
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      console.error('Add province failed:', error);
    }
  };
  const handleButtonClick = (buttonName) => {
    setSelectedButton(buttonName);
  };

  const handleSetAsDefault = async (province) => {
    const payload = {
      key: 'defaultProvince',
      value: province,
    };
    if (settingsId) {
      payload.isActive = true;
    }
    console.log('this is the payload', payload);
    let response;
    if (settingsId) {
      response = await updateSetting(payload);
    } else {
      response = await addSetting(payload);
    }
    try {
      if (response.success) {
        toast.success(
          `${t('settings.default_province')}: ${province}`
        );
        confirmProvince.onFalse();
        await mutate();
        setDefaultProvince(province);
        setSelectedProvince(province);
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      console.error('Add province failed:', error);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box
        display="flex"
        justifyContent={selectedButton === 'addedProvince' ? 'flex-end' : 'space-between'}
        sx={{ mb: 1 }}
      >
        {selectedButton === 'provinceList' && (
          <Button
            startIcon={
              <Iconify
                icon="eva:arrow-back-fill"
                sx={{
                  transform: storedLang === 'ar' ? 'rotate(180deg)' : 'none',
                  ...(storedLang === 'ar' && { ml: 1 }),
                }}
              />
            }
            variant="outlined"
            onClick={() => {
              handleButtonClick('addedProvince');
            }}
          >
            {t('settings.back')}
          </Button>
        )}

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
            handleButtonClick('provinceList');
          }}
        >
        {t('settings.add_province')}
        </Button>
      </Box>
      <FormControl component="fieldset" sx={{ width: '100%' }}>
        <RadioGroup name="country-selection" value={selectedCountry} onChange={handleCountryChange}>
          <Grid container spacing={2}>
            {selectedButton === 'provinceList' ? (
              <>
                {countries.map((region) => {
                  const staticRegionInfo = countries.find((c) => c.code === region.code);
                  const nameCountryCode = staticRegionInfo ? staticRegionInfo.label : '';

                  const provinceEntry = settingsList?.settings?.find(
                    (s) => s.key === `province${region.code}`
                  );
                  console.log('this is the provinceEntry', provinceEntry);

                  let parsedProvinces = [];
                  try {
                    parsedProvinces = provinceEntry ? JSON.parse(provinceEntry.value) : [];
                  } catch (e) {
                    console.error(`Failed to parse province list for ${region.code}`, e);
                  }

                  return (
                    <Grid
                      item
                      xs={12}
                      sm={6}
                      md={4}
                      lg={3}
                      xl={2}
                      key={region.symbol}
                      sx={{ display: 'flex' }}
                    >
                      <Box sx={{ width: '100%' }}>
                        <Accordion
                          disableGutters
                          elevation={1}
                          sx={{ bgcolor: 'background.paper' }}
                        >
                          <AccordionSummary
                            expandIcon={
                              <Tooltip title={t("settings.add_province")} arrow>
                                <IconButton
                                  size="small"
                                  aria-label={`Set ${nameCountryCode} as default`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedCountry(region.code);
                                    setSelectedCountryName(region.label);

                                    const provinceEntry = settingsList?.settings?.find(
                                      (s) => s.key === `province${region.code}`
                                    );

                                    let savedProvinces = [];
                                    try {
                                      savedProvinces = provinceEntry
                                        ? JSON.parse(provinceEntry.value)
                                        : [];
                                    } catch (e) {
                                      console.error(
                                        `Failed to parse saved provinces for ${region.code}`,
                                        e
                                      );
                                    }

                                    setSelectedRegionToAdd(
                                      savedProvinces.map((p) => ({
                                        name: p.name?.value,
                                        shortCode: p.symbol,
                                      }))
                                    );

                                    setOpenRegion(true);
                                  }}
                                >
                                  <Iconify icon={'mingcute:add-line'} width={15} />
                                </IconButton>
                              </Tooltip>
                            }
                          >
                            <Typography variant="subtitle1" noWrap sx={{ ml: 1, width: 200 }}>
                              {nameCountryCode}
                            </Typography>
                          </AccordionSummary>

                          <AccordionDetails>
                            {parsedProvinces.length > 0 ? (
                              parsedProvinces.map((prov) => (
                                <Typography
                                  key={prov.symbol}
                                  variant="body2"
                                  sx={{ fontSize: 12, color: 'text.secondary', ml: 1, pt: 1 }}
                                >
                                  • {prov.name?.value}
                                </Typography>
                              ))
                            ) : (
                              <Typography
                                variant="body2"
                                sx={{
                                  fontSize: 12,
                                  color: 'text.disabled',
                                  ml: 1,
                                }}
                              >
                                {t('settings.no_province_added')}
                              </Typography>
                            )}
                          </AccordionDetails>
                        </Accordion>
                      </Box>
                    </Grid>
                  );
                })}
              </>
            ) : (
              <>
                {settingsList?.settings
                  ?.filter((s) => s.key.startsWith('province'))
                  ?.map((provinceEntry) => {
                    const countryCode = provinceEntry.key.replace('province', ''); // e.g. AF
                    console.log('this is the country code', countryCode);
                    const countryMatch = countries.find((c) => c.code === countryCode);
                    const nameCountryCode = countryMatch ? countryMatch.label : '';

                    let parsedProvinces = [];
                    try {
                      parsedProvinces = provinceEntry.value ? JSON.parse(provinceEntry.value) : [];
                    } catch (e) {
                      console.error(`Failed to parse province list for ${countryCode}`, e);
                    }

                    return (
                      <Grid
                        item
                        xs={12}
                        sm={6}
                        md={4}
                        lg={3}
                        xl={2}
                        key={countryCode}
                        sx={{ display: 'flex' }}
                      >
                        <Box
                          sx={{
                            width: '100%',
                          }}
                        >
                          <Accordion
                            disableGutters
                            elevation={1}
                            sx={{
                              bgcolor: 'background.paper',
                              borderRadius: 1,
                              border: countryCode === defaultProvince ? '1px solid' : 'none',
                              borderColor:
                                countryCode === defaultProvince ? 'primary.main' : 'divider',
                              bgcolor:
                                countryCode === defaultProvince ? 'background.paper' : 'grey.200',
                            }}
                          >
                            <AccordionSummary
                              expandIcon={
                                <>
                                  <Tooltip title={t('settings.set_default_country')} arrow>
                                    <IconButton
                                      size="small"
                                      aria-label={`Set ${nameCountryCode} as default`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        setSelectedProvince(countryCode);
                                        confirmProvince.onTrue();
                                      }}
                                    >
                                      <Iconify
                                        color={countryCode === defaultProvince ? '#006A67' : ''}
                                        icon={
                                          countryCode === defaultProvince
                                            ? 'mdi:star'
                                            : 'mdi:star-outline'
                                        }
                                        width={countryCode === defaultProvince ? '20px' : '18px'}
                                      />
                                    </IconButton>
                                  </Tooltip>
                                  <ExpandMoreIcon fontSize="small" sx={{ mt: 0.6 }} />
                                </>
                              }
                            >
                              <Typography variant="subtitle1" noWrap sx={{ ml: 1, width: 200 }}>
                                {nameCountryCode}
                              </Typography>
                            </AccordionSummary>

                            <AccordionDetails>
                              {parsedProvinces.length > 0 ? (
                                parsedProvinces.map((prov) => (
                                  <Typography
                                    key={prov.symbol}
                                    variant="body2"
                                    sx={{ fontSize: 12, color: 'text.secondary', ml: 1, pt: 1 }}
                                  >
                                    • {prov.name?.value}
                                  </Typography>
                                ))
                              ) : (
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontSize: 12,
                                    color: 'text.disabled',
                                    ml: 1,
                                  }}
                                >
                              {t('settings.no_province_added')}
                                </Typography>
                              )}
                            </AccordionDetails>
                          </Accordion>
                        </Box>
                      </Grid>
                    );
                  })}
              </>
            )}
          </Grid>
        </RadioGroup>
      </FormControl>

      <AddProvince
        open={openRegion}
        shared={regions}
        onClose={handleRegionDialogClose}
        onToggleRegion={handleToggleRegion}
        onAddRegion={handleAddRegion}
        selectedRegionToAdd={selectedRegionToAdd}
        selectedCountry={selectedCountry}
        selectedCountryName={selectedCountryName}
      />
      <ConfirmDialog
        open={confirmProvince.value}
        onClose={confirmProvince.onFalse}
        title={t('settings.set_default_country')}
        content={t('settings.content')}
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
              handleSetAsDefault(selectedProvince);
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
