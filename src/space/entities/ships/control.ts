import { Controllable } from '../controllable';
import { Mapping } from './mapping';

export class Control implements Controllable {
  private thrusting :number = 0;
  private turning :number = 0;
  private strifing :number = 0;

  private isShooting :boolean = false;
  private isRunning :boolean = false;

  thrust(forward ?:boolean, backward ?:boolean) {
    if (forward == null)
      forward = this.thrusting > 0;

    if (backward == null)
      backward = this.thrusting < 0;

    return this.thrusting = (forward ? 1 : 0) + (backward ? -1 : 0);
  }

  turn(left ?:boolean, right ?:boolean) {
    if (left == null)
      left = this.turning < 0;

    if (right == null)
      right = this.turning > 0;

    return this.turning = (left ? -1 : 0) + (right ? 1 : 0);
  }

  strife(left ?:boolean, right ?:boolean) {
    if (left == null)
      left = this.strifing < 0;

    if (right == null)
      right = this.strifing > 0;

    return this.strifing = (left ? -1 : 0) + (right ? 1 : 0);
  }

  shoot(isShooting ?:boolean) {
    if (isShooting == null)
      isShooting = this.isShooting;

    return this.isShooting = isShooting;
  }

  run(isRunning ?:boolean) {
    if (isRunning == null)
      isRunning = this.isRunning;

    return this.isRunning = isRunning;
  }

  setState(state :number) {
    this.thrust((state & Mapping.FORWARD) > 0, (state & Mapping.BACKWARD) > 0);
    this.turn((state & Mapping.LEFT) > 0, (state & Mapping.RIGHT) > 0);
    this.strife((state & Mapping.STRIFE_LEFT) > 0, (state & Mapping.STRIFE_RIGHT) > 0);
    this.shoot((state & Mapping.SHOOT) > 0);
    this.run((state & Mapping.RUN) > 0);
  }

  getState() :number {
    let state = 0;
    state += this.thrusting < 0 ? Mapping.BACKWARD : this.thrusting * Mapping.FORWARD;
    state += this.turning < 0 ? Mapping.LEFT : this.turning * Mapping.RIGHT;
    state += this.strifing < 0 ? Mapping.STRIFE_LEFT : this.strifing * Mapping.STRIFE_RIGHT;
    state += this.isShooting ? Mapping.SHOOT : 0;
    state += this.isRunning ? Mapping.RUN : 0;

    return state;
  }
}
