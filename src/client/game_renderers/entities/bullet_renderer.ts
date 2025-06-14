import * as PIXI from 'pixi.js';
import { Bullet } from '../../../space/entities/bullet.js';
import { Renderable } from '../renderable.js';

export class BulletRenderer implements Renderable {
    constructor(parent: any, public bullet: Bullet) {
        const gfx = new PIXI.Graphics();
        gfx.circle(0, 0, 2)
            .fill(parseInt(this.bullet.color.replace('#', '0x')));

        gfx.circle(0, 0, 1)
            .fill({color: 0xffffff, alpha: 0.8});

        parent.addChild(gfx);
    }

    public render() {}
}
