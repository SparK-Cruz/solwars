import * as PIXI from 'pixi.js';
import { Renderable } from "../game_renderers/renderable.js";

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

    public constructor(private parent: PIXI.Container) {
        this.lastRender = Date.now();

        this.fpsText = new PIXI.Text();
        this.tickText = new PIXI.Text();
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
        return ((<any>this.parent).app as PIXI.Application).ticker.FPS;
    }

    private calculateTickrate() {
        const count = this.ticksLog.length;
        return this.ticksLog.reduce((result, tps) => result + tps / count, 0);
    }
}
