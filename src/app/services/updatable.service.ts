export abstract class UpdatableService {
  abstract update(delta: number, level?: number): void;
}
