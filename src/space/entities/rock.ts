import { EventEmitter } from 'events';
import { Entity, EntityType } from '../entities.js';

const FRICTION = 0.995;

export class Rock extends EventEmitter implements Entity {
    public id: number = 0;
    public type = EntityType.Rock;

    public sectorKey: string = "";
    public newSector: number = 1;
    public collisionMap: number[][] = [];
    public mass = 100000;

    public x :number = 0;
    public y :number = 0;
    public vx :number = 0;
    public vy :number = 0;
    public angle :number = 0;
    public vangle :number = 0;

    public color: string = '#474747';

    constructor(public size: number, public sides: number) {
        super();

        const sideVariation = Math.random() * 0.3 + 0.7;
        const theta = 360 / Math.round(sides * sideVariation);
        const radius = size / 2;
        for (let i = 0; i<sides; i++) {
            const surfaceVariation = Math.random() * 0.2 + 0.8;
            const tethaVariation = Math.random() * 0.2 + 0.8;
            this.collisionMap.push([
                surfaceVariation * radius * Math.sin(theta*(i + tethaVariation) * Math.PI / 180),
                surfaceVariation * radius * Math.cos(theta*(i + tethaVariation) * Math.PI / 180),
            ]);
        }

        this.vangle = Math.random() * 4 - 2;
    }

    public step(delta: number) :void {
        this.updatePhysics(delta);
    }

    public collide(other :Entity, result :any) :void {
        Entity.defaultCollide.call(this, other, result);
        this.vangle = this.vangle % 2;
    }

    private updatePhysics(delta: number): void {
        this.angle += this.vangle * delta;
        this.x += this.vx * delta;
        this.y += this.vy * delta;

        this.vx *= FRICTION;
        this.vy *= FRICTION;
    }
}
