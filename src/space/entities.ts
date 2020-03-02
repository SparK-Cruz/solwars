export interface Entity {
    type :EntityType;
    id :number;
    sectorKey :string;
    collisionMap :number[][];
    mass: number;

    x :number;
    y :number;
    vx ?:number;
    vy ?:number;
    angle ?:number;

    step(delta: number) :void;
    collide(entity :Entity, result :any) :void;
}

export namespace Entity {
    function angleDiff(x1 :number, y1 :number, x2 :number, y2 :number) {
        const a1 = Math.atan2(y1, x1);
        const a2 = Math.atan2(y2, x2);

        return (a2 - a1) * 180 / Math.PI;
    }

    export function defaultCollide(other: Entity, result: any): void {
        const push = {
            x: result.overlap * result.overlap_x,
            y: result.overlap * result.overlap_y
        };
        this.x -= push.x;
        this.y -= push.y;

        const mass = this.mass + other.mass;

        this.vx -= push.x * (other.mass / mass);
        this.vy -= push.y * (other.mass / mass);

        this.vangle += angleDiff(other.vx, other.vy, push.x, push.y) * (other.mass / mass) % 4;

        if (typeof (<any>other).addDamage !== 'undefined') {
            (<any>other).addDamage(result.overlap * 100 * (this.mass / mass), other);
        }
    }
}

export namespace EntityEvent {
    export const Spawn = "spawn";
    export const Despawn = "despawn";
    export const Die = "die";
}

export interface EntityType {
    name :string
}

export namespace EntityType {
    export const Ship = {name: 'ship'};
    export const Bullet = {name: 'bullet'};
    export const ShipDebris = {name: 'shipDebris'};
}

const SCALE = 2048;

export class EntityPoolGrid {
    private grid :any = {};
    private lastId = 0;

    public constructor() {}

    public add(entity :Entity) {
        if (!entity.id)
            entity.id = ++this.lastId;

        return this.updateGrid(entity);
    }

    public updateGrid(entity :Entity) {
        if (!entity) return;

        const name = this.localCellKey(this.localCell(entity));

        if (!this.grid.hasOwnProperty(name)) {
            this.grid[name] = new EntityPool(name);
        }

        if (entity.sectorKey
            && name !== entity.sectorKey) {

            this.grid[entity.sectorKey].remove(entity.id);
            entity.sectorKey = null;
        }

        if (!entity.sectorKey) {
            this.grid[name].add(entity);
            entity.sectorKey = name;
        }
    }

    public remove(id :number) {
        for (const coord in this.grid) {
            this.grid[coord].remove(id);
        }
    }

    public allEntities() :Entity[] {
        const entities: Entity[] = [];
        Object.values(this.grid).forEach((cell: EntityPool) => {
            [].push.apply(entities, Object.values(cell.entities));
        });
        return entities;
    }

    public fetchAroundCoord(point: {x: number, y: number}): any[] {
        const pools: any[] = [];
        const scaled = this.localCell(point);
        for (let i = 0; i < 9; i++) {
            const offset = {
                x: (i % 3) - 1,
                y: Math.floor(i / 3) - 1,
            };

            const cellKey = this.localCellKey({x: scaled.x + offset.x, y: scaled.y + offset.y});
            const cell = this.grid[cellKey];

            if (!cell) continue;

            pools.push(cell.entities);
        }

        return pools;
    }

    private localCell(point: {x: number, y: number}): {x: number, y: number} {
        return {
            x: Math.floor(point.x / SCALE),
            y: Math.floor(point.y / SCALE),
        };
    }

    private localCellKey(point :{x :number, y :number}) {
        return Object.values(point).join('_');
    }
}

class EntityPool {
    private pool :any = {};
    private count = 0;

    public get length() {
        return this.count;
    }
    public get entities() {
        return this.pool;
    }

    public constructor(public name ?:string) {}

    public add(entity :Entity) {
        if (!entity.id) {
            return;
        }

        if (!this.pool.hasOwnProperty(entity.id))
            this.count++;

        this.pool[entity.id] = entity;
    }

    public find(id :number) :Entity {
        if (!this.pool.hasOwnProperty(id))
            return null;

        return this.pool[id];
    }

    public remove(id :number): number {
        if (!this.pool.hasOwnProperty(id))
            return;

        this.pool[id] = null;
        delete this.pool[id];

        return this.count;
    }
}
