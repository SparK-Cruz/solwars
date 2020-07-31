const PIXI = require('pixi.js');
import { EventEmitter } from 'events';

import { Input } from './input';
import { Client, ClientOptions, ClientEvents } from './client';
import { Camera } from './camera';
import { Assets } from './assets';
import { GameRenderer } from './game_renderer';
import { HudRenderer } from './hud_renderer';
import { FpsRenderer } from './hud_renderers/fps_renderer';
import { ToastRenderer, ToastTime } from './toast_renderer';
import { AudioRenderer } from './audio_renderers/audio_renderer';

export class Engine extends EventEmitter {
    private app: any;
    private input: Input;
    private client: Client;
    private camera: Camera;

    private gameRenderer: GameRenderer;
    private hudRenderer: HudRenderer;
    private toastRenderer: ToastRenderer;
    private fpsRenderer: FpsRenderer;
    private audioRenderer: AudioRenderer;

    public constructor(private game: HTMLCanvasElement) {
        super();

        this.app = new PIXI.Application({
            backgroundColor: 0x000000,
            resolution: 1,
            resizeTo: window,
            view: game,
        });
        const container = new PIXI.Container();
        container.view = this.app.view;
        this.app.stage.addChild(container);

        this.input = new Input(window);
        this.client = new Client(this.input);
        this.camera = new Camera();
        this.gameRenderer = new GameRenderer(container, this.camera, this.client.getStage());
        this.hudRenderer = new HudRenderer(container, this.camera, this.client.getStage());
        this.fpsRenderer = new FpsRenderer(container);
        this.toastRenderer = new ToastRenderer(container);

        this.audioRenderer = new AudioRenderer(this.camera, this.client.getStage());

        this.app.ticker.maxFPS = 0;
        this.app.ticker.add(() => {
            if (!this.running) return;

            this.gameRenderer.render();

            this.hudRenderer.update(this.client.fetchInfo());
            this.hudRenderer.render();

            this.fpsRenderer.update(this.client.fetchInfo().updates);
            this.fpsRenderer.render();

            this.toastRenderer.render();

            this.audioRenderer.render();
        });

        this.listenClient(this.client);
        this.preloadAssets();
        this.preloadAudio();

        window.onresize = () => {
            this.camera.setResolution(this.game.width, this.game.height);
        };
    }
    public get running(): boolean {
        return this.client.connected;
    }

    public start(options: ClientOptions, callback: Function = null) {
        const timeout = setTimeout(() => {
            callback && callback({error: 'Connection Timeout'});
            this.stop();
        }, 10000);

        const once = (data: any) => {
            clearTimeout(timeout);
            this.input.enable();
            this.showCanvas();

            // start renderers
            this.app.start();

            callback && callback(data);
        };

        this.client.once(ClientEvents.SHIP, once);
        this.client.connect(options);
        this.camera.setResolution(this.game.width, this.game.height);

        this.emit('start');
    }
    public stop() {
        this.input.disable();
        this.client.disconnect();
        this.hideCanvas();

        this.client.getStage().clear();

        // stop renderers
        this.app.stop();
        this.emit('stop');
    }

    private listenClient(client: Client) {
        client.on(ClientEvents.SHIP, (ship: any) => {
            this.camera.trackable = ship;
        });
        client.on(ClientEvents.UPGRADE, (name: string) => {
            this.toastRenderer.toast(name, ToastTime.SHORT);
        });
    }

    private hideCanvas() {
        this.game.style.display = 'none';
    }
    private showCanvas() {
        this.game.style.display = 'block';
    }

    private preloadAssets() {
        const loader = PIXI.Loader.shared;

        loader
            .add('light', 'img/light.png')
            .add('rock', 'img/rock.png')
            .add('ship_warbird', 'img/ships/warbird.png')
            .add('ship_warbird_mask', 'img/ships/warbird_mask.png')
            .add('ship_warbird_decal0', 'img/ships/warbird_decal0.png')
            .add('ship_warbird_decal1', 'img/ships/warbird_decal1.png')
            .add('ship_javelin', 'img/ships/javelin.png')
            .add('ship_javelin_mask', 'img/ships/javelin_mask.png')
            .add('ship_javelin_decal0', 'img/ships/javelin_decal0.png')
            .add('ship_javelin_decal1', 'img/ships/javelin_decal1.png')
            .add('ship_spider', 'img/ships/spider.png')
            .add('ship_spider_mask', 'img/ships/spider_mask.png')
            .add('ship_spider_decal0', 'img/ships/spider_decal0.png')
            .add('ship_spider_decal1', 'img/ships/spider_decal1.png')
            .add('ship_leviathan', 'img/ships/leviathan.png')
            .add('ship_leviathan_mask', 'img/ships/leviathan_mask.png')
            .add('ship_leviathan_decal0', 'img/ships/leviathan_decal0.png')
            .add('ship_leviathan_decal1', 'img/ships/leviathan_decal1.png');

        loader.load((_loader: any, resources: any) => {
            Assets.pool['light'] = new PIXI.Sprite(resources.light.texture);
            Assets.pool['rock'] = new PIXI.Sprite(resources.rock.texture);
            Assets.pool['ship_warbird'] = new PIXI.Sprite(resources.ship_warbird.texture);
            Assets.pool['ship_warbird_mask'] = new PIXI.Sprite(resources.ship_warbird_mask.texture);
            Assets.pool['ship_warbird_decal0'] = new PIXI.Sprite(resources.ship_warbird_decal0.texture);
            Assets.pool['ship_warbird_decal1'] = new PIXI.Sprite(resources.ship_warbird_decal1.texture);
            Assets.pool['ship_javelin'] = new PIXI.Sprite(resources.ship_javelin.texture);
            Assets.pool['ship_javelin_mask'] = new PIXI.Sprite(resources.ship_javelin_mask.texture);
            Assets.pool['ship_javelin_decal0'] = new PIXI.Sprite(resources.ship_javelin_decal0.texture);
            Assets.pool['ship_javelin_decal1'] = new PIXI.Sprite(resources.ship_javelin_decal1.texture);
            Assets.pool['ship_spider'] = new PIXI.Sprite(resources.ship_spider.texture);
            Assets.pool['ship_spider_mask'] = new PIXI.Sprite(resources.ship_spider_mask.texture);
            Assets.pool['ship_spider_decal0'] = new PIXI.Sprite(resources.ship_spider_decal0.texture);
            Assets.pool['ship_spider_decal1'] = new PIXI.Sprite(resources.ship_spider_decal1.texture);
            Assets.pool['ship_leviathan'] = new PIXI.Sprite(resources.ship_leviathan.texture);
            Assets.pool['ship_leviathan_mask'] = new PIXI.Sprite(resources.ship_leviathan_mask.texture);
            Assets.pool['ship_leviathan_decal0'] = new PIXI.Sprite(resources.ship_leviathan_decal0.texture);
            Assets.pool['ship_leviathan_decal1'] = new PIXI.Sprite(resources.ship_leviathan_decal1.texture);

            this.emit('load');
        });
    }

    private preloadAudio() {
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
    }
}
