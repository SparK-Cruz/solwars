import { Renderable } from './renderable';
import { Camera } from './camera';

export class Grid implements Renderable {
  private buffer :HTMLCanvasElement = document.createElement('canvas');
  private context :CanvasRenderingContext2D;

  private subsector :number;

  constructor(private canvas :HTMLCanvasElement, private camera :Camera, private size :number, private divisions :number) {
    this.subsector = this.size / this.divisions;
    this.context = canvas.getContext('2d');
    this.generate();
  }

  render() :HTMLCanvasElement {
    let ref = this.camera.getPosition();

    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (let i = 0; i < 9; ++i) {
      let coords :Point = {
        x: ((i / 3 | 0) * this.size - this.size - (ref.x % this.size)) + 0.5 | 0,
        y: ((i % 3 | 0) * this.size - this.size - (ref.y % this.size)) + 0.5 | 0
      };
      this.context.drawImage(this.buffer, coords.x | 0, coords.y | 0);
    }

    return this.canvas;
  }

  private generate() :void {
    this.buffer.width = this.size;
    this.buffer.height = this.size;

    const ctx = this.buffer.getContext('2d');

    const color = 'rgba(110, 0, 150, 0.4)';
    const dashing = [2, 25];

    ctx.setLineDash(dashing);

    for(let i = 0; i < this.divisions; i++) {
      ctx.save();
      ctx.lineWidth = 1;
      ctx.strokeStyle = color;
      ctx.beginPath();
      ctx.moveTo(0, i * this.subsector | 0);
      ctx.lineTo(this.size, i * this.subsector | 0);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.lineWidth = 1;
      ctx.strokeStyle = color;
      ctx.beginPath();
      //ctx.setLineDash(dashing);
      ctx.moveTo(i * this.subsector | 0, 0);
      ctx.lineTo(i * this.subsector | 0, this.size);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }
  }
}

interface Point {
  x :number;
  y :number;
}
