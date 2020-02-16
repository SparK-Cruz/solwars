import { Renderable } from "../game_renderers/renderable";
import { Camera } from "../camera";
import { ClientInfo } from "../client";

export class GunIndicator implements Renderable {
    private ctx: CanvasRenderingContext2D;
    private buffer: HTMLCanvasElement;
    private bfr: CanvasRenderingContext2D;
    private info: ClientInfo;

    public constructor(private canvas: HTMLCanvasElement, private camera: Camera) {
        this.ctx = canvas.getContext('2d');
    }

    public update(info: ClientInfo) {
        this.info = info;
    }

    public render() {
        if (!this.info)
            return;

        const {canvas, ctx} = this.getBuffer();

        const bullets = Math.floor(this.info.energy / 150);
        const len = bullets * 4;
        
        canvas.height = Math.max(len, 1);
        canvas.width = 3;

        ctx.clearRect(0, 0, 3, Math.max(len, 1));

        ctx.save();
        ctx.strokeStyle = "rgba(51, 159, 255, 0.3)";
        ctx.setLineDash([3,1]);
        ctx.translate(1, 0);
        ctx.lineWidth = 3;
        ctx.moveTo(0, 0);
        ctx.lineTo(0, len);
        ctx.stroke();
        ctx.restore();

        const pos = this.camera.addOffset({x: 0, y: 0});
        this.ctx.save();
        this.ctx.translate(pos.x, pos.y);
        this.ctx.rotate(this.info.angle * Math.PI / 180);
        this.ctx.drawImage(canvas, 0, -(100 + len / 2));
        this.ctx.restore();

        return this.canvas;
    }

    private getBuffer() {
        this.buffer = this.buffer || document.createElement('canvas');
        this.bfr = this.bfr || this.buffer.getContext('2d');

        return {
            canvas: this.buffer,
            ctx: this.bfr
        };
    }
}