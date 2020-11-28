import { Renderable } from "../game_renderers/renderable";
import { EventEmitter } from 'events';

const PIXI = require('pixi.js');

// const NUM_SEGS = 8;
const NUM_SEGS = 4;
const ANGLE = 360 / NUM_SEGS;
const HALF_ANGLE = ANGLE / 2;
const RADIUS = 70;
const PADDING = 40;

// const DIRECTIONS = [
//     'up', 'up-right', 'right', 'down-right',
//     'down', 'down-left', 'left', 'up-left',
// ];
const DIRECTIONS = [
    'up', 'right', 'down', 'left'
];

export class DPadRenderer extends EventEmitter implements Renderable {
    private container: any;

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
            segment.interactive = true;
            segment.lineStyle(1);
            segment.beginFill(0x333333, 0.8);
            segment.arc(0, 0, RADIUS, a.start - Math.PI / 2, a.end - Math.PI / 2);
            segment.arc(0, 0, RADIUS / 2, a.end - Math.PI / 2, a.start - Math.PI / 2, true);
            segment.endFill();
            segment.index = i;
            segment.visible = false;

            this.container.addChild(segment);

            return segment;
        });

        const up = () => {
            segments.forEach(s => {
                this.pointerUp(s.index);
                s.visible = false;
            });
        };

        const move = (e: any) => {
            const data = e.data;
            const pos = data.getLocalPosition(this.container);
            const dist = Math.sqrt(Math.pow(pos.x, 2) + Math.pow(pos.y, 2));
            const angle = Math.atan2(pos.y, pos.x) / Math.PI * 180 + 90;

            let index = -1;

            if (dist > RADIUS * 2) {
                return;
            }

            if (RADIUS / 2 < dist) {
                index = ((angle + 360 + HALF_ANGLE) % 360) / ANGLE % NUM_SEGS | 0;
            }

            up();

            if (!!~index) {
                this.pointerDown(index);
                segments[index].visible = true;
            }
        };

        const middle = new PIXI.Graphics();
        middle.interactive = true;
        middle.beginFill(0x202020, 1);
        middle.arc(0, 0, RADIUS / 2, 0, Math.PI * 2);
        middle.endFill();

        middle.on('touchstart', move);
        middle.on('touchmove', move);
        middle.on('touchend', up);
        middle.on('touchendoutside', up);

        this.container.addChild(middle);
    }

    public pointerDown(index: number) {
        this.emit('press', DIRECTIONS[index]);
    }

    public pointerUp(index: number) {
        this.emit('release', DIRECTIONS[index]);
    }

    public render() {
        this.container.position.set(
            RADIUS + PADDING,
            this.container.view.height - RADIUS - PADDING,
        );
    }
}
