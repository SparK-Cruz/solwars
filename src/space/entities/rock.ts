import { EventEmitter } from 'events';
import { Entity, EntityType } from '../entities';

export class Rock extends EventEmitter implements Entity {
    public id :number;
    public type = EntityType.Rock;

    public sectorKey :string = "";
    public collisionMap: number[][] = [];
    public mass = 100000;

    public x :number;
    public y :number;
    public vx :number;
    public vy :number;
    public angle :number;
    public vangle :number;

    public color: string = '#474747';

    constructor(public size: number, public sides: number) {
        super();

        const theta = 360 / sides;
        for (let i = 0; i<sides; i++) {
            this.collisionMap.push([
                size/2 * Math.sin(theta*i * Math.PI / 180),
                size/2 * Math.cos(theta*i * Math.PI / 180),
            ]);
        }
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
    }
}
