import { Renderable } from "./game_renderers/renderable";
import { DPadRenderer } from "./mobile_input/dpad_renderer";
import { ActionsRenderer } from "./mobile_input/actions_renderer";
import { EventEmitter } from "events";
import { IS_MOBILE } from "./environment";
import { ClientInfo } from "./client";

const PIXI = require('pixi.js');

export class MobileInputRenderer extends EventEmitter implements Renderable {
    private container: any;
    private index: number = 0;
    private dpad: DPadRenderer;
    private actions: ActionsRenderer;

    private info: ClientInfo = null;

    constructor(private parent: any) {
        super();

        if (!IS_MOBILE)
            return;

        this.container = new PIXI.Container();
        this.container.interactiveChildren = true;
        this.container.position.set(0);
        this.container.view = parent.view;
        parent.addChild(this.container);

        this.dpad = new DPadRenderer(this.container);
        this.actions = new ActionsRenderer(this.container);

        this.dpad.on('press', (direction: string) => {
            this.emit('press', direction);
        });
        this.actions.on('press', (action: string) => {
            this.emit('press', action);
        });

        this.dpad.on('release', (direction: string) => {
            this.emit('release', direction);
        });
        this.actions.on('release', (action: string) => {
            this.emit('release', action);
        });
    }

    public update(info: ClientInfo) {
        if (!IS_MOBILE)
            return;

        this.dpad.update(info);
    }

    public render() {
        if (!IS_MOBILE) {
            return;
        }

        try {
            this.parent.setChildIndex(this.container, this.index++);
        } catch (error) {
            this.index--;
        }

        this.dpad.render();
        this.actions.render();
    }
}
