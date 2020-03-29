import { Engine } from "../engine";

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

        nameField.setAttribute('placeholder', defaultName);
        nameField.value = localStorage.getItem('name');

        nameField.focus();
        nameField.select();

        engine.on('start', () => {
            button.blur();
            nameField.blur();
            (<HTMLFieldSetElement>form.firstElementChild).disabled = true;
        });

        engine.on('stop', () => {
            (<HTMLFieldSetElement>form.firstElementChild).disabled = false;
            nameField.focus();
            nameField.select();
        });

        form.addEventListener('submit', e => {
            e.preventDefault();

            const name = nameField.value || defaultName;
            localStorage.setItem('name', name == defaultName ? '' : name);

            engine.start({name, model: this.ships[this.currentShip]}, (data: any) => {
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

        this.updateShipModel();
    }

    private static updateShipModel() {
        [].forEach.call(document.querySelectorAll('#join-form .ship'), (e: any) => e.style.display = 'none');
        (<any>document.querySelector('#join-form .ship.' + this.ships[this.currentShip])).style.display = 'block';
    }
}
