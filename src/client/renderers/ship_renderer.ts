import { Ship } from '../../space/entities/ship';
import { Control } from '../../space/entities/ships/control';
import { Renderable } from './renderable';
import { Assets, Asset, AssetListener } from './assets';
import { TrailRenderer } from './trail_renderer';

export class ShipRenderer implements Renderable {
  private canvas :HTMLCanvasElement;
  private ctx :CanvasRenderingContext2D;
  private body :HTMLCanvasElement;
  private bdy :CanvasRenderingContext2D;
  private light :HTMLImageElement;

  constructor(private ship :Ship) {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');

    const files = [
      'img/'+this.ship.model+'.png',
      'img/'+this.ship.model+'_mask.png'
    ];

    const colors = [
      this.ship.color
    ];

    for (let i = 0; i < this.ship.decals.length; i++) {
      files.push('img/'+this.ship.model+'_'+this.ship.decals[i].name+'.png');
      colors.push(this.ship.decals[i].color);
    }

    Assets.fetchAll(files, {target: this, callback: function(sprites :Asset[]) {
      this.draw(sprites, colors);
    }});

    Assets.fetch('img/light.png', {target: this, callback: (sprite :Asset) => {
      this.light = sprite.content;
    }});
  }

  public render() :HTMLCanvasElement {
    if (this.body && this.light) {
      this.ctx.drawImage(this.multiplyLight(this.body, this.light, this.ship.angle), 0, 0);
    }
    return this.canvas;
  }

  public shouldDrawTrail() :boolean {
    return Control.thrusting(this.ship.control) !== 0;
  }
  public getTrailOffset() :{x :number, y :number} {
    let offset = 0;

    if (Control.thrusting(this.ship.control) > 0)
      offset = this.canvas.height / 2 + 1;

    if (Control.thrusting(this.ship.control) < 0)
      offset = -this.canvas.height / 4;

    return {
      x: -offset * Math.sin(this.ship.angle * Math.PI / 180),
      y: offset * Math.cos(this.ship.angle * Math.PI / 180)
    }
  }
  public getTrailDriftSpeed() :{x :number, y :number} {
    const speed = 80 * this.ship.power * Control.thrusting(this.ship.control);

    return {
      x: -speed * Math.sin(this.ship.angle * Math.PI / 180) + this.ship.vx,
      y: speed * Math.cos(this.ship.angle * Math.PI / 180) + this.ship.vy
    }
  }

  private draw(sprites :Asset[], colors :string[]) {
    this.body = document.createElement('canvas');
    this.bdy = this.body.getContext('2d');

    const body :HTMLImageElement = sprites.shift().content;
    const mask :HTMLImageElement = sprites.shift().content;

    this.drawBody(body);
    this.paintBaseColor(body, colors.shift(), mask);

    while (sprites.length > 0) {
      const decal = sprites.shift();
      const color = colors.shift();
      this.paintDecal(body, decal.content, color, mask);
    }
  }
  private drawBody(sprite :HTMLImageElement) {
    this.canvas.width = sprite.width;
    this.canvas.height = sprite.height;

    this.bdy.drawImage(sprite, 0, 0);
  }

  private paintBaseColor(sprite :HTMLImageElement, color :string, maskImage :HTMLImageElement) {
    this.bdy.drawImage(this.applyMask(this.multiplyColor(sprite, color), maskImage), 0, 0);
  }

  private paintDecal(sprite :HTMLImageElement, decal :HTMLImageElement, color :string, maskImage :HTMLImageElement) {
    this.bdy.drawImage(this.applyMask(this.applyMask(this.multiplyColor(sprite, color), decal), maskImage), 0, 0);
  }

  private multiplyLight(source :HTMLCanvasElement, multiplier :HTMLCanvasElement | HTMLImageElement, angle :number) :HTMLCanvasElement {
    const {buffer, bfr} = this.prepareBuffer(source);
    const light = this.prepareBuffer(multiplier);
    const mask = this.prepareBuffer(source);

    const lightCenter = {
      x: multiplier.width / 2,
      y: multiplier.height / 2
    };

    light.bfr.save();
    light.bfr.translate(lightCenter.x, lightCenter.y);
    light.bfr.rotate(-angle * Math.PI / 180);
    light.bfr.drawImage(multiplier, -lightCenter.x, -lightCenter.y);
    light.bfr.restore();

    const offset = {
      x: mask.buffer.width / 2 - light.buffer.width / 2,
      y: mask.buffer.height / 2 - light.buffer.height / 2
    };

    mask.bfr.save();
    mask.bfr.drawImage(source, 0, 0);
    mask.bfr.globalCompositeOperation = 'multiply';
    mask.bfr.drawImage(light.buffer, 0, 0);
    mask.bfr.restore();

    bfr.save();
    bfr.drawImage(this.applyMask(mask.buffer, source), 0, 0);
    bfr.restore();

    return buffer;
  }

  private multiplyColor(source :HTMLImageElement, color :string) :HTMLCanvasElement {
    const {buffer, bfr} = this.prepareBuffer(source);

    bfr.save();
    bfr.drawImage(source, 0, 0);
    bfr.globalCompositeOperation = 'multiply';
    bfr.fillStyle = color;
    bfr.fillRect(0, 0, buffer.width, buffer.height);
    bfr.restore();

    return buffer;
  }

  private applyMask(source :HTMLCanvasElement | HTMLImageElement, maskImage :HTMLCanvasElement | HTMLImageElement) :HTMLCanvasElement {
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
