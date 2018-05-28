import { Entity, EntityType } from './entities';
import { Stage } from './stage';
import { Controllable } from './entities/controllable';
import { Ship } from './entities/ship';
import { Control as ShipControl } from './entities/ships/control';

interface SavedState {
  entities :Entity[]
}
interface SavedControl {
  memId :string
  state :number
}

export class CodecFacade {
  public constructor(private stage :Stage) {}

  public readStateFromPoint(point :{x :number, y :number}) :string {
    let stream = {
      entities: this.stage.fetchEntitiesAround(point)
    };

    // TODO PSON
    return JSON.stringify(stream);
  }

  public writeState(state :string) {
    // TODO PSON
    const decoded = <SavedState>JSON.parse(state);
    this.stage.addAll(decoded.entities);
  }
}
