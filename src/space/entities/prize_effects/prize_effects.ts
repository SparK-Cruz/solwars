import { BulletUpgrade } from "./bullet_upgrade";
import { MaxHealthUpgrade } from "./health_upgrade";
import { EngineUpgrade } from "./engine_upgrade";

export namespace PrizeEffects {
    export const bulletUpgrade: any = BulletUpgrade;
    export const maxHealthUpgrade: any = MaxHealthUpgrade;
    export const engineUpgrade: any = EngineUpgrade;
};
export function RandomPrizeEffect() {
    const list: string[] = Object.keys(PrizeEffects);
    const type = list[Math.round(Math.random() * (list.length - 1))];
    return new (<any>PrizeEffects)[type];
}
