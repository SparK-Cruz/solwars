const PIXI = require('pixi.js');
import { EventEmitter } from 'events';

export class AssetManager extends EventEmitter {
    private static instance: AssetManager = null;
    public static getInstance() {
        if (this.instance)
            return this.instance;

        return this.instance = new AssetManager();
    }
    private loaded = false;

    public preload() {
        if (this.loaded) {
            return false;
        }

        this.loaded = true;

        this.preloadAudio(() => {
            this.preloadImages(() => {
                this.emit('load');
            });
        });

        return true;
    }

    private preloadImages(callback: Function) {
        const loader = PIXI.Loader.shared;

        loader
            .add('light', 'img/light.png')
            .add('rock', 'img/rock.png')
            .add('prize', 'img/prize.png')
            .add('ship_warbird', 'img/ships/warbird.png')
            .add('ship_warbird_mask', 'img/ships/warbird_mask.png')
            .add('ship_warbird_decal0', 'img/ships/warbird_decal0.png')
            .add('ship_warbird_decal1', 'img/ships/warbird_decal1.png')
            .add('ship_warbird_decal2', 'img/ships/warbird_decal2.png')
            .add('ship_javelin', 'img/ships/javelin.png')
            .add('ship_javelin_mask', 'img/ships/javelin_mask.png')
            .add('ship_javelin_decal0', 'img/ships/javelin_decal0.png')
            .add('ship_javelin_decal1', 'img/ships/javelin_decal1.png')
            .add('ship_javelin_decal2', 'img/ships/javelin_decal2.png')
            .add('ship_spider', 'img/ships/spider.png')
            .add('ship_spider_mask', 'img/ships/spider_mask.png')
            .add('ship_spider_decal0', 'img/ships/spider_decal0.png')
            .add('ship_spider_decal1', 'img/ships/spider_decal1.png')
            .add('ship_spider_decal2', 'img/ships/spider_decal2.png')
            .add('ship_leviathan', 'img/ships/leviathan.png')
            .add('ship_leviathan_mask', 'img/ships/leviathan_mask.png')
            .add('ship_leviathan_decal0', 'img/ships/leviathan_decal0.png')
            .add('ship_leviathan_decal1', 'img/ships/leviathan_decal1.png')
            .add('ship_leviathan_decal2', 'img/ships/leviathan_decal2.png')
            .add('ship_terrier', 'img/ships/terrier.png')
            .add('ship_terrier_mask', 'img/ships/terrier_mask.png')
            .add('ship_terrier_decal0', 'img/ships/terrier_decal0.png')
            .add('ship_terrier_decal1', 'img/ships/terrier_decal1.png')
            .add('ship_terrier_decal2', 'img/ships/terrier_decal2.png')
            .add('ship_football', 'img/ships/football.png')
            .add('ship_football_mask', 'img/ships/football_mask.png')
            .add('ship_football_decal0', 'img/ships/football_decal0.png')
            .add('ship_football_decal1', 'img/ships/football_decal1.png');

        loader.load((_loader: any, resources: any) => {
            Assets.pool['light'] = new PIXI.Sprite(resources.light.texture);
            Assets.pool['rock'] = new PIXI.Sprite(resources.rock.texture);
            Assets.pool['prize'] = new PIXI.Sprite(resources.prize.texture);
            Assets.pool['ship_warbird'] = new PIXI.Sprite(resources.ship_warbird.texture);
            Assets.pool['ship_warbird_mask'] = new PIXI.Sprite(resources.ship_warbird_mask.texture);
            Assets.pool['ship_warbird_decal0'] = new PIXI.Sprite(resources.ship_warbird_decal0.texture);
            Assets.pool['ship_warbird_decal1'] = new PIXI.Sprite(resources.ship_warbird_decal1.texture);
            Assets.pool['ship_warbird_decal2'] = new PIXI.Sprite(resources.ship_warbird_decal2.texture);
            Assets.pool['ship_javelin'] = new PIXI.Sprite(resources.ship_javelin.texture);
            Assets.pool['ship_javelin_mask'] = new PIXI.Sprite(resources.ship_javelin_mask.texture);
            Assets.pool['ship_javelin_decal0'] = new PIXI.Sprite(resources.ship_javelin_decal0.texture);
            Assets.pool['ship_javelin_decal1'] = new PIXI.Sprite(resources.ship_javelin_decal1.texture);
            Assets.pool['ship_javelin_decal2'] = new PIXI.Sprite(resources.ship_javelin_decal2.texture);
            Assets.pool['ship_spider'] = new PIXI.Sprite(resources.ship_spider.texture);
            Assets.pool['ship_spider_mask'] = new PIXI.Sprite(resources.ship_spider_mask.texture);
            Assets.pool['ship_spider_decal0'] = new PIXI.Sprite(resources.ship_spider_decal0.texture);
            Assets.pool['ship_spider_decal1'] = new PIXI.Sprite(resources.ship_spider_decal1.texture);
            Assets.pool['ship_spider_decal2'] = new PIXI.Sprite(resources.ship_spider_decal2.texture);
            Assets.pool['ship_leviathan'] = new PIXI.Sprite(resources.ship_leviathan.texture);
            Assets.pool['ship_leviathan_mask'] = new PIXI.Sprite(resources.ship_leviathan_mask.texture);
            Assets.pool['ship_leviathan_decal0'] = new PIXI.Sprite(resources.ship_leviathan_decal0.texture);
            Assets.pool['ship_leviathan_decal1'] = new PIXI.Sprite(resources.ship_leviathan_decal1.texture);
            Assets.pool['ship_leviathan_decal2'] = new PIXI.Sprite(resources.ship_leviathan_decal2.texture);
            Assets.pool['ship_terrier'] = new PIXI.Sprite(resources.ship_terrier.texture);
            Assets.pool['ship_terrier_mask'] = new PIXI.Sprite(resources.ship_terrier_mask.texture);
            Assets.pool['ship_terrier_decal0'] = new PIXI.Sprite(resources.ship_terrier_decal0.texture);
            Assets.pool['ship_terrier_decal1'] = new PIXI.Sprite(resources.ship_terrier_decal1.texture);
            Assets.pool['ship_terrier_decal2'] = new PIXI.Sprite(resources.ship_terrier_decal2.texture);
            Assets.pool['ship_football'] = new PIXI.Sprite(resources.ship_football.texture);
            Assets.pool['ship_football_mask'] = new PIXI.Sprite(resources.ship_football_mask.texture);
            Assets.pool['ship_football_decal0'] = new PIXI.Sprite(resources.ship_football_decal0.texture);
            Assets.pool['ship_football_decal1'] = new PIXI.Sprite(resources.ship_football_decal1.texture);

            callback();
        });
    }

    private preloadAudio(callback: Function) {
        const audio = new Audio();
        [
            'sfx/bullet_0.mp3',
            'sfx/bullet_1.mp3',
            'sfx/bullet_2.mp3',
            'sfx/bullet_3.mp3',
            'sfx/bullet_impact.mp3',
            'sfx/ship_death.mp3',
            'sfx/pick_item.mp3',
        ].forEach((file) => {
            audio.src = file;
            audio.load();
        });

        callback();
    }
}

export class Assets {
    public static pool: any = {};

    public static fetch(url: string) {
        return { once: (evt: string, cb: any) => { } };
    }
    public static fetchAll(list: string[], cb: any) {
        return { once: (evt: string, cb: any) => { } };
    }
}
export class Asset {
    public content: HTMLImageElement;
}
