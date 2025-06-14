import * as PIXI from 'pixi.js';
import { Renderable } from "../renderable.js";
import { Prize } from '../../../space/entities/prize.js';
import { Assets } from "../../assets.js";

const PRIZE_SIZE = 16;

export class PrizeRenderer implements Renderable {
    private text: any;

    public constructor(parent: any, private prize: Prize) {
        const body = new PIXI.Sprite(Assets.pool['prize']);
        body.position.set(
            -body.width / 2,
            -body.height / 2,
        );
        const text = new PIXI.Text({
            text: '?',
            style: {
            fontFamily: 'monospace',
            fontSize: 12,
            fontWeight: 'bold',
            align: 'center',
            fill: 0xffffff,
            }
        });
        text.anchor.set(0.5);

        parent.addChild(body);
        parent.addChild(text);

        this.text = text;
    }

    public render() {
        this.text.angle = -this.prize.angle;
    }
}
