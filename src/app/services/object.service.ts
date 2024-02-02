import { computed, Injectable, signal } from '@angular/core';
import { AnimatedGameSprite } from '../models/pixijs/animated-game-sprite';
import { ObjectType } from '../models/pixijs/object-type.enum';
import { GameSprite } from '../models/pixijs/simple-game-sprite';
import { UpdatableService } from './updatable.service';

export type ObjectModelType = AnimatedGameSprite | GameSprite;

@Injectable()
export class ObjectService extends UpdatableService {
  #objects = signal<ObjectModelType[]>([]);

  objects = computed(() => this.#objects().filter(object => !object.destroyed));

  readonly enemies = computed(() => this.objects().filter(object => object.type === ObjectType.enemy));
  readonly rockets = computed(() => this.objects().filter(object => object.type === ObjectType.rocket));
  readonly collectables = computed(() => this.objects().filter(object => object.type === ObjectType.collectable));
  readonly meteors = computed(() => this.objects().filter(object => object.type === ObjectType.meteor));

  private readonly destroyedCallbacks = new Map<ObjectType, ((item: ObjectModelType, by: ObjectModelType) => void)[]>();

  onDestroyed(type: ObjectType, callback: (item: ObjectModelType, by: ObjectModelType) => void): void {
    if (!this.destroyedCallbacks.has(type)) {
      this.destroyedCallbacks.set(type, []);
    }
    const list = this.destroyedCallbacks.get(type);
    list!.push(callback);
  }

  update(delta: number): void {
    this.#objects.update((objects) => {
      return objects.filter(object => !object.destroyed && !object.destroying);
    });

    this.meteors().forEach(object => object.update(delta));

    this.#objects().forEach(object1 => {
      if (object1.destroyed && object1.destroying) {
        return;
      }
      this.#objects().forEach(object2 => {
        if (object1 === object2 || object2.destroyed || object2.destroying || object1.destroyed || object1.destroying) {
          return;
        }
        object1.hit(object2);
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (object1.destroying) {
          this.destroyedCallbacks.get(object1.type)?.forEach(callback => callback(object1, object2));
        }
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (object2.destroying) {
          this.destroyedCallbacks.get(object2.type)?.forEach(callback => callback(object2, object1));
        }
      });
    });

    this.#objects().filter(item => item.destroying).forEach(item => item.destroy());
    this.#objects.update((objects) => {
      return objects.filter(object => !object.destroyed);
    });
  }

  add(object: AnimatedGameSprite | GameSprite): void {
    this.#objects.update((objects) => {
      objects.push(object);
      return objects;
    });
  }
}
