import { EventEmitter } from 'events';
import { Entity, EntityType, EntityEvent } from "../entities.js";
import { Prize } from '../entities/prize.js';
import { RandomPrizeEffect } from '../entities/prize_effects/prize_effects.js';
import { Config } from '../config_interfaces.js';

export class PrizeSpawner extends EventEmitter implements Entity {
    public spawner = true;

    public type = EntityType.Prize;
    public id: number = 0;
    public sectorKey: string | null = null;
    public newSector: number = 1;
    public collisionMap: number[][] = [];
    public mass: number = 0;

    public x: number = 0;
    public y: number = 0;

    public radius: number = 0;
    public delay: number = 0;
    public maxPrizes: number = 0;

    private timer: number = 0;
    private prizeCount: number = 0;

    public constructor(public config?: Config) {
        super();
    }

    public onPrizeSpawn(prize: Prize) {
        this.prizeCount++;
    }

    public onPrizeDespawn(prize: Prize) {
        this.prizeCount--;
    }

    public step(delta: number): void {
        this.timer++;

        if (this.prizeCount >= this.maxPrizes)
            return;

        if (this.timer % this.delay !== 0)
            return;

        this.spawn();
    }
    public collide(entity: Entity, result: any): void {}

    private spawn() {
        const distance = Math.random() * this.radius;
        const angle = Math.random() * 2 * Math.PI;
        const type = RandomPrizeEffect();

        const offset = {
            x: distance * Math.sin(angle),
            y: distance * Math.cos(angle),
        };

        this.emit(EntityEvent.Spawn, EntityType.Prize, type, this, offset);
    }
}
