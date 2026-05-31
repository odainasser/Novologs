import { countries } from 'src/assets/data';

// ----------------------------------------------------------------------

export function getCountry(inputValue) {
  const option = countries.filter(
    (country) => country.label === inputValue || country.code === inputValue
  )[0];

  return { code: option?.code, label: option?.label, phone: option?.phone };
}

// ----------------------------------------------------------------------

export function displayValueByCountryCode(inputValue) {
  if (!inputValue) return '';
  const option = countries.find((country) => country.code === inputValue);
  return option?.label || '';
}
