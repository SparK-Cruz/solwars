import { Camera, MovingPoint } from '../camera';
import { Renderable } from './renderable';

export class Indicator implements Renderable {
  private context :CanvasRenderingContext2D;

  constructor(private canvas :HTMLCanvasElement, private camera :Camera) {
  }

  public render() :HTMLCanvasElement {


    return this.canvas;
  }
}
