import { EventEmitter } from 'events';
import { Entity, EntityType, EntityEvent } from "../entities.js";
import { Ship, ShipEvents } from "./ship.js";
import { PrizeSpawner } from "../entity_spawner/prize_spawner.js";
import { Config } from '../config_interfaces.js';

const REFRESH = 4; // don't import from Stage

export interface PrizeEffect {
    name: string;
    apply(entity: Ship): void;
    config?: Config;
}

export class Prize extends EventEmitter implements Entity {
    public type = EntityType.Prize;
    public id: number = 0;
    public sectorKey: string = '';
    public newSector: number = 1;
    public collisionMap: number[][] = [
        [-8, -8],
        [-8, 7],
        [7, 7],
        [7, -8],
    ];
    public mass: number = 0;

    public x: number = 0;
    public y: number = 0;
    public vx: number = 0;
    public vy: number = 0;
    public angle: number = 0;
    public vangle: number = 2;

    public constructor(public effect: PrizeEffect, public parent: PrizeSpawner) {
        super();
        if (!parent || !effect) return;
        effect.config = parent.config;
        parent.onPrizeSpawn(this);
    }

    public step(delta: number): void {
        this.angle += this.vangle * delta;
    }
    public collide(entity: Entity, result: any): void {
        if (entity.type.name !== EntityType.Ship.name)
            return;

        this.effect.apply(<Ship>entity);
        entity.newSector = REFRESH;
        (<Ship>entity).emit(ShipEvents.Upgrade, this.effect.name);
        this.parent.onPrizeDespawn(this);
        this.emit(EntityEvent.Despawn, this);
    }
}
