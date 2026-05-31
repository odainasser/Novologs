export const fallbackLng = 'en';
export const languages = ['en', 'fr', 'vi', 'cn', 'ar','am','tr','es','sw','so'];
export const defaultNS = 'common';
export const cookieName = 'i18next';

// ----------------------------------------------------------------------

export function i18nOptions(lng = fallbackLng, ns = defaultNS) {
  return {
    // debug: true,
    lng,
    fallbackLng,
    ns,
    defaultNS,
    fallbackNS: defaultNS,
    supportedLngs: languages,
  };
}

// ----------------------------------------------------------------------

export const changeLangMessages = {
  en: {
    success: 'Language has been changed!',
    error: 'Error changing language!',
    loading: 'Loading...',
  },
  vi: {
    success: 'Ngôn ngữ đã được thay đổi!',
    error: 'Lỗi khi thay đổi ngôn ngữ!',
    loading: 'Đang tải...',
  },
  fr: {
    success: 'La langue a été changée!',
    error: 'Erreur lors du changement de langue!',
    loading: 'Chargement...',
  },
  cn: {
    success: '语言已更改！',
    error: '更改语言时出错！',
    loading: '加载中...',
  },
  ar: {
    success: 'تم تغيير اللغة!',
    error: 'خطأ في تغيير اللغة!',
    loading: 'جارٍ التحميل...',
  },
  am: {
  success: 'ቋንቋ ተለውጧል!',
  error: 'ቋንቋ መቀየር ላይ ስህተት ተከስቷል!',
  loading: 'በመጫን ላይ...',
},
tr: {
  success: 'Dil değiştirildi!',
  error: 'Dili değiştirirken bir hata oluştu!',
  loading: 'Yükleniyor...',
},
es: {
  success: '¡Idioma cambiado con éxito!',
  error: '¡Ocurrió un error al cambiar el idioma!',
  loading: 'Cargando...',
},

sw: {
  success: 'Lugha limebadilika!',
  error: 'Kuingiza lugha kwa shida!',
  loading: 'Inapakua...',
},
so: {
  success: 'Lugha wuu badalayaa!',
  error: 'Kuwaadiriisa lugha wuu kusheesho!',
  loading: 'Waxaad ugu sameeyo...',
},


};
