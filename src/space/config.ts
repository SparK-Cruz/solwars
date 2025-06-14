import { ShipsConfig, BulletConfig, BotsConfig, Config as Base } from './config_interfaces.js';
import fs from 'fs';
import { Model } from './entities/ships/model.js';

const NULL_SHIP = {
    acceleration: 0,
    bomb: 0,
    bullet: 0,
    energy: 0,
    regeneration: 0,
    speed: 0,
    spin: 0,
}

class ConfigSingleton implements Base {
    private static instance: Base;

    constructor() {
        if (ConfigSingleton.instance) {
            return ConfigSingleton.instance;
        }

        ConfigSingleton.instance = this;
    }

    public serverPort: number = 80;
    public TPS: number = 64;
    public maxPlayers: number = 16;
    public ships: ShipsConfig = {
        warbird: {
            ...Model.Warbird,
            ...NULL_SHIP
        },
        javelin: {
            ...Model.Javelin,
            ...NULL_SHIP
        },
        spider: {
            ...Model.Spider,
            ...NULL_SHIP,
        },
        leviathan: {
            ...Model.Leviathan,
            ...NULL_SHIP,
        },
        terrier: {
            ...Model.Terrier,
            ...NULL_SHIP,
        },
        weasel: {
            ...Model.Weasel,
            ...NULL_SHIP,
        },
        lancaster: {
            ...Model.Lancaster,
            ...NULL_SHIP,
        },
        shark: {
            ...Model.Shark,
            ...NULL_SHIP,
        },
    };
    public bullets: BulletConfig[] = [];
    public bots: BotsConfig[] = [];

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
