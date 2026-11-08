import { TranslationKey } from '../i18n/translations';

export enum PlayerShipClass {
  fighter = 'fighter',
  scout = 'scout',
  gunship = 'gunship',
  interceptor = 'interceptor',
  titan = 'titan',
  hornet = 'hornet',
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
  /** Every volley adds two diagonal shots, like a permanent spread-shot power-up. */
  spreadShot?: boolean;
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
  {
    type: PlayerShipClass.interceptor,
    titleKey: 'ship.interceptor.title',
    descriptionKey: 'ship.interceptor.description',
    cost: 400,
    // eslint-disable-next-line no-magic-numbers
    tint: 0x66ff99,
    xSpeed: 1.8,
    rocketSpeed: 3.5,
    shotSpeed: 4.5,
    shotPower: 1,
    energy: 5,
  },
  {
    type: PlayerShipClass.titan,
    titleKey: 'ship.titan.title',
    descriptionKey: 'ship.titan.description',
    cost: 600,
    // eslint-disable-next-line no-magic-numbers
    tint: 0xff7766,
    xSpeed: 0.5,
    rocketSpeed: 1.8,
    shotSpeed: 1.0,
    shotPower: 3,
    energy: 24,
  },
  {
    type: PlayerShipClass.hornet,
    titleKey: 'ship.hornet.title',
    descriptionKey: 'ship.hornet.description',
    cost: 800,
    // eslint-disable-next-line no-magic-numbers
    tint: 0xcc88ff,
    xSpeed: 1.1,
    rocketSpeed: 2.5,
    shotSpeed: 1.6,
    shotPower: 1,
    energy: 8,
    spreadShot: true,
  },
];

export const DEFAULT_PLAYER_SHIP_CLASS = PlayerShipClass.fighter;
