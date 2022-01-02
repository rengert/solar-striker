export interface LocatedObject {
  x: number,
  y: number,
  width: number,
  height: number,
  update: () => void,
  collidate: (item: LocatedObject) => boolean
}
