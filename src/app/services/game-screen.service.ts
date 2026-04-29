import { inject, Injectable, OnDestroy } from '@angular/core';
import { Container, FederatedPointerEvent, Graphics, Text, TextStyle } from 'pixi.js';
import { gsap } from 'gsap';
import { fontAwesomeStyle, icons } from '../style-constants';
import { GameShipService } from './game-ship.service';
import { UpdatableService } from './updatable.service';

const HEADER_TOP_PADDING = 20;
const HEADER_LINE_SPACING = 22;
const HEADER_SIDE_PADDING = 8;
const DOUBLE = 2;
const TRIPPLE = 3;
const PAUSE_BUTTON_FONT_SIZE = 20;
const BOSS_WARNING_FONT_SIZE = 28;
const BOSS_WARNING_STROKE_WIDTH = 4;
const BOSS_WARNING_DISPLAY_MS = 2800;
const BOSS_WARNING_FADE_S = 0.6;
const SCREEN_CENTER_DIVIDER = 2;
// floating popup / HUD constants (avoid magic numbers)
const FLOAT_POP_OFFSET_X = 20;
const FLOAT_POP_OFFSET_Y = 8;
const FLOAT_START_SCALE = 1.2;
const FLOAT_SCALE_BACK_DURATION = 0.12;
const FLOAT_POP_DURATION = 0.9;
const FLOAT_UP_DISTANCE = 40;
const HUD_LABEL_SPACING = 8;
const COMBO_POP_START_SCALE = 1.4;
// Health animation & flash constants
const HEALTH_TWEEN_DURATION = 0.25;
const DAMAGE_FLASH_DURATION = 0.12;
const LOW_HEALTH_THRESHOLD = 30; // percent
const PULSE_DURATION = 0.6;
const PULSE_SCALE = 1.15;
const MIN_HEALTH_DELTA = 0.05;
// Achievement banner constants
const ACHIEVEMENT_BANNER_WIDTH = 220;
const ACHIEVEMENT_BANNER_HEIGHT = 44;
const ACHIEVEMENT_BANNER_PADDING = 8;
const ACHIEVEMENT_BANNER_RADIUS = 8;
const ACHIEVEMENT_BANNER_FONT_SIZE = 11;
const ACHIEVEMENT_BANNER_TITLE_SIZE = 13;
const ACHIEVEMENT_BANNER_BG_COLOR = 0x1a1a2e;
const ACHIEVEMENT_BANNER_BORDER_COLOR = 0xffd700;
const ACHIEVEMENT_BANNER_BORDER_WIDTH = 2;
const ACHIEVEMENT_BANNER_SHOW_MS = 3000;
const ACHIEVEMENT_BANNER_SLIDE_DURATION = 0.4;
const ACHIEVEMENT_BANNER_FADE_DURATION = 0.3;
const ACHIEVEMENT_BANNER_SUBTITLE_SPACER = 4;
// Wave announcement constants
const WAVE_ANNOUNCEMENT_FONT_SIZE = 30;
const WAVE_ANNOUNCEMENT_STROKE_WIDTH = 4;
const WAVE_ANNOUNCEMENT_DISPLAY_MS = 2000;
const WAVE_ANNOUNCEMENT_FADE_S = 0.5;
const WAVE_ANNOUNCEMENT_Y_OFFSET = 60;
// Screen shake constants
const SHAKE_AMPLITUDE = 6;
const SHAKE_STEP_DURATION_S = 0.05;
const SHAKE_REPEAT_COUNT = 5;

@Injectable()
export class GameScreenService extends UpdatableService implements OnDestroy {
  readonly #ship = inject(GameShipService);

  // health animation fields
  // inferred from previous width (100px / 10)
  // eslint-disable-next-line @typescript-eslint/naming-convention, no-magic-numbers
  private readonly maxHealthUnits = 10;
  private lastHealth = 0;
  private isPulsing = false;
  private damageOverlay?: Graphics;

