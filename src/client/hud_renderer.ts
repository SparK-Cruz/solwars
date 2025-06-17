import * as PIXI from 'pixi.js';
import { Renderable } from "./game_renderers/renderable.js";
import { ClientInfo } from "./client.js";
import { Camera } from "./camera.js";
import { Stage } from "./stage.js";
import { SpeedIndicator } from "./hud_renderers/speed_indicator.js";
import { EnergyIndicator } from "./hud_renderers/energy_indicator.js";
import { GunIndicator } from "./hud_renderers/gun_indicator.js";
import { Radar } from "./hud_renderers/radar.js";
import { NameRenderer } from "./hud_renderers/name_renderer.js";
import { RankingRenderer } from "./hud_renderers/ranking_renderer.js";

export class HudRenderer implements Renderable {
    private container: any;

    private energyIndicator: EnergyIndicator;
    private speedIndicator: SpeedIndicator;
    private gunIndicator: GunIndicator;
    private radar: Radar;
    private nameRenderer: NameRenderer;
    private rankingRenderer: RankingRenderer;

    private alive = true;

    public constructor(parent: any, private camera: Camera, stage: Stage) {
        this.container = new PIXI.Container();
        this.container.interactiveChildren = false;
        this.container.position.set(0);
        (<any>this.container.canvas) = parent.canvas;
        parent.addChild(this.container);

        this.energyIndicator = new EnergyIndicator(this.container);
        this.speedIndicator = new SpeedIndicator(this.container, camera);
        this.gunIndicator = new GunIndicator(this.container, camera);
        this.radar = new Radar(this.container, camera, stage);
        this.nameRenderer = new NameRenderer(this.container, camera, stage);

        this.rankingRenderer = new RankingRenderer(parent);
    }

    public update(info: ClientInfo) {
        this.energyIndicator.update(info);
        this.speedIndicator.update(info);
        this.gunIndicator.update(info);
        this.radar.update(info);
        this.nameRenderer.update(info);
        this.rankingRenderer.update(info.ranking);

        this.alive = info.alive;
    }

    public render() {
        this.rankingRenderer.render();

        this.container.visible = this.alive;

        if (!this.alive) {
            return;
        }

        this.energyIndicator.render();
        this.speedIndicator.render();
        this.gunIndicator.render();
        this.radar.render();
        this.nameRenderer.render();
    }
}
