import { Entity } from '../entities';

export class EntityCodec {
  public static encodeAll(entities :Entity[]) :string {
    const encodedEntities :string[] = [];
    for (var i = entities.length - 1; i >= 0; i--) {
      encodedEntities.push(EntityCodec.encode(entities[i]));
    }
    return encodedEntities.join(String.fromCharCode(9));
  }
  public static encode(entity :Entity) :string {
    return 'shit';
  }
}
