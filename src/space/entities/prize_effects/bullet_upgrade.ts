import { PrizeEffect } from "../prize";
import { Ship } from "../ship";
import { Config } from "../../config";

export class BulletUpgrade implements PrizeEffect {
    public name = 'Better bullets!';
    public apply(entity: Ship): void {
        if (!Config.bullets)
            return;

        const max = Config.bullets.length - 1;
        entity.bullet = Math.min(entity.bullet + 1, max);
    }
}
