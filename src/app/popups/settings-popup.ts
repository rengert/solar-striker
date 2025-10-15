import { ButtonContainer } from '@pixi/ui';
import { Text } from 'pixi.js';
import {
  SUPPORTED_LANGUAGES,
  SupportedLanguage,
  TranslationKey,
} from '../i18n/translations';
import { GameService } from '../services/game.service';
import { TranslationService } from '../services/translation.service';
import { Popup } from './popup';

const POPUP_HEIGHT = 300;
const BUTTON_INDEX_OFFSET = 1;
const BUTTON_DISABLED_ALPHA = 0.7;
const HALF = 0.5;

interface LanguageButton {
  button: ButtonContainer;
  label: Text;
}

export class SettingsPopup extends Popup {
  private readonly languageButtons = new Map<SupportedLanguage, LanguageButton>();
  private readonly languageLabel: Text;

  constructor(
    private readonly gameService: GameService,
    private readonly translation: TranslationService,
  ) {
    super(translation.getTranslation('settings.title'), POPUP_HEIGHT);

    this.languageLabel = new Text({
      text: this.translation.getTranslation('settings.languageLabel'),
      style: {
        fontFamily: 'DefaultFont',
        fontSize: 12,
        fill: 0x3c2f1e,
      },
    });
    this.languageLabel.anchor.set(HALF, HALF);
    this.languageLabel.x = 0;
    this.languageLabel.y = -80;
    this.addToContent(this.languageLabel);

    SUPPORTED_LANGUAGES.forEach((language, index) => {
      this.createLanguageButton(language, index + BUTTON_INDEX_OFFSET);
    });

    const backButtonIndex = BUTTON_INDEX_OFFSET + SUPPORTED_LANGUAGES.length;
    this.addButton(
      this.translation.getTranslation('common.back'),
      () => this.gameService.openNavigation(this),
      backButtonIndex,
    );

    this.updateContentLanguage();
  }

  private createLanguageButton(language: SupportedLanguage, index: number): void {
    const button = this.addButton(
      this.translation.getTranslation(this.getLanguageKey(language)),
      () => this.handleLanguageSelection(language),
      index,
    );
    const label = button.children[button.children.length - 1] as Text;
    this.languageButtons.set(language, { button, label });
  }

  private handleLanguageSelection(language: SupportedLanguage): void {
    if (this.translation.currentLanguage === language) {
      return;
    }

    this.translation.setLanguage(language);
    this.updateContentLanguage();
  }

  private updateContentLanguage(): void {
    this.updateTitle(this.translation.getTranslation('settings.title'));
    this.languageLabel.text = this.translation.getTranslation('settings.languageLabel');

    for (const [language, elements] of this.languageButtons) {
      elements.label.text = this.translation.getTranslation(this.getLanguageKey(language));
    }

    this.highlightSelectedLanguage();
  }

  private highlightSelectedLanguage(): void {
    const activeLanguage = this.translation.currentLanguage;

    for (const [language, { button }] of this.languageButtons) {
      const isActive = language === activeLanguage;
      button.enabled = !isActive;
      button.alpha = isActive ? BUTTON_DISABLED_ALPHA : 1;
    }
  }

  private getLanguageKey(language: SupportedLanguage): TranslationKey {
    return `settings.language.${language}` as TranslationKey;
  }
}
