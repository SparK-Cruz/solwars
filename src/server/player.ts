import { Room } from './room';

export class Player {
  public name :string;

  public constructor(private socket :SocketIO.Socket, private room :Room) {
    this.setupEvents();
  }

  private setupEvents() {
    this.socket.on('join', this.onJoin);
    this.socket.on('input', this.onInput);
  }

  private onJoin(data :any) {

  }

  private onInput(data :any) {

  }
}
