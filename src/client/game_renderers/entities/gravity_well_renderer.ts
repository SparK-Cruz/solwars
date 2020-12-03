const PIXI = require('pixi.js');
import { GravityWell } from "../../../space/entities/gravity_well";
import { Renderable } from "../renderable";

export class GravityWellRenderer implements Renderable {
    public constructor(parent: any, private gravityWell: GravityWell) {
        const main = new PIXI.Graphics();

        main.beginFill(0x000000, 1);
        main.drawCircle(0, 0, 100);
        main.endFill();
        main.beginFill(0x000000, 0.5);
        main.drawCircle(0, 0, 200);
        main.endFill();

        parent.addChild(main);
    }

    render() {
    }
}
