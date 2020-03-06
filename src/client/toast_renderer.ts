import { Renderable } from "./game_renderers/renderable";

const SECOND = 64; //Client tick
const FADE = 32;
const PADDING = 10;

export interface ToastTime {
    time: number;
}
export namespace ToastTime {
    export const SHORT: ToastTime = {time: 2 * SECOND};
    export const LONG: ToastTime = {time: 3 * SECOND};
}

export class ToastRenderer implements Renderable {
    private ctx: CanvasRenderingContext2D;
    private timer = 0;
    private text = '';
    private center: {x: number, y: number};

    public constructor(private canvas: HTMLCanvasElement) {
        this.ctx = canvas.getContext('2d');
    }

    public toast(text: string, time: ToastTime): void {
        this.center = {
            x: this.canvas.width / 2,
            y: this.canvas.height - 200,
        };

        this.timer = time.time;
        this.text = text;
    }

    public render(): HTMLCanvasElement {
        if (this.timer <= 0) {
            return;
        }

        this.ctx.save();
        if (--this.timer < FADE) {
            this.ctx.globalAlpha = this.timer / FADE;
        }
        this.ctx.font = 'bold 14px monospace';
        const info = this.ctx.measureText(this.text);
        const rect = {
            width: info.width + PADDING * 2,
            height: 20 + PADDING * 2,
        };

        this.ctx.fillStyle = 'rgba(0,0,0,0.8)';
        this.ctx.fillRect(this.center.x - rect.width / 2, this.center.y - rect.height / 2, rect.width, rect.height);
        this.ctx.fillStyle = '#39f';
        this.ctx.fillText(this.text, this.center.x - info.width / 2, this.center.y + 6);

        this.ctx.restore();

        return this.canvas;
    }
}
