import { TestBed } from '@angular/core/testing';
import { SoundService } from './sound.service';

describe('SoundService', () => {
  let service: SoundService;

  beforeEach(() => {
    localStorage.removeItem('sound-muted');
    service = TestBed.inject(SoundService);
  });

  afterEach(() => {
    service.stopMusic();
    localStorage.removeItem('sound-muted');
  });

  it('should remember the muted setting', () => {
    service.muted = true;

    expect(localStorage.getItem('sound-muted')).toBe('true');
    expect(new SoundService().muted).toBeTrue();
  });

  it('should play every effect and start and stop music without throwing', () => {
    expect(() => {
      (['laser', 'explosion', 'bigExplosion', 'hit', 'powerUp'] as const).forEach((effect) => service.play(effect));
      service.startMusic();
      service.stopMusic();
    }).not.toThrow();
  });
});
