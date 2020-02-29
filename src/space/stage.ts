import { EventEmitter } from 'events';
import { Entity, EntityPoolGrid, EntityEvent, EntityType } from './entities';
import { Bullet } from './entities/bullet';

export class Stage extends EventEmitter {
    public tick = 0;

    private shapes :any = {};
    private collisionResult :any = null;

    private sectors = new EntityPoolGrid();

    public constructor(public collisionSystem :any) {
        super();
        this.collisionResult = this.collisionSystem.createResult();
    }

    public add(entity :Entity) {
        this.sectors.add(entity);

        const shape = this.addOrFetchCollisionShape(entity);
        shape.x = entity.x;
        shape.y = entity.y;
        shape.angle = entity.angle * Math.PI / 180;

        (<any>entity).on(EntityEvent.Spawn, this.onSpawnChildEntity);
        (<any>entity).on(EntityEvent.Despawn, this.onDespawnEntity);
    }

    public remove(id :number) {
        this.sectors.remove(id);

        const shape = this.shapes[id];

        if (!shape)
            return;

        const entity = shape.entity;
        this.collisionSystem.remove(shape);
        this.collisionSystem.update();
        delete this.shapes[id];

        (<any>entity).off(EntityEvent.Spawn, this.onSpawnChildEntity);
        (<any>entity).off(EntityEvent.Despawn, this.onDespawnEntity);
    }

    public addAll(entities :Entity[]) {
        entities.forEach(entity => this.add(entity));
    }

    public step(delta: number) :number {
        this.tick++;
        this.tick = this.tick % (Number.MAX_SAFE_INTEGER - 1);
        this.sectors.step(delta);

        for (let i in this.shapes) {
            const shape = this.shapes[i];
            shape.x = shape.entity.x;
            shape.y = shape.entity.y;
            shape.angle = shape.entity.angle * Math.PI / 180;
        }

        this.collisionSystem.update();
        this.checkCollisionsBroad();

        return this.tick;
    }

    public fetchEntitiesAround(point :{x :number, y :number}) :Entity[] {
        return this.sectors.fetchAroundCoord(point);
    }

    private addOrFetchCollisionShape(entity: Entity) {
        if (this.shapes.hasOwnProperty(entity.id)) {
            return this.shapes[entity.id];
        }
        if (!entity.id) {
            return null;
        }

        const shape = <any>this.collisionSystem.createPolygon(entity.x, entity.y, entity.collisionMap, entity.angle);
        shape.entity = entity;
        this.shapes[entity.id] = shape;

        return shape;
    }

    private checkCollisionsBroad() {
        for(let i in this.shapes) {
            const shape = this.shapes[i];
            const potentials = shape.potentials();
            if (!potentials.length)
                continue;

            this.checkCollisionsNarrow(shape);
        }
    }

    private checkCollisionsNarrow(shape: any) {
        for (const body of shape.potentials()) {
            const collision = shape.collides(body, this.collisionResult);
            if (!collision)
                continue;

            shape.entity.collide(body.entity, this.collisionResult);
        }
    }

    private onSpawnChildEntity = (entityType: EntityType, entityModel: any, parent: Entity, offset: {x: number, y: number} = null) => {
        let entity: Entity = null;
        switch(entityType.name) {
            case EntityType.Bullet.name:
                entity = new Bullet(entityModel, parent);
                break;
            // case EntityType.Ship.name:
            // ships aren't child entities yet... we still don't have carriers nor turrets...
        }

        if (offset) {
            entity.x += offset.x;
            entity.y += offset.y;
        }

        this.add(entity);
    }

    private onDespawnEntity = (entity: Entity) => {
        this.emit(EntityEvent.Despawn, entity.id);
        this.remove(entity.id);
    }
}
