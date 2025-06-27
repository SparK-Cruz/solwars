import * as PIXI from 'pixi.js';

import { EventEmitter } from "events";
import { Renderable } from "./renderable.js";
import { Camera } from "../camera.js";
import { Stage } from ".././stage.js";
import { Entity, EntityType } from "../../space/entities.js";
import { ShipRenderer } from "./entities/ship_renderer.js";
import { Ship } from "../../space/entities/ship.js";
import { BulletRenderer } from "./entities/bullet_renderer.js";
import { Bullet } from "../../space/entities/bullet.js";
import { ShipDebrisRenderer } from "./entities/ship_debris_renderer.js";
import { ShipDebris } from "../../space/entities/ship_debris.js";
import { RockRenderer } from "./entities/rock_renderer.js";
import { Rock } from "../../space/entities/rock.js";
import { PrizeRenderer } from "./entities/prize_renderer.js";
import { Prize } from "../../space/entities/prize.js";
import { GravityWell } from "../../space/entities/gravity_well.js";
import { GravityWellRenderer } from "./entities/gravity_well_renderer.js";
import { MotionBlurFilter } from 'pixi-filters';

export class EntityRenderer extends EventEmitter implements Renderable {
    private cache: any = {};
    private container: PIXI.Container;

    public constructor(private parent: any, private camera: Camera, private stage: Stage) {
        super();

        this.container = new PIXI.Container();
        this.container.sortableChildren = true;
        this.container.interactiveChildren = false;

        this.stage.on('despawn', (id: number) => {
            this.removeEntity(id);
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

        const seen: number[] = [];

        for (const i in entities) {
            const entity = entities[i];

            const pair = this.fetchPair(entity);
            this.renderEntity(entity, pair, offset);
            seen.push(entity.id);
        }

        Object.keys(this.cache).map(id => parseInt(id)).forEach(id => {
            if (seen.includes(id)) return;
            console.log('REMOVING RENDERER', id);
            this.removeEntity(id);
        });
    }

    private renderEntity(entity: Entity, pair: RenderPair | null, offset: { x: number, y: number }) {
        if (!pair) return;

        if (!(<any>entity).hasStage) {
            this.removeEntity(entity.id);
            return;
        }

        pair.renderer.render();
        pair.container.visible = true;
        pair.container.angle = entity.angle || 0;
        pair.container.position.set(entity.x - offset.x, entity.y - offset.y);
    }

    private removeEntity(id: number) {
        if (!this.cache.hasOwnProperty(id))
            return;

        this.container.removeChild(this.cache[id].container);

        delete this.cache[id];
    }

    private fetchPair(entity: Entity): RenderPair | null {
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

    private createPair(entity: Entity): RenderPair | null {
        if (typeof entity.type == 'undefined') {
            console.error('unknown entity type', entity);
            return null;
        }

        const container = new PIXI.Container();
        this.container.addChild(container);
        (<any>container).app = this.parent.app;

        const applyFilter = (renderer: Renderable): Renderable => {
            container.filters = new MotionBlurFilter({ velocity: {x: 0, y: 0} });

            return {
                render: () => {
                    renderer.render();
                    (container.filters[0] as MotionBlurFilter).velocity = {
                        x: ((entity.vx ?? 0) - this.camera.trackable.vx),
                        y: ((entity.vy ?? 0) - this.camera.trackable.vy),
                    };
                }
            };
        };

        const pair = (renderer: Renderable) => ({
            container,
            renderer: applyFilter(renderer),
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
