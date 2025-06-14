import * as PIXI from 'pixi.js';
import { Renderable } from "../game_renderers/renderable.js";
import { ClientInfo } from "../client.js";
import { Camera } from "../camera.js";
import { Mapping } from "../../space/entities/ships/mapping.js";

export class SpeedIndicator implements Renderable {
    private info: ClientInfo | null = null;
    private container: any;
    private slowChevron: any;
    private fastChevron: any;

    public constructor(private parent: any, private camera: Camera) {
        this.container = new PIXI.Container();

        this.slowChevron = this.drawChevron(0xffffff);
        this.fastChevron = this.drawChevron(0xffffff);

        this.container.addChild(this.slowChevron);
        this.container.addChild(this.fastChevron);

        this.slowChevron.position.set(0, -3);
        this.fastChevron.position.set(0, -9);

        this.parent.addChild(this.container);
    }

    public update(info: ClientInfo) {
        this.info = info;
    }

    public render() {
        if (!this.info) {
            return;
        }

        const speed = Math.sqrt(Math.pow(this.info.speed.x, 2) + Math.pow(this.info.speed.y, 2));
        const speedScale = 10;
        const alpha = speed / (this.info.maxSpeed * 2);
        const angleOffset = Math.PI / 2;
        const rotation = Math.atan2(this.info.speed.y, this.info.speed.x) + angleOffset;
        let baseColor = 0x3399ff;

        if (this.info.control & Mapping.AFTERBURNER) {
            baseColor = 0xff9933;
        }

        this.slowChevron.tint = baseColor;
        this.fastChevron.visible = false;

        if (alpha > 0.5) {
            this.fastChevron.tint = baseColor;
            this.fastChevron.visible = true;
        }

        const point = this.camera.addOffset({
            x: this.info.speed.x * speedScale,
            y: this.info.speed.y * speedScale,
        });

        this.container.alpha = alpha;
        this.container.pivot
        this.container.rotation = rotation;
        this.container.position.set(point.x, point.y);
    }

    private drawChevron(color: number) {
        const chevron = new PIXI.Graphics();
        chevron.moveTo(0, 0);
        chevron.lineTo(6, 6);
        chevron.lineTo(6, 9);
        chevron.lineTo(0, 3);
        chevron.lineTo(-6, 9);
        chevron.lineTo(-6, 6);
        chevron.lineTo(0, 0);
        chevron.fill(color);

        return chevron;
    }
}
