import { Renderable } from '../renderable';
import { Ship } from '../../space/entities/ship';
import { Assets, Asset, AssetListener } from './assets';

export class ShipRenderer implements Renderable {
  private canvas :HTMLCanvasElement;
  private ctx :CanvasRenderingContext2D;

  constructor(private ship :Ship) {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');

    Assets.fetchAll([
      'img/'+this.ship.model+'.png',
      'img/'+this.ship.model+'_mask.png',
      'img/'+this.ship.model+'_decal0.png',
    ], {target: this, callback: this.draw});
  }

  public render() :HTMLCanvasElement {
    return this.canvas;
  }

  private draw(sprites :Asset[]) {
    const body :HTMLImageElement = sprites[0].content;
    const mask :HTMLImageElement = sprites[1].content;
    const decal :HTMLImageElement = sprites[2].content;

    this.drawBody(body);
    this.paintBaseColor(body, '#aaaaaa', mask);
    this.paintDecal(body, decal, '#ff5544', mask);
  }
  private drawBody(sprite :HTMLImageElement) {
    this.canvas.width = sprite.width;
    this.canvas.height = sprite.height;

    this.ctx.drawImage(sprite, 0, 0);
  }

  private paintBaseColor(sprite :HTMLImageElement, color :string, maskImage :HTMLImageElement) {
    this.ctx.drawImage(this.applyMask(this.multiply(sprite, color), maskImage), 0, 0);
  }

  private paintDecal(sprite :HTMLImageElement, decal :HTMLImageElement, color :string, maskImage :HTMLImageElement) {
    this.ctx.drawImage(this.applyMask(this.applyMask(this.multiply(sprite, color), decal), maskImage), 0, 0);
  }

  private multiply(source :HTMLImageElement, color :string) :HTMLCanvasElement {
    let {buffer, bfr} = this.prepareBuffer(source);

    bfr.save();
    bfr.drawImage(source, 0, 0);
    bfr.globalCompositeOperation = 'multiply';
    bfr.fillStyle = color;
    bfr.fillRect(0, 0, buffer.width, buffer.height);
    bfr.restore();

    return buffer;
  }

  private applyMask(source :HTMLCanvasElement | HTMLImageElement, maskImage :HTMLImageElement) :HTMLCanvasElement {
    let {buffer, bfr} = this.prepareBuffer(source);

    bfr.save();
    bfr.drawImage(source, 0, 0);
    bfr.globalCompositeOperation = 'destination-in';
    bfr.drawImage(maskImage, 0, 0);
    bfr.restore();

    return buffer;
  }

  private prepareBuffer(source :HTMLCanvasElement | HTMLImageElement) :{buffer :HTMLCanvasElement, bfr :CanvasRenderingContext2D} {
    const buffer = document.createElement('canvas');

    buffer.width = source.width;
    buffer.height = source.height;

    const bfr = buffer.getContext('2d');

    return {buffer, bfr};
  }
}
