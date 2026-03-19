import { TestBed } from '@angular/core/testing';
import { ObjectModelType, ObjectService } from './object.service';
import { ApplicationService } from './application.service';
import { ObjectType } from '../models/pixijs/object-type.enum';
import { GameShotService } from './game-shot.service';
import { ExplosionService } from './explosion.service';
import { OFF_SCREEN_BUFFER } from '../game-constants';

const SCREEN_HEIGHT = 600;

function createMockRocket(y: number): ObjectModelType {
  const rocket: Record<string, unknown> = {
    type: ObjectType.rocket,
    destroying: false,
    destroyed: false,
    reference: undefined,
    energy: 1,
    power: 1,
    y,
    destroy: jasmine.createSpy('destroy').and.callFake(() => {
      rocket['destroyed'] = true;
    }),
  };
  return rocket as unknown as ObjectModelType;
}

describe('GameShotService - update (off-screen cleanup)', () => {
  let objectService: ObjectService;
  let gameShotService: GameShotService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ObjectService,
        GameShotService,
        {
          provide: ApplicationService,
          useValue: {
            stage: { addChild: jasmine.createSpy('addChild') },
            screen: { height: SCREEN_HEIGHT },
            ticker: {
              add: jasmine.createSpy('add'),
              remove: jasmine.createSpy('remove'),
            },
          },
        },
        {
          provide: ExplosionService,
          useValue: {},
        },
      ],
    });

    objectService = TestBed.inject(ObjectService);
    gameShotService = TestBed.inject(GameShotService);
  });

  it('should destroy a rocket that has flown above the screen (y < -OFF_SCREEN_BUFFER)', () => {
    const rocket = createMockRocket(-(OFF_SCREEN_BUFFER + 1));
    objectService.add(rocket as never);

    gameShotService.update();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((rocket as any).destroy).toHaveBeenCalled();
  });

  it('should destroy a rocket that has flown below the screen (y > screenHeight + OFF_SCREEN_BUFFER)', () => {
    const rocket = createMockRocket(SCREEN_HEIGHT + OFF_SCREEN_BUFFER + 1);
    objectService.add(rocket as never);

    gameShotService.update();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((rocket as any).destroy).toHaveBeenCalled();
  });

  it('should NOT destroy a rocket that is still on-screen', () => {
    // eslint-disable-next-line no-magic-numbers
    const rocket = createMockRocket(300);
    objectService.add(rocket as never);

    gameShotService.update();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((rocket as any).destroy).not.toHaveBeenCalled();
  });

  it('should NOT destroy rockets exactly at the boundary (y === -OFF_SCREEN_BUFFER and y === screenHeight + OFF_SCREEN_BUFFER)', () => {
    const rocketAtTop = createMockRocket(-OFF_SCREEN_BUFFER);
    const rocketAtBottom = createMockRocket(SCREEN_HEIGHT + OFF_SCREEN_BUFFER);
    objectService.add(rocketAtTop as never);
    objectService.add(rocketAtBottom as never);

    gameShotService.update();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((rocketAtTop as any).destroy).not.toHaveBeenCalled();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((rocketAtBottom as any).destroy).not.toHaveBeenCalled();
  });

  it('should destroy all off-screen rockets and leave on-screen ones intact in a single update call', () => {
    const rocketAbove = createMockRocket(-(OFF_SCREEN_BUFFER + 1));
    const rocketBelow = createMockRocket(SCREEN_HEIGHT + OFF_SCREEN_BUFFER + 1);
    // eslint-disable-next-line no-magic-numbers
    const rocketOnScreen = createMockRocket(300);
    objectService.add(rocketAbove as never);
    objectService.add(rocketBelow as never);
    objectService.add(rocketOnScreen as never);

    gameShotService.update();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((rocketAbove as any).destroy).toHaveBeenCalled();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((rocketBelow as any).destroy).toHaveBeenCalled();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((rocketOnScreen as any).destroy).not.toHaveBeenCalled();
  });
});
