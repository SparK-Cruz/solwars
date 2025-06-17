import * as PIXI from 'pixi.js';
import { Renderable } from "./game_renderers/renderable.js";

const SECOND = 64; //Client tick
const FADE = 20;
const PADDING = 5;

export interface ToastTime {
    time: number;
}
export namespace ToastTime {
    export const IMMEDIATE: ToastTime = { time: SECOND / 2 };
    export const SHORT: ToastTime = { time: 2 * SECOND };
    export const LONG: ToastTime = { time: 3 * SECOND };
}

const DEFAULT_COLOR = 0x3399ff;

export class ToastRenderer implements Renderable {
    private container: PIXI.Container;
    private resolution: number = 1;
    private timer = 0;

    private position = {x: 0, y: 0};
    private textStyle: PIXI.TextStyleOptions = {
        fontFamily: 'monospace',
        fontSize: 14,
        fontWeight: 'bold',
        fill: 0x3399ff,
    };

    public constructor(private parent: PIXI.Container, {position, color, resolution = 1}: {position?: {x?: number, y?: number}, color?: number, resolution?: number} = {}) {
        this.container = new PIXI.Container();
        parent.addChild(this.container);

        this.position = {
            x: (<any>this.parent).canvas.width / 2 * (1 / resolution),
            y: (<any>this.parent).canvas.height - 100,
        };

        if (position) {
            this.position = Object.assign({}, this.position, position);
        }

        this.textStyle.fill = color ?? DEFAULT_COLOR;
        this.resolution = resolution;
    }

    public toast(text: string, time: ToastTime): void {
        this.container.removeChildren();
        this.container.alpha = 1;

        this.timer = time.time;
        const element = new PIXI.Text({ text, style: this.textStyle });
        element.anchor.set(0.5);
        element.cacheAsTexture(false);

        const rect = {
            width: element.width + PADDING * 2,
            height: element.height + PADDING * 2,
        };

        const gfx = new PIXI.Graphics();
        gfx.rect(
            -rect.width / 2,
            -rect.height / 2,
            rect.width,
            rect.height
        ).fill({ color: 0x000000, alpha: 0.8 });

        this.container.position.set(this.position.x, this.position.y);

        this.container.addChild(gfx);
        this.container.addChild(element);
    }

    public render() {
        if (this.timer <= 0) {
            this.container.alpha = 0;
            return;
        }

        if (--this.timer < FADE) {
            this.container.alpha = this.timer / FADE;
        }
    }
}
