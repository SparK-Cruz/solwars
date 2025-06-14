import * as PIXI from 'pixi.js';
import { ShipDebris } from '../../../space/entities/ship_debris.js';
import { Renderable } from '../renderable.js';

export class ShipDebrisRenderer implements Renderable {
    constructor(parent: any, public debris: ShipDebris) {
        const gfx = new PIXI.Graphics();
        gfx.moveTo(debris.collisionMap[0][0], debris.collisionMap[0][1]);
        debris.collisionMap.slice(1).forEach(point => {
            gfx.lineTo(point[0], point[1]);
        });
        gfx.fill(parseInt(debris.color.replace('#', '0x')));

        parent.addChild(gfx);
    }

    public render() {}
}
