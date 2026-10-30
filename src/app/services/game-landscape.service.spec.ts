import { TestBed } from '@angular/core/testing';
import { Container } from 'pixi.js';
import { ApplicationService } from './application.service';
import { GameLandscapeService } from './game-landscape.service';
import { ParticleService } from './particle.service';

const NEBULA_STAGE = 2;

describe('GameLandscapeService - stage themes', () => {
  let service: GameLandscapeService;
  let stage: Container;

  beforeEach(() => {
    stage = new Container();
    TestBed.configureTestingModule({
      providers: [
        GameLandscapeService,
        // eslint-disable-next-line no-magic-numbers
        { provide: ApplicationService, useValue: { stage, screen: { width: 200, height: 300 } } },
        { provide: ParticleService, useValue: { layer: new Container() } },
      ],
    });
    service = TestBed.inject(GameLandscapeService);
  });

  function getThemes(): Container[] {
    return (service as unknown as { themes: Container[] }).themes;
  }

  it('should show the theme of the stage it was set to before setup', () => {
    service.setStage(NEBULA_STAGE);
    service.setup();

    expect(getThemes().map((theme) => theme.visible)).toEqual([false, true, false, false]);
  });

  it('should cycle through the four themes and put the new one right below the old one', () => {
    service.setup();
    const [desert, nebula] = getThemes();

    service.setStage(NEBULA_STAGE);

    expect(nebula.visible).toBeTrue();
    expect(stage.getChildIndex(nebula)).toBe(stage.getChildIndex(desert) - 1);

    // eslint-disable-next-line no-magic-numbers
    service.setStage(5);
    expect(getThemes()[0].visible).toBeTrue();
  });
});
