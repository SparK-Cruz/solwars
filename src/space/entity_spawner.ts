import { RockSpawner } from "./entity_spawner/rock_spawner.js";
import { PrizeSpawner } from "./entity_spawner/prize_spawner.js";
import { GravityWellSpawner } from "./entity_spawner/gravity_well_spawner.js";

export namespace EntitySpawner {
    export const rock: any = RockSpawner;
    export const prize: any = PrizeSpawner;
    export const gravityWell: any = GravityWellSpawner;
}
