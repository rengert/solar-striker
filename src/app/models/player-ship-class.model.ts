import { TranslationKey } from '../i18n/translations';

export enum PlayerShipClass {
  fighter = 'fighter',
  scout = 'scout',
  gunship = 'gunship',
}

export interface PlayerShipDefinition {
  type: PlayerShipClass;
  titleKey: TranslationKey;
  descriptionKey: TranslationKey;
  cost: number;
  // eslint-disable-next-line no-magic-numbers
  tint: number;
  xSpeed: number;
  rocketSpeed: number;
  shotSpeed: number;
  shotPower: number;
  energy: number;
}

export const PLAYER_SHIP_DEFINITIONS: PlayerShipDefinition[] = [
  {
    type: PlayerShipClass.fighter,
    titleKey: 'ship.fighter.title',
    descriptionKey: 'ship.fighter.description',
    cost: 0,
    // eslint-disable-next-line no-magic-numbers
    tint: 0xffffff,
    xSpeed: 1.0,
    rocketSpeed: 2.5,
    shotSpeed: 2.0,
    shotPower: 1,
    energy: 10,
  },
  {
    type: PlayerShipClass.scout,
    titleKey: 'ship.scout.title',
    descriptionKey: 'ship.scout.description',
    cost: 150,
    // eslint-disable-next-line no-magic-numbers
    tint: 0x88ddff,
    xSpeed: 1.4,
    rocketSpeed: 3.0,
    shotSpeed: 3.5,
    shotPower: 1,
    energy: 7,
  },
  {
    type: PlayerShipClass.gunship,
    titleKey: 'ship.gunship.title',
    descriptionKey: 'ship.gunship.description',
    cost: 250,
    // eslint-disable-next-line no-magic-numbers
    tint: 0xffcc44,
    xSpeed: 0.7,
    rocketSpeed: 2.0,
    shotSpeed: 1.5,
    shotPower: 2,
    energy: 16,
  },
];

export const DEFAULT_PLAYER_SHIP_CLASS = PlayerShipClass.fighter;
