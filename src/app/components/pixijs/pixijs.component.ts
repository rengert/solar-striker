import { Component, ElementRef, NgZone, OnInit } from '@angular/core';
import { PixiGameService } from '../../services/pixi-game.service';

@Component({
  selector: 'app-pixijs',
  templateUrl: './pixijs.component.html',
  styleUrls: ['./pixijs.component.scss'],
  providers: [PixiGameService],
})
export class PixijsComponent implements OnInit {
  constructor(
    private readonly elementRef: ElementRef,
    private readonly ngZone: NgZone,
    private readonly pixiGame: PixiGameService,
  ) {
  }

  ngOnInit(): Promise<void> {
    return this.ngZone.runOutsideAngular(async() => {
      await this.pixiGame.init(this.elementRef);
    });
  }
}
