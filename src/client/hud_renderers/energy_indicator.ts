const PIXI = require('pixi.js');
import { Renderable } from "../game_renderers/renderable";
import { ClientInfo } from "../client";

export class EnergyIndicator implements Renderable {
    private bar: any;
    private container: any;
    private info: ClientInfo;

    public constructor(private app: any) {
        const container = new PIXI.Container();

        const frame = new PIXI.Graphics();
        frame.lineStyle(1, 0x202020, 1, 1);
        frame.drawRect(0, 0, 8, 230);

        const bar = new PIXI.Graphics();
        bar.beginFill(0x3399ff);
        bar.drawRect(2, 2, 4, 226);
        bar.endFill();

        container.addChild(frame);
        container.addChild(bar);

        app.stage.addChild(container);

        this.bar = bar;
        this.container = container;
    }

    public update(info: ClientInfo) {
        this.info = info;
    }

    public render() {
        if (!this.info)
            return;

        const perc = Math.max(this.info.energy / this.info.maxEnergy, 0);
        let color = 0x3399ff;
        if (perc < 0.4) {
            color = 0xff9933;
        }

        this.bar.clear();
        this.bar.beginFill(color);
        this.bar.drawRect(2, 228 - 226 * perc, 4, 226 * perc);
        this.bar.endFill();

        this.container.position.set(20, this.app.view.height - 250);
    }
}
