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

const LZString = require('lz-string');
const fastjson = require('fast-json-stringify');
const flatstr = require('flatstr');

const stringify = fastjson({
    title: 'Stream',
    type: 'object',
    properties: {
        tick: {
            type: 'integer',
        },
        ranking: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    name: {
                        type: 'string',
                    },
                    bounty: {
                        type: 'integer',
                    },
                }
            }
        },
        entities: {
            type: 'array',
            items: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        newSector: {
                            type: 'boolean',
                        },
                        id: {
                            type: 'integer',
                        },
                        name: {
                            type: 'string',
                        },
                        x: {
                            type: 'integer',
                        },
                        y: {
                            type: 'integer',
                        },
                        vx: {
                            type: 'integer',
                        },
                        vy: {
                            type: 'integer',
                        },
                        vmax: {
                            type: 'number',
                        },
                        angle: {
                            type: 'number',
                        },
                        vangle: {
                            type: 'number',
                        },
                        control: {
                            type: 'integer',
                        },
                        damage: {
                            type: 'number',
                        },
                        health: {
                            type: 'integer',
                        },
                        color: {
                            type: 'string',
                        },
                        model: {
                            type: 'string',
                        },
                        decals: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    name: {
                                        type: 'string',
                                    },
                                    color: {
                                        type: 'string',
                                    },
                                },
                            },
                        },
                        shootCost: {
                            type: 'number',
                        },
                        parent: {
                            type: 'object',
                            properties: {
                                type: {
                                    type: 'object',
                                    properties: {
                                        name: {
                                            type: 'string',
                                        },
                                    },
                                },
                                id: {
                                    type: 'string',
                                },
                                name: {
                                    type: 'string',
                                },
                            },
                        },
                        bulletType: {
                            type: 'integer',
                        },
                        options: {
                            type: 'object',
                            properties: {
                                size: {
                                    type: 'number',
                                },
                                angle: {
                                    type: 'number',
                                },
                            },
                        },
                        size: {
                            type: 'number',
                        },
                        energy: {
                            type: 'number',
                        },
                        sides: {
                            type: 'integer',
                        },
                        type: {
                            type: 'object',
                            properties: {
                                name: {
                                    type: 'string',
                                },
                            },
                        },
                    },
                },
            },
        },
    },
});

export class CodecFacade {
    public constructor() {}

    public encode(state: SavedState, force: boolean = false): string {
        const stream = {
            tick: state.tick,
            ranking: state.ranking.map(p => {return {name: p.name, bounty: p.bounty}}),
            entities: state.entities.map(p => Object.values(p).map(e => this.encodeEntity(e, force)).filter(e => e))
        };

        // TODO PSON / binary
        return this.encodeBin(flatstr(stringify(stream)));
    }

    public decode(state :string): SavedState {
        // TODO PSON / binary
        return <SavedState>JSON.parse(flatstr(this.decodeBin(state)));
    }

    public encodeEntity(entity :any, force: boolean = false) {
        if (entity.spawner) {
            return null;
        }

        if (entity.newSector || force) {
            return this.fullEncode(entity);
        }

        return this.lightEncode(entity);
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

    private lightEncode(entity: any) {
        return {
            newSector: false,
            id: entity.id,
            x: entity.x,
            y: entity.y,
            vx: entity.vx,
            vy: entity.vy,
            vmax: entity.vmax,
            angle: entity.angle,
            vangle: entity.vangle,
            control: entity.control,
            damage: entity.damage,
        }
    }

    private fullEncode(entity: any) {
        return {
            // all
            newSector: true,
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
            shootCost: entity.shootCost,
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
            type: entity.type,
        };
    }

    private encodeBin(json: string): string {
        // return LZString.compress(json);

        return json;
    }
    private decodeBin(bin: string): string {
        // return LZString.decompress(bin);

        return bin;
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
