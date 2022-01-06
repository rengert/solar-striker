import { Component, ElementRef, NgZone, OnInit } from '@angular/core';
import { AnimatedSprite, Application, Sprite, Texture } from 'pixi.js';

@Component({
  selector: 'app-pixijs',
  templateUrl: './pixijs.component.html',
  styleUrls: ['./pixijs.component.scss'],
})
export class PixijsComponent implements OnInit {
  private app!: Application;
  private enemies: Sprite[] = [];

  constructor(private readonly elementRef: ElementRef, private readonly ngZone: NgZone) {
  }

  ngOnInit(): void {
    this.ngZone.runOutsideAngular(() => {
      this.app = new Application({
        height: this.elementRef.nativeElement.clientHeight,
        width: this.elementRef.nativeElement.clientWidth,
        backgroundColor: 0x1099bb,
      });
      this.app.loader
        .add('assets/enemy.json')
        .load(() => this.setup());
    });
    this.elementRef.nativeElement.appendChild(this.app.view);
  }

  private setup() {
    const app = this.app;
    const enemyTexture = Texture.from('assets/enemy-big.png');
    const enemyAnimation = app.loader.resources['assets/enemy.json'].spritesheet !;
    let eleapsed = 0;
    let lastEnemySpawn = -1;
    app.ticker.add(delta => {
      eleapsed += delta;
      // move enemies
      this.enemies.forEach(enemy => {
        enemy.y += delta * 1;
      });
      // spawn enemy
      const enemySpawnCheck = Math.floor(eleapsed);
      if (enemySpawnCheck % 250 === 0 && enemySpawnCheck !== lastEnemySpawn) {
        lastEnemySpawn = enemySpawnCheck;
        console.log(enemyAnimation);
        // @ts-ignore
        const bunny = new AnimatedSprite(enemyAnimation.animations['frame']);
        bunny.animationSpeed = 0.167;
        bunny.play();
        bunny.anchor.set(0.5);
        bunny.x = eleapsed % (this.elementRef.nativeElement.clientWidth - 100) + 25;
        bunny.y = 10;
        this.enemies.push(bunny);
        app.stage.addChild(bunny);
      }
    });
  }
}



