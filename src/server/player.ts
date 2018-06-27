import { Room } from './room';
import { Ship } from '../space/entities/ship';
import { Model as ShipModel } from '../space/entities/ships/model';
import { CodecFacade } from '../space/codec_facade';

export class Player {
  public name :string;
  public ship :Ship;

  public constructor(public id :number, public socket :SocketIO.Socket, public room :Room) {
    this.setupEvents();
  }

  public sendState(state :string) {
    this.socket.emit('step', state);
  }

  public sendRemoval(id :number) {
    this.socket.emit('removal', id);
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
    this.fetchPlayerShip(data.name)
      .then(ship => {
        this.ship = ship;
        this.room.addPlayerShip(this);
        this.socket.emit('accepted', {
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
      const ship = new Ship([ShipModel.Warbird, ShipModel.Javelin][Math.round(Math.random())]);
      ship.color = 'rgb('
        + Math.round(Math.random()*255)+','
        + Math.round(Math.random()*255)+','
        + Math.round(Math.random()*255)+')';

      ship.decals[0].name = 'decal' + Math.round(Math.random());
      ship.decals[0].color = 'rgb('
        + Math.round(Math.random()*255)+','
        + Math.round(Math.random()*255)+','
        + Math.round(Math.random()*255)+')';

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

  private onDisconnect() {
    this.room.removePlayer(this);
  }
}
