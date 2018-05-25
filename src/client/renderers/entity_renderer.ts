import { Entity, EntityType } from '../../space/entities';
import { Ship } from '../../space/entities/ship';
import { Stage } from '../../space/stage2';
import { Camera, MovingPoint } from '../camera';
import { ShipRenderer } from './ship_renderer';
import { TrailRenderer } from './trail_renderer';
import { Renderable } from './renderable';

export class EntityRenderer implements Renderable {
  private ctx :CanvasRenderingContext2D;

  private cacheControl :number[];
  private trailBearers :number[];
  private cache :any;
  private coords :any;
  private trailRenderer :TrailRenderer;

  constructor(private canvas :HTMLCanvasElement, private camera :Camera, private stage :Stage) {
    this.ctx = this.canvas.getContext('2d');

    this.cacheControl = [];
    this.trailBearers = [];
    this.cache = {};
    this.coords = {};

    this.trailRenderer = new TrailRenderer(this.canvas, this.camera);
  }

  render() :HTMLCanvasElement {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const camPos = this.camera.getPosition();
    this.updateEntities(this.stage.entityPool.entities);

    this.drawTrails();
    this.draw();

    return this.canvas;
  }

  private drawTrails() {
    const trailCoords = this.readCoordsForTrails();
    this.trailRenderer.appendCoords(trailCoords);
    this.trailRenderer.render();
  }

  private readCoordsForTrails() {
    const trailCoords :any = {};

    for (var i = 0; i < this.trailBearers.length; i++) {
      if (typeof this.coords[this.trailBearers[i]] === 'undefined') {
        this.trailBearers.splice(i, 1);
        continue;
      }

      const coord = this.coords[this.trailBearers[i]];

      let offset = {x: 0, y: 0};
      let speed = {x: 0, y: 0};
      let draw = true;

      if (this.cache[this.trailBearers[i]] instanceof ShipRenderer) {
        const shipRenderer = <ShipRenderer>this.cache[this.trailBearers[i]];

        offset = shipRenderer.getTrailOffset();
        speed = shipRenderer.getTrailDriftSpeed();
        draw = shipRenderer.shouldDrawTrail();
      }

      trailCoords[this.trailBearers[i]] = {
        x: coord.x + offset.x,
        y: coord.y + offset.y,
        vx: speed.x,
        vy: speed.y,
        angle: coord.angle,
        draw: draw
      };
    }

    return trailCoords;
  }

  private updateEntities(entities :Entity[]) {
    this.cacheControl = [];
    this.coords = {};

    for (let i in entities) {
      this.cacheControl.push(entities[i].id);
      this.coords[entities[i].id] = {
        x: entities[i].x,
        y: entities[i].y,
        vx: entities[i].vx,
        vy: entities[i].vy,
        angle: entities[i].angle
      };

      if (typeof this.cache[entities[i].id] !== 'undefined')
        continue;

      this.cache[entities[i].id] = this.buildRenderer(entities[i]);
    }
  }

  private draw() {
    const camPos = this.camera.getPosition();

    for (let memId in this.cache) {
      if (this.cacheControl.indexOf(parseInt(memId)) <= -1) {
        delete this.cache[memId];
        continue;
      }

      const renderer = this.cache[memId].render();

      const coord = this.coords[memId];
      const renderCoord = {
        x: coord.x - camPos.x,
        y: coord.y - camPos.y
      };
      const center = {
        w: renderer.width / 2,
        h: renderer.height / 2
      };

      this.ctx.save();
      this.ctx.translate(renderCoord.x, renderCoord.y);
      this.ctx.rotate(coord.angle * Math.PI / 180);
      this.ctx.drawImage(renderer, -center.w, -center.h);
      this.ctx.restore();
    }
  }

  private buildRenderer(entity :Entity) :Renderable {
    switch(entity.type.name) {
      case EntityType.Ship.name:
        this.trailBearers.push(entity.id);
        return new ShipRenderer(<Ship>entity);
      default:
        console.log(entity.type);
    }

    return {render: () => {
      console.log('BOGUS');
      return null;
    }};
  }
}
