import { Renderable } from "../game_renderers/renderable";
import { ClientInfo } from "../client";
import { Camera } from "../camera";
import { Mapping } from "../../space/entities/ships/mapping";

export class SpeedIndicator implements Renderable {
    private ctx: CanvasRenderingContext2D;
    private info: ClientInfo;

    private buffer: HTMLCanvasElement;
    private bfr: CanvasRenderingContext2D;

    public constructor(private canvas: HTMLCanvasElement, private camera: Camera) {
        this.ctx = this.canvas.getContext('2d');
    }

    public update(info: ClientInfo) {
        this.info = info;
    }

    public render() {
        if (!this.info) {
            return;
        }

        const indicatorSize = 6;
        const speed = Math.sqrt(Math.pow(this.info.speed.x, 2) + Math.pow(this.info.speed.y, 2));
        const speedScale = 6;
        const alpha = speed / (this.info.maxSpeed * 2);
        const angleOffset = 90 * Math.PI / 180;
        const angle = Math.atan2(this.info.speed.y, this.info.speed.x) + angleOffset;
        let baseColor = [51, 159, 255].join(', ');

        if (this.info.control & Mapping.AFTERBURNER) {
            baseColor = [255, 159, 51].join(', ');
        }

        let {canvas, ctx} = this.getBuffer();

        const half = 16;
        canvas.width = half * 2;
        canvas.height = half * 2;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.save();
        ctx.translate(half, half);
        ctx.rotate(angle);
        ctx.moveTo(-indicatorSize, indicatorSize);
        ctx.lineTo(0, 0);
        ctx.lineTo(indicatorSize, indicatorSize);

        if (alpha > 0.5) {
            ctx.moveTo(-indicatorSize, 0);
            ctx.lineTo(0, -indicatorSize);
            ctx.lineTo(indicatorSize, 0);
        }

        ctx.lineWidth = 3;
        ctx.lineCap = "butt";
        ctx.strokeStyle = "rgba(" + baseColor + ", " + Math.min(alpha * 0.6, 1) + ")";
        ctx.stroke();
        ctx.restore();

        const point = this.camera.addOffset({
            x: this.info.speed.x * speedScale - half,
            y: this.info.speed.y * speedScale - half,
        });

        this.ctx.save();
        this.ctx.drawImage(canvas, point.x, point.y);
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
