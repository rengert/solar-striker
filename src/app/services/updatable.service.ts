import { inject } from '@angular/core';
import { Container, Text, Ticker } from 'pixi.js';
import { ApplicationService } from './application.service';

export abstract class UpdatableService {
  protected readonly application = inject(ApplicationService);

  abstract update(ticker: Ticker, level?: number): void;

  protected addToStage(points: Text | Container): void {
    this.application.stage.addChild(points);
  }
}
