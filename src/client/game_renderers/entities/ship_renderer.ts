import { Ship } from '../../../space/entities/ship';
import { Control } from '../../../space/entities/ships/control';
import { Renderable } from '../renderable';
import { Assets, Asset } from '../../assets';
import { R2d } from '../r2d';

export class ShipRenderer implements Renderable {
  private canvas :HTMLCanvasElement;
  private ctx :CanvasRenderingContext2D;
  private body :HTMLCanvasElement;
  private bdy :CanvasRenderingContext2D;
  private light :HTMLImageElement;

  private alive :boolean;

  constructor(public ship :Ship) {
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

    Assets.fetchAll(files, {target: this, callback: (sprites :Asset[]) => {
      this.draw(sprites, colors);
    }});

    Assets.fetch('img/light.png', {target: this, callback: (sprite :Asset) => {
      this.light = sprite.content;
    }});

    this.alive = true;
  }

  public render() :HTMLCanvasElement {
    if (this.body && this.light && this.alive) {
      this.ctx.drawImage(R2d.multiplyImage(this.body, this.light, this.ship.angle), 0, 0);
    }

    if (this.body && this.ship.damage >= this.ship.health && this.alive) {
      const {buffer, bfr} = R2d.buffer(this.canvas);
      bfr.fillStyle = 'rgba(0,0,0,0.5)';
      bfr.fillRect(0, 0, buffer.width, buffer.height);

      this.ctx.drawImage(R2d.multiplyImage(this.body, buffer, this.ship.angle), 0, 0);
      this.alive = false;
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
    this.bdy.drawImage(R2d.applyMask(R2d.multiplyColor(sprite, color), maskImage), 0, 0);
  }

  private paintDecal(sprite :HTMLImageElement, decal :HTMLImageElement, color :string, maskImage :HTMLImageElement) {
    this.bdy.drawImage(R2d.applyMask(R2d.applyMask(R2d.multiplyColor(sprite, color), decal), maskImage), 0, 0);
  }
}
