import { EventEmitter } from 'events';
import { Entity, EntityType } from "../entities.js";
import { Stage } from '../stage_interface.js';

export class GravityWell extends EventEmitter implements Entity {
    type = EntityType.GravityWell;

    name = 'a backhole';

    id: number = 0;
    sectorKey: string | null = null;
    newSector: number = 1;
    collisionMap: number[][] = [
        [-2, -2],
        [-2, 2],
        [2, 2],
        [2, -2],
    ];
    mass: number = 1000;
    x: number = 0;
    y: number = 0;

    radius: number = 0;
    teleport: {
        x: number,
        y: number,
        radius: number,
    } = {x:0, y:0, radius: 0};
    pull: number = 0;

    stage: Stage | null = null;

    step(delta: number): void {
        // console.log(this);
        this.updatePhisics(delta);
    }
    collide(entity: Entity, result: any): void {
        if (entity.type.name === EntityType.GravityWell.name) return;

        entity.vx = 0;
        entity.vy = 0;
        if (this.stage) {
            this.stage.moveEntity(entity, {
                x: this.teleport.x + (Math.round(Math.random() * this.teleport.radius) * 2 - this.teleport.radius),
                y: this.teleport.y + (Math.round(Math.random() * this.teleport.radius) * 2 - this.teleport.radius),
            });
        }
    }

    private updatePhisics(delta: number) {
        if (!this.stage)
            return;

        const entities = this.stage.fetchEntitiesAround(this);
        entities
            .reduce((a, c) => a.concat(Object.values(c)), [])
            .forEach(e => {
                if (e.type.name === EntityType.GravityWell.name) return;
                // if (e.type.name == EntityType.Rock.name) return;

                let d = Math.sqrt(Math.pow(this.x - e.x, 2) + Math.pow(this.y - e.y, 2));
                if (d > this.radius)
                    return;

                if (d < 1) {
                    return;
                }

                const alpha = Math.atan2(this.y - e.y, this.x - e.x) - Math.PI / 2;
                const pull = this.mass / d * this.pull;

                e.vx! -= pull * Math.sin(alpha);
                e.vy! += pull * Math.cos(alpha);
            });
    }
}
