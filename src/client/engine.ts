const PIXI = require('pixi.js');
import { EventEmitter } from 'events';

import { KeyboardInput } from './keyboard_input';
import { Client, ClientOptions, ClientEvents } from './client';
import { Camera } from './camera';
import { AssetManager } from './assets';
import { GameRenderer } from './game_renderer';
import { HudRenderer } from './hud_renderer';
import { FpsRenderer } from './hud_renderers/fps_renderer';
import { ToastRenderer, ToastTime } from './toast_renderer';
import { AudioRenderer } from './audio_renderers/audio_renderer';
import { Input, Inputable } from './input';
import { GamepadInput } from './gamepad_input';

const assman = AssetManager.getInstance();
const adjustViewportSize = function () {
    const ratio = 4 / 5;
    this.width = window.innerWidth * ratio;
    this.height = window.innerHeight * ratio;
};

export class Engine extends EventEmitter {
    private app: any;
    private input: Inputable;
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
            view: game,
        });
        const resizePixi = () => {
            adjustViewportSize.call(game);
            this.app.renderer.resize(game.width, game.height);
        };
        window.addEventListener('resize', resizePixi);
        resizePixi();

        const container = new PIXI.Container();
        container.view = this.app.view;
        this.app.stage.addChild(container);

        this.input = new Input(
            new KeyboardInput(window),
            new GamepadInput(window),
        );
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
        assman.preload();

        window.onresize = () => {
            this.camera.setResolution(this.game.width, this.game.height);
        };
    }
    public get running(): boolean {
        return this.client.connected;
    }

    public start(options: ClientOptions, callback: Function = null) {
        const timeout = setTimeout(() => {
            callback && callback({ error: 'Connection Timeout' });
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
}
