import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import fi from './locales/fi.json';

const resources = {
  fi,
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'fi', // TODO: If we start detecting language automatically, remove this
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
