import { Component, ElementRef, inject, NgZone } from '@angular/core';
import { SplashScreen } from '@capacitor/splash-screen';
import { ApplicationService } from '../../services/application.service';
import { ExplosionService } from '../../services/explosion.service';
import { GameCollectableService } from '../../services/game-collectable.service';
import { GameEnemyService } from '../../services/game-enemy.service';
import { GameLandscapeService } from '../../services/game-landscape.service';
import { GameBaseService } from '../../services/game-base.service';
import { GameMeteorService } from '../../services/game-meteor.service';
import { GameScreenService } from '../../services/game-screen.service';
import { GameShipService } from '../../services/game-ship.service';
import { GameShotService } from '../../services/game-shot.service';
import { GameService } from '../../services/game.service';
import { ObjectService } from '../../services/object.service';
import { ParticleService } from '../../services/particle.service';
import { PlayerShipService } from '../../services/player-ship.service';
import { ShipUpgradeService } from '../../services/ship-upgrade.service';

@Component({
  selector: 'app-pixijs',
  template: '',
  providers: [
    ApplicationService,
    GameBaseService,
    GameCollectableService,
    GameEnemyService,
    GameLandscapeService,
    GameMeteorService,
    GameScreenService,
    GameShotService,
    GameShipService,
    ShipUpgradeService,
    PlayerShipService,
    ExplosionService,
    ParticleService,
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
    const renderer = application.init(elementRef);
    // after init() registered the asset aliases, so the downloads run alongside the renderer setup; init() awaits them
    pixiGame.loadAssets().catch(() => undefined);
    void renderer
      .then(() => ngZone.runOutsideAngular(() => pixiGame.init()))
      .then(
        // Keep the native splash / inline loader up until the menu is drawn, so the start never shows a black screen.
        () => document.getElementById('boot-loader')?.remove(),
        (error: unknown) => {
          // eslint-disable-next-line no-console
          console.error(error);
          // e.g. no WebGL or a failed asset download: tell the player instead of leaving a black screen
          document.getElementById('boot-loader')?.classList.add('boot-failed');
        },
      )
      .finally(() => void SplashScreen.hide());
  }
}
