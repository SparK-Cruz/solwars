import { EventEmitter } from 'events';
import { Entity, EntityType, EntityEvent, GRID_SCALE } from "../entities.js";
import { Stage } from '../stage_interface.js';

const RADAR_SCALE = 512;

export class GravityWellSpawner extends EventEmitter implements Entity {
    public spawner = true;

    public type = EntityType.GravityWell;
    public id: number = 0;
    public sectorKey: string | null = null;
    public newSector: number = 1;
    public collisionMap: number[][] = [];
    public mass: number = 0;

    public stage: Stage | null = null;

    public x: number = 0;
    public y: number = 0;

    public radius: number = 0;
    public teleport: {
        x: number,
        y: number,
        radius: number,
    } = {x:0, y:0, radius:0};
    public pull: number = 0;
    public startSectorRadius: number = 8;
    public intervalSectors: number = 2;
    public maxSectorRadius: number = 5;

    public done: boolean = false;

    public step(delta: number) {
        if (this.done) return;
        this.done = true;
        this.spawn();
    }

    public collide(entity: Entity, result: any): void {}

    private spawn() {
        const options: any = {
            radius: this.radius,
            teleport: this.teleport,
            pull: this.pull,
            mass: this.mass,
            x: this.x,
            y: this.y,
            stage: this.stage,
        };

        const offsets = this.calculateOffsets();

        offsets.forEach(offset => {
            this.emit(EntityEvent.Spawn, EntityType.GravityWell, options, this, offset);
        });
    }

    private calculateOffsets(): { x: number, y: number }[] {
        const start = this.startSectorRadius;
        const end = this.startSectorRadius + this.maxSectorRadius;
        const offsets = [];

        for (let d = start; d < end; d += this.intervalSectors) {
            const steps = d * 5;
            const stepSize = 360 / steps;

            for (let step = 0; step < steps; step++) {
                const a = stepSize * step;

                offsets.push({
                    x: d * GRID_SCALE * Math.sin(a * Math.PI / 180),
                    y: -d * GRID_SCALE * Math.cos(a * Math.PI / 180),
                });
            }
        }

        return offsets;
    }
}
