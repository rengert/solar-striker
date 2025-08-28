import { Component, ElementRef, inject, NgZone } from '@angular/core';
import { ApplicationService } from '../../services/application.service';
import { ExplosionService } from '../../services/explosion.service';
import { GameCollectableService } from '../../services/game-collectable.service';
import { GameEnemyService } from '../../services/game-enemy.service';
import { GameLandscapeService } from '../../services/game-landscape.service';
import { GameMeteorService } from '../../services/game-meteor.service';
import { GameScreenService } from '../../services/game-screen.service';
import { GameShipService } from '../../services/game-ship.service';
import { GameShotService } from '../../services/game-shot.service';
import { GameService } from '../../services/game.service';
import { ObjectService } from '../../services/object.service';

@Component({
  selector: 'app-pixijs',
  template: '',
  providers: [
    ApplicationService,
    GameCollectableService,
    GameEnemyService,
    GameLandscapeService,
    GameMeteorService,
    GameScreenService,
    GameShotService,
    GameShipService,
    ExplosionService,
    GameService,
    ObjectService,
  ],
})
export class PixijsComponent {
  constructor() {
    const application = inject(ApplicationService);
    const elementRef = inject(ElementRef);
    const ngZone = inject(NgZone);
    const pixiGame = inject(GameService);
    void application.init(elementRef).then(() => ngZone.runOutsideAngular(() => pixiGame.init()));
  }
}
