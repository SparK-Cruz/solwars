import { Entity, EntityType } from './entities';
import { Stage } from './stage2';
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
      entities: this.stage.fetchEntitiesAround(point).map(entity => {
        let payload :any = entity;

        if (entity.type.name == EntityType.Ship.name) {
          const ship = <Ship>entity;
          payload = {
            type: EntityType.Ship,
            id: ship.id,
            model: ship.model,
            color: ship.color,
            decals: ship.decals,
            x: ship.x,
            y: ship.y,
            vx: ship.vx,
            vy: ship.vy,
            angle: ship.angle,
            controlState: ship.control.getState(),
          };
        }

        return payload;
      })
    };

    // TODO PSON
    return JSON.stringify(stream);
  }

  public writeState(state :string) {
    // TODO PSON
    const decoded = <SavedState>JSON.parse(state);
    this.restoreShips(decoded.entities);

    this.stage.addAll(decoded.entities);
  }

  // public writeControls(control :string) {
  //   // TODO PSON
  //   const decoded = <SavedControl>JSON.parse(control);
  //   const ship = <Ship>this.stage.entityPool.find(parseInt(decoded.memId));
  //   ship.setState(decoded.state);
  // }

  private restoreShips(entities :Entity[]) {
    entities.forEach((entity, i, list) => {
      if (entity.type.name != EntityType.Ship.name)
        return;

      const ship = <Ship>this.stage.entityPool.find(entity.id);
      if (ship) return;

      if (!entity.hasOwnProperty('control')) {
        (<Ship>entity).control = new ShipControl();
      }

      if (entity.hasOwnProperty('controlState')) {
        (<Ship>entity).control.setState((<any>entity).controlState);
        delete (<any>entity).controlState;
      }
    });
  }
}
