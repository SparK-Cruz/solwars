import { Renderable } from './renderable';
import { Camera, MovingPoint } from './camera';

export class Indicator implements Renderable {
  private trackable :MovingPoint;
  private context :CanvasRenderingContext2D;

  constructor(private canvas :HTMLCanvasElement, private camera :Camera) {
    this.trackable = camera.getTrackable();
  }

  public render() :HTMLCanvasElement {


    return this.canvas;
  }
}
