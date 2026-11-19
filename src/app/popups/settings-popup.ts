import { Capacitor } from '@capacitor/core';
import { SUPPORTED_LANGUAGES, SupportedLanguage, TranslationKey } from '../i18n/translations';
import { LabeledButton } from '../models/pixijs/labeled-button.model';
import { GameService } from '../services/game.service';
import { TranslationService } from '../services/translation.service';
import { Popup } from './popup';

const POPUP_HEIGHT = 661;
const BUTTON_SLOT_HEIGHT = 52;
const BUTTON_INDEX_OFFSET = 0.5;
const BUTTON_DISABLED_ALPHA = 0.7;
const RESET_ARMED_COLOR = 0xff5555;

/** Browsers only; the native apps run full screen anyway and iPhone Safari has no Fullscreen API. */
function canToggleFullscreen(): boolean {
  return document.fullscreenEnabled && !Capacitor.isNativePlatform();
}

export class SettingsPopup extends Popup {
  private readonly languageButtons = new Map<SupportedLanguage, LabeledButton>();
  private readonly soundButton: LabeledButton;
  private readonly musicButton: LabeledButton;
  private readonly effectsButton: LabeledButton;
  private readonly fullscreenButton?: LabeledButton;
  private readonly alwaysFireButton: LabeledButton;
  private readonly exportButton: LabeledButton;
  private readonly importButton: LabeledButton;
  private readonly resetButton: LabeledButton;
  private readonly backButton: LabeledButton;
  private resetArmed = false;
  private readonly fullscreenListener = new AbortController();
  private exportKey: TranslationKey = 'settings.export';
  private importKey: TranslationKey = 'settings.import';
  // prepared up front: iOS only allows the clipboard write synchronously inside the tap
  private exportCode?: string;

  constructor(
    private readonly gameService: GameService,
    private readonly translation: TranslationService,
  ) {
    const fullscreen = canToggleFullscreen();
    super(translation.getTranslation('settings.title'), POPUP_HEIGHT + (fullscreen ? BUTTON_SLOT_HEIGHT : 0));

    SUPPORTED_LANGUAGES.forEach((language, index) => {
      this.createLanguageButton(language, index + BUTTON_INDEX_OFFSET);
    });

    let index = BUTTON_INDEX_OFFSET + SUPPORTED_LANGUAGES.length;
    this.soundButton = this.addButton('', () => this.toggleSound(), index++);
    this.musicButton = this.addButton('', () => this.toggleMusic(), index++);
    this.effectsButton = this.addButton('', () => this.toggleEffects(), index++);
    if (fullscreen) {
      this.fullscreenButton = this.addButton('', () => void this.toggleFullscreen(), index++);
      // Esc or the browser's own controls also leave full screen
      document.addEventListener('fullscreenchange', () => this.updateContentLanguage(), {
        signal: this.fullscreenListener.signal,
      });
    }
    this.alwaysFireButton = this.addButton('', () => this.toggleAlwaysFire(), index++);
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

    // on failure handleExport simply builds the code again in the tap
    this.gameService.exportProgress().then((code) => (this.exportCode = code)).catch(() => undefined);
    this.updateContentLanguage();
  }

  override async hide(): Promise<void> {
    this.fullscreenListener.abort();
    await super.hide();
  }

  private toggleSound(): void {
    this.gameService.sound.muted = !this.gameService.sound.muted;
    this.updateContentLanguage();
  }

  private toggleMusic(): void {
    this.gameService.sound.musicMuted = !this.gameService.sound.musicMuted;
    this.updateContentLanguage();
  }

  private toggleEffects(): void {
    this.gameService.gameScreen.effectsEnabled = !this.gameService.gameScreen.effectsEnabled;
    this.updateContentLanguage();
  }

  private async toggleFullscreen(): Promise<void> {
    try {
      await (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen());
    } catch {
      // the browser refused (e.g. no user gesture); the label simply stays as it is
    }
    this.updateContentLanguage();
  }

  private toggleAlwaysFire(): void {
    this.gameService.alwaysFire = !this.gameService.alwaysFire;
    this.updateContentLanguage();
  }

  private async handleExport(): Promise<void> {
    let code: string | undefined;
    try {
      code = this.exportCode ?? (await this.gameService.exportProgress());
      await navigator.clipboard.writeText(code);
      this.exportKey = 'settings.exportCopied';
    } catch {
      if (code) {
        // no clipboard access (e.g. older WebView): show the code so it can be copied by hand
        // eslint-disable-next-line no-alert
        window.prompt(this.translation.getTranslation('settings.export'), code);
      } else {
        this.exportKey = 'settings.exportFailed';
      }
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
    this.musicButton.label.text = this.translation.getTranslation(
      this.gameService.sound.musicMuted ? 'settings.musicOff' : 'settings.musicOn',
    );
    this.effectsButton.label.text = this.translation.getTranslation(
      this.gameService.gameScreen.effectsEnabled ? 'settings.effectsOn' : 'settings.effectsOff',
    );
    if (this.fullscreenButton) {
      this.fullscreenButton.label.text = this.translation.getTranslation(
        document.fullscreenElement ? 'settings.fullscreenOn' : 'settings.fullscreenOff',
      );
      Popup.fitLabel(this.fullscreenButton);
    }
    this.alwaysFireButton.label.text = this.translation.getTranslation(
      this.gameService.alwaysFire ? 'settings.alwaysFireOn' : 'settings.alwaysFireOff',
    );
    this.exportButton.label.text = this.translation.getTranslation(this.exportKey);
    this.importButton.label.text = this.translation.getTranslation(this.importKey);
    this.resetButton.label.text = this.translation.getTranslation(
      this.resetArmed ? 'settings.resetConfirm' : 'settings.reset',
    );
    this.resetButton.label.style.fill = this.resetArmed ? RESET_ARMED_COLOR : 0x000000;
    this.backButton.label.text = this.translation.getTranslation('common.back');
    Popup.fitLabel(this.soundButton);
    Popup.fitLabel(this.musicButton);
    Popup.fitLabel(this.effectsButton);
    Popup.fitLabel(this.alwaysFireButton);
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
