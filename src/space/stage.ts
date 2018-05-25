import { Entity } from './entities';
import { Controllable } from './entities/controllable';

export const TPS = 60;

interface SectorCoord {
  x :number;
  y :number;
}
interface Sector {
  coord :SectorCoord;
  entities :Entity[];
}

export class Stage {
  public static SECTOR_SIZE :number = 4096;
  public static SUBDIVISIONS :number = 8;

  public entityPool :any = {};
  public entityCount = 0;

  private tick = 0;
  private entityMap :any = {};

  public step() :void {
    this.tick++;
    this.tick = this.tick % Number.MAX_SAFE_INTEGER;

    for (var sector in this.entityMap) {
      for (var i = this.entityMap[sector].entities.length - 1; i >= 0; i--) {
        this.entityMap[sector].entities[i].step();
        this.relocateIfNeeded(this.entityMap[sector], i);
      }
    }
  }

  public add(entity :Entity) :void {
    if (!entity.id) {
      entity.id = ++this.entityCount;
    }

    let ref :Entity = this.entityPool[entity.id];
    if (!ref) {
      this.entityPool[entity.id] = entity;
      ref = entity;
      this.addToSector(this.calcSectorCoord(ref.x, ref.y), ref);
    }

    if (ref === entity)
      return;

    ref.x = entity.x;
    ref.y = entity.y;
    ref.vx = entity.vx;
    ref.vy = entity.vy;
    ref.angle = entity.angle;

    const ctrlEntity = this.tryControllableEntity(entity);
    const ctrlRef = this.tryControllableEntity(ref);

    if (!ctrlEntity || !ctrlRef)
      return;

    ctrlRef.setState(ctrlEntity.getState());
  }

  public addAll(entities :Entity[]) :void {
    for (var i = entities.length - 1; i >= 0; i--) {
      this.add(entities[i]);
    }

    for (var sector in this.entityMap) {
      for (var i = this.entityMap[sector].entities.length - 1; i >= 0; i--) {
        this.relocateIfNeeded(this.entityMap[sector], i);
      }
    }
  }

  public fetchAllEntities() :Entity[] {
    return this.entityPool;
  }

  public fetchEntitiesAround(x :number, y :number) :Entity[] {
    var sector = this.calcSectorCoord(x, y);
    var result :Entity[] = [];

    for (var i = sector.x + 1; i >= sector.x - 1; i--) {
      for (var j = sector.y + 1; j >= sector.y - 1; j--) {
        let sectorCoord = {x: i, y: j};
        let entities = this.fetchSector(sectorCoord, false).entities;

        result = result.concat(entities);
      }
    }

    return result;
  }

  public getTick() {
    return this.tick;
  }

  private tryControllableEntity(entity :Entity) :Controllable {
    if (typeof (entity as any).setState === 'undefined'
      || typeof (entity as any).getState === 'undefined') {
      return null;
    }

    return entity as any as Controllable;
  }

  private relocateIfNeeded(sector :Sector, index :number) :void {
    var entity = sector.entities[index];

    var newSector = this.fetchSector({
      x: Math.floor(entity.x / Stage.SECTOR_SIZE),
      y: Math.floor(entity.y / Stage.SECTOR_SIZE)
    });

    if (newSector === sector)
      return;

    newSector.entities.push(sector.entities.splice(index, 1)[0]);
    this.deleteSectorIfEmpty(sector);
  }

  private fetchSector(coord :SectorCoord, create = true) :Sector {
    let name = coord.x + '_' + coord.y;

    if (!this.entityMap.hasOwnProperty(name)){
      let newSector :Sector = {coord: coord, entities: []};

      if (!create)
        return newSector;

      this.entityMap[name] = newSector;
    }

    return this.entityMap[name];
  }

  private deleteSectorIfEmpty(sector :Sector) :void {
    let name = sector.coord.x + '_' + sector.coord.y;

    if (sector.entities.length > 0)
      return;

    delete this.entityMap[name];
  }

  private addToSector(coord :SectorCoord, entity :Entity) :void {
    this.fetchSector(coord).entities.push(entity);
  }

  private calcSectorCoord(x :number, y :number) :SectorCoord {
    return {
      x: Math.floor(x / Stage.SECTOR_SIZE),
      y: Math.floor(y / Stage.SECTOR_SIZE)
    };
  }
}
