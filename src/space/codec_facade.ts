import { Entity } from './entities';
import { Stage } from './stage';
import { EntityCodec } from './codecs/entity_codec';

export class CodecFacade {
  public constructor(private stage :Stage) {}

  readState() :string {
    let stream = '';

    stream += EntityCodec.encodeAll(this.stage.fetchAllEntities());

    return stream;
  }

  readStateFromPoint(point :{x :number, y:number}) :string|Entity[] {
    // let stream = '';

    // //Only entities for now...
    // stream += EntityCodec.encodeAll(this.stage.fetchEntitiesAround(point.x, point.y));

    // return stream;

    return this.stage.fetchEntitiesAround(point.x, point.y);
  }

  // For use on client-side
  writeState(state :Entity[]) {
    this.stage.addAll(state);
  }

  writeControls(entity :Entity, state :number) {
    entity.control.setState(state);
  }
}

/*
PROTOCOL NOTES (NO TIME FOR RFCs)
=================================

TAB SEPARATOR (9) FOR LISTS

BEACON - 01 <X> <Y> <VX> <VY>
SHIP   - 02 <PLAYER_ID> <X> <Y> <VX> <VY> <ANGLE> <INPUT>

ShipCodec, BeaconCodec

*/
