import { ShipDebris } from '../../space/entities/ship_debris';
import { Renderable } from './renderable';

export class ShipDebrisRenderer implements Renderable {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private alpha: number;

    constructor(public debris: ShipDebris) {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');

        this.canvas.width = 20;
        this.canvas.height = 20;

        this.alpha = Math.random() * 0.5;
        this.draw(this.alpha);
    }

    public render(): HTMLCanvasElement {
        return this.canvas;
    }

    private draw(alpha: number) {
        this.ctx.clearRect(0, 0, 20, 20);
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.translate(10, 10);
        this.ctx.moveTo(0, 0);
        this.debris.collisionMap.forEach(point => {
            this.ctx.lineTo(point[0], point[1]);
        });
        this.ctx.fillStyle = this.debris.color;
        this.ctx.fill();
        this.ctx.fillStyle = `rgba(0,0,0,${alpha})`;
        this.ctx.fill();
        this.ctx.restore();
    }
}
