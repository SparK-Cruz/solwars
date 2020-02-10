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
    public static ships: ShipsConfig;
    public static bullets: BulletConfig[];

    public static read() {
        json
            .readFile('./config.json', (err: any, contents: any) => {
                if (err) {
                    console.log(err);
                }
                this.ships = contents.ships;
                this.bullets = contents.bullets;
            });
    }
}