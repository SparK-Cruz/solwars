const PIXI = require('pixi.js');
import { Bullet } from '../../../space/entities/bullet';
import { Renderable } from '../renderable';

export class BulletRenderer implements Renderable {
    constructor(parent: any, public bullet: Bullet) {
        const gfx = new PIXI.Graphics();
        gfx.beginFill(parseInt(this.bullet.color.replace('#', '0x')));
        gfx.drawCircle(0, 0, 2);
        gfx.endFill();

        gfx.beginFill(0xffffff, 0.8);
        gfx.drawCircle(0, 0, 1);
        gfx.endFill();

        parent.addChild(gfx);
    }

    public render() {}
}
