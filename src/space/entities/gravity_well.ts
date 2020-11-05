import { EventEmitter } from 'events';
import { Entity, EntityType } from "../entities";
import { Stage } from "../stage";

export class GravityWell extends EventEmitter implements Entity {
    type = EntityType.GravityWell;

    id: number;
    sectorKey: string;
    newSector: number;
    collisionMap: number[][] = [
        [-2, -2],
        [-2, 2],
        [2, 2],
        [2, -2],
    ];
    mass: number = 1000;
    x: number;
    y: number;
    vx?: number;
    vy?: number;
    angle?: number;

    radius: number;
    teleport: number;
    pull: number;

    stage: Stage = null;

    step(delta: number): void {
        this.updatePhisics(delta);
    }
    collide(entity: Entity, result: any): void {
        if (typeof (<any>entity).addDamage !== 'undefined') {
            (<any>entity).addDamage((<any>entity).health, this);
            return;
        }

        entity.vx = 0;
        entity.vy = 0;
        if (this.stage) {
            this.stage.moveEntity(entity, {
                x: this.x + (Math.round(Math.random() * this.teleport) * 2 - this.teleport),
                y: this.y + (Math.round(Math.random() * this.teleport) * 2 - this.teleport),
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
                const d = Math.sqrt(Math.pow(this.x - e.x, 2) + Math.pow(this.y - e.y, 2));
                if (d > this.radius)
                    return;

                const alpha = Math.atan2(this.y - e.y, this.x - e.x) - Math.PI / 2;
                const pull = this.mass * e.mass / Math.pow(d, 2) * this.pull;

                e.vx -= pull * Math.sin(alpha);
                e.vy += pull * Math.cos(alpha);
            });
    }
}
