import { Renderable } from "../game_renderers/renderable";
import { ClientInfo } from "../client";

export class EnergyIndicator implements Renderable {
    private ctx: CanvasRenderingContext2D;

    private info: ClientInfo;

    public constructor(private canvas: HTMLCanvasElement) {
        this.ctx = this.canvas.getContext('2d');
    }

    public update(info: ClientInfo) {
        this.info = info;
    }

    public render() {
        if (!this.info)
            return;

        const perc = Math.max(this.info.energy / this.info.maxEnergy, 0);
        let color = "#3399ff";
        if (perc < 0.4) {
            color = "#ff9933";
        }

        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.rect(20, this.canvas.height - 250, 6, 230);
        this.ctx.strokeStyle = "#202020";
        this.ctx.stroke();
        this.ctx.closePath();
        this.ctx.restore();

        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.rect(22, (this.canvas.height - 248) + 226 - 226 * perc, 2, 226 * perc);
        this.ctx.fillStyle = color;
        this.ctx.fill();
        this.ctx.closePath();
        this.ctx.restore();

        return this.canvas;
    }
}
