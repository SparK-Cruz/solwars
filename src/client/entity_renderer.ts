import { Renderable } from './renderable';
import { Camera, MovingPoint } from './camera';
import { ShipRenderer } from './renderers/ship_renderer';
import { Entity, EntityType } from '../space/entities';
import { Ship } from '../space/entities/ship';
import { Stage } from '../space/stage';

export class EntityRenderer implements Renderable {
  private cache :any;
  private coords :any;

  constructor(private canvas :HTMLCanvasElement, private camera :Camera, private stage :Stage) {
    this.cache = {};
    this.coords = {};
  }

  render() :HTMLCanvasElement {
    let cameraPosition = this.camera.getPosition();
    this.cacheEntities(this.stage.fetchEntitiesAround(cameraPosition.x, cameraPosition.y));

    let ctx = this.canvas.getContext('2d');

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawFromCache(ctx, cameraPosition);

    return this.canvas;
  }

  private cacheEntities(entities :Entity[]) {
    for (let i = 0; i < entities.length; ++i) {
      this.coords[entities[i].memId] = {
        x: entities[i].x,
        y: entities[i].y,
        vx: entities[i].vx,
        vy: entities[i].vy,
        angle: entities[i].angle
      };

      if (typeof this.cache[entities[i].memId] !== 'undefined')
        continue;

      this.cache[entities[i].memId] = this.buildRenderer(entities[i]).render();
    }
  }

  private drawFromCache(ctx :CanvasRenderingContext2D, camPos :MovingPoint) {
    for (let memId in this.cache) {
      let coord = this.coords[memId];
      let renderCoord = {
        x: coord.x - camPos.x,
        y: coord.y - camPos.y
      };
      let center = {
        w: this.cache[memId].width / 2,
        h: this.cache[memId].height / 2
      };

      ctx.save();
      ctx.translate(renderCoord.x, renderCoord.y);
      ctx.rotate(coord.angle * Math.PI / 180);
      ctx.drawImage(this.cache[memId], -center.w, -center.h);
      ctx.restore();
    }
  }

  private buildRenderer(entity :Entity) :Renderable {
    switch(entity.type) {
      case EntityType.Ship:
        return new ShipRenderer(<Ship>entity);
      default:
        console.log(entity.type);
    }
  }
}