  private readonly points = new Text({ text: `${icons.points}  0000000`, style: fontAwesomeStyle });
  private readonly coinLabel = new Text({ text: `${icons.coin}  0000000`, style: fontAwesomeStyle });
  private readonly levelLabel = new Text({ text: `${icons.level}  0000001`, style: fontAwesomeStyle });
  private readonly comboLabel = new Text({ text: `x1`, style: fontAwesomeStyle });

  // Floating score popup container and style
  private readonly floatingContainer = new Container();
  private readonly floatingTextStyle = new TextStyle({
    fontFamily: 'Arial',
    fontSize: 18,
    fontWeight: 'bold',
    fill: 0xffffff,
    stroke: {
      // eslint-disable-next-line no-magic-numbers
      color: 0x000000,
      width: 2,
    },
    align: 'center',
  });

  // track last kills value to show deltas
  private lastKills = 0;

  private lifesLabel: Graphics | undefined;
  private pauseButton?: Text;

  onPause?: () => void;

  set kills(value: number) {
    // show delta as floating popup when kills increased
    const delta = value - this.lastKills;
    // eslint-disable-next-line no-magic-numbers
    this.points!.text = `${icons.points}  ${value.toString().padStart(7, '0')}`;
    if (delta > 0) {
      // show near the points label
      const x = this.points.x - FLOAT_POP_OFFSET_X;
      const y = this.points.y + FLOAT_POP_OFFSET_Y;
      this.showFloatingText(`+${delta}`, x, y);
    }
    this.lastKills = value;
  }

  set level(value: number) {
    // eslint-disable-next-line no-magic-numbers
    this.levelLabel!.text = `${icons.level}  ${value.toString().padStart(7, '0')}`;
  }

  set coins(value: number) {
    // eslint-disable-next-line no-magic-numbers
    this.coinLabel!.text = `${icons.coin}  ${value.toString().padStart(7, '0')}`;
  }

  set combo(value: number) {
    this.comboLabel.text = `x${value}`;
    // position combo label left of coin label
    this.comboLabel.x = this.coinLabel.x - this.comboLabel.width - HUD_LABEL_SPACING;
    this.comboLabel.y = this.coinLabel.y;
    // pop animation
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    this.comboLabel.scale.set(COMBO_POP_START_SCALE);
    void gsap.to(this.comboLabel.scale, { x: 1, y: 1, duration: FLOAT_SCALE_BACK_DURATION });
  }

  // highestCombo is received but not displayed in HUD; setter kept for compatibility
  set highestCombo(_value: number) {
    // no-op for now
  }

  set pauseButtonVisible(visible: boolean) {
    if (this.pauseButton) {
      this.pauseButton.visible = visible;
    }
  }

  private set lifes(value: number) {
    // Smoothly animate health bar using scale.x instead of directly setting width.
    if (!this.lifesLabel) {
      return;
    }

    // clamp value
    const clamped = Math.max(0, Math.min(value, this.maxHealthUnits));
    const targetScaleX = clamped / this.maxHealthUnits;

    // ignore tiny changes
    if (Math.abs(clamped - this.lastHealth) < MIN_HEALTH_DELTA) {
      this.lastHealth = clamped;
      return;
    }

    // if health decreased -> damage flash
    if (clamped < this.lastHealth) {
      this.showDamageFlash();
    }

    // kill any running health tween and start a smooth one
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      gsap.killTweensOf(this.lifesLabel.scale);
    } catch {}
    gsap.to(this.lifesLabel.scale, { x: targetScaleX, duration: HEALTH_TWEEN_DURATION, ease: 'power2.out' });

    // low-health pulse control (percentage)
    const pct = targetScaleX;
    // eslint-disable-next-line no-magic-numbers
    const lowThreshold = LOW_HEALTH_THRESHOLD / 100;
    if (pct <= lowThreshold && !this.isPulsing) {
      this.startPulse();
    } else if (pct > lowThreshold && this.isPulsing) {
      this.stopPulse();
    }

