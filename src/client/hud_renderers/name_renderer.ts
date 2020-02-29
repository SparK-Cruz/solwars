import { Renderable } from "../game_renderers/renderable";
import { Camera } from "../camera";
import { Stage } from ".././stage";
import { ClientInfo } from "../client";
import { EntityType } from "../../space/entities";

export class NameRenderer implements Renderable {
    private ctx: CanvasRenderingContext2D;

    private info: ClientInfo;

    public constructor(private canvas: HTMLCanvasElement, private camera: Camera, private stage: Stage) {
        this.ctx = this.canvas.getContext('2d');
    }

    public update(info: ClientInfo) {
        this.info = info;
    }

    public render() {
        if (!this.info)
            return;

        const entities = this.stage.fetchAllEntities();
        for(let i in entities) {
            const entity = entities[i];

            if (entity.type.name !== EntityType.Ship.name)
                continue;

            let name = (<any>entity).name || 'BUG: PLEASE TAKE A SCREENSHOT';

            const pos = this.camera.translate(entity);

            if (typeof (<any>entity).alive != 'undefined'
                && !(<any>entity).alive) {
                name = '(Dead) ' + name;
            }

            this.ctx.save();
            this.ctx.fillStyle = "#ff9933";
            this.ctx.font = "10px monospace";

            const textInfo = this.ctx.measureText(name);
            let textPos = {
                x: pos.x - textInfo.width / 2 + this.camera.offset.x,
                y: pos.y + 40 + this.camera.offset.y,
            };

            if (entity.id == this.info.id) {
                textPos = {
                    x: 20,
                    y: 34,
                };
                this.ctx.font = "14px monospace";
                this.ctx.fillStyle = "#3399ff";
            }

            this.ctx.fillText(name, textPos.x, textPos.y);
            this.ctx.restore();
        }

        return this.canvas;
    }
}
