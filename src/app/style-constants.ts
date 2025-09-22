import { TextStyle } from 'pixi.js';

export const icons = {
  coin: '\uf51e',
  points: '\uf54c',
  life: '\uf004',
  level: '\uf007',
};

export const textStyle = new TextStyle({
  fontFamily: 'Arial',
  fontSize: 12,
  fontStyle: 'normal',
  fontWeight: 'bold',
  fill: '#ffffff',
  stroke: {
    color: '#4a1850',
    width: 2,
  },
  align: 'right',
});

export const fontAwesomeStyle = new TextStyle({
  fontFamily: 'Font Awesome 6 Free', // solid/regular
  fontWeight: '900', // 900 for solid, 400 for regular/brands
  fontSize: 10, // any size you like
  fill: 0xffffff,
});
