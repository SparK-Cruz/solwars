import * as PIXI from 'pixi.js';
import { Bullet } from '../../../space/entities/bullet.js';
import { Renderable } from '../renderable.js';

export class BulletRenderer implements Renderable {
    private gfx: PIXI.Graphics;

    constructor(parent: any, public bullet: Bullet) {
        const size = 3;

        const gfx = new PIXI.Graphics();
        this.gfx = gfx;

        gfx.moveTo(-size, 0);
        gfx.lineTo(size, 0);
        gfx.stroke(parseInt(this.bullet.color.replace('#', '0x')));

        gfx.moveTo(0, -size);
        gfx.lineTo(0, size);
        gfx.stroke(parseInt(this.bullet.color.replace('#', '0x')));

        gfx.circle(0, 0, 1)
            .fill({color: 0xffffff, alpha: 0.5});

        parent.addChild(gfx);
    }

    public render() {
        this.gfx.angle += 24;
    }
}
