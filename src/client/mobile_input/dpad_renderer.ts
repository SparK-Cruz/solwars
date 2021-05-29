import { Renderable } from "../game_renderers/renderable";
import { EventEmitter } from 'events';
import { ClientInfo } from "../client";
import { Joystick } from "pixi-virtual-joystick";

const PIXI = require('pixi.js');

const TPS = 32;
const RADIUS = 0.2;
const TURN_RADIUS = 0.5;
const ANGLE_TOLERANCE = 15;
const BIG_DIFF = 165;
const PADDING = 90;

const normalize = (angle: number) => {
    const step = (angle + 360) % 360;
    return step + (step > 180 ? -360 : 0);
};

export class DPadRenderer extends EventEmitter implements Renderable {
    private container: any;

    private info: any;
    private angle: number;
    private dist: number;

    constructor(parent: any) {
        super();

        this.container = new PIXI.Container();
        this.container.interactiveChildren = true;
        this.container.interactive = true;
        this.container.position.set(0);
        this.container.view = parent.view;
        parent.addChild(this.container);

        const outer = new PIXI.Graphics();
        outer.beginFill(0x202020);
        outer.drawCircle(0, 0, 50);
        outer.alpha = 1;

        const inner = new PIXI.Graphics();
        inner.beginFill(0x3399ff);
        inner.drawCircle(0, 0, 30);
        inner.alpha = 0.5;

        const joystick = new Joystick({
            outer,
            inner,
            onChange: (data) => {
                this.dist = data.power;
                this.angle = normalize(90-data.angle);
            },
            onEnd: () => {
                this.dist = 0;
            }
        });

        this.loop();

        this.container.addChild(joystick);
    }

    public update(info: ClientInfo) {
        this.info = info;
    }

    public render() {
        this.container.position.set(
            PADDING,
            this.container.view.height - PADDING,
        );
    }

    private loop() {
        const { diff, big } = this.angleDiff(this.angle);

        this.checkTurnTo(diff);
        this.checkThrust(big);

        setTimeout(() => this.loop(), 1000 / TPS);
    }

    private angleDiff(angle: number) {
        if (!this.info) {
            return { diff: 0, big: false };
        }

        const nAngle = normalize(angle);
        const nShip = normalize(this.info.angle);

        let diff = normalize(nAngle - nShip);
        const big = Math.abs(diff) > BIG_DIFF;

        if (big) {
            diff = normalize(diff + 180);
        }

        return { diff, big };
    }

    private thrust(backwards: boolean) {
        this.pointerDown(backwards ? 'down' : 'up');
    }

    private stopThrusting() {
        this.pointerUp('up');
        this.pointerUp('down');
    }

    private turnTo(angle: number) {
        if (Math.abs(angle) < ANGLE_TOLERANCE) {
            return this.stopTurning();
        }

        if (angle > 0) {
            return this.pointerDown('right');
        }

        return this.pointerDown('left');
    }

    private stopTurning() {
        this.pointerUp('right');
        this.pointerUp('left');
    }

    private pointerDown(action: string) {
        this.emit('press', action);
    }

    private pointerUp(action: string) {
        this.emit('release', action);
    }

    private checkTurnTo(angle: number) {
        if (this.dist >= RADIUS) {
            this.turnTo(angle);
            return;
        }

        this.stopTurning();
    }
    private checkThrust(backwards: boolean) {
        if (this.dist >= TURN_RADIUS) {
            this.thrust(backwards);
            return;
        }

        this.stopThrusting();
    }
}
