import { PrizeEffect } from "../prize.js";
import { Ship } from "../ship.js";

export class RegenUpgrade implements PrizeEffect {
  public name = 'Better energy converter!';
  public apply(entity: Ship): void {
    entity.regen *= 1.07;
  }
}
