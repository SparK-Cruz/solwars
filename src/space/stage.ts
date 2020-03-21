import { EventEmitter } from 'events';
import { Entity, EntityPoolGrid, EntityEvent, EntityType } from './entities';
import { Bullet } from './entities/bullet';
import { ShipDebris } from './entities/ship_debris';
import { Ship } from './entities/ship';
import * as json from 'jsonfile';
import { CodecFacade } from './codec_facade';
import { EntitySpawner } from './entity_spawner';
import { Rock } from './entities/rock';
import { Prize } from './entities/prize';
import { PrizeSpawner } from './entity_spawner/prize_spawner';

export class Stage extends EventEmitter {
    public tick = 0;

    private shapes :any = {};
    private collisionResult :any = null;

    private sectors = new EntityPoolGrid();

    private steppers: Entity[] = [];

    public constructor(public collisionSystem :any) {
        super();
        this.collisionResult = this.collisionSystem.createResult();

        this.on('step', (delta) => {
            for(let i=0; i<this.steppers.length; i++) {
                if (!(this.steppers[i]))
                    continue;

                this.steppers[i].step(delta);
                this.sectors.updateGrid(this.steppers[i]);
            }
        });

        json.readFile('./maps/default.json', (err: any, contents: any) => {
            if (err) {
                console.log(err);
                return;
            }
            if (!contents.hasOwnProperty('npe'))
                return;

            const codec = new CodecFacade();
            for(let i in contents.npe) {
                if (contents.npe[i].spawner) {
                    this.add(codec.decodeSpawner(contents.npe[i]));
                    continue;
                }
                this.add(codec.decodeEntity(<Entity>contents.npe[i]));
            }
        });
    }

    public add(entity :Entity) {
        this.sectors.add(entity);

        const shape = this.addOrFetchCollisionShape(entity);
        if (shape) {
            shape.x = entity.x;
            shape.y = entity.y;
            shape.angle = entity.angle * Math.PI / 180;
        }

        (<any>entity).on(EntityEvent.Spawn, this.onSpawnChildEntity);
        (<any>entity).on(EntityEvent.Despawn, this.onDespawnEntity);

        this.addStepper(entity);
    }

    public remove(entity :Entity) {
        this.removeStepper(entity);
        this.sectors.remove(entity.id);

        const shape = this.shapes[entity.id];

        if (shape) {
            this.collisionSystem.remove(shape);
            this.collisionSystem.update();
            delete this.shapes[entity.id];
        }

        (<any>entity).off(EntityEvent.Spawn, this.onSpawnChildEntity);
        (<any>entity).off(EntityEvent.Despawn, this.onDespawnEntity);
    }

    public addAll(entities :Entity[]) {
        entities.forEach(entity => this.add(entity));
    }

    public step(delta: number) :number {
        this.tick++;
        this.tick = this.tick % (Number.MAX_SAFE_INTEGER - 1);
        this.emit('step', delta);

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

    public fetchEntitiesAround(point :{x :number, y :number}) :Entity[][] {
        return this.sectors.fetchAroundCoord(point);
    }

    private addStepper(listener: Entity) {
        this.steppers.push(listener);
    }

    private removeStepper(listener: Entity) {
        for(let i = this.steppers.length - 1; i >= 0; i--) {
            if (this.steppers[i].id != listener.id)
                continue;

            this.steppers.splice(i, 1);
            return;
        }
    }

    private addOrFetchCollisionShape(entity: Entity) {
        if (this.shapes.hasOwnProperty(entity.id)) {
            return this.shapes[entity.id];
        }
        if (!entity.id) {
            return null;
        }

        if (typeof entity.collisionMap == 'undefined') {
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
            case EntityType.ShipDebris.name:
                entity = new ShipDebris(entityModel, <Ship>parent);
                break;
            case EntityType.Rock.name:
                entity = new Rock(entityModel.size, entityModel.sides);
                Object.assign(entity, parent);
                break;
            case EntityType.Prize.name:
                entity = new Prize(entityModel, <PrizeSpawner>parent);
                Object.assign(entity, {x: parent.x, y: parent.y});
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
        this.remove(entity);
        this.emit(EntityEvent.Despawn, entity.id);
    }
}
