import { Stage } from './stage';

export class CodecFacade {
  public constructor(private stage :Stage) {}

  readState() :string {
    // are you sure you wanna read it all?
    // extract all data from this.stage and encode
    return 'yay';
  }

  readStateFromPoint(point :{x :number, y:number}) :string {
    // extract data from this.stage and encode
    return 'yay';
  }

  writeState(state :string) {
    // mutate this.stage to death
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
