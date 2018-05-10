import { Entity, EntityType } from './entities';
import { Stage } from './stage';
import { Controllable } from './entities/controllable';
import { Ship } from './entities/ship';
import { Control } from './entities/ships/control';

interface SavedState {
  entities :Entity[]
}
interface SavedControl {
  memId :string
  state :number
}

export class CodecFacade {
  public constructor(private stage :Stage) {}

  public readState() :string {
    let stream = {
      entities: this.stage.fetchAllEntities().map(entity => {
        if (entity.type.name == EntityType.Ship.name) {
          (<any>entity).controlState = (<Ship>entity).getState();
        }
      })
    };

    // TODO PSON
    return JSON.stringify(stream);
  }

  public readStateFromPoint(point :{x :number, y :number}) :string {
    let stream = {
      entities: this.stage.fetchEntitiesAround(point.x, point.y)
    };

    // TODO PSON
    return JSON.stringify(stream);
  }

  public writeState(state :string) {
    // TODO PSON
    let decoded = <SavedState>JSON.parse(state);

    this.stage.addAll(decoded.entities);
  }

  public writeControls(control :string) {
    // TODO PSON
    let decoded = <SavedControl>JSON.parse(control);
    this.stage.entityPool[decoded.memId].setState(decoded.state);
  }
}
