import { TranslationKey } from '../i18n/translations';
import { ShipType } from './pixijs/ship-type.enum';

export enum ShipUpgradeType {
  hull = 'hull',
  cannons = 'cannons',
  targeting = 'targeting',
  engines = 'engines',
  warhead = 'warhead',
  magnet = 'magnet',
  shield = 'shield',
}

/** Column of the hangar skill tree. */
export enum ShipUpgradeBranch {
  weapons = 'weapons',
  armor = 'armor',
  tech = 'tech',
}

export interface ShipUpgradeBonus {
  energy?: number;
  shotPower?: number;
  shotSpeed?: number;
  /** Extra milliseconds every shield power-up lasts. */
  shieldMs?: number;
  /** Distance in px from which power-ups are pulled to the ship. */
  magnetRange?: number;
}

export interface ShipUpgradeRequirement {
  type: ShipUpgradeType;
  level: number;
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
  branch: ShipUpgradeBranch;
  /** Node above this one in the skill tree; it must reach the level before this one can be bought. */
  requires?: ShipUpgradeRequirement;
}

export type ShipUpgradeLevels = Record<ShipUpgradeType, number>;

// order matters: within a branch each node is drawn below the previous one
export const SHIP_UPGRADE_DEFINITIONS: ShipUpgradeDefinition[] = [
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
    branch: ShipUpgradeBranch.weapons,
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
    branch: ShipUpgradeBranch.weapons,
    requires: { type: ShipUpgradeType.targeting, level: 2 },
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
    branch: ShipUpgradeBranch.weapons,
    requires: { type: ShipUpgradeType.cannons, level: 3 },
  },
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
    branch: ShipUpgradeBranch.armor,
  },
  {
    type: ShipUpgradeType.engines,
    titleKey: 'shipUpgrade.engines.title',
    descriptionKey: 'shipUpgrade.engines.description',
    baseCost: 85,
    costMultiplier: 1.6,
    maxLevel: 8,
    bonusPerLevel: {
      shotSpeed: 0.2,
      energy: 1,
    },
    appliesTo: ShipType.ship,
    branch: ShipUpgradeBranch.armor,
    requires: { type: ShipUpgradeType.hull, level: 2 },
  },
  {
    type: ShipUpgradeType.magnet,
    titleKey: 'shipUpgrade.magnet.title',
    descriptionKey: 'shipUpgrade.magnet.description',
    baseCost: 60,
    costMultiplier: 1.5,
    maxLevel: 5,
    bonusPerLevel: {
      magnetRange: 30,
    },
    appliesTo: ShipType.ship,
    branch: ShipUpgradeBranch.tech,
  },
  {
    type: ShipUpgradeType.shield,
    titleKey: 'shipUpgrade.shield.title',
    descriptionKey: 'shipUpgrade.shield.description',
    baseCost: 90,
    costMultiplier: 1.6,
    maxLevel: 5,
    bonusPerLevel: {
      shieldMs: 1000,
    },
    appliesTo: ShipType.ship,
    branch: ShipUpgradeBranch.tech,
    requires: { type: ShipUpgradeType.magnet, level: 2 },
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
  [ShipUpgradeType.magnet]: 0,
  [ShipUpgradeType.shield]: 0,
};
