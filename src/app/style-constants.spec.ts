import { icons } from './style-constants';

// glyphs kept in src/assets/fonts/fa-solid-subset.woff2, see the command in styles.scss
const SUBSET_ICONS = ['', '', '', '', '', ''];

describe('icons', () => {
  it('only uses glyphs contained in the subset icon font', () => {
    expect(Object.values(icons).filter((icon) => !SUBSET_ICONS.includes(icon))).toEqual([]);
  });
});
