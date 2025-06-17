import * as PIXI from 'pixi.js';
import { EventEmitter } from 'events';

PIXI.extensions.add(PIXI.TickerPlugin);
PIXI.extensions.add(PIXI.ResizePlugin);

import { KeyboardInput } from './keyboard_input.js';
import { Client, ClientOptions, ClientEvents } from './client.js';
import { Camera } from './camera.js';
import { AssetManager } from './assets.js';
import { GameRenderer } from './game_renderer.js';
import { HudRenderer } from './hud_renderer.js';
import { FpsRenderer } from './hud_renderers/fps_renderer.js';
import { ToastRenderer, ToastTime } from './toast_renderer.js';
import { AudioRenderer } from './audio_renderers/audio_renderer.js';
import { Input, Inputable } from './input.js';
import { GamepadInput } from './gamepad_input.js';
import { MobileInputRenderer } from './mobile_input_renderer.js';
import { MobileInput } from './mobile_input.js';
import { WarningRenderer } from './warning_renderer.js';

const assman = AssetManager.getInstance();

export class Engine extends EventEmitter {
    private app: PIXI.Application;
    private input: Inputable;
    private client: Client;
    private camera: Camera;

    private gameRenderer: GameRenderer;
    private hudRenderer: HudRenderer;
    private toastRenderer: ToastRenderer;
    private warningRenderer: WarningRenderer;
    private fpsRenderer: FpsRenderer;
    private audioRenderer: AudioRenderer;
    private mobileInputRenderer: MobileInputRenderer;

    public constructor(private game: HTMLCanvasElement) {
        super();

        const resolution = 0.75;
        const viewport = document.createElement('div');
        viewport.style.position = 'absolute';
        viewport.style.width = '75%';
        viewport.style.height = '75%';
        viewport.style.zIndex = '-1';
        document.body.appendChild(viewport);

        this.app = new PIXI.Application();
        this.app.init({
            backgroundColor: 0x000000,
            resolution: 1,
            autoDensity: true,
            canvas: game,
            resizeTo: viewport,
            autoStart: true,
            antialias: true,
            powerPreference: 'high-performance',
        });

        const onResizeHandler = () => {
            game.width = viewport.clientWidth;
            game.height = viewport.clientHeight;
        };
        window.addEventListener('resize', onResizeHandler);
        onResizeHandler();

        this.app.ticker = new PIXI.Ticker();
        this.app.ticker.autoStart = true;

        const container = new PIXI.Container();
        container.interactiveChildren = true;
        (<any>container).canvas = game;
        this.app.stage.interactiveChildren = true;
        this.app.stage.addChild(container);

        this.mobileInputRenderer = new MobileInputRenderer(container);

        this.input = new Input(
            new KeyboardInput(window),
            new GamepadInput(window),
            new MobileInput(this.mobileInputRenderer),
        );
        this.client = new Client(this.input);
        this.camera = new Camera();
        this.gameRenderer = new GameRenderer(container, this.camera, this.client.getStage());
        this.hudRenderer = new HudRenderer(container, this.camera, this.client.getStage());
        this.fpsRenderer = new FpsRenderer(container);
        this.toastRenderer = new ToastRenderer(container, { resolution });
        this.warningRenderer = new WarningRenderer(container, this.client.getStage(), resolution);

        this.audioRenderer = new AudioRenderer(this.camera, this.client.getStage());

        this.app.ticker.maxFPS = 0;
        this.app.ticker.add(() => {
            if (!this.running) return;

            const info = this.client.fetchInfo();

            this.gameRenderer.render();

            this.hudRenderer.update(info);
            this.hudRenderer.render();

            this.fpsRenderer.update(info.updates);
            this.fpsRenderer.render();

            this.toastRenderer.render();

            this.audioRenderer.render();

            this.mobileInputRenderer.update(info);
            this.mobileInputRenderer.render();

            this.warningRenderer.update(info);
            this.warningRenderer.render();
        });

        this.listenClient(this.client);
        this.gameRenderer.on('entity_fail', (id: number) => this.client.syncEntity(id));
        assman.preload();

        window.onresize = () => {
            this.camera.setResolution(this.game.width, this.game.height);
        };
    }
    public get running(): boolean {
        return this.client.connected;
    }

    public start(options: ClientOptions, callback?: Function) {
        setTimeout(() => {
            if (this.client.connected) return;

            callback && callback({ error: 'Connection Timeout' });
            this.stop();
        }, 10000);

        const once = (data: any) => {
            this.input.enable();
            this.showCanvas();

            // start renderers
            this.app.ticker.start();

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
        this.app.ticker.stop();
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
        this.game.parentElement!.style.display = 'none';
    }
    private showCanvas() {
        this.game.parentElement!.style.display = 'block';
    }
}
