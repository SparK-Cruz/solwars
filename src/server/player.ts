import { Room } from './room';
import { Ship } from '../space/entities/ship';
import { Control } from '../space/entities/ships/control';

export class Player {
  public name :string;
  public ship :Ship;

  public constructor(public id :number, public socket :SocketIO.Socket, public room :Room) {
    this.setupEvents();
  }

  public sendState(state :string) {
    this.socket.emit('step', state);
  }

  private setupEvents() {
    this.socket.on('join', (data :any) => {
      console.log('join '+this.id);
      this.onJoin(data);
    });
    this.socket.on('input', (data :any) => {
      // console.log('input '+this.id);
      this.onInput(data);
    });
    this.socket.on('disconnect', () => {
      console.log('disconnect '+this.id);
      this.onDisconnect();
    });
  }

  private onJoin(data :any) {
    this.name = data.name;

    // Restore ship functions
    this.ship = new Ship(data.ship.model);
    Object.assign(this.ship, data.ship);
    this.ship.control = new Control();

    this.room.addPlayerShip(this);
    this.socket.emit('accepted', this.ship.memId);
  }

  private onInput(data :any) {
    this.ship.control.setState(data);
  }

  private onDisconnect() {
    this.room.removePlayer(this);
  }
}
