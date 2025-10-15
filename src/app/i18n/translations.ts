/* eslint-disable @typescript-eslint/naming-convention */
export const SUPPORTED_LANGUAGES = ['de', 'en', 'fr'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: SupportedLanguage = 'de';

const baseTranslation = {
  'app.title': 'Solarstriker',
  'app.version': 'Version. {{version}}',
  'navigation.start': 'Spiel starten!',
  'navigation.hangar': 'Hangar',
  'navigation.highscore': 'Highscore',
  'navigation.credits': 'Credits',
  'common.close': 'Schließen!',
  'common.back': 'Zurück',
  'hangar.title': 'Hangar',
  'hangar.upgrade': 'Verbessern',
  'hangar.level': 'Stufe {{level}} / {{max}}',
  'hangar.maxLevel': 'Maximal ausgebaut',
  'hangar.cost': 'Kosten: {{cost}}',
  'hangar.costInsufficient': 'Kosten: {{cost}} – zu wenig Münzen',
  'shipUpgrade.hull.title': 'Rumpfverstärkung',
  'shipUpgrade.hull.description': 'Erhöht die maximale Energie',
  'shipUpgrade.cannons.title': 'Zwillingsgeschütz',
  'shipUpgrade.cannons.description': 'Erhöht die Feuerkraft',
  'shipUpgrade.targeting.title': 'Feuerleitcomputer',
  'shipUpgrade.targeting.description': 'Erhöht die Schussfrequenz',
  'credits.title': 'Credits',
  'credits.ideaProgramming': 'Idee & Programmierung',
  'credits.authorName': 'Thomas Renger',
  'credits.graphics': 'Grafiken',
  'credits.artAttribution': 'Kenney (www.kenney.nl)',
  'highscore.title': 'Highscore',
  'highscore.date': 'Datum',
  'highscore.kills': 'Kills',
  'highscore.level': 'Level',
  'youAreDead.title': 'Game Over',
  'youAreDead.subtitle': 'Du bist gestorben',
  'youAreDead.message': 'Du bist leider unterlegen\nund der Kampf ist vorbei',
  'youAreDead.points': 'Punkte',
  'youAreDead.sessionCoins': 'Münzen in dieser Session',
} as const;

export type TranslationKey = keyof typeof baseTranslation;
export type TranslationDictionary = Record<TranslationKey, string>;

export const TRANSLATIONS: Record<SupportedLanguage, TranslationDictionary> = {
  de: baseTranslation,
  en: {
    'app.title': 'Solar Striker',
    'app.version': 'Version {{version}}',
    'navigation.start': 'Start game!',
    'navigation.hangar': 'Hangar',
    'navigation.highscore': 'High score',
    'navigation.credits': 'Credits',
    'common.close': 'Close',
    'common.back': 'Back',
    'hangar.title': 'Hangar',
    'hangar.upgrade': 'Upgrade',
    'hangar.level': 'Level {{level}} / {{max}}',
    'hangar.maxLevel': 'Fully upgraded',
    'hangar.cost': 'Cost: {{cost}}',
    'hangar.costInsufficient': 'Cost: {{cost}} – not enough coins',
    'shipUpgrade.hull.title': 'Hull reinforcement',
    'shipUpgrade.hull.description': 'Increases maximum energy',
    'shipUpgrade.cannons.title': 'Twin cannons',
    'shipUpgrade.cannons.description': 'Increases firepower',
    'shipUpgrade.targeting.title': 'Targeting computer',
    'shipUpgrade.targeting.description': 'Increases rate of fire',
    'credits.title': 'Credits',
    'credits.ideaProgramming': 'Idea & programming',
    'credits.authorName': 'Thomas Renger',
    'credits.graphics': 'Graphics',
    'credits.artAttribution': 'Kenney (www.kenney.nl)',
    'highscore.title': 'High score',
    'highscore.date': 'Date',
    'highscore.kills': 'Kills',
    'highscore.level': 'Level',
    'youAreDead.title': 'Game over',
    'youAreDead.subtitle': 'You have fallen',
    'youAreDead.message': 'You were defeated\nand the battle is over',
    'youAreDead.points': 'Points',
    'youAreDead.sessionCoins': 'Coins in this session',
  } satisfies TranslationDictionary,
  fr: {
    'app.title': 'Solar Striker',
    'app.version': 'Version {{version}}',
    'navigation.start': 'Commencer la partie',
    'navigation.hangar': 'Hangar',
    'navigation.highscore': 'Meilleur score',
    'navigation.credits': 'Crédits',
    'common.close': 'Fermer',
    'common.back': 'Retour',
    'hangar.title': 'Hangar',
    'hangar.upgrade': 'Améliorer',
    'hangar.level': 'Niveau {{level}} / {{max}}',
    'hangar.maxLevel': 'Amélioration maximale atteinte',
    'hangar.cost': 'Coût : {{cost}}',
    'hangar.costInsufficient': 'Coût : {{cost}} – pièces insuffisantes',
    'shipUpgrade.hull.title': 'Renforcement de la coque',
    'shipUpgrade.hull.description': "Augmente l'énergie maximale",
    'shipUpgrade.cannons.title': 'Canons jumelés',
    'shipUpgrade.cannons.description': 'Augmente la puissance de feu',
    'shipUpgrade.targeting.title': 'Ordinateur de tir',
    'shipUpgrade.targeting.description': 'Augmente la cadence de tir',
    'credits.title': 'Crédits',
    'credits.ideaProgramming': 'Idée & programmation',
    'credits.authorName': 'Thomas Renger',
    'credits.graphics': 'Graphismes',
    'credits.artAttribution': 'Kenney (www.kenney.nl)',
    'highscore.title': 'Meilleur score',
    'highscore.date': 'Date',
    'highscore.kills': 'Éliminations',
    'highscore.level': 'Niveau',
    'youAreDead.title': 'Fin de partie',
    'youAreDead.subtitle': 'Vous êtes tombé',
    'youAreDead.message': 'Vous avez été vaincu\net la bataille est terminée',
    'youAreDead.points': 'Points',
    'youAreDead.sessionCoins': 'Pièces de cette session',
  } satisfies TranslationDictionary,
};

const LANGUAGE_TO_LOCALE: Record<SupportedLanguage, string> = {
  de: 'de-DE',
  en: 'en-US',
  fr: 'fr-FR',
};

export function getLocale(language: SupportedLanguage): string {
  return LANGUAGE_TO_LOCALE[language];
}

export function resolveLanguage(): SupportedLanguage {
  if (typeof navigator === 'undefined') {
    return DEFAULT_LANGUAGE;
  }

  let detected: string | undefined;

  if (Array.isArray(navigator.languages) && navigator.languages.length > 0) {
    [detected] = navigator.languages;
  }

  if (!detected) {
    detected = navigator.language;
  }

  if (!detected) {
    return DEFAULT_LANGUAGE;
  }

  const normalized = detected.toLowerCase().split('-')[0];
  const supported = SUPPORTED_LANGUAGES.find((language) => language === normalized);
  return supported ?? DEFAULT_LANGUAGE;
}
