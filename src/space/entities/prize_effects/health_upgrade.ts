import { PrizeEffect } from "../prize.js";
import { Ship } from "../ship.js";

export class MaxHealthUpgrade implements PrizeEffect {
    public name = 'Better batteries!';
    public apply(entity: Ship): void {
        entity.health += 100;
    }
}
