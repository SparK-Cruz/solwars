import { EventEmitter } from 'events';
import { Entity, EntityType } from '../space/entities';

const SEEN_BUFFER_SIZE = 100;

export class Stage extends EventEmitter {
    public tick: number;
    public entities: any = {};
    private seen: number[] = [];

    public step() {
        this.tick++;
        this.tick = this.tick % (Number.MAX_SAFE_INTEGER - 1);
        Object.values(this.entities).forEach((e: Entity) => {
            if (e.step) e.step(1);
        });
    }

    public clear() {
        this.entities = {};
        this.seen = [];
        this.emit('clear');
    }

    public add(entity: Entity, removable = true) {
        if (!entity.id) return;
        (<any>entity).removable = removable;

        if (this.entities.hasOwnProperty(entity.id)) {
            const props = <any>entity;
            const current = <any>this.entities[entity.id];
            Object.assign(this.entities[entity.id], {
                id: props.id || current.id,
                name: props.name || current.name, // ship
                x: props.x || current.x,
                y: props.y || current.y,
                vx: props.vx || current.vx,
                vy: props.vy || current.vy,
                vmax: props.vmax || current.vmax, // ship
                angle: props.angle || current.angle,
                vangle: props.vangle || current.vangle,
                control: props.control || current.control, // ship
                damage: props.damage || current.damage,
                health: props.health || current.health,
                color: props.color || current.color,
                //ship
                model: props.model || current.model,
                decals: props.decals || current.decals,
                //bullet
                parent: props.parent || current.parent,
                bulletType: props.bulletType || current.bulletType,
                //ship debris
                options: props.options || current.options,
                size: props.size || current.size,
                energy: props.energy || current.energy,
                //rock
                sides: props.sides || current.sides,
                // all
                type: props.type || current.type,
            });
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

    public addAll(entities: Entity[]) {
        const received: number[] = [];
        for (const i in entities) {
            received.push(entities[i].id);
            this.add(entities[i]);
        }

        for (const id in this.entities) {
            if (received.includes(parseInt(id))
                || !((<any>this.entities[id]).removable))
                continue;

            this.remove(parseInt(id));
        }
    }

    public remove(id: number) {
        if (!this.entities.hasOwnProperty(id))
            return;

        this.emit('despawn', id);

        this.entities[id].id = 0;
        this.entities[id] = null;
        delete this.entities[id];
    }

    public fetchAllEntities(): Entity[] {
        return <Entity[]>Object.values(this.entities).filter((e: Entity) => e.type);
    }
}
