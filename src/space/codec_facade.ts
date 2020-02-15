import { Entity, EntityType } from './entities';
import { Stage } from './stage';

interface SavedState {
  tick: number
  entities :Entity[]
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

    // TODO PSON / binary
    return JSON.stringify(stream);
  }

  public writeState(state :string) {
    // TODO PSON / binary
    const decoded = <SavedState>JSON.parse(state);

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
