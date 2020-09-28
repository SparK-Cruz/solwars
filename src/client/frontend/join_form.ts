const PIXI = require('pixi.js');
import { EventEmitter } from 'events';
import { ShipRenderer } from "../game_renderers/entities/ship_renderer";
import { Ship } from "../../space/entities/ship";
import { Model } from "../../space/entities/ships/model";

const previewContainer: any = new PIXI.Container();

let shipRenderer: ShipRenderer = null
let mainColor: HTMLInputElement = null;
let accentColor: HTMLInputElement = null;

let validColor: string = null;
let validDecal: string = null;

const minimumColor: number = 96;
const ships: string[] = [
    'warbird',
    'javelin',
    'spider',
    'leviathan',
    'terrier',
];

export class JoinForm extends EventEmitter {
    private currentShip: number = 0;

    public constructor() {
        super();

        const defaultName = 'Anon' + (100 + Math.round(Math.random() * 899));
        const form = <HTMLFormElement>document.getElementById('join-form');
        const nameField = <HTMLInputElement>document.getElementById('player-name');
        const nextShip = <HTMLInputElement>document.getElementById('next-ship-btn');
        const prevShip = <HTMLInputElement>document.getElementById('prev-ship-btn');
        const button = <HTMLInputElement>document.getElementById('join-btn');
        const preview = <HTMLCanvasElement>document.getElementById('ship-preview');
        mainColor = <HTMLInputElement>document.getElementById('main-color');
        accentColor = <HTMLInputElement>document.getElementById('accent-color');

        nameField.setAttribute('placeholder', defaultName);
        nameField.value = localStorage.getItem('name');

        this.currentShip = Math.min(ships.length - 1, Math.max(0, parseInt(localStorage.getItem('model') || '0')));
        mainColor.value = localStorage.getItem('color') || '';
        accentColor.value = localStorage.getItem('decal') || '';

        nameField.focus();
        nameField.select();

        const renderer = new PIXI.Application({
            backgroundColor: 0x000000,
            resolution: window.devicePixelRatio || 1,
            width: 64,
            height: 64,
            view: preview,
        });
        previewContainer.position.set(32);
        renderer.stage.addChild(previewContainer);
        renderer.ticker.add((delta: number) => {
            shipRenderer.ship.step(delta / 5);
            shipRenderer.render();
            previewContainer.angle = shipRenderer.ship.angle;
        });

        (<any>this).hide = () => {
            renderer.stop();
            button.blur();
            nameField.blur();
            (<HTMLFieldSetElement>form.firstElementChild).disabled = true;
        };

        (<any>this).show = () => {
            (<HTMLFieldSetElement>form.firstElementChild).disabled = false;
            nameField.focus();
            nameField.select();
            renderer.start();
        };

        form.addEventListener('submit', e => {
            e.preventDefault();

            const name = nameField.value || defaultName;
            const color = validColor;
            const decal = validDecal;

            localStorage.setItem('name', name == defaultName ? '' : name);
            localStorage.setItem('model', this.currentShip.toFixed(0));
            localStorage.setItem('color', validColor || '');
            localStorage.setItem('decal', validDecal || '');

            this.emit('join', {
                name,
                model: ships[this.currentShip],
                color,
                decal,
            });
        });

        nextShip.addEventListener('click', e => {
            e.preventDefault();

            this.currentShip = (this.currentShip + 1) % ships.length;
            this.updateShipModel();
        });

        prevShip.addEventListener('click', e => {
            e.preventDefault();

            this.currentShip = (this.currentShip - 1 + ships.length) % ships.length;
            this.updateShipModel();
        });

        mainColor.addEventListener('input', e => {
            this.updateShipModel();
        });

        accentColor.addEventListener('input', e => {
            this.updateShipModel();
        });

        this.updateShipModel();
        renderer.start();
    }

    private updateShipModel() {
        const shipInfo = <HTMLParagraphElement>document.getElementById('ship-info');
        const model = Model.byId[ships[this.currentShip]];
        validColor = null;
        validDecal = null;

        if (mainColor) {
            const value = this.filterColor(mainColor.value);

            if (value) {
                mainColor.value = value;
                validColor = '#' + value;
            }
        }

        if (accentColor) {
            const value = this.filterColor(accentColor.value);

            if (value) {
                accentColor.value = value;
                validDecal = '#' + value;
            }
        }

        shipInfo.innerHTML = `
            ${model.make} ${model.name}<br/>
            "${model.id}"
        `;

        previewContainer.removeChildren();

        let angle = 0;
        if (shipRenderer) {
            angle = shipRenderer.ship.angle;
        }

        const ship = new Ship(model);
        ship.control = 8;
        ship.angle = angle;
        if (validColor) ship.color = validColor;
        if (validDecal) ship.decals[0].color = validDecal;
        shipRenderer = new ShipRenderer(previewContainer, ship);
    }

    private filterColor(color: string): string {
        const hex = color.replace(/[^0-9a-fA-F]/g, '');
        if (hex.length !== 6) return;

        let r = parseInt(hex.substr(0, 2), 16);
        let g = parseInt(hex.substr(2, 2), 16);
        let b = parseInt(hex.substr(4, 2), 16);

        const total = (r + g + b) || 1;

        if (total < minimumColor) {
            const diff = minimumColor - total;
            r += Math.ceil((r || 0.33) / total * diff);
            g += Math.ceil((g || 0.33) / total * diff);
            b += Math.ceil((b || 0.33) / total * diff);
        }

        return this.padHex(r.toString(16)) + this.padHex(g.toString(16)) + this.padHex(b.toString(16));
    }

    private padHex(string: string) {
        if (string.length < 2)
            return '0' + string;
        return string;
    }
}
