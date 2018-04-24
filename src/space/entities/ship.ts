import { TPS } from '../stage';
import { Model } from './ships/model';
import { Control as ShipControl } from './ships/control';
import { Decal } from './ships/decal';
import * as entities from '../entities';
import { Controllable } from './controllable';

function inRads(degrees :number) :number {
  return degrees * Math.PI / 180;
}

const INERTIAL_DUMP = 0.9985;

export class Ship implements entities.Entity, Controllable {
  type = entities.EntityType.Ship;
  memId :string;

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

  control :ShipControl;

  constructor(public model :Model) {
    // TODO: Read ship stats
    this.control = new ShipControl();
  }

  getState() {
    return this.control.getState();
  }
  setState(state :number) {
    this.control.setState(state);
  }

  step() :void {
    this.readControls();
    this.updatePhysics();
  }

  private readControls() {
    this.readThrust();
    this.readStrife();
    this.readTurn();
  }
  private readThrust() {
    let thrust = this.control.thrust();

    this.vx += (thrust * this.power) * Math.sin(inRads(this.angle));
    this.vy -= (thrust * this.power) * Math.cos(inRads(this.angle));
  }
  private readStrife() {
    let strife = this.control.strife();

    let power = this.power * 0.7;
    let sideAngle = this.angle + 90;

    this.vx += (strife * power) * Math.sin(inRads(sideAngle));
    this.vy -= (strife * power) * Math.cos(inRads(sideAngle));
  }
  private readTurn() {
    let turn = this.control.turn();
    this.vangle = turn * this.turnSpeed;
  }

  private updatePhysics() {
    this.vx *= INERTIAL_DUMP;
    this.vy *= INERTIAL_DUMP;

    this.x += this.vx;
    this.y += this.vy;
    this.angle += this.vangle;

    this.correctSpeed();
    this.correctAngle();
  }

  private correctSpeed() {
    let avx = Math.abs(this.vx);
    let avy = Math.abs(this.vy);
    let total = avx + avy;

    let diff = total - this.vmax;

    if (diff > 0) {
      let xratio = this.vx / total;
      let yratio = this.vy / total;

      this.vx -= xratio * diff;
      this.vy -= yratio * diff;
    }

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
