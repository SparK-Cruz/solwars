import { Engine } from "../engine";

export class JoinForm {
    public static bind(engine: Engine) {
        const defaultName = 'Anon' + (100 + Math.round(Math.random() * 899));
        const form = <HTMLFormElement>document.getElementById('join-form');
        const nameField = <HTMLInputElement>document.getElementById('player-name');
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

            engine.start(name, (data: any) => {
                if (data.error)
                    alert(data.error);
            });
        });
    }
}
