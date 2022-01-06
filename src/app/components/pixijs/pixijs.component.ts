import { Component, ElementRef, HostListener, NgZone, OnInit } from '@angular/core';
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

  ngOnInit(): void {
    this.ngZone.runOutsideAngular(() => {
      this.pixiGame.init(this.elementRef);
    });
  }

  @HostListener('mousemove', ['$event'])
  private move(event: MouseEvent): void {
    this.pixiGame.handleMouseMove(event);
  }
}
