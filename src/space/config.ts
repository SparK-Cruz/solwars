import * as json from 'jsonfile';
import { ShipsConfig, BulletConfig, BotsConfig, Config as Base } from './config_interfaces';
// export * from './config_interfaces';

class Class implements Base {
    private static instance: Base;

    constructor() {
        if (Class.instance) {
            return Class.instance;
        }

        Class.instance = this;
    }

    public serverPort: number;
    public TPS: number;
    public maxPlayers: number;
    public ships: ShipsConfig;
    public bullets: BulletConfig[];
    public bots: BotsConfig[];

    public read(callback: Function) {
        json.readFile('./config.json', (err: any, contents: any) => {
            if (err) {
                console.log(err);
                return;
            }
            for (let i in contents) {
                (<any>Config)[i] = contents[i];
            }

            callback();
        });
    }
}

export const Config = new Class();