export interface Entity {
    type :EntityType;
    id :number;
    sectorKey :string;
    collisionMap :number[][];
    shape :any;

    x :number;
    y :number;
    vx ?:number;
    vy ?:number;
    angle ?:number;

    step() :void;
    collide(entity :Entity, result :any) :void;
}

export interface EntityType {
    name :string
}

export namespace EntityType {
    export const Ship = {name: 'ship'};
    export const Bullet = {name: 'bullet'};
}

export class EntityPoolGrid {
    private _scale = 1;
    private grid :any = {};
    private pool = new EntityPool();

    public get scale() {
        return this._scale;
    }

    public get pools() {
        return this.grid;
    }

    public constructor(private key :string, scale :number) {
        this._scale = scale;
    }

    public add(entity :Entity) {
        this.pool.add(entity);
        return this.update(entity);
    }

    public addFromPool(pool :EntityPool) {
        for (let i in pool.entities) {
            this.add(pool.find(parseInt(i)));
        }
    }

    public update(entity :Entity) :EntityPool {
        if (!entity) console.log('entity is null!');

        const name = this.localCoordName(entity);
        if (!this.grid.hasOwnProperty(name)) {
            this.grid[name] = new EntityPool(name);
        }

        if (entity.hasOwnProperty(this.key)
            && name != (<any>entity)[this.key]) {

            this.removeFromOldGridPart(entity);
        }

        (<any>entity)[this.key] = name;
        this.grid[name].add(entity);

        return this.grid[name];
    }

    public find(id :number) :Entity {
        return this.pool.find(id);
    }

    public remove(id :number) {
        const entity = this.pool.find(id);
        this.pool.remove(id);
        this.removeFromOldGridPart(entity);
    }

    public localCoordName(point :{x :number, y :number}) {
        return [
            Math.floor(point.x / this.scale),
            Math.floor(point.y / this.scale)
        ].join('_');
    }

    public step() {
        for (let id in this.pool.entities) {
            const entity = this.pool.find(parseInt(id));
            entity.step();
            this.update(entity);

            // if (entity.hasOwnProperty('health')
            //   && entity.hasOwnProperty('damage')
            //   && entity.hasOwnProperty('control')) {
            //   let obj = <any>entity;

            //   if (obj.damage >= obj.health)
            //     obj.control = 0;
            // }
        }
    }

    public allEntities() :Entity[] {
        return this.pool.entities;
    }

    private removeFromOldGridPart(entity :Entity) {
        const gridPool = this.grid[(<any>entity)[this.key]];
        if (!gridPool)
            return;

        const entitiesLeft = gridPool.remove(entity.id);

        if (!entitiesLeft) {
            delete this.grid[gridPool.name];
        }
    }
}

export class EntityPool {
    private pool :any = {};
    private count = 0;
    private lastId = 0;

    public get length() {
        return this.count;
    }
    public get entities() {
        return this.pool;
    }

    public constructor(public name ?:string) {}

    public add(entity :Entity) :boolean {
        if (!entity.id) {
            entity.id = ++this.lastId;
            this.count++;
        }

        if (this.pool.hasOwnProperty(entity.id)) {
            Object.assign(this.pool[entity.id], entity);
            return false;
        }

        this.pool[entity.id] = entity;
        return true;
    }

    public find(id :number) :Entity {
        if (!this.pool.hasOwnProperty(id))
            return null;

        return this.pool[id];
    }

    public remove(id :number) :number {
        if (!this.pool.hasOwnProperty(id))
            return;

        delete this.pool[id];
        return --this.count;
    }
}
