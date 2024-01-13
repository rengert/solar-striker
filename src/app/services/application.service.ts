import { ElementRef, Injectable } from '@angular/core';
import { Application, Container, Rectangle, Ticker } from 'pixi.js';

@Injectable()
export class ApplicationService {
  private app: Application | undefined;

  get stage(): Container {
    if (!this.app) {
      throw new Error('Application not initialized');
    }
    return this.app.stage;
  }

  get ticker(): Ticker {
    if (!this.app) {
      throw new Error('Application not initialized');
    }
    return this.app.ticker;
  }

  get screen(): Rectangle {
    if (!this.app) {
      throw new Error('Application not initialized');
    }
    return this.app.screen;
  }

  init(elementRef: ElementRef): void {
    this.app = new Application({
      height: elementRef.nativeElement.clientHeight,
      width: elementRef.nativeElement.clientWidth,
      backgroundColor: 0x000000,
    });
    elementRef.nativeElement.appendChild(this.app.view);
  }
}
