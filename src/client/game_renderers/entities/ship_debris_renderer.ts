const PIXI = require('pixi.js');
import { ShipDebris } from '../../../space/entities/ship_debris';
import { Renderable } from '../renderable';

export class ShipDebrisRenderer implements Renderable {
    constructor(parent: any, public debris: ShipDebris) {
        const gfx = new PIXI.Graphics();
        gfx.beginFill(parseInt(debris.color.replace('#', '0x')));
        gfx.moveTo(debris.collisionMap[0][0], debris.collisionMap[0][1]);
        debris.collisionMap.slice(1).forEach(point => {
            gfx.lineTo(point[0], point[1]);
        });
        gfx.endFill();

        parent.addChild(gfx);
    }

    public render() {}
}
