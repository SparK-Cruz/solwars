import * as socketio from 'socket.io-client';

import { Stage } from './stage';
import { CodecFacade, CodecEvents } from '../space/codec_facade';
import { Ship } from '../space/entities/ship';
import { Input } from './input';
import { EventEmitter } from 'events';
import { Model as ShipModel } from '../space/entities/ships/model';
import { Config } from '../space/config';
import { EntityType } from '../space/entities';

export class Client extends EventEmitter {
    private remoteId: number = null;
    private name: string = null;
    private stage: Stage = null;
    private codec: CodecFacade = null;
    private ship: Ship = null;
    private ranking: {name: string, bounty: number}[] = [];

    private socket: SocketIOClient.Socket;
    private compensator: NodeJS.Timeout;

    private staticInfo: StaticInfo = {
        id: 0,
        ship: {
            id: null,
            make: null,
            model: null,
        },
        maxEnergy: 0,
        maxSpeed: 0,
        acceleration: 0,
        turnSpeed: 0,
        tickRate: 64,
    };

    // TODO implement logger and debugger
    public constructor(private input: Input) {
        super();

        this.stage = new Stage();
        this.codec = new CodecFacade();
    }

    public get connected() {
        return this.socket && this.socket.connected;
    }

    public connect(name: string) {
        this.name = name;

        if (!this.socket) {
            let address = '';
            if (!(<any>process).browser) {
                address = 'http://127.0.0.1:'+(process.env.PORT || Config.serverPort);
            }
            this.socket = socketio(address, {autoConnect: false});

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

    public getStage() {
        return this.stage;
    }

    private startCompensatingLag() {
        if (this.compensator)
            return;

        this.compensator = setInterval(() => {
            this.stage.step();
        }, 1000/64);
    }

    private stopCompensatingLag() {
        if (!this.compensator)
            return;

        clearInterval(this.compensator);
        this.compensator = null;
    }

    private bindEvents(socket: SocketIOClient.Socket) {
        socket.on(CodecEvents.CONNECT, () => {
            this.socket.emit(CodecEvents.JOIN_GAME, {name: this.name});
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

        socket.on(CodecEvents.DEATH, () => {
            this.onDeath();
        });

        this.input.change((state: number) => {
            socket.emit(CodecEvents.SEND_INPUT, state);
            if (this.ship)
                this.ship.control = state;
        });
    }

    private onConnect(data: any) {

        this.remoteId = data.id;
        this.ship = <Ship>this.codec.decodeEntity(data.ship);
        this.stage.clear();
        this.stage.add(this.ship);

        this.emit(ClientEvents.SHIP, this.ship);
        this.cacheStaticInfo(data);
    }

    private onServerUpdate(data: any) {
        const decoded = this.codec.decode(data);

        this.stage.addAll(decoded.entities.map(e => this.codec.decodeEntity(e)));
        this.ranking = decoded.ranking;

        this.emit(ClientEvents.INFO, this.fetchInfo());
    }

    private onServerRemoveObject(data: any) {
        this.stage.remove(data);
    }

    private onDeath() {
        // Get a new ship
        this.socket.emit(CodecEvents.JOIN_GAME, {name: this.name});
    }

    private cacheStaticInfo(data: any) {
        const model = ShipModel.byId[data.ship.model];
        this.staticInfo.id = parseInt(data.ship.id);
        this.staticInfo.ship.id = model.id;
        this.staticInfo.ship.make = model.make;
        this.staticInfo.ship.model = model.name;
        this.staticInfo.acceleration = data.ship.power;
        this.staticInfo.turnSpeed = data.ship.turnSpeed;
        this.staticInfo.maxEnergy = data.ship.health;
        this.staticInfo.maxSpeed = data.ship.vmax;
        this.staticInfo.tickRate = data.tps;
    }

    private fetchInfo(): ClientInfo {
        return Object.assign({}, this.staticInfo, {
            angle: this.ship.angle,
            energy: this.ship.health - this.ship.damage,
            alive: this.ship.alive,
            cooldown: this.ship.gunsCooldown,
            gunHeat: this.ship.shootHeat,
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
        });
    }
}

export namespace ClientEvents {
    export const SHIP = 'ship';
    export const INFO = 'info';
}

interface StaticInfo {
    id: number,
    tickRate: number,
    ship: {
        id: string,
        make: string,
        model: string,
    },
    maxEnergy: number,
    maxSpeed: number,
    acceleration: number,
    turnSpeed: number,
}

export interface ClientInfo extends StaticInfo {
    angle: number;
    energy: number;
    cooldown: number;
    gunHeat: number;
    alive: boolean;
    speed: { x: number, y: number };
    position: { x: number, y: number };
    control: number;
    ranking: {name: string, bounty: number}[];
}
