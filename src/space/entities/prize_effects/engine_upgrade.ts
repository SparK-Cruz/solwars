import { PrizeEffect } from "../prize.js";
import { Ship } from "../ship.js";

export class EngineUpgrade implements PrizeEffect {
    public name = 'Better propulsors!';
    public apply(entity: Ship): void {
        entity.afterburnerCost *= 0.99;
        entity.power *= 1.005;
        entity.vmax *= 1.005;
    }
}
