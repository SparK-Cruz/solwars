import { Client, ClientEvents, ClientInfo } from "./client";
import { Input } from "./input";
import { Camera } from "./camera";
import { GameRenderer } from "./game_renderer";
import { HudRenderer } from "./hud_renderer";

const FRAMESKIP_THRESHOLD: number = 55;
let lastTick: number = null;

export class Engine {
    private input: Input;
    private client: Client;
    private camera: Camera;
    private gameRenderer: GameRenderer;
    private hudRenderer: HudRenderer;

    public constructor(private game: HTMLCanvasElement, private hud: HTMLCanvasElement) {
        this.input = new Input(window);
        this.client = new Client(this.input);
        this.camera = new Camera();
        this.gameRenderer = new GameRenderer(game, this.camera, this.client.getStage());
        this.hudRenderer = new HudRenderer(hud, this.camera, this.client.getStage());

        this.listenClient(this.client);
    }

    public get running() {
        return this.client.connected;
    }

    public start(name: string, callback: Function = null) {
        const timeout = setTimeout(() => {
            callback && callback({error: 'Connection Timeout'});
        }, 2000);

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
        this.client.connect(name);
    }

    public stop() {
        window.onresize = () => true;
        this.input.disable();
        this.client.disconnect();
        this.hideCanvas();
    }

    private listenClient(client: Client) {
        client.on(ClientEvents.SHIP, (ship: any) => {
            this.camera.trackable = ship;
        });

        client.on(ClientEvents.INFO, (info: ClientInfo) => {
            this.hudRenderer.update(info);
        });
    }

    private renderFrame() {
        const fps = Math.round(1000 / (Date.now() - lastTick));
        lastTick = Date.now();

        if (fps > FRAMESKIP_THRESHOLD) {
            this.camera.setResolution(this.game.width, this.game.height);
            this.gameRenderer.render();
            this.hudRenderer.render();
        }

        if (!this.running)
            return;

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
}
