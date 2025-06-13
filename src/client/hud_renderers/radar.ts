import * as PIXI from 'pixi.js';

import { Renderable } from "../game_renderers/renderable";
import { Camera } from "../camera";
import { ClientInfo } from "../client";
import { EntityType } from "../../space/entities";
import { Stage } from ".././stage";
import { IS_MOBILE } from "../environment";

const SCALE = 1 / 12;
const REGION_SCALE = 1 / 512;
const POS = { x: -220, y: -250 };
const MOBILE_POS = { x: -220, y: 20 };

export class Radar implements Renderable {
    private container: PIXI.Container;

    private coordText: PIXI.Text;
    private blips: PIXI.Graphics;
    private radius: PIXI.Graphics;
    private radiusHole: PIXI.Graphics;

    private info: ClientInfo;

    public constructor(private parent: any, private camera: Camera, private stage: Stage) {
        this.initialize();
    }

    public update(info: ClientInfo) {
        this.info = info;
    }

    private initialize() {
        this.container = new PIXI.Container();

        this.initializeCoord();
        this.initializeFrame();
        this.initializeDeathRadius();
        this.initializeBlips();

        this.parent.addChild(this.container);
    }

    private initializeCoord() {
        this.coordText = new PIXI.Text(
            'E0 S0',
            {
                fontFamily: 'monospace',
                fontSize: 16,
                fill: 0x3399ff,
                align: 'center'
            }
        );
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

        this.radiusHole = new PIXI.Graphics();
        this.radius = new PIXI.Graphics();
        this.radius.mask = this.radiusHole;

        radiusContainer.addChild(this.radiusHole);
        radiusContainer.addChild(this.radius);
    }

    public render() {
        if (!this.info)
            return;

        this.drawCoordinates();
        this.drawBlips();

        if (this.stage.radius) {
            this.drawDeathRadius();
        }

        if (IS_MOBILE) {
            this.container.position.set(
                this.parent.view.width + MOBILE_POS.x,
                MOBILE_POS.y
            );
            return;
        }

        this.container.position.set(
            this.parent.view.width + POS.x,
            this.parent.view.height + POS.y
        );
    }

    private drawCoordinates() {
        const positionText = [
            this.info.position.x > 0 ? 'E' : 'W',
            Math.abs(Math.floor(this.info.position.x * REGION_SCALE)),
            ' ',
            this.info.position.y > 0 ? 'S' : 'N',
            Math.abs(Math.floor(this.info.position.y * REGION_SCALE)),
        ].join('');

        this.coordText.anchor.set(0.5, 0);
        this.coordText.position.set(100, 0);
        this.coordText.text = positionText;
    }

    private drawBlips() {
        this.blips.clear();

        const entities = this.stage.fetchAllEntities();

        for (let i in entities) {
            const entity = entities[i];

            let size = 4;
            let alpha = 1;
            let style = 0xff9933;

            if (entity.id == this.info.id) {
                style = 0xffffff;
                size = 5;
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

            this.blips.beginFill(style, alpha);
            this.blips.drawCircle(
                pos.x * SCALE + 100,
                pos.y * SCALE + 100,
                size / 2
            );
            this.blips.endFill();
        }
    }

    private drawDeathRadius() {
        this.radiusHole.clear();
        this.radius.clear();

        const pos = this.camera.translate({x: 0, y: 0});

        // mask
        this.radiusHole.circle(
            pos.x * SCALE + 100,
            pos.y * SCALE + 100,
            (this.stage.radius + 3000) * SCALE
        ).fill(0xffffff);

        this.radiusHole.circle(
            pos.x * SCALE + 100,
            pos.y * SCALE + 100,
            this.stage.radius * SCALE
        ).fill(0x000000);

        // zone
        const style = 0x770000;
        const alpha = 0.5;

        this.radius.circle(
            pos.x * SCALE + 100,
            pos.y * SCALE + 100,
            (this.stage.radius + 3000) * SCALE
        )
        .fill(style)
        .alpha = alpha;
    }
}
