import { EntityEvent } from "../../space/entities.js";
import { Ship, ShipEvents } from "../../space/entities/ship.js";
import { SfxRenderer } from "./sfx_renderer.js";

export class ShipAudioRenderer {
    private shipDeathAudio: SfxRenderer = null;
    private pickItemAudio: SfxRenderer = null;

    public constructor(private context: AudioContext) {
        this.shipDeathAudio = new SfxRenderer(this.context, 'sfx/ship_death.mp3');
        this.pickItemAudio = new SfxRenderer(this.context, 'sfx/pick_item.mp3');
    }

    public bind(entity: Ship) {
        entity.once(EntityEvent.Die, () => this.onDie(entity));
        entity.on(ShipEvents.Upgrade, () => this.onUpgrade(entity));
        this.onSpawn(entity);
    }

    private onSpawn(entity: Ship) {
    }

    private onDie(entity: Ship) {
        const sfx = this.shipDeathAudio;
        sfx.playAt(entity.x, entity.y);
    }

    private onUpgrade(entity: Ship) {
        const sfx = this.pickItemAudio;
        sfx.playAt(entity.x, entity.y);
    }
}
