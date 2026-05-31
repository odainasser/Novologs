import { parsePhoneNumberFromString } from 'libphonenumber-js';

import { countries } from 'src/assets/data/countries';

// ----------------------------------------------------------------------

export function getCountryCode(inputValue, fallbackCountryCode = 'AE') {
  if (!inputValue) return fallbackCountryCode;

  try {
    const phoneNumber = parsePhoneNumberFromString(inputValue);

    if (phoneNumber?.country) {
      return phoneNumber.country;
    }
  } catch (e) {
    // ignore while typing
  }

  return fallbackCountryCode;
}
// ----------------------------------------------------------------------

export function getCountry(countryCode) {
  const option = countries.filter((country) => country.code === countryCode)[0];
  return option;
}

// ----------------------------------------------------------------------

export function applyFilter({ inputData, query }) {
  if (!query) return inputData;

  const lowerCaseQuery = query.toLowerCase();

  return inputData.filter(({ label, code, phone }) =>
    [label, code, phone].some((field) => field.toLowerCase().includes(lowerCaseQuery))
  );
}
export function getCountryCodeFromPhonePrefix(value) {
  if (!value || !value.startsWith('+')) return null;

  const digits = value.replace(/[^\d+]/g, '');

  const matchedCountry = [...countries]
    .filter((country) => country.phone)
    .sort((a, b) => String(b.phone).length - String(a.phone).length)
    .find((country) => digits.startsWith(`+${country.phone}`));

  return matchedCountry?.code ?? null;
}
