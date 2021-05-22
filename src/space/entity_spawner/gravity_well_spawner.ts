import { EventEmitter } from 'events';
import { Entity, EntityType, EntityEvent, GRID_SCALE } from "../entities";
import { Stage } from '../stage';

export class GravityWellSpawner extends EventEmitter implements Entity {
    public spawner = true;

    public type = EntityType.GravityWell;
    public id: number;
    public sectorKey: string;
    public newSector: number = 0;
    public collisionMap: number[][];
    public mass: number;

    public stage: Stage = null;

    public x: number;
    public y: number;

    public radius: number;
    public teleport: {
        x: number,
        y: number,
        radius: number,
    };
    public pull: number;
    public startSectorRadius: number = 8;
    public intervalSectors: number = 3;
    public maxSectorRadius: number = 10;

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
        const end = this.startSectorRadius+this.maxSectorRadius;
        const offsets = [];

        for (let x=start; x<end; x += this.intervalSectors) {
            for (let y=0; y<end; y += this.intervalSectors) {
                offsets.push({
                    x: x*GRID_SCALE,
                    y: y*GRID_SCALE,
                });
                offsets.push({
                    x: x*GRID_SCALE,
                    y: -y*GRID_SCALE,
                });
                offsets.push({
                    x: -x*GRID_SCALE,
                    y: y*GRID_SCALE,
                });
                offsets.push({
                    x: -x*GRID_SCALE,
                    y: -y*GRID_SCALE,
                });
            }
        }

        for (let y=start; y<end; y += this.intervalSectors) {
            for (let x=0; x<start; x += this.intervalSectors) {
                offsets.push({
                    x: x*GRID_SCALE,
                    y: y*GRID_SCALE,
                });
                offsets.push({
                    x: x*GRID_SCALE,
                    y: -y*GRID_SCALE,
                });
                offsets.push({
                    x: -x*GRID_SCALE,
                    y: y*GRID_SCALE,
                });
                offsets.push({
                    x: -x*GRID_SCALE,
                    y: -y*GRID_SCALE,
                });
            }
        }

        return offsets;
    }
}
