import { SUPPORTED_LANGUAGES, SupportedLanguage, TranslationKey } from '../i18n/translations';
import { LabeledButton } from '../models/pixijs/labeled-button.model';
import { GameService } from '../services/game.service';
import { TranslationService } from '../services/translation.service';
import { Popup } from './popup';

const POPUP_HEIGHT = 557;
const BUTTON_INDEX_OFFSET = 0.5;
const BUTTON_DISABLED_ALPHA = 0.7;
const RESET_ARMED_COLOR = 0xff5555;

export class SettingsPopup extends Popup {
  private readonly languageButtons = new Map<SupportedLanguage, LabeledButton>();
  private readonly soundButton: LabeledButton;
  private readonly effectsButton: LabeledButton;
  private readonly exportButton: LabeledButton;
  private readonly importButton: LabeledButton;
  private readonly resetButton: LabeledButton;
  private readonly backButton: LabeledButton;
  private resetArmed = false;
  private exportKey: TranslationKey = 'settings.export';
  private importKey: TranslationKey = 'settings.import';
  // prepared up front: iOS only allows the clipboard write synchronously inside the tap
  private exportCode?: string;

  constructor(
    private readonly gameService: GameService,
    private readonly translation: TranslationService,
  ) {
    super(translation.getTranslation('settings.title'), POPUP_HEIGHT);

    SUPPORTED_LANGUAGES.forEach((language, index) => {
      this.createLanguageButton(language, index + BUTTON_INDEX_OFFSET);
    });

    let index = BUTTON_INDEX_OFFSET + SUPPORTED_LANGUAGES.length;
    this.soundButton = this.addButton('', () => this.toggleSound(), index++);
    this.effectsButton = this.addButton('', () => this.toggleEffects(), index++);
    this.exportButton = this.addButton('', () => void this.handleExport(), index++);
    this.importButton = this.addButton('', () => void this.handleImport(), index++);
    this.resetButton = this.addButton('', () => this.handleReset(), index++);

    this.backButton = this.addButton(
      this.translation.getTranslation('common.back'),
      // opened from the pause menu while playing, otherwise from the main menu
      () =>
        this.gameService.paused()
          ? this.gameService.openPause(this)
          : this.gameService.openNavigation(this),
      index,
    );

    void this.gameService.exportProgress().then((code) => (this.exportCode = code));
    this.updateContentLanguage();
  }

  private toggleSound(): void {
    this.gameService.sound.muted = !this.gameService.sound.muted;
    this.updateContentLanguage();
  }

  private toggleEffects(): void {
    this.gameService.gameScreen.effectsEnabled = !this.gameService.gameScreen.effectsEnabled;
    this.updateContentLanguage();
  }

  private async handleExport(): Promise<void> {
    const code = this.exportCode ?? (await this.gameService.exportProgress());
    try {
      await navigator.clipboard.writeText(code);
      this.exportKey = 'settings.exportCopied';
    } catch {
      // no clipboard access (e.g. older WebView): show the code so it can be copied by hand
      // eslint-disable-next-line no-alert
      window.prompt(this.translation.getTranslation('settings.export'), code);
    }
    this.updateContentLanguage();
  }

  private async handleImport(): Promise<void> {
    // the Pixi canvas has no text field, the native prompt is the paste box (works in browser and Capacitor)
    // eslint-disable-next-line no-alert
    const code = window.prompt(this.translation.getTranslation('settings.importPrompt'));
    // eslint-disable-next-line no-alert
    if (!code || !window.confirm(this.translation.getTranslation('settings.importConfirm'))) {
      return;
    }
    const imported = await this.gameService.importProgress(this, code).catch(() => false);
    if (!imported) {
      this.importKey = 'settings.importInvalid';
      this.updateContentLanguage();
    }
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
    this.effectsButton.label.text = this.translation.getTranslation(
      this.gameService.gameScreen.effectsEnabled ? 'settings.effectsOn' : 'settings.effectsOff',
    );
    this.exportButton.label.text = this.translation.getTranslation(this.exportKey);
    this.importButton.label.text = this.translation.getTranslation(this.importKey);
    this.resetButton.label.text = this.translation.getTranslation(
      this.resetArmed ? 'settings.resetConfirm' : 'settings.reset',
    );
    this.resetButton.label.style.fill = this.resetArmed ? RESET_ARMED_COLOR : 0x000000;
    this.backButton.label.text = this.translation.getTranslation('common.back');
    Popup.fitLabel(this.soundButton);
    Popup.fitLabel(this.effectsButton);
    Popup.fitLabel(this.exportButton);
    Popup.fitLabel(this.importButton);
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
