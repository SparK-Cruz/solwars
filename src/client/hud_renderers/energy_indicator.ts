const PIXI = require('pixi.js');
import { Renderable } from "../game_renderers/renderable";
import { ClientInfo } from "../client";
import { IS_MOBILE } from "../environment";

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
    private bar: any;
    private container: any;
    private info: ClientInfo;

    public constructor(private parent: any) {
        const container = new PIXI.Container();

        const frame = new PIXI.Graphics();
        frame.lineStyle(1, 0x202020, 1, 1);
        frame.drawRect(0, 0, props.h, props.v);

        const bar = new PIXI.Graphics();
        bar.beginFill(0x3399ff);
        bar.drawRect(2, 2, inner.h, inner.v);
        bar.endFill();

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
        this.bar.beginFill(color);
        this.bar.drawRect(2, props.d ? 2 : inner.v - sizes.v, sizes.h, sizes.v);
        this.bar.endFill();

        if (IS_MOBILE) {
            this.container.position.set(this.parent.view.width / 2 - props.h / 2, 20);
            return;
        }

        this.container.position.set(20, this.parent.view.height - 250);
    }
}
