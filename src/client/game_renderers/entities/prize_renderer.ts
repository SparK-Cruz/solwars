const PIXI = require('pixi.js');
import { Renderable } from "../renderable";
import { Prize } from '../../../space/entities/prize';

const PRIZE_SIZE = 16;

export class PrizeRenderer implements Renderable {
    private text: any;

    public constructor(parent: any, private prize: Prize) {
        const body = new PIXI.Graphics();
        body.beginFill(0x007700);
        body.drawRect(-PRIZE_SIZE/2, -PRIZE_SIZE/2, PRIZE_SIZE, PRIZE_SIZE);
        body.endFill();

        const text = new PIXI.Text('?', {
            fontFamily: 'monospace',
            fontSize: 12,
            fontWeight: 'bold',
            align: 'center',
            fill: 0xffffff,
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
