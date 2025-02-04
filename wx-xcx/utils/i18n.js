// /utils/i18n.js
let T = {
  locale: null,
  locales: {},
  langCode: ['zh', 'en']
}

T.registerLocale = function (locales) {
  T.locales = locales;
}

T.setLocale = function (code) {
  T.locale = code;
}

T.setLocaleByIndex = function (index) {
  T.setLocale(T.langCode[index]);
}


T.getLanguage = function () {
  return T.locales[T.locale];
}

export default T