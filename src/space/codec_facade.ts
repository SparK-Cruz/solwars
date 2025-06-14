import { Entity, EntityType } from './entities.js';
import { Ship } from './entities/ship.js';
import { Model } from './entities/ships/model.js';
import { Bullet } from './entities/bullet.js';
import { ShipDebris } from './entities/ship_debris.js';
import { Rock } from './entities/rock.js';
import { EntitySpawner } from './entity_spawner.js';
import { Prize } from './entities/prize.js';
import { GravityWell } from './entities/gravity_well.js';

import { json } from 'typescript-json';
import { Config } from './config_interfaces.js';

interface SavedState {
    tick: number,
    radius: number,
    entities: any[],
    ranking: { name: string, bounty: number }[],
}

export namespace DeathCauses {
    export const Collision = 'collision';
    export const Bullet = 'bullet';
}

export interface PlayerDeath {
    name: string,
    ship: number,
    cause: string,
    bounty: number,
    killer: any,
    type: EntityType,
}

const flatstr = (s: string) => s;

const stringify = (obj: any) => {
    return json.stringify(obj);
};

export class CodecFacade {
    public constructor() { }

    public encode(state: SavedState, force: boolean = false): string {
        const stream = {
            tick: state.tick,
            radius: state.radius,
            ranking: state.ranking.map(p => { return { name: p.name, bounty: p.bounty } }),
            entities: [...state.entities.map(p => Object.values(p).map(e => this.encodeEntity(e, force)).filter(e => e))].flat(),
        };

        // TODO PSON / binary
        return flatstr(stringify(stream));
    }

    public decode(state: string): SavedState {
        // TODO PSON / binary
        return <SavedState>JSON.parse(flatstr(state));
    }

    public encodeEntity(entity: any, force: boolean = false) {
        if (
            !entity
            || entity.spawner
            || !entity.id
        ) {
            return null;
        }

        entity = Object.assign({}, entity, { stage: null });

        if (entity.newSector || force) {
            return this.fullEncode(entity);
        }

        return this.lightEncode(entity);
    }

    public decodeEntity(data: Entity, config?: Config): Entity | null {

        if ((<any>data).spawner)
            return this.decodeSpawner(data, config);

        switch (data.type.name) {
            case EntityType.Ship.name:
                return this.decodeShip(<Ship>data, config);
            case EntityType.Bullet.name:
                return this.decodeBullet(<Bullet>data, config);
            case EntityType.ShipDebris.name:
                return this.decodeShipDebris(<ShipDebris>data);
            case EntityType.Rock.name:
                return this.decodeRock(<Rock>data);
            case EntityType.Prize.name:
                return this.decodePrize(<Prize>data);
            case EntityType.GravityWell.name:
                return this.decodeGravityWell(<GravityWell>data);
            default:
                console.warn("Incomplete entity data.");
        }

        return null;
    }

    public decodeSpawner(data: Entity, config?: Config) {
        const spawner: Entity = new (<any>EntitySpawner)[data.type.name];
        Object.assign(spawner, data, {config});
        return spawner;
    }

    private decodeShip(data: Ship, config?: Config) {
        const ship = new Ship(Model.byId[data.model], config);
        Object.assign(ship, data);
        return ship;
    }

    private decodeBullet(data: Bullet, config?: Config) {
        const bullet = new Bullet(data.bulletType, data.parent, config);
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
        const prize = new Prize(data.effect, data.parent);
        Object.assign(prize, data);
        return prize;
    }

    private decodeGravityWell(data: GravityWell) {
        const well = new GravityWell();
        Object.assign(well, data);
        return well;
    }

    private lightEncode(entity: any) {
        return {
            newSector: 0,
            id: entity.id,
            name: entity.name,
            x: entity.x,
            y: entity.y,
            vx: entity.vx,
            vy: entity.vy,
            vmax: entity.vmax, // ship
            angle: entity.angle,
            vangle: entity.vangle,
            control: entity.control, // ship
            damage: entity.damage,
        }
    }

    private fullEncode(entity: any) {
        return {
            // all
            newSector: 1,
            id: entity.id,
            name: entity.name,
            x: entity.x,
            y: entity.y,
            vx: entity.vx,
            vy: entity.vy,
            vmax: entity.vmax, // ship
            angle: entity.angle,
            vangle: entity.vangle,
            control: entity.control, // ship
            damage: entity.damage,
            health: entity.health,
            color: entity.color,
            //ship
            model: entity.model,
            decals: entity.decals,
            //bullet
            parent: entity.parent,
            bulletType: entity.bulletType,
            //ship debris
            options: entity.options,
            size: entity.size,
            energy: entity.energy,
            //rock
            sides: entity.sides,
            // all
            type: {
                name: entity.type.name,
            },
        };
    }
}

export namespace CodecEvents {
    // client reads
    export const CONNECT = "connect";
    export const ACCEPT = "accept";
    export const STEP = "step";
    export const REMOVE_OBJECT = "removal";
    export const COLLISION = "collision";
    export const DEATH = "death";
    export const DIE = "die";
    export const RESPAWN = "respawn";
    export const UPGRADE = "upgrade";
    export const ENTITY = "entity";

    // server reads
    export const SEND_INPUT = "input";
    export const JOIN_GAME = "join"
    export const DISCONNECT = "disconnect";
    export const CONNECTION = "connection";
    export const SYNC_ENTITY = "syncEntity";
}
