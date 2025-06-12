import { PrizeEffect } from "../prize";
import { Ship } from "../ship";

export class RegenUpgrade implements PrizeEffect {
  public name = 'Better generator!';
  public apply(entity: Ship): void {
    entity.regen *= 1.1;
  }
}
