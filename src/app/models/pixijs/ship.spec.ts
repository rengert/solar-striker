/* eslint-disable no-magic-numbers */
import { Texture } from 'pixi.js';
import { ExplosionService } from '../../services/explosion.service';
import { GameShotService } from '../../services/game-shot.service';
import { Ship } from './ship';
import { ShipType } from './ship-type.enum';

describe('Ship spread shot', () => {
  let shotService: jasmine.SpyObj<GameShotService>;
  let ship: Ship;

  beforeEach(() => {
    shotService = jasmine.createSpyObj<GameShotService>('GameShotService', ['shot', 'fireSpread']);
    ship = new Ship(ShipType.ship, shotService, null as unknown as ExplosionService, 0, [Texture.EMPTY]);
  });

  it('fires no spread without power-up or trait', () => {
    ship.shot();
    expect(shotService.fireSpread).not.toHaveBeenCalled();
  });

  it('fires two diagonal shots from the power-up', () => {
    ship.spreadShotTicks = 1000;
    ship.shot();
    expect(shotService.fireSpread).toHaveBeenCalledOnceWith(ship, 2);
  });

  it('fires two diagonal shots from the ship trait alone', () => {
    ship.permanentSpread = true;
    ship.shot();
    expect(shotService.fireSpread).toHaveBeenCalledOnceWith(ship, 2);
  });

  it('doubles the fan when the trait ship picks up the power-up', () => {
    ship.permanentSpread = true;
    ship.spreadShotTicks = 1000;
    ship.shot();
    expect(shotService.fireSpread).toHaveBeenCalledOnceWith(ship, 4);
  });
});
