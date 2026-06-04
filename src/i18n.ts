import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import fr from './locales/fr.json';
import ro from './locales/ro.json';
import it from './locales/it.json';
import pt from './locales/pt.json';
import ar from './locales/ar.json';
import es from './locales/es.json';
import de from './locales/de.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      fr: { translation: fr },
      ro: { translation: ro },
      it: { translation: it },
      pt: { translation: pt },
      ar: { translation: ar },
      es: { translation: es },
      de: { translation: de },
    },
    fallbackLng: 'fr',
    supportedLngs: ['en','fr','ro','it','pt','ar','es','de'],
    detection: {
      order: ['localStorage','navigator'],
      caches: ['localStorage'],
    },
    interpolation: { escapeValue: false },
  });

export default i18n;
