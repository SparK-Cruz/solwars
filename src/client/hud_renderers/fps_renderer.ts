import { Renderable } from "../game_renderers/renderable";

const CURVE = 100;
const FPS_DANGER = 55;
const TPS_DANGER = 20;

export class FpsRenderer implements Renderable {
    private ctx: CanvasRenderingContext2D;
    private lastRender: number;
    private framesLog: number[] = [];
    private ticksLog: number[] = [];

    public constructor(private canvas: HTMLCanvasElement) {
        this.ctx = this.canvas.getContext('2d');
        this.lastRender = Date.now();
    }

    public update(ticks: number[]) {
        this.ticksLog = ticks;
    }

    public render() {
        const frames = this.calculateFramerate();
        const ticks = this.calculateTickrate();

        this.drawNumber(frames, 2, 10, FPS_DANGER);
        this.drawNumber(ticks, 50, 10, TPS_DANGER);

        return this.canvas;
    }

    private drawNumber(number: number, x: number, y: number, danger: number = 0) {
        this.ctx.save();
        this.ctx.fillStyle = "#ff9933";
        if (number <= danger) {
            this.ctx.fillStyle = "#ff0000";
        }
        this.ctx.font = "8px monospace";
        this.ctx.fillText(number.toFixed(0), x, y);
        this.ctx.restore();
    }

    private calculateFramerate() {
        const now = Date.now();
        const timeDiff = now - this.lastRender;
        this.lastRender = now;
        this.framesLog.push(1000 / timeDiff);

        while (this.framesLog.length > CURVE) {
            this.framesLog.shift();
        }

        const count = Math.min(this.framesLog.length, CURVE);
        return this.framesLog.reduce((result, fps) => result + fps / count, 0);
    }

    private calculateTickrate() {
        const count = this.ticksLog.length;
        return this.ticksLog.map(time => 1000/time).reduce((result, tps) => result + tps / count, 0);
    }
}
