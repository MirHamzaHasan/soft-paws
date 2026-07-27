import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Sample translations
const resources = {
  en: {
    translation: {
      welcome: 'Welcome to Draco Boilerplate',
      login: 'Log In',
      logout: 'Log Out',
      settings: 'Settings',
      language: 'Language',
    },
  },
  es: {
    translation: {
      welcome: 'Bienvenido a Draco Boilerplate',
      login: 'Iniciar sesión',
      logout: 'Cerrar sesión',
      settings: 'Ajustes',
      language: 'Idioma',
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: Localization.getLocales()[0]?.languageCode ?? 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false, // react already safes from xss
  },
});

export default i18n;
