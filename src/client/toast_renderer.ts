const PIXI = require('pixi.js');
import { Renderable } from "./game_renderers/renderable";

const SECOND = 60; //Client tick
const FADE = 30;
const PADDING = 10;

export interface ToastTime {
    time: number;
}
export namespace ToastTime {
    export const SHORT: ToastTime = {time: 2 * SECOND};
    export const LONG: ToastTime = {time: 3 * SECOND};
}

const textStyle = {
    fontFamily: 'monospace',
    fontSize: 14,
    fontWeight: 'bold',
    fill: 0x3399ff,
};

export class ToastRenderer implements Renderable {
    private container: any;
    private timer = 0;

    public constructor(private parent: any) {
        this.container = new PIXI.Container();
        parent.addChild(this.container);
    }

    public toast(text: string, time: ToastTime): void {
        this.container.removeChildren();
        this.container.alpha = 1;

        const center = {
            x: this.parent.view.width / 2,
            y: this.parent.view.height - 200,
        };

        this.timer = time.time;
        const element = new PIXI.Text(text, textStyle);
        element.anchor.set(0.5);

        const rect = {
            width: element.width + PADDING * 2,
            height: element.height + PADDING * 2,
        };

        const gfx = new PIXI.Graphics();
        gfx.beginFill(0x000000, 0.8);
        gfx.drawRect(
            -rect.width / 2,
            -rect.height / 2,
            rect.width,
            rect.height
        );
        gfx.endFill();

        this.container.position.set(center.x, center.y);

        this.container.addChild(gfx);
        this.container.addChild(element);
    }

    public render(): HTMLCanvasElement {
        if (this.timer <= 0) {
            this.container.alpha = 0;
            return;
        }

        if (--this.timer < FADE) {
            this.container.alpha = this.timer / FADE;
        }
    }
}
