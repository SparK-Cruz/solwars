import { TPS } from '../stage';
import * as entities from '../entities';

function inRads(degrees :number) :number {
  return degrees * Math.PI / 180;
}

export class Ship implements entities.Entity {
  type = entities.EntityType.Ship;
  memId :string;

  x :number = 0;
  y :number = 0;
  vx :number = 0;
  vy :number = 0;

  model :string = 'blade';
  vmax :number = 105;
  power :number = 0.08;

  angle :number = 0;
  vangle :number = 0;
  health :number = 0;
  damage :number = 0;

  control :ShipControl;

  constructor() {
    // TODO: Read ship stats
    this.control = new ShipControl();
  }

  step() :void {
    this.readControls();
    this.updatePhysics();
  }

  private readControls() {
    this.readThrust();
    this.readStrife();
    this.readSlide();
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
  private readSlide() {
    let slide = this.control.slide();

    if (!slide) {
      this.vx *= 0.995;
      this.vy *= 0.995;
    }
  }
  private readTurn() {
    let turn = this.control.turn();

    // TODO read from stats
    let turnSpeed = 5;

    this.vangle = turn * turnSpeed;
  }

  private updatePhysics() {
    this.x += this.vx;
    this.y += this.vy;
    this.angle += this.vangle;

    this.correctSpeed();
    this.correctAngle();
  }

  private correctSpeed() {
    let avx = Math.abs(this.vx);
    let avy = Math.abs(this.vy);
    // let total = avx + avy;

    // if (total > this.vmax) {
    //   //INFLICT DAMAGE
    // }

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

export class ShipControl {
  private _isShooting :boolean = false;
  private _isRunning :boolean = false;
  private _isSliding :boolean = false;

  private _turning :number = 0;
  private _thrusting :number = 0;

  private _strifing :number = 0;

  shoot(isShooting ?:boolean) {
    if (isShooting == null)
      isShooting = this._isShooting;

    return this._isShooting = isShooting;
  }

  run(isRunning ?:boolean) {
    if (isRunning == null)
      isRunning = this._isRunning;

    return this._isRunning = isRunning;
  }

  turn(left ?:boolean, right ?:boolean) {
    if (left == null)
      left = this._turning < 0;

    if (right == null)
      right = this._turning > 0;

    return this._turning = (left ? -1 : 0) + (right ? 1 : 0);
  }

  thrust(forward ?:boolean, backward ?:boolean) {
    if (forward == null)
      forward = this._thrusting > 0;

    if (backward == null)
      backward = this._thrusting < 0;

    return this._thrusting = (forward ? 1 : 0) + (backward ? -1 : 0);
  }

  slide(isSliding ?:boolean) {
    if (isSliding == null)
      isSliding = this._isSliding;

    return this._isSliding = isSliding;
  }

  strife(left ?:boolean, right ?:boolean) {
    if (left == null)
      left = this._strifing < 0;

    if (right == null)
      right = this._strifing > 0;

    return this._strifing = (left ? -1 : 0) + (right ? 1 : 0);
  }
}
