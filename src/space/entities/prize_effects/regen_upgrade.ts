import { PrizeEffect } from "../prize.js";
import { Ship } from "../ship.js";

export class RegenUpgrade implements PrizeEffect {
  public name = 'Better generator!';
  public apply(entity: Ship): void {
    entity.regen *= 1.1;
  }
}
