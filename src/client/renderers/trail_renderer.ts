import { Stage } from '../../space/stage';
import { Camera } from '../camera';
import { Renderable } from './renderable';

//const maxTrailAge = 635;
const maxTrailAge = 760;
const speedBias = 22;

interface EntityCoord {
  x :number;
  y :number;
  vx :number;
  vy :number;
  angle :number;
  draw :boolean;
}
interface TrailNode extends EntityCoord {
  age :number;
}

export class TrailRenderer implements Renderable {
  private trails :any = {};
  private age = 0;

  private ctx :CanvasRenderingContext2D;

  public constructor(private canvas :HTMLCanvasElement, private camera :Camera, private stage :Stage) {
    this.ctx = this.canvas.getContext('2d');
  }

  public appendCoords(trailCoords :any) {
    for (let memId in trailCoords) {
      this.appendCoord(memId, trailCoords[memId]);
    }
  }

  public render() :HTMLCanvasElement {
    this.age = Date.now();

    for (let memId in this.trails) {
      this.drawTrail(this.trails[memId]);
    }

    return this.canvas;
  }

  private appendCoord(memId :string, coord: EntityCoord) {
    if (typeof this.trails[memId] === 'undefined') {
      this.trails[memId] = [];
    }
    this.trails[memId].push({
      x: coord.x,
      y: coord.y,
      vx: coord.vx,
      vy: coord.vy,
      draw: coord.draw,
      age: this.age
    });
  }

  private drawTrail(nodes :TrailNode[]) {
    const camPos = this.camera.getPosition();

    let tip = true;
    this.ctx.save();
    for (let i = nodes.length - 1; i >= 0; i--) {
      if (this.age - nodes[i].age >= maxTrailAge) {
        nodes.splice(i, 1);
        continue;
      }

      const relativeAge = this.age - nodes[i].age;

      const point = {
        x: nodes[i].x - camPos.x + (relativeAge / speedBias * nodes[i].vx),
        y: nodes[i].y - camPos.y + (relativeAge / speedBias * nodes[i].vy)
      };

      if (!tip) {
        let alpha = 1 - (this.age - nodes[i].age) / maxTrailAge;

        alpha = Math.pow(alpha, 6);

        const color = {
          r: 30 * alpha,
          g: 96 * alpha,
          b: 153 * alpha
        }

        this.ctx.lineWidth = 2 + 3 * alpha;
        this.ctx.lineCap = 'round';
        this.ctx.strokeStyle = 'rgb(' + color.r + ', ' + color.g + ', ' + color.b + ')';

        if (nodes[i].draw) {
          this.ctx.lineTo(point.x, point.y);
          this.ctx.stroke();
        }
        this.ctx.closePath();
      }

      this.ctx.beginPath();
      this.ctx.moveTo(point.x, point.y);

      tip = false;
      if (!nodes[i].draw) {
        tip = true;
      }
    }
    this.ctx.restore();
  }
}
