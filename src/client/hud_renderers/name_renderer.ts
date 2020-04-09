const PIXI = require('pixi.js');
import { Renderable } from "../game_renderers/renderable";
import { Camera } from "../camera";
import { Stage } from ".././stage";
import { ClientInfo } from "../client";
import { EntityType } from "../../space/entities";

const style = {
    fontFamily: 'monospace',
    fontSize: 10,
    fill: 0xff9933,
    align: 'center',
};

export class NameRenderer implements Renderable {
    private container: any;
    private playerName: any;
    private info: ClientInfo;
    private pool: any[] = [];

    public constructor(private app: any, private camera: Camera, private stage: Stage) {
        this.container = new PIXI.Container();
        this.playerName = new PIXI.Text('', {
            fontFamily: 'monospace',
            fontSize: 14,
            fill: 0x3399ff,
            align: 'center',
        });

        this.playerName.position.set(20);
        this.container.position.set(0);

        this.container.addChild(this.playerName);
        this.app.stage.addChild(this.container);
    }

    public update(info: ClientInfo) {
        this.info = info;
    }

    public render() {
        if (!this.info)
            return;

        const entities = this.stage.fetchAllEntities();

        this.pool.slice(entities.length).forEach(t => t.visible = false);

        let index = 0;
        for(let i in entities) {
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
                x: entityPos.x - text.width / 2 + this.camera.offset.x,
                y: entityPos.y + 40 + this.camera.offset.y,
            };

            text.text = name;
            text.position.set(pos.x, pos.y);
        }
    }

    private getText(index: number) {
        if (index < this.pool.length) {
            return this.pool[index];
        }

        const text = new PIXI.Text('', style);
        this.pool.push(text);
        this.container.addChild(text);
        return text;
    }
}
