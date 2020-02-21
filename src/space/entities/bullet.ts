import { EventEmitter } from 'events';
import { Entity, EntityType, EntityEvent } from '../entities';
import { Config } from '../config';

export class Bullet extends EventEmitter implements Entity {
    public id :number;
    public type = EntityType.Bullet;

    public sectorKey :string = "";
    public collisionMap = [[0, 0]];

    public x :number;
    public y :number;
    public vx :number;
    public vy :number;
    public angle :number;

    public color :string;

    private energy :number;

    constructor(type: number, public parent: Entity) {
        super();

        const trait = Config.bullets[type];
        if (!trait) return;

        this.x = parent.x;
        this.y = parent.y;
        this.vx = parent.vx;
        this.vy = parent.vy;
        this.angle = parent.angle;
        this.energy = trait.energy;
        this.color = trait.color;

        this.vx += trait.speed * Math.sin(this.angle * Math.PI / 180);
        this.vy -= trait.speed * Math.cos(this.angle * Math.PI / 180);
    }

    public step() :void {
        this.updatePhysics();
        this.updateEnergy();
    }

    public collide(other :Entity, result :any) :void {
        if (typeof (<any>other).addDamage !== 'undefined') {
            (<any>other).addDamage(this.energy * 2, this);
        }

        this.energy = 0;
    }

    private updatePhysics(): void {
        this.x += this.vx;
        this.y += this.vy;
    }

    private updateEnergy(): void {
        if (this.energy <= 0) {
            this.energy = 0;
            this.emit(EntityEvent.Despawn, this);
            return;
        }

        this.energy -= 0.5;
    }
}
