import { Injectable, signal } from '@angular/core';
import {
  DEFAULT_LANGUAGE,
  SUPPORTED_LANGUAGES,
  getLocale,
  SupportedLanguage,
  TranslationKey,
  TRANSLATIONS,
  resolveLanguage,
} from '../i18n/translations';

type TranslationParams = Record<string, string | number>;

const LANGUAGE_STORAGE_KEY = 'preferred-language';

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private readonly language = signal<SupportedLanguage>(DEFAULT_LANGUAGE);
  private initialization?: Promise<void>;

  init(): Promise<void> {
    if (!this.initialization) {
      this.initialization = Promise.resolve().then(() => {
        const stored = this.getStoredLanguage();
        const detected = stored ?? resolveLanguage();
        this.language.set(detected);
      });
    }

    return this.initialization;
  }

  setLanguage(language: SupportedLanguage): void {
    this.language.set(language);
    this.storeLanguage(language);
  }

  getTranslation(key: TranslationKey, params?: TranslationParams): string {
    const currentLanguage = this.language();
    const dictionary: Partial<Record<TranslationKey, string>> = TRANSLATIONS[currentLanguage];
    const fallbackDictionary = TRANSLATIONS[DEFAULT_LANGUAGE];
    const template = dictionary[key] ?? fallbackDictionary[key];

    return template.replace(/\{\{(\w+)\}\}/g, (_, match: string) => {
      const value = params?.[match];
      return value !== undefined ? String(value) : `{{${match}}}`;
    });
  }

  get currentLanguage(): SupportedLanguage {
    return this.language();
  }

  get locale(): string {
    return getLocale(this.language());
  }

  private getStoredLanguage(): SupportedLanguage | null {
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (!stored) {
        return null;
      }

      return SUPPORTED_LANGUAGES.includes(stored as SupportedLanguage)
        ? (stored as SupportedLanguage)
        : null;
    } catch {
      return null;
    }
  }

  private storeLanguage(language: SupportedLanguage): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch {
      // ignore storage errors
    }
  }
}
