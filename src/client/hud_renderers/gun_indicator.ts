const PIXI = require('pixi.js');
import { Renderable } from "../game_renderers/renderable";
import { Camera } from "../camera";
import { ClientInfo } from "../client";

const PAD = 70;

export class GunIndicator implements Renderable {
    private info: ClientInfo;
    private sprite: any;

    public constructor(parent: any, private camera: Camera) {
        const line = new PIXI.Graphics();
        line.lineStyle(3, 0x3399ff, 0.5);
        line.moveTo(0, PAD + 0);
        line.lineTo(0, PAD + 3);
        line.moveTo(0, PAD + 6);
        line.lineTo(0, PAD + 10);
        line.moveTo(0, PAD + 13);
        line.lineTo(0, PAD + 17);

        this.sprite = line;

        parent.addChild(this.sprite);
    }

    public update(info: ClientInfo) {
        this.info = info;
    }

    public render() {
        if (!this.info)
            return;

        const pos = this.camera.addOffset({ x: 0, y: 0 });

        this.sprite.position.set(pos.x, pos.y);
        this.sprite.angle = this.info.angle + 180;
    }
}
