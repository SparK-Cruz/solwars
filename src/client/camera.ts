export class Camera {
  private maxSpeed = 0;

  constructor(private trackable :MovingPoint, private offset :{x :number, y :number}) {
    this.maxSpeed = Math.min(this.offset.x, this.offset.y) / 5;
  }

  public getPosition() :MovingPoint {
    let spot = {
      x: this.easeAxis(this.trackable.vx, this.maxSpeed),
      y: this.easeAxis(this.trackable.vy, this.maxSpeed)
    };

    return {
      x: this.trackable.x + spot.x - this.offset.x,
      y: this.trackable.y + spot.y - this.offset.y,
      vx: 0,
      vy: 0
    }
  }

  public getTrackable() {
    return this.trackable;
  }

  private easeAxis(value :number, absMax :number) {
    let sign = value < 0 ? -1 : 1;
    let absValue = Math.min(Math.abs(value), absMax);
    let scale = (absMax - absValue) / absMax;

    let fixedDrawAhead = 4;
    let drawAhead = 6 * scale;
    // let fixedDrawAhead = 0;
    // let drawAhead = 0;

    return (absValue * sign) * (fixedDrawAhead + drawAhead);
  }
}
export interface MovingPoint {
  x :number;
  y :number;
  vx :number;
  vy :number;
}
