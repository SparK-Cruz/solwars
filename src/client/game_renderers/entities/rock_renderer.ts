import * as PIXI from 'pixi.js';
import { Rock } from "../../../space/entities/rock.js";
import { Renderable } from "../renderable.js";
import { Assets } from "../../assets.js";

export class RockRenderer implements Renderable {
    constructor(parent: any, public rock: Rock) {
        if (!this.rock.collisionMap) {
            return;
        }

        const gfx = new PIXI.Sprite(Assets.pool['rock']);
        const mask = new PIXI.Graphics();

        const geometry = this.rock.collisionMap.slice(0);
        const start = geometry.shift();
        mask.moveTo(start[0], start[1]);
        geometry.forEach(point => {
            mask.lineTo(point[0], point[1]);
        });
        mask.fill(parseInt(this.rock.color.replace('#', '0x')));

        const bound = {
            x: gfx.width - this.rock.size,
            y: gfx.height - this.rock.size,
        };

        gfx.mask = mask;
        gfx.anchor.set(0.5);
        gfx.position.set(
            Math.random() * bound.x - bound.x / 2,
            Math.random() * bound.y - bound.y / 2
        );

        parent.addChild(gfx);
        parent.addChild(mask);
    }

    public render() {}
}
