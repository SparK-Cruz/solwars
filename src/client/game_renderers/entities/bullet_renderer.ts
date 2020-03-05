import { Bullet } from '../../../space/entities/bullet';
import { Renderable } from '../renderable';

export class BulletRenderer implements Renderable {
    private canvas :HTMLCanvasElement;
    private ctx :CanvasRenderingContext2D;

    constructor(public bullet: Bullet) {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');

        this.canvas.width = 7;
        this.canvas.height = 7;

        this.ctx.beginPath();
        this.ctx.arc(4, 4, 3, 0, 2 * Math.PI);
        this.ctx.fillStyle = this.bullet.color;
        this.ctx.fill();

        this.ctx.beginPath();
        this.ctx.arc(4, 4, 1, 0, 2 * Math.PI);
        this.ctx.fillStyle = "rgb(255, 255, 255)";
        this.ctx.fill();
    }

    public render(): HTMLCanvasElement {
        return this.canvas;
    }
}
