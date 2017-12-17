import { Entity } from './entities';

export const TPS = 60;

var nextEntityId = 0;

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

  private tick = 0;
  private entityMap :any = {};

  public step() :void {
    this.tick++;
    for (var sector in this.entityMap) {
      for (var i in this.entityMap[sector].entities) {
        this.entityMap[sector].entities[i].step();
        this.relocateIfNeeded(this.entityMap[sector], parseInt(i));
      }
    }
  }

  public add(entity :Entity) :void {
    if (!entity.memId) {
      entity.memId = 'E' + (nextEntityId++);
    }

    this.addToSector(this.calcSectorCoord(entity.x, entity.y), entity);
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
