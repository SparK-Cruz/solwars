import { Renderable } from "../game_renderers/renderable";
import { Camera } from "../camera";
import { ClientInfo } from "../client";
import { EntityType } from "../../space/entities";
import { Stage } from ".././stage";

export class Radar implements Renderable {
    private ctx: CanvasRenderingContext2D;

    private coordBuffer: HTMLCanvasElement;
    private cbfr: CanvasRenderingContext2D;
    private frameBuffer: HTMLCanvasElement;
    private fbfr: CanvasRenderingContext2D;
    private blipsBuffer: HTMLCanvasElement;
    private bbfr: CanvasRenderingContext2D;

    private info: ClientInfo;
    private scale = 1/20;
    private regionScale = 1/512;
    private pos = {x: -220, y: -250};

    public constructor(private canvas: HTMLCanvasElement, private camera: Camera, private stage: Stage) {
        this.ctx = this.canvas.getContext('2d');

        this.initialize();
    }

    public update(info: ClientInfo) {
        this.info = info;
    }

    private initialize() {
        this.initializeCoord();
        this.initializeFrame();
        this.initializeBlips();
    }

    private initializeCoord() {
        const {canvas} = this.getCoordBuffer();
        canvas.width = 200;
        canvas.height = 20;
    }

    private initializeFrame() {
        const {canvas, ctx} = this.getFrameBuffer();
        canvas.width = 200;
        canvas.height = 200;

        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = "rgba(51, 159, 255, 1)";
        ctx.lineWidth = 2;
        this.drawArc(ctx);
        ctx.stroke();
        ctx.closePath();
        ctx.clip();
        ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
        ctx.fillRect(0, 0, 200, 200);
        ctx.restore();
    }

    private initializeBlips() {
        const {canvas, ctx} = this.getBlipsBuffer();
        canvas.width = 200;
        canvas.height = 200;

        ctx.beginPath();
        this.drawArc(ctx);
        ctx.closePath();
        ctx.clip();
    }

    private drawArc(ctx: CanvasRenderingContext2D) {
        ctx.arc(
            100, 100,
            99,
            0, Math.PI * 2,
            false
        );
    }

    public render() {
        if (!this.info)
            return;

        const pos = {
            x: this.canvas.width + this.pos.x,
            y: this.canvas.height + this.pos.y,
        };

        this.ctx.save();

        this.ctx.drawImage(this.drawCoordinates(), pos.x, pos.y);
        pos.y += 30;

        this.ctx.drawImage(this.getFrameBuffer().canvas, pos.x, pos.y);
        this.ctx.drawImage(this.drawBlips(), pos.x, pos.y);

        this.ctx.restore();

        return this.canvas;
    }

    private drawCoordinates() {
        const positionText = [
            'H: ',
            Math.floor(this.info.position.x * this.regionScale),
            ' ',
            'V: ',
            Math.floor(this.info.position.y * this.regionScale)
        ].join('');

        const {canvas, ctx} = this.getCoordBuffer();

        ctx.clearRect(0, 0, 200, 20);

        ctx.save();
        ctx.fillStyle = "#3399ff";
        ctx.font = "16px monospace";
        const text = ctx.measureText(positionText);
        ctx.fillText(positionText, canvas.width / 2 - text.width / 2, 20);
        ctx.restore();

        return canvas;
    }

    private drawBlips() {
        const {canvas, ctx} = this.getBlipsBuffer();

        ctx.clearRect(0, 0, 200, 200);

        ctx.save();
        ctx.translate(100, 100);

        const entities = this.stage.fetchAllEntities();
        for(let i in entities) {
            const entity = entities[i];
            let size = 3;
            ctx.fillStyle = "#ff9933";
            if (entity.id == this.info.id) {
                ctx.fillStyle = "#ffffff";
            }
            if (entity.type.name === EntityType.Bullet.name) {
                ctx.fillStyle = "#ff0000";
                size = 1;
            }
            if (entity.type.name === EntityType.ShipDebris.name) {
                ctx.fillStyle = "rgba(255, 159, 51, 0.2)";
                size = 1;
            }

            const pos = this.camera.translate(entity);
            ctx.fillRect(pos.x * this.scale - size / 2, pos.y * this.scale - size / 2, size, size);
        }

        ctx.restore();

        return canvas;
    }

    private getCoordBuffer() {
        this.coordBuffer = this.coordBuffer || document.createElement('canvas');
        this.cbfr = this.cbfr || this.coordBuffer.getContext('2d');

        return {
            canvas: this.coordBuffer,
            ctx: this.cbfr
        };
    }

    private getFrameBuffer() {
        this.frameBuffer = this.frameBuffer || document.createElement('canvas');
        this.fbfr = this.fbfr || this.frameBuffer.getContext('2d');

        return {
            canvas: this.frameBuffer,
            ctx: this.fbfr
        };
    }

    private getBlipsBuffer() {
        this.blipsBuffer = this.blipsBuffer || document.createElement('canvas');
        this.bbfr = this.bbfr || this.blipsBuffer.getContext('2d');

        return {
            canvas: this.blipsBuffer,
            ctx: this.bbfr
        };
    }
}
