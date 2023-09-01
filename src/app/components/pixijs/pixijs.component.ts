import { Component, ElementRef, NgZone, OnInit } from '@angular/core';
import { PixiGameService } from '../../services/pixi-game.service';

@Component({
  selector: 'app-pixijs',
  template: '',
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
    return this.ngZone.runOutsideAngular(() => this.pixiGame.init(this.elementRef));
  }
}
