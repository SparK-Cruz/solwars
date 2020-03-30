import { EventEmitter } from 'events';
import { Client, ClientEvents, ClientInfo, ClientOptions } from "./client";
import { Input } from "./input";
import { Camera } from "./camera";
import { GameRenderer } from "./game_renderer";
import { HudRenderer } from "./hud_renderer";
import { ToastRenderer, ToastTime } from './toast_renderer';
import { Assets } from './assets';

const FRAMESKIP_THRESHOLD: number = 55;
let lastTick: number = null;

export class Engine extends EventEmitter {
    private input: Input;
    private client: Client;
    private camera: Camera;
    private gameRenderer: GameRenderer;
    private hudRenderer: HudRenderer;
    private toastRenderer: ToastRenderer;

    public constructor(private game: HTMLCanvasElement, private hud: HTMLCanvasElement) {
        super();

        this.input = new Input(window);
        this.client = new Client(this.input);
        this.camera = new Camera();
        this.gameRenderer = new GameRenderer(game, this.camera, this.client.getStage());
        this.hudRenderer = new HudRenderer(hud, this.camera, this.client.getStage());
        this.toastRenderer = new ToastRenderer(hud);

        this.listenClient(this.client);
        this.preloadAssets();
    }

    public get running() {
        return this.client.connected;
    }

    public start(options: ClientOptions, callback: Function = null) {
        const timeout = setTimeout(() => {
            callback && callback({error: 'Connection Timeout'});
            this.stop();
        }, 10000);

        const once = (data: any) => {
            clearTimeout(timeout);

            window.onresize = () => this.adjustCanvas();
            this.input.enable();

            lastTick = Date.now();
            this.adjustCanvas();
            this.renderFrame();

            callback && callback(data);
        };

        this.client.once(ClientEvents.SHIP, once);
        this.client.connect(options);

        this.emit('start');
    }

    public stop() {
        window.onresize = () => true;
        this.input.disable();
        this.client.disconnect();
        this.hideCanvas();

        this.client.getStage().clear();
    }

    private listenClient(client: Client) {
        client.on(ClientEvents.SHIP, (ship: any) => {
            this.camera.trackable = ship;
        });
        client.on(ClientEvents.UPGRADE, (name: string) => {
            this.toastRenderer.toast(name, ToastTime.SHORT);
        });
    }

    private renderFrame() {
        const fps = Math.round(1000 / (Date.now() - lastTick));
        lastTick = Date.now();

        if (fps > FRAMESKIP_THRESHOLD) {
            this.camera.setResolution(this.game.width, this.game.height);
            this.gameRenderer.render();
            this.hudRenderer.update(this.client.fetchInfo());
            this.hudRenderer.render();
            this.toastRenderer.render();
        }

        if (!this.running) {
            this.stop();
            this.emit('stop');
            return;
        }

        requestAnimationFrame(() => this.renderFrame());
    }

    private adjustCanvas() {
        this.adjustToWindow(this.game);
        this.adjustToWindow(this.hud);
    }
    private hideCanvas() {
        this.game.style.display = 'none';
        this.hud.style.display = 'none';
    }

    private adjustToWindow(canvas: HTMLCanvasElement) {
        canvas.style.display = 'block';
        canvas.style.width = window.innerWidth + 'px';
        canvas.style.height = window.innerHeight + 'px';

        const aspect = window.innerWidth / window.innerHeight;
        canvas.width = aspect * canvas.height;
    }

    private preloadAssets() {
        setTimeout(() => {
            Assets.fetchAll([
                'img/light.png',
                'img/rock.png',
                'img/ships/warbird.png',
                'img/ships/warbird_mask.png',
                'img/ships/warbird_decal0.png',
                'img/ships/warbird_decal1.png',
                'img/ships/javelin.png',
                'img/ships/javelin_mask.png',
                'img/ships/javelin_decal0.png',
                'img/ships/javelin_decal1.png',
                'img/ships/spider.png',
                'img/ships/spider_mask.png',
                'img/ships/spider_decal0.png',
                'img/ships/spider_decal1.png',
            ], () => {
                this.emit('load');
            });
        }, 0);
    }
}
