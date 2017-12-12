import { Renderable } from './renderable';
import { Camera } from './camera';
import { RNG } from '../space/rng';

const SIZE = 4096;
const STAR_COUNT = 2000;
const SCROLL_FACTOR = 0.03;

export class Background implements Renderable {
  private buffer :HTMLCanvasElement = document.createElement('canvas');
  private blurBuffer :HTMLCanvasElement = document.createElement('canvas');
  private context :CanvasRenderingContext2D;

  private seed :number;

  constructor(private canvas :HTMLCanvasElement, private camera :Camera) {
    this.context = canvas.getContext('2d');
    this.blurBuffer.width = canvas.width;
    this.blurBuffer.height = canvas.height;

    let seed = 9876543210;
    RNG.random(seed);

    this.generate();
  }

  render() :HTMLCanvasElement {
    let ref = this.camera.getPosition();

    let relative :Point = {
      x: ref.x * SCROLL_FACTOR,
      y: ref.y * SCROLL_FACTOR
    };

    this.generateBlur();
    for (let i = 0; i < 9; ++i) {
      let coords :Point = {
        x: ((i / 3 | 0) * SIZE - SIZE - (relative.x % SIZE)) + 0.5 | 0,
        y: ((i % 3) * SIZE - SIZE - (relative.y % SIZE)) + 0.5 | 0
      };
      this.context.drawImage(this.buffer, coords.x, coords.y);
    }

    return this.canvas;
  }

  private generate() :void {
    this.buffer.width = SIZE;
    this.buffer.height = SIZE;

    let ctx = this.buffer.getContext('2d');

    for(let i = 0; i < STAR_COUNT; i++) {
      let x = RNG.random() * SIZE | 0;
      let y = RNG.random() * SIZE | 0;
      let size = RNG.random() * SIZE / (SIZE / 1.8);
      let shine = (RNG.random() * 100 | 0) / 120;
      this.drawStar(ctx, x, y, size, shine);
    }
  }

  private drawStar(ctx :CanvasRenderingContext2D, x :number, y :number, size :number, shine :number) :void {
    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = 'rgba(255, 255, 255, ' + shine + ')';
    ctx.rect(x,y,size,size);
    ctx.fill();
    ctx.closePath();
    ctx.restore();
  }

  private generateBlur() :void {
    let bctx = this.blurBuffer.getContext('2d');
    bctx.save();
    bctx.drawImage(this.canvas, 0, 0);
    bctx.fillStyle = '#000000';
    bctx.globalAlpha = 0.3;
    bctx.fillRect(0, 0, this.blurBuffer.width, this.blurBuffer.height);
    bctx.restore();

    this.canvas.getContext('2d').drawImage(this.blurBuffer, 0, 0);
  }
}

interface Point {
  x :number;
  y :number;
}
