import * as PIXI from 'pixi.js';
import { Renderable } from "../game_renderers/renderable.js";
import { Camera } from "../camera.js";
import { Stage } from ".././stage.js";
import { ClientInfo } from "../client.js";
import { EntityType } from "../../space/entities.js";
import { IS_MOBILE } from "../environment.js";

const style: PIXI.TextStyleOptions = {
    fontFamily: 'monospace',
    fontSize: 10,
    fill: 0xff9933,
    align: 'center',
};
const playerStyle: PIXI.TextStyleOptions = {
    fontFamily: 'monospace',
    fontSize: 14,
    fill: 0x3399ff,
    align: 'center',
};

export class NameRenderer implements Renderable {
    private container: any;
    private playerName: any;
    private info: ClientInfo;
    private pool: any[] = [];

    public constructor(private parent: any, private camera: Camera, private stage: Stage) {
        this.container = new PIXI.Container();
        this.playerName = new PIXI.Text({
            style: playerStyle
        });

        this.playerName.position.set(20);
        this.container.position.set(0);

        if (!IS_MOBILE)
            this.container.addChild(this.playerName);

        this.parent.addChild(this.container);
    }

    public update(info: ClientInfo) {
        this.info = info;
    }

    public render() {
        if (!this.info)
            return;

        const entities = this.stage.fetchAllEntities();

        this.pool.forEach(t => t.visible = false);

        let index = 0;
        for (let i in entities) {
            const entity = entities[i];

            if (entity.type.name !== EntityType.Ship.name)
                continue;

            let name = (<any>entity).name || 'BUG: PLEASE TAKE A SCREENSHOT';
            if (typeof (<any>entity).alive != 'undefined'
                && !(<any>entity).alive) {
                name = '(Dead) ' + name;
            }

            if (entity.id == this.info.id) {
                this.playerName.text = name;
                continue;
            }

            const text = this.getText(index++);
            text.visible = true;

            const entityPos = this.camera.translate(entity);
            let pos = {
                x: entityPos.x + this.camera.offset.x,
                y: entityPos.y + 32 + this.camera.offset.y,
            };

            text.text = name;
            text.position.set(pos.x, pos.y);
        }
    }

    private getText(index: number) {
        if (index < this.pool.length) {
            return this.pool[index];
        }

        const text = new PIXI.Text({style});
        text.anchor.set(0.5, 0);
        this.pool.push(text);
        this.container.addChild(text);
        return text;
    }
}
