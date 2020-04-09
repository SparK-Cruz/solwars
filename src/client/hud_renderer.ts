const PIXI = require('pixi.js');
import { Renderable } from "./game_renderers/renderable";
import { ClientInfo } from "./client";
import { Camera } from "./camera";
import { Stage } from "./stage";
import { SpeedIndicator } from "./hud_renderers/speed_indicator";
import { EnergyIndicator } from "./hud_renderers/energy_indicator";
import { GunIndicator } from "./hud_renderers/gun_indicator";
import { Radar } from "./hud_renderers/radar";
import { NameRenderer } from "./hud_renderers/name_renderer";
import { RankingRenderer } from "./hud_renderers/ranking_renderer";

export class HudRenderer implements Renderable {
    private energyIndicator: EnergyIndicator;
    private speedIndicator: SpeedIndicator;
    private gunIndicator: GunIndicator;
    private radar: Radar;
    private nameRenderer: NameRenderer;
    private rankingRenderer: RankingRenderer;

    private alive = true;
    private debug = new PIXI.Graphics();

    public constructor(private app: any, private camera: Camera, private stage: Stage) {
        this.energyIndicator = new EnergyIndicator(app);
        this.speedIndicator = new SpeedIndicator(app, camera);
        this.gunIndicator = new GunIndicator(app, camera);
        this.radar = new Radar(app, camera, stage);
        this.nameRenderer = new NameRenderer(app, camera, stage);
        // this.rankingRenderer = new RankingRenderer(canvas);

        this.debug.lineStyle(1, 0xffffff);
        this.debug.drawRect(0, 0, 32, 32);
        app.stage.addChild(this.debug);
    }

    public update(info: ClientInfo) {
        this.energyIndicator.update(info);
        this.speedIndicator.update(info);
        this.gunIndicator.update(info);
        this.radar.update(info);
        this.nameRenderer.update(info);
        // this.rankingRenderer.update(info.ranking);

        this.alive = info.alive;
    }

    public render() {
        if (!this.alive)
            return;

        const shipPos = this.camera.addOffset({
            x: -16,
            y: -16,
        });
        this.debug.position.set(shipPos.x, shipPos.y);

        this.energyIndicator.render();
        this.speedIndicator.render();
        this.gunIndicator.render();
        this.radar.render();
        this.nameRenderer.render();
        // this.rankingRenderer.render();
    }
}
