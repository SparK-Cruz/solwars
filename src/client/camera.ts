export class Camera {
  public trackable: MovingPoint = {x: 0, y: 0, vx: 0, vy: 0};

  private maxSpeed = 50;
  public offset: {x: number, y: number} = {x: 0, y: 0};

  public setResolution(width: number, height: number): void {
    this.offset = {
      x: width / 2,
      y: height / 2,
    };
  }

  public translate(point: {x: number, y: number}) {
    const pos = this.getPosition();
    return {
      x: point.x - pos.x,
      y: point.y - pos.y,
    };
  }

  public addOffset(point: {x: number, y: number}) {
    const pos = this.getPosition();

    return {
      x: point.x + (this.trackable.x - pos.x) + this.offset.x,
      y: point.y + (this.trackable.y - pos.y) + this.offset.y,
    };
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
      x: this.trackable.x + spot.x,
      y: this.trackable.y + spot.y,
      vx: 0,
      vy: 0
    }
  }

  public getOffsetPosition(): {x: number, y: number} {
    const pos = this.getPosition();

    return {
      x: pos.x - this.offset.x,
      y: pos.y - this.offset.y,
    };
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
