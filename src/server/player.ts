import { Room } from './room.js';
import { Ship, ShipEvents } from '../space/entities/ship.js';
import { Model as ShipModel } from '../space/entities/ships/model.js';
import { CodecEvents, PlayerDeath, DeathCauses } from '../space/codec_facade.js';
import { EntityEvent, Entity, EntityType } from '../space/entities.js';
import { Bullet } from '../space/entities/bullet.js';
import { Config } from '../space/config.js';
import { Socket } from 'socket.io';
import { EventEmitter } from 'events';

export namespace PlayerEvents {
    export const Ship = 'ship';
    export const Disconnect = 'disconnect';
    export const Die = 'die';
    export const SyncEntity = 'syncEntity';
}

export class Player extends EventEmitter {
    public get isBot(): boolean {
        return false;
    }

    public name: string = "Nemo";
    public bounty: number = 1;
    public ship: Ship | null = null;
    public id: number | null = null;

    public constructor(public socket: Socket, public room: Room) {
        super();
        this.setupListeners();
    }

    public sendState(state: string) {
        this.socket.emit(CodecEvents.STEP, state);
    }

    public sendEntity(entityData: string) {
        this.socket.emit(CodecEvents.ENTITY, entityData);
    }

    public sendRemoval(id: number) {
        this.socket.emit(CodecEvents.REMOVE_OBJECT, id);
    }

    public sendCollision(id: number) {
        this.socket.emit(CodecEvents.COLLISION, id);
    }

    public sendDeath(death: PlayerDeath) {
        this.socket.emit(CodecEvents.DEATH, death);
    }

    public updateShipName() {
        this.ship!.name = this.name + ' (' + this.bounty + ')';
    }

    private setupListeners() {
        this.socket.on(CodecEvents.JOIN_GAME, (data: any) => {
            this.onJoin(data);
        });
        this.socket.on(CodecEvents.SEND_INPUT, (data: any) => {
            this.onInput(data);
        });
        this.socket.on(CodecEvents.SYNC_ENTITY, (data: any) => {
            // this.emit(PlayerEvents.SyncEntity, parseInt(data));
            this.socket.disconnect(true);
        });
        this.socket.on(CodecEvents.DISCONNECT, () => {
            this.emit(PlayerEvents.Disconnect);
        });
        this.socket.once('error', () => {
            this.socket.disconnect(true);
        });
    }

    private onJoin(data: any) {
        this.name = data.name;
        const upgradeListener = (name: string) => {
            this.bounty += 10;
            this.updateShipName();
            this.socket.emit(CodecEvents.UPGRADE, name);
        };
        this.fetchPlayerShip(data, this.ship!)
            .then(ship => {
                this.emit(PlayerEvents.Ship, ship);
                ship.on(ShipEvents.Upgrade, upgradeListener);
                ship.once(EntityEvent.Die, (killer: Entity) => {
                    ship.off(ShipEvents.Upgrade, upgradeListener);
                    this.onDie(killer)
                });
                this.socket.emit(CodecEvents.ACCEPT, {
                    id: this.id,
                    ship: this.room.codec.encodeEntity(ship, true),
                    tps: Config.TPS,
                });
            })
            .error(reason => {
                console.error(reason);
            });
    }

    protected fetchPlayerShip(data: any, cache: Ship) {
        let onSuccess = (ship: Ship) => { };
        let onError = (reason: string) => { };

        // Will be async in the future, so let's emulate it!
        // Otherwise there's not enough time to set the callbacks
        // on the outer scope
        setTimeout(() => {
            let model = ShipModel.byId[data.model] || ShipModel.Warbird;

            const models = ShipModel.all
                .filter(ship => !ship.disabled)
                .map(ship => ship.id);
            if (!models.includes(model.id)) {
                model = ShipModel.Warbird;
            }

            const ship = new Ship(model, Config);

            // Customize ship here
            const options: any = {};
            if (cache) {
                Object.assign(options, { color: cache.color, decal: cache.decals[0].color });
            }
            Object.assign(options, data);

            if (options.color)
                ship.color = options.color;
            if (options.decal)
                ship.decals[0].color = options.decal;
            if (options.decalIndex)
                ship.decals[0].name = `decal${options.decalIndex}`;

            (<any>ship).aiFaction = 'human';

            onSuccess(ship);
        }, 0);

        const callbacks = {
            then: (callback: (ship: Ship) => void) => {
                onSuccess = callback;
                return callbacks;
            },
            error: (callback: (reason: string) => void) => {
                onError = callback;
                return callbacks;
            }
        };
        return callbacks;
    }

    private onInput(data: any) {
        if (!this.ship) return;

        this.ship.control = data;
    }

    private onDie(killer: Entity) {
        const death: PlayerDeath = {
            name: this.name,
            ship: this.ship!.id,
            cause: DeathCauses.Collision,
            bounty: this.bounty,
            killer: this.room.codec.encodeEntity(killer, true),
            type: killer.type,
        };

        if (killer.type.name == EntityType.Bullet.name) {
            death.cause = DeathCauses.Bullet;
            death.killer = this.room.codec.encodeEntity((<Bullet>killer).parent, true);
        }

        setTimeout(() => {
            this.socket.emit(CodecEvents.RESPAWN);
        }, 5000);

        this.socket.emit(CodecEvents.DIE, death);
        this.emit(PlayerEvents.Die, death);
        this.ship!.emit(EntityEvent.Despawn, this.ship);
    }
}
