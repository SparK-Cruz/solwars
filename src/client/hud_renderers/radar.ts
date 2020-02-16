import { Renderable } from "../game_renderers/renderable";
import { Camera } from "../camera";
import { ClientInfo } from "../client";
import { EntityType } from "../../space/entities";
import { Stage } from "../../space/stage";

export class Radar implements Renderable {
    private ctx: CanvasRenderingContext2D;
    private buffer: HTMLCanvasElement;
    private bfr: CanvasRenderingContext2D;

    private info: ClientInfo;

    public constructor(private canvas: HTMLCanvasElement, private camera: Camera, private stage: Stage) {
        this.ctx = canvas.getContext('2d');
    }

    public update(info: ClientInfo) {
        this.info = info;
    }

    public render() {
        if (!this.info)
            return;

        const scale = 1/20;
        const regionScale = 1/512;

        const positionText = [
            'H: ',
            Math.floor(this.info.position.x * regionScale),
            ' ',
            'V: ',
            Math.floor(this.info.position.y * regionScale)
        ].join('');

        const {canvas, ctx} = this.getBuffer();

        canvas.width = 200;
        canvas.height = 230;

        ctx.save();
        ctx.fillStyle = "#3399ff";
        ctx.font = "16px monospace";
        const text = ctx.measureText(positionText);
        ctx.fillText(positionText, canvas.width / 2 - text.width / 2, 20);
        ctx.restore();

        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = "rgba(51, 159, 255, 1)";
        ctx.lineWidth = 2;
        ctx.arc(
            100,
            130,
            99,
            0,
            Math.PI * 2,
            false
        );
        ctx.stroke();
        ctx.closePath();
        ctx.clip();
        ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
        ctx.fillRect(0, 30, 200, 200);
        ctx.restore();

        ctx.save();
        ctx.translate(100, 130);

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

            const pos = this.camera.translate(entity);
            ctx.fillRect(pos.x * scale - size / 2, pos.y * scale - size / 2, size, size);

            if (typeof (<any>entity).name != 'undefined') {
                let name = (<any>entity).name;

                if (typeof (<any>entity).alive != 'undefined'
                    && !(<any>entity).alive) {
                    name = '(Dead) ' + name;
                }

                this.ctx.save();
                this.ctx.fillStyle = "#3399ff";
                this.ctx.font = "12px monospace";

                const textInfo = this.ctx.measureText(name);
                let textPos = {
                    x: pos.x - textInfo.width / 2 + this.camera.offset.x,
                    y: pos.y + 40 + this.camera.offset.y,
                };

                if (entity.id == this.info.id) {
                    textPos = {
                        x: 20,
                        y: 20,
                    };
                }

                this.ctx.fillText(name, textPos.x, textPos.y);
                this.ctx.restore();
            }
        }

        ctx.restore();

        this.ctx.save();
        this.ctx.drawImage(canvas, this.canvas.width - 220, this.canvas.height - 250);
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