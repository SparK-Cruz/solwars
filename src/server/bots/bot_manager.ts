import { Room } from "../room.js";
import { Bot } from "./bot.js";
import { Ship } from "../../space/entities/ship.js";
import { Stage } from "../../space/stage.js";
import { EntityType, Entity } from "../../space/entities.js";
import { BotsConfig } from "../../space/config_interfaces.js";
import { BotNamePool } from "./bot_name_pool.js";

const INPUT_TPS = 16;
const TARGET_LOOKUP_INTERVAL = 5000;

export class BotManager {
    private bots: Bot[] = [];
    private prefix = '';
    private stage: Stage;

    private playerCap = 0;

    public constructor(private room: Room, private config?: BotsConfig) {
        if (config)
            this.prefix = config.prefix;

        this.stage = room.getStage();
        this.setupLoops();
    }

    public add(number: number, config?: BotsConfig) {
        if (number < 0)
            return;

        if (!config && !this.config)
            return;

        config ??= this.config;

        for (let i = 0; i < number; i++) {
            const name = `${config?.prefix}${config?.anon ? BotNamePool.getAnon() : BotNamePool.get()}`;
            const bot = new Bot(name, this.room, config || this.config);
            this.room.setupPlayer(bot);
            this.bots.push(bot);
        }
    }

    public remove(number: number) {
        if (number <= 0)
            return;

        const removed = this.bots.splice(this.bots.length - number, number);
        removed.forEach((bot: Bot) => {
            bot.disconnect();
        });
    }

    public set(number: number) {
        const diff = number - this.bots.length;
        if (diff < 0) {
            this.remove(-diff);
            return;
        }

        this.add(diff);
    }

    public setPlayerCap(number: number) {
        this.playerCap = number;
        this.checkPlayerCap();
    }

    private checkPlayerCap() {
        if (this.playerCap == 0)
            return;

        const bots = this.playerCap - (this.room.playerCount - this.bots.length);
        this.set(bots);
    }

    public setTarget(entity: Ship) {
        this.bots.forEach((bot: Bot) => {
            bot.setTarget(entity);
        });
    }

    private setupLoops() {
        setInterval(() => {
            this.step();
        }, 1000 / INPUT_TPS);

        setInterval(() => {
            this.checkPlayerCap();

            for (const i in this.bots) {
                const bot = this.bots[parseInt(i)];

                // no ship, skip this bot and wait next turn
                if (!bot.ship) {
                    continue;
                }

                const ships = this.findShipsAround(bot.ship);

                let target = null;
                let targetDistance = Number.POSITIVE_INFINITY;
                for (const j in ships) {
                    const other = ships[parseInt(j)];
                    if (bot.ship.id === other.id)
                        continue;

                    if ((<any>bot.ship).aiFaction && (<any>bot.ship).aiFaction === (<any>other).aiFaction)
                        continue;

                    const otherDistance = this.calculateDistanceBetween(bot.ship, other);
                    if (otherDistance > targetDistance)
                        continue;

                    target = other;
                    targetDistance = otherDistance;
                }

                bot.setTarget(target);
            }
        }, TARGET_LOOKUP_INTERVAL);
    }

    private findShipsAround(coords: { x: number, y: number }): Ship[] {
        const entities: Entity[] = this.stage.fetchEntitiesAround(coords)
            .reduce((a, s) => a.concat(Object.values(s)), []);
        return <Ship[]>entities.filter((e: Entity) => e.type.name === EntityType.Ship.name);
    }

    private calculateDistanceBetween(pointA: { x: number, y: number }, pointB: { x: number, y: number }): number {
        return Math.sqrt(
            Math.pow(pointB.x - pointA.x, 2) +
            Math.pow(pointB.y - pointA.y, 2)
        );
    }

    private step() {
        this.bots.forEach((bot: Bot) => {
            bot.step();
        });
    }
}
