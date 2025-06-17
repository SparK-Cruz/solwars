import { PrizeEffect } from "../prize.js";
import { Ship } from "../ship.js";
import { Config } from "../../config_interfaces.js";

export class BulletUpgrade implements PrizeEffect {
    public config: Config | undefined;
    public name = 'Better guns!';
    public apply(entity: Ship): void {
        if (!this.config?.bullets)
            return;

        const max = this.config.bullets.length - 1;
        entity.bullet = Math.min(entity.bullet + 1, max);
        if (entity.bullet === max) this.name += " (MAX)";
    }
}
