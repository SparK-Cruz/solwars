import { Entity, EntityEvent } from "../../space/entities";
import { Bullet } from "../../space/entities/bullet";
import { A2d } from "./a2d";

export class BulletAudioRenderer {
    private source: PannerNode;

    public constructor(private context: AudioContext, private entity: Entity) {
        this.source = A2d.source(this.context);
        (<any>entity).once(EntityEvent.Collide, () => this.onCollide());
    }

    public onSpawn() {
        const type = (<Bullet>this.entity).bulletType;
        const audio = A2d.audio(this.source, `sfx/bullet_${type}.mp3`);

        this.updatePositions();
        audio.play();
    }

    private onCollide() {
        const audio = A2d.audio(this.source, 'sfx/bullet_impact.mp3');
        this.updatePositions();
        audio.play();
    }

    private updatePositions() {
        (<any>this.source).positionX.value = this.entity.x;
        (<any>this.source).positionY.value = this.entity.y;
        (<any>this.source).positionZ.value = 10;
    }
}
