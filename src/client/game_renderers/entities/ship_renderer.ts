import * as PIXI from 'pixi.js';
import { Ship } from '../../../space/entities/ship.js';
import { Renderable } from '../renderable.js';
import { Assets } from '../../assets.js';

export class ShipRenderer implements Renderable {
    private container: PIXI.Container;
    private isDrawn: boolean = false;

    constructor(private parent: PIXI.Container, public ship: Ship) {
        this.container = new PIXI.Container();
        parent.addChild(this.container);
        this.loadAndDraw();
    }

    public render() :any {
        // TODO: global light

        if (!this.isDrawn) {
            this.loadAndDraw();
        }
    }

    private loadAndDraw() {
        const bodySprite = new PIXI.Sprite(Assets.pool['ship_'+this.ship.model]);

        const mask = new PIXI.Sprite(Assets.pool['ship_'+this.ship.model+'_mask']);

        const sprites = [mask];
        const colors = [parseInt(this.ship.color.replace('#', '0x'))];

        for (let i = 0; i < this.ship.decals.length; i++) {
            sprites.push(new PIXI.Sprite(Assets.pool['ship_'+this.ship.model+'_'+this.ship.decals[i].name]));
            colors.push(parseInt(this.ship.decals[i].color.replace('#', '0x')));
        }

        const drawing = this.draw(bodySprite, sprites, colors);

        this.container.addChild(drawing);
        this.container.position.set(
            -drawing.width / 2,
            -drawing.height / 2,
        );

        this.container.cacheAsTexture(false);
        this.isDrawn = true;
    }

    private draw(bodySprite: PIXI.Sprite, sprites :PIXI.Sprite[], colors :number[]): PIXI.Container {
        const body = new PIXI.Container();
        const main = new PIXI.Sprite(bodySprite);

        body.addChild(main);

        while (sprites.length > 0) {
            const layer = new PIXI.Container();
            const sprite = new PIXI.Sprite(bodySprite);
            const decal = sprites.shift()!;
            const color = colors.shift()!;

            sprite.tint = color;
            sprite.mask = decal;
            layer.addChild(sprite);
            layer.addChild(decal);
            body.addChild(layer);
        }

        const texture = PIXI.RenderTexture.create({ width: 32, height: 32 });
        ((<any>this.parent).app as PIXI.Application).renderer.render({
            container: body,
            target: texture
        });

        return new PIXI.Sprite(texture);
    }
}
