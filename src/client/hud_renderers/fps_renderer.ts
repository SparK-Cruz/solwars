const PIXI = require('pixi.js');
import { Renderable } from "../game_renderers/renderable";

const CURVE = 100;
const FPS_DANGER = 55;
const TPS_DANGER = 20;

const normalStyle = new PIXI.TextStyle({
    fill: 0xff9933,
    fontFamily: 'monospace',
    fontSize: 8
});
const dangerStyle = new PIXI.TextStyle({
    fill: 0xff0000,
    fontFamily: 'monospace',
    fontSize: 8
});

export class FpsRenderer implements Renderable {
    private lastRender: number;
    private framesLog: number[] = [];
    private ticksLog: number[] = [];

    private fpsText: any;
    private tickText: any;

    public constructor(parent: any) {
        this.lastRender = Date.now();

        this.fpsText = new PIXI.Text('');
        this.tickText = new PIXI.Text('');
        this.fpsText.position.set(2, 2);
        this.tickText.position.set(50, 2);

        parent.addChild(this.fpsText);
        parent.addChild(this.tickText);
    }

    public update(ticks: number[]) {
        this.ticksLog = ticks;
    }

    public render() {
        const frames = this.calculateFramerate();
        const ticks = this.calculateTickrate();

        this.drawNumber(this.fpsText, frames, FPS_DANGER);
        this.drawNumber(this.tickText, ticks, TPS_DANGER);
    }

    private drawNumber(object: any, number: number, danger: number = 0) {
        object.text = number.toFixed(0);
        object.style = normalStyle;
        if (number < danger) {
            object.style = dangerStyle;
        }
    }

    private calculateFramerate() {
        const now = window.performance.now();
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
        return this.ticksLog.reduce((result, tps) => result + tps / count, 0);
    }
}
