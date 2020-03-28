import { EventEmitter } from 'events';
import { Entity } from '../space/entities';

export class Stage extends EventEmitter {
    public tick: number;
    public entities: any = {};

    public step() {
        this.tick++;
        this.tick = this.tick % (Number.MAX_SAFE_INTEGER - 1);
        Object.values(this.entities).forEach((e: Entity) => {
            if (e.step) e.step(1);
        });
    }

    public clear() {
        this.entities = {};
        this.emit('clear');
    }

    public add(entity: Entity, removable = true) {
        if (!entity.id) return;
        (<any>entity).removable = removable;

        if (this.entities.hasOwnProperty(entity.id)) {
            Object.assign(this.entities[entity.id], entity);
            return;
        }

        this.entities[entity.id] = entity;
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
        this.entities[id] = null;
        delete this.entities[id];
    }

    public fetchAllEntities(): Entity[] {
        return Object.values(this.entities);
    }
}
