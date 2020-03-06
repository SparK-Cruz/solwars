import { PrizeEffect } from "../prize";
import { Ship } from "../ship";

export class MaxHealthUpgrade implements PrizeEffect {
    public name = 'More energy!';
    public apply(entity: Ship): void {
        entity.health += 100;
    }
}
