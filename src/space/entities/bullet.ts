import { EventEmitter } from 'events';
import { Entity, EntityType, EntityEvent } from '../entities.js';
import { Config } from '../config_interfaces.js';

export class Bullet extends EventEmitter implements Entity {
    public id :number = 0;
    public type = EntityType.Bullet;

    public sectorKey: string = "";
    public newSector: number = 1;
    public collisionMap = [[-2, -2], [-2, 2], [2, 2], [2, -2]];
    public mass = 5;

    public x: number = 0;
    public y: number = 0;
    public vx: number = 0;
    public vy: number = 0;
    public angle: number = 0;

    public color: string = "#000000";

    private energy: number = 1000;
    private damage: number = 0;

    private immune: EntityType[] = [
        EntityType.ShipDebris,
        EntityType.Prize,
    ];

    constructor(public bulletType: number, public parent: Entity, public config?: Config) {
        super();

        if (!config || !config.bullets) return;

        const trait = config.bullets[bulletType];
        if (!trait) return;

        this.x = parent.x;
        this.y = parent.y;
        this.vx = parent.vx ?? 0;
        this.vy = parent.vy ?? 0;
        this.angle = parent.angle ?? 0;
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
        this.step(0);
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
