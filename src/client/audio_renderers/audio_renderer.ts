import { Camera } from "../camera";
import { Stage } from "../stage";
import { Entity, EntityType } from "../../space/entities";
import { ShipAudioRenderer } from "./ship_audio_renderer";
import { BulletAudioRenderer } from "./bullet_audio_renderer";
import { Renderable } from "../game_renderers/renderable";

export class AudioRenderer implements Renderable {
    private context: AudioContext;

    constructor(private camera: Camera, private stage: Stage) {
        this.context = new AudioContext();
        this.stage.on('newEntity', (e) => this.onEntitySpawn(e));
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
        const renderer: any = this.setupRenderer(entity);
        renderer &&
        renderer.onSpawn &&
        renderer.onSpawn();
    }

    private setupRenderer(entity: Entity) {
        switch(entity.type.name) {
            case EntityType.Ship.name:
                return new ShipAudioRenderer(this.context, entity);
            case EntityType.Bullet.name:
                return new BulletAudioRenderer(this.context, entity);
        }
    }
}
