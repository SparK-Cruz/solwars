import { Entity, EntityType } from './entities';
import { Ship } from './entities/ship';
import { Model } from './entities/ships/model';
import { Bullet } from './entities/bullet';

interface SavedState {
  tick: number,
  entities: any[],
  ranking: {name: string, bounty: number}[],
}

export class CodecFacade {
  public constructor() {}

  public encode(state: SavedState): string {
    const stream = {
      tick: state.tick,
      ranking: state.ranking.map(p => {return {name: p.name, bounty: p.bounty}}),
      entities: state.entities.map(p => Object.values(p).map(this.encodeEntity))
    };

    // TODO PSON / binary
    return JSON.stringify(stream);
  }

  public decode(state :string): SavedState {
    // TODO PSON / binary
    return <SavedState>JSON.parse(state);
  }

  public encodeEntity(entity :any) {
    return {
        type: entity.type,
        id: entity.id,
        name: entity.name,
        alive: entity.alive,
        x: entity.x,
        y: entity.y,
        vx: entity.vx,
        vy: entity.vy,
        health: entity.health,
        damage: entity.damage,
        angle: entity.angle,
        vangle: entity.vangle,
        color: entity.color,
        //ship
        vmax: entity.vmax,
        model: entity.model,
        decals: entity.decals,
        //bullet
        parent: entity.parent,
        bulletType: entity.bulletType,
    };
  }

  public decodeEntity(data: Entity) {
    switch(data.type.name) {
      case EntityType.Ship.name:
        return this.decodeShip(<Ship>data);
      case EntityType.Bullet.name:
        return this.decodeBullet(<Bullet>data);
    }

    return data;
  }

  private decodeShip(data: Ship) {
    const ship = new Ship(Model.byId[data.model]);
    Object.assign(ship, data);
    return ship;
  }

  private decodeBullet(data: Bullet) {
    const bullet = new Bullet(data.bulletType, data.parent);
    Object.assign(bullet, data);
    return bullet;
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
