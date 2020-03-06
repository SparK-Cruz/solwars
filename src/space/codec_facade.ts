import { Entity, EntityType } from './entities';
import { Ship } from './entities/ship';
import { Model } from './entities/ships/model';
import { Bullet } from './entities/bullet';
import { ShipDebris } from './entities/ship_debris';
import { Rock } from './entities/rock';
import { EntitySpawner } from './entity_spawner';
import { Prize } from './entities/prize';

interface SavedState {
  tick: number,
  entities: any[],
  ranking: {name: string, bounty: number}[],
}

export module DeathCauses {
    export const Collision = 'collision';
    export const Bullet = 'bullet';
}

export interface PlayerDeath {
    cause: string,
    bounty: number,
    killer: Entity,
    type: EntityType,
}

export class CodecFacade {
  public constructor() {}

  public encode(state: SavedState): string {
    const stream = {
      tick: state.tick,
      ranking: state.ranking.map(p => {return {name: p.name, bounty: p.bounty}}),
      entities: state.entities.map(p => Object.values(p).map(this.encodeEntity).filter(e => e))
    };

    // TODO PSON / binary
    return JSON.stringify(stream);
  }

  public decode(state :string): SavedState {
    // TODO PSON / binary
    return <SavedState>JSON.parse(state);
  }

  public encodeEntity(entity :any) {
    if (entity.spawner) {
        return null;
    }

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
      control: entity.control,
      //bullet
      parent: entity.parent,
      bulletType: entity.bulletType,
      //ship debris
      options: entity.options,
      size: entity.size,
      energy: entity.energy,
      //rock
      sides: entity.sides
    };
  }

  public decodeEntity(data: Entity) {
    switch(data.type.name) {
      case EntityType.Ship.name:
        return this.decodeShip(<Ship>data);
      case EntityType.Bullet.name:
        return this.decodeBullet(<Bullet>data);
      case EntityType.ShipDebris.name:
        return this.decodeShipDebris(<ShipDebris>data);
      case EntityType.Rock.name:
        return this.decodeRock(<Rock>data);
      case EntityType.Prize.name:
        return this.decodePrize(<Prize>data);
    }
  }

  public decodeSpawner(data: Entity) {
    const spawner: Entity = new (<any>EntitySpawner)[data.type.name];
    Object.assign(spawner, data);
    return spawner;
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

  private decodeShipDebris(data: ShipDebris) {
    const shipDebris = new ShipDebris(data.options, data.parent);
    Object.assign(shipDebris, data);
    return shipDebris;
  }

  private decodeRock(data: Rock) {
    const rock = new Rock(data.size, data.sides);
    Object.assign(rock, data);
    return rock;
  }

  private decodePrize(data: Prize) {
    const prize = new Prize();
    Object.assign(prize, data);
    return prize;
  }
}

export namespace CodecEvents {
  // client reads
  export const CONNECT = "connect";
  export const ACCEPT = "accept";
  export const STEP = "step";
  export const REMOVE_OBJECT = "removal";
  export const DEATH = "death";
  export const RESPAWN = "respawn";
  export const UPGRADE = "upgrade";

  // server reads
  export const SEND_INPUT = "input";
  export const JOIN_GAME = "join"
  export const DISCONNECT = "disconnect";
  export const CONNECTION = "connection";
}
