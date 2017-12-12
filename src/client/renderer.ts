import { Renderable } from './renderable';
import { Camera } from './camera';
import { Background } from './background';
import { Grid } from './grid';
import { Indicator } from './indicator';
import { EntityRenderer } from './entity_renderer';
import { Stage } from '../space/stage';

export class Renderer implements Renderable {
  private c :CanvasRenderingContext2D;

  private bg :Background;
  private grid :Grid;
  private entityRenderer :EntityRenderer;

  constructor(private canvas :HTMLCanvasElement, private camera :Camera, private stage :Stage) {
    let bgCanvas = this.copySize(canvas, document.createElement('canvas'));
    let gridCanvas = this.copySize(canvas, document.createElement('canvas'));
    let fgCanvas = this.copySize(canvas, document.createElement('canvas'));
    let inCanvas = this.copySize(canvas, document.createElement('canvas'));

    this.bg = new Background(bgCanvas, camera);
    this.grid = new Grid(gridCanvas, camera, Stage.SECTOR_SIZE, Stage.SUBDIVISIONS);
    this.entityRenderer = new EntityRenderer(fgCanvas, camera, stage);
    this.indicator = new Indicator(inCanvas, camera);

    this.c = canvas.getContext('2d');
  }

  render() :HTMLCanvasElement {
    this.c.save();
    this.c.drawImage(this.bg.render(), 0, 0);
    this.c.drawImage(this.grid.render(), 0, 0);
    this.c.drawImage(this.entityRenderer.render(), 0, 0);
    this.c.restore();

    return this.canvas;
  }

  private copySize(origin :{width :number, height :number}, target :{width :number, height :number}) :any {
    target.width = origin.width;
    target.height = origin.height;

    return target;
  }
}
