import { EventEmitter } from 'events';
import { Model } from './ships/model.js';
import { Control } from './ships/control.js';
import { Decal } from './ships/decal.js';
import * as entities from '../entities.js';
import { Config, ShipConfig } from '../config_interfaces.js';

function inRads(degrees :number) :number {
    return degrees * Math.PI / 180;
}

const INERTIAL_DUMP = 0.0028;

// the more delta aproaches zero
// the more we correct the dump
// this rate is maximum correction
const DUMP_CORRECTION = 0.00635;

export class Ship extends EventEmitter implements entities.Entity {
    type = entities.EntityType.Ship;
    id :number = 0;
    model :string;
    name: string = "Nemo";

    sectorKey: string = "";
    newSector: number = 1;

    collisionMap :number[][] = [];
    mass = 100;

    x = 0;
    y = 0;
    vx = 0;
    vy = 0;

    color = '#aaaaaa';

    decals :Decal[] = [
        {name: 'decal0', color: '#ff5544'}
    ];

    guns: {x: number, y: number, cooldown: number}[] = [{
        x: 0,
        y: 16,
        cooldown: 0,
    }];
    nextGun = 0;

    vmax = 5;
    turnSpeed = 3.8;
    power = 0.05;

    angle = 0;
    vangle = 0;

    health = 100;
    regen = 1;
    damage = 0;
    alive = true;

    control = 0;

    bullet = 0;
    bomb = 0;

    afterburnerCost = 6;
    shootCost = 150;

    constructor(model :Model, private config?: Config) {
        super();

        this.model = model.id;
        this.color = model.color;
        this.decals = JSON.parse(JSON.stringify(model.decals));
        this.collisionMap = model.polygon;

        if (model.guns) {
            this.guns = JSON.parse(JSON.stringify(model.guns));
            for (const i in this.guns) {
                this.guns[i].cooldown = 0;
            }
        }

        if (this.config && this.config.ships) {
            // server only

            const traits = (<any> this.config.ships)[model.id] as ShipConfig;
            if (!traits) return;

            this.vmax = traits.speed;
            this.turnSpeed = traits.spin;
            this.power = traits.acceleration;
            this.health = traits.energy;
            this.regen = traits.regeneration;

            this.bullet = traits.bullet;
            this.bomb = traits.bomb;
        }
    }

    step(delta: number) :void {
        if (this.alive) this.readControls(delta);

        this.updatePhysics(delta);
        this.updateHealth(delta);
        this.updateGuns(delta);
    }

    collide(other :entities.Entity, result :any) :void {
        entities.Entity.defaultCollide.call(this, other, result);
    }

    addDamage(damage: number, origin?: entities.Entity) {
        const wasAlive = this.alive;

        this.damage += damage;
        this.updateHealth(0);

        if (wasAlive && !this.alive) {
            this.die(origin ?? this);
        }
    }

    private canAfterburn(delta: number) {
        return this.damage + this.afterburnerCost * delta < this.health;
    }

    private canShoot(cost: number) {
        return (this.damage + cost < this.health && !this.guns[this.nextGun].cooldown);
    }

    private readControls(delta: number) {
        this.readThrust(delta);
        this.readStrafe(delta);
        this.readTurn();
        this.readShoot();
    }
    private readThrust(delta: number) {
        let power = this.power;
        const thrust = Control.thrusting(this.control);

        if (Control.afterburning(this.control)
            && thrust
            && this.canAfterburn(delta)) {
            power *= 2;
            this.damage += this.afterburnerCost * delta;
        }

        this.vx += (thrust * power) * Math.sin(inRads(this.angle)) * delta;
        this.vy -= (thrust * power) * Math.cos(inRads(this.angle)) * delta;
    }
    private readStrafe(delta: number) {
        let strife = Control.strifing(this.control);

        let power = this.power * 0.7;
        let sideAngle = this.angle + 90;

        this.vx += (strife * power) * Math.sin(inRads(sideAngle)) * delta;
        this.vy -= (strife * power) * Math.cos(inRads(sideAngle)) * delta;
    }
    private readTurn() {
        let turn = Control.turning(this.control);
        this.vangle = turn * this.turnSpeed;
    }
    private readShoot() {
        if (!this.config?.bullets)
            return;

        const bulletTraits = this.config.bullets[this.bullet];

        if (!Control.shooting(this.control)
            || !this.canShoot(bulletTraits.cost))
            return;

        const gun = this.guns[this.nextGun];

        const offset = {
            x: + gun.y * Math.sin(inRads(this.angle))
                + gun.x * Math.sin(inRads(this.angle + 90)),
            y: - gun.y * Math.cos(inRads(this.angle))
                - gun.x * Math.cos(inRads(this.angle + 90)),
        };

        if (bulletTraits) {
            gun.cooldown += bulletTraits.cooldown;
        }

        if (this.guns.length == ++this.nextGun) {
            this.nextGun = 0;
        }

        this.damage += bulletTraits.cost;
        this.emit(entities.EntityEvent.Spawn, entities.EntityType.Bullet, this.bullet, this, offset);
    }

    private updatePhysics(delta: number) {
        this.vx -= this.vx * INERTIAL_DUMP * (delta + (DUMP_CORRECTION * (1 - delta)));
        this.vy -= this.vy * INERTIAL_DUMP * (delta + (DUMP_CORRECTION * (1 - delta)));

        this.x += this.vx * delta;
        this.y += this.vy * delta;
        this.angle += this.vangle * delta;
        this.vangle = 0;

        this.correctSpeed(delta);
        this.correctAngle();
    }

    private correctSpeed(delta: number) {
        const avx = Math.abs(this.vx);
        const avy = Math.abs(this.vy);
        const total = Math.sqrt(Math.pow(avx, 2) + Math.pow(avy, 2));
        const max = this.vmax * (1 + (Control.afterburning(this.control) & <any>(this.canAfterburn(delta))));

        if (avx < 0.001)
            this.vx = 0;

        if (avy < 0.001)
            this.vy = 0;

        if (total > max) {
            this.vx -= (this.vx / total * this.power) * delta;
            this.vy -= (this.vy / total * this.power) * delta;
        }
    }

    private correctAngle() {
        this.angle = this.angle % 360;
        if (this.angle < 0) {
            this.angle += 360;
        }
    }

    private die(killer: any) {
        const debris = 14;
        const size = 3;
        const parent = {
                id: this.id,
                x: this.x,
                y: this.y,
                vx: this.vx,
                vy: this.vy,
                color: this.color,
        };

        for(let i = 0; i < debris; i++) {
            const angle = (360 / debris) * (i + 1);
            const offset = {
                x: size * 2.5 * Math.sin(angle * Math.PI / 180),
                y: -size * 2.5 * Math.cos(angle * Math.PI / 180),
            };
            this.emit(entities.EntityEvent.Spawn, entities.EntityType.ShipDebris, {size, angle}, parent, offset);
        }

        this.emit(entities.EntityEvent.Die, killer);
    }

    private updateHealth(delta: number) {
        this.alive = this.damage < this.health;

        if (this.damage <= 0) {
            this.damage = 0;
            return;
        }

        if (!this.alive)
            return;

        this.damage -= this.regen * delta;
    }

    private updateGuns(delta: number) {
        for (const i in this.guns) {
            if (this.guns[i].cooldown <= 0) {
                this.guns[i].cooldown = 0;
                continue;
            }

            this.guns[i].cooldown -= 1 * delta;
        }
    }
}

export namespace ShipEvents {
    export const Upgrade = 'upgrade';
}
