const PIXI = require('pixi.js');
import { Ship } from '../../../space/entities/ship';
import { Renderable } from '../renderable';
import { Assets } from '../../assets';

export class ShipRenderer implements Renderable {
    private container: any;
    private mask: any = null;
    private body: any = new PIXI.Container();

    constructor(parent: any, public ship :Ship) {
        this.container = new PIXI.Container();

        const bodySprite = new PIXI.Sprite(Assets.pool['ship_'+this.ship.model].texture);
        this.mask = new PIXI.Sprite(Assets.pool['ship_'+this.ship.model+'_mask'].texture);

        const sprites = [bodySprite];

        const colors = [
            parseInt(this.ship.color.replace('#', '0x'))
        ];

        for (let i = 0; i < this.ship.decals.length; i++) {
            sprites.push(new PIXI.Sprite(Assets.pool['ship_'+this.ship.model+'_'+this.ship.decals[i].name].texture));
            colors.push(parseInt(this.ship.decals[i].color.replace('#', '0x')));
        }

        this.draw(sprites, colors);
        this.container.addChild(this.body);
        this.container.addChild(this.mask);
        this.container.position.set(
            -bodySprite.width / 2,
            -bodySprite.height / 2,
        );

        parent.addChild(this.container);
    }

    public render() :any {
        // global light
    }

    private draw(sprites :any[], colors :number[]) {
        const main = sprites.shift();

        this.body.addChild(main);
        this.paint(main, colors.shift(), this.mask);

        while (sprites.length > 0) {
            const decal = sprites.shift();
            const color = colors.shift();
            this.paint(main, color, decal);
            this.body.addChild(decal);
        }
    }

    private paint(sprite: any, color: number, mask: any) {
        const paint = new PIXI.Sprite(sprite.texture);
        paint.tint = color;
        paint.mask = mask;

        this.body.addChild(paint);
    }
}
