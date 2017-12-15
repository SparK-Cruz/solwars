import { Ship } from '../../space/entities/ship';
import { Renderable } from './renderable';
import { Assets, Asset, AssetListener } from './assets';

export class ShipRenderer implements Renderable {
  private canvas :HTMLCanvasElement;
  private ctx :CanvasRenderingContext2D;

  constructor(private ship :Ship) {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');

    const files = [
      'img/'+this.ship.model.id+'.png',
      'img/'+this.ship.model.id+'_mask.png'
    ];

    const colors = [
      this.ship.color
    ];

    for (let i = 0; i < this.ship.decals.length; i++) {
      files.push('img/'+this.ship.model.id+'_'+this.ship.decals[i].name+'.png');
      colors.push(this.ship.decals[i].color);
    }

    Assets.fetchAll(files, {target: this, callback: function(sprites :Asset[]) {
      this.draw(sprites, colors);
    }});
  }

  public render() :HTMLCanvasElement {
    return this.canvas;
  }

  public shouldDrawTrail() :boolean {
    return this.ship.control.thrust() !== 0;
  }
  public getTrailOffset() :{x :number, y :number} {
    const offset = this.canvas.height / 2 + 3;

    return {
      x: -offset * Math.sin(this.ship.angle * Math.PI / 180),
      y: offset * Math.cos(this.ship.angle * Math.PI / 180),
    }
  }
  public getTrailDriftSpeed() :{x :number, y :number} {
    const speed = 25 * this.ship.power * this.ship.control.thrust();

    return {
      x: -speed * Math.sin(this.ship.angle * Math.PI / 180) + this.ship.vx,
      y: speed * Math.cos(this.ship.angle * Math.PI / 180) + this.ship.vy
    }
  }

  private draw(sprites :Asset[], colors :string[]) {
    const body :HTMLImageElement = sprites[0].content;
    const mask :HTMLImageElement = sprites[1].content;

    const decals = sprites.slice(2);
    const decal :HTMLImageElement = sprites[2].content;

    this.drawBody(body);
    this.paintBaseColor(body, colors.shift(), mask);

    while (decals.length > 0) {
      const decal = decals.shift();
      const color = colors.shift();
      this.paintDecal(body, decal.content, color, mask);
    }
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
