import { Renderable } from "../game_renderers/renderable";
import { EventEmitter } from 'events';
import { ClientInfo } from "../client";

const PIXI = require('pixi.js');

const TPS = 32;
const NUM_SEGS = 12;
const ANGLE = 360 / NUM_SEGS;
const HALF_ANGLE = ANGLE / 2;
const RADIUS = 28;
const TURN_RADIUS = 45;
const DEAD_RADIUS = 200;
const ANGLE_TOLERANCE = 15;
const BIG_DIFF = 175;
const PADDING = 50;

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

        const segments = Array(NUM_SEGS).fill(0).map((e, i) => {
            const a = {
                start: (((i * ANGLE - HALF_ANGLE) + 360) % 360) / 180 * Math.PI,
                end: (((i * ANGLE + HALF_ANGLE) + 360) % 360) / 180 * Math.PI,
            };

            const segment = new PIXI.Graphics();
            segment.lineStyle(1);
            segment.beginFill(0x333333, 0.8);
            segment.arc(0, 0, TURN_RADIUS, a.start - Math.PI / 2, a.end - Math.PI / 2);
            segment.arc(0, 0, RADIUS / 2, a.end - Math.PI / 2, a.start - Math.PI / 2, true);
            segment.endFill();
            segment.index = i;
            segment.visible = false;

            this.container.addChild(segment);

            return segment;
        });

        const up = () => {
            segments.forEach(s => {
                s.visible = false;
            });
        };

        const move = (e: any) => {
            const data = e.data;
            const pos = data.getLocalPosition(this.container);
            const dist = Math.sqrt(Math.pow(pos.x, 2) + Math.pow(pos.y, 2));
            const angle = Math.atan2(pos.y, pos.x) / Math.PI * 180 + 90;

            let index = -1;

            up();

            if (dist > DEAD_RADIUS)
                return;

            this.dist = dist;

            if (dist > RADIUS) {
                index = ((angle + 360 + HALF_ANGLE) % 360) / ANGLE % NUM_SEGS | 0;
            }

            if (!!~index) {
                this.angle = index * ANGLE;
                segments[index].visible = true;
            }
        };

        setInterval(() => { this.loop(); }, 1000 / TPS);

        const middle = new PIXI.Graphics();
        middle.interactive = true;
        middle.beginFill(0x202020, 1);
        middle.arc(0, 0, RADIUS, 0, Math.PI * 2);
        middle.endFill();

        middle.on('touchstart', move);
        middle.on('touchmove', move);
        middle.on('touchend', up);
        middle.on('touchendoutside', up);

        this.container.addChild(middle);
    }

    public update(info: ClientInfo) {
        this.info = info;
    }

    public render() {
        this.container.position.set(
            TURN_RADIUS + PADDING,
            this.container.view.height - TURN_RADIUS - PADDING,
        );
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

    private loop() {
        const { diff, big } = this.angleDiff(this.angle);

        this.checkTurnTo(diff);
        this.checkThrust(big);
    }

    private checkTurnTo(angle: number) {
        if (this.dist >= RADIUS * 0.9) {
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
