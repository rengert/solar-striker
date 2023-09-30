import { Component, ElementRef, NgZone, OnInit } from '@angular/core';
import { GameService } from '../../services/game.service';

@Component({
  selector: 'app-pixijs',
  template: '',
  providers: [GameService],
})
export class PixijsComponent implements OnInit {
  constructor(
    private readonly elementRef: ElementRef,
    private readonly ngZone: NgZone,
    private readonly pixiGame: GameService,
  ) {
  }

  ngOnInit(): Promise<void> {
    return this.ngZone.runOutsideAngular(() => this.pixiGame.init(this.elementRef));
  }
}
