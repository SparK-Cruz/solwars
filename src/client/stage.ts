import { EventEmitter } from 'events';
import { Entity } from '../space/entities.js';
import { Stage as Base } from '../space/stage_interface.js';

function validOrDefault(value: any, defaultValue: any): any {
    return typeof value != 'undefined'
        ? value
        : defaultValue;
}

export class Stage extends EventEmitter implements Base {
    public tick: number = 0;
    public radius: number = 0;
    public entities: any = {};

    public step(factor: number = 1): number {
        this.tick++;
        this.tick = this.tick % (Number.MAX_SAFE_INTEGER - 1);
        (Object.values(this.entities) as Entity[]).forEach((e: Entity) => {
            if (e.step) e.step(factor);
        });

        return this.tick;
    }

    public clear() {
        this.entities = {};
        this.emit('clear');
    }

    public add(entity: Entity | null, removable = true) {
        if (!entity || !entity.id) return;
        const props = <any>entity;
        props.removable = removable;

        const isNew = !this.entities.hasOwnProperty(entity.id);
        const current = <any>this.entities[entity.id.toFixed(0)] ?? entity;

        Object.assign(current, {
            // generic
            type: validOrDefault(props.type, current.type),
            id: validOrDefault(props.id, current.id),
            x: validOrDefault(props.x, current.x),
            y: validOrDefault(props.y, current.y),
            vx: validOrDefault(props.vx, current.vx),
            vy: validOrDefault(props.vy, current.vy),
            angle: validOrDefault(props.angle, current.angle),
            vangle: validOrDefault(props.vangle, current.vangle),
            damage: validOrDefault(props.damage, current.damage),
            health: validOrDefault(props.health, current.health),
            color: validOrDefault(props.color, current.color),
            alive: validOrDefault(props.alive, current.alive),

            //ship
            name: validOrDefault(props.name, current.name),
            model: validOrDefault(props.model, current.model),
            decals: validOrDefault(props.decals, current.decals),
            vmax: validOrDefault(props.vmax, current.vmax),
            control: validOrDefault(props.control, current.control),
            power: validOrDefault(props.power, current.power),

            //bullet
            parent: validOrDefault(props.parent, current.parent),
            bulletType: validOrDefault(props.bulletType, current.bulletType),

            //ship debris
            options: validOrDefault(props.options, current.options),
            size: validOrDefault(props.size, current.size),
            energy: validOrDefault(props.energy, current.energy),

            //rock
            sides: validOrDefault(props.sides, current.sides),
            collisionMap: validOrDefault(props.collisionMap, current.collisionMap),
        });

        if (isNew && !entity.type?.name) {
            console.log("Server sent a partial of an unseen id", current.id);
            // this.emit('resync', current.id);
            return;
        }

        current.hasStage = true;
        this.entities[current.id.toFixed(0)] = current;

        isNew && this.emit('newEntity', current);
    }

    public spawn(entity: Entity) {
        this.add(entity);
    }

    public addAll(entities: Entity[]) {
        const received: number[] = [];
        for (const i in entities) {
            received.push(entities[i].id);
            this.add(entities[i]);
        }

        for (const id in this.entities) {
            if (
                received.includes(parseInt(id))
                || !((<any>this.entities[id]).removable)
            ) {
                continue;
            }

            this.remove({id: parseInt(id)} as Entity);
        }
    }

    public remove({id}: Entity) {
        if (!this.entities.hasOwnProperty(id))
            return;

        this.emit('despawn', id);

        this.entities[id].hasStage = false;
        this.entities[id] = null;
        delete this.entities[id];
    }

    public fetchAllEntities(): Entity[] {
        return (Object.values(this.entities) as Entity[]).filter((e: Entity) => e.type);
    }

    public moveEntity(entity: Entity, position: { x: number; y: number; }): void {
        entity.x = position.x;
        entity.y = position.y;
    }
    public fetchEntitiesAround(point: { x: number; y: number; }): Entity[][] {
        return [this.fetchAllEntities()];
    }
}
