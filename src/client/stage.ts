import { EventEmitter } from 'events';
import { Entity } from '../space/entities.js';
import { Stage as Base } from '../space/stage_interface.js';

const SEEN_BUFFER_SIZE = 100;

function validOrDefault(value: any, defaultValue: any): any {
    return typeof value != 'undefined'
        ? value
        : defaultValue;
}

export class Stage extends EventEmitter implements Base {
    public tick: number = 0;
    public radius: number = 0;
    public entities: any = {};
    private seen: number[] = [];

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
        this.seen = [];
        this.emit('clear');
    }

    public add(entity: Entity | null, removable = true) {
        if (!entity || !entity.id) return;
        (<any>entity).removable = removable;

        if (this.entities.hasOwnProperty(entity.id)) {
            const props = <any>entity;
            const current = <any>this.entities[entity.id];
            Object.assign(this.entities[entity.id], {
                id: validOrDefault(props.id, current.id),
                name: validOrDefault(props.name, current.name), // ship
                x: validOrDefault(props.x, current.x),
                y: validOrDefault(props.y, current.y),
                vx: validOrDefault(props.vx, current.vx),
                vy: validOrDefault(props.vy, current.vy),
                vmax: validOrDefault(props.vmax, current.vmax), // ship
                angle: validOrDefault(props.angle, current.angle),
                vangle: validOrDefault(props.vangle, current.vangle),
                control: validOrDefault(props.control, current.control), // ship
                damage: validOrDefault(props.damage, current.damage),
                health: validOrDefault(props.health, current.health),
                color: validOrDefault(props.color, current.color),
                //ship
                model: validOrDefault(props.model, current.model),
                decals: validOrDefault(props.decals, current.decals),
                //bullet
                parent: validOrDefault(props.parent, current.parent),
                bulletType: validOrDefault(props.bulletType, current.bulletType),
                //ship debris
                options: validOrDefault(props.options, current.options),
                size: validOrDefault(props.size, current.size),
                energy: validOrDefault(props.energy, current.energy),
                //rock
                sides: validOrDefault(props.sides, current.sides),
                // all
                type: validOrDefault(props.type, current.type),
            });
            return;
        }

        if (!entity.type?.name) {
            return;
        }

        this.entities[entity.id] = entity;

        if (~this.seen.indexOf(entity.id))
            return;

        this.emit('newEntity', entity);
        this.seen.push(entity.id);
        if (this.seen.length > SEEN_BUFFER_SIZE) {
            this.seen.shift();
        }
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

        this.entities[id].id = 0;
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
