import type { Locale, TranslationKeys } from './types';

// Import translations with relative paths for now
import en from '../../../i18n/en.json';
import es from '../../../i18n/es.json';
import ca from '../../../i18n/ca.json';

// Translations object with proper typing
const translations = {
  en,
  es,
  ca,
} as Record<Locale, TranslationKeys>;

const STORAGE_KEY = 'tech-sphere-locale';

/**
 * Gets the user's preferred locale based on saved preference or browser settings
 */
export function getPreferredLocale(defaultLocale: Locale = 'ca'): Locale {
  // For server-side rendering, return default locale
  if (typeof localStorage === 'undefined' || typeof navigator === 'undefined') {
    return defaultLocale;
  }
  
  try {
    // Check for saved preference
    const savedLocale = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (savedLocale && translations[savedLocale]) {
      return savedLocale;
    }
    
    // Check browser language
    const browserLang = navigator.language.split('-')[0] as Locale;
    if (translations[browserLang]) {
      return browserLang;
    }
  } catch (error) {
    console.error('Error detecting locale:', error);
  }
  
  return defaultLocale;
}

/**
 * Saves the user's locale preference
 */
export function saveLocalePreference(locale: Locale): void {
  if (typeof localStorage === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch (error) {
    console.error('Error saving locale preference:', error);
  }
}

/**
 * Gets a translation by key
 */
export function getTranslation(locale: Locale, key: string, params: Record<string, string | number> = {}): string {
  // Split the key by dots to access nested properties
  const keys = key.split('.');
  let value: any = translations[locale];

  // Traverse the translation object
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      console.warn(`Translation key '${key}' not found for locale '${locale}'`);
      return key; // Return the key as fallback
    }
  }

  // Replace placeholders if any
  if (typeof value === 'string' && Object.keys(params).length > 0) {
    return Object.entries(params).reduce(
      (str, [param, val]) => str.replace(`{{${param}}}`, String(val)),
      value
    );
  }

  return value || key;
}

/**
 * Returns all available locales
 */
export function getAvailableLocales(): Locale[] {
  return Object.keys(translations) as Locale[];
}

export { translations };
