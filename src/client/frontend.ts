import { Engine } from "./engine";

const game = <HTMLCanvasElement>document.getElementById('game');
const hud = <HTMLCanvasElement>document.getElementById('hud');
const engine = new Engine(game, hud);

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

window.addEventListener('keydown', e => {
    if (!engine.running
        || e.keyCode != 27
        || !confirm('Leave Game?'))
        return;

    e.preventDefault();

    engine.stop();
});
