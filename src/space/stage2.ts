import { Entity, EntityPool, EntityPoolGrid } from './entities';
import { Ship } from './entities/ship';
import { Control } from './entities/ships/control';

export class Stage {
    public entityPool = new EntityPool();

    private tick = 0;
    private sectors = new EntityPoolGrid('sectorKey', 1000);
    private collisionPools = new EntityPoolGrid('collisionPoolKey', 125);

    public add(entity :Entity) {
        this.entityPool.add(entity);
        this.sectors.add(entity);
        this.collisionPools.add(entity);
    }

    public addAll(entities :Entity[]) {
        entities.forEach(entity => this.add(entity));
    }

    public step() :number {
        this.tick++;
        this.tick = this.tick % Number.MAX_SAFE_INTEGER;

        for(let id in this.entityPool.entities) {
            const entity = this.entityPool.find(parseInt(id));
            entity.step();
            this.updateRegions(entity);
        }

        this.handleCollisions();

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

    private updateRegions(entity :Entity) :void {
        this.sectors.update(entity);
        this.collisionPools.update(entity);
    }

    private handleCollisions() {
        // TODO collect collisions and tell the parts involved
    }
}
