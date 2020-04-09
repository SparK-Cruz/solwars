const PIXI = require('pixi.js');
import { Renderable } from "../game_renderers/renderable";
import { Camera } from "../camera";
import { ClientInfo } from "../client";
import { R2d } from "../game_renderers/r2d";

export class GunIndicator implements Renderable {
    private info: ClientInfo;
    private sprite: any;
    private style: any;

    public constructor(private app: any, private camera: Camera) {
        const {buffer, bfr} = R2d.buffer();

        buffer.width = 1;
        buffer.height = 5;

        bfr.strokeStyle = "rgba(51, 159, 255, 0.3)";
        bfr.setLineDash([3,2]);
        bfr.lineWidth = 3;
        bfr.moveTo(0, 0);
        bfr.lineTo(0, 5);
        bfr.stroke();

        this.sprite = new PIXI.Graphics();
        this.style = {
            texture: PIXI.Texture.from(buffer),
            width: 3,
            height: 5,
        };
        this.app.stage.addChild(this.sprite);
    }

    public update(info: ClientInfo) {
        this.info = info;
    }

    public render() {
        if (!this.info)
            return;

        const bullets = Math.floor(this.info.energy / this.info.shootCost);
        const len = bullets * 5;
        const pos = this.camera.addOffset({x: 0, y: 0});

        this.sprite.clear();
        this.sprite.lineTextureStyle(this.style);
        this.sprite.position.set(pos.x, pos.y);
        this.sprite.moveTo(0, 150);
        this.sprite.lineTo(0, 150 + len);
        this.sprite.angle = this.info.angle + 180;
    }
}
