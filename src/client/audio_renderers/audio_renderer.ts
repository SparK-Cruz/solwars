import { Camera } from "../camera.js";
import { Stage } from "../stage.js";
import { Entity, EntityType } from "../../space/entities.js";
import { ShipAudioRenderer } from "./ship_audio_renderer.js";
import { BulletAudioRenderer } from "./bullet_audio_renderer.js";
import { Renderable } from "../game_renderers/renderable.js";

export class AudioRenderer implements Renderable {
    private context: AudioContext;

    private shipAudioRenderer: ShipAudioRenderer;
    private bulletAudioRenderer: BulletAudioRenderer;

    constructor(private camera: Camera, private stage: Stage) {
        this.context = new AudioContext();
        this.stage.on('newEntity', (e) => this.onEntitySpawn(e));

        this.shipAudioRenderer = new ShipAudioRenderer(this.context);
        this.bulletAudioRenderer = new BulletAudioRenderer(this.context);
    }

    public render() {
        if (!(<any>this.context.listener).positionX) {
            (<any>this.context.listener).setPosition(this.camera.trackable.x, this.camera.trackable.y, 0);
            return;
        }

        (<any>this.context.listener).positionX.value = this.camera.trackable.x;
        (<any>this.context.listener).positionY.value = this.camera.trackable.y;
        (<any>this.context.listener).positionZ.value = 0;
    }

    private onEntitySpawn(entity: Entity) {
        const renderer: any = this.fetchRenderer(entity);
        if (!renderer) return;

        renderer.bind(entity);
    }

    private fetchRenderer(entity: Entity) {
        if (typeof entity.type === 'undefined')
            return null;

        switch (entity.type.name) {
            case EntityType.Ship.name:
                return this.shipAudioRenderer;
            case EntityType.Bullet.name:
                return this.bulletAudioRenderer;
        }
    }
}
