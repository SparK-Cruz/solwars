export class Camera {
  private maxSpeed = 50;

  constructor(public trackable :MovingPoint, private offset :{x :number, y :number}) {
  }

  public getPosition() :MovingPoint {
    let totalSpeed = Math.sqrt(Math.pow(this.trackable.vx, 2) + Math.pow(this.trackable.vy, 2));
    let angle = Math.atan2(this.trackable.vy, this.trackable.vx) + (Math.PI / 2);
    let distance = this.easeAxis(totalSpeed, this.maxSpeed);

    while(angle < 0) angle += 2 * Math.PI;
    while(angle > 2 * Math.PI) angle -= 2 * Math.PI;

    let spot = {
      x: distance * Math.sin(angle),
      y: -distance * Math.cos(angle)
    };

    return {
      x: this.trackable.x + spot.x - this.offset.x,
      y: this.trackable.y + spot.y - this.offset.y,
      vx: 0,
      vy: 0
    }
  }

  private easeAxis(value :number, absMax :number) {
    let scale = 100; //max distance in pixels from center;
    let signal = value < 0 ? -1 : 1;
    let relative = Math.abs(value) / absMax;
    let ease = Math.pow(relative - 1, 3) + 1;

    return ease * scale * signal;
  }
}
export interface MovingPoint {
  x :number;
  y :number;
  vx :number;
  vy :number;
}
