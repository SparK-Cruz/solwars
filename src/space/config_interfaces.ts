export interface ShipConfig {
    speed: number,
    acceleration: number,
    spin: number,
    energy: number,
    bullet: number,
    bomb: number,
    regeneration: number;
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
    anon: boolean,
    faction: string,
}

export interface BotShip {
    model: string,
    decals: { name: string, color: string }[],
    color: string,
}

export interface Config {
    serverPort: number;
    TPS: number;
    maxPlayers: number;
    ships: ShipsConfig;
    bullets: BulletConfig[];
    bots: BotsConfig[];
    read: (callback: () => void) => void;
}
