import { TestBed } from '@angular/core/testing';
import { Container, Ticker } from 'pixi.js';
import { ApplicationService } from './application.service';
import { GameScreenService } from './game-screen.service';
import { GameShipService } from './game-ship.service';

const TICK_MS = 1000;
// longer than any radio line stays up
const LONG_TICK_MS = 60_000;

describe('GameScreenService radio messages', () => {
  let service: GameScreenService;
  let hideSpy: jasmine.Spy;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        GameScreenService,
        { provide: ApplicationService, useValue: { stage: new Container(), screen: { width: 390, height: 780 } } },
        { provide: GameShipService, useValue: { instance: { energy: 10 } } },
      ],
    });
    service = TestBed.inject(GameScreenService);
    hideSpy = spyOn(service as unknown as { hideRadioBanner: () => void }, 'hideRadioBanner');
  });

  afterEach(() => service.clearRadioMessages());

  it('should count the display time down on game ticks only, so a pause does not use it up', () => {
    service.showRadioMessages([{ speaker: 'vega', text: 'story.chapter.1.intro.1' }]);

    service.update({ deltaMS: TICK_MS } as Ticker);
    expect(hideSpy).not.toHaveBeenCalled();

    service.update({ deltaMS: LONG_TICK_MS } as Ticker);
    expect(hideSpy).toHaveBeenCalledTimes(1);
  });
});
