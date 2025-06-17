import * as PIXI from 'pixi.js';
import { Renderable } from "./game_renderers/renderable.js";
import { ClientInfo } from "./client.js";
import { Stage } from "./stage.js";
import { ToastRenderer, ToastTime } from './toast_renderer.js';

export class WarningRenderer implements Renderable {
    private container: any;
    private info: ClientInfo | null = null;

    private toastRenderer: ToastRenderer;

    private alive = true;

    public constructor(parent: any, private stage: Stage, resolution = 1) {
        this.container = new PIXI.Container();
        this.container.interactiveChildren = false;
        this.container.position.set(0);
        (<any>this.container.canvas) = parent.canvas;
        parent.addChild(this.container);

        this.toastRenderer = new ToastRenderer(this.container, { resolution, position: {y: parent.canvas.height * 0.3}, color: 0xff9933 });
    }

    public update(info: ClientInfo) {
        this.info = info;
        this.alive = info.alive;
    }

    public render() {
        if (!this.info) return;

        this.container.visible = this.alive;

        if (this.alive) {
            if (this.stage.radius) {
                this.renderOutOfRadiusWarning();
            }
            this.renderLowEnergyWarning();
        }

        this.toastRenderer.render();
    }

    private renderOutOfRadiusWarning() {
        const distance = Math.sqrt(Math.pow(this.info!.position.x, 2) + Math.pow(this.info!.position.y, 2));

        if (distance > this.stage.radius) {
            this.toastRenderer.toast("WARNING: RADIATION!", ToastTime.IMMEDIATE);
        }
    }

    private renderLowEnergyWarning() {
        if (this.info!.maxEnergy * 0.1 > this.info!.energy) {
            this.toastRenderer.toast("WARNING: LOW ENERGY!", ToastTime.IMMEDIATE);
        }
    }
}
