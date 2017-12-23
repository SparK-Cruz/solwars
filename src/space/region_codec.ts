import { Stage } from './stage';

export class RegionCodec {
  public constructor(private trackable :{x :number, y :number}) {}

  public encode(stage :Stage) {

  }

  public decode(stream :any) {

  }
}

/*
PROTOCOL NOTES (NO TIME FOR RFCs)
=================================

ENTITY - 01
  01 <ENTITY_TYPE>

ENTITY_TYPE
  BEACON - 01 <X> <Y> <VX> <VY>
  SHIP   - 02 <PLAYER_ID> <X> <Y> <VX> <VY> <ANGLE> <INPUT>


*/
