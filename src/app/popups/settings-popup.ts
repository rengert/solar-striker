import { SUPPORTED_LANGUAGES, SupportedLanguage, TranslationKey } from '../i18n/translations';
import { LabeledButton } from '../models/pixijs/labeled-button.model';
import { GameService } from '../services/game.service';
import { TranslationService } from '../services/translation.service';
import { Popup } from './popup';

const POPUP_HEIGHT = 400;
const BUTTON_INDEX_OFFSET = 0.5;
const BUTTON_DISABLED_ALPHA = 0.7;
const RESET_ARMED_COLOR = 0xff5555;

export class SettingsPopup extends Popup {
  private readonly languageButtons = new Map<SupportedLanguage, LabeledButton>();
  private readonly soundButton: LabeledButton;
  private readonly resetButton: LabeledButton;
  private readonly backButton: LabeledButton;
  private resetArmed = false;

  constructor(
    private readonly gameService: GameService,
    private readonly translation: TranslationService,
  ) {
    super(translation.getTranslation('settings.title'), POPUP_HEIGHT);

    SUPPORTED_LANGUAGES.forEach((language, index) => {
      this.createLanguageButton(language, index + BUTTON_INDEX_OFFSET);
    });

    const soundButtonIndex = BUTTON_INDEX_OFFSET + SUPPORTED_LANGUAGES.length;
    this.soundButton = this.addButton('', () => this.toggleSound(), soundButtonIndex);

    this.resetButton = this.addButton('', () => this.handleReset(), soundButtonIndex + 1);

    const backButtonIndex = soundButtonIndex + 1 + 1;
    this.backButton = this.addButton(
      this.translation.getTranslation('common.back'),
      // opened from the pause menu while playing, otherwise from the main menu
      () =>
        this.gameService.paused()
          ? this.gameService.openPause(this)
          : this.gameService.openNavigation(this),
      backButtonIndex,
    );

    this.updateContentLanguage();
  }

  private toggleSound(): void {
    this.gameService.sound.muted = !this.gameService.sound.muted;
    this.updateContentLanguage();
  }

  // first tap arms the button, second tap wipes the progress
  private handleReset(): void {
    if (!this.resetArmed) {
      this.resetArmed = true;
      this.updateContentLanguage();
      return;
    }

    void this.gameService.resetProgress(this);
  }

  private createLanguageButton(language: SupportedLanguage, index: number): void {
    const button = this.addButton(
      this.translation.getTranslation(this.getLanguageKey(language)),
      () => this.handleLanguageSelection(language),
      index,
    );
    this.languageButtons.set(language, button);
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

    for (const [language, elements] of this.languageButtons) {
      elements.label.text = this.translation.getTranslation(this.getLanguageKey(language));
      Popup.fitLabel(elements);
    }

    this.soundButton.label.text = this.translation.getTranslation(
      this.gameService.sound.muted ? 'settings.soundOff' : 'settings.soundOn',
    );
    this.resetButton.label.text = this.translation.getTranslation(
      this.resetArmed ? 'settings.resetConfirm' : 'settings.reset',
    );
    this.resetButton.label.style.fill = this.resetArmed ? RESET_ARMED_COLOR : 0x000000;
    this.backButton.label.text = this.translation.getTranslation('common.back');
    Popup.fitLabel(this.soundButton);
    Popup.fitLabel(this.resetButton);
    Popup.fitLabel(this.backButton);
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
