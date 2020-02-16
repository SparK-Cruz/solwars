import * as socketio from 'socket.io-client';

import { Stage } from '../space/stage';
import { CodecFacade, CodecEvents } from '../space/codec_facade';
import { Ship } from '../space/entities/ship';
import { Input } from './input';
import { EventEmitter } from 'events';
import { Model as ShipModel } from '../space/entities/ships/model';

export class Client extends EventEmitter {
    private remoteId: number = null;
    private stage: Stage = null;
    private codec: CodecFacade = null;
    private ship: Ship = null;

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
    };

    // TODO implement logger and debugger
    public constructor(private name: string, private input: Input) {
        super();

        this.stage = new Stage();
        this.codec = new CodecFacade(this.stage);
    }

    public connect() {
        const socket = socketio(':27001');
        this.bindEvents(socket);

        socket.emit(CodecEvents.JOIN_GAME, {name: this.name});
    }

    public getStage() {
        return this.stage;
    }

    private bindEvents(socket: SocketIOClient.Socket) {
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

        this.input.change((state: number) => {
            socket.emit(CodecEvents.SEND_INPUT, state);
        });
    }

    private onConnect(data: any) {
        this.remoteId = data.id;
        this.stage.add(data.ship);

        this.emit(ClientEvents.SHIP, data.ship);
        this.ship = data.ship;

        this.cacheStaticInfo(data);
    }

    private onServerUpdate(data: any) {
        this.codec.writeState(data);
        this.emit(ClientEvents.INFO, this.fetchInfo());
    }

    private onServerRemoveObject(data: any) {
        this.stage.remove(data);
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
        });
    }
}

export namespace ClientEvents {
    export const SHIP = 'ship';
    export const INFO = 'info';
}

interface StaticInfo {
    id: number,
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
}