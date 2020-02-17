import { Renderable } from "./game_renderers/renderable";
import { ClientInfo } from "./client";
import { Camera } from "./camera";
import { Stage } from "../space/stage";
import { SpeedIndicator } from "./hud_renderers/speed_indicator";
import { EnergyIndicator } from "./hud_renderers/energy_indicator";
import { GunIndicator } from "./hud_renderers/gun_indicator";
import { Radar } from "./hud_renderers/radar";
import { NameRenderer } from "./hud_renderers/name_renderer";

export class HudRenderer implements Renderable {
    private ctx: CanvasRenderingContext2D = null;

    private energyIndicator: EnergyIndicator;
    private speedIndicator: SpeedIndicator;
    private gunIndicator: GunIndicator;
    private radar: Radar;
    private nameRenderer: NameRenderer;

    private alive = true;

    public constructor(private canvas: HTMLCanvasElement, private camera: Camera, private stage: Stage) {
        this.ctx = canvas.getContext('2d');

        this.energyIndicator = new EnergyIndicator(canvas);
        this.speedIndicator = new SpeedIndicator(canvas, camera);
        this.gunIndicator = new GunIndicator(canvas, camera);
        this.radar = new Radar(canvas, camera, stage);
        this.nameRenderer = new NameRenderer(canvas, camera, stage);
    }

    public update(info: ClientInfo) {
        this.energyIndicator.update(info);
        this.speedIndicator.update(info);
        this.gunIndicator.update(info);
        this.radar.update(info);
        this.nameRenderer.update(info);

        this.alive = info.alive;
    }

    public render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (!this.alive) return;

        this.energyIndicator.render();
        this.speedIndicator.render();
        this.gunIndicator.render();
        this.radar.render();
        this.nameRenderer.render();

        return this.canvas;
    }
}