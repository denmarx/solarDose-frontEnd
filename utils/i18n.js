import { getLocales } from 'expo-localization';
import i18n from 'i18n-js';


import en from '../locales/en.json';
import de from '../locales/de.json';

const i18n = new I18n({
    en: { loading: 'Loading data, please wait...' },
    de: { loading: 'Daten werden geladen, bitte warten...' }
});

i18n.locale = getLocales()[0].languageCode;

// const deviceLanguage = Localization.getLocales()[0].languageCode || 'en'; // get device language code

// i18n
//   .use(initReactI18next) // pass i18n to react-i18next
//   .init({
//     resources: {
//       en: { translation: en },
//       de: { translation: de }
//     },
//     lng: deviceLanguage,
//     fallbackLng: 'en', // fallback language if device lang is not supported

//     interpolation: {
//       escapeValue: false, // react already safes from xss
//     },
//   });

// export default i18n;