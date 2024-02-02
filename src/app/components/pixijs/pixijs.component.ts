import { Component, ElementRef, NgZone, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-pixijs',
  standalone: true,
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
  ],
})
export class PixijsComponent implements OnInit {
  constructor(
    private readonly elementRef: ElementRef,
    private readonly ngZone: NgZone,
    private readonly pixiGame: GameService,
    application: ApplicationService,
  ) {
    application.init(this.elementRef);
  }

  async ngOnInit(): Promise<void> {
    await this.ngZone.runOutsideAngular(() => this.pixiGame.init());
  }
}
