import { ShipType } from './pixijs/ship-type.enum';

export enum ShipUpgradeType {
  hull = 'hull',
  cannons = 'cannons',
  targeting = 'targeting',
}

export interface ShipUpgradeBonus {
  energy?: number;
  shotPower?: number;
  shotSpeed?: number;
}

export interface ShipUpgradeDefinition {
  type: ShipUpgradeType;
  title: string;
  description: string;
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
    title: 'Rumpfverstärkung',
    description: 'Erhöht die maximale Energie',
    baseCost: 50,
    costMultiplier: 1.6,
    maxLevel: 5,
    bonusPerLevel: {
      energy: 1,
    },
    appliesTo: ShipType.ship,
  },
  {
    type: ShipUpgradeType.cannons,
    title: 'Zwillingsgeschütz',
    description: 'Erhöht die Feuerkraft',
    baseCost: 80,
    costMultiplier: 1.7,
    maxLevel: 2,
    bonusPerLevel: {
      shotPower: 1,
    },
    appliesTo: ShipType.ship,
  },
  {
    type: ShipUpgradeType.targeting,
    title: 'Feuerleitcomputer',
    description: 'Erhöht die Schussfrequenz',
    baseCost: 60,
    costMultiplier: 1.5,
    maxLevel: 3,
    bonusPerLevel: {
      shotSpeed: 0.3,
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
};
