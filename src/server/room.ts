import * as socketio from 'socket.io';
import { Server } from 'http';

import { CodecFacade } from '../space/codec_facade';
import { Stage } from '../space/stage';
import { Player } from './player';
import { EntityEvent } from '../space/entities';

const Collisions = require('collisions').Collisions;

const TPS = 60;

export class Room {
  public codec :CodecFacade;

  private server :Server;
  private io :SocketIO.Server;
  private stage :Stage;

  private players :Player[] = [];

  public constructor() {
    this.server = new Server();
    this.io = socketio(this.server);

    this.stage = new Stage(new Collisions());
    this.codec = new CodecFacade(this.stage);

    this.setupListeners();
  }

  public open(port :number) {
    setInterval(() => {
      this.tick();
    }, 1000/TPS);

    this.server.listen(port);
  }

  public addPlayerShip(player :Player) {
    this.stage.add(player.ship);
  }
  public removePlayer(player :Player) {
    this.stage.remove(player.ship.id);
    this.players = this.players.filter((member) => member !== player);
    this.broadcastRemoval(player.ship.id);
  }

  private onEntityDespawn = (id: number) => {
    this.broadcastRemoval(id);
  }

  private broadcastState() {
    this.players.forEach((player) => {
      // Player has no ship, didn't join yet
      if (!player.ship)
        return;

      player.sendState(this.codec.readStateFromPoint(player.ship));
    });
  }

  private broadcastRemoval(entityId :number) {
    this.players.forEach((client) => {
      client.sendRemoval(entityId);
    });
  }

  private tick() {
    this.stage.step();
    this.broadcastState();
    //console.log('Room@' + this.port + ': ' + this.stage.getTick());
  }

  private setupListeners() {
    this.stage.on(EntityEvent.Despawn, this.onEntityDespawn);

    let id = 0;
    this.io.sockets.on('connection', (socket :SocketIO.Socket) => {
      const player = new Player(++id, socket, this);
      player.on('ship', () => this.addPlayerShip(player));
      player.on('disconnect', () => this.removePlayer(player));
      this.players.push(player);
    });
  }
}
