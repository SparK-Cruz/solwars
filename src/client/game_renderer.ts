import { Stage } from '../space/stage';
import { Camera } from './camera';
import { Renderable } from './game_renderers/renderable';
import { Background } from './game_renderers/background';
import { EntityRenderer } from './game_renderers/entity_renderer';

export class GameRenderer implements Renderable {
  private c :CanvasRenderingContext2D;

  private bg :Background;
  private entityRenderer :EntityRenderer;

  constructor(private canvas :HTMLCanvasElement, private camera :Camera, private stage :Stage) {
    let bgCanvas = this.copySize(canvas, document.createElement('canvas'));
    let fgCanvas = this.copySize(canvas, document.createElement('canvas'));

    this.bg = new Background(bgCanvas, camera);
    this.entityRenderer = new EntityRenderer(fgCanvas, camera, stage);

    this.c = canvas.getContext('2d');
    this.c.imageSmoothingEnabled = false;
  }

  render() :HTMLCanvasElement {
    this.c.save();
    this.c.drawImage(this.bg.render(), 0, 0);
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
