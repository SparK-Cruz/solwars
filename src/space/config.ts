import { ShipsConfig, BulletConfig, BotsConfig, Config as Base } from './config_interfaces.js';
import fs from 'fs';

class ConfigSingleton implements Base {
    private static instance: Base;

    constructor() {
        if (ConfigSingleton.instance) {
            return ConfigSingleton.instance;
        }

        ConfigSingleton.instance = this;
    }

    public serverPort: number;
    public TPS: number;
    public maxPlayers: number;
    public ships: ShipsConfig;
    public bullets: BulletConfig[];
    public bots: BotsConfig[];

    public read(callback: Function) {
        fs.readFile('./config.json', 'utf-8', (err: any, raw: any) => {
            if (err) {
                console.log(err);
                return;
            }

            const contents = JSON.parse(raw);

            for (let i in contents) {
                (<any>this)[i] = contents[i];
            }

            console.log("Config", this);

            callback();
        });
    }
}

export const Config = new ConfigSingleton();