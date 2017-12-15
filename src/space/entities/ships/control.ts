export class Control {
  private isShooting :boolean = false;
  private isRunning :boolean = false;
  private isSliding :boolean = false;

  private turning :number = 0;
  private thrusting :number = 0;

  private strifing :number = 0;

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

  turn(left ?:boolean, right ?:boolean) {
    if (left == null)
      left = this.turning < 0;

    if (right == null)
      right = this.turning > 0;

    return this.turning = (left ? -1 : 0) + (right ? 1 : 0);
  }

  thrust(forward ?:boolean, backward ?:boolean) {
    if (forward == null)
      forward = this.thrusting > 0;

    if (backward == null)
      backward = this.thrusting < 0;

    return this.thrusting = (forward ? 1 : 0) + (backward ? -1 : 0);
  }

  slide(isSliding ?:boolean) {
    if (isSliding == null)
      isSliding = this.isSliding;

    return this.isSliding = isSliding;
  }

  strife(left ?:boolean, right ?:boolean) {
    if (left == null)
      left = this.strifing < 0;

    if (right == null)
      right = this.strifing > 0;

    return this.strifing = (left ? -1 : 0) + (right ? 1 : 0);
  }
}
