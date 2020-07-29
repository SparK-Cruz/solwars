import { Entity, EntityEvent } from "../../space/entities";
import { A2d } from "./a2d";
import { Ship, ShipEvents } from "../../space/entities/ship";

export class ShipAudioRenderer {
    private source: PannerNode;

    public constructor(private context: AudioContext, private entity: Entity) {
        this.source = A2d.source(this.context);
        (<Ship>this.entity).once(EntityEvent.Die, () => this.onDie());
        (<Ship>this.entity).on(ShipEvents.Upgrade, () => this.onUpgrade());
    }

    private onDie() {
        const audio = A2d.audio(this.source, 'sfx/ship_death.mp3');
        this.updatePositions();
        audio.play();
    }

    private onUpgrade() {
        const audio = A2d.audio(this.source, 'sfx/pick_item.mp3');
        this.updatePositions();
        audio.play();
    }

    private updatePositions() {
        (<any>this.source).positionX.value = this.entity.x;
        (<any>this.source).positionY.value = this.entity.y;
        (<any>this.source).positionZ.value = 10;
    }
}
