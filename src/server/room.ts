import * as socketio from 'socket.io';
import { Server } from 'http';

import { CodecFacade } from '../space/codec_facade';
import { Stage } from '../space/stage2';
import { Player } from './player';
import { Entity } from '../space/entities';

const TPS = 60;

export class Room {
  private server :Server;
  private io :SocketIO.Server;
  private codec :CodecFacade;

  private port :number;
  private stage :Stage;
  private mainLoop :NodeJS.Timer;

  private players :Player[] = [];

  public constructor() {
    this.server = new Server();
    this.io = socketio(this.server);

    this.stage = new Stage();
    this.codec = new CodecFacade(this.stage);

    this.setupEvents();
  }

  public open(port :number) {
    this.mainLoop = setInterval(() => {
      this.tick();
    }, 1000/TPS);

    this.port = port;
    this.server.listen(port);
  }

  public addPlayerShip(player :Player) {
    this.stage.add(player.ship);
  }
  public removePlayer(player :Player) {
    this.players = this.players.filter((member) => member !== player);
  }

  private broadcastState() {
    this.players.forEach((player) => {
      // Player has no ship, didn't join yet
      if (!player.ship)
        return;

      player.sendState(this.codec.readStateFromPoint(player.ship));
    });
  }

  private tick() {
    this.stage.step();
    this.broadcastState();
    //console.log('Room@' + this.port + ': ' + this.stage.getTick());
  }

  private setupEvents() {
    let id = 0;
    this.io.sockets.on('connection', (socket :SocketIO.Socket) => {
      this.players.push(new Player(id++, socket, this));
    });
  }
}
