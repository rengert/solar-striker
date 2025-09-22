import { computed, Injectable, signal } from '@angular/core';
import { Ticker } from 'pixi.js';
import { AnimatedGameSprite } from '../models/pixijs/animated-game-sprite';
import { ObjectType } from '../models/pixijs/object-type.enum';
import { GameSprite } from '../models/pixijs/simple-game-sprite';
import { filterBy } from '../utils/utils';
import { UpdatableService } from './updatable.service';

export type ObjectModelType = AnimatedGameSprite | GameSprite;

type DestroyedCallback = (item: ObjectModelType, by: ObjectModelType) => void;

@Injectable()
export class ObjectService extends UpdatableService {
  readonly #objects = signal<ObjectModelType[]>([]);

  readonly objects = computed(() => this.#objects().filter((object) => !object.destroyed));
  readonly enemies = computed(() => this.objects().filter(filterBy(ObjectType.enemy)));
  readonly meteors = computed(() => this.objects().filter(filterBy(ObjectType.meteor)));

  private readonly destroyedCallbacks = new Map<ObjectType, DestroyedCallback[]>();

  onDestroyed(type: ObjectType, callback: DestroyedCallback): void {
    if (!this.destroyedCallbacks.has(type)) {
      this.destroyedCallbacks.set(type, []);
    }
    const list = this.destroyedCallbacks.get(type);
    list!.push(callback);
  }

  update(ticker: Ticker): void {
    this.#objects.update((objects) =>
      objects.filter((object) => !object.destroyed && !object.destroying),
    );

    this.meteors().forEach((object) => object.update(ticker));

    const objectsList = this.#objects();
    for (let i = 0; i < objectsList.length; i++) {
      const object1 = objectsList[i];
      if (object1.destroyed && object1.destroying) {
        return;
      }
      for (let j = 0; j < objectsList.length; j++) {
        const object2 = objectsList[j];
        if (
          object1 === object2 ||
          object2.destroyed ||
          object2.destroying ||
          object1.destroyed ||
          object1.destroying ||
          !object1.hit(object2)
        ) {
          continue;
        }
        this.triggerCallbacks(object1, object2);
        this.triggerCallbacks(object2, object1);
      }
    }

    this.#objects()
      .filter((item) => item.destroying)
      .forEach((item) => item.destroy());
    this.#objects.update((objects) => objects.filter((object) => !object.destroyed));
  }

  add(object: AnimatedGameSprite | GameSprite): void {
    this.#objects.update((objects) => {
      objects.push(object);
      return objects;
    });
  }

  triggerCallbacks(object1: ObjectModelType, object2: ObjectModelType): void {
    if (object1.destroying) {
      this.destroyedCallbacks.get(object1.type)?.forEach((callback) => callback(object1, object2));
    }
  }
}
