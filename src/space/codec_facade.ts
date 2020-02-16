import { Entity, EntityType } from './entities';
import { Stage } from './stage';

interface SavedState {
  tick: number
  entities :Entity[]
}

export class CodecFacade {
  public constructor(private stage :Stage) {}

  public readStateFromPoint(point :{x :number, y :number}) :string {
    const stream = {
      tick: this.stage.tick,
      entities: this.stage.fetchEntitiesAround(point).map(this.encodeEntity)
    };

    // TODO PSON / binary
    return JSON.stringify(stream);
  }

  public writeState(state :string) {
    // TODO PSON / binary
    const decoded = <SavedState>JSON.parse(state);

    if (decoded.tick < this.stage.tick
      && decoded.tick + 60 > this.stage.tick)
      return;

    this.stage.addAll(decoded.entities);
  }

  public encodeEntity(entity :Entity) {
    return entity;
  }
}

export namespace CodecEvents {
  // client reads
  export const ACCEPT = "accept";
  export const STEP = "step";
  export const REMOVE_OBJECT = "removal";

  // server reads
  export const SEND_INPUT = "input";
  export const JOIN_GAME = "join"
  export const DISCONNECT = "disconnect";
  export const CONNECTION = "connection";
}