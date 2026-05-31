export const getLocalizedValue = (obj, storedLang, fallback) => {
  return (
    obj?.localizedStrings?.find((ls) => ls.language.toLowerCase() === storedLang)?.value ||
    obj?.value ||
    fallback
  );
};
