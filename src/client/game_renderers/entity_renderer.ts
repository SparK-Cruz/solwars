const PIXI = require('pixi.js');

import { EventEmitter } from "events";
import { Renderable } from "./renderable";
import { Camera } from "../camera";
import { Stage } from ".././stage";
import { Entity, EntityType } from "../../space/entities";
import { ShipRenderer } from "./entities/ship_renderer";
import { Ship } from "../../space/entities/ship";
import { BulletRenderer } from "./entities/bullet_renderer";
import { Bullet } from "../../space/entities/bullet";
import { ShipDebrisRenderer } from "./entities/ship_debris_renderer";
import { ShipDebris } from "../../space/entities/ship_debris";
import { RockRenderer } from "./entities/rock_renderer";
import { Rock } from "../../space/entities/rock";
import { PrizeRenderer } from "./entities/prize_renderer";
import { Prize } from "../../space/entities/prize";
import { GravityWell } from "../../space/entities/gravity_well";
import { GravityWellRenderer } from "./entities/gravity_well_renderer";

export class EntityRenderer extends EventEmitter implements Renderable {
    private cache: any = {};
    private container: any;

    public constructor(parent: any, private camera: Camera, private stage: Stage) {
        super();

        this.container = new PIXI.Container();
        this.container.sortableChildren = true;
        this.container.interactiveChildren = false;

        this.stage.on('despawn', (id: number) => {
            if (!this.cache.hasOwnProperty(id)) {
                return;
            }

            this.container.removeChild(this.cache[id].container);
            delete this.cache[id];
        });
        this.stage.on('clear', (id: number) => {
            this.container.removeChildren();
            this.cache = {};
        });

        parent.addChild(this.container);
    }

    public render() {
        const entities = this.stage.fetchAllEntities();
        const offset = this.camera.getOffsetPosition();

        for (const i in entities) {
            const entity = entities[i];

            const pair = this.fetchPair(entity);
            this.renderEntity(entity, pair, offset);
        }
    }

    private renderEntity(entity: Entity, pair: RenderPair, offset: { x: number, y: number }) {
        if (!pair) return;

        pair.renderer.render();
        pair.container.visible = true;
        pair.container.angle = entity.angle || 0;
        pair.container.position.set(entity.x - offset.x, entity.y - offset.y);
    }

    private fetchPair(entity: Entity): RenderPair {
        if (this.cache.hasOwnProperty(entity.id)
            && this.cache[entity.id]) {
            return this.cache[entity.id];
        }

        try {
            const pair = this.createPair(entity);
            return this.cache[entity.id] = pair;
        } catch (error) {
            console.error('Failed to create renderer for entity (' + entity.id + '): ' + entity.type.name);
            console.error(error);
            return null;
        }
    }

    private createPair(entity: Entity): RenderPair {
        if (typeof entity.type == 'undefined') {
            console.log(entity);
            return null;
        }

        const container = new PIXI.Container();
        this.container.addChild(container);

        const pair = (renderer: Renderable) => ({
            container,
            renderer,
        });

        try {
            switch (entity.type.name) {
                case EntityType.Ship.name:
                    container.zIndex = 60;
                    return pair(new ShipRenderer(container, <Ship>entity));
                case EntityType.Bullet.name:
                    container.zIndex = 50;
                    return pair(new BulletRenderer(container, <Bullet>entity));
                case EntityType.ShipDebris.name:
                    container.zIndex = 40;
                    return pair(new ShipDebrisRenderer(container, <ShipDebris>entity));
                case EntityType.Rock.name:
                    container.zIndex = 30;
                    return pair(new RockRenderer(container, <Rock>entity));
                case EntityType.Prize.name:
                    container.zIndex = 20;
                    return pair(new PrizeRenderer(container, <Prize>entity));
                case EntityType.GravityWell.name:
                    container.zIndex = 10;
                    return pair(new GravityWellRenderer(container, <GravityWell>entity));
                default:
                    console.warn('No renderer for entity (' + entity.id + '): ' + entity.type.name);
                    break;
            }
        } catch (error) {
            this.container.removeChild(container);
            this.emit('fail', entity.id);
            throw error;
        }

        return null;
    }
}

interface RenderPair {
    renderer: Renderable;
    container: any;
}
