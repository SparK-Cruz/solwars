import * as PIXI from 'pixi.js';
import { EventEmitter } from 'events';

export class AssetManager extends EventEmitter {
    private static instance: AssetManager;
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

        Promise.all([
            this.preloadAudio(),
            this.preloadImages(),
        ]).then(() => {
            this.emit('load');
        });

        return true;
    }

    private async preloadImages() {
        const loader = PIXI.Assets;

        await Promise.all([
            Assets.pool['light'] = loader.load('img/light.png'),
            Assets.pool['rock'] = loader.load('img/rock.png'),
            Assets.pool['prize'] = loader.load('img/prize.png'),
            Assets.pool['ship_warbird'] = loader.load('img/ships/warbird.png'),
            Assets.pool['ship_warbird_mask'] = loader.load('img/ships/warbird_mask.png'),
            Assets.pool['ship_warbird_decal0'] = loader.load('img/ships/warbird_decal0.png'),
            Assets.pool['ship_warbird_decal1'] = loader.load('img/ships/warbird_decal1.png'),
            Assets.pool['ship_warbird_decal2'] = loader.load('img/ships/warbird_decal2.png'),
            Assets.pool['ship_javelin'] = loader.load('img/ships/javelin.png'),
            Assets.pool['ship_javelin_mask'] = loader.load('img/ships/javelin_mask.png'),
            Assets.pool['ship_javelin_decal0'] = loader.load('img/ships/javelin_decal0.png'),
            Assets.pool['ship_javelin_decal1'] = loader.load('img/ships/javelin_decal1.png'),
            Assets.pool['ship_javelin_decal2'] = loader.load('img/ships/javelin_decal2.png'),
            Assets.pool['ship_spider'] = loader.load('img/ships/spider.png'),
            Assets.pool['ship_spider_mask'] = loader.load('img/ships/spider_mask.png'),
            Assets.pool['ship_spider_decal0'] = loader.load('img/ships/spider_decal0.png'),
            Assets.pool['ship_spider_decal1'] = loader.load('img/ships/spider_decal1.png'),
            Assets.pool['ship_spider_decal2'] = loader.load('img/ships/spider_decal2.png'),
            Assets.pool['ship_leviathan'] = loader.load('img/ships/leviathan.png'),
            Assets.pool['ship_leviathan_mask'] = loader.load('img/ships/leviathan_mask.png'),
            Assets.pool['ship_leviathan_decal0'] = loader.load('img/ships/leviathan_decal0.png'),
            Assets.pool['ship_leviathan_decal1'] = loader.load('img/ships/leviathan_decal1.png'),
            Assets.pool['ship_leviathan_decal2'] = loader.load('img/ships/leviathan_decal2.png'),
            Assets.pool['ship_terrier'] = loader.load('img/ships/terrier.png'),
            Assets.pool['ship_terrier_mask'] = loader.load('img/ships/terrier_mask.png'),
            Assets.pool['ship_terrier_decal0'] = loader.load('img/ships/terrier_decal0.png'),
            Assets.pool['ship_terrier_decal1'] = loader.load('img/ships/terrier_decal1.png'),
            Assets.pool['ship_terrier_decal2'] = loader.load('img/ships/terrier_decal2.png'),
            Assets.pool['ship_football'] = loader.load('img/ships/football.png'),
            Assets.pool['ship_football_mask'] = loader.load('img/ships/football_mask.png'),
            Assets.pool['ship_football_decal0'] = loader.load('img/ships/football_decal0.png'),
            Assets.pool['ship_football_decal1'] = loader.load('img/ships/football_decal1.png'),
        ]);

        await Promise.all(Object.keys(Assets.pool).map(async key => {
            Assets.pool[key] = await Assets.pool[key];
        }));
    }

    private preloadAudio() {
        return Promise.all([
            'sfx/bullet_0.mp3',
            'sfx/bullet_1.mp3',
            'sfx/bullet_2.mp3',
            'sfx/bullet_3.mp3',
            'sfx/bullet_impact.mp3',
            'sfx/ship_death.mp3',
            'sfx/pick_item.mp3',
        ].map((file) => {
            return new Promise((resolve, reject) => {
                const audio = new Audio();
                audio.src = file;
                audio.load();
                resolve(file);
            });
        }));
    }
}

export class Assets {
    public static pool: any = {};
}
