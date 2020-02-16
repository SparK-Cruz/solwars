import { EventEmitter } from 'events';
import { Entity, EntityPoolGrid, EntityEvent, EntityType } from './entities';
import { Bullet } from './entities/bullet';

export class Stage extends EventEmitter {
    public static PASSIVE_MODE = "passive_mode";
    public static ACTIVE_MODE = "active_mode";
    public tick = 0;

    private passiveMode = true;
    private shapes :any = {};
    private collisionResult :any = null;

    private sectors = new EntityPoolGrid('sectorKey', 1000);

    public constructor(public collisionSystem :any = null) {
        super();

        if (this.collisionSystem) {
            this.passiveMode = false;
            this.collisionResult = this.collisionSystem.createResult();
        }
    }

    public add(entity :Entity) {
        this.sectors.add(entity);

        if (this.passiveMode)
            return;

        const shape = this.addOrFetchCollisionShape(entity);
        shape.x = entity.x;
        shape.y = entity.y;
        shape.angle = entity.angle * Math.PI / 180;

        (<any>entity).on(EntityEvent.Spawn, this.onSpawnChildEntity);
        (<any>entity).on(EntityEvent.Despawn, this.onDespawnEntity);
    }

    public remove(id :number) {
        this.sectors.remove(id);

        if (this.passiveMode)
            return;
        
        const shape = this.shapes[id];
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

    public step() :number {
        this.tick++;
        this.tick = this.tick % (Number.MAX_SAFE_INTEGER - 1);
        this.sectors.step();

        if (this.passiveMode)
            return this.tick;

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
        const scale = this.sectors.scale;
        const entities :Entity[] = [];

        for (let i = 0; i < 9; i++) {
            const offset = {
                x: Math.floor(i / 3) - 1,
                y: (i % 3) - 1
            };
            const coord = {
                x: offset.x * scale + point.x,
                y: offset.y * scale + point.y
            };

            const key = this.sectors.localCoordName(coord);
            const pool = this.sectors.pools[key];
            if (!pool) continue;

            for (let i in pool.entities) {
                const entity = pool.find(i);
                entities.push(entity);
            }
        }

        return entities;
    }

    public fetchAllEntities() :Entity[] {
        return this.sectors.allEntities();
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
            entity.x += offset.x + parent.vx;
            entity.y += offset.y + parent.vy;
        }

        this.add(entity);
    }

    private onDespawnEntity = (entity: Entity) => {
        this.emit(EntityEvent.Despawn, entity.id);
        this.remove(entity.id);
    }
}
