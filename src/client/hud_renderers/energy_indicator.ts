import * as PIXI from 'pixi.js';
import { Renderable } from "../game_renderers/renderable.js";
import { ClientInfo } from "../client.js";
import { IS_MOBILE } from "../environment.js";

const props = {
    h: 8,
    v: 230,
    d: false,
};

if (IS_MOBILE) {
    props.h = 230;
    props.v = 8;
}

const inner = {
    h: props.h - 4,
    v: props.v - 4,
};

props.d = props.h > props.v;

export class EnergyIndicator implements Renderable {
    private bar: PIXI.Graphics;
    private container: PIXI.Container;
    private info: ClientInfo | null = null;

    public constructor(private parent: any) {
        const container = new PIXI.Container();

        const frame = new PIXI.Graphics();
        frame
            .rect(0, 0, props.h, props.v)
            .stroke({ color: 0x202020, width: 1 });

        const bar = new PIXI.Graphics();
        bar.rect(2, 2, inner.h, inner.v)
            .fill(0x3399ff);

        container.addChild(frame);
        container.addChild(bar);

        parent.addChild(container);

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

        const sizes = {
            h: inner.h * (props.d ? perc : 1),
            v: inner.v * (props.d ? 1 : perc),
        };

        this.bar.clear();
        this.bar.rect(2, props.d ? 2 : inner.v - sizes.v, sizes.h, sizes.v)
            .fill(color);

        if (IS_MOBILE) {
            this.container.position.set(this.parent.canvas.width / 2 - props.h / 2, 20);
            return;
        }

        this.container.position.set(20, this.parent.canvas.height - 250);
    }
}
