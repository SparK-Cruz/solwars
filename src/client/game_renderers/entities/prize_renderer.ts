import { EventEmitter } from 'events';
import { Renderable } from "../renderable";
import { R2d } from '../r2d';

const PRIZE_SIZE = 16;

export class PrizeRenderer extends EventEmitter implements Renderable {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private body: HTMLCanvasElement;

    public constructor(private prize: any) {
        super();

        const {buffer, bfr} = R2d.buffer();
        buffer.width = PRIZE_SIZE;
        buffer.height = PRIZE_SIZE;

        this.canvas = buffer;
        this.ctx = bfr;

        this.body = this.draw();
    }

    public render(): HTMLCanvasElement {
        this.ctx.clearRect(0, 0, PRIZE_SIZE, PRIZE_SIZE);
        this.ctx.drawImage(this.body, 0, 0);

        this.ctx.save();
        this.ctx.font = "bold 10px monospace";
        this.ctx.fillStyle = '#ffffff';
        this.ctx.translate(PRIZE_SIZE/2, PRIZE_SIZE/2);
        this.ctx.rotate(-this.prize.angle * Math.PI / 180);
        const textInfo = this.ctx.measureText('?');
        this.ctx.fillText('?', -textInfo.width/2, 4);
        this.ctx.restore();

        return this.canvas;
    }

    private draw(): HTMLCanvasElement {
        const {buffer, bfr} = R2d.buffer(this.canvas);

        bfr.fillStyle = '#007700';
        bfr.fillRect(0, 0, PRIZE_SIZE, PRIZE_SIZE);

        return buffer;
    }
}
