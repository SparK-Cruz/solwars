import { EntityEvent } from "../../space/entities";
import { Bullet } from "../../space/entities/bullet";
import { SfxRenderer } from "./sfx_renderer";

export class BulletAudioRenderer {
    private bulletShot0Audio: SfxRenderer = null;
    private bulletShot1Audio: SfxRenderer = null;
    private bulletShot2Audio: SfxRenderer = null;
    private bulletShot3Audio: SfxRenderer = null;
    private bulletImpactAudio: SfxRenderer = null;

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
