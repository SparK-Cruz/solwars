import { Room } from './room';
import { Ship } from '../space/entities/ship';
import { Model as ShipModel } from '../space/entities/ships/model';
import { CodecEvents } from '../space/codec_facade';
import { EntityEvent, Entity, EntityType } from '../space/entities';
import { Bullet } from '../space/entities/bullet';
import { Config } from '../space/config';
const EventEmitter = require('events');

export module PlayerEvents {
    export const Ship = 'ship';
    export const Disconnect = 'disconnect';
    export const Die = 'die';
}

export module DeathCauses {
    export const Collision = 'collision';
    export const Bullet = 'bullet';
}

export interface PlayerDeath {
    cause: string,
    bounty: number,
    killer: Entity,
    type: EntityType,
}

export class Player extends EventEmitter {
    public name: string = "Nemo";
    public bounty: number = 1;
    public ship: Ship = null;

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
                this.emit(PlayerEvents.Disconnect);
            });
            this.socket.on('error', () => {
                this.emit(PlayerEvents.Disconnect);
            });
        });
    }

    private onJoin(data :any) {
        this.name = data.name;
        this.fetchPlayerShip(data.name, this.ship)
            .then(ship => {
                this.emit(PlayerEvents.Ship, ship);
                ship.on(EntityEvent.Die, (killer: Entity) => this.onDie(killer))
                this.socket.emit(CodecEvents.ACCEPT, {
                    id: this.id,
                    ship: this.room.codec.encodeEntity(ship),
                    tps: Config.TPS,
                });
            })
            .error(reason => {
                console.error(reason);
            });
    }

    private fetchPlayerShip(name :string, cache: Ship = null) {
        let onSuccess = (ship :Ship) => {};
        let onError = (reason :string) => {};

        // Will be async in the future, so let's emulate it!
        // Otherwise there's not enough time to set the callbacks
        // on the outer scope
        setTimeout(() => {
            // It's random for now
            // const models = [ShipModel.Warbird, ShipModel.Javelin];
            // const ship = new Ship(models[Math.round(Math.random())]);
            const ship = new Ship(ShipModel.Javelin);

            // Customize ship here
            const decal = this.randomShades(167);

            ship.decals[0].color = decal.color;
            ship.color = decal.shade;

            if (cache) {
                ship.decals[0].color = cache.decals[0].color;
                ship.color = cache.color
            }

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

    private onDie(killer: Entity) {
        const death = {
            cause: DeathCauses.Collision,
            bounty: this.bounty,
            killer: killer,
            type: killer.type,
        };

        if (killer.type.name == EntityType.Bullet.name) {
            death.cause = DeathCauses.Bullet;
            death.killer = (<Bullet>killer).parent;
        }

        setTimeout(() => {
                this.socket.emit(CodecEvents.DEATH);
                this.ship.emit(EntityEvent.Despawn, this.ship);
        }, 5000);

        this.emit(PlayerEvents.Die, death);
    }

    private randomShades(brightness: number) {
        const maxColor = brightness * 3;
        const darken = 0.58;

        const r = Math.floor(Math.random() * 255);
        const g = Math.floor(Math.random() * Math.min(255, maxColor - r));
        const b = maxColor - r - g;

        return {
            color: `rgb(${r}, ${g}, ${b})`,
            shade: `rgb(${r * darken}, ${g * darken}, ${b * darken})`,
        };
    }
}
