import * as socketio from 'socket.io-client';

import { Stage } from './stage';
import { CodecFacade, CodecEvents, PlayerDeath } from '../space/codec_facade';
import { Ship, ShipEvents } from '../space/entities/ship';
import { EventEmitter } from 'events';
import { Model as ShipModel } from '../space/entities/ships/model';
import { EntityEvent } from '../space/entities';
import { Inputable } from './input';

export interface ClientOptions {
    name: string,
    model: string,
    color?: string,
    decal?: string,
}

const UPDATE_LOG_LENGTH = 100;

export class Client extends EventEmitter {
    private remoteId: number = null;
    private options: ClientOptions = null;
    private stage: Stage = null;
    private codec: CodecFacade = null;
    private ship: Ship = null;
    private ranking: { name: string, bounty: number }[] = [];

    private socket: SocketIOClient.Socket;
    private compensator: NodeJS.Timeout;

    private lastUpdateTime: number = Date.now();
    private updateTimes: number[] = [];

    private staticInfo: StaticInfo = {
        id: 0,
        ship: {
            id: null,
            make: null,
            model: null,
        },
        turnSpeed: 0,
        tickRate: 64
    };

    // TODO implement logger and debugger
    public constructor(private input: Inputable) {
        super();

        this.stage = new Stage();
        this.codec = new CodecFacade();
    }

    public get connected() {
        return !!this.remoteId;
    }

    public connect(options: ClientOptions) {
        this.options = options;

        if (!this.socket) {
            this.socket = socketio('', { autoConnect: false });

            this.bindEvents(this.socket);
        }

        this.startCompensatingLag();
        this.socket.open();
    }

    public disconnect() {
        this.remoteId = null;
        this.stopCompensatingLag();
        this.stage.clear();
        this.socket.disconnect();
    }

    public syncEntity(id: number) {
        this.socket.emit(CodecEvents.SYNC_ENTITY, id);
    }

    public getStage() {
        return this.stage;
    }

    public fetchInfo(): ClientInfo {
        return Object.assign({}, this.staticInfo, {
            angle: this.ship.angle,
            maxEnergy: this.ship.health,
            maxSpeed: this.ship.vmax,
            acceleration: this.ship.power,
            energy: this.ship.health - this.ship.damage,
            alive: this.ship.alive,
            speed: {
                x: this.ship.vx,
                y: this.ship.vy,
            },
            position: {
                x: this.ship.x,
                y: this.ship.y,
            },
            control: this.ship.control,
            ranking: this.ranking,
            updates: this.updateTimes,
        });
    }

    private startCompensatingLag() {
        if (this.compensator)
            return;

        this.compensator = setInterval(() => {
            this.stage.step();
        }, 1000 / 32);
    }

    private stopCompensatingLag() {
        if (!this.compensator)
            return;

        clearInterval(this.compensator);
        this.compensator = null;
    }

    private bindEvents(socket: SocketIOClient.Socket) {
        socket.on(CodecEvents.CONNECT, () => {
            this.socket.emit(CodecEvents.JOIN_GAME, this.options);
        });

        socket.on(CodecEvents.DISCONNECT, () => {
            this.remoteId = null;
        });

        socket.on(CodecEvents.ACCEPT, (data: any) => {
            this.onConnect(data);
        });

        socket.on(CodecEvents.STEP, (data: any) => {
            if (!this.remoteId)
                return;

            this.onServerUpdate(data);
        });

        socket.on(CodecEvents.REMOVE_OBJECT, (data: any) => {
            this.onServerRemoveObject(data);
        });

        socket.on(CodecEvents.COLLISION, (data: any) => {
            this.onCollision(data);
        });

        socket.on(CodecEvents.DIE, (death: any) => {
            this.onDie(death);
        });

        socket.on(CodecEvents.DEATH, (death: any) => {
            this.onDeath(death);
        });

        socket.on(CodecEvents.RESPAWN, () => {
            this.onRespawn();
        });

        socket.on(CodecEvents.UPGRADE, (name: string) => {
            this.emit(ClientEvents.UPGRADE, name);
            this.ship.emit(ShipEvents.Upgrade);
        });

        socket.on(CodecEvents.ENTITY, (entity: any) => {
            console.log('triggered');
            this.stage.add(this.codec.decodeEntity(JSON.parse(entity)));
        });

        this.input.change((state: number) => {
            socket.emit(CodecEvents.SEND_INPUT, state);
        });
    }

    private onConnect(data: any) {
        this.remoteId = data.id;
        this.ship = <Ship>this.codec.decodeEntity(data.ship);
        this.stage.clear();
        this.stage.add(this.ship, false);

        this.emit(ClientEvents.SHIP, this.ship);
        this.cacheStaticInfo(data);
    }

    private onServerUpdate(data: any) {
        const now = Date.now();
        const diff = now - this.lastUpdateTime;
        if (diff > 0) {
            this.updateTimes.push(1000 / diff);
            this.lastUpdateTime = now;
        }

        while (this.updateTimes.length > UPDATE_LOG_LENGTH) {
            this.updateTimes.shift();
        }

        const decoded = this.codec.decode(data);

        this.stage.addAll([].concat(...decoded.entities).map((e: any) => e.newSector ? this.codec.decodeEntity(e) : e).filter(e => e));
        this.ranking = decoded.ranking;
    }

    private onServerRemoveObject(data: any) {
        this.stage.remove(data);
    }

    private onCollision(data: any) {
        if (this.stage.entities[parseInt(data)] && this.stage.entities[parseInt(data)].emit) {
            this.stage.entities[parseInt(data)].emit(EntityEvent.Collide);
        }
    }

    private onDie(death: PlayerDeath) {
        console.log(`You died to ${(<any>death.killer).name} by ${death.cause} for ${death.bounty} points`);
        this.ship.alive = false;
        this.ship.emit(EntityEvent.Die);
    }

    private onDeath(death: PlayerDeath) {
        if (death.ship == this.ship.id)
            return;

        console.log(`${death.name} died to ${(<any>death.killer).name} by ${death.cause} for ${death.bounty} points`);

        const ship = this.stage.entities[death.ship];
        if (!ship || !ship.emit) return;
        ship.emit(EntityEvent.Die);
    }

    private onRespawn() {
        // Get a new ship
        this.socket.emit(CodecEvents.JOIN_GAME, this.options);
    }

    private cacheStaticInfo(data: any) {
        const model = ShipModel.byId[data.ship.model];
        this.staticInfo.id = parseInt(data.ship.id);
        this.staticInfo.ship.id = model.id;
        this.staticInfo.ship.make = model.make;
        this.staticInfo.ship.model = model.name;
        this.staticInfo.turnSpeed = data.ship.turnSpeed;
        this.staticInfo.tickRate = data.tps;
    }
}

export namespace ClientEvents {
    export const SHIP = 'ship';
    export const INFO = 'info';
    export const UPGRADE = 'upgrade';
}

interface StaticInfo {
    id: number,
    tickRate: number,
    ship: {
        id: string,
        make: string,
        model: string,
    },
    turnSpeed: number
}

export interface ClientInfo extends StaticInfo {
    angle: number;
    maxEnergy: number;
    maxSpeed: number;
    acceleration: number;
    energy: number;
    alive: boolean;
    speed: { x: number, y: number };
    position: { x: number, y: number };
    control: number;
    ranking: { name: string, bounty: number }[];
    updates: number[];
}
