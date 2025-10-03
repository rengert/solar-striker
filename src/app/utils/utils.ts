import { ObjectType } from '../models/pixijs/object-type.enum';

export function filterBy(type: ObjectType): (object: { type: ObjectType }) => boolean {
  return (object: { type: ObjectType }) => object.type === type;
}
