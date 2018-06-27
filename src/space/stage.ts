import { Entity, EntityPool, EntityPoolGrid } from './entities';
import { Ship } from './entities/ship';
import { Control } from './entities/ships/control';
import { Collisions, Polygon } from './collisions';

export class Stage {
    public entityPool = new EntityPool();

    public collisionSystem = new Collisions();
    private shapes :any = {};
    private collisionResult = this.collisionSystem.createResult();

    private tick = 0;
    private sectors = new EntityPoolGrid('sectorKey', 1000);

    public constructor(public dumbMode = false) {
    }

    public add(entity :Entity) {
        this.entityPool.add(entity);
        this.sectors.add(entity);

        let shape = null;
        if (!this.shapes.hasOwnProperty(entity.id)) {
            shape = <any>this.collisionSystem.createPolygon(entity.x, entity.y, entity.collisionMap, entity.angle);
            shape.id = entity.id;
            this.shapes[entity.id] = shape;
        } else {
            shape = this.shapes[entity.id];
        }

        shape.x = entity.x;
        shape.y = entity.y;
        shape.angle = entity.angle * Math.PI / 180;
    }

    public remove(id :number) {
        this.sectors.remove(id);
        this.entityPool.remove(id);

        if (!this.dumbMode) {
            const shape = this.shapes[id];
            delete this.shapes[id];
            this.collisionSystem.remove(shape);
            this.collisionSystem.update();
        }
    }

    public addAll(entities :Entity[]) {
        entities.forEach(entity => this.add(entity));
        if (!this.dumbMode) {
            this.collisionSystem.update();
        }
    }

    public step() :number {
        this.tick++;
        this.tick = this.tick % Number.MAX_SAFE_INTEGER;

        for(let id in this.entityPool.entities) {
            const entity = this.entityPool.find(parseInt(id));

            this.stepEntity(entity);
            this.updateRegions(entity);

            if (!this.dumbMode) {
                const shape = <Polygon>this.shapes[parseInt(id)];
                shape.x = entity.x;
                shape.y = entity.y;
                shape.angle = entity.angle * Math.PI / 180;
            }
        }

        if (!this.dumbMode) {
            this.collisionSystem.update();
            this.handleCollisions();
        }

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

    private stepEntity(entity :Entity) {
        if (entity.hasOwnProperty('health')
            && entity.hasOwnProperty('damage')
            && entity.hasOwnProperty('control')) {
            let obj = <any>entity;

            if (obj.damage >= obj.health)
                obj.control = 0;
        }
        entity.step();
    }

    private updateRegions(entity :Entity) :void {
        this.sectors.update(entity);
    }

    private handleCollisions() {
        for(const i in this.shapes) {
            const n = parseInt(i);
            const shape = this.shapes[n];
            const entity = this.entityPool.find(n);
            const potentials = shape.potentials();
            if (potentials.length)
                this.checkCollisions(entity, shape, potentials);
        }
    }

    private checkCollisions(subject :Entity, shape :Polygon, bodies :any[]) {
        for (const body of bodies) {
            const collision = shape.collides(body, this.collisionResult);
            if (!collision)
                continue;

            subject.collide(this.entityPool.find(body.id), this.collisionResult);
        }
    }
}
