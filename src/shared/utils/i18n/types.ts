export interface TranslationKeys {
  site: {
    title: string;
    description: string;
  };
  common: {
    loading: string;
    error: string;
    retry: string;
  };
  comingSoon: {
    title: string;
    description: string;
    notifyMe: string;
  };
  // Add more translation keys as needed
}

export type Locale = 'en' | 'es' | 'ca';

/**
 * Object containing all translations for all locales
 */
export type Translations = Record<Locale, TranslationKeys>;

/**
 * Language names in their native language
 */
export const LANGUAGE_NAMES: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  ca: 'Català'
};
