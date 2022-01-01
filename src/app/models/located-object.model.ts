export interface LocatedObject {
  x: number,
  y: number,
  update: () => void,
  collidate: (item: LocatedObject) => boolean
}
