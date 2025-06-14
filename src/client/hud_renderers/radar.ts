import * as PIXI from 'pixi.js';

import { Renderable } from "../game_renderers/renderable.js";
import { Camera } from "../camera.js";
import { ClientInfo } from "../client.js";
import { EntityType } from "../../space/entities.js";
import { Stage } from ".././stage.js";
import { IS_MOBILE } from "../environment.js";

const SCALE = 1 / 12;
const REGION_SCALE = 1 / 512;
const POS = { x: -220, y: -250 };
const MOBILE_POS = { x: -220, y: 20 };
const BLINKER_FRAMES = 32;

export class Radar implements Renderable {
    private container: PIXI.Container;

    private coordText?: PIXI.Text;
    private blips?: PIXI.Graphics;
    private radius?: PIXI.Graphics;
    private lastRadius: number = 0;

    private info: ClientInfo | null = null;

    private blinker: number = 0;
    private isBlinkerOn: boolean = true;
    private isFastBlinkerOn: boolean = true;

    public constructor(private parent: any, private camera: Camera, private stage: Stage) {
        this.container = new PIXI.Container();
        this.initialize();
        this.parent.addChild(this.container);
    }

    public update(info: ClientInfo) {
        this.info = info;
    }

    private initialize() {
        this.initializeCoord();
        this.initializeFrame();
        this.initializeBlips();
        this.initializeDeathRadius();
    }

    private initializeCoord() {
        this.coordText = new PIXI.Text({
            text: 'E0 S0',
            style: {
                fontFamily: 'monospace',
                fontSize: 16,
                fill: 0x3399ff,
                align: 'center'
            }
        });
        this.container.addChild(this.coordText);
    }

    private initializeFrame() {
        const frame = new PIXI.Graphics();
        frame
            .setFillStyle({ color: 0x000000, alpha: 0.6 })
            .setStrokeStyle({ color: 0x3399ff, width: 2 })
            .circle(100, 100, 100)
            .stroke()
            .fill()
        frame.position.set(0, 30);
        this.container.addChild(frame);
    }

    private initializeBlips() {
        const mask = new PIXI.Graphics();
        mask.circle(100, 100, 100)
            .fill(0xffffff);

        this.blips = new PIXI.Graphics();
        this.blips.mask = mask;
        this.container.addChild(mask);

        mask.position.set(0, 30);
        this.blips.position.set(0, 30);
        this.container.addChild(this.blips);
    }

    private initializeDeathRadius() {
        const mask = new PIXI.Graphics();
        mask.circle(100, 100, 100)
            .fill(0xffffff);
        mask.position.set(0, 30);

        const radiusContainer = new PIXI.Container();
        radiusContainer.mask = mask;
        radiusContainer.position.set(0, 30);

        this.container.addChild(mask);
        this.container.addChild(radiusContainer);

        // zone
        const alpha = 0.5;

        this.radius = new PIXI.Graphics();
        this.radius.alpha = alpha;

        radiusContainer.addChild(this.radius);
    }

    public render() {
        if (!this.info)
            return;

        this.blinker += 1;
        this.blinker %= BLINKER_FRAMES * 2;
        this.isBlinkerOn = this.blinker < BLINKER_FRAMES;
        this.isFastBlinkerOn = this.blinker % BLINKER_FRAMES > BLINKER_FRAMES / 2;

        this.drawCoordinates(this.info);
        this.drawBlips(this.info);

        if (this.stage.radius) {
            this.drawDeathRadius(this.info);
        }

        if (IS_MOBILE) {
            this.container.position.set(
                this.parent.canvas.width + MOBILE_POS.x,
                MOBILE_POS.y
            );
            return;
        }

        this.container.position.set(
            this.parent.canvas.width + POS.x,
            this.parent.canvas.height + POS.y
        );
    }

    private drawCoordinates(info: ClientInfo) {
        if (!this.coordText) return;

        const positionText = [
            info.position.x >= 0 ? 'E' : 'W',
            Math.abs(Math.floor(info.position.x * REGION_SCALE)),
            ' ',
            info.position.y >= 0 ? 'S' : 'N',
            Math.abs(Math.floor(info.position.y * REGION_SCALE)),
        ].join('');

        this.coordText.anchor.set(0.5, 0);
        this.coordText.position.set(100, 0);
        this.coordText.text = positionText;
    }

    private drawBlips(info: ClientInfo) {
        if (!this.blips) return;

        this.blips.clear();

        const entities = this.stage.fetchAllEntities();

        for (let i in entities) {
            const entity = entities[i];

            let size = 4;
            let alpha = 1;
            let style = 0xff9933;

            if (entity.id == info.id) {
                style = 0xffffff;
                size = 5;
                alpha = this.isFastBlinkerOn ? 1 : 0;
            }
            switch (entity.type.name) {
                case EntityType.ShipDebris.name:
                    style = 0xff9933;
                    alpha = 0.2;
                    size = 2;
                    break;
                case EntityType.Rock.name:
                    style = 0x777777;
                    size = (<any>entity).size * SCALE;
                    break;
                case EntityType.Prize.name:
                    style = 0x00ff00;
                    size = 3;
                    break;
                case EntityType.GravityWell.name:
                    style = 0x666699;
                    size = 5;
                    break;
                case EntityType.Bullet.name:
                    style = 0xff0000;
                    size = 3;
                    break;
            }

            const pos = this.camera.translate(entity);

            this.blips.circle(
                pos.x * SCALE + 100,
                pos.y * SCALE + 100,
                size / 2
            ).fill({color: style, alpha});
        }
    }

    private drawDeathRadius(info: ClientInfo) {
        if (!this.radius) return;

        const pos = this.camera.translate({x: 0, y: 0});
        let alpha = 0.5;

        if (this.stage.radius) {
            const distance = Math.sqrt(Math.pow(info.position.x, 2) + Math.pow(info.position.y, 2));
            alpha = distance > this.stage.radius && this.isBlinkerOn ? 0.6 : 0.5;

            if (this.lastRadius !== this.stage.radius) {
                const style = 0x770000;

                this.radius.clear();
                this.radius.circle(
                    0,
                    0,
                    this.stage.radius * SCALE + 200
                )
                .stroke({color: style, width: 400, alpha: 1});
            }
        }

        this.radius.alpha = alpha;
        this.radius.position.set(pos.x * SCALE + 100, pos.y * SCALE + 100);
    }
}
