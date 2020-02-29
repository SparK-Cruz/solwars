import { Renderable } from "./renderable";
import { Camera } from "../camera";
import { Stage } from ".././stage";
import { Entity, EntityType } from "../../space/entities";
import { ShipRenderer } from "./ship_renderer";
import { Ship } from "../../space/entities/ship";
import { BulletRenderer } from "./bullet_renderer";
import { Bullet } from "../../space/entities/bullet";

export class EntityRenderer implements Renderable {
    private ctx: CanvasRenderingContext2D;
    private cache: any = {};

    public constructor(private canvas: HTMLCanvasElement, private camera: Camera, private stage: Stage) {
        this.ctx = canvas.getContext('2d');
    }

    public render() {
        const entities = this.stage.fetchAllEntities();
        const offset = this.camera.getOffsetPosition();

        for (const i in entities) {
            const entity = entities[i];

            const renderer = this.fetchRenderer(entity);
            this.renderEntity(entity, renderer, offset);
        }

        return this.canvas;
    }

    private renderEntity(entity: Entity, renderer: Renderable, offset: {x: number, y: number}) {
        const image = renderer.render();

        const center = {
            x: image.width / 2,
            y: image.height / 2,
        };

        this.ctx.save();
        this.ctx.translate(entity.x - offset.x, entity.y - offset.y);
        this.ctx.rotate(entity.angle * Math.PI / 180);
        this.ctx.drawImage(image, -center.x, -center.y);
        this.ctx.restore();
    }

    private fetchRenderer(entity: Entity): Renderable {
        if (this.cache.hasOwnProperty(entity.id)) {
            return this.cache[entity.id];
        }

        const renderer = this.createRenderer(entity);
        this.cache[entity.id] = renderer;

        return renderer;
    }

    private createRenderer(entity: Entity): Renderable {
        switch(entity.type.name) {
            case EntityType.Ship.name:
                return new ShipRenderer(<Ship>entity);
            case EntityType.Bullet.name:
                return new BulletRenderer(<Bullet>entity);
            default:
                console.warn('No renderer for entity (' + entity.id + '): ' + entity.type.name);
        }

        return {render:() => { return null; }};
    }
}
