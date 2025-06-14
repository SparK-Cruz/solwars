import { EntityEvent } from "../../space/entities.js";
import { Bullet } from "../../space/entities/bullet.js";
import { SfxRenderer } from "./sfx_renderer.js";

export class BulletAudioRenderer {
    private bulletShot0Audio: SfxRenderer;
    private bulletShot1Audio: SfxRenderer;
    private bulletShot2Audio: SfxRenderer;
    private bulletShot3Audio: SfxRenderer;
    private bulletImpactAudio: SfxRenderer;

    public constructor(private context: AudioContext) {
        this.bulletShot0Audio = new SfxRenderer(this.context, 'sfx/bullet_0.mp3');
        this.bulletShot1Audio = new SfxRenderer(this.context, 'sfx/bullet_1.mp3');
        this.bulletShot2Audio = new SfxRenderer(this.context, 'sfx/bullet_2.mp3');
        this.bulletShot3Audio = new SfxRenderer(this.context, 'sfx/bullet_3.mp3');
        this.bulletImpactAudio = new SfxRenderer(this.context, 'sfx/bullet_impact.mp3');
    }

    public bind(entity: Bullet) {
        entity.once(EntityEvent.Collide, () => this.onCollide(entity));
        this.onSpawn(entity);
    }

    public onSpawn(entity: Bullet) {
        const type = entity.bulletType;
        const sfx = [
            this.bulletShot0Audio,
            this.bulletShot1Audio,
            this.bulletShot2Audio,
            this.bulletShot3Audio,
        ][type];
        sfx.playAt(entity.x, entity.y);
    }

    private onCollide(entity: Bullet) {
        const sfx = this.bulletImpactAudio;
        sfx.playAt(entity.x, entity.y);
    }
}
