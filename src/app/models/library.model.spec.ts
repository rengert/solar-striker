import { SUPPORTED_LANGUAGES, TRANSLATIONS } from '../i18n/translations';
import { LIBRARY_ENEMIES, LIBRARY_POWER_UPS } from './library.model';

describe('library entries', () => {
  const keys = [
    ...LIBRARY_POWER_UPS.map((type) => `library.powerUp.${type}`),
    ...LIBRARY_ENEMIES.map(({ id }) => `library.enemy.${id}`),
  ].flatMap((key) => [`${key}.title`, `${key}.description`]);

  SUPPORTED_LANGUAGES.forEach((language) => {
    it(`should have a title and description for every entry in ${language}`, () => {
      const missing = keys.filter((key) => !(key in TRANSLATIONS[language]));
      expect(missing).toEqual([]);
    });
  });
});
