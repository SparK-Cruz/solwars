import { Room } from "../room";
import { Bot } from "./bot";
import { Ship } from "../../space/entities/ship";
import { Stage } from "../../space/stage";
import { EntityType, Entity } from "../../space/entities";
import { Config } from "../../space/config";

const botNames = [
    'Albert',
    'Allen',
    'Bert',
    'Bob',
    'Cecil',
    'Clarence',
    'Elliot',
    'Elmer',
    'Ernie',
    'Eugene',
    'Fergus',
    'Ferris',
    'Frank',
    'Frasier',
    'Fred',
    'George',
    'Graham',
    'Harvey',
    'Irwin',
    'Larry',
    'Lester',
    'Marvin',
    'Neil',
    'Niles',
    'Oliver',
    'Opie',
    'Ryan',
    'Toby',
    'Ulric',
    'Ulysses',
    'Uri',
    'Waldo',
    'Wally',
    'Walt',
    'Wesley',
    'Yanni',
    'Yogi',
    'Yuri',
].sort((a, b) => Math.round(Math.random() * 2 - 1));

const INPUT_TPS = 16;
const TARGET_LOOKUP_INTERVAL = 5000;

export class BotManager {
    private bots: Bot[] = [];
    private prefix = '';
    private stage: Stage;

    private playerCap = 0;

    public constructor(private room: Room) {
        this.prefix = Config.bots.prefix;
        this.stage = room.getStage();
        this.setupLoops();
    }

    public add(number: number) {
        if (number < 0)
            return;

        for(let i=0; i<number; i++) {
            const name = this.prefix + botNames[this.bots.length];
            const bot = new Bot(name, this.room);
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
        }, 1000/INPUT_TPS);

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

    private findShipsAround(coords: {x: number, y: number}): Ship[] {
        const sectors = this.stage.fetchEntitiesAround(coords);
        const entities: Entity[] = [];
        sectors.forEach(s => { entities.push(...Object.values(s)) });
        return <Ship[]>entities.filter((e: Entity) => e.type.name === EntityType.Ship.name);
    }

    private calculateDistanceBetween(pointA: {x: number, y: number}, pointB: {x: number, y: number}): number {
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
