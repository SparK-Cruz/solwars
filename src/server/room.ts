import * as socketio from 'socket.io';
import { Server } from 'http';

import { Stage, TPS } from '../space/stage';
import { Player } from './player';

export class Room {
  private server :Server;
  private io :SocketIO.Server;

  private port :number;
  private stage :Stage;
  private mainLoop :NodeJS.Timer;

  private players :Player[] = [];

  public constructor() {
    this.server = new Server();
    this.io = socketio(this.server);

    this.stage = new Stage();

    this.setupEvents();
  }

  public open(port :number) {
    this.mainLoop = setInterval(() => {
      this.tick();
    }, 1000/TPS);

    this.port = port;
    this.server.listen(port);
  }

  private tick() {
    this.stage.step();
    //console.log('Room@' + this.port + ': ' + this.stage.getTick());
  }

  private setupEvents() {
    this.io.sockets.on('connection', (socket :SocketIO.Socket) => {
      this.players.push(new Player(socket, this));
    });
  }
}
