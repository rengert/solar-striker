export interface LocatedObject {
  x: number,
  y: number,
  width: number,
  height: number,
  update: () => void,
  collide: (item: LocatedObject) => boolean
}
