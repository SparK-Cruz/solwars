import * as PIXI from 'pixi.js';
import { GravityWell } from "../../../space/entities/gravity_well.js";
import { Renderable } from "../renderable.js";

export class GravityWellRenderer implements Renderable {
    public constructor(parent: any, private gravityWell: GravityWell) {
        const main = new PIXI.Graphics();

        main.circle(0, 0, 100)
            .fill(0x000000);
        main.circle(0, 0, 200)
            .fill({
                color: 0x000000,
                alpha: 0.5
            });

        parent.addChild(main);
    }

    render() {
    }
}
