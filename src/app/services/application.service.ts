import { ElementRef, Injectable } from '@angular/core';
import { Application, Assets, Container, Rectangle, Ticker } from 'pixi.js';

const assets: Record<string, string> = {
  meteor1: 'assets/game/meteors/meteorBrown_small1.png',
  meteor2: 'assets/game/meteors/meteorBrown_small2.png',
  meteor3: 'assets/game/meteors/meteorGrey_small1.png',
  meteor4: 'assets/game/meteors/meteorGrey_small2.png',
};

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

  async init(elementRef: ElementRef): Promise<void> {
    this.app = new Application();
    await this.app.init({
      resizeTo: document.body,
      backgroundColor: 0x000000,
    });

    Assets.add({ alias: 'popup', src: 'assets/ui/navigation-popup.png' });
    Assets.add({
      alias: 'background',
      src: 'assets/game/desert-background-looped.png',
    });
    Assets.add({ alias: 'clouds', src: 'assets/game/clouds-transparent.png' });
    Assets.add({
      alias: 'popup-bottom',
      src: 'assets/ui/navigation-popup-bottom.png',
    });
    Assets.add({ alias: 'ship', src: 'assets/game/ship/ship_blue.json' });

    Assets.add({ alias: 'button', src: 'assets/ui/yellow_button00.png' });

    for (const alias in assets) {
      Assets.add({ alias, src: assets[alias] });
      await Assets.load(alias);
    }

    await Assets.load(['background', 'popup', 'clouds', 'popup-bottom', 'button']);

    elementRef.nativeElement.appendChild(this.app!.canvas);
  }
}
