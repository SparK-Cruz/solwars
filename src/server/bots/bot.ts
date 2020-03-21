import { EventEmitter } from 'events';
import { Player } from '../player';
import { Room } from '../room';
import { CodecEvents } from '../../space/codec_facade';
import { Ship } from '../../space/entities/ship';
import { Model } from '../../space/entities/ships/model';
import { Mapping } from '../../space/entities/ships/mapping';
import { Control } from '../../space/entities/ships/control';

const MIN_DISTANCE = 180;
const MAX_DISTANCE = 450;
const DISTANCE_BAND = 70;
const IDEAL_BULLET_SPEED = 7;
const ANGLE_TOLERANCE = 2;
const ENERGY_RESERVE = 0.65;

export class Bot extends Player {
    private target: Ship = null;

    private mapping: Mapping = new Mapping();
    private lastInput: number = 0;
    private respawnListener = () => { this.onRespawn(); };

    public constructor(name :string, room: Room) {
        super(<any>new FakeSocket(), room);
        this.socket.on(CodecEvents.RESPAWN, this.respawnListener);

        this.socket.emit(CodecEvents.JOIN_GAME, {name: name});
    }

    public setTarget(ship: Ship) {
        this.target = ship;
    }

    public step() {
        this.mapping.state = 0;

        if (!this.ship
            || !this.target) {
            this.updateControl(0);
            return;
        }

        const energy = 1 - (this.ship.damage / this.ship.health);
        const distance = Math.sqrt(Math.pow(this.target.x - this.ship.x, 2) + Math.pow(this.target.y - this.ship.y, 2));
        const angleDiff = this.calculateAngleDiff(distance);

        this.stepTurn(angleDiff);
        this.stepThrottle(energy, distance);
        this.stepShoot(energy, distance, angleDiff);

        this.updateControl(this.mapping.state);
    }

    public disconnect() {
        this.socket.disconnect();
        setTimeout(() => {
            this.socket.off(CodecEvents.RESPAWN, this.respawnListener);
        }, 0);
    }

    protected fetchPlayerShip(name: string, cache: Ship = null) {
        let onSuccess = (ship :Ship) => {};
        setTimeout(() => {
            const ship = new Ship(Model.Javelin);
            ship.decals[0].color = '#333333';
            ship.color = '#a2a2a2';
            onSuccess(ship);
        }, 0);

        const callbacks = {
            then: (callback :(ship :Ship) => void) => {
                onSuccess = callback;
                return callbacks;
            },
            error: (callback :(reason :string) => void) => {
                return callbacks;
            }
        };
        return callbacks;
    }

    private onRespawn() {
        this.socket.emit(CodecEvents.JOIN_GAME, {name: this.name});
    }

    private updateControl(number: number) {
        if (number == this.lastInput)
            return;

        this.lastInput = number;
        this.socket.emit(CodecEvents.SEND_INPUT, number);
    }

    private stepTurn(angleDiff: number) {
        if (angleDiff < -ANGLE_TOLERANCE)
            this.mapping.press(Mapping.LEFT)
        if (angleDiff > ANGLE_TOLERANCE)
            this.mapping.press(Mapping.RIGHT);
    }

    private stepThrottle(energy: number, distance: number) {
        const delta = MIN_DISTANCE + ((MAX_DISTANCE - MIN_DISTANCE) * (1 - energy));

        if (distance < delta - DISTANCE_BAND)
            this.mapping.press(Mapping.BACKWARD);
        if (distance > delta + DISTANCE_BAND)
            this.mapping.press(Mapping.FORWARD);
    }

    private stepShoot(energy: number, distance: number, angleDiff: number) {
        if (energy < ENERGY_RESERVE
            || distance > MAX_DISTANCE
            || Math.abs(angleDiff) > ANGLE_TOLERANCE)
            return;

        this.mapping.press(Mapping.SHOOT);
    }

    private calculateAngleDiff(distance: number): number {
        let heading = Math.atan2(this.ship.vy, this.ship.vx) / Math.PI * 180 + 90;
        if (heading < 0) heading += 360;

        const targetAcceleration = Control.thrusting(this.target.control) * this.target.power;

        const increase = {
            x: targetAcceleration * Math.sin(this.target.angle * Math.PI / 180),
            y: -targetAcceleration * Math.cos(this.target.angle * Math.PI / 180),
        };

        // X frames at IDEAL speed gets you between our MIN and MAX distances
        // project where target will be X frames from here and aim
        const frames = distance / IDEAL_BULLET_SPEED;

        const prediction = {
            x: this.target.x + (increase.x + this.target.vx - this.ship.vx * frames),
            y: this.target.y + (increase.y + this.target.vy - this.ship.vy * frames),
        };

        let direction = Math.atan2(prediction.y - this.ship.y, prediction.x - this.ship.x) * 180 / Math.PI + 90;
        if (direction < 0) direction += 360;

        let angleDiff = direction - this.ship.angle;
        if (angleDiff > 180) angleDiff -= 360;
        if (angleDiff < -180) angleDiff += 360;

        return angleDiff;
    }
}

class FakeSocket extends EventEmitter {
    public connected: boolean = true;

    public disconnect() {
        this.emit(CodecEvents.DISCONNECT);
        this.connected = false;
    }
}
