import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';

import en from './locales/en.json';
import es from './locales/es.json';
import it from './locales/it.json';
import pt from './locales/pt.json';
import zh from './locales/zh.json';
import fr from './locales/fr.json';

// Get the user's preferred language
const deviceLanguage = getLocales()[0]?.languageCode || 'en';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    es: { translation: es },
    it: { translation: it },
    pt: { translation: pt },
    zh: { translation: zh },
    fr: { translation: fr },
  },
  lng: deviceLanguage, // Set initial language based on device settings
  fallbackLng: 'en', // Fallback language if translation is missing
  interpolation: {
    escapeValue: false, // React already safe from XSS
  },
});

export default i18n;
