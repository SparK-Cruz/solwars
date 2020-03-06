import { PrizeEffect } from "../prize";
import { Ship } from "../ship";

export class EngineUpgrade implements PrizeEffect {
    public name = 'Better engine!';
    public apply(entity: Ship): void {
        entity.afterburnerCost *= 0.9;
        entity.power *= 1.01;
        entity.vmax *= 1.01;
    }
}
