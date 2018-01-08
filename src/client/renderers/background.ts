import { RNG } from '../../space/rng';
import { Camera } from '../camera';
import { Renderable } from './renderable';

const SIZE = 4096;
const STAR_COUNT = [2000, 1700, 1400];
const SCROLL_FACTOR = [0.03, 0.09, 0.15];

export class Background implements Renderable {
  private buffers :HTMLCanvasElement[] = [
    document.createElement('canvas'),
    document.createElement('canvas'),
    document.createElement('canvas')
  ];
  private blurBuffer :HTMLCanvasElement = document.createElement('canvas');
  private context :CanvasRenderingContext2D;

  private seed :number;

  constructor(private canvas :HTMLCanvasElement, private camera :Camera) {
    this.context = canvas.getContext('2d');
    this.blurBuffer.width = canvas.width;
    this.blurBuffer.height = canvas.height;

    let seed = 9876543210;
    RNG.random(seed);

    for (let i = this.buffers.length - 1; i >= 0; i--) {
      this.generate(this.buffers[i], STAR_COUNT[i]);
    }
  }

  render() :HTMLCanvasElement {
    const ref = this.camera.getPosition();
    this.generateBlur();

    for (let i = this.buffers.length - 1; i >= 0; i--) {
      const relative :Point = {
        x: ref.x * SCROLL_FACTOR[i],
        y: ref.y * SCROLL_FACTOR[i]
      };

      for (let j = 0; j < 9; ++j) {
        let coords :Point = {
          x: ((j / 3 | 0) * SIZE - SIZE - (relative.x % SIZE)) | 0,
          y: ((j % 3) * SIZE - SIZE - (relative.y % SIZE)) | 0
        };
        this.context.drawImage(this.buffers[i], coords.x, coords.y);
      }
    }

    return this.canvas;
  }

  private generate(buffer :HTMLCanvasElement, starCount :number) :void {
    buffer.width = SIZE;
    buffer.height = SIZE;

    const ctx = buffer.getContext('2d');

    for(let i = 0; i < starCount; i++) {
      let x = RNG.random() * SIZE | 0;
      let y = RNG.random() * SIZE | 0;
      let size = (0.9 + RNG.random() * 2) | 0;
      let shine = RNG.random() * 100 / 120;
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

    this.context.drawImage(this.blurBuffer, 0, 0);
  }
}

interface Point {
  x :number;
  y :number;
}
