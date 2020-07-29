import { EventEmitter } from 'events';
import { Entity, EntityType, EntityEvent } from '../entities';
import { Config } from '../config';

export class Bullet extends EventEmitter implements Entity {
    public id :number;
    public type = EntityType.Bullet;

    public sectorKey: string = "";
    public newSector: number = 0;
    public collisionMap = [[-2, -2], [-2, 2], [2, 2], [2, -2]];
    public mass = 5;

    public x: number;
    public y: number;
    public vx: number;
    public vy: number;
    public angle: number;

    public color: string;

    private energy: number;
    private damage: number;

    private immune: EntityType[] = [
        EntityType.ShipDebris,
        EntityType.Prize,
    ];

    constructor(public bulletType: number, public parent: Entity) {
        super();

        if (!Config.bullets) return;

        const trait = Config.bullets[bulletType];
        if (!trait) return;

        this.x = parent.x;
        this.y = parent.y;
        this.vx = parent.vx;
        this.vy = parent.vy;
        this.angle = parent.angle;
        this.energy = trait.energy;
        this.damage = trait.energy;
        this.color = trait.color;

        this.vx += trait.speed * Math.sin(this.angle * Math.PI / 180);
        this.vy -= trait.speed * Math.cos(this.angle * Math.PI / 180);
    }

    public step(delta: number) :void {
        this.updatePhysics(delta);
        this.updateEnergy(delta);
    }

    public collide(other :Entity, result :any) :void {
        if (this.immune.includes(other.type))
            return;

        if (typeof (<any>other).addDamage !== 'undefined') {
            (<any>other).addDamage(this.damage, this);
        }

        this.energy = 0;
        this.emit(EntityEvent.Collide, this);
    }

    private updatePhysics(delta: number): void {
        this.x += this.vx * delta;
        this.y += this.vy * delta;
    }

    private updateEnergy(delta: number): void {
        if (this.energy <= 0) {
            this.energy = 0;
            this.emit(EntityEvent.Despawn, this);
            return;
        }

        this.energy -= 1 * delta;
    }
}
