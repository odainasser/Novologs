'use client';

// core (MUI)
import {
  frFR as frFRCore,
  viVN as viVNCore,
  zhCN as zhCNCore,
  arSA as arSACore,
  amET as amETCore,
  trTR as trTRCore,
  esES as esESCore,
} from '@mui/material/locale';
// date pickers (MUI)
import {
  enUS as enUSDate,
  frFR as frFRDate,
  viVN as viVNDate,
  zhCN as zhCNDate,
  
} from '@mui/x-date-pickers/locales';
// data grid (MUI)
import {
  enUS as enUSDataGrid,
  frFR as frFRDataGrid,
  viVN as viVNDataGrid,
  zhCN as zhCNDataGrid,
  arSD as arSDDataGrid,
 
} from '@mui/x-data-grid/locales';

// ----------------------------------------------------------------------

export const allLangs = [
  {
    value: 'en',
    label: 'English',
    countryCode: 'GB',
    adapterLocale: 'en',
    numberFormat: { code: 'en-US', currency: 'USD' },
    systemValue: {
      components: { ...enUSDate.components, ...enUSDataGrid.components },
    },
  },
  {
    value: 'ar',
    label: 'العربية',
    countryCode: 'AE',
    adapterLocale: 'ar-AE',
    numberFormat: { code: 'ar', currency: 'AED' },
    systemValue: {
      components: { ...arSACore.components, ...arSDDataGrid.components },
    },
  },

  {
    value: 'fr',
    label: 'French',
    countryCode: 'FR',
    adapterLocale: 'fr',
    numberFormat: { code: 'fr-Fr', currency: 'EUR' },
    systemValue: {
      components: { ...frFRCore.components, ...frFRDate.components, ...frFRDataGrid.components },
    },
  },
  {
    value: 'vi',
    label: 'Vietnamese',
    countryCode: 'VN',
    adapterLocale: 'vi',
    numberFormat: { code: 'vi-VN', currency: 'VND' },
    systemValue: {
      components: { ...viVNCore.components, ...viVNDate.components, ...viVNDataGrid.components },
    },
  },
  {
    value: 'cn',
    label: 'Chinese',
    countryCode: 'CN',
    adapterLocale: 'zh-cn',
    numberFormat: { code: 'zh-CN', currency: 'CNY' },
    systemValue: {
      components: { ...zhCNCore.components, ...zhCNDate.components, ...zhCNDataGrid.components },
    },
  },
  {
    value: 'am',
    label: 'Amharic',
    countryCode: 'ET',
    adapterLocale: 'am',
    numberFormat: { code: 'am-ET', currency: 'ETB' },
    systemValue: {
      components: {...amETCore.components},
    },
  },
  {
value: 'tr',
label: 'Turkish',
countryCode: 'TR',
adapterLocale: 'tr',
numberFormat: { code: 'tr-TR', currency: 'TRY' },
systemValue: {
  components: {...trTRCore.components },
},
  },
  {
  value: "es",
  label: "Spanish",
  countryCode: "ES",
  adapterLocale: "es",
  numberFormat: { code: "es-ES", currency: "EUR" },
  systemValue: {
    components: { ...esESCore.components }
  }
  },

  {
  value: 'sw',
  label: 'Swahili',
  countryCode: 'TZ',
  adapterLocale: 'sw-TZ',
  numberFormat: { code: 'sw-TZ', currency: 'TZS' },
  systemValue: {
    components: {}, // no MUI support → leave empty
  },
},
{
  value: 'so',
  label: 'Somali',
  countryCode: 'SO',
  adapterLocale: 'so-SO',
  numberFormat: { code: 'so-SO', currency: 'SOS' },
  systemValue: {
    components: {}, // no MUI support → leave empty
  },
},


  
];


/**
 * Country code:
 * https://flagcdn.com/en/codes.json
 *
 * Number format code:
 * https://gist.github.com/raushankrjha/d1c7e35cf87e69aa8b4208a8171a8416
 */
