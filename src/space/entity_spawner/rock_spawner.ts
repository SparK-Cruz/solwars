import { EventEmitter } from 'events';
import { Entity, EntityEvent, EntityType } from "../entities";

export class RockSpawner extends EventEmitter implements Entity {
    public spawner = true;
    public type: EntityType = EntityType.Rock;

    public id: number;
    public sectorKey: string;
    public collisionMap: number[][];
    public mass = 0;
    public x: number = 0;
    public y: number = 0;
    public vx: number = 0;
    public vy: number = 0;
    public angle: number = 0;
    public vangle: number = 0;

    public size: number;
    public sides: number;
    public count: number;
    public radius: number;
    public spread: number;

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

        const rocky = {size: this.size, sides: this.sides};
        const reference = {
            x: this.x,
            y: this.y,
            vx: this.vx,
            vy: this.vy,
            mass: this.mass,
            angle: this.angle,
            vangle: this.vangle,
        };

        for (let i = 0; i < this.count; i++) {
            const angle = toRads(360 / this.count) * i;
            const spread = {
                distance: Math.random() * this.spread,
                angle: toRads(Math.random() * 360),
            }

            const offset = {
                x: this.radius * Math.sin(angle) + spread.distance * Math.sin(spread.angle),
                y: this.radius * Math.cos(angle) + spread.distance * Math.cos(spread.angle),
            };

            const rock = Object.assign({}, rocky, {size: (0.9 + Math.random() * 0.2) * rocky.size});

            this.emit(EntityEvent.Spawn, EntityType.Rock, rock, reference, offset);
        }

        this.emit(EntityEvent.Despawn, this);
    }
}
