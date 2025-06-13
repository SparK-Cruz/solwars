import { EventEmitter } from 'events';
import { Entity, EntityPoolGrid, EntityEvent, EntityType } from './entities';
import { Bullet } from './entities/bullet';
import { ShipDebris } from './entities/ship_debris';
import { Ship } from './entities/ship';
import * as json from 'jsonfile';
import { CodecFacade } from './codec_facade';
import { Rock } from './entities/rock';
import { Prize } from './entities/prize';
import { PrizeSpawner } from './entity_spawner/prize_spawner';
import { GravityWell } from './entities/gravity_well';
import { Config } from './config';

export class Stage extends EventEmitter {
    public tick = 0;
    public radius: number = 0;

    private spawnRadius: number = 5000;
    private radiusSurvivalSeconds: number = 0;

    private shapes: any = {};
    private collisionResult: any = null;

    private sectors = new EntityPoolGrid();

    private steppers: Entity[] = [];

    public constructor(public collisionSystem: any, mapName: string) {
        super();
        this.collisionResult = this.collisionSystem.createResult();

        this.on('step', (delta) => {
            for (let i = 0; i < this.steppers.length; i++) {
                if (!(this.steppers[i]))
                    continue;

                const stepper: any & Entity = this.steppers[i];

                stepper.step(delta);
                this.sectors.updateGrid(stepper);

                if (
                    this.radius > 0
                    && this.radiusSurvivalSeconds > 0
                    && stepper.addDamage
                ) {
                    const distance = Math.sqrt(Math.pow(stepper.y, 2) + Math.pow(stepper.x, 2));
                    if (distance >= this.radius) {
                        stepper.addDamage(
                            stepper.health
                            / (delta * (1000 / Config.TPS) * this.radiusSurvivalSeconds)
                        );
                    }
                }
            }
        });

        if (!mapName) {
            return;
        }

        // load map
        json.readFile(`./maps/${mapName}.json`, (err: any, contents: any) => {
            if (err) {
                console.log(err);
                return;
            }
            if (contents.hasOwnProperty('npe')) {
                const codec = new CodecFacade();
                for (let i in contents.npe) {
                    const entity = codec.decodeEntity(<Entity>contents.npe[i]);

                    this.add(entity);

                    if (entity.hasOwnProperty('stage')) {
                        (<any>entity).stage = this;
                    }
                }
            }

            if (contents.hasOwnProperty('stage')) {
                this.radius = contents.stage.radius ?? this.radius;
                this.radiusSurvivalSeconds = contents.stage.radiusSurvivalSeconds ?? this.radiusSurvivalSeconds;
                this.spawnRadius = contents.stage.spawnRadius ?? this.spawnRadius;
            }
        });
    }

    public moveEntity(entity: Entity, position: { x: number, y: number }) {
        entity.x = position.x;
        entity.y = position.y;
        this.sectors.updateGrid(entity);
    }

    public add(entity: Entity) {
        this.sectors.add(entity);

        const shape = this.addOrFetchCollisionShape(entity);
        if (shape) {
            shape.x = entity.x;
            shape.y = entity.y;
            shape.angle = entity.angle * Math.PI / 180;
        }

        (<any>entity).on(EntityEvent.Spawn, this.onSpawnChildEntity);
        (<any>entity).on(EntityEvent.Despawn, this.onDespawnEntity);
        (<any>entity).on(EntityEvent.Collide, this.onCollideEntity);

        this.addStepper(entity);
    }

    public spawn(entity: Entity) {
        const spawnRadius = this.spawnRadius;
        const x = (Math.random() * spawnRadius) - spawnRadius / 2;
        const y = (Math.random() * spawnRadius) - spawnRadius / 2;
        this.add(entity);
        this.moveEntity(entity, {x, y});
    }

    public remove(entity: Entity) {
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
        (<any>entity).off(EntityEvent.Collide, this.onCollideEntity);
    }

    public addAll(entities: Entity[]) {
        entities.forEach(entity => this.add(entity));
    }

    public step(delta: number): number {
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

    public fetchEntitiesAround(point: { x: number, y: number }): Entity[][] {
        return this.sectors.fetchAroundCoord(point);
    }

    private addStepper(listener: Entity) {
        this.steppers.push(listener);
    }

    private removeStepper(listener: Entity) {
        for (let i = this.steppers.length - 1; i >= 0; i--) {
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
        for (let i in this.shapes) {
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

    private onSpawnChildEntity = (entityType: EntityType, entityModel: any, parent: Entity, offset: { x: number, y: number } = null) => {
        let entity: Entity = null;
        switch (entityType.name) {
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
                Object.assign(entity, { x: parent.x, y: parent.y });
                break;
            case EntityType.GravityWell.name:
                entity = new GravityWell();
                Object.assign(entity, entityModel);
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

    private onCollideEntity = (entity: Entity) => {
        this.emit(EntityEvent.Collide, entity.id);
    }
}
