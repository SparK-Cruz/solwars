import { EventEmitter } from 'events';
import { Entity, EntityType, EntityEvent } from '../entities';
import { Ship } from './ship';

const SPREAD = Math.random() * 0.1 + 0.1;

export class ShipDebris extends EventEmitter implements Entity {
    public id: number;
    public type = EntityType.ShipDebris;

    public sectorKey: string = "";
    public collisionMap: number[][] = [];

    public x: number;
    public y: number;
    public vx: number;
    public vy: number;
    public angle: number;
    public vangle: number;

    public color: string;

    public energy: number = 1000;

    constructor(public size: number, public parent: Ship) {
        super();

        this.x = parent.x;
        this.y = parent.y;
        this.vx = parent.vx / 2;
        this.vy = parent.vy / 2;
        this.color = parent.color;

        this.angle = Math.round(Math.random() * 360);
        this.vangle = Math.random() * 1;

        const nums = [
            Math.round(Math.random() * 2) + size,
            Math.round(Math.random() * 2) + size,
            Math.round(Math.random() * 2) + size,
        ];

        this.collisionMap = [[-nums[0], -nums[0]], [-nums[1], nums[1]], [nums[2], nums[2]]];

        this.vx += SPREAD * Math.sin(this.angle * Math.PI / 180);
        this.vy -= SPREAD * Math.cos(this.angle * Math.PI / 180);
    }

    public step(delta: number): void {
        this.updatePhysics(delta);
        this.updateEnergy(delta);
    }

    public collide(other: Entity, result: any): void {
        const push = {
            x: result.overlap * result.overlap_x,
            y: result.overlap * result.overlap_y
        };
        this.vx -= result.overlap / 100 * result.overlap_x;
        this.vy -= result.overlap / 100 * result.overlap_y;
        this.vangle += this.angleDiff(other.vx, other.vy, push.x, push.y) % 2;

        if (typeof (<any>other).addDamage !== 'undefined') {
            (<any>other).addDamage(result.overlap, this);
        }
    }

    private updatePhysics(delta: number): void {
        this.vx *= 0.995;
        this.vy *= 0.995;
        this.vangle *= 0.97;
        this.angle += this.vangle;
        this.x += this.vx * delta;
        this.y += this.vy * delta;
    }

    private updateEnergy(delta: number): void {
        if (this.energy <= 0) {
            this.energy = 0;
            this.emit(EntityEvent.Despawn, this);
            return;
        }

        this.energy -= delta;
    }

    private angleDiff(x1 :number, y1 :number, x2 :number, y2 :number) {
        const a1 = Math.atan2(y1, x1);
        const a2 = Math.atan2(y2, x2);

        return (a2 - a1) * 180 / Math.PI;
    }
}
