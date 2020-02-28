import { Client, ClientEvents } from "../client/client";
import { Input } from "../client/input";
import { Mapping } from "../space/entities/ships/mapping";
import { EntityType } from "../space/entities";
import { Ship } from "../space/entities/ship";
import { Control } from "../space/entities/ships/control";

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

const MIN_DISTANCE = 180;
const MAX_DISTANCE = 450;
const DISTANCE_BAND = 70;
const IDEAL_BULLET_SPEED = 7;
const ANGLE_TOLERANCE = 2;
const ENERGY_RESERVE = 0.65;

const ONE_MINUTE = 60000;

export class Bot extends Input {
    private static pool: Bot[] = [];

    private static mainLoop: NodeJS.Timeout;
    private static trackLoop: NodeJS.Timeout;

    public static set(bots: number) {
        bots = Math.abs(bots);

        console.log(`SPAWNING ${bots} BOTS!`);

        if (this.pool.length != bots) {
            if (this.pool.length == 0) {
                this.setupLoops();
            }
            if (bots == 0) {
                this.disableLoops();
            }
        }

        if (this.pool.length > bots) {
            const removed = this.pool.splice(bots);
            removed.forEach((bot: Bot) => {
                bot.disconnect();
            });
        }

        while (this.pool.length < bots) {
            this.pool.push(new Bot(botNames[this.pool.length]));
        }
    }

    private running = false;
    private name: string;
    private client: Client;

    private entity: Ship = null;
    private target: Ship = null;

    public lastSeen: number = null;

    public get enabled(): boolean {
        return this.running;
    }

    public constructor(name: string) {
        super(null);
        this.name = name;
        this.client = new Client(this);

        this.client.on(ClientEvents.SHIP, (ship: Ship) => {
            this.setReference(ship);
        });
        this.connect();
    }

    public connect() {
        this.client.connect('BOT ' + this.name);
    }

    public disconnect() {
        this.client.disconnect();
    }

    public enable() {}

    public disable() {}

    public setReference(entity: Ship) {
        this.entity = entity;
    }

    public track(entity: Ship) {
        if (entity)
            this.lastSeen = Date.now();

        this.target = entity;
    }

    public step() {
        this.mapping.state = 0;

        if (!this.client
            || !this.client.connected
            || !this.entity
            || !this.target) {
            this.updateControl(0);
            return;
        }

        const energy = 1 - (this.entity.damage / this.entity.health);
        const distance = Math.sqrt(Math.pow(this.target.x - this.entity.x, 2) + Math.pow(this.target.y - this.entity.y, 2));
        const angleDiff = this.calculateAngleDiff(distance);

        this.stepTurn(angleDiff);
        this.stepThrottle(energy, distance);
        this.stepShoot(energy, distance, angleDiff);

        this.updateControl(this.mapping.state);
    }

    public die() {
        this.disconnect();
        this.connect();
    }

    private stepTurn(angleDiff: number) {
        if (angleDiff < -ANGLE_TOLERANCE)
            this.mapping.press(Mapping.LEFT)
        if (angleDiff > ANGLE_TOLERANCE)
            this.mapping.press(Mapping.RIGHT);
    }

    private stepThrottle(energy: number, distance: number) {
        const delta = MIN_DISTANCE + ((MAX_DISTANCE - MIN_DISTANCE) * (1 - energy));

        if (distance < delta - DISTANCE_BAND)
            this.mapping.press(Mapping.BACKWARD);
        if (distance > delta + DISTANCE_BAND)
            this.mapping.press(Mapping.FORWARD);
    }

    private stepShoot(energy: number, distance: number, angleDiff: number) {
        if (energy < ENERGY_RESERVE
            || distance > MAX_DISTANCE
            || Math.abs(angleDiff) > ANGLE_TOLERANCE)
            return;

        this.mapping.press(Mapping.SHOOT);
    }

    private calculateAngleDiff(distance: number): number {
        let heading = Math.atan2(this.entity.vy, this.entity.vx) / Math.PI * 180 + 90;
        if (heading < 0) heading += 360;

        const targetAcceleration = Control.thrusting(this.target.control) * this.target.power;

        const increase = {
            x: targetAcceleration * Math.sin(this.target.angle * Math.PI / 180),
            y: -targetAcceleration * Math.cos(this.target.angle * Math.PI / 180),
        };

        // X frames at IDEAL speed gets you between our MIN and MAX distances
        // project where target will be X frames from here and aim
        const frames = distance / IDEAL_BULLET_SPEED;

        const prediction = {
            x: this.target.x + (increase.x + this.target.vx - this.entity.vx * frames),
            y: this.target.y + (increase.y + this.target.vy - this.entity.vy * frames),
        };

        let direction = Math.atan2(prediction.y - this.entity.y, prediction.x - this.entity.x) * 180 / Math.PI + 90;
        if (direction < 0) direction += 360;

        let angleDiff = direction - this.entity.angle;
        if (angleDiff > 180) angleDiff -= 360;
        if (angleDiff < -180) angleDiff += 360;

        return angleDiff;
    }

    private static setupLoops() {
        this.mainLoop = setInterval(() => {
            this.pool.forEach((bot: Bot) => bot.step());
        }, 1000/32);

        this.trackLoop = setInterval(() => {
            this.pool.forEach((bot: Bot) => {
                if (!bot.client
                    || !bot.client.connected
                    || !bot.entity)
                    return;

                const entities = bot.client.getStage().fetchAllEntities();

                let closest = null;
                let distance = Number.POSITIVE_INFINITY;

                for (const i in entities) {
                    if (!entities.hasOwnProperty(i))
                        continue;

                    const entity = entities[i];

                    if (entity.id == bot.entity.id
                        || entity.type.name != EntityType.Ship.name
                        || !(<any>entity).alive)
                        continue;

                    const cursor = Math.sqrt(Math.pow(entity.x - bot.entity.x, 2) + Math.pow(entity.y - bot.entity.y, 2));
                    if (cursor > distance)
                        continue;

                    closest = <Ship>entity;
                    distance = cursor;
                }

                bot.track(closest);

                if (ONE_MINUTE < Date.now() - bot.lastSeen) {
                    bot.die();
                }
            });
        }, 3000);
    }

    private static disableLoops() {
        clearInterval(this.trackLoop);
        clearInterval(this.mainLoop);
        this.trackLoop = null;
        this.mainLoop = null;
    }
}
