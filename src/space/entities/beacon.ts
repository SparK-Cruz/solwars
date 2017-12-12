import * as entities from '../entities';

export class Beacon implements entities.Entity {
  memId :string;

  type = entities.EntityType.Structure;
  vx :number;
  vy :number;
  angle :number;
  vangle :number;
  health :number;
  damage :number;

  constructor(public x :number, public y :number) {
    this.vx = 0;
    this.vy = 0;
    this.angle = 0;
    this.vangle = 0;
    this.damage = 0;
    this.health = Number.POSITIVE_INFINITY;
  }

  step() :void {
  }
}
