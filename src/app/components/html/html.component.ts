import { Component, ElementRef, HostListener } from '@angular/core';
import { GameService } from '../../services/game.service';

@Component({
  selector: 'app-html',
  templateUrl: './html.component.html',
  styleUrls: ['./html.component.scss'],
  providers: [GameService],
})
export class HtmlComponent {
  constructor(
    elementRef: ElementRef,
    readonly game: GameService,
  ) {
    game.init(elementRef.nativeElement.clientWidth, elementRef.nativeElement.clientHeight);
  }

  @HostListener('mousemove', ['$event'])
  private move(event: MouseEvent): void {
    this.game.handleMouseMove(event);
  }

  @HostListener('click')
  private shot(): void {
    this.game.click();
  }
}
