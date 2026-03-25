import { inject, Injectable } from '@angular/core';
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

@Injectable()
export class GameScreenService extends UpdatableService {
  readonly #ship = inject(GameShipService);

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
    // eslint-disable-next-line no-magic-numbers
    this.lifesLabel!.width = value * 10;
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
    this.lifesLabel.x = HEADER_SIDE_PADDING;
    this.lifesLabel.y = HEADER_TOP_PADDING + HEADER_LINE_SPACING * TRIPPLE;
    energyBarContainer.addChild(this.lifesLabel);
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
}
