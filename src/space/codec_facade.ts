import { Entity } from './entities';
import { Ship } from './entities/ship';
import { Model } from './entities/ships/model';

interface SavedState {
  tick: number,
  entities: Entity[],
  ranking: {name: string, bounty: number}[],
}

export class CodecFacade {
  public constructor() {}

  public encode(state: SavedState): string {
    const stream = {
      tick: state.tick,
      ranking: state.ranking.map(p => {return {name: p.name, bounty: p.bounty}}),
      entities: state.entities.map(this.encodeEntity)
    };

    // TODO PSON / binary
    return JSON.stringify(stream);
  }

  public decode(state :string): SavedState {
    // TODO PSON / binary
    return <SavedState>JSON.parse(state);
  }

  public encodeEntity(entity :Entity) {
    return entity;
  }

  public decodeShip(data: Ship) {
    const ship = new Ship(Model.byId[data.model]);
    Object.assign(ship, data);
    return ship;
  }
}

export namespace CodecEvents {
  // client reads
  export const CONNECT = "connect";
  export const ACCEPT = "accept";
  export const STEP = "step";
  export const REMOVE_OBJECT = "removal";
  export const DEATH = "death";

  // server reads
  export const SEND_INPUT = "input";
  export const JOIN_GAME = "join"
  export const DISCONNECT = "disconnect";
  export const CONNECTION = "connection";
}
