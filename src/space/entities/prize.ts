import { EventEmitter } from 'events';
import { Entity, EntityType, EntityEvent } from "../entities";
import { Ship, ShipEvents } from "./ship";
import { PrizeSpawner } from "../entity_spawner/prize_spawner";

export interface PrizeEffect {
    name: string;
    apply(entity: Ship): void;
}

export class Prize extends EventEmitter implements Entity {
    public type = EntityType.Prize;
    public id: number;
    public sectorKey: string = '';
    public newSector: number = 0;
    public collisionMap: number[][] = [
        [-7, -7],
        [-7, 7],
        [7, 7],
        [7, -7],
    ];
    public mass: number = 0;

    public x: number;
    public y: number;
    public vx: number = 0;
    public vy: number = 0;
    public angle: number = 0;
    public vangle: number = 2;

    public constructor(private effect: PrizeEffect = null, private parent: PrizeSpawner = null) {
        super();
        if (!parent) return;
        parent.onPrizeSpawn(this);
    }

    public step(delta: number): void {
        this.angle += this.vangle;
    }
    public collide(entity: Entity, result: any): void {
        if (entity.type.name !== EntityType.Ship.name)
            return;

        (<Ship>entity).emit(ShipEvents.Upgrade, this.effect.name);
        this.effect.apply(<Ship>entity);
        this.parent.onPrizeDespawn(this);
        this.emit(EntityEvent.Despawn, this);
    }
}
