import { Engine } from "../engine";
import { ShipRenderer } from "../game_renderers/entities/ship_renderer";
import { Ship } from "../../space/entities/ship";
import { Model } from "../../space/entities/ships/model";

let shipRenderer = new ShipRenderer(new Ship(Model.Warbird));
let mainColor: HTMLInputElement = null;
let accentColor: HTMLInputElement = null;

let validColor: string = null;
let validDecal: string = null;

const minimumColor: number = 96;

let previewInterval: any = null;

export class JoinForm {
    private static ships: string[] = [
        'warbird',
        'javelin',
        'spider',
    ];
    private static currentShip: number = 0;

    public static bind(engine: Engine) {
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

        this.currentShip = Math.min(this.ships.length -1, Math.max(0, parseInt(localStorage.getItem('model') || '0')));
        mainColor.value = localStorage.getItem('color') || '';
        accentColor.value = localStorage.getItem('decal') || '';

        nameField.focus();
        nameField.select();

        engine.on('start', () => {
            button.blur();
            nameField.blur();
            (<HTMLFieldSetElement>form.firstElementChild).disabled = true;
            clearInterval(previewInterval);
        });

        engine.on('stop', () => {
            (<HTMLFieldSetElement>form.firstElementChild).disabled = false;
            nameField.focus();
            nameField.select();
            this.previewLoop(preview.getContext('2d'));
        });

        form.addEventListener('submit', e => {
            e.preventDefault();

            const name = nameField.value || defaultName;
            const color = validColor;
            const decal = validDecal;

            localStorage.setItem('name', name == defaultName ? '' : name);
            localStorage.setItem('model', this.currentShip.toFixed(0));
            localStorage.setItem('color', validColor || '');
            localStorage.setItem('decal', validDecal || '');

            engine.start({
                name,
                model: this.ships[this.currentShip],
                color,
                decal,
            }, (data: any) => {
                if (data.error)
                    alert(data.error);
            });
        });

        nextShip.addEventListener('click', e => {
            e.preventDefault();

            this.currentShip = (this.currentShip + 1) % this.ships.length;
            this.updateShipModel();
        });

        prevShip.addEventListener('click', e => {
            e.preventDefault();

            this.currentShip = (this.currentShip - 1 + this.ships.length) % this.ships.length;
            this.updateShipModel();
        });

        mainColor.addEventListener('input', e => {
            this.updateShipModel();
        });

        accentColor.addEventListener('input', e => {
            this.updateShipModel();
        });

        this.updateShipModel();
        this.previewLoop(preview.getContext('2d'));
    }

    private static previewLoop(ctx: CanvasRenderingContext2D) {
        previewInterval = setInterval(() => {
            shipRenderer.ship.step(1);
            ctx.clearRect(0, 0, 64, 64);
            ctx.save();
            ctx.translate(32, 32);
            ctx.rotate(shipRenderer.ship.angle * Math.PI / 180);
            ctx.drawImage(shipRenderer.render(), -16, -16);
            ctx.restore();
        }, 1000/32);
    }

    private static updateShipModel() {
        const shipInfo = <HTMLParagraphElement>document.getElementById('ship-info');
        const model = Model.byId[this.ships[this.currentShip]];
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
            ${model.make} ${model.name}
        `;

        const angle = shipRenderer.ship.angle;
        const ship = new Ship(model);
        ship.control = 8;
        ship.angle = angle;
        if (validColor) ship.color = validColor;
        if (validDecal) ship.decals[0].color = validDecal;
        shipRenderer = new ShipRenderer(ship);
    }

    private static filterColor(color: string): string {
        const hex = color.replace(/[^0-9a-fA-F]/g, '');
        if (hex.length !== 6) return;

        let r = parseInt(hex.substr(0, 2), 16);
        let g = parseInt(hex.substr(2, 2), 16);
        let b = parseInt(hex.substr(4, 2), 16);

        const total = (r + g + b) || 1;

        if (total < minimumColor) {
            const diff = minimumColor - total;
            r += Math.ceil((r || 0.33)/total * diff);
            g += Math.ceil((g || 0.33)/total * diff);
            b += Math.ceil((b || 0.33)/total * diff);
        }

        return this.padHex(r.toString(16)) + this.padHex(g.toString(16)) + this.padHex(b.toString(16));
    }

    private static padHex(string: string) {
        if (string.length < 2)
            return '0' + string;
        return string;
    }
}
