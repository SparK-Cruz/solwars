import { Room } from './room';
import { Ship } from '../space/entities/ship';
import { Model as ShipModel } from '../space/entities/ships/model';
import { CodecEvents } from '../space/codec_facade';
const EventEmitter = require('events');

export class Player extends EventEmitter {
  public name :string;
  public ship :Ship;

  public constructor(public id :number, public socket :SocketIO.Socket, public room :Room) {
    super();
    this.setupListeners();
  }

  public sendState(state :string) {
    this.socket.emit(CodecEvents.STEP, state);
  }

  public sendRemoval(id :number) {
    this.socket.emit(CodecEvents.REMOVE_OBJECT, id);
  }

  private setupListeners() {
    this.socket.on(CodecEvents.JOIN_GAME, (data :any) => {
      this.onJoin(data);

      this.socket.on(CodecEvents.SEND_INPUT, (data :any) => {
        this.onInput(data);
      });
      this.socket.on(CodecEvents.DISCONNECT, () => {
        this.emit('disconnect');
      });
    });
  }

  private onJoin(data :any) {
    this.name = data.name;
    this.fetchPlayerShip(data.name)
      .then(ship => {
        ship.name = this.name;
        console.log(this.name);
        this.ship = ship;
        this.emit('ship');
        this.socket.emit(CodecEvents.ACCEPT, {
          id: this.id,
          ship: this.room.codec.encodeEntity(this.ship)
        });
      })
      .error(reason => {
        console.error(reason);
      });
  }

  private fetchPlayerShip(name :string) {
    let onSuccess = (ship :Ship) => {};
    let onError = (reason :string) => {};

    // Will be async in the future, so let's emulate it!
    // Otherwise there's not enough time to set the callbacks
    // on the outer scope
    setTimeout(() => {
      // It's random for now
      const models = [ShipModel.Warbird, ShipModel.Javelin];
      const ship = new Ship(models[Math.round(Math.random())]);

      // Customize ship here
      // ship.decals[0].name = 'decal1';
      
      onSuccess(ship);
    }, 0);

    const callbacks = {
      then: (callback :(ship :Ship) => void) => {
        onSuccess = callback;
        return callbacks;
      },
      error: (callback :(reason :string) => void) => {
        onError = callback;
        return callbacks;
      }
    };
    return callbacks;
  }

  private onInput(data :any) {
    this.ship.control = data;
  }
}