    this.lastHealth = clamped;
  }

  init(): void {
    this.points.x = this.application.screen.width - this.points.width - HEADER_SIDE_PADDING;
    this.points.y = HEADER_TOP_PADDING + HEADER_LINE_SPACING * DOUBLE;
    this.addToStage(this.points);

    const energyBarContainer = new Container();
    this.lifesLabel = new Graphics();
    // eslint-disable-next-line no-magic-numbers
    this.lifesLabel.fill(0xff0000);
    // eslint-disable-next-line no-magic-numbers
    this.lifesLabel.rect(0, 0, 100, 5);
    this.lifesLabel.fill();
    // ensure scale is reset and origin at left so scale.x shrinks from left to right
    this.lifesLabel.scale.set(1, 1);
    this.lifesLabel.x = HEADER_SIDE_PADDING;
    this.lifesLabel.y = HEADER_TOP_PADDING + HEADER_LINE_SPACING * TRIPPLE;

    // red damage overlay sits above the health bar and is used for quick flash
    this.damageOverlay = new Graphics();
    // eslint-disable-next-line no-magic-numbers
    this.damageOverlay.fill(0xff0000);
    // same size as health bar
    // eslint-disable-next-line no-magic-numbers
    this.damageOverlay.rect(0, 0, 100, 5);
    this.damageOverlay.fill();
    this.damageOverlay.alpha = 0;
    this.damageOverlay.x = this.lifesLabel.x;
    this.damageOverlay.y = this.lifesLabel.y;
    energyBarContainer.addChild(this.lifesLabel);
    energyBarContainer.addChild(this.damageOverlay);
    this.addToStage(energyBarContainer);


    this.levelLabel.x = this.application.screen.width - this.levelLabel.width - HEADER_SIDE_PADDING;
    this.levelLabel.y = HEADER_TOP_PADDING + HEADER_LINE_SPACING;
    this.addToStage(this.levelLabel);

    this.coinLabel.x = this.application.screen.width - this.coinLabel.width - HEADER_SIDE_PADDING;
    this.coinLabel.y = HEADER_TOP_PADDING;
    this.addToStage(this.coinLabel);

    // combo label sits left of the coin label
    this.comboLabel.x = this.coinLabel.x - this.comboLabel.width - HUD_LABEL_SPACING;
    this.comboLabel.y = this.coinLabel.y;
    this.addToStage(this.comboLabel);
    // add floating popup container to the stage (for +score popups)
    this.addToStage(this.floatingContainer);

    this.pauseButton = new Text({
      text: icons.pause,
      style: new TextStyle({
        fontFamily: 'Font Awesome 6 Free',
        fontWeight: '900',
        fontSize: PAUSE_BUTTON_FONT_SIZE,
        fill: 0xffffff,
      }),
    });
    this.pauseButton.x = HEADER_SIDE_PADDING;
    this.pauseButton.y = HEADER_TOP_PADDING;
    this.pauseButton.visible = false;
    this.pauseButton.eventMode = 'static';
    this.pauseButton.cursor = 'pointer';
    this.pauseButton.on('pointerdown', (event: FederatedPointerEvent): void => {
      event.stopPropagation();
      this.onPause?.();
    });
    this.addToStage(this.pauseButton);
  }

  update(): void {
    this.lifes = this.#ship.instance.energy;
  }

  // zeigt kurz einen roten Flash über der Gesundheitsleiste
  private showDamageFlash(): void {
    if (!this.damageOverlay) {
      return;
    }
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      gsap.killTweensOf(this.damageOverlay);
    } catch {}
    this.damageOverlay.alpha = 0.6;
    this.damageOverlay.visible = true;
    gsap.to(this.damageOverlay, {
      alpha: 0,
      duration: DAMAGE_FLASH_DURATION,
      ease: 'power1.out',
      onComplete: () => {
        if (this.damageOverlay) {
          this.damageOverlay.visible = false;
        }
      },
    });
  }

  // startet pulse tween (skaliert y leicht) für low-health
  private startPulse(): void {
    if (!this.lifesLabel) {
      return;
    }
    this.isPulsing = true;
    try {
      gsap.killTweensOf(this.lifesLabel.scale);
    } catch {}
    // eslint-disable-next-line no-magic-numbers
    gsap.to(this.lifesLabel.scale, { y: PULSE_SCALE, duration: PULSE_DURATION / 2, yoyo: true, repeat: -1, ease: 'sine.inOut' });
  }

  // stoppt Pulse und stellt scale.y wieder her
  private stopPulse(): void {
    if (!this.lifesLabel) {
      this.isPulsing = false;
      return;
    }
    try {
      gsap.killTweensOf(this.lifesLabel.scale);
    } catch {}
    gsap.to(this.lifesLabel.scale, { y: 1, duration: 0.12, ease: 'power1.out' });
    this.isPulsing = false;
  }

  ngOnDestroy(): void {
    try {
      // kill any running tweens to avoid running after destroy
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      if (this.lifesLabel?.scale) {
        gsap.killTweensOf(this.lifesLabel.scale);
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      if (this.damageOverlay) {
        gsap.killTweensOf(this.damageOverlay);
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      gsap.killTweensOf(this.floatingContainer);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      gsap.killTweensOf(this.application.stage);
    } catch {}
  }

  /**
   * Zeigt ein kleines animiertes Text-Popup an (z.B. "+5") und entfernt es nach der Animation.
   */
  showFloatingText(text: string, x?: number, y?: number): void {
    const txt = new Text({ text, style: this.floatingTextStyle });
    // eslint-disable-next-line no-magic-numbers
    txt.anchor.set(0.5);
    txt.x = x ?? (this.points.x - FLOAT_POP_OFFSET_X);
    txt.y = y ?? (this.points.y + FLOAT_POP_OFFSET_Y);
    // start slightly bigger for a pop effect
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    txt.scale.set(FLOAT_START_SCALE);
    this.floatingContainer.addChild(txt);

    // small pop back to normal
    void gsap.to(txt.scale, { x: 1, y: 1, duration: FLOAT_SCALE_BACK_DURATION });

    // float up and fade out
    void gsap.to(txt, {
      y: txt.y - FLOAT_UP_DISTANCE,
      alpha: 0,
      duration: FLOAT_POP_DURATION,
      ease: 'power1.out',
      onComplete: () => {
        txt.parent?.removeChild(txt);
        txt.destroy();
      },
    });
  }

  showBossWarning(): void {
    const warning = new Text({
      text: '⚠ BOSS APPROACHING ⚠',
      style: new TextStyle({
        fontFamily: 'Arial',
        fontSize: BOSS_WARNING_FONT_SIZE,
        fontWeight: 'bold',
        // eslint-disable-next-line no-magic-numbers
        fill: 0xff3333,
        stroke: {
          // eslint-disable-next-line no-magic-numbers
          color: 0x000000,
          width: BOSS_WARNING_STROKE_WIDTH,
        },
        align: 'center',
      }),
    });
    // eslint-disable-next-line no-magic-numbers
    warning.anchor.set(0.5);
    warning.x = this.application.screen.width / SCREEN_CENTER_DIVIDER;
    warning.y = this.application.screen.height / SCREEN_CENTER_DIVIDER;
    this.addToStage(warning);

    setTimeout(() => {
      void gsap.to(warning, {
        alpha: 0,
        duration: BOSS_WARNING_FADE_S,
        onComplete: () => {
          warning.parent?.removeChild(warning);
          warning.destroy();
        },
      });
    }, BOSS_WARNING_DISPLAY_MS);
  }

  /** Displays a golden "⚡ WAVE X ⚡" announcement and awards a coin bonus per wave. */
  showWaveAnnouncement(wave: number): void {
    const text = new Text({
      text: `⚡ WAVE ${wave} ⚡`,
      style: new TextStyle({
        fontFamily: 'Arial',
        fontSize: WAVE_ANNOUNCEMENT_FONT_SIZE,
        fontWeight: 'bold',
        // eslint-disable-next-line no-magic-numbers
        fill: 0xffdd00,
        stroke: {
          // eslint-disable-next-line no-magic-numbers
          color: 0x000000,
          width: WAVE_ANNOUNCEMENT_STROKE_WIDTH,
        },
        align: 'center',
      }),
    });
    // eslint-disable-next-line no-magic-numbers
    text.anchor.set(0.5);
    text.x = this.application.screen.width / SCREEN_CENTER_DIVIDER;
    text.y = this.application.screen.height / SCREEN_CENTER_DIVIDER - WAVE_ANNOUNCEMENT_Y_OFFSET;
    this.addToStage(text);

    setTimeout(() => {
      void gsap.to(text, {
        alpha: 0,
        duration: WAVE_ANNOUNCEMENT_FADE_S,
        onComplete: () => {
          text.parent?.removeChild(text);
          text.destroy();
        },
      });
    }, WAVE_ANNOUNCEMENT_DISPLAY_MS);
  }

  /** Briefly shakes the game stage to provide tactile damage feedback. */
  applyScreenShake(): void {
    const stage = this.application.stage;
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      gsap.killTweensOf(stage);
    } catch {}
    void gsap.fromTo(
      stage,
      { x: -SHAKE_AMPLITUDE },
      {
        x: SHAKE_AMPLITUDE,
        duration: SHAKE_STEP_DURATION_S,
        yoyo: true,
        repeat: SHAKE_REPEAT_COUNT,
        ease: 'power1.inOut',
        onComplete: () => {
          stage.x = 0;
        },
      },
    );
  }

  /** Shows a brief achievement-unlocked banner in the bottom-right corner. */
  showAchievementBanner(icon: string, titleLine: string, rewardLine: string): void {
    const banner = new Container();

    // Background panel
    const bg = new Graphics();
    bg.roundRect(0, 0, ACHIEVEMENT_BANNER_WIDTH, ACHIEVEMENT_BANNER_HEIGHT, ACHIEVEMENT_BANNER_RADIUS);
    bg.fill({ color: ACHIEVEMENT_BANNER_BG_COLOR });
    bg.stroke({ color: ACHIEVEMENT_BANNER_BORDER_COLOR, width: ACHIEVEMENT_BANNER_BORDER_WIDTH });
    banner.addChild(bg);

    // Icon + title text
    const titleText = new Text({
      text: `${icon} ${titleLine}`,
      style: new TextStyle({
        fontFamily: 'Arial',
        fontSize: ACHIEVEMENT_BANNER_TITLE_SIZE,
        fontWeight: 'bold',
        fill: ACHIEVEMENT_BANNER_BORDER_COLOR,
      }),
    });
    titleText.x = ACHIEVEMENT_BANNER_PADDING;
    titleText.y = ACHIEVEMENT_BANNER_PADDING;
    banner.addChild(titleText);

    // Reward sub-text
    const rewardText = new Text({
      text: rewardLine,
      style: new TextStyle({
        fontFamily: 'Arial',
        fontSize: ACHIEVEMENT_BANNER_FONT_SIZE,
        fill: 0xcccccc,
      }),
    });
    rewardText.x = ACHIEVEMENT_BANNER_PADDING;
    rewardText.y = ACHIEVEMENT_BANNER_PADDING + ACHIEVEMENT_BANNER_TITLE_SIZE + ACHIEVEMENT_BANNER_SUBTITLE_SPACER;
    banner.addChild(rewardText);

    // Position: slide in from right, bottom area
    const screenWidth = this.application.screen.width;
    const screenHeight = this.application.screen.height;
    banner.x = screenWidth;
    banner.y = screenHeight - ACHIEVEMENT_BANNER_HEIGHT - ACHIEVEMENT_BANNER_PADDING * DOUBLE;
    this.addToStage(banner);

    // Slide in
    void gsap.to(banner, {
      x: screenWidth - ACHIEVEMENT_BANNER_WIDTH - ACHIEVEMENT_BANNER_PADDING,
      duration: ACHIEVEMENT_BANNER_SLIDE_DURATION,
      ease: 'back.out',
      onComplete: () => {
        // Hold, then fade out
        setTimeout(() => {
          void gsap.to(banner, {
            alpha: 0,
            duration: ACHIEVEMENT_BANNER_FADE_DURATION,
            ease: 'power1.out',
            onComplete: () => {
              banner.parent?.removeChild(banner);
              banner.destroy({ children: true });
            },
          });
        }, ACHIEVEMENT_BANNER_SHOW_MS);
      },
    });
  }
}
