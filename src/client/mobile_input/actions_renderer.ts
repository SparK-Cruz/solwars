import { Renderable } from "../game_renderers/renderable.js";
import { EventEmitter } from 'events';

import * as PIXI from 'pixi.js';

const PADDING = 30;
const RADIUS = 32;

export class ActionsRenderer extends EventEmitter implements Renderable {
    private container: any;

    constructor(parent: any) {
        super();

        this.container = new PIXI.Container();
        this.container.interactiveChildren = true;
        this.container.interactive = true;
        this.container.position.set(0);
        this.container.view = parent.canvas;
        parent.addChild(this.container);

        const afterburner = this.buildButton(this.drawAfterburnerIcon());
        afterburner.position.set(-RADIUS, -RADIUS - PADDING);
        afterburner.on('touchstart', () => this.pointerDown('afterburner'));
        afterburner.on('touchend', () => this.pointerUp('afterburner'));
        afterburner.on('touchendoutside', () => this.pointerUp('afterburner'));

        const guns = this.buildButton(this.drawGunsIcon());
        guns.position.set(-RADIUS * 3 - PADDING, -RADIUS);
        guns.on('touchstart', () => this.pointerDown('shoot'));
        guns.on('touchend', () => this.pointerUp('shoot'));
        guns.on('touchendoutside', () => this.pointerUp('shoot'));

        this.container.addChild(afterburner);
        this.container.addChild(guns);
    }

    public pointerDown(action: string) {
        this.emit('press', action);
    }

    public pointerUp(action: string) {
        this.emit('release', action);
    }

    public render() {
        this.container.position.set(
            this.container.view.width - PADDING,
            this.container.view.height - PADDING,
        );
    }

    private buildButton(label: any) {
        const button = new PIXI.Container();
        button.interactive = true;

        const gfx = new PIXI.Graphics();
        gfx.beginFill(0x202020);
        gfx.arc(0, 0, RADIUS, 0, Math.PI * 2);
        gfx.endFill();

        button.addChild(gfx);
        button.addChild(label);

        return button;
    }

    private drawAfterburnerIcon() {
        const container = new PIXI.Container();

        const high = this.drawChevron(0x3399ff);
        const low = this.drawChevron(0x3399ff);

        high.position.set(0, -9);
        low.position.set(0, -3);

        container.addChild(high);
        container.addChild(low);

        return container;
    }

    private drawChevron(color: number) {
        const chevron = new PIXI.Graphics();
        chevron.beginFill(color);
        chevron.moveTo(0, 0);
        chevron.lineTo(6, 6);
        chevron.lineTo(6, 9);
        chevron.lineTo(0, 3);
        chevron.lineTo(-6, 9);
        chevron.lineTo(-6, 6);
        chevron.lineTo(0, 0);

        return chevron;
    }

    private drawGunsIcon() {
        const pad = -8;
        const line = new PIXI.Graphics();
        line.lineStyle(3, 0x3399ff, 1);
        line.moveTo(0, pad + 0);
        line.lineTo(0, pad + 3);
        line.moveTo(0, pad + 6);
        line.lineTo(0, pad + 10);
        line.moveTo(0, pad + 13);
        line.lineTo(0, pad + 17);

        return line;
    }
}
