import { TranslationKey } from '../i18n/translations';
import { ShipType } from './pixijs/ship-type.enum';

export enum ShipUpgradeType {
  hull = 'hull',
  cannons = 'cannons',
  targeting = 'targeting',
  engines = 'engines',
  warhead = 'warhead',
}

export interface ShipUpgradeBonus {
  energy?: number;
  shotPower?: number;
  shotSpeed?: number;
}

export interface ShipUpgradeDefinition {
  type: ShipUpgradeType;
  titleKey: TranslationKey;
  descriptionKey: TranslationKey;
  baseCost: number;
  costMultiplier: number;
  maxLevel: number;
  bonusPerLevel: ShipUpgradeBonus;
  appliesTo: ShipType;
}

export type ShipUpgradeLevels = Record<ShipUpgradeType, number>;

export const SHIP_UPGRADE_DEFINITIONS: ShipUpgradeDefinition[] = [
  {
    type: ShipUpgradeType.hull,
    titleKey: 'shipUpgrade.hull.title',
    descriptionKey: 'shipUpgrade.hull.description',
    baseCost: 50,
    costMultiplier: 1.5,
    maxLevel: 10,
    bonusPerLevel: {
      energy: 1,
    },
    appliesTo: ShipType.ship,
  },
  {
    type: ShipUpgradeType.cannons,
    titleKey: 'shipUpgrade.cannons.title',
    descriptionKey: 'shipUpgrade.cannons.description',
    baseCost: 80,
    costMultiplier: 1.6,
    maxLevel: 6,
    bonusPerLevel: {
      shotPower: 1,
    },
    appliesTo: ShipType.ship,
  },
  {
    type: ShipUpgradeType.targeting,
    titleKey: 'shipUpgrade.targeting.title',
    descriptionKey: 'shipUpgrade.targeting.description',
    baseCost: 60,
    costMultiplier: 1.5,
    maxLevel: 8,
    bonusPerLevel: {
      shotSpeed: 0.3,
    },
    appliesTo: ShipType.ship,
  },
  {
    type: ShipUpgradeType.engines,
    titleKey: 'shipUpgrade.engines.title',
    descriptionKey: 'shipUpgrade.engines.description',
    baseCost: 85,
    costMultiplier: 1.6,
    maxLevel: 8,
    bonusPerLevel: {
      shotSpeed: 0.3,
      energy: 1,
    },
    appliesTo: ShipType.ship,
  },
  {
    type: ShipUpgradeType.warhead,
    titleKey: 'shipUpgrade.warhead.title',
    descriptionKey: 'shipUpgrade.warhead.description',
    baseCost: 130,
    costMultiplier: 1.8,
    maxLevel: 5,
    bonusPerLevel: {
      shotPower: 1,
      shotSpeed: 0.2,
    },
    appliesTo: ShipType.ship,
  },
];

export const SHIP_UPGRADE_TYPES = Object.freeze(
  SHIP_UPGRADE_DEFINITIONS.map((definition) => definition.type),
);

export const DEFAULT_SHIP_UPGRADE_LEVELS: ShipUpgradeLevels = {
  [ShipUpgradeType.hull]: 0,
  [ShipUpgradeType.cannons]: 0,
  [ShipUpgradeType.targeting]: 0,
  [ShipUpgradeType.engines]: 0,
  [ShipUpgradeType.warhead]: 0,
};
