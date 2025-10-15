import { Injectable, signal } from '@angular/core';
import {
  DEFAULT_LANGUAGE,
  getLocale,
  SupportedLanguage,
  TranslationKey,
  TRANSLATIONS,
  resolveLanguage,
} from '../i18n/translations';

type TranslationParams = Record<string, string | number>;

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private readonly language = signal<SupportedLanguage>(DEFAULT_LANGUAGE);
  private initialization?: Promise<void>;

  init(): Promise<void> {
    if (!this.initialization) {
      this.initialization = Promise.resolve().then(() => {
        const detected = resolveLanguage();
        this.language.set(detected);
      });
    }

    return this.initialization;
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
}
