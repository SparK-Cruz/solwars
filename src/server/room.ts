import { Socket, Server as SocketServer } from 'socket.io';
import { Server } from 'http';

import { CodecFacade, CodecEvents, PlayerDeath } from '../space/codec_facade.js';
import { Stage } from '../space/stage.js';
import { Player, PlayerEvents } from './player.js';
import { EntityEvent, Entity } from '../space/entities.js';
import { Config } from '../space/config.js';
import { Ship } from '../space/entities/ship.js';

// @ts-ignore
import { Collisions } from 'collisions';

const UPDATE_SKIP = 3;
let TPS = 64;
let TPS_TARGET = (1000 / TPS);

const playerSkipFactor = UPDATE_SKIP;

export class Room {
    public codec: CodecFacade;

    private io: SocketServer;
    private stage: Stage;

    private players: Player[] = [];
    private ranking: Player[] | null = null;

    private timer: bigint = 0n;

    private lastId = 0;

    public get playerCount(): number {
        return this.players.length;
    }

    public constructor(private server: Server, mapName: string = "default") {
        this.io = new SocketServer(this.server);

        this.stage = new Stage(new Collisions(), mapName);
        this.codec = new CodecFacade();

        TPS = Config.TPS;
        TPS_TARGET = 1000 / TPS;

        this.setupListeners();
    }

    public getStage() {
        return this.stage;
    }

    public open() {
        setTimeout(() => {
            let delta = 1;
            const currentTime = process.hrtime.bigint() / 1000000n;
            if (this.timer && this.timer !== 0n) {
                delta = Number(currentTime - this.timer) / (1000 / TPS);
            }
            this.timer = currentTime;
            this.tick(delta);
            this.open();
        }, 1000 / TPS);
    }

    public setupPlayer(player: Player) {
        player.id = ++this.lastId;

        player.once(PlayerEvents.Ship, (ship: Ship) => {
            console.log(player.name + ' has joined the game');
        });
        player.on(PlayerEvents.Ship, (ship: Ship) => {
            this.onPlayerShip(player, ship);
            this.ranking = null;
        });
        player.on(PlayerEvents.Die, (death: PlayerDeath) => {
            this.onPlayerDie(player, death);
            this.ranking = null;
        });
        player.on(PlayerEvents.SyncEntity, (id: number) => {
            console.log('Full sync requested by', id);
            let entity = null;
            this.stage.fetchEntitiesAround(player.ship!)
                .find((p: Entity[]) => p && typeof p.find === "function" && !!p.find((e: Entity) => e.id === id ? !!(entity = e) : false));

            player.sendEntity(JSON.stringify(this.codec.encodeEntity(entity, true)));
        });
        player.on(PlayerEvents.Disconnect, () => {
            this.onPlayerDisconnect(player);
            this.ranking = null;
        });
        this.players.push(player);
    }

    private onEntityDespawn = (id: number) => {
        this.broadcastRemoval(id);
    }

    private onEntityCollide = (id: number) => {
        this.broadcastCollision(id);
    }

    private onPlayerShip(player: Player, ship: Ship) {
        player.ship = ship;
        player.updateShipName();

        this.stage.spawn(player.ship);
    }
    private onPlayerDie(player: Player, death: PlayerDeath) {
        const killer = this.players.find(p => p.ship && p.ship.id == death.killer.id);

        if (killer) {
            killer.bounty += player.bounty;
            killer.ship!.name = killer.name + ' (' + killer.bounty + ')';
            killer.ship!.newSector = 1;
        }

        player.bounty = 1;

        console.log(`${death.name} died to ${(<any>death.killer).name} by ${death.cause} for ${death.bounty} points`);
        this.broadcastDeath(death);
    }
    private onPlayerDisconnect(player: Player) {
        console.log(player.name + ' has left the game');
        this.players = this.players.filter((member) => member.id !== player.id);

        if (!player.ship) return;
        this.stage.remove(player.ship);
        this.broadcastRemoval(player.ship.id);
    }

    private broadcastState() {
        const ranking = this.topPlayers();

        this.players.forEach((player, index) => {
            if (player.isBot)
                return;

            if ((this.stage.tick + index) % playerSkipFactor !== 0)
                return;

            setTimeout(() => {
                // No ship no data...
                if (!player.ship)
                    return;

                player.sendState(this.codec.encode(
                    {
                        tick: this.stage.tick,
                        radius: this.stage.radius,
                        entities: this.stage.fetchEntitiesAround(player.ship!),
                        ranking: ranking,
                    },
                    // if player ship is new to the sector, force full entity encoding
                    player.ship.newSector > 0
                ));
            }, 0);
        });
    }

    private broadcastRemoval(entityId: number) {
        this.players.forEach((client) => {
            client.sendRemoval(entityId);
        });
    }

    private broadcastCollision(entityId: number) {
        this.players.forEach((client) => {
            client.sendCollision(entityId);
        });
    }

    private broadcastDeath(death: PlayerDeath) {
        this.players.forEach((client) => {
            client.sendDeath(death);
        });
    }

    private tick(delta: number) {
        this.stage.step(delta);
        this.broadcastState();
    }

    private topPlayers() {
        return this.ranking = this.ranking || this.players.filter(p => p.ship && p.bounty).sort((a, b) => b.bounty - a.bounty).slice(0, 20);
    }

    private setupListeners() {
        this.stage.on(EntityEvent.Despawn, this.onEntityDespawn);
        this.stage.on(EntityEvent.Collide, this.onEntityCollide);

        this.lastId = 0;
        this.io.sockets.on(CodecEvents.CONNECTION, (socket: Socket) => {
            if (this.players.length > Config.maxPlayers) {
                socket.disconnect(true);
                return;
            }

            this.players = this.players.filter(p => p.socket.connected);

            const player = new Player(socket, this);
            this.setupPlayer(player);
        });
    }
}
