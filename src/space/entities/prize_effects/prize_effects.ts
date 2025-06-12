import { PrizeEffect } from "../prize";
import { BulletUpgrade } from "./bullet_upgrade";
import { MaxHealthUpgrade } from "./health_upgrade";
import { EngineUpgrade } from "./engine_upgrade";
import { RegenUpgrade } from "./regen_upgrade";

export namespace PrizeEffects {
    export const bulletUpgrade: PrizeEffect = BulletUpgrade;
    export const maxHealthUpgrade: PrizeEffect = MaxHealthUpgrade;
    export const engineUpgrade: PrizeEffect = EngineUpgrade;
    export const regenUpgrade: PrizeEffect = RegenUpgrade;
};
export function RandomPrizeEffect() {
    const list: string[] = Object.keys(PrizeEffects);
    const type = list[Math.round(Math.random() * (list.length - 1))];
    return new (<any>PrizeEffects)[type];
}
