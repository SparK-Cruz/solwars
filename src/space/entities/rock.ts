import { Entity, EntityType, EntityEvent } from '../entities';

export class Rock implements Entity {
    public id :number;
    public type = EntityType.Bullet;

    public sectorKey :string = "";
    public collisionMap = [
        [0, -30],
        [21, -21],
        [30, 0],
        [21, 21],
        [0, 30],
        [-21, 21],
        [-30, 0],
        [-21, -21],
    ];

    public x :number;
    public y :number;
    public vx :number;
    public vy :number;
    public angle :number;
    public vangle :number;

    constructor() {
        const initialSpeed = 0.5;

        this.angle += this.vangle;
        this.vx = initialSpeed * Math.sin(this.angle * Math.PI / 180);
        this.vy = initialSpeed * Math.cos(this.angle * Math.PI / 180);
    }

    public step(delta: number) :void {
        this.updatePhysics(delta);
    }

    public collide(other :Entity, result :any) :void {
        if (typeof (<any>other).addDamage !== 'undefined') {
            (<any>other).addDamage(result.overlap * 140, other);
        }
    }

    private updatePhysics(delta: number): void {
        this.x += this.vx * delta;
        this.y += this.vy * delta;
    }
}
