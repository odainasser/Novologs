'use client';

import dayjs from 'dayjs';
import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { useRouter } from 'src/routes/hooks';

import { toast } from 'src/components/snackbar';

import { allLangs } from './all-langs';
import { fallbackLng, changeLangMessages as messages } from './config-locales';

// ----------------------------------------------------------------------

export function useTranslate(ns) {
  const router = useRouter();

  const { t, i18n } = useTranslation(ns);

  const fallback = allLangs.find((lang) => lang.value === fallbackLng);

  const currentLang = allLangs.find((lang) => lang.value === i18n.resolvedLanguage);

  const onChangeLang = useCallback(
    async (newLang) => {
      try {
        const langChangePromise = i18n.changeLanguage(newLang);

        const currentMessages = messages[newLang] || messages.en;

        toast.promise(langChangePromise, {
          loading: currentMessages.loading,
          success: () => currentMessages.success,
          error: currentMessages.error,
        });

        const selectedLocale = allLangs.find((lang) => lang.value === newLang);
        if (selectedLocale) {
          dayjs.locale(selectedLocale.adapterLocale);
        }

        localStorage.setItem('selectedLang', newLang);

        router.refresh();
      } catch (error) {
        console.error(error);
      }
    },
    [i18n, router]
  );

  // Apply saved language on initial load
  useEffect(() => {
    const storedLang = localStorage.getItem('selectedLang');
    if (storedLang && storedLang !== i18n.resolvedLanguage) {
      i18n.changeLanguage(storedLang);
      const selectedLocale = allLangs.find((lang) => lang.value === storedLang);
      if (selectedLocale) {
        dayjs.locale(selectedLocale.adapterLocale);
      }
    }
  }, [i18n]);

  return {
    t,
    i18n,
    onChangeLang,
    currentLang: currentLang ?? fallback,
  };
}
