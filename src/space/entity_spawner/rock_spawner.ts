import { EventEmitter } from 'events';
import { Entity, EntityEvent, EntityType } from "../entities";

export class RockSpawner extends EventEmitter implements Entity {
    public spawner = true;
    public type: EntityType = EntityType.Rock;

    public id: number;
    public sectorKey: string;
    public newSector: number = 0;
    public collisionMap: number[][];
    public mass = 0;
    public x: number = 0;
    public y: number = 0;
    public vx: number = 0;
    public vy: number = 0;
    public angle: number = 0;

    public size: number;
    public sides: number;
    public count: number;
    public radius: number;
    public spread: number;
    public minRadius: number;

    public done: boolean = false;

    public step(delta: number) {
        if (this.done) return;
        this.done = true;
        this.spawn();
    }

    public collide(other: Entity, result: any) {}

    private spawn() {
        const toRads = (angle: number) => {
            return angle * Math.PI / 180;
        }

        this.minRadius ??= 0;

        const rocky = {size: this.size, sides: this.sides};
        const reference = {
            x: this.x,
            y: this.y,
            vx: this.vx,
            vy: this.vy,
            mass: this.mass,
            angle: this.angle,
        };

        for (let i = 0; i < this.count; i++) {
            const angle = toRads(360 / this.count) * i;
            const spread = {
                distance: this.minRadius + (Math.random() * (this.spread - this.minRadius)),
                angle: toRads(Math.random() * 360),
            }

            const offset = {
                x: this.radius * Math.sin(angle) + spread.distance * Math.sin(spread.angle),
                y: this.radius * Math.cos(angle) + spread.distance * Math.cos(spread.angle),
            };

            const targetSize = (0.6 + Math.random() * 1.1) * rocky.size;
            const targetMass = targetSize / rocky.size * reference.mass;

            const rock = Object.assign({}, rocky, {size: targetSize});
            const localRef = Object.assign({}, reference, {mass: targetMass});

            this.emit(EntityEvent.Spawn, EntityType.Rock, rock, localRef, offset);
        }

        this.emit(EntityEvent.Despawn, this);
    }
}
