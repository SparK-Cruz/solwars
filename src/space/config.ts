import * as json from 'jsonfile';

interface ShipConfig {
    speed: number,
    acceleration: number,
    spin: number,
    energy: number,
    bullet: number,
    bomb: number,
}

interface ShipsConfig {
    warbird: ShipConfig,
    javelin: ShipConfig,
    spider: ShipConfig,
    leviathan: ShipConfig,
    terrier: ShipConfig,
    weasel: ShipConfig,
    lancaster: ShipConfig,
    shark: ShipConfig,
}

interface BulletConfig {
    speed: number,
    energy: number,
    cooldown: number,
    color: string,
}

export class Config {
    public static TPS: number;
    public static maxPlayers: number;
    public static serverPort: number;
    public static ships: ShipsConfig;
    public static bullets: BulletConfig[];
    public static bots: number;

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
