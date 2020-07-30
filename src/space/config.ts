import * as json from 'jsonfile';

export interface ShipConfig {
    speed: number,
    acceleration: number,
    spin: number,
    energy: number,
    bullet: number,
    bomb: number,
}

export interface ShipsConfig {
    warbird: ShipConfig,
    javelin: ShipConfig,
    spider: ShipConfig,
    leviathan: ShipConfig,
    terrier: ShipConfig,
    weasel: ShipConfig,
    lancaster: ShipConfig,
    shark: ShipConfig,
}

export interface BulletConfig {
    speed: number,
    cost: number,
    energy: number,
    cooldown: number,
    color: string,
}

export interface BotsConfig {
    count: number,
    ship: BotShip,
    prefix: string,
    faction: string,
}

export interface BotShip {
    model: string,
    decals: {name: string, color: string}[],
    color: string,
}

export class Config {
    public static serverPort: number;
    public static networkCompression: boolean;
    public static TPS: number;
    public static maxPlayers: number;
    public static ships: ShipsConfig;
    public static bullets: BulletConfig[];
    public static bots: BotsConfig[];

    public static read(callback: Function) {
        json.readFile('./config.json', (err: any, contents: any) => {
            if (err) {
                console.log(err);
                return;
            }
            for(let i in contents) {
                (<any>Config)[i] = contents[i];
            }

            callback();
        });
    }
}
