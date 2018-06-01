import { Model } from './ships/model';
import { Control } from './ships/control';
import { Decal } from './ships/decal';
import * as entities from '../entities';

function inRads(degrees :number) :number {
  return degrees * Math.PI / 180;
}

//const INERTIAL_DUMP = 0.9985;
const INERTIAL_DUMP = 0.995;

export class Ship implements entities.Entity {
  type = entities.EntityType.Ship;
  id :number;
  model :string;

  sectorKey :string;

  collisionMap :number[][] = [];
  shape :any;

  x = 0;
  y = 0;
  vx = 0;
  vy = 0;

  color = '#aaaaaa';

  decals :Decal[] = [
    {name: 'decal0', color: '#ff5544'}
  ];

  vmax = 5;
  turnSpeed = 4;
  power = 0.05;

  angle = 0;
  vangle = 0;
  health = 0;
  damage = 0;

  control = 0;

  constructor(model :Model) {
    this.model = model.id;
    this.collisionMap = model.polygon;
  }

  step() :void {
    this.readControls();
    this.updatePhysics();
  }

  collide(other :entities.Entity, result :any) :void {
    this.x -= result.overlap * result.overlap_x;
    this.y -= result.overlap * result.overlap_y;
    this.vx -= result.overlap / 2 * result.overlap_x;
    this.vy -= result.overlap / 2 * result.overlap_y;
  }

  private readControls() {
    this.readThrust();
    this.readStrife();
    this.readTurn();
  }
  private readThrust() {
    let thrust = Control.thrusting(this.control);

    this.vx += (thrust * this.power) * Math.sin(inRads(this.angle));
    this.vy -= (thrust * this.power) * Math.cos(inRads(this.angle));
  }
  private readStrife() {
    if (Control.sliding(this.control)) return;

    let strife = Control.strifing(this.control);

    let power = this.power * 0.7;
    let sideAngle = this.angle + 90;

    this.vx += (strife * power) * Math.sin(inRads(sideAngle));
    this.vy -= (strife * power) * Math.cos(inRads(sideAngle));
  }
  private readTurn() {
    let turn = Control.turning(this.control);
    this.vangle = turn * this.turnSpeed;
  }

  private updatePhysics() {
    if (!Control.sliding(this.control)) {
      this.vx *= INERTIAL_DUMP;
      this.vy *= INERTIAL_DUMP;
    }

    this.x += this.vx;
    this.y += this.vy;
    this.angle += this.vangle;

    this.correctSpeed();
    this.correctAngle();
  }

  private correctSpeed() {
    let avx = Math.abs(this.vx);
    let avy = Math.abs(this.vy);

    if (avx < 0.001)
      this.vx = 0;

    if (avy < 0.001)
      this.vy = 0;
  }

  private correctAngle() {
    this.angle = this.angle % 360;
    if (this.angle < 0) {
      this.angle += 360;
    }
  }
}
