import * as socketio from 'socket.io';
import { Server } from 'http';

import { CodecFacade, CodecEvents, PlayerDeath } from '../space/codec_facade';
import { Stage } from '../space/stage';
import { Player, PlayerEvents } from './player';
import { EntityEvent } from '../space/entities';
import { Config } from '../space/config';
import { Ship } from '../space/entities/ship';

const Collisions = require('collisions').Collisions;

const TPS_TARGET = 64;
let TPS = 64;

export class Room {
    public codec :CodecFacade;

    private io :SocketIO.Server;
    private stage :Stage;

    private players :Player[] = [];
    private ranking :Player[] = null;

    private deltaTick: number = 1;

    public constructor(private server: Server) {
        this.io = socketio(this.server);

        this.stage = new Stage(new Collisions());
        this.codec = new CodecFacade();

        TPS = Config.TPS;
        this.deltaTick = TPS_TARGET/TPS;

        this.setupListeners();
    }

    public open() {
        setInterval(() => {
            this.tick();
        }, 1000/TPS);
    }

    private onEntityDespawn = (id: number) => {
        this.broadcastRemoval(id);
    }

    private onPlayerShip(player :Player, ship: Ship) {
        ship.name = player.name + ' (' + player.bounty + ')';
        player.ship = ship;

        const spawnRadius = 512 * this.players.length;
        player.ship.x += (Math.random() * spawnRadius) - spawnRadius / 2;
        player.ship.y += (Math.random() * spawnRadius) - spawnRadius / 2;
        this.stage.add(player.ship);
    }
    private onPlayerDie(player :Player, death: PlayerDeath) {
        const killer: Player = this.players.find(p => p.ship && p.ship.id == death.killer.id);

        if (typeof killer != 'undefined') {
            killer.bounty += player.bounty;
            killer.ship.name = killer.name + ' (' + killer.bounty + ')';
        }

        player.bounty = 1;

        // broadcast message to chat area saying whom killed who by what
    }
    private onPlayerDisconnect(player :Player) {
        console.log(player.name + ' has left the game');
        this.players = this.players.filter((member) => member.id !== player.id);

        if (!player.ship) return;
        this.stage.remove(player.ship);
        this.broadcastRemoval(player.ship.id);
    }

    private broadcastState() {
        const ranking = this.topPlayers();

        this.players.forEach((player) => {

            // No ship no data...
            if (!player.ship)
                return;

            player.sendState(this.codec.encode({
                tick: this.stage.tick,
                entities: this.stage.fetchEntitiesAround(player.ship),
                ranking: ranking,
            }));
        });
    }

    private broadcastRemoval(entityId :number) {
        this.players.forEach((client) => {
            client.sendRemoval(entityId);
        });
    }

    private tick() {
        this.stage.step(this.deltaTick);
        this.broadcastState();
    }

    private topPlayers() {
        return this.ranking = this.ranking || this.players.filter(p => p.ship && p.bounty).sort((a, b) => b.bounty - a.bounty).slice(0, 10);
    }

    private setupListeners() {
        this.stage.on(EntityEvent.Despawn, this.onEntityDespawn);

        let id = 0;
        this.io.sockets.on(CodecEvents.CONNECTION, (socket :SocketIO.Socket) => {
            if (this.players.length > Config.maxPlayers) {
                socket.disconnect(true);
                return;
            }

            this.players = this.players.filter(p => p.socket.connected);

            const player = new Player(++id, socket, this);
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
            player.on(PlayerEvents.Disconnect, () => {
                this.onPlayerDisconnect(player);
                this.ranking = null;
            });
            this.players.push(player);
        });
    }
}
