import { PrizeEffect } from "../prize.js";
import { Ship } from "../ship.js";

export class EngineUpgrade implements PrizeEffect {
    public name = 'Better engine!';
    public apply(entity: Ship): void {
        entity.afterburnerCost *= 0.9;
        entity.power *= 1.01;
        entity.vmax *= 1.01;
    }
}
