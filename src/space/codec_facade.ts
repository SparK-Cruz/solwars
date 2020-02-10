import { Entity, EntityType } from './entities';
import { Stage } from './stage';
import { Controllable } from './entities/controllable';
import { Ship } from './entities/ship';
import { Control as ShipControl } from './entities/ships/control';

interface SavedState {
  tick: number
  entities :Entity[]
}
interface SavedControl {
  memId :string
  state :number
}

let shifted = false;

if (typeof document !== 'undefined') {
  document.onkeydown = function(e){ shifted = e.shiftKey; return true };
}

export class CodecFacade {
  public constructor(private stage :Stage) {}

  public readStateFromPoint(point :{x :number, y :number}) :string {
    const stream = {
      tick: this.stage.tick,
      entities: this.stage.fetchEntitiesAround(point).map(this.encodeEntity)
    };

    // TODO PSON
    return JSON.stringify(stream);
  }

  public writeState(state :string) {
    // TODO PSON
    const decoded = <SavedState>JSON.parse(state);

    // if (decoded.entities.length >= 2) {
    //   console.log(decoded.entities[1]);
    // }

    if (decoded.tick < this.stage.tick
      && decoded.tick + 60 > this.stage.tick)
      return;

    if (shifted) {
      console.log(decoded.entities);
      shifted = false;
    }

    this.stage.addAll(decoded.entities);
  }

  public encodeEntity(entity :Entity) {
    return entity;
  }
}
